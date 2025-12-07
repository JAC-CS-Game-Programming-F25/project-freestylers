import State from '../../lib/State.js';
import TiledMap from '../objects/TiledMap.js';
import CharacterFactory from '../services/CharacterFactory.js';
import ObstacleFactory from '../services/ObstacleFactory.js';
import LaserGun from '../objects/LaserGun.js';
import AK47 from '../objects/AK47.js';
import SoundName from '../enums/SoundName.js';
import Input from '../../lib/Input.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, matter, engine, world, sounds, input, images } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import AK from '../objects/AK47.js';
import GunFactory from '../services/GunFactory.js';

const { Engine } = matter;

export default class PlayState extends State {
    constructor() {
        super();
        this.map = null;
        this.player1 = null;
        this.player2 = null;
        this.obstacles = [];
        this.bullets = []; 
    }

    async enter() {

        
        console.log('Cyborg arm sprite:', images.get(ImageName.CyborgHand));
        console.log('Punk arm sprite:', images.get(ImageName.PunkHand));
        // Play background music
        sounds.play(SoundName.EpicBackgroundMusic);
        
        // Load the map
        const mapData = await fetch('./assets/maps/map.json')
            .then(response => response.json());
        
        this.map = new TiledMap(mapData);
        await this.map.preloadTiles();
        
        this.player1 = CharacterFactory.createCyborg(150, 130, world);
        this.player2 = CharacterFactory.createPunk(CANVAS_WIDTH - 150, 130, world);

        //generate a gun that will be used for both players

        const [gun1, gun2] = GunFactory.createGunForBothPlayers(this.player1, this.player2);
        this.player1.setGun(gun1);
        this.player2.setGun(gun2);
        console.log('Game ready! Player 1: W to jump, SPACE to aim/shoot | Player 2: UP ARROW to jump, SHIFT to aim/shoot');
    }

   update(dt) {
    Engine.update(engine);
    
    if(Math.random()<0.0001){
        console.log("Chance hit, about to generate obstacle");
        this.generateObstacle()
    }
    
    // Update obstacles
    for (const obstacle of this.obstacles) {
        obstacle.update(dt);
    }

    // Update bullets
    for (const bullet of this.bullets) {
        bullet.update(dt);
    }

    // Clean up dead bullets
    this.bullets = this.bullets.filter(bullet => !bullet.shouldCleanUp);

    if (this.player1) {
        this.player1.update(dt);
        
        // Player 1 controls (W = jump, SPACE = raise arm/shoot)
        if (input.isKeyPressed(Input.KEYS.W)) {
            this.player1.jump();
        }
        
        if (input.isKeyHeld(Input.KEYS.SPACE)) {
            if (!this.player1.armRaised) {
                this.player1.raiseArm();
            }
        } else {
            if (this.player1.armRaised) {
                this.player1.lowerArm();
                
               const bulletOrBullets = this.player1.shoot();
                sounds.play(SoundName.LaserShot);
                if (bulletOrBullets) {
                    const bulletsToAdd = Array.isArray(bulletOrBullets) ? bulletOrBullets : [bulletOrBullets];
                    this.bullets.push(...bulletsToAdd);
                }
            }
        }
    }
    
    if (this.player2) {
        this.player2.update(dt);
        
        // Player 2 controls (UP = jump, SHIFT = raise arm/shoot)
        if (input.isKeyPressed(Input.KEYS.ARROW_UP)) {
            this.player2.jump();
        }
        
        if (input.isKeyHeld(Input.KEYS.SHIFT)) {
            if (!this.player2.armRaised) {
                this.player2.raiseArm();
            }
        } else {
            if (this.player2.armRaised) {
                this.player2.lowerArm();
                // Shoot and add bullet to PlayState
                const bulletOrBullets = this.player2.shoot();
                sounds.play(SoundName.LaserShot);
                if (bulletOrBullets) {
                    const bulletsToAdd = Array.isArray(bulletOrBullets) ? bulletOrBullets : [bulletOrBullets];
                    this.bullets.push(...bulletsToAdd);
                }
            }
        }
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
    
    // Render obstacles
    for (const obstacle of this.obstacles) {
        obstacle.render();
    }

    // Render bullets
    for (const bullet of this.bullets) {
        bullet.render();
    }
}

    generateObstacle(){
    console.log("generateObstacle called");
    const x = Math.random() * CANVAS_WIDTH;
    const y = -80;

    const obstacle = ObstacleFactory.createRandom(x, y);
    
    this.obstacles.push(obstacle);
    matter.World.add(world, obstacle.body);
}
}