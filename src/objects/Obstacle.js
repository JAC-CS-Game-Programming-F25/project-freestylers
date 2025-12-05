import Rectangle from './Rectangle.js';
import { world, images, context } from '../globals.js';
import Sprite from '../../lib/Sprite.js';
import ImageName from '../enums/ImageName.js';

export default class Obstacle extends Rectangle {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {string} imageName - ImageName.Barrel or ImageName.Box
     */
    constructor(x, y, width, height, imageName) {
    super(x, y, width, height, {
        density: 0.001,
        friction: 0.5,
        restitution: 0.3,
        label: 'obstacle'
    });

    // DEBUG: Check what we're getting
    console.log('Creating obstacle with imageName:', imageName);
    console.log('Image from images.get():', images.get(imageName));
    console.log('All available images:', Array.from(images.keys()));

    this.sprites = [
        new Sprite(
            images.get(imageName),
            0, 0,
            width,
            height
        )
    ];

    this.currentFrame = 0;
}

    render() {
        super.render();
    }
}
