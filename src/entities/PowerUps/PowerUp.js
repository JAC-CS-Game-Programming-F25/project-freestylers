import Rectangle from '../Rectangle.js';
import Sprite from '../../../lib/Sprite.js';
import { images } from '../../globals.js';

export default class PowerUp extends Rectangle {
    constructor(x, y, width, height, name) {
        super(x, y, width, height, {
            density: 1e-21,
            friction: 0.5,
            restitution: 0.3,
            frictionAir: 0.9,
            label: 'powerUp',
        });
        this.duration = 10;
        this.currentFrame = 0;

        this.sprites = [
            new Sprite(
                images.get(name),
                0,
                0,
                width,
                height
            ),
        ];
    }

    /**
     * Applies the power-up effect to the player.
     * Each subclass should override this.
     * @param {Character} player
     */
    collect(player) {
        throw new Error("collect() must be implemented in subclass");
    }
}
