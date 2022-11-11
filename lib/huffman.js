"use strict";
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
], HUFFMAN_EOF_SYMBOL = 256, HUFFMAN_MAX_SYMBOLS = HUFFMAN_EOF_SYMBOL + 1, HUFFMAN_MAX_NODES = HUFFMAN_MAX_SYMBOLS * 2 - 1, HUFFMAN_LUTBITS = 10, HUFFMAN_LUTSIZE = 1 << HUFFMAN_LUTBITS, HUFFMAN_LUTMASK = HUFFMAN_LUTSIZE - 1;
var Huffman = /** @class */ (function () {
    function Huffman(frequencies) {
        if (frequencies === void 0) { frequencies = FREQ_TABLE; }
        this.nodes = new Array(HUFFMAN_MAX_NODES);
        for (var i = 0; i < HUFFMAN_MAX_NODES; i++) {
            this.nodes[i] = {};
        }
        this.decode_lut = new Array(HUFFMAN_LUTSIZE);
        this.num_nodes = 0;
        this.start_node_index = 0;
        this.construct_tree(frequencies);
        for (var i = 0; i < HUFFMAN_LUTSIZE; i++) {
            var bits = i;
            var broke = false;
            var index = this.start_node_index;
            for (var x = 0; x < HUFFMAN_LUTBITS; x++) {
                if (bits & 1)
                    index = this.nodes[index].right;
                else
                    index = this.nodes[index].left;
                bits >>= 1;
                if (this.nodes[index].numbits) {
                    this.decode_lut[i] = index;
                    broke = true;
                    break;
                }
            }
            if (!broke) {
                this.decode_lut[i] = index;
            }
        }
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
            for (var i = 0; i < size - 1; i++) {
                if (node_list[index_list[i]].frequency < node_list[index_list[i + 1]].frequency) {
                    var temp = index_list[i];
                    index_list[i] = index_list[i + 1];
                    index_list[i + 1] = temp;
                    changed = true;
                }
            }
            size--;
        }
        return index_list;
    };
    Huffman.prototype.construct_tree = function (frequencies) {
        if (frequencies === void 0) { frequencies = FREQ_TABLE; }
        var nodes_left_storage = new Array(HUFFMAN_MAX_SYMBOLS);
        for (var i = 0; i < HUFFMAN_MAX_SYMBOLS; i++) {
            nodes_left_storage[i] = {};
        }
        var nodes_left = new Array(HUFFMAN_MAX_SYMBOLS);
        var num_nodes_left = HUFFMAN_MAX_SYMBOLS;
        for (var i = 0; i < HUFFMAN_MAX_SYMBOLS; i++) {
            this.nodes[i].numbits = 0xFFFFFFFF;
            this.nodes[i].symbol = i;
            this.nodes[i].left = 0xFFFF;
            this.nodes[i].right = 0xFFFF;
            if (i == HUFFMAN_EOF_SYMBOL) {
                nodes_left_storage[i].frequency = 1;
            }
            else
                nodes_left_storage[i].frequency = frequencies[i];
            nodes_left_storage[i].node_id = i;
            nodes_left[i] = i;
        }
        this.num_nodes = HUFFMAN_MAX_SYMBOLS;
        while (num_nodes_left > 1) {
            nodes_left = this.bubble_sort(nodes_left, nodes_left_storage, num_nodes_left);
            this.nodes[this.num_nodes].numbits = 0;
            this.nodes[this.num_nodes].left = nodes_left_storage[nodes_left[num_nodes_left - 1]].node_id;
            this.nodes[this.num_nodes].right = nodes_left_storage[nodes_left[num_nodes_left - 2]].node_id;
            nodes_left_storage[nodes_left[num_nodes_left - 2]].node_id = this.num_nodes;
            nodes_left_storage[nodes_left[num_nodes_left - 2]].frequency = nodes_left_storage[nodes_left[num_nodes_left - 1]].frequency
                + nodes_left_storage[nodes_left[num_nodes_left - 2]].frequency;
            this.num_nodes++;
            num_nodes_left--;
        }
        this.start_node_index = this.num_nodes - 1;
        this.set_bits_r(this.start_node_index, 0, 0);
    };
    Huffman.prototype.compress = function (inp_buffer, start_index, size) {
        if (start_index === void 0) { start_index = 0; }
        if (size === void 0) { size = 0; }
        var output = [];
        var bits = 0;
        var bitcount = 0;
        if (size == 0)
            size = inp_buffer.byteLength;
        inp_buffer = inp_buffer.slice(start_index, start_index + size);
        for (var i = 0; i < size; i++) {
            var x = inp_buffer[i];
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
        output.push(bits);
        return Buffer.from(output);
    };
    Huffman.prototype.decompress = function (inp_buffer, size) {
        if (size === void 0) { size = 0; }
        var bits = 0;
        var bitcount = 0;
        var eof = this.nodes[HUFFMAN_EOF_SYMBOL];
        var output = [];
        if (size == 0)
            size = inp_buffer.byteLength;
        inp_buffer = inp_buffer.slice(0, size);
        var src_index = 0;
        while (true) {
            var node_i = -1;
            if (bitcount >= HUFFMAN_LUTBITS)
                node_i = this.decode_lut[bits & HUFFMAN_LUTMASK];
            while (bitcount < 24 && src_index != size) {
                bits |= inp_buffer[src_index] << bitcount;
                bitcount += 8;
                src_index++;
            }
            if (node_i == -1)
                node_i = this.decode_lut[bits & HUFFMAN_LUTMASK];
            if (this.nodes[node_i].numbits) {
                bits >>= this.nodes[node_i].numbits;
                bitcount -= this.nodes[node_i].numbits;
            }
            else {
                bits >>= HUFFMAN_LUTBITS;
                bitcount -= HUFFMAN_LUTBITS;
                while (true) {
                    if (bits & 1) {
                        node_i = this.nodes[node_i].right;
                    }
                    else
                        node_i = this.nodes[node_i].left;
                    bitcount -= 1;
                    bits >>= 1;
                    if (this.nodes[node_i].numbits)
                        break;
                    if (bitcount == 0)
                        throw new Error("No more bits, decoding error");
                }
            }
            if (this.nodes[node_i] == eof)
                break;
            output.push(this.nodes[node_i].symbol);
        }
        return Buffer.from(output);
    };
    return Huffman;
}());
module.exports = Huffman;
