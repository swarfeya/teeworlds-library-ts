"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgPacker = void 0;
var MsgPacker = /** @class */ (function () {
    function MsgPacker(msg, sys, flag) {
        this.result = Buffer.from([2 * msg + (sys ? 1 : 0)]);
        this.sys = sys;
        this.flag = flag;
    }
    MsgPacker.prototype.AddString = function (str) {
        this.result = Buffer.concat([this.result, Buffer.from(str), Buffer.from([0x00])]);
    };
    MsgPacker.prototype.AddBuffer = function (buffer) {
        this.result = Buffer.concat([this.result, buffer]);
    };
    MsgPacker.prototype.AddInt = function (i) {
        var result = [];
        var pDst = (i >> 25) & 0x40;
        var i = i ^ (i >> 31);
        pDst |= i & 0x3f;
        i >>= 6;
        if (i) {
            pDst |= 0x80;
            result.push(pDst);
            while (true) {
                pDst++;
                pDst = i & (0x7f);
                i >>= 7;
                pDst |= (Number(i != 0)) << 7;
                result.push(pDst);
                if (!i)
                    break;
            }
        }
        else
            result.push(pDst);
        this.result = Buffer.concat([this.result, Buffer.from(result)]);
    };
    Object.defineProperty(MsgPacker.prototype, "size", {
        get: function () {
            return this.result.byteLength;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MsgPacker.prototype, "buffer", {
        get: function () {
            return this.result;
        },
        enumerable: false,
        configurable: true
    });
    return MsgPacker;
}());
exports.MsgPacker = MsgPacker;
