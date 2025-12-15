import AK from '../objects/AK47.js';
import LaserGun from '../objects/LaserGun.js';
import Bazooka from '../objects/Bazooka.js';

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
     * Create a Bazooka for a character
     * @param {Character} character - The character who will hold this gun
     */
    static createBazooka(character) {
        return new Bazooka(character);
    }

    /**
     * Create random gun for both players
     * @param {Character} player1 - First player character
     * @param {Character} player2 - Second player character
     * @param {string} gunType - Optional gun type: 'laser', 'ak', or 'bazooka'
     */
    static createGunForBothPlayers(player1, player2, gunType = "") {
        let selectedGunType = gunType;
        
        if (!selectedGunType) {
            const rand = Math.random();
            if (rand < 0.33) {
                selectedGunType = 'laser';
            } else if (rand < 0.66) {
                selectedGunType = 'ak';
            } else {
                selectedGunType = 'bazooka';
            }
        }

        let gun1, gun2;
        
        switch(selectedGunType) {
            case 'laser':
                gun1 = this.createLaserGun(player1);
                gun2 = this.createLaserGun(player2);
                break;
            case 'bazooka':
                gun1 = this.createBazooka(player1);
                gun2 = this.createBazooka(player2);
                break;
            default: // 'ak'
                gun1 = this.createBazooka(player1);
                gun2 = this.createBazooka(player2);
        }
        
        return [gun1, gun2];
    }
}