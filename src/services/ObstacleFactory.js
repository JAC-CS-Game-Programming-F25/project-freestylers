import { images } from '../globals.js';
import Obstacle from '../entities/Obstacle.js';

export default class ObstacleFactory {

    static createBarrel(x, y) {
        const sprite = images.get("barrel");  // <-- use images, not loader
        return new Obstacle(x, y, 48, 48, sprite);
    }

    static createBox(x, y) {
        const sprite = images.get("box");
        return new Obstacle(x, y, 48, 48, sprite);
    }

    static createRandom(x, y) {
        const types = [
            () => ObstacleFactory.createBarrel(x, y),
            () => ObstacleFactory.createBox(x, y),
        ];
        
        return types[Math.floor(Math.random() * types.length)]();
    }
}
