#  Scale Codec
#  Copyright (C) 2019  openAware B.V.
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.

from scalecodec.base import ScaleDecoder, ScaleType


class MetadataDecoder(ScaleDecoder):

    def __init__(self, data, **kwargs):
        self.version = None
        self.metadata = None
        self.call_index = None
        self.event_index = None
        super().__init__(data, **kwargs)

    def process(self):
        magic_bytes = self.get_next_bytes(4)

        if magic_bytes == b'meta':

            self.version = self.process_type('Enum', value_list=[
                "MetadataV0Decoder",
                "MetadataV1Decoder",
                "MetadataV2Decoder",
                "MetadataV3Decoder",
                "MetadataV4Decoder",
                "MetadataV5Decoder",
                "MetadataV6Decoder",
                "MetadataV7Decoder",
                "MetadataV8Decoder",
                "MetadataV9Decoder",
                "MetadataV10Decoder",
                "MetadataV11Decoder"
            ])

            self.metadata = self.process_type(self.version.value)

            # TODO remove duplicate reference?
            self.call_index = self.metadata.call_index
            self.event_index = self.metadata.event_index

            return self.metadata.value

        else:
            # Fall back to version unaware legacy MetadataV0
            self.data.reset()

            self.metadata = self.process_type('MetadataV0Decoder')

            # TODO remove duplicate reference?
            self.call_index = self.metadata.call_index
            self.event_index = self.metadata.event_index

            return self.metadata.value


class MetadataV4Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV4": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV4Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV4"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV4Module(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.prefix = None
        self.call_index = None
        self.has_storage = False
        self.storage = None
        self.has_calls = False
        self.calls = None
        self.has_events = False
        self.events = None
        self.constants = []
        self.errors = []
        super().__init__(data, sub_type, **kwargs)

    def get_identifier(self):
        return self.name.lower()

    def process(self):

        self.name = self.process_type('Bytes').value
        self.prefix = self.process_type('Bytes').value

        result = {
            "name": self.name,
            "prefix": self.prefix,
            "storage": self.storage,
            "calls": self.calls,
            "events": self.events,
            "constants": self.constants,
            "errors": self.errors
        }

        self.has_storage = self.process_type('bool').value

        if self.has_storage:
            # TODO convert to Option<Vec<MetadataModuleStorage>>
            self.storage = self.process_type('Vec<MetadataV4ModuleStorage>').elements
            result["storage"] = [s.value for s in self.storage]

        self.has_calls = self.process_type('bool').value

        if self.has_calls:
            # TODO convert to Option<Vec<MetadataModuleCall>>
            self.calls = self.process_type('Vec<MetadataModuleCall>').elements
            result["calls"] = [s.value for s in self.calls]

        self.has_events = self.process_type('bool').value

        if self.has_events:
            # TODO convert to Option<Vec<MetadataModuleEvent>>
            self.events = self.process_type('Vec<MetadataModuleEvent>').elements
            result["events"] = [s.value for s in self.events]

        return result


class MetadataV4ModuleStorage(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.modifier = None
        self.type = {}
        self.fallback = None
        self.docs = []
        self.hasher = None
        super().__init__(data, sub_type, **kwargs)

    def process(self):

        self.name = self.process_type('Bytes').value
        self.modifier = self.process_type('Enum', value_list=["Optional", "Default"]).value

        storage_function_type = self.process_type('Enum', value_list=["PlainType", "MapType", "DoubleMapType"]).value

        if storage_function_type == 'MapType':
            self.hasher = self.process_type('StorageHasher')
            self.type = {
                "MapType": {
                    "hasher": self.hasher.value,
                    "key": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value),
                    "isLinked": self.process_type('bool').value
                }
            }
        elif storage_function_type == 'DoubleMapType':
            self.hasher = self.process_type('StorageHasher')
            self.type = {
                "DoubleMapType": {
                    "hasher": self.hasher.value,
                    "key1": self.convert_type(self.process_type('Bytes').value),
                    "key2": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value),
                    "key2Hasher": self.process_type('Bytes').value
                }
            }

        elif storage_function_type == 'PlainType':
            self.type = {
                "PlainType": self.convert_type(self.process_type('Bytes').value)
            }

        self.fallback = self.process_type('HexBytes').value

        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "modifier": self.modifier,
            "type": self.type,
            "fallback": self.fallback,
            "docs": self.docs
        }


class MetadataV5Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV5": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV4Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV5"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV5Module(ScaleType):

    def __init__(self, data, sub_type=None):
        self.name = None
        self.prefix = None
        self.call_index = None
        self.has_storage = False
        self.storage = None
        self.has_calls = False
        self.calls = None
        self.has_events = False
        self.events = None
        self.constants = []
        self.errors = []
        super().__init__(data, sub_type)

    def get_identifier(self):
        return self.name.lower()

    def process(self):

        self.name = self.process_type('Bytes').value
        self.prefix = self.process_type('Bytes').value

        result = {
            "name": self.name,
            "prefix": self.prefix,
            "storage": self.storage,
            "calls": self.calls,
            "events": self.events,
            "constants": self.constants,
            "errors": self.errors
        }

        self.has_storage = self.process_type('bool').value

        if self.has_storage:
            # TODO convert to Option<Vec<MetadataModuleStorage>>
            self.storage = self.process_type('Vec<MetadataV5ModuleStorage>').elements
            result["storage"] = [s.value for s in self.storage]

        self.has_calls = self.process_type('bool').value

        if self.has_calls:
            # TODO convert to Option<Vec<MetadataModuleCall>>
            self.calls = self.process_type('Vec<MetadataModuleCall>').elements
            result["calls"] = [s.value for s in self.calls]

        self.has_events = self.process_type('bool').value

        if self.has_events:
            # TODO convert to Option<Vec<MetadataModuleEvent>>
            self.events = self.process_type('Vec<MetadataModuleEvent>').elements
            result["events"] = [s.value for s in self.events]

        return result


class MetadataV5ModuleStorage(ScaleType):
    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.modifier = None
        self.type = {}
        self.fallback = None
        self.docs = []
        self.hasher = None
        super().__init__(data, sub_type, **kwargs)

    def process(self):

        self.name = self.process_type('Bytes').value
        self.modifier = self.process_type('Enum', value_list=["Optional", "Default"]).value

        storage_function_type = self.process_type('Enum', value_list=["PlainType", "MapType", "DoubleMapType"]).value

        if storage_function_type == 'MapType':
            self.hasher = self.process_type('StorageHasher')
            self.type = {
                "MapType": {
                    "hasher": self.hasher.value,
                    "key": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value),
                    "isLinked": self.process_type('bool').value
                }
            }
        elif storage_function_type == 'DoubleMapType':
            self.hasher = self.process_type('StorageHasher')
            self.type = {
                "DoubleMapType": {
                    "hasher": self.hasher.value,
                    "key1": self.convert_type(self.process_type('Bytes').value),
                    "key2": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value),
                    "key2Hasher": self.process_type('StorageHasher').value
                }
            }

        elif storage_function_type == 'PlainType':
            self.type = {
                "PlainType": self.convert_type(self.process_type('Bytes').value)
            }

        self.fallback = self.process_type('HexBytes').value

        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "modifier": self.modifier,
            "type": self.type,
            "fallback": self.fallback,
            "docs": self.docs
        }


class MetadataV6Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV6": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV6Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV6"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV6Module(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.prefix = None
        self.call_index = None
        self.has_storage = False
        self.storage = None
        self.has_calls = False
        self.calls = None
        self.has_events = False
        self.events = None
        self.constants = []
        self.errors = []
        super().__init__(data, sub_type, **kwargs)

    def get_identifier(self):
        return self.name.lower()

    def process(self):

        self.name = self.process_type('Bytes').value
        self.prefix = self.process_type('Bytes').value

        result = {
            "name": self.name,
            "prefix": self.prefix,
            "storage": self.storage,
            "calls": self.calls,
            "events": self.events,
            "constants": self.constants,
            "errors": self.errors
        }

        self.has_storage = self.process_type('bool').value

        if self.has_storage:
            # TODO convert to Option<Vec<MetadataModuleStorage>>
            self.storage = self.process_type('Vec<MetadataV6ModuleStorage>').elements
            result["storage"] = [s.value for s in self.storage]

        self.has_calls = self.process_type('bool').value

        if self.has_calls:
            # TODO convert to Option<Vec<MetadataModuleCall>>
            self.calls = self.process_type('Vec<MetadataModuleCall>').elements
            result["calls"] = [s.value for s in self.calls]

        self.has_events = self.process_type('bool').value

        if self.has_events:
            # TODO convert to Option<Vec<MetadataModuleEvent>>
            self.events = self.process_type('Vec<MetadataModuleEvent>').elements
            result["events"] = [s.value for s in self.events]

        self.constants = self.process_type('Vec<MetadataV6ModuleConstants>').elements
        result["constants"] = [s.value for s in self.constants]

        return result


class MetadataV6ModuleStorage(MetadataV5ModuleStorage):
    pass


class MetadataV6ModuleConstants(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.type = None
        self.constant_value = None
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):

        self.name = self.process_type('Bytes').value
        self.type = self.convert_type(self.process_type('Bytes').value)
        self.constant_value = self.process_type('HexBytes').value
        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "type": self.type,
            "value": self.constant_value,
            "docs": self.docs
        }


class MetadataV7Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV7": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV7Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV7"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV7Module(MetadataV6Module):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.prefix = None
        self.call_index = None
        self.has_storage = False
        self.storage = None
        self.has_calls = False
        self.calls = None
        self.has_events = False
        self.events = None
        self.constants = []
        self.errors = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):

        self.name = self.process_type('Bytes').value

        result = {
            "name": self.name,
            "prefix": self.prefix,
            "storage": self.storage,
            "calls": self.calls,
            "events": self.events,
            "constants": self.constants,
            "errors": self.errors
        }

        self.has_storage = self.process_type('bool').value

        if self.has_storage:
            # TODO convert to Option<Vec<MetadataModuleStorage>>
            self.storage = self.process_type('MetadataV7ModuleStorage')
            result["storage"] = self.storage.value
            # TODO moved to storage, change data model
            self.prefix = self.storage.prefix
            result["prefix"] = self.prefix

        self.has_calls = self.process_type('bool').value

        if self.has_calls:
            # TODO convert to Option<Vec<MetadataModuleCall>>
            self.calls = self.process_type('Vec<MetadataModuleCall>').elements
            result["calls"] = [s.value for s in self.calls]

        self.has_events = self.process_type('bool').value

        if self.has_events:
            # TODO convert to Option<Vec<MetadataModuleEvent>>
            self.events = self.process_type('Vec<MetadataModuleEvent>').elements
            result["events"] = [s.value for s in self.events]

        self.constants = self.process_type('Vec<MetadataV7ModuleConstants>').elements
        result["constants"] = [s.value for s in self.constants]

        return result


class MetadataV7ModuleStorage(MetadataV6ModuleStorage):

    def __init__(self, data, sub_type=None, **kwargs):
        self.prefix = None
        self.items = []

        super().__init__(data, sub_type, **kwargs)

    def process(self):

        self.prefix = self.process_type('Bytes').value
        self.items = self.process_type('Vec<MetadataV7ModuleStorageEntry>').elements

        return {
            "prefix": self.prefix,
            "items": [s.value for s in self.items]
        }


class MetadataV7ModuleStorageEntry(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.modifier = None
        self.type = {}
        self.fallback = None
        self.docs = []
        self.hasher = None
        super().__init__(data, sub_type, **kwargs)

    def process(self):

        self.name = self.process_type('Bytes').value
        self.modifier = self.process_type('Enum', value_list=["Optional", "Default"]).value

        storage_function_type = self.process_type('Enum', value_list=["PlainType", "MapType", "DoubleMapType"]).value

        if storage_function_type == 'MapType':
            self.hasher = self.process_type('StorageHasher')
            self.type = {
                "MapType": {
                    "hasher": self.hasher.value,
                    "key": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value),
                    "isLinked": self.process_type('bool').value
                }
            }
        elif storage_function_type == 'DoubleMapType':
            self.hasher = self.process_type('StorageHasher')
            self.type = {
                "DoubleMapType": {
                    "hasher": self.hasher.value,
                    "key1": self.convert_type(self.process_type('Bytes').value),
                    "key2": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value),
                    "key2Hasher": self.process_type('StorageHasher').value
                }
            }

        elif storage_function_type == 'PlainType':
            self.type = {
                "PlainType": self.convert_type(self.process_type('Bytes').value)
            }

        self.fallback = self.process_type('HexBytes').value

        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "modifier": self.modifier,
            "type": self.type,
            "fallback": self.fallback,
            "docs": self.docs
        }


class MetadataV7ModuleConstants(MetadataV6ModuleConstants):
    pass


class MetadataV8Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV8": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV8Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV8"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV8Module(MetadataV6Module):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.prefix = None
        self.call_index = None
        self.has_storage = False
        self.storage = None
        self.has_calls = False
        self.calls = None
        self.has_events = False
        self.events = None
        self.constants = []
        self.errors = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):

        self.name = self.process_type('Bytes').value

        result = {
            "name": self.name,
            "prefix": self.prefix,
            "storage": self.storage,
            "calls": self.calls,
            "events": self.events,
            "constants": self.constants,
            "errors": self.errors
        }

        self.has_storage = self.process_type('bool').value

        if self.has_storage:
            # TODO convert to Option<Vec<MetadataModuleStorage>>
            self.storage = self.process_type('MetadataV7ModuleStorage')
            result["storage"] = self.storage.value
            # TODO moved to storage, change data model
            self.prefix = self.storage.prefix
            result["prefix"] = self.prefix

        self.has_calls = self.process_type('bool').value

        if self.has_calls:
            # TODO convert to Option<Vec<MetadataModuleCall>>
            self.calls = self.process_type('Vec<MetadataModuleCall>').elements
            result["calls"] = [s.value for s in self.calls]

        self.has_events = self.process_type('bool').value

        if self.has_events:
            # TODO convert to Option<Vec<MetadataModuleEvent>>
            self.events = self.process_type('Vec<MetadataModuleEvent>').elements
            result["events"] = [s.value for s in self.events]

        self.constants = self.process_type('Vec<MetadataV7ModuleConstants>').elements
        result["constants"] = [s.value for s in self.constants]

        self.errors = self.process_type('Vec<MetadataModuleError>').elements
        result["errors"] = [s.value for s in self.errors]

        return result


class MetadataModuleError(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):

        self.name = self.process_type('Bytes').value
        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "docs": self.docs
        }


class MetadataV9Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV9": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV8Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV9"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV10Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV10": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV8Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV10"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV11Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV11": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV8Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV11"]["modules"] = [m.value for m in self.modules]
        result_data["metadata"]["MetadataV11"]["extrinsic"] = self.process_type("ExtrinsicMetadata").value

        return result_data


class MetadataV3Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV3": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataModule>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV3"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV2Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV2": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataModule>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV2"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV1Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.modules = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "magicNumber": 1635018093,  # struct.unpack('<L', bytearray.fromhex("6174656d")),
            "metadata": {
                "MetadataV1": {
                    "modules": [],
                }
            }
        }

        self.modules = self.process_type('Vec<MetadataV1Module>').elements

        # Build call and event index

        call_module_index = 0
        event_module_index = 0

        for module in self.modules:
            if module.calls is not None:
                for call_index, call in enumerate(module.calls):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)
                call_module_index += 1

            if module.events is not None:
                for event_index, event in enumerate(module.events):
                    event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                    self.event_index[event.lookup] = (module, event)
                event_module_index += 1

        result_data["metadata"]["MetadataV1"]["modules"] = [m.value for m in self.modules]

        return result_data


class MetadataV0Decoder(ScaleDecoder):

    def __init__(self, data, sub_type=None):
        self.version = None
        self.events_modules = []
        self.modules = []
        self.sections = []
        self.call_index = {}
        self.event_index = {}

        super().__init__(data, sub_type)

    def process(self):
        result_data = {
            "metadata": {
                "MetadataV0": {
                    "outerEvent": {
                        "name": self.process_type('Bytes').value,
                        "events": []
                    },
                    "modules": [],
                    "sections": []
                }
            }
        }

        self.events_modules = self.process_type('Vec<MetadataV0EventModule>').elements

        self.modules = self.process_type('Vec<MetadataV0Module>').elements

        # TODO why "Call" unused?
        _ = self.process_type('Bytes').value

        self.sections = self.process_type('Vec<MetadataV0Section>').elements

        # Build call and event index
        call_module_index = 0
        for module_index, module in enumerate(self.modules):
            if module_index > 0 and (len(module.functions) > 0 or len(module.storage) > 0):

                for call_index, call in enumerate(module.functions):
                    call.lookup = "{:02x}{:02x}".format(call_module_index, call_index)
                    self.call_index[call.lookup] = (module, call)

                call_module_index += 1

        for event_module_index, event_module in enumerate(self.events_modules):
            for event_index, event in enumerate(event_module.events):
                event.lookup = "{:02x}{:02x}".format(event_module_index, event_index)
                self.event_index[event.lookup] = (event_module, event)

        result_data["metadata"]["MetadataV0"]["outerEvent"]["events"] = [e.value for e in self.events_modules]
        result_data["metadata"]["MetadataV0"]["modules"] = [m.value for m in self.modules]
        result_data["metadata"]["MetadataV0"]["sections"] = [s.value for s in self.sections]

        return result_data


class MetadataV0EventModule(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.events = None
        super().__init__(data, sub_type, **kwargs)

    def process(self):
        self.name = self.process_type('Bytes').value
        self.events = self.process_type('Vec<MetadataV0Event>').elements

        return {
            'name': self.name,
            'events': [s.value for s in self.events]
        }


class MetadataV0Event(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.args = []
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):
        self.name = self.process_type('Bytes').value
        self.args = self.process_type('Vec<Bytes>').value
        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "arguments": self.args,
            "docs": self.docs
        }


class MetadataV0Module(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.prefix = None
        self.name = None
        self.call_name = None
        self.functions = []
        self.has_storage = False
        self.storage_prefix = None
        self.storage = []
        self.constants = []
        self.errors = []
        super().__init__(data, sub_type, **kwargs)

    # TODO move to version agnostic superclass MetadataModule
    def get_identifier(self):
        return self.prefix.lower()

    def process(self):
        self.prefix = self.process_type('Bytes').value
        self.name = self.process_type('Bytes').value
        self.call_name = self.process_type('Bytes').value

        self.functions = self.process_type('Vec<MetadataV0ModuleFunction>').elements

        result = {
            "prefix": self.prefix,
            "index": None,
            "module": {
                "name": self.name,
                "call": {
                    "name": self.call_name,
                    "functions": [s.value for s in self.functions]
                }

            },
        }

        self.has_storage = self.process_type('bool').value

        if self.has_storage:
            self.storage_prefix = self.process_type('Bytes').value
            self.storage = self.process_type('Vec<MetadataV0ModuleStorage>').elements

            result["storage"] = {
                "prefix": self.storage_prefix,
                "functions": [s.value for s in self.storage]
            }

        return result


class MetadataV0ModuleFunction(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.id = None
        self.name = None
        self.args = []
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def get_identifier(self):
        return self.name

    def process(self):
        self.id = self.get_next_bytes(2).hex()
        self.name = self.process_type('Bytes').value
        self.args = self.process_type('Vec<MetadataModuleCallArgument>').elements
        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "id": self.id,
            "name": self.name,
            "args": [s.value for s in self.args],
            "docs": self.docs
        }


class MetadataV0ModuleStorage(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.modifier = None
        self.type = {}
        self.fallback = None
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):
        self.name = self.process_type('Bytes').value
        self.modifier = self.process_type('Enum', value_list=["Optional", "Default"]).value

        is_key_value = self.process_type('bool').value

        if is_key_value:
            self.type = {
                "MapType": {
                    "key": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value)}
            }
        else:
            self.type = {
                "PlainType": self.convert_type(self.process_type('Bytes').value)
            }

        self.fallback = self.process_type('HexBytes').value

        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "modifier": self.modifier,
            "type": self.type,
            "default": self.fallback,
            "docs": self.docs
        }


class MetadataV0Section(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.code = None
        self.id = None

        super().__init__(data, sub_type, **kwargs)

    def process(self):
        self.name = self.process_type('Bytes').value
        self.code = self.process_type('Bytes').value
        self.id = self.get_next_bytes(2).hex()

        return {
            "name": self.name,
            "code": self.code,
            "id": self.id
        }


class MetadataModule(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.prefix = None
        self.call_index = None
        self.has_storage = False
        self.storage = None
        self.has_calls = False
        self.calls = None
        self.has_events = False
        self.events = None
        self.constants = []
        self.errors = []
        super().__init__(data, sub_type, **kwargs)

    def get_identifier(self):
        return self.name.lower()

    def process(self):

        self.name = self.process_type('Bytes').value
        self.prefix = self.process_type('Bytes').value

        result = {
            "name": self.name,
            "prefix": self.prefix,
            "storage": self.storage,
            "calls": self.calls,
            "events": self.events,
            "constants": self.constants
        }

        self.has_storage = self.process_type('bool').value

        if self.has_storage:
            # TODO convert to Option<Vec<MetadataModuleStorage>>
            self.storage = self.process_type('Vec<MetadataModuleStorage>').elements
            result["storage"] = [s.value for s in self.storage]

        self.has_calls = self.process_type('bool').value

        if self.has_calls:
            # TODO convert to Option<Vec<MetadataModuleCall>>
            self.calls = self.process_type('Vec<MetadataModuleCall>').elements
            result["calls"] = [s.value for s in self.calls]

        self.has_events = self.process_type('bool').value

        if self.has_events:
            # TODO convert to Option<Vec<MetadataModuleEvent>>
            self.events = self.process_type('Vec<MetadataModuleEvent>').elements
            result["events"] = [s.value for s in self.events]

        return result


class MetadataV1Module(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.prefix = None
        self.call_index = None
        self.has_storage = False
        self.storage = None
        self.has_calls = False
        self.calls = None
        self.has_events = False
        self.events = None
        self.constants = []
        self.errors = []
        super().__init__(data, sub_type, **kwargs)

    def get_identifier(self):
        return self.name.lower()

    def process(self):

        self.name = self.process_type('Bytes').value
        self.prefix = self.process_type('Bytes').value

        result = {
            "name": self.name,
            "prefix": self.prefix,
            "storage": self.storage,
            "calls": self.calls,
            "events": self.events,
            "constants": self.constants
        }

        self.has_storage = self.process_type('bool').value

        if self.has_storage:
            # TODO convert to Option<Vec<MetadataModuleStorage>>
            self.storage = self.process_type('Vec<MetadataV1ModuleStorage>').elements
            result["storage"] = [s.value for s in self.storage]

        self.has_calls = self.process_type('bool').value

        if self.has_calls:
            # TODO convert to Option<Vec<MetadataModuleCall>>
            self.calls = self.process_type('Vec<MetadataModuleCall>').elements
            result["calls"] = [s.value for s in self.calls]

        self.has_events = self.process_type('bool').value

        if self.has_events:
            # TODO convert to Option<Vec<MetadataModuleEvent>>
            self.events = self.process_type('Vec<MetadataModuleEvent>').elements
            result["events"] = [s.value for s in self.events]

        return result


class MetadataModuleStorage(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.modifier = None
        self.type = {}
        self.fallback = None
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):
        self.name = self.process_type('Bytes').value
        self.modifier = self.process_type('Enum', value_list=["Optional", "Default"]).value

        is_key_value = self.process_type('bool').value

        if is_key_value:
            self.type = {
                "MapType": {
                    "key": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value),
                    "isLinked": self.process_type('bool').value
                }

            }
        else:
            self.type = {
                "PlainType": self.convert_type(self.process_type('Bytes').value)
            }

        self.fallback = self.process_type('HexBytes').value

        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "modifier": self.modifier,
            "type": self.type,
            "fallback": self.fallback,
            "docs": self.docs
        }


class MetadataV1ModuleStorage(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.modifier = None
        self.type = {}
        self.fallback = None
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):
        self.name = self.process_type('Bytes').value
        self.modifier = self.process_type('Enum', value_list=["Optional", "Default"]).value

        is_key_value = self.process_type('bool').value

        if is_key_value:
            self.type = {
                "MapType": {
                    "key": self.convert_type(self.process_type('Bytes').value),
                    "value": self.convert_type(self.process_type('Bytes').value)
                }

            }
        else:
            self.type = {
                "PlainType": self.convert_type(self.process_type('Bytes').value)
            }

        self.fallback = self.process_type('HexBytes').value

        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "modifier": self.modifier,
            "type": self.type,
            "fallback": self.fallback,
            "docs": self.docs
        }


class MetadataModuleCall(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.args = []
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def get_identifier(self):
        return self.name

    def process(self):
        self.name = self.process_type('Bytes').value

        self.args = self.process_type('Vec<MetadataModuleCallArgument>').elements

        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "args": [a.value for a in self.args],
            "docs": self.docs
        }


class MetadataModuleCallArgument(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.type = None

        super().__init__(data, sub_type, **kwargs)

    def process(self):
        self.name = self.process_type('Bytes').value
        self.type = self.convert_type(self.process_type('Bytes').value)

        return {
            "name": self.name,
            "type": self.type
        }


class MetadataModuleEvent(ScaleType):

    def __init__(self, data, sub_type=None, **kwargs):
        self.name = None
        self.args = []
        self.docs = []
        super().__init__(data, sub_type, **kwargs)

    def process(self):
        self.name = self.process_type('Bytes').value
        self.args = self.process_type('Vec<Bytes>').value
        self.docs = self.process_type('Vec<Bytes>').value

        return {
            "name": self.name,
            "args": self.args,
            "docs": self.docs
        }
