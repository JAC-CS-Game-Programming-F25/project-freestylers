import Character from './Character.js';
import ImageName from '../enums/ImageName.js';
import { images } from '../globals.js';

export default class Punk extends Character {
    static WIDTH = 48;
    static HEIGHT = 48;
    
    // 5th frame coordinates (0-indexed)
    static SPRITE_X = 192;
    static SPRITE_Y = 0;
    static SPRITE_WIDTH = 48;
    static SPRITE_HEIGHT = 48;

    constructor(x, y, world) {
        const sprite = Punk.loadSprite();
        const sprites = {
            idle: sprite,
            arm: images.get(ImageName.PunkHand)
        };
        
        super(x, y, Punk.WIDTH, Punk.HEIGHT, sprites, world);
        
        // Flag to flip rendering
        this.flipped = true;
        // REMOVED: this.armOffsetX = -2; ← Delete this line!
    }

    static loadSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = Punk.SPRITE_WIDTH;
        canvas.height = Punk.SPRITE_HEIGHT;
        
        const spriteSheet = images.get(ImageName.PunkIdle);
        
        ctx.translate(Punk.SPRITE_WIDTH, 0);
        ctx.scale(-1, 1);
        
        // Extract the 5th frame from sprite sheet (flipped)
        ctx.drawImage(
            spriteSheet.image,
            Punk.SPRITE_X, Punk.SPRITE_Y, Punk.SPRITE_WIDTH, Punk.SPRITE_HEIGHT,
            0, 0, Punk.SPRITE_WIDTH, Punk.SPRITE_HEIGHT
        );
        
        return canvas;
    }
}