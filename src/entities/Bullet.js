import Rectangle from "./Rectangle.js";
import Sprite from "../../lib/Sprite.js";
import { matter, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";

const { Body } = matter;

export default class Bullet extends Rectangle {
	constructor(
		x,
		y,
		width,
		height,
		spriteImage,
		velocityX,
		velocityY,
		shooter = null
	) {
		super(x, y, width, height, {
			label: "bullet",
			isSensor: true,
			friction: 0,
			frictionAir: 0.001,
			restitution: 0,
			density: 0.55,
		});

		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.shooter = shooter;

		this.currentFrame = 0;
		this.sprites = [
			new Sprite(
				spriteImage,
				0,
				0,
				width,
				height
			),
		];

		// Initial velocity
		Body.setVelocity(this.body, {
			x: this.velocityX,
			y: this.velocityY,
		});

		// Lifetime tracking
		this.lifetime = 0;
		this.maxLifetime = 5000; // ms
	}

	update(dt) {
		super.update(dt);

		Body.setVelocity(this.body, {
			x: this.velocityX,
			y: this.velocityY,
		});

		this.lifetime += dt;

		const { x, y } = this.body.position;
		if (
			x < -50 || x > CANVAS_WIDTH + 50 ||
			y < -50 || y > CANVAS_HEIGHT + 50 ||
			this.lifetime > this.maxLifetime
		) {
			this.shouldCleanUp = true;
		}
	}

	onCollision(otherBody) {
		this.shouldCleanUp = true;
	}
}
