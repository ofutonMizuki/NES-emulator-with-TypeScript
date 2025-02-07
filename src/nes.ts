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
        this._cpu = new CPU(this._wram);
        this._rom = new ROM();
    }

    insertROM(romData: Uint8Array, debugCanvas: HTMLCanvasElement | undefined = undefined) {
        this._rom.load(romData, debugCanvas);
    }

    start() {
        console.log("NES started");
    }
}