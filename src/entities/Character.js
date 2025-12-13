import { CANVAS_HEIGHT, context, matter } from '../globals.js';
import Rectangle from './Rectangle.js';

const { Bodies, World, Body, Constraint } = matter;
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

		// ---- EXISTING STATE (UNCHANGED) ----
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

		this.jumpPower = 0.01;

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

		// ---- ANCHOR SETUP (UNCHANGED) ----
		this.anchorX = x;
		this.anchorY = y + this.colliderHeight / 2;

		this.anchor = Constraint.create({
			bodyA: this.body,
			pointA: { x: 0, y: this.colliderHeight / 2 },
			pointB: { x: this.anchorX, y: this.anchorY },
			length: 0,
			stiffness: 1,
			angularStiffness: 1,
		});

		this.isAttached = true;

		World.add(this.world, this.anchor);
	}
    update(dt) {
        if (!this.isAlive) return;

        // ARM INTERPOLATION - smoothly rotate arm to target angle
        if (this.armAngle < this.armTargetAngle) {
            this.armAngle = Math.min(this.armAngle + this.armSpeed, this.armTargetAngle);
        } else if (this.armAngle > this.armTargetAngle) {
            this.armAngle = Math.max(this.armAngle - this.armSpeed, this.armTargetAngle);
        }

        // WOBBLE (COMMENTED OUT)
        // if (this.isAttached) {
        //     this.currentWobble += this.wobbleSpeed * this.wobbleDirection;
        //     if (Math.abs(this.currentWobble) >= this.wobbleAmount) {
        //         this.wobbleDirection *= -1;
        //     }
        //     Body.setAngle(this.body, this.currentWobble);
        // }

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
        console.log('Character.shoot() called, has gun:', !!this.gun);
        if (this.gun) {
            const bullet = this.gun.shoot();
            console.log('Bullet created:', bullet);
            return bullet;
        }
        return null;
    }

    jump() {
        if (!this.isAttached) return;

        // detach from world feet
        World.remove(this.world, this.anchor);
        this.isAttached = false;

        // jumping force
        const jumpForce = {
            x: 0, // No wobble, so no X force
            y: -this.jumpPower * 5
        };

        Body.applyForce(this.body, this.body.position, jumpForce);

        // reattach after delay
        setTimeout(() => {
            if (this.isAlive && !this.isAttached) {
                this.anchor.pointB.x = this.body.position.x;
                this.anchor.pointB.y = this.body.position.y + this.colliderHeight / 2;

                World.add(this.world, this.anchor);
                this.isAttached = true;
            }
        }, 450);
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

        if (this.isAttached) {
            World.remove(this.world, this.anchor);
        }

        World.remove(this.world, this.body);
    }

    isDead(){
        // Check body position directly to avoid stale this.y values
        return this.body.position.y > CANVAS_HEIGHT/2 + 30;
    }

    
        /**
         * Respawn the character at the given position, called at the beginning of each round
         * @param {number} x The x coordinate of the new position.
         * @param {number} y The y coordinate of the new position.
         */
    respawn(x, y) {
        this.isAlive = true;
        
        // Calculate new anchor position
        const newAnchorY = y + this.colliderHeight / 2;
        
        // Temporarily remove anchor constraint to prevent it from pulling the body
        const wasAttached = this.isAttached;
        if (this.isAttached) {
            World.remove(this.world, this.anchor);
            this.isAttached = false;
        }
        
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
        
        // Update anchor position
        this.anchor.pointB.x = x;
        this.anchor.pointB.y = newAnchorY;
        this.anchorX = x;
        this.anchorY = newAnchorY;
        
        // Reset arm state
        this.armRaised = false;
        this.armAngle = 0;
        this.armTargetAngle = 0;
        
        // Reattach anchor if it was attached before
        if (wasAttached) {
            World.add(this.world, this.anchor);
            this.isAttached = true;
        }
    }


}