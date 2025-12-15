import Animation from '../../../lib/Animation.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import PlayerBaseState from './PlayerBaseState.js';

export default class PlayerJumpingState extends PlayerBaseState {
    constructor(player) {
        super(player);
        this.animation = new Animation([0, 1], 0.1, 1);
    }

    enter() {
        this.player.currentAnimation = this.animation;
        this.player.jump();
    }

    update() {
        super.update();
        if (this.player.isGrounded) {
            this.player.changeState(PlayerStateName.Idling);
        }
    }
}
