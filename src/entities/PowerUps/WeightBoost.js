import PowerUp from "./PowerUp.js";
import { matter } from "../../globals.js";
import Character from "../Character.js";

export default class WeightBoost extends PowerUp {
    constructor(x, y, width, height, name) {
        super(x, y, width, height, name);
        this.glowColor = 'rgba(247, 0, 255, 1)';
    }

    collect(player) {
        if (!player || !player.isAlive) return;
        const { Body } = matter;

        player.glow = true;

        Body.setDensity(player.body, Character.DENSITY * 4);

        this.addTask(() => {
            Body.setDensity(player.body, Character.DENSITY);
            player.glow = false;
        })
    }

}