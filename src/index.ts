import { NES } from "./nes";
const nes = new NES();

console.log("Hello, NES Emulator!");

const canvas = document.getElementById("screen") as HTMLCanvasElement;
const context = canvas.getContext("2d");

if (!context) {
    throw new Error("Could not get 2D context");
}

context.fillStyle = "black";
context.fillRect(0, 0, 256, 240);

const romFileInput = document.getElementById("rom-file") as HTMLInputElement;

romFileInput.addEventListener("change", async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
        return;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const romData = new Uint8Array(arrayBuffer);

        // ここで romData を使ってエミュレータを初期化・実行する
        console.log("ROM size:", romData.length);
        console.log("ROM header:", romData.slice(0, 16));

    } catch (error) {
        console.error("Error loading ROM:", error);
    }
});