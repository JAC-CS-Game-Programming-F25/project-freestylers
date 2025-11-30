import Cyborg from '../entities/Cyborg.js';
import Punk from '../entities/Punk.js';

export default class CharacterFactory {
    static createCyborg(x, y, world) {
        return new Cyborg(x, y, world);
    }

    static createPunk(x, y, world) {
        return new Punk(x, y, world);
    }

    /**
     * Create random character
     */
    static createRandom(x, y, world) {
        const types = [
            () => CharacterFactory.createCyborg(x, y, world),
            () => CharacterFactory.createPunk(x, y, world),
        ];
        
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex]();
    }
}