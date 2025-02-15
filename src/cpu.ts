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

/**
 * アドレッシングモード
 */
type AddressingMode = "Implied" | "Accumulator" | "Immediate" | "ZeroPage" | "ZeroPageX" | "ZeroPageY" | "Relative" | "Absolute" | "AbsoluteX" | "AbsoluteY" | "Indirect" | "IndirectX" | "IndirectY";

/**
 * アドレッシングタイプ
 */
type AddressingType = "A" | "X" | "Y";

type Address = number;

class CPURegister {
    private _accumulator: number; //アキュムレータ(8bit)
    private _indexRegisterX: number; //インデックスレジスタ(8bit)
    private _indexRegisterY: number; //インデックスレジスタ(8bit)
    private _stackPointer: number; //スタックポインタ(8bit)
    private _statusRegister: number; //ステータスレジスタ(8bit)
    private _programCounter: Address; //プログラムカウンタ(16bit)
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

    /**
     * CPUの起動
     */
    start() {
        this.initRegister();
        console.log("CPU started");
    }

    /**
     * メモリの読み取り
     * @param address 
     * @returns 
     */
    private readMemory(address: Address): number {
        if (address < 0x2000) {
            //WRAM
            return this._nes.readWRAM(address & 0x0FFF);
        }
        else if (address < 0x4000) {
            //PPUレジスタ
            //address & 0x0F;
        }
        else if (address < 0x4020) {
            //APU, PAD
            //address & 0x1F;
        }
        else if (address < 0x6000) {
            //拡張ROM
        }
        else if (address < 0x8000) {
            //拡張RAM
        }
        else if (address < 0x10000) {
            //ROM
            return this._nes.readPRGROM(address & 0x7FFF);
        }
        else {
            throw new Error("Memory is out of range");
        }

        return 0;
    }

    /**
     * メモリの書き込み
     * @param address 
     * @param value 
     */
    private writeMemory(address: Address, value: number) {

    }

    /**
     * 命令の実行
     */
    private executeInstruction() {
        let opcode = this.readMemory(this._register.programCounter);
        console.log("opcode:", opcode.toString(16));

        //jmp
        if (opcode == 0x4C || opcode == 0x6C) {
            let addressingMode: AddressingMode = opcode == 0x4C ? "Absolute" : "Indirect";
            this.jmp(addressingMode);
        }
        //0b10000000 (Store)
        else if ((opcode & 0x80) == 0x80) {
            let addressingMode: AddressingMode | undefined = undefined;
            //STA
            if ((opcode & 0x01) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
            }
            //STX
            else if ((opcode & 0x02) == 0x02) {
                addressingMode = this.getAddressingMode(opcode, "X");
            }
            //STY
            else if ((opcode & 0x00) == 0x00) {
                addressingMode = this.getAddressingMode(opcode, "Y");
            }
        }
        //0b10100000 (Load)
        else if ((opcode & 0xA0) == 0xA0) {
            let addressingMode: AddressingMode | undefined = undefined;
            //LDA
            if ((opcode & 0x01) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
            }
            //LDX
            else if ((opcode & 0x02) == 0x02) {
                addressingMode = this.getAddressingMode(opcode, "X");
            }
            //LDY
            else if ((opcode & 0x00) == 0x00) {
                addressingMode = this.getAddressingMode(opcode, "Y");
            }
        }
    }

    private getAddress(addressingMode: AddressingMode): Address {
        let tempAddress: number = 0;
        switch (addressingMode) {
            case "Implied":
                return 0;
            case "Accumulator":
                return 0;
            case "Immediate":
                return 0;
            case "ZeroPage":
                return this.readMemory(this._register.programCounter);
            case "ZeroPageX":
                return this.readMemory(this._register.programCounter) + this._register.indexRegisterX;
            case "ZeroPageY":
                return this.readMemory(this._register.programCounter) + this._register.indexRegisterY;
            case "Relative":
                return 0;
            case "Absolute":
                return this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8);
            case "AbsoluteX":
                return this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8) + this._register.indexRegisterX;
            case "AbsoluteY":
                return this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8) + this._register.indexRegisterY;
            case "Indirect":
                //間接参照
                tempAddress = this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8);
                return this.readMemory(tempAddress) | (this.readMemory(tempAddress + 1) << 8);
            case "IndirectX":
                return 0;
            case "IndirectY":
                return 0;
            default:
                throw new Error("Unknown addressing mode");
        }
    }


    private getAddressingMode(opcode: number, type: AddressingType): AddressingMode {
        opcode = opcode & 0x1F;
        opcode = opcode >> 2;
        console.log("opcode:", opcode.toString(16));

        //Typeによってアドレッシングモードを変更
        if (type == "A") {
            if (opcode == 0x00) {
                return "IndirectX";
            }
            else if (opcode == 0x01) {
                return "ZeroPage";
            }
            else if (opcode == 0x02) {
                return "Immediate";
            }
            else if (opcode == 0x03) {
                return "Absolute";
            }
            else if (opcode == 0x04) {
                return "IndirectY";
            }
            else if (opcode == 0x05) {
                return "ZeroPageX";
            }
            else if (opcode == 0x06) {
                return "AbsoluteY";
            }
            else if (opcode == 0x07) {
                return "AbsoluteX";
            }
        }
        if (type == "X") {
            if (opcode == 0x00) {
                return "Immediate";
            }
            else if (opcode == 0x01) {
                return "ZeroPage";
            }
            else if (opcode == 0x02) {

            }
            else if (opcode == 0x03) {
                return "Absolute";
            }
            else if (opcode == 0x04) {

            }
            else if (opcode == 0x05) {
                return "ZeroPageY";
            }
            else if (opcode == 0x06) {

            }
            else if (opcode == 0x07) {
                return "AbsoluteY";
            }
        }
        if (type == "Y") {
            if (opcode == 0x00) {
                return "Immediate";
            }
            else if (opcode == 0x01) {
                return "ZeroPage";
            }
            else if (opcode == 0x02) {

            }
            else if (opcode == 0x03) {
                return "Absolute";
            }
            else if (opcode == 0x04) {

            }
            else if (opcode == 0x05) {
                return "ZeroPageX";
            }
            else if (opcode == 0x06) {

            }
            else if (opcode == 0x07) {
                return "AbsoluteX";
            }
        }

        throw new Error("Unknown addressing mode");

    }

    /**
     * ジャンプ
     * @param addressingMode 
     */
    private jmp(addressingMode: AddressingMode) {
        this._register.programCounter = this.getAddress(addressingMode);
    }
}