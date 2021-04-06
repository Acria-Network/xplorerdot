#  Polkascan PRE Explorer API
#
#  Copyright 2018-2020 openAware BV (NL).
#  This file is part of Polkascan.
#
#  Polkascan is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  Polkascan is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with Polkascan. If not, see <http://www.gnu.org/licenses/>.
#
#  base.py
from abc import ABC, abstractmethod

import falcon
from dogpile.cache import CacheRegion
from dogpile.cache.api import NO_VALUE
from sqlalchemy.orm import Session

from app.models.base import BaseModel
from app.settings import MAX_RESOURCE_PAGE_SIZE, DOGPILE_CACHE_SETTINGS


class BaseResource(object):

    session: Session
    cache_region: CacheRegion


class JSONAPIResource(BaseResource):

    cache_expiration_time = None

    def apply_filters(self, query, params):
        return query

    def get_meta(self):
        return {}

    def serialize_item(self, item):
        return item.serialize()

    def process_get_response(self, req, resp, **kwargs):
        return {
            'status': falcon.HTTP_200,
            'media': self.get_jsonapi_response(data=None),
            'cacheable': False
        }

    def get_jsonapi_response(self, data, meta=None, errors=None, links=None, relationships=None, included=None):

        result = {
            'meta': {
                "authors": [
                    "WEB3SCAN",
                    "POLKASCAN",
                    "openAware BV"
                ]
            },
            'errors': [],
            "data": data,
            "links": {}
        }

        if meta:
            result['meta'].update(meta)

        if errors:
            result['errors'] = errors

        if links:
            result['links'] = links

        if included:
            result['included'] = included

        if relationships:
            result['data']['relationships'] = {}

            if 'included' not in result:
                result['included'] = []

            for key, objects in relationships.items():
                result['data']['relationships'][key] = {'data': [{'type': obj.serialize_type, 'id': obj.serialize_id()} for obj in objects]}
                result['included'] += [obj.serialize() for obj in objects]

        return result

    def on_get(self, req, resp, **kwargs):

        cache_key = '{}-{}'.format(req.method, req.url)

        if self.cache_expiration_time:
            # Try to retrieve request from cache
            cache_response = self.cache_region.get(cache_key, self.cache_expiration_time)

            if cache_response is not NO_VALUE:
                resp.set_header('X-Cache', 'HIT')

            else:
                # Process request
                cache_response = self.process_get_response(req, resp, **kwargs)

                if cache_response.get('cacheable'):
                    # Store result in cache
                    self.cache_region.set(cache_key, cache_response)
                    resp.set_header('X-Cache', 'MISS')
        else:
            cache_response = self.process_get_response(req, resp, **kwargs)

        resp.status = cache_response.get('status')
        resp.media = cache_response.get('media')


class JSONAPIListResource(JSONAPIResource, ABC):

    cache_expiration_time = DOGPILE_CACHE_SETTINGS['default_list_cache_expiration_time']

    def get_included_items(self, items):
        return []

    @abstractmethod
    def get_query(self):
        raise NotImplementedError()

    def apply_paging(self, query, params):
        page = int(params.get('page[number]', 1)) - 1
        page_size = min(int(params.get('page[size]', 25)), MAX_RESOURCE_PAGE_SIZE)
        return query[page * page_size: page * page_size + page_size]

    def process_get_response(self, req, resp, **kwargs):
        items = self.get_query()
        items = self.apply_filters(items, req.params)
        items = self.apply_paging(items, req.params)

        return {
            'status': falcon.HTTP_200,
            'media': self.get_jsonapi_response(
                data=[self.serialize_item(item) for item in items],
                meta=self.get_meta(),
                included=self.get_included_items(items)
            ),
            'cacheable': True
        }


class JSONAPIDetailResource(JSONAPIResource, ABC):

    cache_expiration_time = DOGPILE_CACHE_SETTINGS['default_detail_cache_expiration_time']

    def get_item_url_name(self):
        return 'item_id'

    @abstractmethod
    def get_item(self, item_id):
        raise NotImplementedError()

    def get_relationships(self, include_list, item):
        return {}

    def process_get_response(self, req, resp, **kwargs):
        item = self.get_item(kwargs.get(self.get_item_url_name()))

        if not item:
            response = {
                'status': falcon.HTTP_404,
                'media': None,
                'cacheable': False
            }

        else:

            response = {
                'status': falcon.HTTP_200,
                'media': self.get_jsonapi_response(
                    data=self.serialize_item(item),
                    relationships=self.get_relationships(req.params.get('include', []), item),
                    meta=self.get_meta()
                ),
                'cacheable': True
            }

        return response
