import Gun from "./Gun.js";
import Bullet from "../entities/Bullet.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";

export default class LaserGun extends Gun {
    constructor(character) {
        const gunSprite = images.get(ImageName.LaserGun);
        super(character, gunSprite, 14, 10);
        
        const bulletSpriteObj = images.get(ImageName.LaserBullet);
        // Handle both raw images and objects with .image property
        this.bulletSprite = bulletSpriteObj?.image || bulletSpriteObj;
        this.bulletWidth = 8;
        this.bulletHeight = 10;
        this.bulletSpeed = 20; // Very high speed for laser
    }

    /**
     * Shoot a single laser bullet
     */
    shoot() {
        const spawnPos = this.getBulletSpawnPosition();
        const angle = this.getGunAngle();
        
        console.log('LaserGun.shoot() - spawnPos:', spawnPos, 'angle:', angle);
        
        // Calculate bullet velocity based on gun angle
        // Bullets travel in the direction the gun is pointing
        // Negate velocities to shoot in correct direction
        const velocityX = -Math.sin(angle) * this.bulletSpeed;
        const velocityY = -Math.cos(angle) * this.bulletSpeed;
        
        console.log('Bullet velocity:', {velocityX, velocityY});
        
        // Create and return the bullet
        const bullet = new Bullet(
            spawnPos.x,
            spawnPos.y,
            velocityX,
            velocityY,
            this.bulletSprite,
            this.bulletWidth,
            this.bulletHeight
        );
        
        return bullet;
    }
}