import Character from "../entities/Character.js";
import { images } from "../globals.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";

export default class CharacterFactory {
    static createCharacter(x, y) {
        const idleSprite = new Sprite(
            images.get(ImageName.PunkIdle),
            196, 12, Character.WIDTH, Character.HEIGHT
        );

        const armSprite = new Sprite(
            images.get(ImageName.PunkHand), 12, 12, 10, 15
        );

        return new Character(x, y, [idleSprite, armSprite], false);
    }

    /**
     * Create random character
     */
    static createRandom(x, y) {
        const types = [
            () => CharacterFactory.createCharacter(x, y),
            () => CharacterFactory.createCharacter(x, y),
        ];
        
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex]();
    }
}