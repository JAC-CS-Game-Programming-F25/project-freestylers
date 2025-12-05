import State from '../../lib/State.js';
import TiledMap from '../objects/TiledMap.js';
import CharacterFactory from '../services/CharacterFactory.js';
import ObstacleFactory from '../services/ObstacleFactory.js';
import SoundName from '../enums/SoundName.js';
import Input from '../../lib/Input.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, matter, engine, world, sounds, input } from '../globals.js';

const { Engine } = matter;

export default class PlayState extends State {
    constructor() {
        super();
        this.map = null;
        this.player1 = null;
        this.player2 = null;
    }

    async enter() {
        // Play background music
        sounds.play(SoundName.EpicBackgroundMusic);
        
        // Load the map
        const mapData = await fetch('./assets/maps/map.json')
            .then(response => response.json());
        
        this.map = new TiledMap(mapData);
        await this.map.preloadTiles();
        
        this.player1 = CharacterFactory.createCyborg(150, 130, world);
        
        this.player2 = CharacterFactory.createPunk(CANVAS_WIDTH - 150, 130, world);
        
        console.log('Game ready! Player 1: W to jump, Player 2: UP ARROW to jump');
    }

    update(dt) {
        Engine.update(engine);
        
        if (this.player1) this.player1.update(dt);
        if (this.player2) this.player2.update(dt);
        
        if (input.isKeyPressed(Input.KEYS.W)) {
            this.player1.jump();
        }
        
        if (input.isKeyPressed(Input.KEYS.ARROW_UP)) {
            this.player2.jump();
        }
    }

   render() {
    context.fillStyle = '#87CEEB';
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.map) {
        this.map.render();

        // DEBUG: draw platform hitboxes
        context.strokeStyle = "rgba(255,0,0,0.5)";
        context.lineWidth = 1;

        for (const b of this.map.collisionBodies) {
            context.strokeRect(
                b.position.x - this.map.tileWidth / 2,
                b.position.y - this.map.tileHeight / 2,
                this.map.tileWidth,
                this.map.tileHeight
            );
        }
    }

    if (this.player1) this.player1.render();
    if (this.player2) this.player2.render();
}

}