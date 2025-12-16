import Gun from "./Gun.js";
import Bullet from "../entities/Bullet.js";
import { images, sounds } from "../globals.js";
import ImageName from "../enums/ImageName.js";
import Sprite from "../../lib/Sprite.js";
import SoundName from "../enums/SoundName.js";

export default class LaserGun extends Gun {
    constructor(character) {
        super(character, ImageName.LaserGun, 14, 10);
        // Handle both raw images and objects with .image property
        this.bulletSprite = images.get(ImageName.LaserBullet);
        this.bulletWidth = 8;
        this.bulletHeight = 10;
        this.bulletSpeed = 20; // Very high speed for laser
        this.type = 'laser';
        this.character.gunOffset = { x: 2, y: -15 }
    }

    /**
     * Shoot a single laser bullet
     */
    shoot() {
        super.shoot();
        sounds.play(SoundName.LaserShot);
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
            0.1,
            this.character
        );

        return [bullet];
    }

    getShotEffectSprites() {
		return [
			new Sprite( images.get(ImageName.LaserEffect), 0, 12, 48, 48 ),
			new Sprite( images.get(ImageName.LaserEffect), 48, 12, 48, 48 ),
			new Sprite( images.get(ImageName.LaserEffect), 96, 12, 48, 48 ),
			new Sprite( images.get(ImageName.LaserEffect), 192, 12, 48, 48 ),
			new Sprite( images.get(ImageName.LaserEffect), 240, 12, 48, 48 )
		];
	}

}