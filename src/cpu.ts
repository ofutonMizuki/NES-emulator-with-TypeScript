import { NES } from "./nes";

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

    get indexRegisterX(): number {
        return this._indexRegisterX;
    }

    set indexRegisterX(value: number) {
        //オーバーフローのチェック
        if ((value & (~0xFF)) != 0) {
            throw new Error("IndexRegisterX overflow");
        }

        this._indexRegisterX = value;
    }

    get indexRegisterY(): number {
        return this._indexRegisterY;
    }

    set indexRegisterY(value: number) {
        //オーバーフローのチェック
        if ((value & (~0xFF)) != 0) {
            throw new Error("IndexRegisterY overflow");
        }

        this._indexRegisterY = value;
    }

    get stackPointer(): number {
        return this._stackPointer;
    }

    set stackPointer(value: number) {
        //オーバーフローのチェック
        if ((value & (~0xFF)) != 0) {
            throw new Error("StackPointer overflow");
        }

        this._stackPointer = value;
    }

    get programCounter(): number {
        return this._programCounter;
    }

    set programCounter(value: number) {
        //オーバーフローのチェック
        if ((value & (~0xFFFF)) != 0) {
            throw new Error("ProgramCounter overflow");
        }

        this._programCounter = value;
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

    /**
     * ステータスレジスタ(真偽値)を設定
     */
    set statusRegisterBits(value: statusRegisterBits) {
        let status = 0;
        status |= (Number(value.N) << 7);
        status |= (Number(value.V) << 6);
        status |= (Number(value.R) << 5);
        status |= (Number(value.B) << 4);
        status |= (Number(value.D) << 3);
        status |= (Number(value.I) << 2);
        status |= (Number(value.Z) << 1);
        status |= (Number(value.C) << 0);

        this._statusRegister = status;
    }
}

export class CPU {
    private _register: CPURegister;
    private _nes: NES; //メインメモリ
    constructor(nes: NES) {
        this._nes = nes;
        this._register = new CPURegister();
        this.initRegister();
    }

    initRegister() {
        //レジスタの初期化
        //起動時は固定値
        this._register.accumulator = 0;
        this._register.indexRegisterX = 0;
        this._register.indexRegisterY = 0;
        this._register.stackPointer = 0xFD;
        this._register.programCounter = this.readMemory(0xFFFC) | (this.readMemory(0xFFFD) << 8);
        this._register.statusRegisterBits = {
            N: false,
            V: false,
            R: false,
            B: false,
            D: false,
            I: true,
            Z: false,
            C: false
        };
        console.log("programCounter:", this._register.programCounter.toString(16));
        console.log("Register initialized");
    }

    start(){
        this.initRegister();
        console.log("CPU started");
    }

    private readMemory(address: number): number {
        if (address < 0x0800) {
            //WRAM
            return this._nes.readWRAM(address);
        }
        else if (address < 0x2000) {
            //WRAM
        }
        else if (address < 0x2008) {
            //PPUレジスタ
        }
        else if (address < 0x4000) {
            //PPUレジスタ
        }
        else if (address < 0x4020) {
            //APU, PAD
        }
        else if (address < 0x6000) {
            //拡張ROM
        }
        else if (address < 0x8000) {
            //拡張RAM
        }
        else if (address < 0x10000) {
            //ROM
            return this._nes.readPRGROM(address - 0x8000);
        }
        else {
            throw new Error("Memory is out of range");
        }

        return 0;
    }
}