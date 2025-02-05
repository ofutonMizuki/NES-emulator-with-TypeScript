/**
 * RAMクラス(WRAMとVRAMでサイズが同じなので共通化)
 * 
 */
export class RAM {
    _ram: number[];

    constructor() {
        this._ram = new Array(0x0800);
    }

    read(address: number) {
        if (address < 0) {
            throw new Error("Memory is out of range");

        }
        if (0x07FF < address) {
            throw new Error("Memory is out of range");
        }

        return this._ram[address] & 0xFF;
    }

    write(address: number, value: number) {
        if (address < 0) {
            throw new Error("Memory is out of range");

        }
        if (0x07FF < address) {
            throw new Error("Memory is out of range");
        }

        this._ram[address] = value & 0xFF;
    }
}