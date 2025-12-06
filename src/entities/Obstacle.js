import Rectangle from './Rectangle.js';
import Sprite from '../../lib/Sprite.js';
import ImageName from '../enums/ImageName.js';
import { world, images, context } from '../globals.js';

export default class Obstacle extends Rectangle {
    constructor(x, y, width, height, imageName) {
    try {
        super(x, y, width, height, {
            density: 0.000000000000000000001,
            friction: 0.5,
            restitution: 0.3,
            frictionAir: 0.9,
            label: 'obstacle'
        });
        
       
        this.sprites = [
            new Sprite(
                images.get(imageName),
                0, 0,
                width,
                height
            )
        ];
        
        console.log('Sprites created:', this.sprites);
        this.currentFrame = 0;
    } catch(error) {
        console.error('Error in Obstacle constructor:', error);
        throw error;
    }
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
