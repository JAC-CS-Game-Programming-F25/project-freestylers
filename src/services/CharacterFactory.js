import Character from "../entities/Character.js";
import { images } from "../globals.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";

export default class CharacterFactory {
    static createCharacter(x, y, flipped, playState, isAI) {
        const characterSpriteName = flipped ? ImageName.CyborgIdle : ImageName.PunkIdle;
        const armSpriteName = flipped ? ImageName.CyborgHand : ImageName.PunkHand;
        return new Character(x, y, CharacterFactory.getCharacterSprites(characterSpriteName), CharacterFactory.getArmSprite(armSpriteName), flipped, playState, isAI);
    }

    static getCharacterSprites(characterSpriteName) {
        const idleSprite = new Sprite(
            images.get(characterSpriteName),
            196, 12, Character.WIDTH, Character.HEIGHT
        );

        const jumpSprite = new Sprite(
            images.get(characterSpriteName),
            100, 12, Character.WIDTH, Character.HEIGHT
        );
        
        const FRAME_WIDTH = 30;
        const FRAME_HEIGHT = 24;
        const explosionSprites = [];
        for (let i = 0; i < 8; i++) {
            explosionSprites.push(
                new Sprite(
                    images.get(ImageName.Explosion),
                    i * FRAME_WIDTH,
                    0,
                    FRAME_WIDTH,
                    FRAME_HEIGHT
                )
            );
        }


        return [idleSprite, jumpSprite, ...explosionSprites];
    }

    static getArmSprite(armSpriteName) {
        return new Sprite(
            images.get(armSpriteName), 12, 12, 10, 15
        );
    }
}