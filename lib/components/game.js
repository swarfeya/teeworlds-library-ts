"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var MsgPacker_1 = require("../MsgPacker");
var NETMSGTYPE;
(function (NETMSGTYPE) {
    NETMSGTYPE[NETMSGTYPE["EX"] = 0] = "EX";
    NETMSGTYPE[NETMSGTYPE["SV_MOTD"] = 1] = "SV_MOTD";
    NETMSGTYPE[NETMSGTYPE["SV_BROADCAST"] = 2] = "SV_BROADCAST";
    NETMSGTYPE[NETMSGTYPE["SV_CHAT"] = 3] = "SV_CHAT";
    NETMSGTYPE[NETMSGTYPE["SV_KILLMSG"] = 4] = "SV_KILLMSG";
    NETMSGTYPE[NETMSGTYPE["SV_SOUNDGLOBAL"] = 5] = "SV_SOUNDGLOBAL";
    NETMSGTYPE[NETMSGTYPE["SV_TUNEPARAMS"] = 6] = "SV_TUNEPARAMS";
    NETMSGTYPE[NETMSGTYPE["SV_EXTRAPROJECTILE"] = 7] = "SV_EXTRAPROJECTILE";
    NETMSGTYPE[NETMSGTYPE["SV_READYTOENTER"] = 8] = "SV_READYTOENTER";
    NETMSGTYPE[NETMSGTYPE["SV_WEAPONPICKUP"] = 9] = "SV_WEAPONPICKUP";
    NETMSGTYPE[NETMSGTYPE["SV_EMOTICON"] = 10] = "SV_EMOTICON";
    NETMSGTYPE[NETMSGTYPE["SV_VOTECLEAROPTIONS"] = 11] = "SV_VOTECLEAROPTIONS";
    NETMSGTYPE[NETMSGTYPE["SV_VOTEOPTIONLISTADD"] = 12] = "SV_VOTEOPTIONLISTADD";
    NETMSGTYPE[NETMSGTYPE["SV_VOTEOPTIONADD"] = 13] = "SV_VOTEOPTIONADD";
    NETMSGTYPE[NETMSGTYPE["SV_VOTEOPTIONREMOVE"] = 14] = "SV_VOTEOPTIONREMOVE";
    NETMSGTYPE[NETMSGTYPE["SV_VOTESET"] = 15] = "SV_VOTESET";
    NETMSGTYPE[NETMSGTYPE["SV_VOTESTATUS"] = 16] = "SV_VOTESTATUS";
    NETMSGTYPE[NETMSGTYPE["CL_SAY"] = 17] = "CL_SAY";
    NETMSGTYPE[NETMSGTYPE["CL_SETTEAM"] = 18] = "CL_SETTEAM";
    NETMSGTYPE[NETMSGTYPE["CL_SETSPECTATORMODE"] = 19] = "CL_SETSPECTATORMODE";
    NETMSGTYPE[NETMSGTYPE["CL_STARTINFO"] = 20] = "CL_STARTINFO";
    NETMSGTYPE[NETMSGTYPE["CL_CHANGEINFO"] = 21] = "CL_CHANGEINFO";
    NETMSGTYPE[NETMSGTYPE["CL_KILL"] = 22] = "CL_KILL";
    NETMSGTYPE[NETMSGTYPE["CL_EMOTICON"] = 23] = "CL_EMOTICON";
    NETMSGTYPE[NETMSGTYPE["CL_VOTE"] = 24] = "CL_VOTE";
    NETMSGTYPE[NETMSGTYPE["CL_CALLVOTE"] = 25] = "CL_CALLVOTE";
    NETMSGTYPE[NETMSGTYPE["CL_ISDDNETLEGACY"] = 26] = "CL_ISDDNETLEGACY";
    NETMSGTYPE[NETMSGTYPE["SV_DDRACETIMELEGACY"] = 27] = "SV_DDRACETIMELEGACY";
    NETMSGTYPE[NETMSGTYPE["SV_RECORDLEGACY"] = 28] = "SV_RECORDLEGACY";
    NETMSGTYPE[NETMSGTYPE["UNUSED"] = 29] = "UNUSED";
    NETMSGTYPE[NETMSGTYPE["SV_TEAMSSTATELEGACY"] = 30] = "SV_TEAMSSTATELEGACY";
    NETMSGTYPE[NETMSGTYPE["CL_SHOWOTHERSLEGACY"] = 31] = "CL_SHOWOTHERSLEGACY";
    NETMSGTYPE[NETMSGTYPE["NUM"] = 32] = "NUM";
})(NETMSGTYPE || (NETMSGTYPE = {}));
;
var Game = /** @class */ (function () {
    function Game(_client) {
        // this.SendMsgEx = callback;
        this._client = _client;
        this._ping_resolve = function () { };
    }
    Game.prototype.send = function (packer) {
        var _a;
        if (!((_a = this._client.options) === null || _a === void 0 ? void 0 : _a.lightweight))
            this._client.QueueChunkEx(packer);
        else
            this._client.SendMsgEx(packer);
    };
    Game.prototype.Say = function (message, team) {
        if (team === void 0) { team = false; }
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_SAY, false, 1);
        packer.AddInt(team ? 1 : 0); // team
        packer.AddString(message);
        this.send(packer);
    };
    /** Set the team of an bot. (-1 spectator team, 0 team red/normal team, 1 team blue) */
    Game.prototype.SetTeam = function (team) {
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_SETTEAM, false, 1);
        packer.AddInt(team);
        this.send(packer);
    };
    /** Spectate an player, taking their id as parameter. pretty useless */
    Game.prototype.SpectatorMode = function (SpectatorID) {
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_SETSPECTATORMODE, false, 1);
        packer.AddInt(SpectatorID);
        this.send(packer);
    };
    /** Change the player info */
    Game.prototype.ChangePlayerInfo = function (playerInfo) {
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_CHANGEINFO, false, 1);
        packer.AddString(playerInfo.name);
        packer.AddString(playerInfo.clan);
        packer.AddInt(playerInfo.country);
        packer.AddString(playerInfo.skin);
        packer.AddInt(playerInfo.use_custom_color ? 1 : 0);
        packer.AddInt(playerInfo.color_body);
        packer.AddInt(playerInfo.color_feet);
        this.send(packer);
    };
    /** Kill */
    Game.prototype.Kill = function () {
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_KILL, false, 1);
        this.send(packer);
    };
    /** Send emote */
    Game.prototype.Emote = function (emote) {
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_EMOTICON, false, 1);
        packer.AddInt(emote);
        this.send(packer);
    };
    /** Vote for an already running vote (true = f3 /  false = f4) */
    Game.prototype.Vote = function (vote) {
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_VOTE, false, 1);
        packer.AddInt(vote ? 1 : -1);
        this.send(packer);
    };
    Game.prototype.CallVote = function (Type, Value, Reason) {
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_CALLVOTE, false, 1);
        packer.AddString(Type);
        packer.AddString(String(Value));
        packer.AddString(Reason);
        this.send(packer);
    };
    /** Call a vote for an server option (for example ddnet maps) */
    Game.prototype.CallVoteOption = function (Value, Reason) {
        this.CallVote("option", Value, Reason);
    };
    /** Call a vote to kick a player. Requires the player id */
    Game.prototype.CallVoteKick = function (PlayerID, Reason) {
        this.CallVote("kick", PlayerID, Reason);
    };
    /** Call a vote to set a player in spectator mode. Requires the player id */
    Game.prototype.CallVoteSpectate = function (PlayerID, Reason) {
        this.CallVote("spectate", PlayerID, Reason);
    };
    /** probably some verification of using ddnet client. */
    Game.prototype.IsDDNetLegacy = function () {
        var packer = new MsgPacker_1.MsgPacker(NETMSGTYPE.CL_ISDDNETLEGACY, false, 1);
        this.send(packer);
    };
    /** returns the ping in ms (as a promise) */
    Game.prototype.Ping = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var packer = new MsgPacker_1.MsgPacker(22, true, 0);
            var startTime = new Date().getTime();
            _this.send(packer);
            var callback = function (_time) {
                resolve(_time - startTime);
                _this._ping_resolve = function () { };
            };
            _this._ping_resolve = callback;
        });
    };
    return Game;
}());
exports.Game = Game;
