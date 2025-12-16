import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import ShotEffect from "./ShotEffect.js";
import ImageName from "../enums/ImageName.js";

export default class Gun {
    static GUN_BARREL_OFFSET = { x: 20, y: -25 };

    /**
     * Base Gun class that all gun types inherit from
     * @param {Character} character - The character holding this gun
     * @param {HTMLImageElement|Object} sprite - The gun sprite image or object with .image property
     * @param {number} width - Gun sprite width
     * @param {number} height - Gun sprite height
     */
    constructor(character, imageName, width, height) {
        this.character = character;
        this.width = width;
        this.height = height;
        this.sprite = new Sprite(images.get(imageName), 0, 0, width, height);
    }

    /**
     * Get the position where bullets should spawn (gun barrel tip)
     * @returns {{x: number, y: number}} World coordinates of bullet spawn point
     */
    getBulletSpawnPosition() {
        const x = this.character.body.position.x + (Gun.GUN_BARREL_OFFSET.x * this.character.direction);
        const y = this.character.body.position.y + (Gun.GUN_BARREL_OFFSET.y / 2);
        
        return { x, y };
    }

    getBulletVelocity() {
        const angle = this.getGunAngle();
        const x = -Math.sin(angle) * this.bulletSpeed * this.character.direction;
        const y = Math.cos(angle) * this.bulletSpeed;
        return { x, y };
    }

    update(dt) {
        if (this.shotEffect) this.shotEffect.update(dt);
        if (this.shotEffect && this.shotEffect.done) this.shotEffect = null;
    }

    /**
     * Get the angle the gun is pointing in world space
     * @returns {number} Angle in radians
     */
    getGunAngle() {
        return this.character.armAngle + this.character.body.angle;
    }

    /**
     */
    shoot() {
        this.shotEffect = new ShotEffect(this.getShotEffectSprites());
    }

    render(x, y) {
        this.sprite.render(x, y);
        if (this.shotEffect) this.shotEffect.render(Gun.GUN_BARREL_OFFSET.x, Gun.GUN_BARREL_OFFSET.y);
    }

    getShotEffectSprites() {
		return [
			new Sprite( images.get(ImageName.ShotEffect), 0, 12, 48, 48 ),
			new Sprite( images.get(ImageName.ShotEffect), 48, 12, 48, 48 ),
			new Sprite( images.get(ImageName.ShotEffect), 96, 12, 48, 48 ),
			new Sprite( images.get(ImageName.ShotEffect), 192, 12, 48, 48 ),
			new Sprite( images.get(ImageName.ShotEffect), 240, 12, 48, 48 )
		];
	}
}