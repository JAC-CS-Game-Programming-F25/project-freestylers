import State from "../../../lib/State.js";
import Input from "../../../lib/Input.js";
import { input, sounds } from "../../globals.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerBaseState extends State {
    constructor(player) {
        super();
        this.player = player;

        // AI shooting hold
        this.aiShooting = false;
        this.aiShootHoldTime = 0;
        this.aiShootDuration = 0.5; // seconds to hold before shooting

        // Human shooting cooldown
        this.shootCooldown = 0.3;
        this.timeSinceLastShot = 0;
    }

    handleShooting(dt) {
        const shootKey = this.player.flipped ? Input.KEYS.ENTER : Input.KEYS.SPACE;

        if (this.player.isAI) {
            if (!this.aiShooting) {
                this.aiShooting = true;
                this.aiShootHoldTime = 0;
                if (!this.player.armRaised) this.player.raiseArm();
            } else {
                this.aiShootHoldTime += dt;
                if (this.aiShootHoldTime >= this.aiShootDuration) {
                    this.player.lowerArm();
                    this.player.shoot();
                    sounds.play(SoundName.LaserShot);
                    this.aiShooting = false;
                    this.aiShootHoldTime = 0;
                }
            }
        } else {
            this.timeSinceLastShot += dt;

            if (input.isKeyHeld(shootKey)) {
                if (!this.player.armRaised) this.player.raiseArm();
            } else {
                if (this.player.armRaised && this.timeSinceLastShot >= this.shootCooldown) {
                    this.player.lowerArm();
                    this.player.shoot();
                    sounds.play(SoundName.LaserShot);
                    this.timeSinceLastShot = 0;
                }
            }
        }
    }

    update(dt) {
        super.update(dt);
        this.handleShooting(dt);
    }
}
