import { CANVAS_HEIGHT, context, matter } from '../globals.js';
import Rectangle from './Rectangle.js';

const { Body } = matter;
export default class Character extends Rectangle {
	static WIDTH = 16;
    static HEIGHT = 36;
    static MAX_TILT = 0.35;
    
    constructor(x, y, sprites, flipped, gun = null) {
		super(
			x - Character.WIDTH / 2,
			y - Character.HEIGHT / 2,
			Character.WIDTH,
			Character.HEIGHT,
			{
				density: 0.002,
				friction: 0.5,
				restitution: 0.2,
				label: 'character',
			}
		);

		this.width = Character.WIDTH;
		this.height = Character.HEIGHT;

		this.sprites = sprites;
		this.flipped = flipped;
        this.direction = this.flipped ? -1 : 1;

		this.isAlive = true;

		this.jumpPower = 0.03;

		this.gun = gun;

		this.armRaised = false;
		this.armAngle = 0;
		this.armTargetAngle = 0;
		this.armSpeed = 0.02;

        this.armOffset = { x: 1, y: -5 };
        this.gunOffset = { x: -2, y: -9 }

        this.isGrounded = true;
	}

    update(dt) {
        if (!this.isAlive) return;
        if (this.body.position.y >= 135) {
            this.isGrounded = true;
        }
        else {
            this.isGrounded = false;
        }
        
        this.tilt(dt);

        // ARM INTERPOLATION
        if (this.armAngle < this.armTargetAngle) {
            this.armAngle = Math.min(this.armAngle + this.armSpeed, this.armTargetAngle);
        } else if (this.armAngle > this.armTargetAngle) {
            this.armAngle = Math.max(this.armAngle - this.armSpeed, this.armTargetAngle);
        }

        // Update gun
        if (this.gun) {
            this.gun.update(dt);
        }
    }

    raiseArm() {
        this.armRaised = true;
        this.armTargetAngle = -Math.PI / 2; // -90 degrees (raised up)
    }

    lowerArm() {
        this.armRaised = false;
        this.armTargetAngle = 0; // 0 degrees (down)
    }

    // Shoot and return the bullet (PlayState will manage it)
    shoot() {
        if (this.gun) {
            return this.gun.shoot();
        }
        return null;
    }

    jump() {
        if (!this.isGrounded) {
            return;
        }

        const tiltRatio = Math.max(
            -1,
            Math.min(1, this.body.angle / Character.MAX_TILT)
        );
        const HORIZONTAL_JUMP_FORCE = 0.02;

        const jumpForce = {
            x: tiltRatio * HORIZONTAL_JUMP_FORCE,
            y: -this.jumpPower
        };

        Body.applyForce(this.body, this.body.position, jumpForce);
    }

    render() {
        if (!this.isAlive) return;
        // we wont call super.render since we want to render multiple sprites together, ie the body, the arm and the gun

        context.save();
		context.translate(this.body.position.x, this.body.position.y);
        context.rotate(this.body.angle);
        if (this.flipped) {
            context.scale(-1, 1);
        }
		this.sprites[this.currentFrame].render(this.renderOffset.x, this.renderOffset.y);
        context.rotate(this.armAngle);
        this.sprites[1].render(this.armOffset.x, this.armOffset.y);
        if (this.gun) {
            context.rotate(Math.PI / 2);
            this.gun.sprite.render(this.gunOffset.x, this.gunOffset.y);
        }
		context.restore();
    }


    setGun(gun) {
        this.gun = gun;
    }

    destroy() {
        this.isAlive = false;
    }

    isDead(){
        return this.body.position.y > CANVAS_HEIGHT/2 + 30;
    }

    tilt(dt) {
        if (!this.isGrounded) {
            return;
        }
        const RETURN_STRENGTH = 0.15;
        const OSC_SPEED = 2.0; // radians per second

        this.tiltTime ??= 0;
        this.tiltTime += dt;

        let targetAngle =
            Math.sin(this.tiltTime * OSC_SPEED) * Character.MAX_TILT * this.direction;

        const diff = targetAngle - this.body.angle;
        Body.setAngularVelocity(this.body, diff * RETURN_STRENGTH);
    }
    
    /**
     * Respawn the character at the given position, called at the beginning of each round
     * @param {number} x The x coordinate of the new position.
     * @param {number} y The y coordinate of the new position.
     */
    respawn(x, y) {
        this.isAlive = true;
        
        // Reset body position, velocity, and angle
        matter.Body.setPosition(this.body, { x, y });
        matter.Body.setVelocity(this.body, { x: 0, y: 0 });
        matter.Body.setAngle(this.body, 0);
        matter.Body.setAngularVelocity(this.body, 0);
        
        // Wake up the body in case it was sleeping
        matter.Body.setStatic(this.body, false);
        
        // Reset arm state
        this.armRaised = false;
        this.armAngle = 0;
        this.armTargetAngle = 0;
    }
}