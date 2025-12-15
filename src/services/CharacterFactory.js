import Character from "../entities/Character.js";
import { images } from "../globals.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";

export default class CharacterFactory {
    static createCharacter(x, y, flipped, playState) {
        const idleSpriteName = flipped ? ImageName.CyborgIdle : ImageName.PunkIdle;
        const armSpriteName = flipped ? ImageName.CyborgHand : ImageName.PunkHand;
        return new Character(x, y, CharacterFactory.getCharacterSprites(idleSpriteName, armSpriteName), flipped, playState);
    }

    static getCharacterSprites(idleSpriteName, armSpriteName) {
        const idleSprite = new Sprite(
            images.get(idleSpriteName),
            196, 12, Character.WIDTH, Character.HEIGHT
        );

        const armSprite = new Sprite(
            images.get(armSpriteName), 12, 12, 10, 15
        );
        return [idleSprite, armSprite];
    }
}