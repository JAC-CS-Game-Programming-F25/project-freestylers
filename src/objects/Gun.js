import { context } from "../globals.js";

export default class Gun {
    /**
     * Base Gun class that all gun types inherit from
     * @param {Character} character - The character holding this gun
     * @param {HTMLImageElement|Object} sprite - The gun sprite image or object with .image property
     * @param {number} width - Gun sprite width
     * @param {number} height - Gun sprite height
     */
    constructor(character, sprite, width, height) {
        this.character = character;
        // Handle both raw images and objects with .image property
        this.sprite = sprite?.image || sprite;
        this.width = width;
        this.height = height;
        
        // Offset from the end of the arm to the gun's rotation point
        // Adjust this so gun attaches smoothly to hand
        this.offsetFromHand = 0;
    }

    /**
     * Update gun state (can be overridden by subclasses if needed)
     * @param {number} dt - Delta time
     */
    update(dt) {
        // Base gun doesn't need to update anything
        // Subclasses can override if they need to
    }

    /**
     * Render the gun attached to the character's arm
     */
    render() {
        if (!this.character.isAlive) return;

        context.save();
        
        // Move to character position
        context.translate(this.character.x, this.character.y);
        context.rotate(this.character.body.angle);
        
        // Move to arm/shoulder position
        context.translate(this.character.armOffsetX, this.character.armOffsetY + this.character.armPivotOffset);
        
        // Flip if character is flipped
        if (this.character.flipped) {
            context.scale(-1, 1);
        }
        
        // Rotate with arm
        context.rotate(this.character.armAngle);
        
        // Move to end of arm (hand position)
        // The arm is drawn with pivot at top, so we need to move down by armHeight - armPivotOffset
        const handDistance = this.character.armHeight - this.character.armPivotOffset;
        context.translate(0, handDistance + this.offsetFromHand);
        
        // NOW rotate the gun 90 degrees to point down
        context.rotate(Math.PI / 2);
        
        // Draw gun centered on hand
        context.drawImage(
            this.sprite,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        
        // DEBUG: Draw gun center point
        if (false) { // Set to true for debugging
            context.fillStyle = 'blue';
            context.fillRect(-2, -2, 4, 4);
        }
        
        context.restore();
    }

    /**
     * Get the world position where bullets should spawn (gun barrel tip)
     * @returns {{x: number, y: number}} World coordinates of bullet spawn point
     */
    getBulletSpawnPosition() {
        const char = this.character;
        
        // Calculate world position step by step
        // Start at character position
        let x = char.x;
        let y = char.y;
        
        // Apply character body rotation
        const bodyAngle = char.body.angle;
        const armX = char.armOffsetX;
        const armY = char.armOffsetY + char.armPivotOffset;
        
        // Rotate arm offset by body angle
        const rotatedArmX = armX * Math.cos(bodyAngle) - armY * Math.sin(bodyAngle);
        const rotatedArmY = armX * Math.sin(bodyAngle) + armY * Math.cos(bodyAngle);
        
        x += rotatedArmX;
        y += rotatedArmY;
        
        // Calculate hand position (end of arm)
        const handDistance = char.armHeight - char.armPivotOffset;
        const totalAngle = bodyAngle + char.armAngle;
        
        // Flip angle if character is flipped
        const effectiveAngle = char.flipped ? bodyAngle - char.armAngle : totalAngle;
        
        const handX = handDistance * Math.sin(effectiveAngle);
        const handY = handDistance * Math.cos(effectiveAngle);
        
        x += handX;
        y += handY;
        
        // Add barrel length (gun extends forward from hand)
        const barrelLength = this.width / 2; // Bullets spawn from gun tip
        const barrelX = barrelLength * Math.sin(effectiveAngle);
        const barrelY = barrelLength * Math.cos(effectiveAngle);
        
        x += barrelX;
        y += barrelY;
        
        return { x, y };
    }

    /**
     * Get the angle the gun is pointing in world space
     * @returns {number} Angle in radians
     */
    getGunAngle() {
        const totalAngle = this.character.body.angle + this.character.armAngle;
        return this.character.flipped ? this.character.body.angle - this.character.armAngle : totalAngle;
    }

    /**
     * Shoot method - should be overridden by subclasses
     * Base class does nothing
     */
    shoot() {
        console.warn('Gun.shoot() called but not implemented. Override this method in subclass.');
    }
}