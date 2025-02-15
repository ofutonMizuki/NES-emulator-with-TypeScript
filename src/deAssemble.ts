import { NES } from "./nes";
const nes = new NES();

window.onload = () => {
    const romFileInput = document.getElementById("rom-file") as HTMLInputElement;

    /**
     * ROMファイルが選択されたときの処理
     */
    romFileInput.addEventListener("change", async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) {
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const romData = new Uint8Array(arrayBuffer);

            // Insert the ROM into the NES
            nes.insertROM(romData);
            nes.initDeAssemble();

            let log = nes.deAssemble();

            console.log(log);
        } catch (error) {
            console.error("Error loading ROM:", error);
        }
    });
};