import { CPU } from "./cpu";
import { RAM } from "./ram";
import { ROM } from "./rom";

export class NES {
    private _masterClock: number = 236250000 / 11;
    private _cpuClock = this._masterClock / 12;
    private _ppuClock = this._masterClock / 4;
    private _cpu: CPU;
    private _wram: RAM;
    private _vram: RAM;
    private _rom: ROM;

    constructor() {
        this._wram = new RAM();
        this._vram = new RAM();
        this._rom = new ROM();
        this._cpu = new CPU(this);
    }

    /**
     * ROMの挿入
     * @param romData 
     * @param debugCanvas
     */
    insertROM(romData: Uint8Array, debugCanvas: HTMLCanvasElement | undefined = undefined) {
        this._rom.load(romData, debugCanvas);
    }

    /**
     * WRAMの読み込み
     * @param address 
     * @returns 
     */
    readWRAM(address: number) {
        return this._wram.read(address);
    }

    /**
     * PRG-ROMの読み込み(アドレスは0x00スタート)
     * @param address 
     * @returns 
     */
    readPRGROM(address: number) {
        return this._rom.readPrgrom(address);
    }

    /**
     * NESの起動
     */
    start() {
        console.log("NES started");
        this._cpu.start();
    }

    initDeAssemble() {
        this._cpu.setPCto0x8000();
    }

    deAssemble() {
        return this._cpu.execute(false);
    }
}