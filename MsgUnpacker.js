var types = {
	"team": {min: -2, max: 3},
	"client_id": {min: -1, max: 63}, 
	"message": String(),
}
var messages = {"SV_CHAT": ["team", "client_id", "message"]}
function getBytes(msg) {
	if (msg.min >= -128 && msg.max <= 127)
		return 1;
	else if (msg.min >= -32768 && msg.max <= 32767)
		return 2;
	else if (msg.min >= -2147483648 && msg.max <= 2147483647)
		return 4;

}
class MsgUnpacker {
	constructor(msg, raw=Buffer.from()) {
		// this.result = Buffer.from([msg*2+sys]) // booleans turn into int automatically. 
		// this.sys = sys;
		// this["test"] = 123
		for (let i = 0; i < messages[msg].length; i++) {
			var message = messages[msg][i]
			if (types[message].min && types[message].max) {
				// console.log(getBytes(types[message]))
				// console.log(message, raw.slice(0, getBytes(types[message])))
				this[message] = this.unpackInt(raw.slice(0, getBytes(types[message])).toJSON().data);
				raw = raw.slice(getBytes(types[message]))
			} else if (typeof types[message] == "string" || types[message] instanceof String) {
				this[message] = raw.slice(0, raw.indexOf(0x00)).toString()
				// console.log("String", raw.indexOf(0x00), raw.slice(0, raw.indexOf(0x00)))
				raw = raw.slice(raw.indexOf(0x00)+1); // also remove 00 (+1)
			}
			// console.log(messages[msg][i], types[message], raw)
		}
	}
	unpackInt(pSrc) {
		var Sign = pSrc >> 6
		var pInOut = pSrc & 0x3f
	
		do {
			// console.log(pSrc, Sign, pInOut)
			if (!(pSrc & 0x80))
				break;
			pSrc.slice(1);
			pInOut |= (pSrc[0] & 0x7F) << (6+7)
			// console.log(pSrc, Sign, pInOut)
			if (!(pSrc[0] & 0x80))
				break;
			pSrc.slice(1);
			pInOut |= (pSrc[0] & (0x7F)) << (6 + 7*1);
			// console.log(pSrc, Sign, pInOut)
			if (!(pSrc[0] & 0x80))
				break;
			pSrc.slice(1);
			pInOut |= (pSrc[0] & (0x7F)) << (6 + 7*2);
			// console.log(pSrc, Sign, pInOut)
			if (!(pSrc[0] & 0x80))
				break;
			pSrc.slice(1);
			pInOut |= (pSrc[0] & 0x7F) << (6 + 7*3)
			// console.log(pSrc, Sign, pInOut)
		} while (0)
		pInOut ^= -Sign;
		return pInOut;
	}
}
// a = new MsgUnpacker("SV_CHAT", Buffer.from("0040276e616d656c657373207465652720656e746572656420616e64206a6f696e6564207468652067616d6500", "hex"))
// console.log(a)
// console.log()
// console.log()
module.exports = MsgUnpacker;