import { UUIDManager, createTwMD5Hash } from "./UUIDManager";
import { Client } from "./client";
import { MsgUnpacker } from "./MsgUnpacker";
import { SnapshotItemTypes, DeltaItem, DDNetItem, Item } from "./snapshots";
var decoder = new TextDecoder('utf-8');

const ___itemAppendix: {"type_id": number, "size": number, "name": string}[] = [ // only used for the events underneath. the actual itemAppendix below this is only used for size
	{"type_id": 0, "size": 0, "name": "obj_ex"},
	{"type_id": 1, "size": 10, "name": "obj_player_input"},
	{"type_id": 2, "size": 6, "name": "obj_projectile"},
	{"type_id": 3, "size": 5, "name": "obj_laser"},
	{"type_id": 4, "size": 4, "name": "obj_pickup"},
	{"type_id": 5, "size": 3, "name": "obj_flag"},
	{"type_id": 6, "size": 8, "name": "obj_game_info"},
	{"type_id": 7, "size": 4, "name": "obj_game_data"},
	{"type_id": 8, "size": 15, "name": "obj_character_core"},
	{"type_id": 9, "size": 22, "name": "obj_character"},
	{"type_id": 10, "size": 5, "name": "obj_player_info"},
	{"type_id": 11, "size": 17, "name": "obj_client_info"},
	{"type_id": 12, "size": 3, "name": "obj_spectator_info"},
	{"type_id": 13, "size": 2, "name": "common"}, // event_common
	{"type_id": 14, "size": 2, "name": "explosion"}, // event_explosion
	{"type_id": 15, "size": 2, "name": "spawn"}, // event_spawn
	{"type_id": 16, "size": 2, "name": "hammerhit"}, // event_hammerhit
	{"type_id": 17, "size": 3, "name": "death"}, // event_death
	{"type_id": 18, "size": 3, "name": "sound_global"}, // event_sound_global
	{"type_id": 19, "size": 3, "name": "sound_world"}, // event_sound_world
	{"type_id": 20, "size": 3, "name": "damage_indicator"} // event_damage_indicator
]
const itemAppendix: number[] = [
	0,
	10,
	6,
	5,
	4,
	3,
	8,
	4,
	15,
	22,
	5,
	17,
	3,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
]

export enum items {
	OBJ_EX,
	OBJ_PLAYER_INPUT,
	OBJ_PROJECTILE,
	OBJ_LASER,
	OBJ_PICKUP,
	OBJ_FLAG,
	OBJ_GAME_INFO,
	OBJ_GAME_DATA,
	OBJ_CHARACTER_CORE,
	OBJ_CHARACTER,
	OBJ_PLAYER_INFO,
	OBJ_CLIENT_INFO,
	OBJ_SPECTATOR_INFO,
	EVENT_COMMON,
	EVENT_EXPLOSION,
	EVENT_SPAWN,
	EVENT_HAMMERHIT,
	EVENT_DEATH,
	EVENT_SOUND_GLOBAL,
	EVENT_SOUND_WORLD,
	EVENT_DAMAGE_INDICATOR
}

interface eSnap {
	Snapshot: {Key: number, Data: number[]},
	ack: number,
}

// https://github.com/ddnet/ddnet/blob/571b0b36de83d18f2524ee371fc3223d04b94135/datasrc/network.py#L236
let supported_uuids = [
	"my-own-object@heinrich5991.de",
	"character@netobj.ddnet.tw", // validate_size=False
	"player@netobj.ddnet.tw",
	"gameinfo@netobj.ddnet.tw", // validate_size=False
	"projectile@netobj.ddnet.tw",
	"laser@netobj.ddnet.tw",
]

export class Snapshot {
	deltas: DeltaItem[] = [];
	eSnapHolder: eSnap[] = [];
	crc_errors: number = 0;
	client: Client;
	uuid_manager: UUIDManager = new UUIDManager(32767, true); // snapshot max_type

	constructor(_client: Client) {
		this.client = _client;
	}
	
	private IntsToStr(pInts: number[]): string {
		var pIntz: number[] = [];
		// var pStr = ''
		for (let x of pInts) {
			// pStr += String.fromCharCode((((x) >> 24) & 0xff) - 128);
			pIntz.push((((x) >> 24) & 0xff) - 128);
			// pStr += String.fromCharCode((((x) >> 16) & 0xff) - 128);
			pIntz.push((((x) >> 16) & 0xff) - 128);
			// pStr += String.fromCharCode((((x) >> 8) & 0xff) - 128);
			pIntz.push((((x) >> 8) & 0xff) - 128);
			// pStr += String.fromCharCode(((x) & 0xff) - 128);
			pIntz.push(((x) & 0xff) - 128);
		}
		pIntz.splice(-1, 1)
		let pStr = decoder.decode(new Uint8Array(pIntz));

    	pStr = pStr.replace(/\0.*/g, ''); // Remove content from first null char to end.
		return pStr;
	}
	private parseItem(data: number[], Type: number, id: number): Item | DDNetItem {
		var _item = {} as Item | DDNetItem; 
		if (Type >= 0x4000) { // offset uuid type
			if (this.uuid_manager.LookupType(Type)?.name == "my-own-object@heinrich5991.de") {
				_item = {
					m_Test: data[0]
				} as SnapshotItemTypes.MyOwnObject;
			} else if (this.uuid_manager.LookupType(Type)?.name == "character@netobj.ddnet.tw") {
				_item = {
					m_Flags: data[0],
					m_FreezeEnd: data[1],
					m_Jumps: data[2],
					m_TeleCheckpoint: data[3],
					m_StrongWeakID: data[4],
			
					// # New data fields for jump display, freeze bar and ninja bar
					// # Default values indicate that these values should not be used
					m_JumpedTotal: data[5] ?? null,
					m_NinjaActivationTick: data[6] ?? null,
					m_FreezeStart: data[7] ?? null,
					// # New data fields for improved target accuracy
					m_TargetX: data[8] ?? null,
					m_TargetY: data[9] ?? null,
					id: id
			
				} as SnapshotItemTypes.DDNetCharacter;
			} 
			else if (this.uuid_manager.LookupType(Type)?.name == "player@netobj.ddnet.tw") {
				_item = {
					m_Flags: data[0],
					m_AuthLevel: data[1],
					id: id
				} as SnapshotItemTypes.DDNetPlayer
			} 
			else if (this.uuid_manager.LookupType(Type)?.name == "gameinfo@netobj.ddnet.tw") {
				_item = {
					m_Flags: data[0],
					m_Version: data[1],
					m_Flags2: data[2]
				} as SnapshotItemTypes.GameInfoEx
			} 
			else if (this.uuid_manager.LookupType(Type)?.name == "projectile@netobj.ddnet.tw") {
				_item = {
					m_X: data[0],
					m_Y: data[1],
					m_Angle: data[2],
					m_Data: data[3],
					m_Type: data[3],
					m_StartTick: data[3]
				} as SnapshotItemTypes.DDNetProjectile
			} 
			else if (this.uuid_manager.LookupType(Type)?.name == "laser@netobj.ddnet.tw") {
				_item = {
					m_ToX: data[0],
					m_ToY: data[1],
					m_FromX: data[2],
					m_FromY: data[3],
					m_Owner: data[3],
					m_Type: data[3]
				} as SnapshotItemTypes.DDNetLaser
			} 
			return _item;
		}
		switch (Type) {
			case items.OBJ_EX:
				break;
			case items.OBJ_PLAYER_INPUT:
				_item = {
					direction: data[0],
					target_x: data[1],
					target_y: data[2],
					jump: data[3],
					fire: data[4],
					hook: data[5],
					player_flags: data[6],
					wanted_weapon: data[7],
					next_weapon: data[8],
					prev_weapon: data[9],
				} as SnapshotItemTypes.PlayerInput
				break;
			case items.OBJ_PROJECTILE:
				_item = {
					x: data[0],
					y: data[1],
					vel_x: data[2],
					vel_y: data[3],
					type_: data[4],
					start_tick: data[5],
				} as SnapshotItemTypes.Projectile 
				break;
			case items.OBJ_LASER:
				_item = {
					x: data[0],
					y: data[1],
					from_x: data[2],
					from_y: data[3],
					start_tick: data[4],
				} as SnapshotItemTypes.Laser
				break;
			case items.OBJ_PICKUP:
				_item = {
					x: data[0],
					y: data[1],
					type_: data[2],
					subtype: data[3],
				} as SnapshotItemTypes.Pickup
				break;
			case items.OBJ_FLAG:
				_item = {
					x: data[0],
					y: data[1],
					team: data[2],
				} as SnapshotItemTypes.Flag
				break;
			case items.OBJ_GAME_INFO:
				_item = {
					game_flags: data[0],
					game_state_flags: data[1],
					round_start_tick: data[2],
					warmup_timer: data[3],
					score_limit: data[4],
					time_limit: data[5],
					round_num: data[6],
					round_current: data[7],

				} as SnapshotItemTypes.GameInfo
				break; 
			case items.OBJ_GAME_DATA:
				_item = {
					teamscore_red: data[0],
					teamscore_blue: data[1],
					flag_carrier_red: data[2],
					flag_carrier_blue: data[3],
				} as SnapshotItemTypes.GameData
				break;
			case items.OBJ_CHARACTER_CORE:
				_item = {
					tick: data[0],
					x: data[1],
					y: data[2],
					vel_x: data[3],
					vel_y: data[4],
					angle: data[5],
					direction: data[6],
					jumped: data[7],
					hooked_player: data[8],
					hook_state: data[9],
					hook_tick: data[10],
					hook_x: data[11],
					hook_y: data[12],
					hook_dx: data[13],
					hook_dy: data[14],
				} as SnapshotItemTypes.CharacterCore
				break;
			case items.OBJ_CHARACTER:
				_item = {
					character_core: {
						tick: data[0],
						x: data[1],
						y: data[2],
						vel_x: data[3],
						vel_y: data[4],
						angle: data[5],
						direction: data[6],
						jumped: data[7],
						hooked_player: data[8],
						hook_state: data[9],
						hook_tick: data[10],
						hook_x: data[11],
						hook_y: data[12],
						hook_dx: data[13],
						hook_dy: data[14],
					} as SnapshotItemTypes.CharacterCore,
					player_flags: data[15],
					health: data[16],
					armor: data[17],
					ammo_count: data[18],
					weapon: data[19],
					emote: data[20],
					attack_tick: data[21],

					client_id: id
				} as SnapshotItemTypes.Character
				break;
			case items.OBJ_PLAYER_INFO:
				_item = {
					local: data[0],
					client_id: data[1],
					team: data[2],
					score: data[3],
					latency: data[4],
				} as SnapshotItemTypes.PlayerInfo
				break;
			case items.OBJ_CLIENT_INFO:
				_item = {
					name: this.IntsToStr([data[0], data[1], data[2], data[3]]),
					clan: this.IntsToStr([data[4], data[5], data[6]]),
					country: data[7],
					skin: this.IntsToStr([data[8], data[9], data[10], data[11], data[12], data[13]]),
					use_custom_color: Number(data.slice(14, 15)),
					color_body: Number(data.slice(15, 16)),
					color_feet: Number(data.slice(16, 17)),
					id: id
				} as SnapshotItemTypes.ClientInfo
				break;
			case items.OBJ_SPECTATOR_INFO:
				_item = {
					spectator_id: data[0],
					x: data[1],
					y: data[2],
				} as SnapshotItemTypes.SpectatorInfo
				break;
			case items.EVENT_COMMON:
				_item = {
					x: data[0],
					y: data[1],
				} as SnapshotItemTypes.Common
				break;
			case items.EVENT_EXPLOSION:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as SnapshotItemTypes.Common
				} as SnapshotItemTypes.Explosion
				break;
			case items.EVENT_SPAWN:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as SnapshotItemTypes.Common
				} as SnapshotItemTypes.Spawn
				break;
			case items.EVENT_HAMMERHIT:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as SnapshotItemTypes.Common
				} as SnapshotItemTypes.HammerHit
				break;
			case items.EVENT_DEATH:
				_item = {
					client_id: data[0],
					common: {
						x: data[1],
						y: data[2]
					} as SnapshotItemTypes.Common
				} as SnapshotItemTypes.Death
				break;
			case items.EVENT_SOUND_GLOBAL:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as SnapshotItemTypes.Common,
					sound_id: data[2]
				} as SnapshotItemTypes.SoundGlobal
				break;
			case items.EVENT_SOUND_WORLD:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as SnapshotItemTypes.Common,
					sound_id: data[2]
				} as SnapshotItemTypes.SoundWorld
				break;
			case items.EVENT_DAMAGE_INDICATOR:
				_item = {
					angle: data[0],
					common: {
						x: data[0],
						y: data[1]
					} as SnapshotItemTypes.Common,
				} as SnapshotItemTypes.DamageInd
				break;

		}
		
		return _item;
	}

	crc() {
		var checksum = 0;
		// this.eSnapHolder.forEach(snap => {
		// 	if (snap.ack == tick)
		// 		snap.Snapshot.Data.forEach(el => checksum += el);
		// })
		this.deltas.forEach(snap => {
			// if (snap.ack == tick)
				snap.data.forEach(el => checksum += el);
		})

		return checksum & 0xffffffff;
	}
	unpackSnapshot(snap: Buffer, deltatick: number, recvTick: number, WantedCrc: number) { 
		let unpacker = new MsgUnpacker(snap);
		let deltaSnaps: eSnap[] = [];
		if (deltatick == -1) {
			this.eSnapHolder = [];
			this.deltas = [];
		} else {
			this.eSnapHolder = this.eSnapHolder.filter(a => {
				if (a.ack == deltatick)
					deltaSnaps.push(a);
				return a.ack >= deltatick
			})
		}
		if (snap.length == 0) {
			// empty snap, copy old one into new ack
			this.eSnapHolder.forEach(snap => {
				if (snap.ack == deltatick) 
					this.eSnapHolder.push({Snapshot: snap.Snapshot, ack: recvTick});

			})
			return {items: [], recvTick: recvTick};
		}
		let oldDeltas = this.deltas;
		this.deltas = [];
		/* key = (((type_id) << 16) | (id))
		* key_to_id = ((key) & 0xffff)
		* key_to_type_id = ((key >> 16) & 0xffff) 
		* https://github.com/heinrich5991/libtw2/blob/master/snapshot/src/
		* https://github.com/heinrich5991/libtw2/blob/master/doc/snapshot.md
		*/ 
		var _events: {type_id: number, parsed: Item | DDNetItem}[] = [];
		
		let num_removed_items = unpacker.unpackInt();
		let num_item_deltas = unpacker.unpackInt();
		unpacker.unpackInt(); // _zero padding
		/*snapshot_delta:
			[ 4] num_removed_items
			[ 4] num_item_deltas
			[ 4] _zero
			[*4] removed_item_keys
			[  ] item_deltas
		*/

		var deleted: number[] = [];
		for (let i = 0; i < num_removed_items; i++) {
			let deleted_key = unpacker.unpackInt(); // removed_item_keys
			deleted.push(deleted_key)
		}
		/*item_delta:
			[ 4] type_id
			[ 4] id
			[ 4] _size
			[*4] data_delta*/

		// let items: {'items': {'data': number[], 'type_id': number, 'id': number, 'key': number}[]/*, 'client_infos': client_info[], 'player_infos': player_info[]*/, lost: number} = {items: [],/* client_infos: client_infos, player_infos: player_infos,*/ lost: 0};
		
		// let deltaSnaps = this.eSnapHolder.filter(a => a.ack === deltatick);

		if (deltaSnaps.length == 0 && deltatick >= 0) {
			return {items: [], recvTick: -1};
		}
		
		
		for (let i = 0; i < num_item_deltas; i++) {
			let type_id = unpacker.unpackInt();
			let id = unpacker.unpackInt();
			const key = (((type_id) << 16) | (id))

			let _size;
			if (type_id > 0 && type_id < itemAppendix.length) {
				_size = itemAppendix[type_id];
			} else
				_size = unpacker.unpackInt();

			let data: number[] = [];
			for (let j = 0; j < _size; j++) {
				// if (unpacker.remaining.length > 0)  {
					data[j] = (unpacker.unpackInt());
				// } else console.log(_size, "???")
			}
			let changed = false;
			if (deltatick >= 0) { 
				// let index = deltaSnaps.map(delta => delta.Snapshot.Key).indexOf(key)
				let delta = deltaSnaps.find(delta => delta.Snapshot.Key === key);
				if (delta !== undefined) {
					let out = UndiffItem(delta.Snapshot.Data, data)
					data = out;
					changed = true;
				} // else no previous, use new data
			} 
			let parsed: Item | DDNetItem;
			if (type_id !== 0) {
				if (!changed) {
					let oldDelta = oldDeltas.find(delta => delta.key == key); 
					if (oldDelta !== undefined && compareArrays(data, oldDelta.data)) {
						parsed = oldDelta.parsed;
	
					} else 
						parsed = this.parseItem(data, type_id, id)
						
				} else 
					parsed = this.parseItem(data, type_id, id)
					
					this.eSnapHolder.push({Snapshot: {Data: data, Key: key}, ack: recvTick});
					
					this.deltas.push({
						data, 
						key, 
						id, 
						type_id, 
						parsed
					});
					if (type_id >= items.EVENT_COMMON && type_id <= items.EVENT_DAMAGE_INDICATOR) {
						// this.client.SnapshotUnpacker.
						
						_events.push({type_id, parsed});
						// this.client.SnapshotUnpacker.emit(___itemAppendix[type_id].name, parsed);
					}
			} else {

				this.eSnapHolder.push({Snapshot: {Data: data, Key: key}, ack: recvTick});
					
				this.deltas.push({
					data, 
					key, 
					id, 
					type_id, 
					parsed: {} as Item
				});

				let test = (int: number) => [(int >> 24) & 0xff, (int >> 16) & 0xff, (int >> 8) & 0xff, (int) & 0xff ];
				let test2 = (ints: number[]) => ints.map(a => test(a)).flat();
				
				let targetUUID = Buffer.from(test2(data));
				if (!this.uuid_manager.LookupType(id)) {
					
					supported_uuids.forEach((a, i) => {
						let uuid = createTwMD5Hash(a);
						if (targetUUID.compare(uuid) == 0) {
							this.uuid_manager.RegisterName(a, id);
							supported_uuids.splice(i, 1);
						}
					})
				}
			}
		}
		
		
		for (let newSnap of deltaSnaps) {
			if (deleted.includes(newSnap.Snapshot.Key)) {
				continue;
			}
			if (this.eSnapHolder.findIndex(a => a.ack == recvTick && a.Snapshot.Key == newSnap.Snapshot.Key) === -1) { // ugly copy new snap to eSnapHolder (if it isnt pushed already)
				this.eSnapHolder.push({Snapshot: {Data: newSnap.Snapshot.Data, Key: newSnap.Snapshot.Key}, ack: recvTick});
				let oldDelta = oldDeltas.find(delta => delta.key == newSnap.Snapshot.Key); 
				if (oldDelta !== undefined && compareArrays(newSnap.Snapshot.Data, oldDelta.data)) {
					this.deltas.push(oldDelta);

				} else {
					this.deltas.push({
						data: newSnap.Snapshot.Data, 
						key: newSnap.Snapshot.Key, 
						id: newSnap.Snapshot.Key & 0xffff, 
						type_id: ((newSnap.Snapshot.Key >> 16) & 0xffff), 
						parsed: this.parseItem(newSnap.Snapshot.Data, ((newSnap.Snapshot.Key >> 16) & 0xffff), ((newSnap.Snapshot.Key) & 0xffff))
					});

				}
			}
		}

		let _crc = this.crc();
		if (_crc !== WantedCrc) {
			this.deltas = oldDeltas;
			this.crc_errors++;
			if (this.crc_errors > 5) {
				recvTick = -1;
				this.crc_errors = 0;
				this.eSnapHolder = [];
				this.deltas = [];
			} else {
				recvTick = deltatick;

			}
		} else if (this.crc_errors > 0)
			this.crc_errors--;
		_events.forEach(a => this.client.SnapshotUnpacker.emit(___itemAppendix[a.type_id].name, a.parsed))
		return {items: this.deltas, recvTick};
	}
}
function compareArrays(first: number[], second: number[]) {
	if (first.length !== second.length)
		return false;
	for (var i = 0; i < first.length; i++) {
		if (first[i] !== second[i])
			return false;
	}
	return true;
}

function UndiffItem(oldItem: number[], newItem: number[]): number[] {
	let out: number[] = newItem;
	// if (JSON.stringify(newItem) === JSON.stringify(oldItem))
		// return newItem;
	oldItem.forEach((a, i) => {
		if (a !== undefined && out[i] !== undefined) {
			out[i] += a;
		} else {
			out[i] = 0;
		}
	})
	return out;
}