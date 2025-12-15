import PowerUp from "./PowerUp.js";

export default class BigJump extends PowerUp {
    constructor(x, y, width, height, name) {
        super(x, y, width, height, name);
    }

    collect(player) {
        if (!player || !player.isAlive) return;

        // Make player glow
        player.glow = true;

        // Apply jump effect
        player.jumpPower *= 2;

        // Remove effect after duration
        gameTimer.addTask(
            () => {}, // no interval action
            0,
            this.duration,
            () => {
                player.jumpPower /= 2;
                player.glow = false;
            }
        );
    }

}
