declare interface PlayerInput {
    direction: number,
    target_x: number,
    target_y: number,
    jump: number,
    fire: number,
    hook: number,
    player_flags: number,
    wanted_weapon: number,
    next_weapon: number,
    prev_weapon: number,
}

declare interface Projectile {
    x: number,
    y: number,
    vel_x: number,
    vel_y: number,
    type_: number,
    start_tick: number,
}

declare interface Laser {
    x: number,
    y: number,
    from_x: number,
    from_y: number,
    start_tick: number,
}

declare interface Pickup {
    x: number,
    y: number,
    type_: number,
    subtype: number,
}

declare interface Flag {
    x: number,
    y: number,
    team: number,
}

declare interface GameInfo {
    game_flags: number,
    game_state_flags: number,
    round_start_tick: number,
    warmup_timer: number,
    score_limit: number,
    time_limit: number,
    round_num: number,
    round_current: number,
}

declare interface GameData {
    teamscore_red: number,
    teamscore_blue: number,
    flag_carrier_red: number,
    flag_carrier_blue: number,
}

declare interface CharacterCore {
    tick: number,
    x: number,
    y: number,
    vel_x: number,
    vel_y: number,
    angle: number,
    direction: number,
    jumped: number,
    hooked_player: number,
    hook_state: number,
    hook_tick: number,
    hook_x: number,
    hook_y: number,
    hook_dx: number,
    hook_dy: number,
}

declare interface Character {
    character_core: CharacterCore,
    player_flags: number,
    health: number,
    armor: number,
    ammo_count: number,
    weapon: number,
    emote: number,
    attack_tick: number,
}

declare interface PlayerInfo {
    local: number,
    client_id: number,
    team: number,
    score: number,
    latency: number,
}

declare interface ClientInfo {
    name: string,
    clan: string,
    country: number,
    skin: string,
    use_custom_color: number,
    color_body: number,
    color_feet: number,
}

declare interface DdnetCharacter {
    flags: number,
    freeze_end: number,
    jumps: number,
    tele_checkpoint: number,
    strong_weak_id: number,
}

declare interface SpectatorInfo {
    spectator_id: number,
    x: number,
    y: number,
}

declare interface Common {
    x: number,
    y: number,
}

declare interface Explosion {
    common: Common,
}

declare interface Spawn {
    common: Common,
}

declare interface HammerHit {
    common: Common,
}

declare interface Death {
    common: Common,
    client_id: number,
}

declare interface SoundGlobal {
    common: Common,
    sound_id: number,
}

declare interface SoundWorld {
    common: Common,
    sound_id: number,
}

declare interface DamageInd {
    common: Common,
    angle: number,
}
declare enum items {
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