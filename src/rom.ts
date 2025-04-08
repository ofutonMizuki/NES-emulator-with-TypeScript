export class ROM {
    private _chrrom: Uint8Array;
    private _prgrom: Uint8Array;
    private _prgromSize: number;

    /**
     * プログラムROMのサイズ
     */
    get programSize() {
        return this._prgromSize * 0x4000;
    }

    get prgrom() {
        return this._prgrom;
    }

    /**
     * コンストラクタ
     * @param romData 
     */
    constructor(romData: Uint8Array | undefined = undefined) {
        this._chrrom = new Uint8Array();
        this._prgrom = new Uint8Array();
        this._prgromSize = 0;

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
        this._prgromSize = romHeader[4];
        let chRomPages = romHeader[5];
        let chRomStart = 0x0010 + romHeader[4] * 0x4000;
        let chRomEnd = chRomStart + chRomPages * 0x2000;

        //PRG-ROMとCHR-ROMの分割
        this._prgrom = romData.slice(0x0010, chRomStart);
        console.log("PRG-ROM size: ", this._prgrom.length);
        this._chrrom = romData.slice(chRomStart, chRomEnd);

        if (debugCanvas) {
            let length = this._chrrom.length;
            console.log("CHR-ROM size:", length);
            let context = debugCanvas.getContext("2d");
            if (!context) {
                throw new Error("Could not get 2D context");
            }
            context.fillStyle = "black";
            context.fillRect(0, 0, 512, 256);

            for (let i = 0; i < Math.floor(length / 16); i++) {
                //スプライトの初期化
                let sprite: number[][] = new Array(8);
                for (let j = 0; j < 16; j++) {
                    sprite[j] = new Array(8);
                    for (let k = 0; k < 8; k++) {
                        sprite[j][k] = 0;
                    }
                }

                //スプライトの描画
                for (let j = 0; j < 8; j++) {
                    let s1 = this._chrrom[i * 16 + j];
                    let s2 = this._chrrom[i * 16 + j + 8];

                    for (let k = 0; k < 8; k++) {
                        sprite[j][k] += (s1 >> (7 - k)) & 0x01;
                        sprite[j][k] += (s2 >> (7 - k)) & 0x01;
                    }
                }

                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        context.fillStyle = 'rgb(' + sprite[y][x] * 64 + ',' + sprite[y][x] * 64 + ',' + sprite[y][x] * 64 + ')';
                        context.fillRect(((i % 64) * 8 + x), (y + Math.floor(i / 64) * 8), 1, 1);
                    }
                }
            }
        }
    }

    /**
     * プログラムROMの読み取り
     * @param address 
     * @returns 
     */
    readPrgrom(address: number): number {
        return (this._prgromSize == 1) ? (this._prgrom[address & 0x3FFF]) : (this._prgrom[address]);
    }

    /**
     * キャラクタROMの読み取り
     * @param address 
     * @param debugCanvas
     * @returns 
     */
    readChrrom(address: number): number {
        return this._chrrom[address];
    }
}