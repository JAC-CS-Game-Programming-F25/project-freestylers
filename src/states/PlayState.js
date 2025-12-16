    import State from '../../lib/State.js';
    import TiledMap from '../objects/TiledMap.js';
    import CharacterFactory from '../services/CharacterFactory.js';
    import ObstacleFactory from '../services/ObstacleFactory.js';
    import PowerUpFactory from '../services/PowerUpFactory.js';
    import SoundName from '../enums/SoundName.js';
    import { context, CANVAS_WIDTH, CANVAS_HEIGHT, matter, engine, world, sounds, timer, stateMachine} from '../globals.js';
    import GunFactory from '../services/GunFactory.js';
    import renderScore from '../ui/ScoreRenderer.js';
    import GameStateName from '../enums/GameStateName.js';
    import Persistence from '../services/Persistence.js';

    const { Engine, Events, Composite, World } = matter;

    export default class PlayState extends State {
        constructor() {
            super();
            this.map = null;
            this.player1 = null;
            this.player2 = null;
            this.obstacles = [];
            this.powerUps = [];
            this.bullets = [];
            this.winner = null;
            this.scoredthisRound = false;
            this.pauseHovered = false;
            this.pauseButtonSize = 40;
        }

        async enter() {
            this.resetRound();
            const savedInfo = Persistence.loadGameInfo();
            this.player1Score = savedInfo.player1Score || 0;
            this.player2Score = savedInfo.player2Score || 0;
            this.playerCount = savedInfo.playerCount;

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
            
            this.player1 = CharacterFactory.createCharacter(150, 130, false, this, false);
            this.player2 = CharacterFactory.createCharacter(CANVAS_WIDTH - 150, 125, true, this, this.playerCount === 1);

            const savedGunType = savedInfo.gunType || '';
            const [gun1, gun2] = GunFactory.createGunForBothPlayers(this.player1, this.player2, savedGunType);

            this.player1.setGun(gun1);
            this.player2.setGun(gun2);

            Persistence.saveGameInfo({ gunType: gun1.type });
            
            // Set up collision detection for bullets hitting characters
            this.setupCollisionDetection();
            this.generatePowerUp();

            const canvas = document.querySelector('canvas');
            canvas.addEventListener('click', this.handleClick.bind(this));
            canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        }
        
        setupCollisionDetection() {
            Events.on(engine, 'collisionStart', (event) => {
                const pairs = event.pairs;

                for (let i = 0; i < pairs.length; i++) {
                    const bodyA = pairs[i].bodyA;
                    const bodyB = pairs[i].bodyB;

                    // Bullet hits character
                    if ((bodyA.label === 'bullet' && bodyB.label === 'character') ||
                        (bodyA.label === 'character' && bodyB.label === 'bullet')) {

                        const bulletBody = bodyA.label === 'bullet' ? bodyA : bodyB;
                        const characterBody = bodyA.label === 'character' ? bodyA : bodyB;

                        const bullet = this.bullets.find(b => b.body === bulletBody);
                        if (!bullet) return;

                        const hitCharacter = characterBody.entity ||
                            (characterBody === this.player1?.body ? this.player1 : this.player2);

                        if (bullet.shooter && bullet.shooter === hitCharacter) return;

                        this.applyKnockback(hitCharacter, bullet);

                        bullet.shouldCleanUp = true;
                    }

                    // Bullet hits obstacle
                    if ((bodyA.label === 'bullet' && bodyB.label === 'obstacle') ||
                        (bodyA.label === 'obstacle' && bodyB.label === 'bullet')) {

                        const bulletBody = bodyA.label === 'bullet' ? bodyA : bodyB;
                        const bullet = this.bullets.find(b => b.body === bulletBody);
                        if (!bullet) return;

                        // Mark bullet for cleanup
                        bullet.shouldCleanUp = true;
                    }

                    // Character collects powerUp
                    if ((bodyA.label === 'character' && bodyB.label === 'powerUp') ||
                        (bodyA.label === 'powerUp' && bodyB.label === 'character')) {

                        const characterBody = bodyA.label === 'character' ? bodyA : bodyB;
                        const powerUpBody = bodyA.label === 'powerUp' ? bodyA : bodyB;

                        const powerUp = this.powerUps.find(p => p.body === powerUpBody);
                        if (!powerUp) return;

                        const player = characterBody === this.player1?.body ? this.player1 : this.player2;

                        powerUp.collect(player);

                        this.powerUps = this.powerUps.filter(p => p !== powerUp);
                        this.removeBodiesByLabel("powerUp");
                    }
                }
            });
        }

        exit() {
            const canvas = document.querySelector('canvas');
            canvas.removeEventListener('click', this.handleClick.bind(this));
            canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        }

        getMousePos(event) {
            const rect = event.target.getBoundingClientRect();
            return {
                x: (event.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
                y: (event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height),
            };
        }

        handleMouseMove(event) {
            const { x, y } = this.getMousePos(event);

            this.pauseHovered =
                x > 10 &&
                x < 10 + this.pauseButtonSize &&
                y > 10 &&
                y < 10 + this.pauseButtonSize;
        }

        handleClick(event) {
            const { x, y } = this.getMousePos(event);

            if (this.pauseHovered) {
                stateMachine.change(GameStateName.Pause, { player1Score: this.player1Score, player2Score: this.player2Score});
            }
        }

        
        applyKnockback(character, bullet) {
            if (!character || !character.isAlive) return;

            if (bullet.shooter.gun.type === 'bazooka') {
                character.handleExplosion();
                return;
            }

            character.handleHit();

            const { Body } = matter;

            const vx = bullet.body.velocity.x;
            const vy = bullet.body.velocity.y;

            const speed = Math.hypot(vx, vy);
            if (speed < 0.001) return;

            const bulletMass = bullet.body.mass;
            const characterMass = character.body.mass;
            const density = character.body.density;

            const BASE_KNOCKBACK = 0.8;
            const DENSITY_FACTOR = 60;

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
        }

    update(dt) {
            Engine.update(engine);

            if (Math.random() < 0.0001) {
                this.generateObstacle();
            }

            for (const obstacle of this.obstacles) obstacle.update(dt);
            for (const powerUp of this.powerUps) powerUp.update(dt);
            for (const bullet of this.bullets) bullet.update(dt)

            this.bullets = this.bullets.filter(b => !b.shouldCleanUp);

            if (this.player1) this.player1.update(dt);
            if (this.player2) this.player2.update(dt);

            if (
                !this.scoredthisRound &&
                (
                    (this.player1 && this.player1.isDead()) ||
                    (this.player2 && this.player2.isDead())
                )
            ) {
                this.updateScore();
                this.scoredthisRound = true;
                this.checkGameOver();

                setTimeout(() => this.resetRound(), 1500);
            }
        }

        render() {
            context.fillStyle = '#87CEEB';
            context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            if (this.map) this.map.render()

            if (this.player1) this.player1.render();
            if (this.player2) this.player2.render();
            
            // Render obstacles
            for (const obstacle of this.obstacles) obstacle.render()

            for (const powerUp of this.powerUps) powerUp.render()

            // Render bullets
            for (const bullet of this.bullets) bullet.render()

            renderScore(this.player1Score, this.player2Score);
            this.renderPauseButton();
        }

        renderPauseButton() {
            // Draw || symbol for pause
            context.strokeStyle = 'black';
            context.lineWidth = 4;
            context.beginPath();
            context.moveTo(20, 15);
            context.lineTo(20, 35);
            context.moveTo(30, 15);
            context.lineTo(30, 35);
            context.stroke();
        }

        addBullets(bullets) {
            for (const bullet of bullets) {
                this.bullets.push(bullet);
            }
        }

        generateObstacle(){
            const x = 120 + Math.random() * (CANVAS_WIDTH - 240);
            const y = -80;

            const obstacle = ObstacleFactory.createRandom(x, y);
            
            this.obstacles.push(obstacle);
            matter.World.add(world, obstacle.body);
        }

        generatePowerUp() {
            timer.wait(2 + Math.random()).then(() => {
                const x = 120 + Math.random() * (CANVAS_WIDTH - 240);
                const y = -80;
                const powerUp = PowerUpFactory.createPowerUp(x, y);
                this.powerUps.push(powerUp);
                matter.World.add(world, powerUp.body);
            });
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
            if (this.player1.isDead()) {
                this.player2Score++;
            } else if (this.player2.isDead()) {
                this.player1Score++;
            }
            Persistence.saveGameInfo({
                player1Score: this.player1Score,
                player2Score: this.player2Score
            });
        }

        resetRound() {
            this.clearBodies();

            // Clear arrays
            this.bullets = [];
            this.powerUps = [];
            this.obstacles = [];

            // Respawn players
            if (this.player1 && this.player2) {
                this.player1.respawn(150, 130);
                this.player2.respawn(CANVAS_WIDTH - 150, 130);

                // Reset guns
                const savedInfo = Persistence.loadGameInfo();
                const savedGunType = savedInfo.gunType || '';

                const [gun1, gun2] = GunFactory.createGunForBothPlayers(
                    this.player1, 
                    this.player2, 
                    savedGunType, 
                    true
                );

                this.player1.setGun(gun1);
                this.player2.setGun(gun2);

                Persistence.saveGameInfo({ gunType: gun1.type });

                // Reset velocities
                matter.Body.setVelocity(this.player1.body, { x: 0, y: 0 });
                matter.Body.setVelocity(this.player2.body, { x: 0, y: 0 });

                this.scoredthisRound = false;
            }
        }

        clearBodies() {
            const bodies = Composite.allBodies(world);
            const bodiesToRemove = bodies.filter(body => 
                body.label !== 'character' && 
                body.label !== 'platform'
            );
            
            World.remove(world, bodiesToRemove);
        }

        removeBodiesByLabel(label) {
            const bodies = Composite.allBodies(world);

            for (const body of bodies) {
                if (body.label === label) {
                    World.remove(world, body);
                }
            }
        }
    }