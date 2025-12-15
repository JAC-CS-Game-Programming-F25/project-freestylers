import Gun from "./Gun.js";
import Bullet from "../entities/Bullet.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";

export default class Bazooka extends Gun {
    constructor(character) {
        super(character, ImageName.Bazooka , 14, 10);
        // Handle both raw images and objects with .image property
        this.bulletSprite = images.get(ImageName.BazookaBullet);
        this.bulletWidth = 10;
        this.bulletHeight = 10;
        this.bulletSpeed = 1;// Very high speed for laser
        this.type = 'laser';
    }

    /**
     * Shoot a single laser bullet
     */
    shoot() {
        const spawnPos = this.getBulletSpawnPosition();
        const velocity = this.getBulletVelocity();

        const bullet = new Bullet(
            spawnPos.x,
            spawnPos.y,
            this.bulletWidth,
            this.bulletHeight,
            this.bulletSprite,
            velocity.x,
            velocity.y,
            1,
            this.character
        );

        return [bullet];
    }

}