"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var Movement = /** @class */ (function () {
    function Movement() {
        this.input = { m_Direction: 0, m_Fire: 0, m_Hook: 0, m_Jump: 0, m_NextWeapon: 0, m_PlayerFlags: 1, m_PrevWeapon: 0, m_TargetX: 0, m_TargetY: 0, m_WantedWeapon: 1 };
    }
    Movement.prototype.RunLeft = function () {
        this.input.m_Direction = -1;
    };
    Movement.prototype.RunRight = function () {
        this.input.m_Direction = 1;
    };
    Movement.prototype.RunStop = function () {
        this.input.m_Direction = 0;
    };
    Movement.prototype.Jump = function (state) {
        if (state === void 0) { state = true; }
        this.input.m_Jump = state ? 1 : 0;
    };
    Movement.prototype.Fire = function () {
        this.input.m_Fire++;
    };
    Movement.prototype.Hook = function (state) {
        if (state === void 0) { state = true; }
        this.input.m_Hook = state ? 1 : 0;
    };
    Movement.prototype.NextWeapon = function () {
        this.input.m_NextWeapon = 1;
        this.WantedWeapon(0);
    };
    Movement.prototype.PrevWeapon = function () {
        this.input.m_PrevWeapon = 1;
        this.WantedWeapon(0);
    };
    Movement.prototype.WantedWeapon = function (weapon) {
        this.input.m_WantedWeapon = weapon;
    };
    Movement.prototype.SetAim = function (x, y) {
        this.input.m_TargetX = x;
        this.input.m_TargetY = y;
    };
    Movement.prototype.Reset = function () {
        this.input.m_Direction = 0;
        this.input.m_Jump = 0;
        this.input.m_Fire = 0;
        this.input.m_Hook = 0;
        this.input.m_PlayerFlags = 0;
        this.input.m_NextWeapon = 0;
        this.input.m_PrevWeapon = 0;
    };
    return Movement;
}());
exports.default = Movement;
