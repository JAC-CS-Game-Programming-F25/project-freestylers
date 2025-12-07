import AK from '../objects/AK47.js';
import LaserGun from '../objects/LaserGun.js';

export default class GunFactory {
    /**
     * Create an AK47 for a character
     * @param {Character} character - The character who will hold this gun
     */
    static createAK(character) {
        return new AK(character);
    }

    /**
     * Create a LaserGun for a character
     * @param {Character} character - The character who will hold this gun
     */
    static createLaserGun(character) {
        return new LaserGun(character);
    }

    /**
     * Create random gun for a character
     * @param {Character} character - The character who will hold this gun
     */
    static createRandom(character) {
        const types = [
            () => GunFactory.createAK(character),
            () => GunFactory.createLaserGun(character),
        ];
        
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex]();
    }
}