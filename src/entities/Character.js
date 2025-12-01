import { context, matter } from '../globals.js';

const { Bodies, World, Body, Constraint } = matter;

export default class Character {
    constructor(x, y, width, height, sprites, world) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colliderHeight = height * 0.9;  
        this.sprites = sprites;
        this.world = world;

        this.currentSprite = sprites.idle || sprites.default;
        this.isAlive = true;

        this.jumpPower = 0.01;

        // wobble animation
        this.wobbleSpeed = 0.01;
        this.wobbleAmount = 0.8;
        this.currentWobble = 0;
        this.wobbleDirection = 1;

        this.body = Bodies.rectangle(x, y, width, this.colliderHeight, {
            density: 0.002,
            friction: 0.5,
            restitution: 0.2,
            label: 'character'
        });

        this.anchorX = x;
        this.anchorY = y + this.colliderHeight / 2;

        this.anchor = Constraint.create({
            bodyA: this.body,
            pointA: { x: 0, y: this.colliderHeight / 2 },
            pointB: { x: this.anchorX, y: this.anchorY },
            length: 0,
            stiffness: 1,
            angularStiffness: 1
        });

        this.isAttached = true;

        World.add(world, this.body);
        World.add(world, this.anchor);
    }

    update(dt) {
        if (!this.isAlive) return;

        if (this.isAttached) {
            this.currentWobble += this.wobbleSpeed * this.wobbleDirection;

            if (Math.abs(this.currentWobble) >= this.wobbleAmount) {
                this.wobbleDirection *= -1;
            }

            Body.setAngle(this.body, this.currentWobble);
        }

        this.x = this.body.position.x;
        this.y = this.body.position.y;
    }

    jump() {
        if (!this.isAttached) return;

        // detach from world feet
        World.remove(this.world, this.anchor);
        this.isAttached = false;

        // jumping force
        const jumpForce = {
            x: Math.sin(this.currentWobble) * this.jumpPower,
            y: -this.jumpPower * 1.5
        };

        Body.applyForce(this.body, this.body.position, jumpForce);

        // reattach after delay
        setTimeout(() => {
            if (this.isAlive && !this.isAttached) {
                this.anchor.pointB.x = this.body.position.x;
                this.anchor.pointB.y = this.body.position.y + this.colliderHeight / 2;

                World.add(this.world, this.anchor);
                this.isAttached = true;
                this.currentWobble = 0;
            }
        }, 450);
    }

    render() {
        if (!this.isAlive) return;

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.body.angle);

        // draw sprite
        if (this.currentSprite) {
            context.drawImage(
                this.currentSprite,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            context.fillStyle = 'red';
            context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        // DEBUG HITBOX (aligned with matter.js)
        context.strokeStyle = "rgba(0,255,0,0.6)";
        context.lineWidth = 1;

        context.strokeRect(
            -this.width / 2,
            -this.colliderHeight / 2,
            this.width,
            this.colliderHeight
        );

        context.restore();
    }

    destroy() {
        this.isAlive = false;

        if (this.isAttached) {
            World.remove(this.world, this.anchor);
        }

        World.remove(this.world, this.body);
    }
}
