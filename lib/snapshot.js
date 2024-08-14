"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snapshot = exports.items = void 0;
var UUIDManager_1 = require("./UUIDManager");
var MsgUnpacker_1 = require("./MsgUnpacker");
var decoder = new TextDecoder('utf-8');
var ___itemAppendix = [
    { "type_id": 0, "size": 0, "name": "obj_ex" },
    { "type_id": 1, "size": 10, "name": "obj_player_input" },
    { "type_id": 2, "size": 6, "name": "obj_projectile" },
    { "type_id": 3, "size": 5, "name": "obj_laser" },
    { "type_id": 4, "size": 4, "name": "obj_pickup" },
    { "type_id": 5, "size": 3, "name": "obj_flag" },
    { "type_id": 6, "size": 8, "name": "obj_game_info" },
    { "type_id": 7, "size": 4, "name": "obj_game_data" },
    { "type_id": 8, "size": 15, "name": "obj_character_core" },
    { "type_id": 9, "size": 22, "name": "obj_character" },
    { "type_id": 10, "size": 5, "name": "obj_player_info" },
    { "type_id": 11, "size": 17, "name": "obj_client_info" },
    { "type_id": 12, "size": 3, "name": "obj_spectator_info" },
    { "type_id": 13, "size": 2, "name": "common" },
    { "type_id": 14, "size": 2, "name": "explosion" },
    { "type_id": 15, "size": 2, "name": "spawn" },
    { "type_id": 16, "size": 2, "name": "hammerhit" },
    { "type_id": 17, "size": 3, "name": "death" },
    { "type_id": 18, "size": 3, "name": "sound_global" },
    { "type_id": 19, "size": 3, "name": "sound_world" },
    { "type_id": 20, "size": 3, "name": "damage_indicator" } // event_damage_indicator
];
var itemAppendix = [
    0,
    10,
    6,
    5,
    4,
    3,
    8,
    4,
    15,
    22,
    5,
    17,
    3,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
];
var items;
(function (items) {
    items[items["OBJ_EX"] = 0] = "OBJ_EX";
    items[items["OBJ_PLAYER_INPUT"] = 1] = "OBJ_PLAYER_INPUT";
    items[items["OBJ_PROJECTILE"] = 2] = "OBJ_PROJECTILE";
    items[items["OBJ_LASER"] = 3] = "OBJ_LASER";
    items[items["OBJ_PICKUP"] = 4] = "OBJ_PICKUP";
    items[items["OBJ_FLAG"] = 5] = "OBJ_FLAG";
    items[items["OBJ_GAME_INFO"] = 6] = "OBJ_GAME_INFO";
    items[items["OBJ_GAME_DATA"] = 7] = "OBJ_GAME_DATA";
    items[items["OBJ_CHARACTER_CORE"] = 8] = "OBJ_CHARACTER_CORE";
    items[items["OBJ_CHARACTER"] = 9] = "OBJ_CHARACTER";
    items[items["OBJ_PLAYER_INFO"] = 10] = "OBJ_PLAYER_INFO";
    items[items["OBJ_CLIENT_INFO"] = 11] = "OBJ_CLIENT_INFO";
    items[items["OBJ_SPECTATOR_INFO"] = 12] = "OBJ_SPECTATOR_INFO";
    items[items["EVENT_COMMON"] = 13] = "EVENT_COMMON";
    items[items["EVENT_EXPLOSION"] = 14] = "EVENT_EXPLOSION";
    items[items["EVENT_SPAWN"] = 15] = "EVENT_SPAWN";
    items[items["EVENT_HAMMERHIT"] = 16] = "EVENT_HAMMERHIT";
    items[items["EVENT_DEATH"] = 17] = "EVENT_DEATH";
    items[items["EVENT_SOUND_GLOBAL"] = 18] = "EVENT_SOUND_GLOBAL";
    items[items["EVENT_SOUND_WORLD"] = 19] = "EVENT_SOUND_WORLD";
    items[items["EVENT_DAMAGE_INDICATOR"] = 20] = "EVENT_DAMAGE_INDICATOR";
})(items = exports.items || (exports.items = {}));
// https://github.com/ddnet/ddnet/blob/571b0b36de83d18f2524ee371fc3223d04b94135/datasrc/network.py#L236
var supported_uuids = [
    "my-own-object@heinrich5991.de",
    "character@netobj.ddnet.tw",
    "player@netobj.ddnet.tw",
    "gameinfo@netobj.ddnet.tw",
    "projectile@netobj.ddnet.tw",
    "laser@netobj.ddnet.tw",
];
var Snapshot = /** @class */ (function () {
    function Snapshot(_client) {
        this.deltas = [];
        this.eSnapHolder = [];
        this.crc_errors = 0;
        this.uuid_manager = new UUIDManager_1.UUIDManager(32767, true); // snapshot max_type
        this.client = _client;
    }
    Snapshot.prototype.IntsToStr = function (pInts) {
        var pIntz = [];
        // var pStr = ''
        for (var _i = 0, pInts_1 = pInts; _i < pInts_1.length; _i++) {
            var x = pInts_1[_i];
            // pStr += String.fromCharCode((((x) >> 24) & 0xff) - 128);
            pIntz.push((((x) >> 24) & 0xff) - 128);
            // pStr += String.fromCharCode((((x) >> 16) & 0xff) - 128);
            pIntz.push((((x) >> 16) & 0xff) - 128);
            // pStr += String.fromCharCode((((x) >> 8) & 0xff) - 128);
            pIntz.push((((x) >> 8) & 0xff) - 128);
            // pStr += String.fromCharCode(((x) & 0xff) - 128);
            pIntz.push(((x) & 0xff) - 128);
        }
        pIntz.splice(-1, 1);
        var pStr = decoder.decode(new Uint8Array(pIntz));
        pStr = pStr.replace(/\0.*/g, ''); // Remove content from first null char to end.
        return pStr;
    };
    Snapshot.prototype.parseItem = function (data, Type, id) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var _item = {};
        if (Type >= 0x4000) { // offset uuid type
            if (((_a = this.uuid_manager.LookupType(Type)) === null || _a === void 0 ? void 0 : _a.name) == "my-own-object@heinrich5991.de") {
                _item = {
                    m_Test: data[0]
                };
            }
            else if (((_b = this.uuid_manager.LookupType(Type)) === null || _b === void 0 ? void 0 : _b.name) == "character@netobj.ddnet.tw") {
                _item = {
                    m_Flags: data[0],
                    m_FreezeEnd: data[1],
                    m_Jumps: data[2],
                    m_TeleCheckpoint: data[3],
                    m_StrongWeakID: data[4],
                    // # New data fields for jump display, freeze bar and ninja bar
                    // # Default values indicate that these values should not be used
                    m_JumpedTotal: (_c = data[5]) !== null && _c !== void 0 ? _c : null,
                    m_NinjaActivationTick: (_d = data[6]) !== null && _d !== void 0 ? _d : null,
                    m_FreezeStart: (_e = data[7]) !== null && _e !== void 0 ? _e : null,
                    // # New data fields for improved target accuracy
                    m_TargetX: (_f = data[8]) !== null && _f !== void 0 ? _f : null,
                    m_TargetY: (_g = data[9]) !== null && _g !== void 0 ? _g : null,
                    id: id
                };
            }
            else if (((_h = this.uuid_manager.LookupType(Type)) === null || _h === void 0 ? void 0 : _h.name) == "player@netobj.ddnet.tw") {
                _item = {
                    m_Flags: data[0],
                    m_AuthLevel: data[1],
                    id: id
                };
            }
            else if (((_j = this.uuid_manager.LookupType(Type)) === null || _j === void 0 ? void 0 : _j.name) == "gameinfo@netobj.ddnet.tw") {
                _item = {
                    m_Flags: data[0],
                    m_Version: data[1],
                    m_Flags2: data[2]
                };
            }
            else if (((_k = this.uuid_manager.LookupType(Type)) === null || _k === void 0 ? void 0 : _k.name) == "projectile@netobj.ddnet.tw") {
                _item = {
                    m_X: data[0],
                    m_Y: data[1],
                    m_Angle: data[2],
                    m_Data: data[3],
                    m_Type: data[3],
                    m_StartTick: data[3]
                };
            }
            else if (((_l = this.uuid_manager.LookupType(Type)) === null || _l === void 0 ? void 0 : _l.name) == "laser@netobj.ddnet.tw") {
                _item = {
                    m_ToX: data[0],
                    m_ToY: data[1],
                    m_FromX: data[2],
                    m_FromY: data[3],
                    m_Owner: data[3],
                    m_Type: data[3]
                };
            }
            return _item;
        }
        switch (Type) {
            case items.OBJ_EX:
                break;
            case items.OBJ_PLAYER_INPUT:
                _item = {
                    direction: data[0],
                    target_x: data[1],
                    target_y: data[2],
                    jump: data[3],
                    fire: data[4],
                    hook: data[5],
                    player_flags: data[6],
                    wanted_weapon: data[7],
                    next_weapon: data[8],
                    prev_weapon: data[9],
                };
                break;
            case items.OBJ_PROJECTILE:
                _item = {
                    x: data[0],
                    y: data[1],
                    vel_x: data[2],
                    vel_y: data[3],
                    type_: data[4],
                    start_tick: data[5],
                };
                break;
            case items.OBJ_LASER:
                _item = {
                    x: data[0],
                    y: data[1],
                    from_x: data[2],
                    from_y: data[3],
                    start_tick: data[4],
                };
                break;
            case items.OBJ_PICKUP:
                _item = {
                    x: data[0],
                    y: data[1],
                    type_: data[2],
                    subtype: data[3],
                };
                break;
            case items.OBJ_FLAG:
                _item = {
                    x: data[0],
                    y: data[1],
                    team: data[2],
                };
                break;
            case items.OBJ_GAME_INFO:
                _item = {
                    game_flags: data[0],
                    game_state_flags: data[1],
                    round_start_tick: data[2],
                    warmup_timer: data[3],
                    score_limit: data[4],
                    time_limit: data[5],
                    round_num: data[6],
                    round_current: data[7],
                };
                break;
            case items.OBJ_GAME_DATA:
                _item = {
                    teamscore_red: data[0],
                    teamscore_blue: data[1],
                    flag_carrier_red: data[2],
                    flag_carrier_blue: data[3],
                };
                break;
            case items.OBJ_CHARACTER_CORE:
                _item = {
                    tick: data[0],
                    x: data[1],
                    y: data[2],
                    vel_x: data[3],
                    vel_y: data[4],
                    angle: data[5],
                    direction: data[6],
                    jumped: data[7],
                    hooked_player: data[8],
                    hook_state: data[9],
                    hook_tick: data[10],
                    hook_x: data[11],
                    hook_y: data[12],
                    hook_dx: data[13],
                    hook_dy: data[14],
                };
                break;
            case items.OBJ_CHARACTER:
                _item = {
                    character_core: {
                        tick: data[0],
                        x: data[1],
                        y: data[2],
                        vel_x: data[3],
                        vel_y: data[4],
                        angle: data[5],
                        direction: data[6],
                        jumped: data[7],
                        hooked_player: data[8],
                        hook_state: data[9],
                        hook_tick: data[10],
                        hook_x: data[11],
                        hook_y: data[12],
                        hook_dx: data[13],
                        hook_dy: data[14],
                    },
                    player_flags: data[15],
                    health: data[16],
                    armor: data[17],
                    ammo_count: data[18],
                    weapon: data[19],
                    emote: data[20],
                    attack_tick: data[21],
                    client_id: id
                };
                break;
            case items.OBJ_PLAYER_INFO:
                _item = {
                    local: data[0],
                    client_id: data[1],
                    team: data[2],
                    score: data[3],
                    latency: data[4],
                };
                break;
            case items.OBJ_CLIENT_INFO:
                _item = {
                    name: this.IntsToStr([data[0], data[1], data[2], data[3]]),
                    clan: this.IntsToStr([data[4], data[5], data[6]]),
                    country: data[7],
                    skin: this.IntsToStr([data[8], data[9], data[10], data[11], data[12], data[13]]),
                    use_custom_color: Number(data.slice(14, 15)),
                    color_body: Number(data.slice(15, 16)),
                    color_feet: Number(data.slice(16, 17)),
                    id: id
                };
                break;
            case items.OBJ_SPECTATOR_INFO:
                _item = {
                    spectator_id: data[0],
                    x: data[1],
                    y: data[2],
                };
                break;
            case items.EVENT_COMMON:
                _item = {
                    x: data[0],
                    y: data[1],
                };
                break;
            case items.EVENT_EXPLOSION:
                _item = {
                    common: {
                        x: data[0],
                        y: data[1]
                    }
                };
                break;
            case items.EVENT_SPAWN:
                _item = {
                    common: {
                        x: data[0],
                        y: data[1]
                    }
                };
                break;
            case items.EVENT_HAMMERHIT:
                _item = {
                    common: {
                        x: data[0],
                        y: data[1]
                    }
                };
                break;
            case items.EVENT_DEATH:
                _item = {
                    client_id: data[0],
                    common: {
                        x: data[1],
                        y: data[2]
                    }
                };
                break;
            case items.EVENT_SOUND_GLOBAL:
                _item = {
                    common: {
                        x: data[0],
                        y: data[1]
                    },
                    sound_id: data[2]
                };
                break;
            case items.EVENT_SOUND_WORLD:
                _item = {
                    common: {
                        x: data[0],
                        y: data[1]
                    },
                    sound_id: data[2]
                };
                break;
            case items.EVENT_DAMAGE_INDICATOR:
                _item = {
                    angle: data[0],
                    common: {
                        x: data[0],
                        y: data[1]
                    },
                };
                break;
        }
        return _item;
    };
    Snapshot.prototype.crc = function () {
        var checksum = 0;
        // this.eSnapHolder.forEach(snap => {
        // 	if (snap.ack == tick)
        // 		snap.Snapshot.Data.forEach(el => checksum += el);
        // })
        this.deltas.forEach(function (snap) {
            // if (snap.ack == tick)
            snap.data.forEach(function (el) { return checksum += el; });
        });
        return checksum & 0xffffffff;
    };
    Snapshot.prototype.unpackSnapshot = function (snap, deltatick, recvTick, WantedCrc) {
        var _this = this;
        var unpacker = new MsgUnpacker_1.MsgUnpacker(snap);
        var deltaSnaps = [];
        if (deltatick == -1) {
            this.eSnapHolder = [];
            this.deltas = [];
        }
        else {
            this.eSnapHolder = this.eSnapHolder.filter(function (a) {
                if (a.ack == deltatick)
                    deltaSnaps.push(a);
                return a.ack >= deltatick;
            });
        }
        if (snap.length == 0) {
            // empty snap, copy old one into new ack
            this.eSnapHolder.forEach(function (snap) {
                if (snap.ack == deltatick)
                    _this.eSnapHolder.push({ Snapshot: snap.Snapshot, ack: recvTick });
            });
            return { items: [], recvTick: recvTick };
        }
        var oldDeltas = this.deltas;
        this.deltas = [];
        /* key = (((type_id) << 16) | (id))
        * key_to_id = ((key) & 0xffff)
        * key_to_type_id = ((key >> 16) & 0xffff)
        * https://github.com/heinrich5991/libtw2/blob/master/snapshot/src/
        * https://github.com/heinrich5991/libtw2/blob/master/doc/snapshot.md
        */
        var _events = [];
        var num_removed_items = unpacker.unpackInt();
        var num_item_deltas = unpacker.unpackInt();
        unpacker.unpackInt(); // _zero padding
        /*snapshot_delta:
            [ 4] num_removed_items
            [ 4] num_item_deltas
            [ 4] _zero
            [*4] removed_item_keys
            [  ] item_deltas
        */
        var deleted = [];
        for (var i = 0; i < num_removed_items; i++) {
            var deleted_key = unpacker.unpackInt(); // removed_item_keys
            deleted.push(deleted_key);
        }
        /*item_delta:
            [ 4] type_id
            [ 4] id
            [ 4] _size
            [*4] data_delta*/
        // let items: {'items': {'data': number[], 'type_id': number, 'id': number, 'key': number}[]/*, 'client_infos': client_info[], 'player_infos': player_info[]*/, lost: number} = {items: [],/* client_infos: client_infos, player_infos: player_infos,*/ lost: 0};
        // let deltaSnaps = this.eSnapHolder.filter(a => a.ack === deltatick);
        if (deltaSnaps.length == 0 && deltatick >= 0) {
            return { items: [], recvTick: -1 };
        }
        var _loop_1 = function (i) {
            var type_id = unpacker.unpackInt();
            var id = unpacker.unpackInt();
            var key = (((type_id) << 16) | (id));
            var _size = void 0;
            if (type_id > 0 && type_id < itemAppendix.length) {
                _size = itemAppendix[type_id];
            }
            else
                _size = unpacker.unpackInt();
            var data = [];
            for (var j = 0; j < _size; j++) {
                // if (unpacker.remaining.length > 0)  {
                data[j] = (unpacker.unpackInt());
                // } else console.log(_size, "???")
            }
            var changed = false;
            if (deltatick >= 0) {
                // let index = deltaSnaps.map(delta => delta.Snapshot.Key).indexOf(key)
                var delta = deltaSnaps.find(function (delta) { return delta.Snapshot.Key === key; });
                if (delta !== undefined) {
                    var out = UndiffItem(delta.Snapshot.Data, data);
                    data = out;
                    changed = true;
                } // else no previous, use new data
            }
            var parsed = void 0;
            if (type_id !== 0) {
                if (!changed) {
                    var oldDelta = oldDeltas.find(function (delta) { return delta.key == key; });
                    if (oldDelta !== undefined && compareArrays(data, oldDelta.data)) {
                        parsed = oldDelta.parsed;
                    }
                    else
                        parsed = this_1.parseItem(data, type_id, id);
                }
                else
                    parsed = this_1.parseItem(data, type_id, id);
                this_1.eSnapHolder.push({ Snapshot: { Data: data, Key: key }, ack: recvTick });
                this_1.deltas.push({
                    data: data,
                    key: key,
                    id: id,
                    type_id: type_id,
                    parsed: parsed
                });
                if (type_id >= items.EVENT_COMMON && type_id <= items.EVENT_DAMAGE_INDICATOR) {
                    // this.client.SnapshotUnpacker.
                    _events.push({ type_id: type_id, parsed: parsed });
                    // this.client.SnapshotUnpacker.emit(___itemAppendix[type_id].name, parsed);
                }
            }
            else {
                this_1.eSnapHolder.push({ Snapshot: { Data: data, Key: key }, ack: recvTick });
                this_1.deltas.push({
                    data: data,
                    key: key,
                    id: id,
                    type_id: type_id,
                    parsed: {}
                });
                var test_1 = function (int) { return [(int >> 24) & 0xff, (int >> 16) & 0xff, (int >> 8) & 0xff, (int) & 0xff]; };
                var test2 = function (ints) { return ints.map(function (a) { return test_1(a); }).flat(); };
                var targetUUID_1 = Buffer.from(test2(data));
                if (!this_1.uuid_manager.LookupType(id)) {
                    supported_uuids.forEach(function (a, i) {
                        var uuid = (0, UUIDManager_1.createTwMD5Hash)(a);
                        if (targetUUID_1.compare(uuid) == 0) {
                            _this.uuid_manager.RegisterName(a, id);
                            supported_uuids.splice(i, 1);
                        }
                    });
                }
            }
        };
        var this_1 = this;
        for (var i = 0; i < num_item_deltas; i++) {
            _loop_1(i);
        }
        var _loop_2 = function (newSnap) {
            if (deleted.includes(newSnap.Snapshot.Key)) {
                return "continue";
            }
            if (this_2.eSnapHolder.findIndex(function (a) { return a.ack == recvTick && a.Snapshot.Key == newSnap.Snapshot.Key; }) === -1) { // ugly copy new snap to eSnapHolder (if it isnt pushed already)
                this_2.eSnapHolder.push({ Snapshot: { Data: newSnap.Snapshot.Data, Key: newSnap.Snapshot.Key }, ack: recvTick });
                var oldDelta = oldDeltas.find(function (delta) { return delta.key == newSnap.Snapshot.Key; });
                if (oldDelta !== undefined && compareArrays(newSnap.Snapshot.Data, oldDelta.data)) {
                    this_2.deltas.push(oldDelta);
                }
                else {
                    this_2.deltas.push({
                        data: newSnap.Snapshot.Data,
                        key: newSnap.Snapshot.Key,
                        id: newSnap.Snapshot.Key & 0xffff,
                        type_id: ((newSnap.Snapshot.Key >> 16) & 0xffff),
                        parsed: this_2.parseItem(newSnap.Snapshot.Data, ((newSnap.Snapshot.Key >> 16) & 0xffff), ((newSnap.Snapshot.Key) & 0xffff))
                    });
                }
            }
        };
        var this_2 = this;
        for (var _i = 0, deltaSnaps_1 = deltaSnaps; _i < deltaSnaps_1.length; _i++) {
            var newSnap = deltaSnaps_1[_i];
            _loop_2(newSnap);
        }
        var _crc = this.crc();
        if (_crc !== WantedCrc) {
            this.deltas = oldDeltas;
            this.crc_errors++;
            if (this.crc_errors > 5) {
                recvTick = -1;
                this.crc_errors = 0;
                this.eSnapHolder = [];
                this.deltas = [];
            }
            else {
                recvTick = deltatick;
            }
        }
        else if (this.crc_errors > 0)
            this.crc_errors--;
        _events.forEach(function (a) { return _this.client.SnapshotUnpacker.emit(___itemAppendix[a.type_id].name, a.parsed); });
        return { items: this.deltas, recvTick: recvTick };
    };
    return Snapshot;
}());
exports.Snapshot = Snapshot;
function compareArrays(first, second) {
    if (first.length !== second.length)
        return false;
    for (var i = 0; i < first.length; i++) {
        if (first[i] !== second[i])
            return false;
    }
    return true;
}
function UndiffItem(oldItem, newItem) {
    var out = newItem;
    // if (JSON.stringify(newItem) === JSON.stringify(oldItem))
    // return newItem;
    oldItem.forEach(function (a, i) {
        if (a !== undefined && out[i] !== undefined) {
            out[i] += a;
        }
        else {
            out[i] = 0;
        }
    });
    return out;
}
