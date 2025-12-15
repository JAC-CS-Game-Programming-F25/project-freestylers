import Animation from '../../../lib/Animation.js';
import Input from "../../../lib/Input.js";
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from "../../globals.js";
import PlayerBaseState from './PlayerBaseState.js';

export default class PlayerIdlingState extends PlayerBaseState {
    constructor(player) {
        super(player);
        this.animation = new Animation([0], 1);
    }

    enter() {
        this.player.currentAnimation = this.animation;
    }

    handleJump() {
        const jumpKey = this.player.flipped ? Input.KEYS.ARROW_UP : Input.KEYS.W;

        if (input.isKeyHeld(jumpKey)) {
            this.player.changeState(PlayerStateName.Jumping);
        } 
    }

    update(dt) {
        super.update(dt);
        this.handleJump();
    }
}
