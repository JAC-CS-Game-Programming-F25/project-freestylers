import State from '../../lib/State.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, input, stateMachine } from '../globals.js';
import Input from '../../lib/Input.js';
import GameStateName from '../enums/GameStateName.js';

/**
 * actually the setup state...
 */
export default class TitleScreenState extends State {
    constructor() {
        super();
        this.bgImage = new Image();
        this.bgImage.src = './assets/images/background.png';

        this.loaded = false;
        this.bgImage.onload = () => {
            this.loaded = true;
        };
		this.player1Ready = false;
		this.player2Ready = false;
		this.transitioning = false; 
    }

	enter({ playerCount = 1 } = {}) {
		this.player1Ready = false;
		this.player2Ready = false;

		// Save the player count so the TitleScreenState knows if 1 or 2 players are playing
		this.playerCount = playerCount;
	}

	update(dt) {
		// Player 1 input
		if (input.isKeyHeld(Input.KEYS.W)) {
			this.player1Ready = true;
		}

		// Player 2 input (only if 2 players)
		if (this.playerCount === 2 && input.isKeyHeld(Input.KEYS.ENTER) && input.isKeyHeld(Input.KEYS.ARROW_UP)) {
			this.player2Ready = true;
		}

		// Check if ready to start
		const readyToStart = this.playerCount === 1
			? this.player1Ready
			: this.player1Ready && this.player2Ready;

		if (readyToStart && !this.transitioning) {
			this.transitioning = true; // prevent repeats
			setTimeout(() => {
				stateMachine.change(GameStateName.Play);
			}, 1000);
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
		this.renderTitle();
		this.renderInstructions();
		this.renderCheckmarkButton(CANVAS_WIDTH * 0.25 - 60, 244, this.player1Ready);
		if (this.playerCount > 1) this.renderCheckmarkButton(CANVAS_WIDTH * 0.75 - 60, 244, this.player2Ready);
    }

	renderTitle() {
		
		context.font = "32px FutureMillennium";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.strokeStyle = "black";
		context.lineWidth = 6;   
		context.strokeText("Platform Shooters", CANVAS_WIDTH / 2, 100);
		context.fillText("Platform Shooters", CANVAS_WIDTH / 2, 100);
	}

	renderPlayer1Instructions() {
		const x = CANVAS_WIDTH * 0.25;  // left quarter of screen
		let y = 150;

		context.textAlign = "center";
		context.fillStyle = "white";
		context.font = "18px FutureMillennium";
		context.strokeStyle = "black";
		context.lineWidth = 6;   

		const lines = [
			"PLAYER 1",
			"JUMP: W, SHOOT: SPACE",
			"Hold SPACE + W",
			"to join the battle"
		];

		lines.forEach(line => {
			context.strokeText(line, x, y);
			context.fillText(line, x, y);
			y += 28;
		});
	}

	renderPlayer2Instructions() {
		const x = CANVAS_WIDTH * 0.75; // right quarter of screen
		let y = 150;

		context.textAlign = "center";
		context.fillStyle = "white";
		context.font = "18px FutureMillennium";
		context.strokeStyle = "black";
		context.lineWidth = 6;

		const lines = [
			"PLAYER 2",
			"JUMP: UP ARROW, SHOOT: ENTER",
			"Hold ENTER + UP ARROW",
			"to join the battle"
		];

		lines.forEach(line => {
			context.strokeText(line, x, y);
			context.fillText(line, x, y);
			y += 28;
		});
	}

	renderInstructions() {
		if (this.playerCount === 1) {
			// Show instructions only for Player 1
			this.renderPlayer1Instructions();
		} else if (this.playerCount === 2) {
			// Show instructions for both players
			this.renderPlayer1Instructions();
			this.renderPlayer2Instructions();
		}
	}


	// this function was fully ai generated vik not one word of it was written by me
	renderCheckmarkButton(x, y, isReady) {
    const width = 120;
    const height = 50;
    const radius = 12;

    // Background
    context.lineWidth = 4;
    context.strokeStyle = isReady ? "#00ff41" : "#666";
    context.fillStyle = isReady
        ? "rgba(0, 255, 65, 0.20)"
        : "rgba(255, 255, 255, 0.10)";

    // Rounded rectangle
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();

    context.fill();
    context.stroke();

    // Checkmark
    if (isReady) {
        context.lineWidth = 6;
        context.strokeStyle = "#00ff41";
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(x + 25, y + 28);
        context.lineTo(x + 50, y + 40);
        context.lineTo(x + 90, y + 12);
        context.stroke();
    }
}
}
