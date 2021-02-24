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
import decimal
from datetime import datetime

import pytz
from dictalchemy import DictableModel
from sqlalchemy.ext.declarative import declarative_base
from substrateinterface.utils.ss58 import ss58_encode

from app.settings import SUBSTRATE_ADDRESS_TYPE


class BaseModelObj(DictableModel):

    serialize_exclude = None

    def save(self, session):
        session.add(self)
        session.flush()

    @property
    def serialize_type(self):
        return self.__class__.__name__.lower()

    def serialize_id(self):
        return self.id

    def serialize_formatting_hook(self, obj_dict):
        """ Hook to be able to process data before being serialized """
        return obj_dict

    def serialize(self, exclude=None):
        """ Serializes current model to a dict representation
        :param exclude: list of property names to exclude in serialization
        :returns: dict respresentation of current model
        """

        obj_dict = {
            'type': self.serialize_type,
            'id': self.serialize_id(),
            'attributes': self.asdict(exclude=exclude or self.serialize_exclude)
        }

        obj_dict = self.serialize_formatting_hook(obj_dict)

        # Reformat certain data type
        for key, value in obj_dict['attributes'].items():
            if type(value) is datetime:
                obj_dict['attributes'][key] = value.replace(tzinfo=pytz.UTC).isoformat()

            if isinstance(value, decimal.Decimal):
                obj_dict['attributes'][key] = float(value)

        return obj_dict

    @classmethod
    def query(cls, session):
        return session.query(cls)

    def format_address(self, item):
        item['orig_value'] = item['value'].replace('0x', '')
        item['value'] = ss58_encode(item['value'].replace('0x', ''), SUBSTRATE_ADDRESS_TYPE)
        return item


BaseModel = declarative_base(cls=BaseModelObj)  ## type: BaseModelObj

