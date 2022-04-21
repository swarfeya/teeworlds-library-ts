import { MsgUnpacker } from "./MsgUnpacker";
var decoder = new TextDecoder('utf-8');

const itemAppendix: {"type_id": number, "size": number, "name": string}[] = [
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
	{"type_id": 13, "size": 2, "name": "event_common"},
	{"type_id": 14, "size": 2, "name": "event_explosion"},
	{"type_id": 15, "size": 2, "name": "event_spawn"},
	{"type_id": 16, "size": 2, "name": "event_hammerhit"},
	{"type_id": 17, "size": 3, "name": "event_death"},
	{"type_id": 18, "size": 3, "name": "event_sound_global"},
	{"type_id": 19, "size": 3, "name": "event_sound_world"},
	{"type_id": 20, "size": 3, "name": "event_damage_indicator"}
]
enum items {
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
type Item = PlayerInput | PlayerInfo | Projectile | Laser | Pickup | Flag | GameInfo | GameData | CharacterCore | Character | PlayerInfo | ClientInfo | SpectatorInfo | Common | Explosion | Spawn |HammerHit | Death | SoundGlobal | SoundWorld | DamageInd | DdnetCharacter;

class Snapshot {
	private IntsToStr(pInts: number[]): string {
		var pIntz: number[] = [];
		var pStr = ''
		for (let x of pInts) {
			pStr += String.fromCharCode((((x) >> 24) & 0xff) - 128);
			pIntz.push((((x) >> 24) & 0xff) - 128);
			pStr += String.fromCharCode((((x) >> 16) & 0xff) - 128);
			pIntz.push((((x) >> 16) & 0xff) - 128);
			pStr += String.fromCharCode((((x) >> 8) & 0xff) - 128);
			pIntz.push((((x) >> 8) & 0xff) - 128);
			pStr += String.fromCharCode(((x) & 0xff) - 128);
			pIntz.push(((x) & 0xff) - 128);
		}
		pIntz.splice(-1, 1)
		pStr = decoder.decode(new Uint8Array(pIntz));
		pStr = pStr.replace(/\x00|\u0000/g, "");//.replace(/ﾀ/g, "")
		return pStr;
	}
	private parseItem(data: number[], Type: number): Item {
		var _item = {} as Item; 
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
				} as PlayerInput
				break;
			case items.OBJ_PROJECTILE:
				_item = {
					x: data[0],
					y: data[1],
					vel_x: data[2],
					vel_y: data[3],
					type_: data[4],
					start_tick: data[5],
				} as Projectile 
				break;
			case items.OBJ_LASER:
				_item = {
					x: data[0],
					y: data[1],
					from_x: data[2],
					from_y: data[3],
					start_tick: data[4],
				} as Laser
				break;
			case items.OBJ_PICKUP:
				_item = {
					x: data[0],
					y: data[1],
					type_: data[2],
					subtype: data[3],
				} as Pickup
				break;
			case items.OBJ_FLAG:
				_item = {
					x: data[0],
					y: data[1],
					team: data[2],
				} as Flag
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

				} as GameInfo
				break; 
			case items.OBJ_GAME_DATA:
				_item = {
					teamscore_red: data[0],
					teamscore_blue: data[1],
					flag_carrier_red: data[2],
					flag_carrier_blue: data[3],
				} as GameData
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
				} as CharacterCore
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
					} as CharacterCore,
					player_flags: data[15],
					health: data[16],
					armor: data[17],
					ammo_count: data[18],
					weapon: data[19],
					emote: data[20],
					attack_tick: data[21],
				} as Character
				break;
			case items.OBJ_PLAYER_INFO:
				_item = {
					local: data[0],
					client_id: data[1],
					team: data[2],
					score: data[3],
					latency: data[4],
				} as PlayerInfo
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
				} as ClientInfo
				break;
			case items.OBJ_SPECTATOR_INFO:
				_item = {
					spectator_id: data[0],
					x: data[1],
					y: data[2],
				} as SpectatorInfo
				break;
			case items.EVENT_COMMON:
				_item = {
					x: data[0],
					y: data[1],
				} as Common
				break;
			case items.EVENT_EXPLOSION:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as Common
				} as Explosion
				break;
			case items.EVENT_SPAWN:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as Common
				} as Spawn
				break;
			case items.EVENT_HAMMERHIT:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as Common
				} as HammerHit
				break;
			case items.EVENT_DEATH:
				_item = {
					client_id: data[0],
					common: {
						x: data[1],
						y: data[2]
					} as Common
				} as Death
				break;
			case items.EVENT_SOUND_GLOBAL:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as Common,
					sound_id: data[2]
				} as SoundGlobal
				break;
			case items.EVENT_SOUND_WORLD:
				_item = {
					common: {
						x: data[0],
						y: data[1]
					} as Common,
					sound_id: data[2]
				} as SoundWorld
				break;
			case items.EVENT_DAMAGE_INDICATOR:
				_item = {
					angle: data[0],
					common: {
						x: data[0],
						y: data[1]
					} as Common,
				} as DamageInd
				break;

		}
		
		return _item;
	}
	unpackSnapshot(snap: number[], lost = 0) { 
		// var size = unpackInt(snap).result;
		let unpacker = new MsgUnpacker(snap);

		// snap = unpackInt(snap).remaining; // size
		
		/* key = (((type_id) << 16) | (id))
		* key_to_id = ((key) & 0xffff)
		* key_to_type_id = ((key >> 16) & 0xffff) 
		* https://github.com/heinrich5991/libtw2/blob/master/snapshot/src/
		* https://github.com/heinrich5991/libtw2/blob/master/doc/snapshot.md
		*/ 
	
		// snap = unpackInt(snap).remaining;
		// console.log(unpackInt(snap).result, "tick?") // key?
		// snap = unpackInt(snap).remaining;
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

		for (let i = 0; i < num_removed_items; i++) {
			unpacker.unpackInt(); // removed_item_keys
		}
		/*item_delta:
			[ 4] type_id
			[ 4] id
			[ 4] _size
			[*4] data_delta*/
		let items: {'items': {'data': number[], 'parsed': Item, 'type_id': number, 'id': number, 'key': number}[]/*, 'client_infos': client_info[], 'player_infos': player_info[]*/, lost: number} = {items: [],/* client_infos: client_infos, player_infos: player_infos,*/ lost: 0};

		for (let i = 0; i < num_item_deltas; i++) {
			let type_id = unpacker.unpackInt();
			let id = unpacker.unpackInt();
			const key = (((type_id) << 16) | (id))

			let _size;
			if (type_id > 0 && type_id < itemAppendix.length) {
				_size = itemAppendix[type_id].size;
			} else
				_size = unpacker.unpackInt();

			let data = [];
			for (let j = 0; j < _size; j++) {
				if (unpacker.remaining.length > 0) 
					data.push(unpacker.unpackInt());
			}
			// console.log(type_id, id, _size, data);
			let parsed = this.parseItem(data, type_id)
			
			// console.log(data)
			// console.log('')
			items.items.push({data, parsed, type_id, id, key})
		}

		
		return items;
	}}
// module.exports = MsgPacker;
export {Snapshot};
