
import { Client } from "../client";
import { EventEmitter } from "stream";

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
export declare interface SnapshotWrapper {
	

	// on(event: 'connected', listener: () => void): this;
	// on(event: 'disconnect', listener: (reason: string) => void): this;

	// on(event: 'emote', listener: (message: iEmoticon) => void): this;
	// on(event: 'message', listener: (message: iMessage) => void): this;
	// on(event: 'broadcast', listener: (message: string) => void): this;
	// on(event: 'kill', listener: (kill: iKillMsg) => void): this;
	// on(event: 'motd', listener: (message: string) => void): this;
	
	on(event: 'common', listener: (common: Common) => void): this;
	on(event: 'explosion', listener: (explosion: Explosion) => void): this;
	on(event: 'spawn', listener: (spawn: Spawn) => void): this;
	on(event: 'hammerhit', listener: (hammerhit: HammerHit) => void): this;
	on(event: 'death', listener: (death: Death) => void): this;
	on(event: 'sound_global', listener: (sound_global: SoundGlobal) => void): this;
	on(event: 'sound_world', listener: (sound_world: SoundWorld) => void): this;
	on(event: 'damage_indicator', listener: (damage_indicator: DamageInd) => void): this;

}

export class SnapshotWrapper extends EventEmitter {
	private _client: Client;
	constructor(_client: Client) {
		// this.SendMsgEx = callback;
		super();
		this._client = _client;
	}
	
	private getParsed<T>(type_id: number, id: number) {
		return this._client.rawSnapUnpacker.deltas.find(delta => delta.type_id == type_id && delta.id == id)?.parsed as unknown as T;
	}

	private getAll<T>(type_id: number): T[] {
		let _all: T[] = [];

		this._client.rawSnapUnpacker.deltas.forEach(delta => {
			if (delta.type_id == type_id)
				_all.push(delta.parsed as T);
		})


		return _all;
		// return this._client.rawSnapUnpacker.deltas.filter(delta => delta.type_id == type_id && delta.id == id).map(a => a.parsed);
	}

	getObjPlayerInput(player_id: number): PlayerInput | undefined {
		return this.getParsed(items.OBJ_PLAYER_INPUT, player_id);
	}

	get AllObjPlayerInput(): PlayerInput[] {
		return this.getAll(items.OBJ_PLAYER_INPUT);
	}

	getObjProjectile(id: number): Projectile | undefined {
		return this.getParsed(items.OBJ_PROJECTILE, id);
	}
	get AllProjectiles(): Projectile[] {
		return this.getAll(items.OBJ_PROJECTILE);
	}

	getObjLaser(id: number): Laser | undefined {
		return this.getParsed(items.OBJ_LASER, id);
	}
	get AllObjLaser(): Laser[] {
		return this.getAll(items.OBJ_LASER);
	}
	
	getObjPickup(id: number): Pickup | undefined {
		return this.getParsed(items.OBJ_PICKUP, id);
	}
	get AllObjPickup(): Pickup[] {
		return this.getAll(items.OBJ_PICKUP);
	}
	
	getObjFlag(id: number): Flag | undefined {
		return this.getParsed(items.OBJ_FLAG, id);
	}
	get AllObjFlag(): Flag[] {
		return this.getAll(items.OBJ_FLAG);
	}
	
	getObjGameInfo(id: number): GameInfo | undefined {
		return this.getParsed(items.OBJ_GAME_INFO, id);
	}
	get AllObjGameInfo(): GameInfo[] {
		return this.getAll(items.OBJ_GAME_INFO);
	}

	getObjGameData(id: number): GameData | undefined {
		return this.getParsed(items.OBJ_GAME_DATA, id);
	}
	get AllObjGameData(): GameData[] {
		return this.getAll(items.OBJ_GAME_DATA);
	}
	
	getObjCharacterCore(player_id: number): CharacterCore | undefined { // NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.x / 32) * 100)/100
		return this.getParsed(items.OBJ_CHARACTER_CORE, player_id);
	}
	get AllObjCharacterCore(): CharacterCore[] { // NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.x / 32) * 100)/100
		return this.getAll(items.OBJ_CHARACTER_CORE);
	}

	getObjCharacter(player_id: number): Character | undefined { // NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100
		return this.getParsed(items.OBJ_CHARACTER, player_id);
	}
	get AllObjCharacter(): Character[] { // NOTICE: x & y positions always differ from the positions in the ingame debug menu. If you want the debug menu positions, you can calculate them like this: Math.round((myChar.character_core.x / 32) * 100)/100
		return this.getAll(items.OBJ_CHARACTER);
	}
	
	getObjPlayerInfo(player_id: number): PlayerInfo | undefined {
		return this.getParsed(items.OBJ_PLAYER_INFO, player_id);
	}
	get AllObjPlayerInfo(): PlayerInfo[] {
		return this.getAll(items.OBJ_PLAYER_INFO);
	}
	
	getObjClientInfo(player_id: number): ClientInfo | undefined {
		return this.getParsed(items.OBJ_CLIENT_INFO, player_id);
	}
	get AllObjClientInfo(): ClientInfo[] {
		return this.getAll(items.OBJ_CLIENT_INFO);
	}
	
	getObjSpectatorInfo(player_id: number): SpectatorInfo | undefined {
		return this.getParsed(items.OBJ_SPECTATOR_INFO, player_id);
	}
	get AllObjSpectatorInfo(): SpectatorInfo[] {
		return this.getAll(items.OBJ_SPECTATOR_INFO);
	}


	get OwnID(): number | undefined {
		return this.AllObjPlayerInfo.find(parsed => parsed.local)?.client_id;
	}



}