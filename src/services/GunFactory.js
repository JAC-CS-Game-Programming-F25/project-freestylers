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
    static createGunForBothPlayers(player1, player2) {
        const gunType = Math.random() < 0.5 ? 'laser' : 'ak';
    
        const gun1 = gunType === 'laser' 
            ? this.createLaserGun(player1) 
            : this.createAK(player1);
            
        const gun2 = gunType === 'laser' 
            ? this.createLaserGun(player2) 
            : this.createAK(player2);
        
        return [gun1, gun2];
    }
}