import Gun from "./Gun.js";
import Bullet from "../entities/Bullet.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";

export default class AK extends Gun {
    constructor(character) {
        const gunSprite = images.get(ImageName.AK);
        super(character, gunSprite, 14, 10);
        
        const bulletSpriteObj = images.get(ImageName.AKBullet);
        this.bulletSprite = bulletSpriteObj?.image || bulletSpriteObj;
        this.bulletWidth = 4;
        this.bulletHeight = 3;
        this.bulletSpeed = 10;
    }

    /**
     * Shoot three AK bullets side by side
     */
    shoot() {
        const spawnPos = this.getBulletSpawnPosition();
        const angle = this.getGunAngle();
        
        const velocityX = -Math.sin(angle) * this.bulletSpeed;
        const velocityY = -Math.cos(angle) * this.bulletSpeed;
        
        const bullets = [];
        
        // Center bullet
        bullets.push(new Bullet(
            spawnPos.x,
            spawnPos.y,
            velocityX,
            velocityY,
            this.bulletSprite,
            this.bulletWidth,
            this.bulletHeight,
            this.character // Pass the shooter character
        ));
        
        // Left bullet
        bullets.push(new Bullet(
            spawnPos.x - 5,
            spawnPos.y,
            velocityX,
            velocityY,
            this.bulletSprite,
            this.bulletWidth,
            this.bulletHeight,
            this.character // Pass the shooter character
        ));
        
        // Right bullet
        bullets.push(new Bullet(
            spawnPos.x + 5,
            spawnPos.y,
            velocityX,
            velocityY,
            this.bulletSprite,
            this.bulletWidth,
            this.bulletHeight,
            this.character // Pass the shooter character
        ));
        
        return bullets;
    }
}