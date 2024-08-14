"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgUnpacker = exports.unpackString = exports.unpackInt = void 0;
var decoder = new TextDecoder('utf-8');
function unpackInt(pSrc) {
    var srcIndex = 0;
    var sign = ((pSrc[srcIndex] >> 6) & 1);
    var result = (pSrc[srcIndex] & 63);
    while (srcIndex <= 4) {
        if ((pSrc[srcIndex] & 128) === 0)
            break;
        srcIndex++;
        result |= ((pSrc[srcIndex] & 127)) << (6 + 7 * (srcIndex - 1));
    }
    result ^= -sign;
    return { result: result, remaining: pSrc.slice(srcIndex + 1) };
}
exports.unpackInt = unpackInt;
function unpackString(pSrc) {
    var result = pSrc.slice(0, pSrc.indexOf(0));
    pSrc = pSrc.slice(pSrc.indexOf(0) + 1, pSrc.length);
    return { result: decoder.decode(new Uint8Array(result)), remaining: pSrc };
}
exports.unpackString = unpackString;
var MsgUnpacker = /** @class */ (function () {
    function MsgUnpacker(pSrc) {
        this.remaining = pSrc;
    }
    MsgUnpacker.prototype.unpackInt = function () {
        // let unpacked;
        // if (!_unpacked)  {
        var unpacked = unpackInt(this.remaining);
        this.remaining = unpacked.remaining;
        // } else {
        // unpacked = {result: this.remaining[0]};
        // this.remaining = this.remaining.slice(1);
        // }
        return unpacked.result;
    };
    MsgUnpacker.prototype.unpackString = function () {
        var unpacked = unpackString(this.remaining);
        this.remaining = unpacked.remaining;
        return unpacked.result;
    };
    /** @param size - size in bytes */
    MsgUnpacker.prototype.unpackRaw = function (size) {
        var unpacked = this.remaining.slice(0, size);
        this.remaining = this.remaining.slice(size);
        return unpacked;
    };
    return MsgUnpacker;
}());
exports.MsgUnpacker = MsgUnpacker;
