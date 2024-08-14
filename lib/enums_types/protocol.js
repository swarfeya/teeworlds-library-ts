"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.States = void 0;
var States;
(function (States) {
    States[States["STATE_OFFLINE"] = 0] = "STATE_OFFLINE";
    States[States["STATE_CONNECTING"] = 1] = "STATE_CONNECTING";
    States[States["STATE_LOADING"] = 2] = "STATE_LOADING";
    States[States["STATE_ONLINE"] = 3] = "STATE_ONLINE";
    States[States["STATE_DEMOPLAYBACK"] = 4] = "STATE_DEMOPLAYBACK";
    States[States["STATE_QUITTING"] = 5] = "STATE_QUITTING";
    States[States["STATE_RESTARTING"] = 6] = "STATE_RESTARTING";
})(States = exports.States || (exports.States = {}));
