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

const { Engine, Events } = matter;

export default class PlayState extends State {
    constructor() {
        super();
        this.map = null;
        this.player1 = null;
        this.player2 = null;
        this.obstacles = [];
        this.bullets = []; 
        this.player1Score = 0;
        this.player2Score = 0;
        this.winner = null;
        this.scoredthisRound = false;
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
        
        // Set up collision detection for bullets hitting characters
        this.setupCollisionDetection();
    }
    
    setupCollisionDetection() {
        // Listen for collision events
        Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            
            for (let i = 0; i < pairs.length; i++) {
                const bodyA = pairs[i].bodyA;
                const bodyB = pairs[i].bodyB;
                
                // Check if a bullet collided with a character
                if (bodyA.label === 'bullet' && bodyB.label === 'character') {
                    // Find the bullet in our bullets array
                    const bullet = this.bullets.find(b => b.body === bodyA);
                    if (bullet) {
                        // Get the character that was hit
                        const hitCharacter = bodyB.entity || (bodyB === this.player1?.body ? this.player1 : this.player2);
                        
                        // Don't hit the shooter
                        if (bullet.shooter && bullet.shooter === hitCharacter) {
                            return; // Ignore collision with shooter
                        }
                        
                        // Apply knockback to the character
                        this.applyKnockback(hitCharacter, bullet);
                        
                        bullet.shouldCleanUp = true;
                        console.log('Bullet hit character');
                    }
                } else if (bodyA.label === 'character' && bodyB.label === 'bullet') {
                    // Find the bullet in our bullets array
                    const bullet = this.bullets.find(b => b.body === bodyB);
                    if (bullet) {
                        // Get the character that was hit
                        const hitCharacter = bodyA.entity || (bodyA === this.player1?.body ? this.player1 : this.player2);
                        
                        // Don't hit the shooter
                        if (bullet.shooter && bullet.shooter === hitCharacter) {
                            return; // Ignore collision with shooter
                        }
                        
                        // Apply knockback to the character
                        this.applyKnockback(hitCharacter, bullet);
                        
                        bullet.shouldCleanUp = true;
                        console.log('Bullet hit character');
                    }
                }
            }
        });
    }
    
    applyKnockback(character, bullet) {
        if (!character || !character.isAlive) return;
        
        const { Body, World } = matter;
        
        
        
        const speed = Math.sqrt(bullet.velocityX * bullet.velocityX + bullet.velocityY * bullet.velocityY);
        
        
        if (speed < 0.01) {
            // Default knockback direction
            const knockbackX = bullet.velocityX > 0 ? 3.0 : -3.0;
            
            // Temporarily detach anchor so character can move
            if (character.isAttached) {
                World.remove(world, character.anchor);
                character.isAttached = false;
            }
            
            // Apply velocity directly
            const currentVelocity = Body.getVelocity(character.body);
            Body.setVelocity(character.body, {
                x: currentVelocity.x + knockbackX,
                y: currentVelocity.y
            });
            
            // Reattach anchor after delay
            setTimeout(() => {
                if (character.isAlive && !character.isAttached) {
                    character.anchor.pointB.x = character.body.position.x;
                    character.anchor.pointB.y = character.body.position.y + character.colliderHeight / 2;
                    
                    World.add(world, character.anchor);
                    character.isAttached = true;
                }
            }, 400);
            return;
        }
        
        const knockbackStrength = 3.0; // Velocity strength (direct velocity, bypasses mass)
        
        // Calculate knockback direction
        const knockbackX = (bullet.velocityX / speed) * knockbackStrength;
        const knockbackY = (bullet.velocityY / speed) * knockbackStrength;
        
        // Temporarily detach anchor so character can move
        if (character.isAttached) {
            World.remove(world, character.anchor);
            character.isAttached = false;
        }
        
        // Get current velocity and add knockback (direct velocity setting bypasses mass issues)
        const currentVelocity = Body.getVelocity(character.body);
        Body.setVelocity(character.body, {
            x: currentVelocity.x + knockbackX,
            y: currentVelocity.y + knockbackY
        });
        
        // Reattach anchor after a delay to allow movement
        setTimeout(() => {
            if (character.isAlive && !character.isAttached) {
                character.anchor.pointB.x = character.body.position.x;
                character.anchor.pointB.y = character.body.position.y + character.colliderHeight / 2;
                
                World.add(world, character.anchor);
                character.isAttached = true;
            }
        }, 400); // Longer delay to allow more movement
    }

   update(dt) {
        Engine.update(engine);

        if (Math.random() < 0.0001) {
            this.generateObstacle();
        }

        for (const obstacle of this.obstacles) obstacle.update(dt);
        for (const bullet of this.bullets) bullet.update(dt);

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

            if (input.isKeyHeld(Input.KEYS.SHIFT)) {
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

    checkGameOver(){
        if(this.player1Score>3 || this.player2Score>3){
            this.winner = player1Score>player2Score ? "Player 1" : "Player 2";
        }
        
    }

   updateScore() {
        if (this.player1.isDead()) this.player2Score++;
        else if (this.player2.isDead()) this.player1Score++;
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