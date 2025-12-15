import State from '../../lib/State.js';
import TiledMap from '../objects/TiledMap.js';
import CharacterFactory from '../services/CharacterFactory.js';
import ObstacleFactory from '../services/ObstacleFactory.js';
import PowerUpFactory from '../services/PowerUpFactory.js';
import SoundName from '../enums/SoundName.js';
import Input from '../../lib/Input.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, matter, engine, world, sounds, input, images, stateMachine} from '../globals.js';
import ImageName from '../enums/ImageName.js';
import AK from '../objects/AK47.js';
import GunFactory from '../services/GunFactory.js';
import renderScore from '../ui/ScoreRenderer.js';
import GameStateName from '../enums/GameStateName.js';


const { Engine, Events } = matter;

export default class PlayState extends State {
    constructor() {
        super();
        this.map = null;
        this.player1 = null;
        this.player2 = null;
        this.obstacles = [];
        this.powerUps = [];
        this.bullets = []; 
        this.player1Score = 0;
        this.player2Score = 0;
        this.winner = null;
        this.scoredthisRound = false;
    }

    async enter() {
        sounds.stop(SoundName.FunkyMusic);
        engine.world.gravity.x = 0;
        engine.world.gravity.y = 1;
        engine.world.gravity.scale = 0.001;

        // Play background music
        sounds.play(SoundName.EpicBackgroundMusic);
        
        // Load the map
        const mapData = await fetch('./assets/maps/map.json')
            .then(response => response.json());
        
        this.map = new TiledMap(mapData);
        await this.map.preloadTiles();
        
        this.player1 = CharacterFactory.createCharacter(150, 130, false);
        this.player2 = CharacterFactory.createCharacter(CANVAS_WIDTH - 150, 125, true);

        //generate a gun that will be used for both players

        const [gun1, gun2] = GunFactory.createGunForBothPlayers(this.player1, this.player2);
        this.player1.setGun(gun1);
        this.player2.setGun(gun2);
        console.log('Game ready! Player 1: W to jump, SPACE to aim/shoot | Player 2: UP ARROW to jump, SHIFT to aim/shoot');
        
        // Set up collision detection for bullets hitting characters
        this.setupCollisionDetection();
        this.generatePowerUp();
    }
    
    setupCollisionDetection() {
        // Listen for collision events
        Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            
            for (let i = 0; i < pairs.length; i++) {
                const bodyA = pairs[i].bodyA;
                const bodyB = pairs[i].bodyB;
                
                // Check if this pair is a bullet-character collision
                if ((bodyA.label === 'bullet' && bodyB.label === 'character') ||
                    (bodyA.label === 'character' && bodyB.label === 'bullet')) {

                    // Normalize which is bullet and which is character
                    const bulletBody = bodyA.label === 'bullet' ? bodyA : bodyB;
                    const characterBody = bodyA.label === 'character' ? bodyA : bodyB;

                    // Find the bullet object
                    const bullet = this.bullets.find(b => b.body === bulletBody);
                    if (!bullet) return;

                    // Determine the character that was hit
                    const hitCharacter = characterBody.entity ||
                        (characterBody === this.player1?.body ? this.player1 : this.player2);

                    // Ignore if bullet hit its shooter
                    if (bullet.shooter && bullet.shooter === hitCharacter) return;

                    // Apply knockback
                    this.applyKnockback(hitCharacter, bullet);

                    // Mark bullet for cleanup
                    bullet.shouldCleanUp = true;
                }

                // Check if this pair is a character-powerUp collision
                if ((bodyA.label === 'character' && bodyB.label === 'powerUp') ||
                    (bodyA.label === 'powerUp' && bodyB.label === 'character')) {

                    // Normalize which is character and which is powerUp
                    const characterBody = bodyA.label === 'character' ? bodyA : bodyB;
                    const powerUpBody = bodyA.label === 'powerUp' ? bodyA : bodyB;

                    // Find the powerUp object in our array
                    const powerUp = this.powerUps.find(p => p.body === powerUpBody);
                    if (!powerUp) return;

                    // Determine which character collected it
                    const player = characterBody === this.player1?.body ? this.player1 : this.player2;

                    // Apply the powerUp effect
                    powerUp.collect(player);

                    // Remove powerUp from the world and array
                    Matter.World.remove(world, powerUp.body);
                    this.powerUps = this.powerUps.filter(p => p !== powerUp);

                    console.log(`${powerUp.constructor.name} collected by ${player === this.player1 ? 'Player 1' : 'Player 2'}`);
                }

            }
        });
    }
    
    applyKnockback(character, bullet) {
        if (!character || !character.isAlive) return;

        const { Body } = matter;

        const vx = bullet.body.velocity.x;
        const vy = bullet.body.velocity.y;

        const speed = Math.hypot(vx, vy);
        if (speed < 0.001) return;

        const bulletMass = bullet.body.mass;
        const characterMass = character.body.mass;
        const density = character.body.density; // ~0.002–0.01

        // ---- TUNING ----
        const BASE_KNOCKBACK = 0.8;      // << important
        const DENSITY_FACTOR = 60;       // higher = more resistance

        // Density resistance (clamped so it never kills movement)
        const resistance = 1 + density * DENSITY_FACTOR;

        const impulseX =
            (vx / speed) *
            (bulletMass / characterMass) *
            BASE_KNOCKBACK /
            resistance;

        const impulseY =
            (vy / speed) *
            (bulletMass / characterMass) *
            BASE_KNOCKBACK /
            resistance;

        const current = character.body.velocity;

        Body.setVelocity(character.body, {
            x: current.x + impulseX,
            y: current.y + impulseY * 0.3
        });

        console.log('density:', density, 'resistance:', resistance, 'impulseX:', impulseX);
    }


   update(dt) {
        Engine.update(engine);

        if (Math.random() < 0.0001) {
            this.generateObstacle();
        }

        for (const obstacle of this.obstacles) obstacle.update(dt);
        for (const powerUp of this.powerUps) powerUp.update(dt);
        for (const bullet of this.bullets) {
            bullet.update(dt)
        }

        this.bullets = this.bullets.filter(b => !b.shouldCleanUp);

        // PLAYER 1 CONTROLS
        if (this.player1) {
            this.player1.update(dt);

            if (input.isKeyPressed(Input.KEYS.W)) this.player1.jump();

            if (input.isKeyHeld(Input.KEYS.SPACE)) {
                if (!this.player1.armRaised) this.player1.raiseArm();
            } else {
                if (this.player1.armRaised) {
                    this.player1.lowerArm();
                    const shots = this.player1.shoot();
                    sounds.play(SoundName.LaserShot);
                    if (shots) this.bullets.push(...(Array.isArray(shots) ? shots : [shots]));
                }
            }
        }

        // PLAYER 2 CONTROLS
        if (this.player2) {
            this.player2.update(dt);

            if (input.isKeyPressed(Input.KEYS.ARROW_UP)) this.player2.jump();

            if (input.isKeyHeld(Input.KEYS.O)) {
                if (!this.player2.armRaised) this.player2.raiseArm();
            } else {
                if (this.player2.armRaised) {
                    this.player2.lowerArm();
                    const shots = this.player2.shoot();
                    sounds.play(SoundName.LaserShot);
                    if (shots) this.bullets.push(...(Array.isArray(shots) ? shots : [shots]));
                }
            }
        }

        // ---- ROUND OVER CHECK ----
        if (
            !this.scoredthisRound &&
            (
                (this.player1 && this.player1.isDead()) ||
                (this.player2 && this.player2.isDead())
            )
        ) {
            console.log("Round scored.");
            this.updateScore();
            this.scoredthisRound = true;
            this.checkGameOver();

            setTimeout(() => this.resetRound(), 1500);
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

        for (const powerUp of this.powerUps) {
            powerUp.render();
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

    generatePowerUp() {
        console.log("generatePowerUp called");
        const x = 120 + Math.random() * (CANVAS_WIDTH - 240);
        const y = -80;

        const powerUp = PowerUpFactory.createPowerUp(x, y);
        
        this.powerUps.push(powerUp);
        matter.World.add(world, powerUp.body);
    }

    checkGameOver() {
    if (this.player1Score >= 3 || this.player2Score >= 3) {
        const winner =
            this.player1Score > this.player2Score ? 'blue' : 'red';

        stateMachine.change(GameStateName.Victory, {
            winner,
            blueScore: this.player1Score,
            redScore: this.player2Score
        });
    }
}


   updateScore() {
        if (this.player1.isDead()){
            this.player2Score++;
            console.log("Player 1 score = " + this.player1Score + " | Player 2 score = " + this.player2Score);
        } 
        else if (this.player2.isDead()){
            this.player1Score++;
        } 
    }
    resetRound() {
        console.log("Resetting round...");

        this.bullets = [];

        this.player1.respawn(150, 130);
        this.player2.respawn(CANVAS_WIDTH - 150, 130);

        matter.Body.setVelocity(this.player1.body, { x: 0, y: 0 });
        matter.Body.setVelocity(this.player2.body, { x: 0, y: 0 });

        this.scoredthisRound = false;
    }
}