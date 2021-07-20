class MsgPacker {
	constructor(msg, sys) {
		this.result = Buffer.from([msg*2+sys]) // booleans turn into int automatically. 
		this.sys = sys;
	}
	AddString(str) {
		this.result = Buffer.concat([this.result, Buffer.from(str), Buffer.from([0x00])])
	}
	AddBuffer(buffer) {
		this.result = Buffer.concat([this.result, buffer]) 
	}
	AddInt(i) {
		var result = []
		var pDst = (i >> 25) & 0x40
		var i = i ^(i>>31)
		pDst |= i & 0x3f
		i >>= 6
		if (i) {
			pDst |= 0x80
			result.push(pDst)
			while (true) {
				pDst++;
				pDst = i & (0x7f)
				i>>= 7;
				pDst |= (i != 0) << 7
				result.push(pDst)
				if (!i)
					break;
			}
		} else
			result.push(pDst)

			// ... i'll just stop trying to understand.
		
		this.result = Buffer.concat([this.result, Buffer.from(result)]) 
	}
	get size() {
		return this.result.byteLength;
	}
	get buffer() {
		return this.result
	}
}
module.exports = MsgPacker;