import {matter,world} from "../globals.js";
import GameEntity from "./GameEntity.js";
const {Bodies,world} = matter;
export default class Bullet extends GameEntity {
     constructor(x, y, velocityX, velocityY, sprite, width, height) {
        const body = Bodies.Rectangle(x,y,width,height,{
            label: 'bullet',
            isSensor: true,
            friction:0,
            frictionAir:0,
            restitution:0,

        });
        super(body);
        this.sprite = sprite;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.currentFrame = 0;
        matter.Body.setVelocity(this.body, this.velocity);
    }
    update(dt) {
        super.update(dt);
    }
}