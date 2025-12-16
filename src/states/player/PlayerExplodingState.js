import Animation from '../../../lib/Animation.js';
import PlayerBaseState from './PlayerBaseState.js';

export default class PlayerExplodingState extends PlayerBaseState {
    constructor(player) {
        super(player);
        this.explosionAnimation = new Animation([2, 3, 4, 5, 6, 7, 8, 9], 0.03, 1);
    }

    update(dt) {
        this.explosionAnimation.update(dt);
        this.explosionFrame = this.explosionAnimation.getCurrentFrame();
        if (this.explosionAnimation.isDone()) {
            this.player.isAlive = false;
        }
    }
}
