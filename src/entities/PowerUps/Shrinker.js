import PowerUp from "./PowerUp.js";
import { timer } from "../../globals.js";
import Easing from "../../../lib/Easing.js";

export default class Shrinker extends PowerUp {
    collect(player) {
        if (!player || !player.isAlive) return;

        player.glow = true;

        timer.tween(
            player.scaleTween,
            { value: 0.6 },
            0.2,
            Easing.easeOutBack
        );

        timer.addTask(
            () => player.applyScale(),
            0,
            0.2
        );

        timer.wait(this.duration).then(() => {
            timer.tween(
                player.scaleTween,
                { value: 1 },
                0.2,
                Easing.easeOutBack,
                () => {
                    player.glow = false;
                }
            );

            timer.addTask(
                () => player.applyScale(),
                0,
                0.2
            );
        });
    }
}
