import { matter, world, context, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";
import GameEntity from "./GameEntity.js";

const { Bodies, Body } = matter;

export default class Bullet extends GameEntity {
    constructor(x, y, velocityX, velocityY, sprite, width, height, shooter = null) {
        const body = Bodies.rectangle(x, y, width, height, {
    label: 'bullet',
    isSensor: true, // Sensor bullets detect collisions but don't apply forces (prevents pushing characters into ground)
    friction: 0,
    frictionAir: 0.001,
    restitution: 0,
    density: 0.55,
});
        
        super(body);
        
        this.sprite = sprite;
        this.width = width;
        this.height = height;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.currentFrame = 0;
        this.shooter = shooter; // Reference to the character who shot this bullet
        
        // Set the initial velocity
        Body.setVelocity(this.body, { x: this.velocityX, y: this.velocityY });
        
        // Track lifetime for cleanup
        this.lifetime = 0;
        this.maxLifetime = 5000; // 5 seconds before auto-cleanup
    }

    update(dt) {
        super.update(dt);
        
        // Maintain bullet velocity (ignore gravity effects)
        // This ensures bullets travel in a straight line regardless of gravity
        Body.setVelocity(this.body, { x: this.velocityX, y: this.velocityY });
        
        this.lifetime += dt;
        
        const pos = this.body.position;
        if (pos.x < -50 || pos.x > CANVAS_WIDTH + 50 || 
            pos.y < -50 || pos.y > CANVAS_HEIGHT + 50 || 
            this.lifetime > this.maxLifetime) {
            this.shouldCleanUp = true;
        }
    }

    render(renderDebug = false) {
        context.save();
        context.translate(this.body.position.x, this.body.position.y);
        context.rotate(this.body.angle);
        
        // Draw bullet sprite
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Fallback if no sprite
            context.fillStyle = 'yellow';
            context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        // Debug hitbox
        if (renderDebug) {
            context.strokeStyle = "rgba(255,255,0,0.6)";
            context.lineWidth = 1;
            context.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        context.restore();
    }

    // Called when bullet hits something
    onCollision(otherBody) {
        // Mark for cleanup after collision
        this.shouldCleanUp = true;
    }
}