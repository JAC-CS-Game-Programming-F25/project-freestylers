import PowerUp from "./PowerUp.js";

export default class JumpBoost extends PowerUp {
    constructor(x, y, width, height, name) {
        super(x, y, width, height, name);
    }

    collect(player) {
        if (!player || !player.isAlive) return;

        player.glow = true;

        player.jumpPower *= 2;
        this.addTask(() => {
            player.jumpPower /= 2;
            console.log('done')
            player.glow = false;
        })
    }

}
