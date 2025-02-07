import { NES } from "./nes";
const nes = new NES();

function main() {
    console.log("Hello, NES Emulator!");
    //alert("Hello, NES Emulator!");

    try {
        const canvas = document.getElementById("screen") as HTMLCanvasElement;
        const context = canvas.getContext("2d");
    
        if (!context) {
            throw new Error("Could not get 2D context");
        }
    
        context.fillStyle = "black";
        context.fillRect(0, 0, 256, 240);
    } catch (error) {
        alert("Error: " + (error as Error).stack);
    }
}

window.onload = () => {
    const romFileInput = document.getElementById("rom-file") as HTMLInputElement;
    const debugCanvas = document.getElementById("chrrom-canvas") as HTMLCanvasElement;

    romFileInput.addEventListener("change", async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) {
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const romData = new Uint8Array(arrayBuffer);

            // Insert the ROM into the NES
            nes.insertROM(romData, debugCanvas);

        } catch (error) {
            console.error("Error loading ROM:", error);
        }
    });

    // Start the NES when the start button is clicked
    const startButton = document.getElementById("start-button") as HTMLButtonElement;
    startButton.addEventListener("click", () => {
        nes.start();
    });


    main();
};