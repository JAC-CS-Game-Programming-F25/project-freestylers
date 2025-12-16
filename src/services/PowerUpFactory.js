import ImageName from "../enums/ImageName.js";
import JumpBoost from "../entities/PowerUps/JumpBoost.js";
import WeightBoost from "../entities/PowerUps/WeightBoost.js";
import Shrinker from "../entities/PowerUps/Shrinker.js";

export default class PowerUpFactory {

    static createPowerUp(x, y) {
        // Pick a random number between 0 and 2
        const rand = Math.floor(Math.random() * 3);
        
        switch (rand) {
            case 0:
                return new JumpBoost(x, y, 32, 32, ImageName.JumpBoost);
            case 1:
                return new WeightBoost(x, y, 32, 32, ImageName.WeightBoost);
            case 2:
                return new Shrinker(x, y, 32, 32, ImageName.Shrinker);
            default:
                return new JumpBoost(x, y, 32, 32, ImageName.JumpBoost);
        }
    }
}
