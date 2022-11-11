import { createHash } from 'crypto'; 
const createTwMD5Hash = (name: string) => { // https://github.com/ddnet/ddnet/blob/6d9284adc1e0be4b5348447d857eae575e06e654/src/engine/shared/uuid_manager.cpp#L26
	let hash = createHash("md5")
		.update(Buffer.from([0xe0, 0x5d, 0xda, 0xaa, 0xc4, 0xe6, 0x4c, 0xfb, 0xb6, 0x42, 0x5d, 0x48, 0xe8, 0x0c, 0x00, 0x29]))
		.update(name)
		.digest()
	hash[6] &= 0x0f;
	hash[6] |= 0x30;
	hash[8] &= 0x3f;
	hash[8] |= 0x80;	
	return hash;
}

// [{name: string, hash: Buffer}, ..]
export class UUIDManager {
	uuids: {name: string, hash: Buffer, type_id: number}[] = [];
	index = 0;

	LookupUUID(hash: Buffer) {
		return this.uuids.find( a => a.hash.compare(hash) == 0 );
	}
	LookupName(name: string) {
		return this.uuids.find( a => a.name === name );
	}

	LookupType(ID: number) {
		return this.uuids[ID - 65536]
	}
	RegisterName(name: string) {
		
		this.uuids.push({
			name, hash: createTwMD5Hash(name), type_id: 65536 + this.uuids.length
		});
	}

}