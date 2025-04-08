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
type AddressingMode = "Implied" | "Accumulator" | "Immediate" | "ZeroPage" | "ZeroPageX" | "ZeroPageY" | "Relative" | "Absolute" | "AbsoluteX" | "AbsoluteY" | "Indirect" | "IndirectX" | "IndirectY" | "Unknown";

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
            throw new Error(`Memory is out of range. Address: ${this.addressToString(address)}`);
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
     * 逆アセンブル用
     * プログラムカウンタを0x8000に設定
     * 
     */
    setPCto0x8000() {
        this._register.programCounter = 0x8000;
    }

    private addressToString(address: Address | undefined) {
        if (address == undefined) {
            return "";
        }
        return address.toString(16).padStart(4, '0').toUpperCase();
    }

    /**
     * 命令の実行(毎クロック実行)
     */
    execute(execute: boolean = true) {
        let opcode = this.readMemory(this._register.programCounter);
        let pcText = `opcode: ${opcode.toString(16).padStart(2, '0').toUpperCase()}, address: 0x${this.addressToString(this._register.programCounter)}`;
        this._register.programCounter++;
        console.log(opcode.toString(16).padStart(4, '0').toUpperCase());

        //jmp
        if (opcode == 0x4C || opcode == 0x6C) {
            let addressingMode: AddressingMode = opcode == 0x4C ? "Absolute" : "Indirect";
            return execute ? this.jmp(addressingMode) : `${pcText}, JMP ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
        }
        else if (opcode == 0x20) {
            let addressingMode: AddressingMode = "Absolute";
            return execute ? undefined : `${pcText}, JSR ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
        }
        //PHP
        else if (opcode == 0x08) {
            return execute ? undefined : `${pcText}, PHP`;
        }
        //PHA
        else if (opcode == 0x48) {
            return execute ? undefined : `${pcText}, PHA`;
        }
        //PLA
        else if (opcode == 0x68) {
            return execute ? undefined : `${pcText}, PLA`;
        }
        //PLP
        else if (opcode == 0x28) {
            return execute ? undefined : `${pcText}, PLP`;
        }
        //RTS
        else if (opcode == 0x60) {
            return execute ? undefined : `${pcText}, RTS`;
        }
        //SEI
        else if (opcode == 0x78) {
            return execute ? undefined : `${pcText}, SEI`;
        }
        //TAX
        else if (opcode == 0xAA) {
            return execute ? undefined : `${pcText}, TAX`;
        }
        //TAY
        else if (opcode == 0xA8) {
            return execute ? undefined : `${pcText}, TAY`;
        }
        //TSX
        else if (opcode == 0xBA) {
            return execute ? undefined : `${pcText}, TSX`;
        }
        //TXA
        else if (opcode == 0xBA) {
            return execute ? undefined : `${pcText}, TXA`;
        }
        //TXS
        else if (opcode == 0x9A) {
            return execute ? undefined : `${pcText}, TXS`;
        }
        //TYA
        else if (opcode == 0x98) {
            return execute ? undefined : `${pcText}, TYA`;
        }
        //CLC
        else if (opcode == 0x18) {
            return execute ? undefined : `${pcText}, CLC`;
        }
        //CLD
        else if (opcode == 0xD8) {
            return execute ? undefined : `${pcText}, CLD`;
        }
        //CLI
        else if (opcode == 0x58) {
            return execute ? undefined : `${pcText}, CLI`;
        }
        //CLV
        else if (opcode == 0xD8) {
            return execute ? undefined : `${pcText}, CLV`;
        }
        //SEC
        else if (opcode == 0x38) {
            return execute ? undefined : `${pcText}, SEC`;
        }
        //SED
        else if (opcode == 0xF8) {
            return execute ? undefined : `${pcText}, SED`;
        }
        //SEI
        else if (opcode == 0x78) {
            return execute ? undefined : `${pcText}, SEI`;
        }
        //DEX
        else if (opcode == 0xCA) {
            return execute ? undefined : `${pcText}, DEX`;
        }
        //DEY
        else if (opcode == 0x88) {
            return execute ? undefined : `${pcText}, DEY`;
        }
        //INX
        else if (opcode == 0xE8) {
            return execute ? undefined : `${pcText}, INX`;
        }
        //INY
        else if (opcode == 0xC8) {
            return execute ? undefined : `${pcText}, INY`;
        }
        //NOP
        else if (opcode == 0xEA) {
            return execute ? undefined : `${pcText}, NOP`;
        }

        //B__
        else if ((opcode & 0x0F) == 0x00) {
            let addressingMode: AddressingMode = "Relative";
            return execute ? undefined : `${pcText}, B__ ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
        }
        //
        else if ((opcode & 0xE0) == 0xE0) {
            let addressingMode: AddressingMode | undefined = undefined;
            //CPX
            if ((opcode & 0x03) == 0x00) {
                addressingMode = this.getAddressingMode(opcode, "Y");
                return execute ? undefined : `${pcText}, CPX ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //SBC
            if ((opcode & 0x03) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
                return execute ? undefined : `${pcText}, SBC ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //INC
            if ((opcode & 0x03) == 0x02) {
                addressingMode = this.getAddressingMode(opcode, "X");
                return execute ? undefined : `${pcText}, INC ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
        }
        //
        else if ((opcode & 0xE0) == 0xC0) {
            let addressingMode: AddressingMode | undefined = undefined;
            //CMP
            if ((opcode & 0x03) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
                return execute ? undefined : `${pcText}, CMP ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
        }
        //0b10100000 (Load)
        else if ((opcode & 0xE0) == 0xA0) {
            let addressingMode: AddressingMode | undefined = undefined;
            //LDA
            if ((opcode & 0x03) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
                return execute ? undefined : `${pcText}, LDA ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //LDX
            else if ((opcode & 0x03) == 0x02) {
                addressingMode = this.getAddressingMode(opcode, "X");
                return execute ? undefined : `${pcText}, LDX ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //LDY
            else if ((opcode & 0x03) == 0x00) {
                addressingMode = this.getAddressingMode(opcode, "Y");
                return execute ? undefined : `${pcText}, LDY ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
        }
        //0b10000000 (Store)
        else if ((opcode & 0xE0) == 0x80) {
            let addressingMode: AddressingMode | undefined = undefined;
            //STA
            if ((opcode & 0x03) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
                return execute ? undefined : `${pcText}, STA ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //STX
            else if ((opcode & 0x03) == 0x02) {
                addressingMode = this.getAddressingMode(opcode, "X");
                return execute ? undefined : `${pcText}, STX ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //STY
            else if ((opcode & 0x03) == 0x00) {
                addressingMode = this.getAddressingMode(opcode, "Y");
                return execute ? undefined : `${pcText}, STY ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
        }
        //
        else if ((opcode & 0xE0) == 0x60) {
            let addressingMode: AddressingMode | undefined = undefined;
            //ADC
            if ((opcode & 0x03) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
                return execute ? undefined : `${pcText}, ADC ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
        }
        //
        else if ((opcode & 0xE0) == 0x40) {
            let addressingMode: AddressingMode | undefined = undefined;
            //EOR
            if ((opcode & 0x03) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
                return execute ? undefined : `${pcText}, EOR ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //LSR
            if ((opcode & 0x03) == 0x02) {
                addressingMode = this.getAddressingMode(opcode, "X");
                return execute ? undefined : `${pcText}, LSR ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
        }
        //
        else if ((opcode & 0xE0) == 0x20) {
            let addressingMode: AddressingMode | undefined = undefined;
            //AND
            if ((opcode & 0x03) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
                return execute ? undefined : `${pcText}, AND ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //ROL
            if ((opcode & 0x03) == 0x02) {
                addressingMode = this.getAddressingMode(opcode, "X");
                return execute ? undefined : `${pcText}, ROL ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
        }
        //0b00000000 (Load)
        else if ((opcode & 0xE0) == 0x00) {
            let addressingMode: AddressingMode | undefined = undefined;
            //ORA
            if ((opcode & 0x03) == 0x01) {
                addressingMode = this.getAddressingMode(opcode, "A");
                return execute ? undefined : `${pcText}, ORA ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
            //ASL
            if ((opcode & 0x03) == 0x02) {
                addressingMode = this.getAddressingMode(opcode, "X");
                return execute ? undefined : `${pcText}, ASL ${addressingMode}: ${this.addressToString(this.getAddress(addressingMode, execute))}`;
            }
        }

        return `${pcText}`;
        //throw new Error(`Unknown opcode`);
    }

    /**
     * PCの値は第一オペランドのアドレスを指すこと
     * 終了時は次の命令のアドレスを指す
     * @param addressingMode 
     * @returns 
     */
    private getAddress(addressingMode: AddressingMode, execute: boolean = true) {
        let tempAddress: number = 0;
        let address: Address | undefined = undefined;
        switch (addressingMode) {
            case "Implied":
                break;
            case "Accumulator":
                break;
            case "Immediate":
                address = this._register.programCounter;
                break;
            case "ZeroPage":
                address = this.readMemory(this._register.programCounter);
                break;
            case "ZeroPageX":
                address = this.readMemory(this._register.programCounter) + this._register.indexRegisterX;
                break;
            case "ZeroPageY":
                address = this.readMemory(this._register.programCounter) + this._register.indexRegisterY;
                break;
            case "Relative":
                address = 0;
                break;
            case "Absolute":
                address = this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8);
                break;
            case "AbsoluteX":
                address = this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8) + this._register.indexRegisterX;
                break;
            case "AbsoluteY":
                address = this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8) + this._register.indexRegisterY;
                break;
            case "Indirect":
                if (execute) {
                    //間接参照
                    tempAddress = this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8);
                    address = this.readMemory(tempAddress) | (this.readMemory(tempAddress + 1) << 8);
                } else {
                    //間接参照
                    tempAddress = this.readMemory(this._register.programCounter) | (this.readMemory(this._register.programCounter++) << 8);
                    //address = this.readMemory(tempAddress) | (this.readMemory(tempAddress + 1) << 8);
                    address = tempAddress;
                }
                break;
            case "IndirectX":
                break;
            case "IndirectY":
                break;
            case "Unknown":
                break;
            default:
                throw new Error("Unknown addressing mode");
        }

        this._register.programCounter++;
        return address;
    }


    private getAddressingMode(opcode: number, type: AddressingType): AddressingMode {
        opcode = opcode & 0x1F;
        opcode = opcode >> 2;
        //console.log("opcode:", opcode.toString(16));

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
                return "Accumulator";
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

        return "Unknown";
        //throw new Error("Unknown addressing mode");

    }

    /**
     * ジャンプ
     * @param addressingMode 
     */
    private jmp(addressingMode: AddressingMode) {
        let address = this.getAddress(addressingMode);
        if (address == undefined) {
            throw new Error("Address is undefined");
        }
        this._register.programCounter = address;
    }
}