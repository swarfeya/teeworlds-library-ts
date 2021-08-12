"use strict";
var types = {
    "team": { min: -2, max: 3 },
    "client_id": { min: -1, max: 63 },
    "message": String(),
    "Input_pred_tick": 4,
    "Time_left": 4,
    "Input_size": 1,
    "Tick": 4,
    "Delta_tick": 1,
    "Crc": 5,
};
var messages = {
    "SV_CHAT": ["team", "client_id", "message"],
    "INPUT": ["Input_pred_tick", "Time_left", "Input_size"],
    "SNAP_SINGLE": ["Tick", "Delta_tick", "Crc"],
    "INPUT_TIMING": ["Input_pred_tick", "Time_left"],
    "SNAP": ["Tick", "Delta_tick", "Num_parts", "Part", "Crc"],
};
function getBytes(msg) {
    if (msg.min >= -128 && msg.max <= 127)
        return 1;
    else if (msg.min >= -32768 && msg.max <= 32767)
        return 2;
    else if (msg.min >= -2147483648 && msg.max <= 2147483647)
        return 4;
}
var MsgUnpacker = /** @class */ (function () {
    function MsgUnpacker(msg, raw) {
        // this.result = Buffer.from([msg*2+sys]) // booleans turn into int automatically. 
        // this.sys = sys;
        for (var i = 0; i < messages[msg].length; i++) {
            var message = messages[msg][i];
            if (types[message].min && types[message].max) {
                // console.log(getBytes(types[message]))
                // console.log(message, raw.slice(0, getBytes(types[message])))
                this[message] = this.unpackInt(raw.slice(0, getBytes(types[message])).toJSON().data);
                raw = raw.slice(getBytes(types[message]));
            }
            else if (typeof types[message] == "string" || types[message] instanceof String) {
                this[message] = raw.slice(0, raw.indexOf(0x00)).toString();
                // console.log("String", raw.indexOf(0x00), raw.slice(0, raw.indexOf(0x00)))
                raw = raw.slice(raw.indexOf(0x00) + 1); // also remove 00 (+1)
            }
            // console.log(messages[msg][i], types[message], raw)
        }
    }
    MsgUnpacker.prototype.unpackInt = function (pSrc) {
        var result = 0;
        var len = 1;
        var iter = pSrc[Symbol.iterator]();
        var src = iter.next();
        // if (src.done)
        // console.warn("Unexpected end", src)
        src = src.value;
        var sign = ((src >> 6) & 1);
        result |= (src & 63);
        for (var i = 0; i < 4; i++) {
            if ((src & 128) == 0)
                break;
            // console.log(src & 0b1000_0000)
            src = iter.next();
            // if (src.done)
            // console.warn("Unexpected end", src);
            src = src.value;
            len += 1;
            if (i == 3 && (src & 240) != 0)
                console.warn("NonZeroIntPadding");
            result |= ((src & 127)) << (6 + 7 * i);
        }
        if (len > 1 && src == 0) {
            console.warn("OverlongIntEncoding");
        }
        result ^= -sign;
        return { result: result, remaining: Array.from(iter) };
    };
    MsgUnpacker.prototype.unpackString = function (pSrc) {
        var result = pSrc.slice(0, pSrc.indexOf(0));
        pSrc = pSrc.slice(pSrc.indexOf(0), pSrc.length);
        return { result: result, remaining: pSrc };
    };
    return MsgUnpacker;
}());
module.exports = MsgUnpacker;
// module.exports = MsgUnpacker;
