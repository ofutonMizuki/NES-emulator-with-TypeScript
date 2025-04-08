/**
 * RAMクラス(WRAMとVRAMでサイズが同じなので共通化)
 * 
 */
export class RAM {
    _ram: number[];

    constructor() {
        this._ram = new Array(0x0800);
    }

    /**
     * メモリの読み取り
     * @param address 
     * @returns 
     */
    read(address: number) {
        if (address < 0) {
            throw new Error(`Memory is out of range. Address: ${address}`);

        }
        if (0x07FF < address) {
            //throw new Error(`Memory is out of range. Address: ${address}`);
        }

        return this._ram[address] & 0xFF;
    }

    /**
     * メモリの書き込み
     * @param address 
     * @param value 
     */
    write(address: number, value: number) {
        if (address < 0) {
            throw new Error(`Memory is out of range. Address: ${address}`);

        }
        if (0x07FF < address) {
            throw new Error(`Memory is out of range. Address: ${address}`);
        }

        this._ram[address] = value & 0xFF;
    }
}