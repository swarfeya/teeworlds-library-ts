"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUIDManager = exports.createTwMD5Hash = void 0;
var crypto_1 = require("crypto");
var createTwMD5Hash = function (name) {
    var hash = (0, crypto_1.createHash)("md5")
        .update(Buffer.from([0xe0, 0x5d, 0xda, 0xaa, 0xc4, 0xe6, 0x4c, 0xfb, 0xb6, 0x42, 0x5d, 0x48, 0xe8, 0x0c, 0x00, 0x29]))
        .update(name)
        .digest();
    hash[6] &= 0x0f;
    hash[6] |= 0x30;
    hash[8] &= 0x3f;
    hash[8] |= 0x80;
    return hash;
};
exports.createTwMD5Hash = createTwMD5Hash;
// [{name: string, hash: Buffer}, ..]
var UUIDManager = /** @class */ (function () {
    function UUIDManager(pOffset, pSnapshot) {
        if (pOffset === void 0) { pOffset = 65536; }
        if (pSnapshot === void 0) { pSnapshot = false; }
        this.uuids = [];
        this.offset = pOffset;
        this.snapshot = pSnapshot;
    }
    UUIDManager.prototype.LookupUUID = function (hash) {
        return this.uuids.find(function (a) { return a.hash.compare(hash) == 0; });
    };
    UUIDManager.prototype.LookupName = function (name) {
        return this.uuids.find(function (a) { return a.name === name; });
    };
    UUIDManager.prototype.LookupType = function (ID) {
        if (!this.snapshot) {
            return this.uuids[ID - this.offset];
        }
        else {
            return this.uuids.find(function (a) { return a.type_id == ID; });
        }
    };
    UUIDManager.prototype.RegisterName = function (name, type_id) {
        if (type_id === void 0) { type_id = this.offset - this.uuids.length; }
        this.uuids.push({
            name: name,
            hash: (0, exports.createTwMD5Hash)(name),
            type_id: type_id
        });
    };
    return UUIDManager;
}());
exports.UUIDManager = UUIDManager;
