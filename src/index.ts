console.log("Hello, NES Emulator!");

const canvas = document.getElementById("screen") as HTMLCanvasElement;
const context = canvas.getContext("2d");

if (!context) {
    throw new Error("Could not get 2D context");
}

context.fillStyle = "black";
context.fillRect(0, 0, 256, 240);