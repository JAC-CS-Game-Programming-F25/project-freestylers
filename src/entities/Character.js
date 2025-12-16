import StateMachine from '../../lib/StateMachine.js';
import PlayerStateName from '../enums/PlayerStateName.js';
import { CANVAS_HEIGHT, context, matter } from '../globals.js';
import PlayerExplodingState from '../states/player/PlayerExplodingState.js';
import PlayerIdlingState from '../states/player/PlayerIdlingState.js';
import PlayerJumpingState from '../states/player/PlayerJumpingState.js';
import Rectangle from './Rectangle.js';

const { Body } = matter;
export default class Character extends Rectangle {
	static WIDTH = 16;
    static HEIGHT = 36;
    static MAX_TILT = 0.35;
    static JUMP_POWER = 0.03;
    static DENSITY = 0.002;
    
    constructor(x, y, sprites, armSprite, flipped, playState) {
		super(
			x - Character.WIDTH / 2,
			y - Character.HEIGHT / 2,
			Character.WIDTH,
			Character.HEIGHT,
			{
				density: Character.DENSITY,
				friction: 0.5,
				restitution: 0.2,
				label: 'character',
			}
		);

        this.stateMachine = this.initializeStateMachine();
        this.playState = playState;

        this.armSprite = armSprite;

		this.width = Character.WIDTH;
		this.height = Character.HEIGHT;
        this.scale = 1;
        this.prevScale = 1;
        this.scaleTween = { value: 1 };

		this.sprites = sprites;
		this.flipped = flipped;
        this.direction = this.flipped ? -1 : 1;

		this.isAlive = true;

		this.jumpPower = Character.JUMP_POWER;

		this.armRaised = false;
		this.armAngle = 0;
		this.armTargetAngle = 0;
		this.armSpeed = 0.02;

        this.armOffset = { x: 1, y: -5 };
        this.gunOffset = { x: -2, y: -15 }

        this.isGrounded = true;
        this.currentAnimation =
			this.stateMachine.currentState.animation[this.direction];
	}

    initializeStateMachine() {
		const stateMachine = new StateMachine();

		stateMachine.add(PlayerStateName.Idling, new PlayerIdlingState(this));
		stateMachine.add(PlayerStateName.Jumping, new PlayerJumpingState(this));
        stateMachine.add(PlayerStateName.Exploding, new PlayerExplodingState(this));

		stateMachine.change(PlayerStateName.Idling);

		return stateMachine;
	}

    changeState(state, params) {
		this.stateMachine?.change(state, params);
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

        this.stateMachine.update(dt);

        // Update current animation frame
        if (this.currentAnimation) {
            this.currentAnimation.update(dt);
            this.currentFrame = this.currentAnimation.getCurrentFrame();
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
        if (!this.gun) return;

        const shots = this.gun.shoot();
        if (!shots) return;

        this.playState.addBullets(shots);
    }

    handleExplosion() {
        console.log('exploded')
        this.changeState(PlayerStateName.Exploding);
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

    applyScale() {
        const factor = this.scaleTween.value / this.prevScale;

        if (Math.abs(factor - 1) > 0.0001) {
            matter.Body.scale(this.body, factor, factor);
            this.prevScale = this.scaleTween.value;
            this.scale = this.scaleTween.value; // for rendering
        }
    }


    render() {
        if (!this.isAlive) return;

        context.save();
        context.translate(this.body.position.x, this.body.position.y);
        context.rotate(this.body.angle);

        if (this.flipped) {
            context.scale(-1, 1);
        }

        context.scale(this.scale, this.scale);

        // Body
        this.sprites[this.currentFrame].render(
            this.renderOffset.x,
            this.renderOffset.y
        );

        // Arm
        context.rotate(this.armAngle);
        this.armSprite.render(this.armOffset.x, this.armOffset.y);

        context.scale(1 / this.scale, 1 / this.scale);

        // Gun
        if (this.gun) {
            context.rotate(Math.PI / 2);
            this.gun.render(context, this.gunOffset.x, this.gunOffset.y);
        }

        context.restore();

        if (this.stateMachine.currentState.explosionFrame) 
        { 
            const explosionState = this.stateMachine.currentState;
            this.sprites[explosionState.explosionFrame]
            .render(this.body.position.x - 40, this.body.position.y + this.renderOffset.y,
                { x: 2, y: 2 }
            ); 
        }
    }

    setGun(gun) {
        this.gun = gun;
    }

    isDead() {
        if (!this.isAlive) return true;

        return this.body.position.y > CANVAS_HEIGHT / 2 + 30;
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
        this.changeState(PlayerStateName.Idling);
        this.isAlive = true;
        
        // Reset body position, velocity, and angle
        matter.Body.setPosition(this.body, { x, y });
        matter.Body.setVelocity(this.body, { x: 0, y: 0 });
        matter.Body.setAngle(this.body, 0);
        matter.Body.setAngularVelocity(this.body, 0);
        matter.Body.setDensity(this.body, Character.DENSITY);

        this.jumpPower = Character.JUMP_POWER;
        
        // Wake up the body in case it was sleeping
        matter.Body.setStatic(this.body, false);
        
        // Reset arm state
        this.armRaised = false;
        this.armAngle = 0;
        this.armTargetAngle = 0;
    }
}