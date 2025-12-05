import Rectangle from './Rectangle.js';
import { context } from '../globals.js';

export default class Obstacle extends Rectangle {
    constructor(x, y, width, height, sprite) {
        super(x, y, width, height, {
            density: 0.001,
            friction: 0.5,
            restitution: 0.3,
            label: 'obstacle'
        });

        this.sprite = sprite;
        this.renderOffset = { x: -width / 2, y: -height / 2 };
    }

    render() {
        super.render();

        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.body.position.x + this.renderOffset.x,
                this.body.position.y + this.renderOffset.y,
                this.width,
                this.height
            );
        }
    }
}
