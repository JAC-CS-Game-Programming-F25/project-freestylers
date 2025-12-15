import Character from "../entities/Character.js";
import { images } from "../globals.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";

export default class CharacterFactory {
    static createCharacter(x, y, flipped, playState) {
        const characterSpriteName = flipped ? ImageName.CyborgIdle : ImageName.PunkIdle;
        const armSpriteName = flipped ? ImageName.CyborgHand : ImageName.PunkHand;
        return new Character(x, y, CharacterFactory.getCharacterSprites(characterSpriteName), CharacterFactory.getArmSprite(armSpriteName), flipped, playState);
    }

    static getCharacterSprites(characterSpriteName) {
        const idleSprite = new Sprite(
            images.get(characterSpriteName),
            196, 12, Character.WIDTH, Character.HEIGHT
        );

        const jump1Sprite = new Sprite(
            images.get(characterSpriteName),
            100, 12, Character.WIDTH, Character.HEIGHT
        );

        const jump2Sprite = new Sprite(
            images.get(characterSpriteName),
            148, 12, Character.WIDTH, Character.HEIGHT
        );
        return [idleSprite, jump1Sprite, jump2Sprite];
    }

    static getArmSprite(armSpriteName) {
        return new Sprite(
            images.get(armSpriteName), 12, 12, 10, 15
        );
    }
}