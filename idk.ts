var Tick: number;
enum Team {
    Spectators = -1,
    Red,
    Blue,
}
enum Emote {
    Normal,
    Pain,
    Happy,
    Surprise,
    Angry,
    Blink,
}
enum Weapon {
    Hammer,
    Pistol,
    Shotgun,
    Grenade,
    Rifle,
    Ninja,
}
enum Sound {
    GunFire,
    ShotgunFire,
    GrenadeFire,
    HammerFire,
    HammerHit,
    NinjaFire,
    GrenadeExplode,
    NinjaHit,
    RifleFire,
    RifleBounce,
    WeaponSwitch,
    PlayerPainShort,
    PlayerPainLong,
    BodyLand,
    PlayerAirjump,
    PlayerJump,
    PlayerDie,
    PlayerSpawn,
    PlayerSkid,
    TeeCry,
    HookLoop,
    HookAttachGround,
    HookAttachPlayer,
    HookNoattach,
    PickupHealth,
    PickupArmor,
    PickupGrenade,
    PickupShotgun,
    PickupNinja,
    WeaponSpawn,
    WeaponNoammo,
    Hit,
    ChatServer,
    ChatClient,
    ChatHighlight,
    CtfDrop,
    CtfReturn,
    CtfGrabPl,
    CtfGrabEn,
    CtfCapture,
    Menu,
}
interface PlayerInput {
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

interface Projectile {
    x: number,
    y: number,
    vel_x: number,
    vel_y: number,
    type_: Weapon,
    start_tick: typeof Tick,
}

interface Laser {
    x: number,
    y: number,
    from_x: number,
    from_y: number,
    start_tick: typeof Tick,
}

interface Pickup {
    x: number,
    y: number,
    type_: number,
    subtype: number,
}

interface Flag {
    x: number,
    y: number,
    team: number,
}

interface GameInfo {
    game_flags: number,
    game_state_flags: number,
    round_start_tick: typeof Tick,
    warmup_timer: number,
    score_limit: number,
    time_limit: number,
    round_num: number,
    round_current: number,
}

interface GameData {
    teamscore_red: number,
    teamscore_blue: number,
    flag_carrier_red: number,
    flag_carrier_blue: number,
}

interface CharacterCore {
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
    hook_tick: typeof Tick,
    hook_x: number,
    hook_y: number,
    hook_dx: number,
    hook_dy: number,
}

interface Character {
    character_core: CharacterCore,
    player_flags: number,
    health: number,
    armor: number,
    ammo_count: number,
    weapon: Weapon,
    emote: Emote,
    attack_tick: number,
}

interface PlayerInfo {
    local: number,
    client_id: number,
    team: Team,
    score: number,
    latency: number,
}

interface ClientInfo {
    name: string,
    clan: string,
    country: number,
    skin: string,
    use_custom_color: number,
    color_body: number,
    color_feet: number,
}

interface SpectatorInfo {
    spectator_id: number,
    x: number,
    y: number,
}

interface MyOwnObject {
    test: number,
}

interface DdnetCharacter {
    flags: number,
    freeze_end: typeof Tick,
    jumps: number,
    tele_checkpoint: number,
    strong_weak_id: number,
}

interface DdnetPlayer {
    flags: number,
    auth_level: number,
}

interface GameInfoEx {
    flags: number,
    version: number,
    flags2: number,
}

interface Common {
    x: number,
    y: number,
}

interface Explosion {
    common: Common,
}

interface Spawn {
    common: Common,
}

interface HammerHit {
    common: Common,
}

interface Death {
    common: Common,
    client_id: number,
}

interface SoundGlobal {
    common: Common,
    sound_id: Sound,
}

interface SoundWorld {
    common: Common,
    sound_id: Sound,
}

interface DamageInd {
    common: Common,
    angle: number,
}

interface MyOwnEvent {
    test: number,
}

interface SpecChar {
    x: number,
    y: number,
}
export = this;