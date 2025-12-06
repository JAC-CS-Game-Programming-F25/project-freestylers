import ImageName from "../enums/ImageName.js";
import Obstacle from "../entities/Obstacle.js";

export default class ObstacleFactory {

    static createBarrel(x, y) {
        return new Obstacle(x, y, 18, 26, ImageName.Barrel);
    }

    static createBox(x, y) {
        return new Obstacle(x, y, 32, 32, ImageName.Box);
    }

    static createRandom(x, y) {
        const types = [
            () => ObstacleFactory.createBarrel(x, y),
            () => ObstacleFactory.createBox(x, y),
        ];
        
        return types[Math.floor(Math.random() * types.length)]();
    }
}
