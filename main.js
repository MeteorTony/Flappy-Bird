import { draw, update } from "./operation.js";

export let frames = 0;

function gameLoop() {
  update();
  draw();
  frames++;
  window.requestAnimationFrame(gameLoop);
}

gameLoop();
