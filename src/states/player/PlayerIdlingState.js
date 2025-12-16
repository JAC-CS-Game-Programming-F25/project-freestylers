import Animation from '../../../lib/Animation.js';
import Input from "../../../lib/Input.js";
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from "../../globals.js";
import PlayerBaseState from './PlayerBaseState.js';

export default class PlayerIdlingState extends PlayerBaseState {
    constructor(player) {
        super(player);
        this.animation = new Animation([0], 1);

        // AI jump timer
        this.aiJumpTimer = 0;
        this.aiJumpInterval = this.getRandomJumpInterval();
    }

    enter() {
        this.player.currentAnimation = this.animation;

        // Reset AI timer
        this.aiJumpTimer = 0;
        this.aiJumpInterval = this.getRandomJumpInterval();
    }

    getRandomJumpInterval() {
        return 10 + Math.random() * 2;
    }

    handlePlayerJump() {
        const jumpKey = this.player.flipped ? Input.KEYS.ARROW_UP : Input.KEYS.W;
        if (input.isKeyHeld(jumpKey)) {
            this.player.changeState(PlayerStateName.Jumping);
        }
    }

    handleAIJump(dt) {
        // Increment timer
        this.aiJumpTimer += dt;

        if (this.aiJumpTimer >= this.aiJumpInterval) {
            this.player.changeState(PlayerStateName.Jumping);
            this.aiJumpTimer = 0;
            this.aiJumpInterval = this.getRandomJumpInterval();
        }
    }

    handleJump(dt) {
        if (this.player.isAI) {
            this.handleAIJump(dt);
        } else {
            this.handlePlayerJump();
        }
    }

    update(dt) {
        super.update(dt);
        this.handleJump(dt);
    }
}