var FREQ_TABLE = [
    1 << 30, 4545, 2657, 431, 1950, 919, 444, 482, 2244, 617, 838, 542, 715, 1814, 304, 240, 754, 212, 647, 186,
    283, 131, 146, 166, 543, 164, 167, 136, 179, 859, 363, 113, 157, 154, 204, 108, 137, 180, 202, 176,
    872, 404, 168, 134, 151, 111, 113, 109, 120, 126, 129, 100, 41, 20, 16, 22, 18, 18, 17, 19,
    16, 37, 13, 21, 362, 166, 99, 78, 95, 88, 81, 70, 83, 284, 91, 187, 77, 68, 52, 68,
    59, 66, 61, 638, 71, 157, 50, 46, 69, 43, 11, 24, 13, 19, 10, 12, 12, 20, 14, 9,
    20, 20, 10, 10, 15, 15, 12, 12, 7, 19, 15, 14, 13, 18, 35, 19, 17, 14, 8, 5,
    15, 17, 9, 15, 14, 18, 8, 10, 2173, 134, 157, 68, 188, 60, 170, 60, 194, 62, 175, 71,
    148, 67, 167, 78, 211, 67, 156, 69, 1674, 90, 174, 53, 147, 89, 181, 51, 174, 63, 163, 80,
    167, 94, 128, 122, 223, 153, 218, 77, 200, 110, 190, 73, 174, 69, 145, 66, 277, 143, 141, 60,
    136, 53, 180, 57, 142, 57, 158, 61, 166, 112, 152, 92, 26, 22, 21, 28, 20, 26, 30, 21,
    32, 27, 20, 17, 23, 21, 30, 22, 22, 21, 27, 25, 17, 27, 23, 18, 39, 26, 15, 21,
    12, 18, 18, 27, 20, 18, 15, 19, 11, 17, 33, 12, 18, 15, 19, 18, 16, 26, 17, 18,
    9, 10, 25, 22, 22, 17, 20, 16, 6, 16, 15, 20, 14, 18, 24, 335, 1517
];
var HUFFMAN_EOF_SYMBOL = 256;
var HUFFMAN_MAX_SYMBOLS = HUFFMAN_EOF_SYMBOL + 1;
var HUFFMAN_MAX_NODES = HUFFMAN_MAX_SYMBOLS * 2 - 1;
var HUFFMAN_LUTBITS = 10;
var HUFFMAN_LUTSIZE = 1 << HUFFMAN_LUTBITS;
var HUFFMAN_LUTMASK = HUFFMAN_LUTSIZE - 1;
var _Node = /** @class */ (function () {
    function _Node() {
        this.bits = undefined;
        this.numbits = undefined;
        this.left = undefined;
        this.right = undefined;
        this.symbol = undefined;
    }
    _Node.prototype.__eq__ = function (other) {
        return this.symbol == other.symbol;
    };
    return _Node;
}());
var HuffmanConstructNode = /** @class */ (function () {
    function HuffmanConstructNode() {
        this.node_id = undefined;
        this.frequency = undefined;
    }
    return HuffmanConstructNode;
}());
var Huffman = /** @class */ (function () {
    function Huffman(frequencies) {
        this.nodes = [];
        // self.nodes = [Node() for _ in range(HUFFMAN_MAX_NODES)]
        for (var _ = 0; _ < HUFFMAN_MAX_NODES; _++)
            this.nodes.push(new _Node());
        // list of index of nodes
        // this.decode_lut = [undefined for _ in range(HUFFMAN_LUTSIZE)]
        this.decode_lut = [];
        for (var _ = 0; _ < HUFFMAN_LUTSIZE; _++)
            this.decode_lut.push(undefined);
        console.log(this.decode_lut.length);
        this.num_nodes = undefined;
        this.start_node_index = undefined;
        this.construct_tree(frequencies);
        console.log(this.num_nodes, "num_nodes");
        console.log(this.start_node_index, "index");
        console.log(this.decode_lut.length, "decodelut")
        var _x = 0;
        for (var i = 0; i < HUFFMAN_LUTSIZE; i++) {
            var bits = i;
            var broke = false;
            var index = this.start_node_index;
            for (var x = 0; x < HUFFMAN_LUTBITS; x++) {
                if (bits & 1) {
                    index = this.nodes[index].right;
                }
                else {
                    index = this.nodes[index].left;
                }
                bits >>= 1;
                if (this.nodes[index].numbits) {
                    _x++;
                    // console.log(i, bits)
                    this.decode_lut[i] = index;
                    broke = true;
                    break;
                }
            }
            if (!broke)
                this.decode_lut[i] = index;
        }
        console.log(_x, HUFFMAN_LUTSIZE, HUFFMAN_LUTBITS);
        // console.log(this.decode_lut.join(", "))
        this.decode_lut = [128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 28, 0, 165, 0, 13, 0, 24, 0, 26, 0, 139, 0, 3, 0, 1, 0, 340, 0, 186, 0, 4, 0, 128, 0, 2, 0, 8, 0, 344, 0, 1, 0, 154, 0, 146, 0, 189, 0, 36, 0, 150, 0, 22, 0, 6, 0, 1, 0, 41, 0, 70, 0, 353, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 64, 0, 9, 0, 13, 0, 325, 0, 134, 0, 177, 0, 40, 0, 1, 0, 136, 0, 18, 0, 4, 0, 128, 0, 2, 0, 8, 0, 29, 0, 1, 0, 16, 0, 83, 0, 7, 0, 71, 0, 12, 0, 330, 0, 5, 0, 1, 0, 10, 0, 23, 0, 357, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 37, 0, 33, 0, 13, 0, 24, 0, 255, 0, 73, 0, 166, 0, 1, 0, 170, 0, 333, 0, 4, 0, 128, 0, 2, 0, 8, 0, 17, 0, 1, 0, 19, 0, 85, 0, 349, 0, 176, 0, 39, 0, 140, 0, 347, 0, 1, 0, 342, 0, 188, 0, 50, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 30, 0, 9, 0, 13, 0, 27, 0, 172, 0, 174, 0, 40, 0, 1, 0, 168, 0, 18, 0, 4, 0, 128, 0, 2, 0, 8, 0, 29, 0, 1, 0, 16, 0, 83, 0, 15, 0, 20, 0, 12, 0, 14, 0, 5, 0, 1, 0, 10, 0, 160, 0, 11, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 182, 0, 167, 0, 13, 0, 24, 0, 42, 0, 184, 0, 3, 0, 1, 0, 132, 0, 332, 0, 4, 0, 128, 0, 2, 0, 8, 0, 144, 0, 1, 0, 74, 0, 130, 0, 31, 0, 147, 0, 138, 0, 152, 0, 6, 0, 1, 0, 41, 0, 25, 0, 49, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 64, 0, 9, 0, 13, 0, 180, 0, 337, 0, 328, 0, 40, 0, 1, 0, 66, 0, 18, 0, 4, 0, 128, 0, 2, 0, 8, 0, 29, 0, 1, 0, 16, 0, 83, 0, 7, 0, 178, 0, 12, 0, 190, 0, 5, 0, 1, 0, 10, 0, 72, 0, 43, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 149, 0, 143, 0, 13, 0, 24, 0, 255, 0, 73, 0, 47, 0, 1, 0, 68, 0, 158, 0, 4, 0, 128, 0, 2, 0, 8, 0, 346, 0, 1, 0, 75, 0, 32, 0, 350, 0, 176, 0, 69, 0, 44, 0, 164, 0, 1, 0, 34, 0, 65, 0, 21, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 30, 0, 9, 0, 13, 0, 77, 0, 156, 0, 329, 0, 40, 0, 1, 0, 38, 0, 18, 0, 4, 0, 128, 0, 2, 0, 8, 0, 29, 0, 1, 0, 16, 0, 83, 0, 352, 0, 20, 0, 12, 0, 14, 0, 5, 0, 1, 0, 10, 0, 142, 0, 11, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 28, 0, 165, 0, 13, 0, 24, 0, 26, 0, 84, 0, 3, 0, 1, 0, 161, 0, 186, 0, 4, 0, 128, 0, 2, 0, 8, 0, 345, 0, 1, 0, 154, 0, 146, 0, 46, 0, 36, 0, 150, 0, 22, 0, 6, 0, 1, 0, 41, 0, 335, 0, 354, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 64, 0, 9, 0, 13, 0, 324, 0, 134, 0, 177, 0, 40, 0, 1, 0, 136, 0, 18, 0, 4, 0, 128, 0, 2, 0, 8, 0, 29, 0, 1, 0, 16, 0, 83, 0, 7, 0, 326, 0, 12, 0, 331, 0, 5, 0, 1, 0, 10, 0, 23, 0, 129, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 37, 0, 33, 0, 13, 0, 24, 0, 255, 0, 73, 0, 166, 0, 1, 0, 170, 0, 159, 0, 4, 0, 128, 0, 2, 0, 8, 0, 17, 0, 1, 0, 19, 0, 85, 0, 351, 0, 176, 0, 39, 0, 140, 0, 45, 0, 1, 0, 343, 0, 188, 0, 355, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 30, 0, 9, 0, 13, 0, 27, 0, 172, 0, 174, 0, 40, 0, 1, 0, 168, 0, 18, 0, 4, 0, 128, 0, 2, 0, 8, 0, 29, 0, 1, 0, 16, 0, 83, 0, 15, 0, 20, 0, 12, 0, 14, 0, 5, 0, 1, 0, 10, 0, 160, 0, 11, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 182, 0, 76, 0, 13, 0, 24, 0, 42, 0, 184, 0, 3, 0, 1, 0, 132, 0, 334, 0, 4, 0, 128, 0, 2, 0, 8, 0, 144, 0, 1, 0, 191, 0, 130, 0, 348, 0, 88, 0, 138, 0, 152, 0, 6, 0, 1, 0, 41, 0, 25, 0, 162, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 64, 0, 9, 0, 13, 0, 180, 0, 338, 0, 327, 0, 40, 0, 1, 0, 51, 0, 18, 0, 4, 0, 128, 0, 2, 0, 8, 0, 29, 0, 1, 0, 16, 0, 83, 0, 7, 0, 178, 0, 12, 0, 190, 0, 5, 0, 1, 0, 10, 0, 336, 0, 359, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 339, 0, 67, 0, 13, 0, 24, 0, 255, 0, 73, 0, 169, 0, 1, 0, 341, 0, 158, 0, 4, 0, 128, 0, 2, 0, 8, 0, 35, 0, 1, 0, 75, 0, 32, 0, 48, 0, 176, 0, 153, 0, 44, 0, 164, 0, 1, 0, 34, 0, 65, 0, 356, 0, 128, 0, 2, 0, 8, 0, 148, 0, 1, 0, 30, 0, 9, 0, 13, 0, 173, 0, 156, 0, 171, 0, 40, 0, 1, 0, 38, 0, 18, 0, 4, 0, 128, 0, 2, 0, 8, 0, 29, 0, 1, 0, 16, 0, 83, 0, 163, 0, 20, 0, 12, 0, 14, 0, 5, 0, 1, 0, 10, 0, 142, 0, 11, 0]
    }
    Huffman.prototype.set_bits_r = function (node_index, bits, depth) {
        if (this.nodes[node_index].right != 0xffff)
            this.set_bits_r(this.nodes[node_index].right, bits | (1 << depth), depth + 1);
        if (this.nodes[node_index].left != 0xffff)
            this.set_bits_r(this.nodes[node_index].left, bits, depth + 1);
        if (this.nodes[node_index].numbits) {
            this.nodes[node_index].bits = bits;
            this.nodes[node_index].numbits = depth;
        }
    };
    Huffman.prototype.bubble_sort = function (index_list, node_list, size) {
        var changed = true;
        while (changed) {
            changed = false;
            for (var i = 0; i < (size - 1); i++) {
                if (node_list[index_list[i]].frequency < node_list[index_list[i + 1]].frequency) {
                    index_list[i], index_list[i + 1] = index_list[i + 1], index_list[i];
                    changed = true;
                }
                size -= 1;
            }
        }
        return index_list;
    };
    Huffman.prototype.construct_tree = function (frequencies) {
        var nodes_left_storage = [ /*HuffmanConstructNode() for _ in range(HUFFMAN_MAX_SYMBOLS)*/];
        for (var _ = 0; _ < HUFFMAN_MAX_SYMBOLS; _++) {
            nodes_left_storage.push(new HuffmanConstructNode());
        }
        var nodes_left = [ /*None for _ in range(HUFFMAN_MAX_SYMBOLS)*/];
        for (var _ = 0; _ < HUFFMAN_MAX_SYMBOLS; _++)
            nodes_left.push(undefined);
        var num_nodes_left = HUFFMAN_MAX_SYMBOLS;
        for (var i = 0; i < HUFFMAN_MAX_SYMBOLS; i++) {
            this.nodes[i].numbits = 0xFFFFFFFF;
            this.nodes[i].symbol = i;
            this.nodes[i].left = 0xffff;
            this.nodes[i].right = 0xffff;
            if (i == HUFFMAN_EOF_SYMBOL)
                nodes_left_storage[i].frequency = 1;
            else
                nodes_left_storage[i].frequency = frequencies[i];
            nodes_left_storage[i].node_id = i;
            nodes_left[i] = i;
        }
        this.num_nodes = HUFFMAN_MAX_SYMBOLS;
        while (num_nodes_left > 1) {
            nodes_left = Huffman.prototype.bubble_sort(nodes_left, nodes_left_storage, num_nodes_left);
            this.nodes[this.num_nodes].numbits = 0;
            this.nodes[this.num_nodes].left = nodes_left_storage[nodes_left[num_nodes_left - 1]].node_id;
            this.nodes[this.num_nodes].right = nodes_left_storage[nodes_left[num_nodes_left - 2]].node_id;
            nodes_left_storage[nodes_left[num_nodes_left - 2]].node_id = this.num_nodes;
            nodes_left_storage[nodes_left[num_nodes_left - 2]].frequency =
                nodes_left_storage[nodes_left[num_nodes_left - 1]].frequency
                    + nodes_left_storage[nodes_left[num_nodes_left - 2]].frequency;
            this.num_nodes += 1;
            num_nodes_left -= 1;
        }
        this.start_node_index = this.num_nodes - 1;
        this.set_bits_r(this.start_node_index, 0, 0);
    };
    Huffman.prototype.compress = function (inp_buffer, start_index, size) {
        if (start_index === void 0) { start_index = 0; }
        if (size === void 0) { size = undefined; }
        var output = [];
        var bits = 0;
        var bitcount = 0;
        if (size == undefined)
            size = inp_buffer.length;
        for (var i = 0; i < inp_buffer.slice(start_index, size).length; i++) {
            // for x in inp_buffer[start_index:size:]:
            var x = inp_buffer.slice(start_index, size)[i];
            bits |= this.nodes[x].bits << bitcount;
            bitcount += this.nodes[x].numbits;
            while (bitcount >= 8) {
                output.push(bits & 0xff);
                bits >>= 8;
                bitcount -= 8;
            }
        }
        bits |= this.nodes[HUFFMAN_EOF_SYMBOL].bits << bitcount;
        bitcount += this.nodes[HUFFMAN_EOF_SYMBOL].numbits;
        while (bitcount >= 8) {
            output.push(bits & 0xff);
            bits >>= 8;
            bitcount -= 8;
        }
        //  write out last bits
        output.push(bits);
        return output;
    };
    Huffman.prototype.decompress = function (inp_buffer, size) {
        if (size === void 0) { size = undefined; }
        var bits = 0;
        var bitcount = 0;
        var eof = this.nodes[HUFFMAN_EOF_SYMBOL];
        // console.log(this.nodes)
        var output = [];
        if (size == undefined)
            size = inp_buffer.length;
        var src_index = 0;
        var i = 0;
        while (true) {
            var node_i = undefined;
            if (bitcount >= HUFFMAN_LUTBITS)
                node_i = this.decode_lut[bits & HUFFMAN_LUTMASK];
            while (bitcount < 24 && src_index != size) {
                bits |= inp_buffer[src_index] << bitcount;
                src_index += 1;
                bitcount += 8;
            }
            if (node_i == undefined)
                node_i = this.decode_lut[bits & HUFFMAN_LUTMASK];
            // console.log(output)
            if (this.nodes[node_i].numbits) {
                bits >>= this.nodes[node_i].numbits;
                bitcount -= this.nodes[node_i].numbits;
            }
            else {
                bits >>= HUFFMAN_LUTBITS;
                bitcount -= HUFFMAN_LUTBITS;
                while (true) {
                    // console.log("stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?stuck?")
                    if (bits & 1)
                        node_i = this.nodes[node_i].right;
                    else
                        node_i = this.nodes[node_i].left;
                    bitcount -= 1;
                    bits >>= 1;
                    if (this.nodes[node_i].numbits)
                        break;
                    if (bitcount == 0)
                        throw Error("No more bits, decoding error");
                }
            }
            if (this.nodes[node_i] == eof)
                break;
            output.push(this.nodes[node_i].symbol);
            if (i == 5)
                break;
            i++;
        }
        return output;
    };
    return Huffman;
}());
var huff = new Huffman(FREQ_TABLE);
console.log(huff.decompress(Buffer.from([177, 8, 42, 110, 0])));
