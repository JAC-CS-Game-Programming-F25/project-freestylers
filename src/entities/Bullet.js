import { matter, world, context, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";
import GameEntity from "./GameEntity.js";

const { Bodies, Body } = matter;

export default class Bullet extends GameEntity {
    constructor(x, y, velocityX, velocityY, sprite, width, height) {
        const body = Bodies.rectangle(x, y, width, height, {
            label: 'bullet',
            isSensor: false, // Changed to false so bullets can apply physics force
            friction: 0,
            frictionAir: 0.001, // Very small air resistance
            restitution: 0.8, // Slight bounce
            density: 0.01, // Light but with some mass for impact
        });
        
        super(body);
        
        this.sprite = sprite;
        this.width = width;
        this.height = height;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.currentFrame = 0;
        
        // Set the initial velocity
        Body.setVelocity(this.body, { x: this.velocityX, y: this.velocityY });
        
        // Track lifetime for cleanup
        this.lifetime = 0;
        this.maxLifetime = 5000; // 5 seconds before auto-cleanup
    }

    update(dt) {
        super.update(dt);
        
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