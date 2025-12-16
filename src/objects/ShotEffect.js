import Animation from "../../lib/Animation.js";

export default class ShotEffect {
    constructor(sprites) {
        this.sprites = sprites;
        this.animation = new Animation([0, 1, 2, 3, 4, 5], 0.1, 1);
        this.currentFrame = 0;
    }

    update(dt) {
        if (this.done) return;

        this.animation.update(dt);
        this.currentFrame = this.animation.getCurrentFrame();

        if (this.animation.isDone()) {
            this.done = true;
        }
    }

    render(x, y) {
        if (this.done) {
            return;
        }
        console.log(this.currentFrame);
        this.sprites[this.currentFrame].render(x, y);
    }
}