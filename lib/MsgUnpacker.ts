const decoder = new TextDecoder('utf-8');
export function unpackInt(pSrc: number[]): {result: number, remaining: number[]} {
	
	var srcIndex = 0;
	const sign = ((pSrc[srcIndex] >> 6) & 1)
	
	var result = (pSrc[srcIndex] & 0b0011_1111)
	while (srcIndex <= 4) {
		
		if ((pSrc[srcIndex] & 0b1000_0000) === 0)
			break;

		srcIndex++;
		result |= ((pSrc[srcIndex] & 0b0111_1111)) << (6+7*(srcIndex-1))
		
	}
	result ^= -sign;
	
	return {result, remaining: pSrc.slice(srcIndex+1)};
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
