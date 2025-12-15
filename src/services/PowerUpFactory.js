import ImageName from "../enums/ImageName.js";
import JumpBoost from "../entities/PowerUps/JumpBoost.js";
import WeightBoost from "../entities/PowerUps/WeightBoost.js";

export default class PowerUpFactory {

    static createPowerUp(x, y) {
        return new WeightBoost(x, y, 32, 32, ImageName.WeightBoost);
    }
}
