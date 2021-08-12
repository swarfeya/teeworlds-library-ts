const MsgUnpacker = require('./MsgUnpacker')
const idk = require('./idk')
console.log(idk.ClientInfo)
// var unpacker = new MsgUnpacker(undefined, undefined);
// console.log("test");
a = Buffer.from("007465737400", 'hex').toJSON().data
// MsgUnpacker.prototype.unpackInt
a = MsgUnpacker.prototype.unpackInt(a)
// for (let i = 0; i < 1; i++) {
	console.log(a.result)
	// a = MsgUnpacker.prototype.unpackInt(a.remaining)
// }
console.log(a)
a = MsgUnpacker.prototype.unpackString(a.remaining)
console.log(a)
console.log(Buffer.from(a.result).toString())
// console.log(MsgUnpacker.prototype.unpackInt([0x07, 0x06, 0xf3, 0x90]))
// console.log(unpacker.unpackInt