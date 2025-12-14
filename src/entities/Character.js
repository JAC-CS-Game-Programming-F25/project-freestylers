import { CANVAS_HEIGHT, context, matter } from '../globals.js';
import Rectangle from './Rectangle.js';

const { Body } = matter;
export default class Character extends Rectangle {
	constructor(x, y, width, height, sprites, world, flipped, gun = null) {
		// Collider sizes
		const colliderHeight = height * 0.9;
		const colliderWidth = width * 0.4;

		super(
			x - colliderWidth / 2,
			y - colliderHeight / 2,
			colliderWidth,
			colliderHeight,
			{
				density: 0.002,
				friction: 0.5,
				restitution: 0.2,
				label: 'character',
			}
		);

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.colliderHeight = colliderHeight;
		this.colliderWidth = colliderWidth;

		this.sprites = sprites;
		this.world = world;
		this.flipped = flipped;

		this.currentSprite = sprites.idle || sprites.default;

		this.spriteOffsetX = this.flipped ? -6 : 6;
		this.isAlive = true;

		this.jumpPower = 0.03;

		// GUN
		this.gun = gun;

		// ARM
		this.armSprite = sprites.arm || null;
		this.armRaised = false;
		this.armAngle = 0;
		this.armTargetAngle = 0;
		this.armSpeed = 0.02;
		this.armWidth = 32;
		this.armHeight = 32;
		this.armPivotOffset = 15;

		this.armOffsetX = this.flipped ? 5 : -4;
		this.armOffsetY = -15;

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

        // ARM INTERPOLATION - smoothly rotate arm to target angle
        if (this.armAngle < this.armTargetAngle) {
            this.armAngle = Math.min(this.armAngle + this.armSpeed, this.armTargetAngle);
        } else if (this.armAngle > this.armTargetAngle) {
            this.armAngle = Math.max(this.armAngle - this.armSpeed, this.armTargetAngle);
        }

        this.x = this.body.position.x;
        this.y = this.body.position.y;

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
            const bullet = this.gun.shoot();
            return bullet;
        }
        return null;
    }

    jump() {
        if (!this.isGrounded) {
            return;
        }
        const MAX_TILT = 0.35; // same as tilt system

        const tiltRatio = Math.max(
            -1,
            Math.min(1, this.body.angle / MAX_TILT)
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

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.body.angle);

        // Draw character sprite
        if (this.currentSprite) {
            context.drawImage(
                this.currentSprite,
                -this.width / 2 + this.spriteOffsetX,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            context.fillStyle = 'red';
            context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        // Draw arm sprite
        if (this.armSprite && this.armSprite.image) {
            context.save();
            
            // Move to shoulder position, then offset to pivot point
            context.translate(this.armOffsetX, this.armOffsetY + this.armPivotOffset);  
             if (this.flipped) {
                context.scale(-1, 1);
            }
            
            // Rotate arm
            context.rotate(this.armAngle);
            
            // Draw arm - move sprite up to compensate for pivot offset
            context.drawImage(
                this.armSprite.image,
                -this.armWidth / 2,
                -this.armPivotOffset,
                this.armWidth,
                this.armHeight
            );
            
            // DEBUG: Draw pivot point
            context.fillStyle = 'red';
            context.fillRect(-2, -2, 4, 4);
            context.restore();
        }

        // DEBUG HITBOX (aligned with matter.js)
        context.strokeStyle = "rgba(0,255,0,0.6)";
        context.lineWidth = 1;
 
        context.strokeRect(
            -this.colliderWidth / 2,
            -this.colliderHeight / 2,
            this.colliderWidth,
            this.colliderHeight
        );

        context.restore();

        if (this.gun) {
            this.gun.render();
        }
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
        const MAX_TILT = 0.35;
        const RETURN_STRENGTH = 0.15;
        const OSC_SPEED = 2.0; // radians per second

        this.tiltTime ??= 0;
        this.tiltTime += dt;

        let targetAngle =
            Math.sin(this.tiltTime * OSC_SPEED) * MAX_TILT;

        if (this.flipped) targetAngle *= -1;

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
        
        // Update x and y immediately so isDead() works correctly
        this.x = x;
        this.y = y;
        
        // Reset arm state
        this.armRaised = false;
        this.armAngle = 0;
        this.armTargetAngle = 0;
    }
}