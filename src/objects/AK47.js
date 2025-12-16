import Gun from "./Gun.js";
import Bullet from "../entities/Bullet.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";

export default class AK extends Gun {
    constructor(character) {
        super(character, ImageName.AK, 28, 10);
        
        this.bulletSprite = images.get(ImageName.AKBullet);
        this.bulletWidth = 4;
        this.bulletHeight = 3;
        this.bulletSpeed = 15;
        this.type = 'ak';
    }

    /**
     * Shoot three AK bullets side by side
     */
    shoot() {
        super.shoot();
        const spawnPos = this.getBulletSpawnPosition();
        const velocity = this.getBulletVelocity();

        const bullets = [];

        for (const offsetX of [-5, 0, 5]) {
            bullets.push(new Bullet(
                spawnPos.x + offsetX,
                spawnPos.y,
                this.bulletWidth,
                this.bulletHeight,
                this.bulletSprite,
                velocity.x,
                velocity.y,
                0.3,
                this.character
            ));
        }

        return bullets;
    }
}