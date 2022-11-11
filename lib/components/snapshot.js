"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotWrapper = void 0;
var stream_1 = require("stream");
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
})(items || (items = {}));
var SnapshotWrapper = /** @class */ (function (_super) {
    __extends(SnapshotWrapper, _super);
    function SnapshotWrapper(_client) {
        var _this = 
        // this.SendMsgEx = callback;
        _super.call(this) || this;
        _this._client = _client;
        return _this;
    }
    SnapshotWrapper.prototype.getParsed = function (type_id, id) {
        var _a;
        if (type_id == -1)
            return undefined;
        return (_a = this._client.rawSnapUnpacker.deltas.find(function (delta) { return delta.type_id == type_id && delta.id == id; })) === null || _a === void 0 ? void 0 : _a.parsed;
    };
    SnapshotWrapper.prototype.getAll = function (type_id) {
        var _all = [];
        if (type_id == -1)
            return _all;
        this._client.rawSnapUnpacker.deltas.forEach(function (delta) {
            if (delta.type_id == type_id)
                _all.push(delta.parsed);
        });
        return _all;
        // return this._client.rawSnapUnpacker.deltas.filter(delta => delta.type_id == type_id && delta.id == id).map(a => a.parsed);
    };
    SnapshotWrapper.prototype.getObjPlayerInput = function (player_id) {
        return this.getParsed(items.OBJ_PLAYER_INPUT, player_id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjPlayerInput", {
        get: function () {
            return this.getAll(items.OBJ_PLAYER_INPUT);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjProjectile = function (id) {
        return this.getParsed(items.OBJ_PROJECTILE, id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllProjectiles", {
        get: function () {
            return this.getAll(items.OBJ_PROJECTILE);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjLaser = function (id) {
        return this.getParsed(items.OBJ_LASER, id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjLaser", {
        get: function () {
            return this.getAll(items.OBJ_LASER);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjPickup = function (id) {
        return this.getParsed(items.OBJ_PICKUP, id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjPickup", {
        get: function () {
            return this.getAll(items.OBJ_PICKUP);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjFlag = function (id) {
        return this.getParsed(items.OBJ_FLAG, id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjFlag", {
        get: function () {
            return this.getAll(items.OBJ_FLAG);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjGameInfo = function (id) {
        return this.getParsed(items.OBJ_GAME_INFO, id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjGameInfo", {
        get: function () {
            return this.getAll(items.OBJ_GAME_INFO);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjGameData = function (id) {
        return this.getParsed(items.OBJ_GAME_DATA, id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjGameData", {
        get: function () {
            return this.getAll(items.OBJ_GAME_DATA);
        },
        enumerable: false,
        configurable: true
    });
    /** NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100 */
    SnapshotWrapper.prototype.getObjCharacterCore = function (player_id) {
        return this.getParsed(items.OBJ_CHARACTER_CORE, player_id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjCharacterCore", {
        /** NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100 */
        get: function () {
            return this.getAll(items.OBJ_CHARACTER_CORE);
        },
        enumerable: false,
        configurable: true
    });
    /** NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100 */
    SnapshotWrapper.prototype.getObjCharacter = function (player_id) {
        return this.getParsed(items.OBJ_CHARACTER, player_id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjCharacter", {
        /** NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100 */
        get: function () {
            return this.getAll(items.OBJ_CHARACTER);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjPlayerInfo = function (player_id) {
        return this.getParsed(items.OBJ_PLAYER_INFO, player_id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjPlayerInfo", {
        get: function () {
            return this.getAll(items.OBJ_PLAYER_INFO);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjClientInfo = function (player_id) {
        return this.getParsed(items.OBJ_CLIENT_INFO, player_id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjClientInfo", {
        get: function () {
            return this.getAll(items.OBJ_CLIENT_INFO);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjSpectatorInfo = function (player_id) {
        return this.getParsed(items.OBJ_SPECTATOR_INFO, player_id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjSpectatorInfo", {
        get: function () {
            return this.getAll(items.OBJ_SPECTATOR_INFO);
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getTypeId = function (name) {
        var _a;
        return ((_a = this._client.rawSnapUnpacker.uuid_manager.LookupName(name)) === null || _a === void 0 ? void 0 : _a.type_id) || -1;
    };
    SnapshotWrapper.prototype.getObjExMyOwnObject = function (id) {
        return this.getParsed(this.getTypeId("my-own-object@heinrich5991.de"), id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjExMyOwnObject", {
        get: function () {
            return this.getAll(this.getTypeId("my-own-object@heinrich5991.de"));
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjExDDNetCharacter = function (id) {
        return this.getParsed(this.getTypeId("character@netobj.ddnet.tw"), id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjExDDNetCharacter", {
        get: function () {
            return this.getAll(this.getTypeId("character@netobj.ddnet.tw"));
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjExGameInfo = function (id) {
        return this.getParsed(this.getTypeId("gameinfo@netobj.ddnet.tw"), id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjExGameInfo", {
        get: function () {
            return this.getAll(this.getTypeId("gameinfo@netobj.ddnet.tw"));
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjExDDNetProjectile = function (id) {
        return this.getParsed(this.getTypeId("projectile@netobj.ddnet.tw"), id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjExDDNetProjectile", {
        get: function () {
            return this.getAll(this.getTypeId("projectile@netobj.ddnet.tw"));
        },
        enumerable: false,
        configurable: true
    });
    SnapshotWrapper.prototype.getObjExLaser = function (id) {
        return this.getParsed(this.getTypeId("laser@netobj.ddnet.tw"), id);
    };
    Object.defineProperty(SnapshotWrapper.prototype, "AllObjExLaser", {
        get: function () {
            return this.getAll(this.getTypeId("laser@netobj.ddnet.tw"));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SnapshotWrapper.prototype, "OwnID", {
        get: function () {
            var _a;
            return (_a = this.AllObjPlayerInfo.find(function (parsed) { return parsed.local; })) === null || _a === void 0 ? void 0 : _a.client_id;
        },
        enumerable: false,
        configurable: true
    });
    return SnapshotWrapper;
}(stream_1.EventEmitter));
exports.SnapshotWrapper = SnapshotWrapper;
