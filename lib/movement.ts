interface NetObj_PlayerInput {
	m_Direction: number,
	m_TargetX: number,
	m_TargetY: number,
	m_Jump: number,
	m_Fire: number,
	m_Hook: number,
	m_PlayerFlags: number,
	m_WantedWeapon: number,
	m_NextWeapon: number,
	m_PrevWeapon: number
};

class Movement {
	input: NetObj_PlayerInput;
	constructor() {
		this.input = {m_Direction: 0, m_Fire: 0, m_Hook: 0, m_Jump: 0, m_NextWeapon: 0, m_PlayerFlags: 1, m_PrevWeapon: 0, m_TargetX: 0, m_TargetY: 0, m_WantedWeapon: 1} as NetObj_PlayerInput;
	}

	RunLeft() {
		this.input.m_Direction = -1;
	}
	RunRight() {
		this.input.m_Direction = 1;
	}
	RunStop() {
		this.input.m_Direction = 0;
	}
	Jump(state = true) {
		this.input.m_Jump = state ? 1 : 0;
	}
	Fire() {
		this.input.m_Fire++;
	}
	Hook(state = true) {
		this.input.m_Hook = state ? 1 : 0;
	}
	NextWeapon() {
		this.input.m_NextWeapon = 1;
		this.WantedWeapon(0);
	}
	PrevWeapon() {
		this.input.m_PrevWeapon = 1;
		this.WantedWeapon(0);
	}
	WantedWeapon(weapon: number) {
		this.input.m_WantedWeapon = weapon;
	}
	SetAim(x: number, y: number) {
		this.input.m_TargetX = x;
		this.input.m_TargetY = y;
	}
	Reset() {
		this.input.m_Direction = 0;
		this.input.m_Jump = 0;
		this.input.m_Fire = 0;
		this.input.m_Hook = 0;
		this.input.m_PlayerFlags = 0;
		this.input.m_NextWeapon = 0;
		this.input.m_PrevWeapon = 0;
	}
}
export default Movement;