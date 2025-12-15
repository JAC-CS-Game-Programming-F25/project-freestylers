import State from '../../lib/State.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, input, stateMachine, timer } from '../globals.js';
import Input from '../../lib/Input.js';
import Easing from '../../lib/Easing.js';
import GameStateName from '../enums/GameStateName.js';

export default class PlayerSelectState extends State {
    constructor() {
        super();
        this.bgImage = new Image();
        this.bgImage.src = './assets/images/background2.png';

        this.loaded = false;
        this.bgImage.onload = () => {
            this.loaded = true;
        };
        
        // Text positions
        this.onePlayerX = -400; // Start off-screen left
        this.twoPlayerX = CANVAS_WIDTH + 400; // Start off-screen right
        this.textY = CANVAS_HEIGHT / 2;
        
        // Floating animation
        this.floatOffset = 0;
        this.floatSpeed = 2;
        this.floatAmount = 15;
        
        this.canInteract = false;
        this.selectedOption = null;
        
        // Click detection
        this.handleClick = this.handleClick.bind(this);
    }

    enter() {
        // Reset state
        this.onePlayerX = -400;
        this.twoPlayerX = CANVAS_WIDTH + 400;
        this.floatOffset = 0;
        this.canInteract = false;
        this.selectedOption = null;
        
        // Add click listener
        const canvas = document.querySelector('canvas');
        canvas.addEventListener('click', this.handleClick);
        
        // Animate text sliding in
        this.animateTextSlideIn();
    }
    
    exit() {
        // Remove click listener
        const canvas = document.querySelector('canvas');
        canvas.removeEventListener('click', this.handleClick);
    }
    
   handleClick(event) {
    if (!this.canInteract || this.selectedOption) return;

    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    const floatY = Math.sin(this.floatOffset) * this.floatAmount;

    const onePlayerBounds = {
        x: this.onePlayerX - 150,
        y: this.textY - 80 + floatY,
        width: 300,
        height: 140
    };

    if (
        mouseX >= onePlayerBounds.x &&
        mouseX <= onePlayerBounds.x + onePlayerBounds.width &&
        mouseY >= onePlayerBounds.y &&
        mouseY <= onePlayerBounds.y + onePlayerBounds.height
    ) {
        this.selectOption('one');
        return;
    }

    const twoPlayerBounds = {
        x: this.twoPlayerX - 150,
        y: this.textY - 80 + floatY,
        width: 300,
        height: 140
    };

    if (
        mouseX >= twoPlayerBounds.x &&
        mouseX <= twoPlayerBounds.x + twoPlayerBounds.width &&
        mouseY >= twoPlayerBounds.y &&
        mouseY <= twoPlayerBounds.y + twoPlayerBounds.height
    ) {
        this.selectOption('two');
    }
}

    async animateTextSlideIn() {
        const onePlayerTarget = CANVAS_WIDTH * 0.25;
        const twoPlayerTarget = CANVAS_WIDTH * 0.75;
        
        // Slide both texts in simultaneously
        await Promise.all([
            timer.tweenAsync(
                this,
                { onePlayerX: onePlayerTarget },
                0.8,
                Easing.easeOutQuad
            ),
            timer.tweenAsync(
                this,
                { twoPlayerX: twoPlayerTarget },
                0.8,
                Easing.easeOutQuad
            )
        ]);
        
        // Enable interaction after animation completes
        this.canInteract = true;
    }

    update(dt) {
        // Update floating animation
        this.floatOffset += this.floatSpeed * dt;
        
        // Check for player selection
        if (this.canInteract && !this.selectedOption) {
            // Left side keys for one player (W, A, Shift)
            if (input.isKeyPressed(Input.KEYS.W) || 
                input.isKeyPressed(Input.KEYS.A) || 
                input.isKeyPressed(Input.KEYS.SHIFT)) {
                this.selectOption('one');
            }
            
            // Right side keys for two players (Arrow Up, Arrow Right, Space)
            if (input.isKeyPressed(Input.KEYS.ARROW_UP) || 
                input.isKeyPressed(Input.KEYS.ARROW_RIGHT) ||
                input.isKeyPressed(Input.KEYS.SPACE)) {
                this.selectOption('two');
            }
        }
    }
  
    selectOption(option) {
        this.selectedOption = option;
        this.canInteract = false;
        
        // Transition to title screen
        setTimeout(() => {
            stateMachine.change(GameStateName.TitleScreen, { playerCount: option === 'one' ? 1 : 2 });
        }, 300);
    }

    render() {
        context.save();

        if (this.loaded) {
            context.drawImage(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            context.fillStyle = '#000';
            context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
        
        this.renderPlayerOptions();
        this.renderInstructions();
        
        context.restore();
    }

    renderPlayerOptions() {
        const floatY = Math.sin(this.floatOffset) * this.floatAmount;
        
        // ONE PLAYER (left side, blue)
        this.renderText(
            "ONE",
            this.onePlayerX,
            this.textY - 60 + floatY,
            "#5b9cf5",
            this.selectedOption === 'one'
        );
        this.renderText(
            "PLAYER",
            this.onePlayerX,
            this.textY + 40 + floatY,
            "#5b9cf5",
            this.selectedOption === 'one'
        );
        
        // TWO PLAYER (right side, red)
        this.renderText(
            "TWO",
            this.twoPlayerX,
            this.textY - 60 + floatY,
            "#f55b5b",
            this.selectedOption === 'two'
        );
        this.renderText(
            "PLAYER",
            this.twoPlayerX,
            this.textY + 40 + floatY,
            "#f55b5b",
            this.selectedOption === 'two'
        );
    }

    renderText(text, x, y, color, isSelected) {
        context.font = "64px FutureMillennium";
        context.textAlign = "center";
        
        // Black outline
        context.strokeStyle = "black";
        context.lineWidth = isSelected ? 10 : 8;
        context.strokeText(text, x, y);
        
        // Colored fill
        context.fillStyle = isSelected ? "#ffffff" : color;
        context.fillText(text, x, y);
    }

    renderInstructions() {
        if (!this.canInteract) return;
        
        const y = CANVAS_HEIGHT - 60;
        
        context.font = "16px FutureMillennium";
        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 4;
        
        // Left instruction
        context.strokeText("Click or press W / SHIFT", CANVAS_WIDTH * 0.25, y);
        context.fillText("Click or press W / SHIFT", CANVAS_WIDTH * 0.25, y);
        
        // Right instruction
        context.strokeText("Click or press ↑ / SPACE", CANVAS_WIDTH * 0.75, y);
        context.fillText("Click or press ↑ / SPACE", CANVAS_WIDTH * 0.75, y);
    }
}