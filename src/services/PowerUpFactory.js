import ImageName from "../enums/ImageName.js";
import BigJump from "../entities/PowerUps/BigJump.js";

export default class PowerUpFactory {

    static createPowerUp(x, y) {
        return new BigJump(x, y, 32, 32, ImageName.Box);
    }
}
