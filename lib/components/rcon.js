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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rcon = void 0;
var stream_1 = require("stream");
var MsgPacker_1 = require("../MsgPacker");
var MsgUnpacker_1 = require("../MsgUnpacker");
var Rcon = /** @class */ (function (_super) {
    __extends(Rcon, _super);
    function Rcon(_client) {
        var _this = _super.call(this) || this;
        _this.CommandList = [];
        _this._client = _client;
        return _this;
    }
    Rcon.prototype.on = function (event, listener) {
        return _super.prototype.on.call(this, event, listener);
    };
    Rcon.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return _super.prototype.emit.apply(this, __spreadArray([event], args, false));
    };
    // SendMsgEx: (Msgs: MsgPacker[] | MsgPacker) => void;
    Rcon.prototype.send = function (packer) {
        var _a;
        if (!((_a = this._client.options) === null || _a === void 0 ? void 0 : _a.lightweight))
            this._client.QueueChunkEx(packer);
        else
            this._client.SendMsgEx(packer);
    };
    /** Rcon auth, set the `username` to empty string for authentication w/o username **/
    Rcon.prototype.auth = function (usernameOrPassword, password) {
        var rconAuthMsg = new MsgPacker_1.MsgPacker(18 /* NETMSG.System.NETMSG_RCON_AUTH */, true, 1);
        if (password == undefined) {
            rconAuthMsg.AddString("");
            rconAuthMsg.AddString(usernameOrPassword);
        }
        else {
            rconAuthMsg.AddString(usernameOrPassword);
            rconAuthMsg.AddString(password);
        }
        rconAuthMsg.AddInt(1);
        this.send(rconAuthMsg);
    };
    /** Send rcon command **/
    Rcon.prototype.rcon = function (cmds) {
        var _cmds;
        if (cmds instanceof Array)
            _cmds = cmds;
        else
            _cmds = [cmds];
        var msgs = [];
        _cmds.forEach(function (cmd) {
            var rconCmdMsg = new MsgPacker_1.MsgPacker(17 /* NETMSG.System.NETMSG_RCON_CMD */, true, 1);
            rconCmdMsg.AddString(cmd);
            msgs.push(rconCmdMsg);
        });
        this.send(msgs);
    };
    /** This method is called by the Client to handle the chunks. It should not be called directly. */
    Rcon.prototype._checkChunks = function (chunk) {
        if (chunk.msgid == 11 /* NETMSG.System.NETMSG_RCON_LINE */) {
            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
            var msg = unpacker.unpackString();
            this.emit('rcon_line', msg);
        }
        else if (chunk.msgid == 10 /* NETMSG.System.NETMSG_RCON_AUTH_STATUS */) {
            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
            var AuthLevel = unpacker.unpackInt();
            var ReceiveCommands = unpacker.unpackInt();
            this.emit('rcon_auth_status', { AuthLevel: AuthLevel, ReceiveCommands: ReceiveCommands });
        }
        else if (chunk.msgid == 25 /* NETMSG.System.NETMSG_RCON_CMD_ADD */) {
            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
            var command = unpacker.unpackString();
            var description = unpacker.unpackString();
            var params = unpacker.unpackString();
            this.CommandList.push({ command: command, description: description, params: params });
            this.emit('rcon_cmd_add', { command: command, description: description, params: params });
        }
        else if (chunk.msgid == 26 /* NETMSG.System.NETMSG_RCON_CMD_REM */) {
            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
            var command_1 = unpacker.unpackString();
            this.emit('rcon_cmd_rem', { command: command_1 });
            var index = this.CommandList.findIndex(function (a) { return a.command == command_1; });
            if (index - 1 >= 0)
                this.CommandList.splice(index, 1);
        }
        else {
            return false;
        }
        return true;
    };
    return Rcon;
}(stream_1.EventEmitter));
exports.Rcon = Rcon;
