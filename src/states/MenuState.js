import State from '../../lib/State.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, input, stateMachine, sounds, timer } from '../globals.js';
import Input from '../../lib/Input.js';
import SoundName from '../enums/SoundName.js';
import Easing from '../../lib/Easing.js';
import PlayerSelectState from './PlayerSelectState.js';

export default class MenuState extends State {
    constructor() {
        super();
        this.bgImage = new Image();
        this.bgImage.src = './assets/images/background2.png';

        this.loaded = false;
        this.bgImage.onload = () => {
            this.loaded = true;
        };
        
        this.playButtonHovered = false;
        this.playButtonPressed = false;
        this.titleY = -100; // Start position above screen
        this.titleVisible = true;
        this.canInteract = false;
    }

    enter() {
        // Reset state
        this.playButtonPressed = false;
        this.titleY = -100;
        this.titleVisible = true;
        this.canInteract = false;
        
        // Animate title dropping and bouncing
        this.animateTitleDrop();
    }

    async animateTitleDrop() {
        const targetY = CANVAS_HEIGHT / 2 - 10;
        
        // First bounce - drop to target with overshoot
        await timer.tweenAsync(
            this,
            { titleY: targetY + 30 },
            0.6,
            Easing.easeInQuad
        );
        
        // Bounce back up
        await timer.tweenAsync(
            this,
            { titleY: targetY - 15 },
            0.3,
            Easing.easeOutQuad
        );
        
        // Small bounce down
        await timer.tweenAsync(
            this,
            { titleY: targetY + 5 },
            0.2,
            Easing.easeInQuad
        );
        
        // Settle to final position
        await timer.tweenAsync(
            this,
            { titleY: targetY },
            0.15,
            Easing.easeOutQuad
        );
        
        // Enable interaction after animation completes
        this.canInteract = true;
    }

    async animateTitleFall() {
        this.canInteract = false;
        
        // Fall down off screen
        await timer.tweenAsync(
            this,
            { titleY: CANVAS_HEIGHT + 200 },
            0.8,
            Easing.easeInQuad
        );
        
        // Start music and transition
        stateMachine.change('title');
    }

    update(dt) {
        // Check if space or enter is pressed to start
        if (this.canInteract && (input.isKeyPressed(Input.KEYS.SPACE) || input.isKeyPressed(Input.KEYS.ENTER))) {
            if (!this.playButtonPressed) {
                this.playButtonPressed = true;
                 sounds.play(SoundName.FunkyMusic);
                this.animateTitleFall();
            }
        }
    }

    render() {
        context.save();

        if (this.loaded) {
            context.drawImage(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            context.fillStyle = '#000';
            context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
        
        if (this.titleVisible) {
            this.renderTitle();
        }
        
        if (this.canInteract) {
            this.renderPlayButton();
        }
        
        context.restore();
    }

    renderTitle() {
        context.font = "48px FutureMillennium";
        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 8;   
        context.strokeText("Platform", CANVAS_WIDTH / 2, this.titleY - 40);
        context.fillText("Platform", CANVAS_WIDTH / 2, this.titleY - 40);
        
        context.strokeText("Shooters", CANVAS_WIDTH / 2, this.titleY + 20);
        context.fillText("Shooters", CANVAS_WIDTH / 2, this.titleY + 20);
    }

    renderPlayButton() {
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2 + 80;
        const width = 160;
        const height = 80;
        const x = centerX - width / 2;
        const y = centerY - height / 2;

        // Draw play triangle button
        context.fillStyle = this.playButtonPressed ? "#00cc00" : "#00ff00";
        context.strokeStyle = "white";
        context.lineWidth = 4;

        context.beginPath();
        context.moveTo(x + width * 0.3, y + height * 0.2);
        context.lineTo(x + width * 0.8, y + height * 0.5);
        context.lineTo(x + width * 0.3, y + height * 0.8);
        context.closePath();
        context.fill();
        context.stroke();

        // Add instruction text
        context.font = "16px FutureMillennium";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 4;
        context.textAlign = "center";
        context.strokeText("Press SPACE to Play", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
        context.fillText("Press SPACE to Play", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
    }
}