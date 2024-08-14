
import { Client } from "../client";
import { EventEmitter } from "stream";
import { SnapshotItemTypes } from "../enums_types/types";
import { SnapshotItemIDs } from "../enums_types/protocol";
export declare interface SnapshotWrapper {
	

	on(event: 'common', listener: (common: SnapshotItemTypes.Common) => void): this;
	on(event: 'explosion', listener: (explosion: SnapshotItemTypes.Explosion) => void): this;
	on(event: 'spawn', listener: (spawn: SnapshotItemTypes.Spawn) => void): this;
	on(event: 'hammerhit', listener: (hammerhit: SnapshotItemTypes.HammerHit) => void): this;
	on(event: 'death', listener: (death: SnapshotItemTypes.Death) => void): this;
	on(event: 'sound_global', listener: (sound_global: SnapshotItemTypes.SoundGlobal) => void): this;
	on(event: 'sound_world', listener: (sound_world: SnapshotItemTypes.SoundWorld) => void): this;
	on(event: 'damage_indicator', listener: (damage_indicator: SnapshotItemTypes.DamageInd) => void): this;

}

export class SnapshotWrapper extends EventEmitter {
	private _client: Client;
	constructor(_client: Client) {
		// this.SendMsgEx = callback;
		super();
		this._client = _client;
	}
	
	private getParsed<T>(type_id: number, id: number) {
		if (type_id == -1)
			return undefined;
		return this._client.rawSnapUnpacker.deltas.find(delta => delta.type_id == type_id && delta.id == id)?.parsed as unknown as T;
	}

	private getAll<T>(type_id: number): T[] {
		let _all: T[] = [];
		if (type_id == -1)
			return _all;
		this._client.rawSnapUnpacker.deltas.forEach(delta => {
			if (delta.type_id == type_id)
				_all.push(delta.parsed as T);
		})


		return _all;
		// return this._client.rawSnapUnpacker.deltas.filter(delta => delta.type_id == type_id && delta.id == id).map(a => a.parsed);
	}

	getObjPlayerInput(player_id: number): SnapshotItemTypes.PlayerInput | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_PLAYER_INPUT, player_id);
	}

	get AllObjPlayerInput(): SnapshotItemTypes.PlayerInput[] {
		return this.getAll(SnapshotItemIDs.OBJ_PLAYER_INPUT);
	}

	getObjProjectile(id: number): SnapshotItemTypes.Projectile | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_PROJECTILE, id);
	}
	get AllProjectiles(): SnapshotItemTypes.Projectile[] {
		return this.getAll(SnapshotItemIDs.OBJ_PROJECTILE);
	}

	getObjLaser(id: number): SnapshotItemTypes.Laser | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_LASER, id);
	}
	get AllObjLaser(): SnapshotItemTypes.Laser[] {
		return this.getAll(SnapshotItemIDs.OBJ_LASER);
	}
	
	getObjPickup(id: number): SnapshotItemTypes.Pickup | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_PICKUP, id);
	}
	get AllObjPickup(): SnapshotItemTypes.Pickup[] {
		return this.getAll(SnapshotItemIDs.OBJ_PICKUP);
	}
	
	getObjFlag(id: number): SnapshotItemTypes.Flag | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_FLAG, id);
	}
	get AllObjFlag(): SnapshotItemTypes.Flag[] {
		return this.getAll(SnapshotItemIDs.OBJ_FLAG);
	}
	
	getObjGameInfo(id: number): SnapshotItemTypes.GameInfo | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_GAME_INFO, id);
	}
	get AllObjGameInfo(): SnapshotItemTypes.GameInfo[] {
		return this.getAll(SnapshotItemIDs.OBJ_GAME_INFO);
	}

	getObjGameData(id: number): SnapshotItemTypes.GameData | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_GAME_DATA, id);
	}
	get AllObjGameData(): SnapshotItemTypes.GameData[] {
		return this.getAll(SnapshotItemIDs.OBJ_GAME_DATA);
	}
	
	/** NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100 */
	getObjCharacterCore(player_id: number): SnapshotItemTypes.CharacterCore | undefined { 
		return this.getParsed(SnapshotItemIDs.OBJ_CHARACTER_CORE, player_id);
	}
	/** NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100 */
	get AllObjCharacterCore(): SnapshotItemTypes.CharacterCore[] { 
		return this.getAll(SnapshotItemIDs.OBJ_CHARACTER_CORE);
	}

	/** NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100 */
	getObjCharacter(player_id: number): SnapshotItemTypes.Character | undefined { 
		return this.getParsed(SnapshotItemIDs.OBJ_CHARACTER, player_id);
	}
	/** NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100 */
	get AllObjCharacter(): SnapshotItemTypes.Character[] { 
		
		return this.getAll(SnapshotItemIDs.OBJ_CHARACTER);
	}
	
	getObjPlayerInfo(player_id: number): SnapshotItemTypes.PlayerInfo | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_PLAYER_INFO, player_id);
	}
	get AllObjPlayerInfo(): SnapshotItemTypes.PlayerInfo[] {
		return this.getAll(SnapshotItemIDs.OBJ_PLAYER_INFO);
	}
	
	getObjClientInfo(player_id: number): SnapshotItemTypes.ClientInfo | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_CLIENT_INFO, player_id);
	}
	get AllObjClientInfo(): SnapshotItemTypes.ClientInfo[] {
		return this.getAll(SnapshotItemIDs.OBJ_CLIENT_INFO);
	}
	
	getObjSpectatorInfo(player_id: number): SnapshotItemTypes.SpectatorInfo | undefined {
		return this.getParsed(SnapshotItemIDs.OBJ_SPECTATOR_INFO, player_id);
	}
	get AllObjSpectatorInfo(): SnapshotItemTypes.SpectatorInfo[] {
		return this.getAll(SnapshotItemIDs.OBJ_SPECTATOR_INFO);
	}
	
	private getTypeId(name: string) {
		return this._client.rawSnapUnpacker.uuid_manager.LookupName(name)?.type_id || -1;
	}

	getObjExMyOwnObject(id: number): SnapshotItemTypes.MyOwnObject | undefined {
		return this.getParsed(this.getTypeId("my-own-object@heinrich5991.de"), id);
	}
	get AllObjExMyOwnObject(): SnapshotItemTypes.MyOwnObject[] {
		return this.getAll(this.getTypeId("my-own-object@heinrich5991.de"));
	}

	getObjExDDNetCharacter(id: number): SnapshotItemTypes.DDNetCharacter | undefined {
		return this.getParsed(this.getTypeId("character@netobj.ddnet.tw"), id);
	}
	get AllObjExDDNetCharacter(): SnapshotItemTypes.DDNetCharacter[] {
		return this.getAll(this.getTypeId("character@netobj.ddnet.tw"));
	}
	
	getObjExGameInfo(id: number): SnapshotItemTypes.GameInfoEx | undefined {
		return this.getParsed(this.getTypeId("gameinfo@netobj.ddnet.tw"), id);
	}
	get AllObjExGameInfo(): SnapshotItemTypes.GameInfoEx[] {
		return this.getAll(this.getTypeId("gameinfo@netobj.ddnet.tw"));
	}

	getObjExDDNetProjectile(id: number): SnapshotItemTypes.DDNetProjectile | undefined {
		return this.getParsed(this.getTypeId("projectile@netobj.ddnet.tw"), id);
	}
	get AllObjExDDNetProjectile(): SnapshotItemTypes.DDNetProjectile[] {
		return this.getAll(this.getTypeId("projectile@netobj.ddnet.tw"));
	}
	
	getObjExLaser(id: number): SnapshotItemTypes.DDNetLaser | undefined {
		return this.getParsed(this.getTypeId("laser@netobj.ddnet.tw"), id);
	}
	get AllObjExLaser(): SnapshotItemTypes.DDNetLaser[] {
		return this.getAll(this.getTypeId("laser@netobj.ddnet.tw"));
	}
	
	



	get OwnID(): number | undefined {
		return this.AllObjPlayerInfo.find(parsed => parsed.local)?.client_id;
	}



}