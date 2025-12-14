import Gun from "./Gun.js";
import Bullet from "../entities/Bullet.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";

export default class LaserGun extends Gun {
    constructor(character) {
        const gunSprite = images.get(ImageName.LaserGun);
        super(character, gunSprite, 14, 10);
        // Handle both raw images and objects with .image property
        this.bulletSprite = images.get(ImageName.LaserBullet);
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

        const direction = this.character.flipped ? 1 : -1
        const velocityX = Math.sin(angle) * this.bulletSpeed * direction;
        const velocityY = Math.cos(angle) * this.bulletSpeed;

        const bullet = new Bullet(
            spawnPos.x,
            spawnPos.y,
            this.bulletWidth,
            this.bulletHeight,
            this.bulletSprite,
            velocityX,
            velocityY,
            this.character
        );

        return bullet;
    }

}