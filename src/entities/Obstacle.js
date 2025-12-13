import Rectangle from './Rectangle.js';
import Sprite from '../../lib/Sprite.js';
import { images } from '../globals.js';

export default class Obstacle extends Rectangle {
	constructor(x, y, width, height, imageName) {
		super(x, y, width, height, {
			isStatic: true,
			density: 1e-21,
			friction: 0.5,
			restitution: 0.3,
			frictionAir: 0.9,
			label: 'obstacle',
		});

		this.currentFrame = 0;

		this.sprites = [
			new Sprite(
				images.get(imageName),
				0,
				0,
				width,
				height
			),
		];
	}
}
