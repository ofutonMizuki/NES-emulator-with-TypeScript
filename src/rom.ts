export class ROM{
    private _chrrom: Uint8Array;
    private _prgrom: Uint8Array;

    /**
     * コンストラクタ
     * @param romData 
     */
    constructor(romData: Uint8Array | undefined = undefined){
        this._chrrom = new Uint8Array();
        this._prgrom = new Uint8Array();

        if(romData){
            this.load(romData);
        }
    }

    /**
     * ROMの読み込み
     * @param romData 
     */
    load(romData: Uint8Array){
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
    }

    /**
     * プログラムROMの読み取り
     * @param address 
     * @returns 
     */
    readPrgrom(address: number): number{
        return this._prgrom[address];
    }

    /**
     * キャラクタROMの読み取り
     * @param address 
     * @returns 
     */
    readchrrom(address: number): number{
        return this._chrrom[address];
    }
}