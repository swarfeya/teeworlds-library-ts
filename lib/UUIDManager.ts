import { createHash } from 'crypto'; 
export const createTwMD5Hash = (name: string) => { // https://github.com/ddnet/ddnet/blob/6d9284adc1e0be4b5348447d857eae575e06e654/src/engine/shared/uuid_manager.cpp#L26
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
	offset: number;
	snapshot: boolean; // snapshot uuids count the index from back (32767, 32766, ..), while normal uuids count with increasing type id (65536, 65537, 65538, ..) 
	constructor(pOffset = 65536, pSnapshot = false) {
		this.offset = pOffset;
		this.snapshot = pSnapshot;
	}

	LookupUUID(hash: Buffer) {
		return this.uuids.find( a => a.hash.compare(hash) == 0 );
	}
	LookupName(name: string) {
		return this.uuids.find( a => a.name === name );
	}

	LookupType(ID: number) {
		if (!this.snapshot) {
			return this.uuids[ID - this.offset]
		} else {
			return this.uuids.find( a => a.type_id == ID);
		}
	}
	RegisterName(name: string, type_id = this.offset - this.uuids.length) {
		this.uuids.push({
			name, hash: createTwMD5Hash(name), type_id
		});

	}

}