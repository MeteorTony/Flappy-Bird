import {draw, update} from "./drawings.js";

export let frames = 0;

function gameLoop(){
    update();
    draw();
    frames++;
    window.requestAnimationFrame(gameLoop);
}

gameLoop();





