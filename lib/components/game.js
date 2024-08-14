"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var MsgPacker_1 = require("../MsgPacker");
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
        var packer = new MsgPacker_1.MsgPacker(17 /* NETMSG.Game.CL_SAY */, false, 1);
        packer.AddInt(team ? 1 : 0); // team
        packer.AddString(message);
        this.send(packer);
    };
    /** Set the team of an bot. (-1 spectator team, 0 team red/normal team, 1 team blue) */
    Game.prototype.SetTeam = function (team) {
        var packer = new MsgPacker_1.MsgPacker(18 /* NETMSG.Game.CL_SETTEAM */, false, 1);
        packer.AddInt(team);
        this.send(packer);
    };
    /** Spectate an player, taking their id as parameter. pretty useless */
    Game.prototype.SpectatorMode = function (SpectatorID) {
        var packer = new MsgPacker_1.MsgPacker(19 /* NETMSG.Game.CL_SETSPECTATORMODE */, false, 1);
        packer.AddInt(SpectatorID);
        this.send(packer);
    };
    /** Change the player info */
    Game.prototype.ChangePlayerInfo = function (playerInfo) {
        var packer = new MsgPacker_1.MsgPacker(21 /* NETMSG.Game.CL_CHANGEINFO */, false, 1);
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
        var packer = new MsgPacker_1.MsgPacker(22 /* NETMSG.Game.CL_KILL */, false, 1);
        this.send(packer);
    };
    /** Send emote */
    Game.prototype.Emote = function (emote) {
        var packer = new MsgPacker_1.MsgPacker(23 /* NETMSG.Game.CL_EMOTICON */, false, 1);
        packer.AddInt(emote);
        this.send(packer);
    };
    /** Vote for an already running vote (true = f3 /  false = f4) */
    Game.prototype.Vote = function (vote) {
        var packer = new MsgPacker_1.MsgPacker(24 /* NETMSG.Game.CL_VOTE */, false, 1);
        packer.AddInt(vote ? 1 : -1);
        this.send(packer);
    };
    Game.prototype.CallVote = function (Type, Value, Reason) {
        var packer = new MsgPacker_1.MsgPacker(25 /* NETMSG.Game.CL_CALLVOTE */, false, 1);
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
        var packer = new MsgPacker_1.MsgPacker(26 /* NETMSG.Game.CL_ISDDNETLEGACY */, false, 1);
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
