import Gun from "./Gun.js";
import Bullet from "../entities/Bullet.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";

export default class AK extends Gun {
    constructor(character) {
        const gunSprite = images.get(ImageName.AK);
        super(character, gunSprite, 14, 10);
        
        this.bulletSprite = images.get(ImageName.AKBullet);
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
        const direction = this.character.flipped ? 1 : -1;
        const velocityX = Math.sin(angle) * this.bulletSpeed * direction;
        const velocityY = Math.cos(angle) * this.bulletSpeed;

        const bullets = [];

        // Center bullet
        bullets.push(new Bullet(
            spawnPos.x,
            spawnPos.y,
            this.bulletWidth,
            this.bulletHeight,
            this.bulletSprite,
            velocityX,
            velocityY,
            this.character
        ));

        // Left bullet
        bullets.push(new Bullet(
            spawnPos.x - 5,
            spawnPos.y,
            this.bulletWidth,
            this.bulletHeight,
            this.bulletSprite,
            velocityX,
            velocityY,
            this.character
        ));

        // Right bullet
        bullets.push(new Bullet(
            spawnPos.x + 5,
            spawnPos.y,
            this.bulletWidth,
            this.bulletHeight,
            this.bulletSprite,
            velocityX,
            velocityY,
            this.character
        ));

        return bullets;
    }
}