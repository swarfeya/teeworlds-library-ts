var decoder = new TextDecoder('utf-8');
function unpackInt(pSrc: number[]): {result: number, remaining: number[]} {
	var result = 0;
	var len = 1;
	
	var iter = pSrc[Symbol.iterator]()
	var src: any = iter.next()
	// if (src.done)
		// console.warn("Unexpected end", src)
	src = src.value
	var sign = ((src >> 6) & 1)
	
	result |= (src & 0b0011_1111)
	for (let i = 0; i < 4; i++) {
		
		if ((src & 0b1000_0000) == 0)
			break;
		src = iter.next()

		// console.log(src & 0b1000_0000)
		// if (src.done)
		// console.warn("Unexpected end", src);
		src = src.value
		len += 1;
		if (i == 3 && (src & 0b1111_0000) != 0)
			console.warn("NonZeroIntPadding")
		result |= ((src & 0b0111_1111)) << (6+7*i)
		
	}
	if (len > 1 && src == 0b0000_0000) {
		console.warn("OverlongIntEncoding")
	}
	result ^= -sign;
	
	return {result, remaining: Array.from(iter)};
}
function unpackString(pSrc: number[]): {result: string, remaining: number[]} {
	var result = pSrc.slice(0, pSrc.indexOf(0))
	pSrc = pSrc.slice(pSrc.indexOf(0), pSrc.length)
	return {result: decoder.decode(new Uint8Array(result)), remaining: pSrc}
}


export = {unpackInt, unpackString};