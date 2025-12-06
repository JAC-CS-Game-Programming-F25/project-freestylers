import Character from './Character.js';
import ImageName from '../enums/ImageName.js';
import { images } from '../globals.js';

export default class Cyborg extends Character {
    static WIDTH = 48;
    static HEIGHT = 48;
    
    // 5th frame coordinates (0-indexed)
    static SPRITE_X = 192;
    static SPRITE_Y = 0;
    static SPRITE_WIDTH = 48;
    static SPRITE_HEIGHT = 48;

    constructor(x, y, world) {
        const sprite = Cyborg.loadSprite();
        const sprites = {
            idle: sprite,
            arm: images.get(ImageName.CyborgHand)
        };
        
        super(x, y, Cyborg.WIDTH, Cyborg.HEIGHT, sprites, world,false);
    }

    static loadSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = Cyborg.SPRITE_WIDTH;
        canvas.height = Cyborg.SPRITE_HEIGHT;
        
        const spriteSheet = images.get(ImageName.CyborgIdle);
        
        ctx.drawImage(
            spriteSheet.image,
            Cyborg.SPRITE_X, Cyborg.SPRITE_Y, Cyborg.SPRITE_WIDTH, Cyborg.SPRITE_HEIGHT,
            0, 0, Cyborg.SPRITE_WIDTH, Cyborg.SPRITE_HEIGHT
        );
        
        return canvas;
    }
}