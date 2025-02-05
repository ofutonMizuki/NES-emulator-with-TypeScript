import { CPU } from "./cpu";

class NES {
    private _masterClock: number = 236250000 / 11;
    private _cpuClock = this._masterClock / 12;
    private _ppuClock = this._masterClock / 4;
    private _cpu: CPU;
    constructor(){
        this._cpu = new CPU();
    }
}