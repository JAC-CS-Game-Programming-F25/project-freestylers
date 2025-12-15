import Rectangle from '../Rectangle.js';
import Sprite from '../../../lib/Sprite.js';
import { images } from '../../globals.js';
import { timer } from '../../globals.js';

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
        this.glowRadius = width/2;
        this.glowColor = 'rgba(0, 255, 255, 1)';

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

    addTask(onPowerUpEnd) {
        timer.addTask(
            () => {}, 0, this.duration,
            onPowerUpEnd
        );
    }

    /**
     * Applies the power-up effect to the player.
     * Each subclass should override this.
     * @param {Character} player
     */
    collect(player) {
        throw new Error("collect() must be implemented in subclass");
    }

    render() {
        const ctx = this.sprites[0].graphic.context;
        
        const { x, y } = this.body.position;

        ctx.save();

        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;

        ctx.shadowBlur = 15;
        ctx.shadowColor = this.glowColor;

        ctx.beginPath();
        ctx.arc(x, y, this.glowRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.translate(x, y);
        this.sprites[0].render(
            -this.width / 2,
            -this.height / 2
        );
        ctx.restore();
    }

}
