/**
 * ステータスレジスタ(真偽値)
 * 
 * N: Negative
 * V: Overflow
 * R
 * B: BreakMode
 * D: DecimalMode
 * I: IRQ
 * Z: Zero
 * C: Carry
 */
type statusRegisterBits = {
    N: boolean,
    V: boolean,
    R: boolean,
    B: boolean,
    D: boolean,
    I: boolean,
    Z: boolean,
    C: boolean
}

class CPURegister {
    private _accumulator: number; //アキュムレータ(8bit)
    private _indexRegisterX: number; //インデックスレジスタ(8bit)
    private _indexRegisterY: number; //インデックスレジスタ(8bit)
    private _stackPointer: number; //スタックポインタ(8bit)
    private _statusRegister: number; //ステータスレジスタ(8bit)
    private _programCounter: number; //プログラムカウンタ(16bit)
    constructor() {
        this._accumulator = 0;
        this._indexRegisterX = 0;
        this._indexRegisterY = 0;
        this._stackPointer = 0;
        this._statusRegister = 0;
        this._programCounter = 0;
    }

    get accumulator(): number {
        return this._accumulator;
    }

    set accumulator(value: number) {
        //オーバーフローのチェック
        if ((value & (~0xFF)) != 0) {
            throw new Error("Accumulator overflow");
        }

        this._accumulator = value;
    }

    /**
     * ステータスレジスタ(真偽値)を取得
     */
    get statusRegisterBits(): statusRegisterBits {
        return {
            N: Boolean((this._statusRegister >> 7) & 0x01),
            V: Boolean((this._statusRegister >> 6) & 0x01),
            R: Boolean((this._statusRegister >> 5) & 0x01),
            B: Boolean((this._statusRegister >> 4) & 0x01),
            D: Boolean((this._statusRegister >> 3) & 0x01),
            I: Boolean((this._statusRegister >> 2) & 0x01),
            Z: Boolean((this._statusRegister >> 1) & 0x01),
            C: Boolean((this._statusRegister >> 0) & 0x01)
        }
    }
}

export class CPU {
    private _register: CPURegister;
    constructor() {
        this._register = new CPURegister();
    }
}