export class ROM {
    private _chrrom: Uint8Array;
    private _prgrom: Uint8Array;

    /**
     * コンストラクタ
     * @param romData 
     */
    constructor(romData: Uint8Array | undefined = undefined) {
        this._chrrom = new Uint8Array();
        this._prgrom = new Uint8Array();

        if (romData) {
            this.load(romData);
        }
    }

    /**
     * ROMの読み込み
     * @param romData 
     */
    load(romData: Uint8Array, debugCanvas: HTMLCanvasElement | undefined = undefined) {
        //ヘッダの読み取り
        let romHeader = romData.slice(0, 0x10);
        console.log("ROM size:", romData.length);
        console.log("ROM header:", romHeader);

        //ヘッダの読み取りとサイズの計算
        let chRomPages = romHeader[5];
        let chRomStart = 0x0010 + romHeader[4] * 0x4000;
        let chRomEnd = chRomStart + chRomPages * 0x2000;

        //PRG-ROMとCHR-ROMの分割
        this._prgrom = romData.slice(0x0010, chRomStart);
        this._chrrom = romData.slice(chRomStart, chRomEnd);

        if (debugCanvas) {
            let length = this._chrrom.length;
            console.log("CHR-ROM size:", length);
            let context = debugCanvas.getContext("2d");
            if (!context) {
                throw new Error("Could not get 2D context");
            }
            context.fillStyle = "black";
            context.fillRect(0, 0, 256, 256);

            this._chrrom.forEach((value, index) => {
                let x = Math.floor(index / 8);
                let y = Math.floor(index / 128);
                for (let i = 0; i < 8; i++) {
                    if (value >> i & 0x01) {
                        context.fillStyle = "white";
                        context.fillRect((x * 16) % 256 + i * 2, y * 16 + (index % 8) * 2, 2, 2);
                    }
                }
            })
        }
    }

    /**
     * プログラムROMの読み取り
     * @param address 
     * @returns 
     */
    readPrgrom(address: number): number {
        return this._prgrom[address];
    }

    /**
     * キャラクタROMの読み取り
     * @param address 
     * @param debugCanvas
     * @returns 
     */
    readchrrom(address: number): number {
        return this._chrrom[address];
    }
}