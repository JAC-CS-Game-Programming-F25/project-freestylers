import { context, matter } from '../globals.js';

const { Bodies, World, Body, Constraint } = matter;

export default class Character {
    constructor(x, y, width, height, sprites, world) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprites = sprites;
        this.world = world;
        this.currentSprite = sprites.idle || sprites.default;
        this.isAlive = true;
        this.jumpPower = 0.01;
        // wobble animation settings
        this.wobbleSpeed = 0.01;
        this.wobbleAmount = 0.8;
        this.currentWobble = 0;
        this.wobbleDirection = 1;

        const colliderHeight = height * 0.9;

this.body = Bodies.rectangle(x, y, width, colliderHeight, {
    density: 0.002,
    friction: 0.5,
    restitution: 0.2,
    label: 'character'
});

// perfect world-feet position
this.anchorX = x;
this.anchorY = y + colliderHeight / 2;

// perfect pivot constraint
this.anchor = Constraint.create({
    bodyA: this.body,
    pointA: { x: 0, y: colliderHeight / 2 }, // exact bottom of body
    pointB: { x: this.anchorX, y: this.anchorY },
    length: 0,
    stiffness: 1,
    angularStiffness: 1
});


        this.isAttached = true;   // <— NEW: track if anchor is active

        World.add(world, this.body);
        World.add(world, this.anchor);
    }

    update(dt) {
        if (!this.isAlive) return;

        // wobble animation ONLY when attached
        if (this.isAttached) {
            this.currentWobble += this.wobbleSpeed * this.wobbleDirection;
            if (Math.abs(this.currentWobble) >= this.wobbleAmount) {
                this.wobbleDirection *= -1;
            }
            Body.setAngle(this.body, this.currentWobble);
        }

        // sync position
        this.x = this.body.position.x;
        this.y = this.body.position.y;
    }

    jump() {
        if (!this.isAttached) return; // prevents spam jump

        // remove anchor
        World.remove(this.world, this.anchor);
        this.isAttached = false;

        // calculate jump force
        const jumpForce = {
            x: Math.sin(this.currentWobble) * this.jumpPower,
            y: -this.jumpPower * 1.5
        };

        Body.applyForce(this.body, this.body.position, jumpForce);

        // reattach after short delay
        setTimeout(() => {
            if (this.isAlive && !this.isAttached) {
                // reset anchor position to current feet position
                this.anchor.pointB.x = this.body.position.x;
                this.anchor.pointB.y = this.body.position.y + this.height / 2;

                World.add(this.world, this.anchor);
                this.isAttached = true;

                // reset wobble so they start leaning again
                this.currentWobble = 0;
            }
        }, 450);
    }

    render() {
        if (!this.isAlive) return;

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.body.angle);

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

        context.restore();
    }

    destroy() {
        this.isAlive = false;
        if (this.isAttached) World.remove(this.world, this.anchor);
        World.remove(this.world, this.body);
    }
}
