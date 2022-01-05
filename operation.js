import {
  bg,
  pipes,
  fg,
  bird,
  getReady,
  gameOver,
  score,
  context,
  canvas,
} from "./drawings.js";

export function update() {
  bird.update();
  fg.update();
  pipes.update();
}

export function draw() {
  context.fillStyle = "#70c5ce"; // sky color
  context.fillRect(0, 0, canvas.width, canvas.height);

  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}
