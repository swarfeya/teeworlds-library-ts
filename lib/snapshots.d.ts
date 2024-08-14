export namespace SnapshotItemTypes {
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
        type_: number,
        start_tick: number,
    }

    interface Laser {
        x: number,
        y: number,
        from_x: number,
        from_y: number,
        start_tick: number,
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
        round_start_tick: number,
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
        hook_tick: number,
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
        weapon: number,
        emote: number,
        attack_tick: number,

        client_id: number
    }

    interface PlayerInfo {
        local: number,
        client_id: number,
        team: number,
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

        id: number
    }

    interface SpectatorInfo {
        spectator_id: number,
        x: number,
        y: number,
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
        sound_id: number,
    }

    interface SoundWorld {
        common: Common,
        sound_id: number,
    }

    interface DamageInd {
        common: Common,
        angle: number,
    }

    interface MyOwnObject {
        m_Test: number
    }

    interface DDNetCharacter {
        m_Flags: number,
        m_FreezeEnd: number,
        m_Jumps: number,
        m_TeleCheckpoint: number,
        m_StrongWeakID: number,

        // # New data fields for jump display, freeze bar and ninja bar
        // # Default values indicate that these values should not be used
        m_JumpedTotal?: number,
        m_NinjaActivationTick?: number,
        m_FreezeStart?: number,
        // # New data fields for improved target accuracy
        m_TargetX?: number,
        m_TargetY?: number,
        id: number
    } //, validate_size=False),
    /** m_AuthLevel "AUTHED_NO", "AUTHED_ADMIN" */
    interface DDNetPlayer {
        m_Flags: number,
        m_AuthLevel: number,
        id: number
    }

    interface GameInfoEx {

        m_Flags: number,
        m_Version: number,
        m_Flags2: number,
    }//, validate_size=False),

    // # The code assumes that this has the same in-memory representation as
    // # the Projectile net object.
    interface DDNetProjectile {
        m_X: number,
        m_Y: number,
        m_Angle: number,
        m_Data: number,
        m_Type: number,
        m_StartTick: number,
    }

    interface DDNetLaser {
        m_ToX: number,
        m_ToY: number,
        m_FromX: number,
        m_FromY: number,
        m_StartTick: number,
        m_Owner: number,
        m_Type: number,
    }
}
export enum SnapshotItemIDs {
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