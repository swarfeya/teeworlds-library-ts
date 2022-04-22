const decoder = new TextDecoder('utf-8');
export function unpackInt(pSrc: number[]): {result: number, remaining: number[]} {
	var result = 0;
	
	var iter = pSrc[Symbol.iterator]()
	var src: any = iter.next()
	src = src.value
	var sign = ((src >> 6) & 1)
	
	result |= (src & 0b0011_1111)
	for (let i = 0; i < 4; i++) {
		
		if ((src & 0b1000_0000) === 0)
			break;
		src = iter.next()

		src = src.value;
		result |= ((src & 0b0111_1111)) << (6+7*i)
		
	}
	result ^= -sign;
	
	return {result, remaining: Array.from(iter)};
}
export function unpackString(pSrc: number[]): {result: string, remaining: number[]} {
	var result = pSrc.slice(0, pSrc.indexOf(0))
	pSrc = pSrc.slice(pSrc.indexOf(0), pSrc.length)
	return {result: decoder.decode(new Uint8Array(result)), remaining: pSrc}
}

export class MsgUnpacker {
	remaining: number[];
	constructor(pSrc: number[]) {
		this.remaining = pSrc;
	}

	unpackInt(_unpacked = false): number {
		let unpacked;
		if (!_unpacked)  {
			unpacked = unpackInt(this.remaining);
			this.remaining = unpacked.remaining;
		} else {
			unpacked = {result: this.remaining[0]};
			this.remaining = this.remaining.slice(1);

		}
		return unpacked.result;
	}

	unpackString(): string {
		let unpacked = unpackString(this.remaining);
		this.remaining = unpacked.remaining;
		return unpacked.result;
	}
}
