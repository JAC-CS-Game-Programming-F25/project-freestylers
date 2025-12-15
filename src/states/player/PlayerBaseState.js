import State from "../../../lib/State.js";
import Input from "../../../lib/Input.js";
import { input, sounds } from "../../globals.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerBaseState extends State {
    constructor(player) {
        super();
        this.player = player;
    }

    handleShooting() {
        // Determine which key is the shoot key
        const shootKey = this.player.flipped ? Input.KEYS.ENTER : Input.KEYS.SPACE;

        if (input.isKeyHeld(shootKey)) {
            if (!this.player.armRaised) this.player.raiseArm();
        } else {
            if (this.player.armRaised) {
                this.player.lowerArm();
                this.player.shoot();
                sounds.play(SoundName.LaserShot);
            }
        }
    }

    enter() { }
    exit() { }
    update(dt) { 
        this.handleShooting();
    }
}