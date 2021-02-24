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
#  polkascan.py
import binascii

import falcon
import pytz
from dogpile.cache.api import NO_VALUE
from scalecodec.type_registry import load_type_registry_preset
from sqlalchemy import func, tuple_, or_
from sqlalchemy.orm import defer, subqueryload, lazyload, lazyload_all

from app import settings
from app.models.data import Block, Extrinsic, Event, RuntimeCall, RuntimeEvent, Runtime, RuntimeModule, \
    RuntimeCallParam, RuntimeEventAttribute, RuntimeType, RuntimeStorage, Account, Session, Contract, \
    BlockTotal, SessionValidator, Log, AccountIndex, RuntimeConstant, SessionNominator, \
    RuntimeErrorMessage, SearchIndex, AccountInfoSnapshot
from app.resources.base import JSONAPIResource, JSONAPIListResource, JSONAPIDetailResource, BaseResource
from app.settings import SUBSTRATE_RPC_URL, SUBSTRATE_METADATA_VERSION, SUBSTRATE_ADDRESS_TYPE, TYPE_REGISTRY, \
    SEARCH_INDEX_BALANCETRANSFER, SUBSTRATE_STORAGE_BALANCE
from app.utils.ss58 import ss58_decode, ss58_encode
from scalecodec.base import RuntimeConfiguration
from substrateinterface import SubstrateInterface


class BlockDetailsResource(JSONAPIDetailResource):

    def get_item_url_name(self):
        return 'block_id'

    def get_item(self, item_id):
        if item_id.isnumeric():
            return Block.query(self.session).filter_by(id=item_id).first()
        else:
            return Block.query(self.session).filter_by(hash=item_id).first()

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'extrinsics' in include_list:
            relationships['extrinsics'] = Extrinsic.query(self.session).filter_by(block_id=item.id).order_by(
                'extrinsic_idx')
        if 'transactions' in include_list:
            relationships['transactions'] = Extrinsic.query(self.session).options(defer('params')).filter_by(block_id=item.id, signed=1).order_by(
                'extrinsic_idx')
        if 'inherents' in include_list:
            relationships['inherents'] = Extrinsic.query(self.session).options(defer('params')).filter_by(block_id=item.id, signed=0).order_by(
                'extrinsic_idx')
        if 'events' in include_list:
            relationships['events'] = Event.query(self.session).filter_by(block_id=item.id).order_by(
                'event_idx')
        if 'logs' in include_list:
            relationships['logs'] = Log.query(self.session).filter_by(block_id=item.id).order_by(
                'log_idx')

        return relationships


class BlockListResource(JSONAPIListResource):

    def get_query(self):
        return Block.query(self.session).order_by(
            Block.id.desc()
        )


class BlockTotalDetailsResource(JSONAPIDetailResource):

    def get_item(self, item_id):
        if item_id.isnumeric():
            return BlockTotal.query(self.session).get(item_id)
        else:
            block = Block.query(self.session).filter_by(hash=item_id).first()
            if block:
                return BlockTotal.query(self.session).get(block.id)

    def serialize_item(self, item):
        # Exclude large params from list view
        data = item.serialize()

        # Include author account
        if item.author_account:
            data['attributes']['author_account'] = item.author_account.serialize()
        return data

    def serialize_item(self, item):
        # Exclude large params from list view
        data = item.serialize()

        # Include author account
        if item.author_account:
            data['attributes']['author_account'] = item.author_account.serialize()
        return data


class BlockTotalListResource(JSONAPIListResource):

    def get_query(self):
        return BlockTotal.query(self.session).order_by(
            BlockTotal.id.desc()
        )

    def apply_filters(self, query, params):

        if params.get('filter[author]'):

            if len(params.get('filter[author]')) == 64:
                account_id = params.get('filter[author]')
            else:
                try:
                    account_id = ss58_decode(params.get('filter[author]'), SUBSTRATE_ADDRESS_TYPE)
                except ValueError:
                    return query.filter(False)

            query = query.filter_by(author=account_id)

        return query


class ExtrinsicListResource(JSONAPIListResource):

    exclude_params = True

    def get_query(self):
        return Extrinsic.query(self.session).options(defer('params')).order_by(
            Extrinsic.block_id.desc()
        )

    def serialize_item(self, item):
        # Exclude large params from list view

        if self.exclude_params:
            data = item.serialize(exclude=['params'])
        else:
            data = item.serialize()

        # Add account as relationship
        if item.account:
            # data['relationships'] = {'account': {"type": "account", "id": item.account.id}}
            data['attributes']['account'] = item.account.serialize()
        return data

    # def get_included_items(self, items):
    #     # Include account items
    #     return [item.account.serialize() for item in items if item.account]

    def apply_filters(self, query, params):

        if params.get('filter[address]'):

            if len(params.get('filter[address]')) == 64:
                account_id = params.get('filter[address]')
            else:
                try:
                    account_id = ss58_decode(params.get('filter[address]'), SUBSTRATE_ADDRESS_TYPE)
                except ValueError:
                    return query.filter(False)
        else:
            account_id = None

        if params.get('filter[search_index]'):

            self.exclude_params = False

            if type(params.get('filter[search_index]')) != list:
                params['filter[search_index]'] = [params.get('filter[search_index]')]

            search_index = SearchIndex.query(self.session).filter(
                SearchIndex.index_type_id.in_(params.get('filter[search_index]')),
                SearchIndex.account_id == account_id
            ).order_by(SearchIndex.sorting_value.desc())

            query = query.filter(tuple_(Extrinsic.block_id, Extrinsic.extrinsic_idx).in_(
                [[s.block_id, s.extrinsic_idx] for s in search_index]
            ))
        else:

            self.exclude_params = True

            if params.get('filter[signed]'):

                query = query.filter_by(signed=params.get('filter[signed]'))

            if params.get('filter[module_id]'):

                query = query.filter_by(module_id=params.get('filter[module_id]'))

            if params.get('filter[call_id]'):

                query = query.filter_by(call_id=params.get('filter[call_id]'))

            if params.get('filter[address]'):

                query = query.filter_by(address=account_id)

        return query


class ExtrinsicDetailResource(JSONAPIDetailResource):

    def get_item_url_name(self):
        return 'extrinsic_id'

    def get_item(self, item_id):

        if item_id[0:2] == '0x':
            extrinsic = Extrinsic.query(self.session).filter_by(extrinsic_hash=item_id[2:]).first()
        else:

            if len(item_id.split('-')) != 2:
                return None

            extrinsic = Extrinsic.query(self.session).get(item_id.split('-'))

        return extrinsic

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'events' in include_list:
            relationships['events'] = Event.query(self.session).filter_by(
                block_id=item.block_id,
                extrinsic_idx=item.extrinsic_idx
            ).order_by('event_idx')

        return relationships

    def serialize_item(self, item):
        data = item.serialize()

        runtime_call = RuntimeCall.query(self.session).filter_by(
            module_id=item.module_id,
            call_id=item.call_id,
            spec_version=item.spec_version_id
        ).first()

        data['attributes']['documentation'] = runtime_call.documentation

        block = Block.query(self.session).get(item.block_id)

        data['attributes']['datetime'] = block.datetime.replace(tzinfo=pytz.UTC).isoformat()

        if item.account:
            data['attributes']['account'] = item.account.serialize()

        if item.error:
            # Retrieve ExtrinsicFailed event
            extrinsic_failed_event = Event.query(self.session).filter_by(
                block_id=item.block_id,
                event_id='ExtrinsicFailed'
            ).first()

            # Retrieve runtime error
            if extrinsic_failed_event:
                if 'Module' in extrinsic_failed_event.attributes[0]['value']:

                    error = RuntimeErrorMessage.query(self.session).filter_by(
                        module_id=item.module_id,
                        index=extrinsic_failed_event.attributes[0]['value']['Module']['error'],
                        spec_version=item.spec_version_id
                    ).first()

                    if error:
                        data['attributes']['error_message'] = error.documentation
                elif 'BadOrigin' in extrinsic_failed_event.attributes[0]['value']:
                    data['attributes']['error_message'] = 'Bad origin'
                elif 'CannotLookup' in extrinsic_failed_event.attributes[0]['value']:
                    data['attributes']['error_message'] = 'Cannot lookup'

        return data


class EventsListResource(JSONAPIListResource):

    def apply_filters(self, query, params):

        if params.get('filter[address]'):

            if len(params.get('filter[address]')) == 64:
                account_id = params.get('filter[address]')
            else:
                try:
                    account_id = ss58_decode(params.get('filter[address]'), SUBSTRATE_ADDRESS_TYPE)
                except ValueError:
                    return query.filter(False)
        else:
            account_id = None

        if params.get('filter[search_index]'):

            if type(params.get('filter[search_index]')) != list:
                params['filter[search_index]'] = [params.get('filter[search_index]')]

            search_index = SearchIndex.query(self.session).filter(
                SearchIndex.index_type_id.in_(params.get('filter[search_index]')),
                SearchIndex.account_id == account_id
            ).order_by(SearchIndex.sorting_value.desc())

            query = query.filter(tuple_(Event.block_id, Event.event_idx).in_(
                [[s.block_id, s.event_idx] for s in search_index]
            ))
        else:

            if params.get('filter[module_id]'):
                query = query.filter_by(module_id=params.get('filter[module_id]'))

            if params.get('filter[event_id]'):

                query = query.filter_by(event_id=params.get('filter[event_id]'))
            else:
                query = query.filter(Event.event_id.notin_(['ExtrinsicSuccess', 'ExtrinsicFailed']))

        return query

    def get_query(self):
        return Event.query(self.session).order_by(
            Event.block_id.desc()
        )


class EventDetailResource(JSONAPIDetailResource):

    def get_item_url_name(self):
        return 'event_id'

    def get_item(self, item_id):
        if len(item_id.split('-')) != 2:
            return None
        return Event.query(self.session).get(item_id.split('-'))

    def serialize_item(self, item):
        data = item.serialize()

        runtime_event = RuntimeEvent.query(self.session).filter_by(
            module_id=item.module_id,
            event_id=item.event_id,
            spec_version=item.spec_version_id
        ).first()

        data['attributes']['documentation'] = runtime_event.documentation

        return data


class LogListResource(JSONAPIListResource):

    def get_query(self):
        return Log.query(self.session).order_by(
            Log.block_id.desc()
        )


class LogDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):
        if len(item_id.split('-')) != 2:
            return None
        return Log.query(self.session).get(item_id.split('-'))


class NetworkStatisticsResource(JSONAPIResource):

    cache_expiration_time = 6

    def on_get(self, req, resp, network_id=None):
        resp.status = falcon.HTTP_200

        # TODO make caching more generic for custom resources

        cache_key = '{}-{}'.format(req.method, req.url)

        response = self.cache_region.get(cache_key, self.cache_expiration_time)

        if response is NO_VALUE:

            best_block = BlockTotal.query(self.session).filter_by(id=self.session.query(func.max(BlockTotal.id)).one()[0]).first()
            if best_block:
                response = self.get_jsonapi_response(
                    data={
                        'type': 'networkstats',
                        'id': network_id,
                        'attributes': {
                            'best_block': best_block.id,
                            'total_signed_extrinsics': int(best_block.total_extrinsics_signed),
                            'total_events': int(best_block.total_events),
                            'total_events_module': int(best_block.total_events_module),
                            'total_blocks': 'N/A',
                            'total_accounts': int(best_block.total_accounts),
                            'total_runtimes': Runtime.query(self.session).count()
                        }
                    },
                )
            else:
                response = self.get_jsonapi_response(
                    data={
                        'type': 'networkstats',
                        'id': network_id,
                        'attributes': {
                            'best_block': 0,
                            'total_signed_extrinsics': 0,
                            'total_events': 0,
                            'total_events_module': 0,
                            'total_blocks': 'N/A',
                            'total_accounts': 0,
                            'total_runtimes': 0
                        }
                    },
                )
            self.cache_region.set(cache_key, response)
            resp.set_header('X-Cache', 'MISS')
        else:
            resp.set_header('X-Cache', 'HIT')

        resp.media = response


class BalanceTransferListResource(JSONAPIListResource):

    def get_query(self):
        return Event.query(self.session).filter(
            Event.module_id == 'balances', Event.event_id == 'Transfer'
        ).order_by(Event.block_id.desc())

    def apply_filters(self, query, params):
        if params.get('filter[address]'):

            if len(params.get('filter[address]')) == 64:
                account_id = params.get('filter[address]')
            else:
                try:
                    account_id = ss58_decode(params.get('filter[address]'), SUBSTRATE_ADDRESS_TYPE)
                except ValueError:
                    return query.filter(False)

            search_index = SearchIndex.query(self.session).filter(
                SearchIndex.index_type_id.in_([
                    settings.SEARCH_INDEX_BALANCETRANSFER,
                    settings.SEARCH_INDEX_CLAIMS_CLAIMED,
                    settings.SEARCH_INDEX_BALANCES_DEPOSIT
                ]),
                SearchIndex.account_id == account_id
            ).order_by(SearchIndex.sorting_value.desc())

            query = Event.query(self.session).filter(tuple_(Event.block_id, Event.event_idx).in_(
                [[s.block_id, s.event_idx] for s in search_index]
            )).order_by(Event.block_id.desc())


        return query

    def serialize_item(self, item):

        if item.event_id == 'Transfer':

            sender = Account.query(self.session).get(item.attributes[0]['value'].replace('0x', ''))

            if sender:
                sender_data = sender.serialize()
            else:
                sender_data = {
                    'type': 'account',
                    'id': item.attributes[0]['value'].replace('0x', ''),
                    'attributes': {
                        'id': item.attributes[0]['value'].replace('0x', ''),
                        'address': ss58_encode(item.attributes[0]['value'].replace('0x', ''), SUBSTRATE_ADDRESS_TYPE)
                    }
                }

            destination = Account.query(self.session).get(item.attributes[1]['value'].replace('0x', ''))

            if destination:
                destination_data = destination.serialize()
            else:
                destination_data = {
                    'type': 'account',
                    'id': item.attributes[1]['value'].replace('0x', ''),
                    'attributes': {
                        'id': item.attributes[1]['value'].replace('0x', ''),
                        'address': ss58_encode(item.attributes[1]['value'].replace('0x', ''), SUBSTRATE_ADDRESS_TYPE)
                    }
                }
            # Some networks don't have fees
            if len(item.attributes) == 4:
                fee = item.attributes[3]['value']
            else:
                fee = 0

            value = item.attributes[2]['value']
        elif item.event_id == 'Claimed':

            destination = Account.query(self.session).get(item.attributes[0]['value'].replace('0x', ''))

            if destination:
                destination_data = destination.serialize()
            else:
                destination_data = {
                    'type': 'account',
                    'id': item.attributes[0]['value'].replace('0x', ''),
                    'attributes': {
                        'id': item.attributes[0]['value'].replace('0x', ''),
                        'address': ss58_encode(item.attributes[0]['value'].replace('0x', ''), SUBSTRATE_ADDRESS_TYPE)
                    }
                }

            fee = 0
            sender_data = {'name': 'Claim', 'eth_address': item.attributes[1]['value']}
            value = item.attributes[2]['value']

        elif item.event_id == 'Deposit':

            destination = Account.query(self.session).get(item.attributes[0]['value'].replace('0x', ''))

            if destination:
                destination_data = destination.serialize()
            else:
                destination_data = {
                    'type': 'account',
                    'id': item.attributes[0]['value'].replace('0x', ''),
                    'attributes': {
                        'id': item.attributes[0]['value'].replace('0x', ''),
                        'address': ss58_encode(item.attributes[0]['value'].replace('0x', ''), SUBSTRATE_ADDRESS_TYPE)
                    }
                }

            fee = 0
            sender_data = {'name': 'Deposit'}
            value = item.attributes[1]['value']
        else:
            sender_data = {}
            fee = 0
            destination_data = {}
            value = None

        return {
            'type': 'balancetransfer',
            'id': '{}-{}'.format(item.block_id, item.event_idx),
            'attributes': {
                'block_id': item.block_id,
                'event_id': item.event_id,
                'event_idx': '{}-{}'.format(item.block_id, item.event_idx),
                'sender': sender_data,
                'destination': destination_data,
                'value': value,
                'fee': fee
            }
        }




class BalanceTransferDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):
        return Event.query(self.session).get(item_id.split('-'))

    def serialize_item(self, item):

        sender = Account.query(self.session).get(item.attributes[0]['value'].replace('0x', ''))

        if sender:
            sender_data = sender.serialize()
        else:
            sender_data = {
                'type': 'account',
                'id': item.attributes[0]['value'].replace('0x', ''),
                'attributes': {
                    'id': item.attributes[0]['value'].replace('0x', ''),
                    'address': ss58_encode(item.attributes[0]['value'].replace('0x', ''), SUBSTRATE_ADDRESS_TYPE)
                }
            }

        destination = Account.query(self.session).get(item.attributes[1]['value'].replace('0x', ''))

        if destination:
            destination_data = destination.serialize()
        else:
            destination_data = {
                'type': 'account',
                'id': item.attributes[1]['value'].replace('0x', ''),
                'attributes': {
                    'id': item.attributes[1]['value'].replace('0x', ''),
                    'address': ss58_encode(item.attributes[1]['value'].replace('0x', ''), SUBSTRATE_ADDRESS_TYPE)
                }
            }

        # Some networks don't have fees
        if len(item.attributes) == 4:
            fee = item.attributes[3]['value']
        else:
            fee = 0

        return {
            'type': 'balancetransfer',
            'id': '{}-{}'.format(item.block_id, item.event_idx),
            'attributes': {
                'block_id': item.block_id,
                'event_idx': '{}-{}'.format(item.block_id, item.event_idx),
                'sender': sender_data,
                'destination': destination_data,
                'value': item.attributes[2]['value'],
                'fee': fee
            }
        }


class AccountResource(JSONAPIListResource):

    def get_query(self):
        return Account.query(self.session).order_by(
            Account.balance_total.desc()
        )

    def apply_filters(self, query, params):

        if params.get('filter[is_validator]'):
            query = query.filter_by(is_validator=True)

        if params.get('filter[is_nominator]'):
            query = query.filter_by(is_nominator=True)

        if params.get('filter[is_council_member]'):
            query = query.filter_by(is_council_member=True)

        if params.get('filter[is_registrar]'):
            query = query.filter_by(is_registrar=True)

        if params.get('filter[is_sudo]'):
            query = query.filter_by(is_sudo=True)

        if params.get('filter[is_tech_comm_member]'):
            query = query.filter_by(is_tech_comm_member=True)

        if params.get('filter[is_treasury]'):
            query = query.filter_by(is_treasury=True)

        if params.get('filter[was_validator]'):
            query = query.filter_by(was_validator=True)

        if params.get('filter[was_nominator]'):
            query = query.filter_by(was_nominator=True)

        if params.get('filter[was_council_member]'):
            query = query.filter_by(was_council_member=True)

        if params.get('filter[was_registrar]'):
            query = query.filter_by(was_registrar=True)

        if params.get('filter[was_sudo]'):
            query = query.filter_by(was_sudo=True)

        if params.get('filter[was_tech_comm_member]'):
            query = query.filter_by(was_tech_comm_member=True)

        if params.get('filter[has_identity]'):
            query = query.filter_by(has_identity=True, identity_judgement_bad=0)

        if params.get('filter[has_subidentity]'):
            query = query.filter_by(has_subidentity=True, identity_judgement_bad=0)

        if params.get('filter[identity_judgement_good]'):
            query = query.filter(Account.identity_judgement_good > 0, Account.identity_judgement_bad == 0)

        if params.get('filter[blacklist]'):
            query = query.filter(Account.identity_judgement_bad > 0)

        return query


class AccountDetailResource(JSONAPIDetailResource):

    cache_expiration_time = 6

    def __init__(self):
        RuntimeConfiguration().update_type_registry(load_type_registry_preset('default'))
        if TYPE_REGISTRY != 'default':
            RuntimeConfiguration().update_type_registry(load_type_registry_preset(TYPE_REGISTRY))
        super(AccountDetailResource, self).__init__()

    def get_item(self, item_id):
        return Account.query(self.session).filter(or_(Account.address == item_id, Account.index_address == item_id)).first()

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'recent_extrinsics' in include_list:
            relationships['recent_extrinsics'] = Extrinsic.query(self.session).filter_by(
                address=item.id).order_by(Extrinsic.block_id.desc())[:10]

        if 'indices' in include_list:
            relationships['indices'] = AccountIndex.query(self.session).filter_by(
                account_id=item.id).order_by(AccountIndex.updated_at_block.desc())

        return relationships

    def serialize_item(self, item):
        data = item.serialize()

        # Get balance history
        account_info_snapshot = AccountInfoSnapshot.query(self.session).filter_by(
            account_id=item.id
        ).order_by(AccountInfoSnapshot.block_id.desc())[:1000]

        data['attributes']['balance_history'] = [
            {
                'name': "Total balance",
                'type': 'line',
                'data': [
                    [item.block_id, float((item.balance_total or 0) / 10 ** settings.SUBSTRATE_TOKEN_DECIMALS)]
                    for item in reversed(account_info_snapshot)
                ],
            }
        ]

        if settings.USE_NODE_RETRIEVE_BALANCES == 'True':

            substrate = SubstrateInterface(SUBSTRATE_RPC_URL)

            if SUBSTRATE_STORAGE_BALANCE == 'Account':
                storage_call = RuntimeStorage.query(self.session).filter_by(
                    module_id='system',
                    name='Account',
                ).order_by(RuntimeStorage.spec_version.desc()).first()

                if storage_call:
                    account_data = substrate.get_storage(
                        block_hash=None,
                        module='System',
                        function='Account',
                        params=item.id,
                        return_scale_type=storage_call.type_value,
                        hasher=storage_call.type_hasher,
                        metadata_version=SUBSTRATE_METADATA_VERSION
                    )

                    if account_data:
                        data['attributes']['free_balance'] = account_data['data']['free']
                        data['attributes']['reserved_balance'] = account_data['data']['reserved']
                        data['attributes']['misc_frozen_balance'] = account_data['data']['miscFrozen']
                        data['attributes']['fee_frozen_balance'] = account_data['data']['feeFrozen']
                        data['attributes']['nonce'] = account_data['nonce']

            elif SUBSTRATE_STORAGE_BALANCE == 'Balances.Account':

                storage_call = RuntimeStorage.query(self.session).filter_by(
                    module_id='balances',
                    name='Account',
                ).order_by(RuntimeStorage.spec_version.desc()).first()

                if storage_call:
                    account_data = substrate.get_storage(
                        block_hash=None,
                        module='Balances',
                        function='Account',
                        params=item.id,
                        return_scale_type=storage_call.type_value,
                        hasher=storage_call.type_hasher,
                        metadata_version=SUBSTRATE_METADATA_VERSION
                    )

                    if account_data:
                        data['attributes']['balance_free'] = account_data['free']
                        data['attributes']['balance_reserved'] = account_data['reserved']
                        data['attributes']['misc_frozen_balance'] = account_data['miscFrozen']
                        data['attributes']['fee_frozen_balance'] = account_data['feeFrozen']
                        data['attributes']['nonce'] = None
            else:

                storage_call = RuntimeStorage.query(self.session).filter_by(
                    module_id='balances',
                    name='FreeBalance',
                ).order_by(RuntimeStorage.spec_version.desc()).first()

                if storage_call:
                    data['attributes']['free_balance'] = substrate.get_storage(
                        block_hash=None,
                        module='Balances',
                        function='FreeBalance',
                        params=item.id,
                        return_scale_type=storage_call.type_value,
                        hasher=storage_call.type_hasher,
                        metadata_version=SUBSTRATE_METADATA_VERSION
                    )

                storage_call = RuntimeStorage.query(self.session).filter_by(
                    module_id='balances',
                    name='ReservedBalance',
                ).order_by(RuntimeStorage.spec_version.desc()).first()

                if storage_call:
                    data['attributes']['reserved_balance'] = substrate.get_storage(
                        block_hash=None,
                        module='Balances',
                        function='ReservedBalance',
                        params=item.id,
                        return_scale_type=storage_call.type_value,
                        hasher=storage_call.type_hasher,
                        metadata_version=SUBSTRATE_METADATA_VERSION
                    )

                storage_call = RuntimeStorage.query(self.session).filter_by(
                    module_id='system',
                    name='AccountNonce',
                ).order_by(RuntimeStorage.spec_version.desc()).first()

                if storage_call:

                    data['attributes']['nonce'] = substrate.get_storage(
                        block_hash=None,
                        module='System',
                        function='AccountNonce',
                        params=item.id,
                        return_scale_type=storage_call.type_value,
                        hasher=storage_call.type_hasher,
                        metadata_version=SUBSTRATE_METADATA_VERSION
                    )

        return data


class AccountIndexListResource(JSONAPIListResource):

    def get_query(self):
        return AccountIndex.query(self.session).order_by(
            AccountIndex.updated_at_block.desc()
        )


class AccountIndexDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):
        return AccountIndex.query(self.session).filter_by(short_address=item_id).first()

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'recent_extrinsics' in include_list:
            relationships['recent_extrinsics'] = Extrinsic.query(self.session).filter_by(
                address=item.account_id).order_by(Extrinsic.block_id.desc())[:10]

        return relationships

    def serialize_item(self, item):
        data = item.serialize()

        if item.account:
            data['attributes']['account'] = item.account.serialize()

        return data


class SessionListResource(JSONAPIListResource):

    cache_expiration_time = 60

    def get_query(self):
        return Session.query(self.session).order_by(
            Session.id.desc()
        )


class SessionDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):
        return Session.query(self.session).get(item_id)

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'blocks' in include_list:
            relationships['blocks'] = Block.query(self.session).filter_by(
                session_id=item.id
            ).order_by(Block.id.desc())

        if 'validators' in include_list:
            relationships['validators'] = SessionValidator.query(self.session).filter_by(
                session_id=item.id
            ).order_by(SessionValidator.rank_validator)

        return relationships


class SessionValidatorListResource(JSONAPIListResource):

    cache_expiration_time = 60

    def get_query(self):
        return SessionValidator.query(self.session).order_by(
            SessionValidator.session_id, SessionValidator.rank_validator
        )

    def apply_filters(self, query, params):

        if params.get('filter[latestSession]'):

            session = Session.query(self.session).order_by(Session.id.desc()).first()

            query = query.filter_by(session_id=session.id)

        return query


class SessionValidatorDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):

        if len(item_id.split('-')) != 2:
            return None

        session_id, rank_validator = item_id.split('-')
        return SessionValidator.query(self.session).filter_by(
            session_id=session_id,
            rank_validator=rank_validator
        ).first()

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'nominators' in include_list:
            relationships['nominators'] = SessionNominator.query(self.session).filter_by(
                session_id=item.session_id, rank_validator=item.rank_validator
            ).order_by(SessionNominator.rank_nominator)

        return relationships

    def serialize_item(self, item):
        data = item.serialize()

        if item.validator_stash_account:
            data['attributes']['validator_stash_account'] = item.validator_stash_account.serialize()

        if item.validator_controller_account:
            data['attributes']['validator_controller_account'] = item.validator_controller_account.serialize()

        return data


class SessionNominatorListResource(JSONAPIListResource):

    cache_expiration_time = 60

    def get_query(self):
        return SessionNominator.query(self.session).order_by(
            SessionNominator.session_id, SessionNominator.rank_validator, SessionNominator.rank_nominator
        )

    def apply_filters(self, query, params):

        if params.get('filter[latestSession]'):

            session = Session.query(self.session).order_by(Session.id.desc()).first()

            query = query.filter_by(session_id=session.id)

        return query


class ContractListResource(JSONAPIListResource):

    def get_query(self):
        return Contract.query(self.session).order_by(
            Contract.created_at_block.desc()
        )


class ContractDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):
        return Contract.query(self.session).get(item_id)


class RuntimeListResource(JSONAPIListResource):

    cache_expiration_time = 60

    def get_query(self):
        return Runtime.query(self.session).order_by(
            Runtime.id.desc()
        )


class RuntimeDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):
        return Runtime.query(self.session).get(item_id)

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'modules' in include_list:
            relationships['modules'] = RuntimeModule.query(self.session).filter_by(
                spec_version=item.spec_version
            ).order_by('lookup', 'id')

        if 'types' in include_list:
            relationships['types'] = RuntimeType.query(self.session).filter_by(
                spec_version=item.spec_version
            ).order_by('type_string')

        return relationships


class RuntimeCallListResource(JSONAPIListResource):

    cache_expiration_time = 3600

    def apply_filters(self, query, params):

        if params.get('filter[latestRuntime]'):

            latest_runtime = Runtime.query(self.session).order_by(Runtime.spec_version.desc()).first()

            query = query.filter_by(spec_version=latest_runtime.spec_version)

        if params.get('filter[module_id]'):

            query = query.filter_by(module_id=params.get('filter[module_id]'))

        return query

    def get_query(self):
        return RuntimeCall.query(self.session).order_by(
            RuntimeCall.spec_version.asc(), RuntimeCall.module_id.asc(), RuntimeCall.call_id.asc()
        )


class RuntimeCallDetailResource(JSONAPIDetailResource):

    def get_item_url_name(self):
        return 'runtime_call_id'

    def get_item(self, item_id):

        if len(item_id.split('-')) != 3:
            return None

        spec_version, module_id, call_id = item_id.split('-')
        return RuntimeCall.query(self.session).filter_by(
            spec_version=spec_version,
            module_id=module_id,
            call_id=call_id
        ).first()

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'params' in include_list:
            relationships['params'] = RuntimeCallParam.query(self.session).filter_by(
                runtime_call_id=item.id).order_by('id')

        if 'recent_extrinsics' in include_list:
            relationships['recent_extrinsics'] = Extrinsic.query(self.session).filter_by(
                call_id=item.call_id, module_id=item.module_id).order_by(Extrinsic.block_id.desc())[:10]

        return relationships


class RuntimeEventListResource(JSONAPIListResource):

    cache_expiration_time = 3600

    def apply_filters(self, query, params):

        if params.get('filter[latestRuntime]'):

            latest_runtime = Runtime.query(self.session).order_by(Runtime.spec_version.desc()).first()

            query = query.filter_by(spec_version=latest_runtime.spec_version)

        if params.get('filter[module_id]'):

            query = query.filter_by(module_id=params.get('filter[module_id]'))

        return query

    def get_query(self):
        return RuntimeEvent.query(self.session).order_by(
            RuntimeEvent.spec_version.asc(), RuntimeEvent.module_id.asc(), RuntimeEvent.event_id.asc()
        )


class RuntimeEventDetailResource(JSONAPIDetailResource):

    def get_item_url_name(self):
        return 'runtime_event_id'

    def get_item(self, item_id):

        if len(item_id.split('-')) != 3:
            return None

        spec_version, module_id, event_id = item_id.split('-')
        return RuntimeEvent.query(self.session).filter_by(
            spec_version=spec_version,
            module_id=module_id,
            event_id=event_id
        ).first()

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'attributes' in include_list:
            relationships['attributes'] = RuntimeEventAttribute.query(self.session).filter_by(
                runtime_event_id=item.id).order_by('id')

        if 'recent_events' in include_list:
            relationships['recent_events'] = Event.query(self.session).filter_by(
                event_id=item.event_id, module_id=item.module_id).order_by(Event.block_id.desc())[:10]

        return relationships


class RuntimeTypeListResource(JSONAPIListResource):

    cache_expiration_time = 3600

    def get_query(self):
        return RuntimeType.query(self.session).order_by(
            'spec_version', 'type_string'
        )

    def apply_filters(self, query, params):

        if params.get('filter[latestRuntime]'):

            latest_runtime = Runtime.query(self.session).order_by(Runtime.spec_version.desc()).first()

            query = query.filter_by(spec_version=latest_runtime.spec_version)

        return query


class RuntimeModuleListResource(JSONAPIListResource):

    cache_expiration_time = 3600

    def get_query(self):
        return RuntimeModule.query(self.session).order_by(
            'spec_version', 'name'
        )

    def apply_filters(self, query, params):

        if params.get('filter[latestRuntime]'):

            latest_runtime = Runtime.query(self.session).order_by(Runtime.spec_version.desc()).first()

            query = query.filter_by(spec_version=latest_runtime.spec_version)

        return query


class RuntimeModuleDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):

        if len(item_id.split('-')) != 2:
            return None

        spec_version, module_id = item_id.split('-')
        return RuntimeModule.query(self.session).filter_by(spec_version=spec_version, module_id=module_id).first()

    def get_relationships(self, include_list, item):
        relationships = {}

        if 'calls' in include_list:
            relationships['calls'] = RuntimeCall.query(self.session).filter_by(
                spec_version=item.spec_version, module_id=item.module_id).order_by(
                'lookup', 'id')

        if 'events' in include_list:
            relationships['events'] = RuntimeEvent.query(self.session).filter_by(
                spec_version=item.spec_version, module_id=item.module_id).order_by(
                'lookup', 'id')

        if 'storage' in include_list:
            relationships['storage'] = RuntimeStorage.query(self.session).filter_by(
                spec_version=item.spec_version, module_id=item.module_id).order_by(
                'name')

        if 'constants' in include_list:
            relationships['constants'] = RuntimeConstant.query(self.session).filter_by(
                spec_version=item.spec_version, module_id=item.module_id).order_by(
                'name')

        if 'errors' in include_list:
            relationships['errors'] = RuntimeErrorMessage.query(self.session).filter_by(
                spec_version=item.spec_version, module_id=item.module_id).order_by(
                'name').order_by(RuntimeErrorMessage.index)

        return relationships


class RuntimeStorageDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):

        if len(item_id.split('-')) != 3:
            return None

        spec_version, module_id, name = item_id.split('-')
        return RuntimeStorage.query(self.session).filter_by(
            spec_version=spec_version,
            module_id=module_id,
            name=name
        ).first()


class RuntimeConstantListResource(JSONAPIListResource):

    cache_expiration_time = 3600

    def get_query(self):
        return RuntimeConstant.query(self.session).order_by(
            RuntimeConstant.spec_version.desc(), RuntimeConstant.module_id.asc(), RuntimeConstant.name.asc()
        )


class RuntimeConstantDetailResource(JSONAPIDetailResource):

    def get_item(self, item_id):

        if len(item_id.split('-')) != 3:
            return None

        spec_version, module_id, name = item_id.split('-')
        return RuntimeConstant.query(self.session).filter_by(
            spec_version=spec_version,
            module_id=module_id,
            name=name
        ).first()
