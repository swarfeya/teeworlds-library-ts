export class MsgPacker {
	result: Buffer;
	sys: boolean;
	constructor(msg: number, sys: boolean) {
		this.result = Buffer.from([2*msg + (sys ? 1 : 0)]);
		this.sys = sys;
	}
	AddString(str: string) {
		this.result = Buffer.concat([this.result, Buffer.from(str), Buffer.from([0x00])])
	}
	AddBuffer(buffer: Buffer) {
		this.result = Buffer.concat([this.result, buffer]) 
	}
	AddInt(i: number) {
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
				pDst |= (Number(i != 0)) << 7
				result.push(pDst)
				if (!i)
					break;
			}
		} else
			result.push(pDst)

		this.result = Buffer.concat([this.result, Buffer.from(result)]) 
	}
	get size() {
		return this.result.byteLength;
	}
	get buffer() {
		return this.result
	}
}
