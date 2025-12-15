import PowerUp from "./PowerUp.js";
import { timer } from '../../globals.js';

export default class BigJump extends PowerUp {
    constructor(x, y, width, height, name) {
        super(x, y, width, height, name);
    }

    collect(player) {
        if (!player || !player.isAlive) return;

        player.glow = true;

        player.jumpPower *= 2;

        // Remove effect after duration
        timer.addTask(
            () => {}, // no interval action
            0,
            this.duration,
            () => {
                player.jumpPower /= 2;
                console.log('done')
                player.glow = false;
            }
        );
    }

}
