import { CPU } from "./cpu";
import { RAM } from "./ram";

export class NES {
    private _masterClock: number = 236250000 / 11;
    private _cpuClock = this._masterClock / 12;
    private _ppuClock = this._masterClock / 4;
    private _cpu: CPU;
    private _wram: RAM;
    private _vram: RAM;
    constructor() {
        this._wram = new RAM();
        this._vram = new RAM();
        this._cpu = new CPU(this._wram);
    }
}