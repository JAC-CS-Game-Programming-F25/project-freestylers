import State from '../../lib/State.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, input, stateMachine, timer,sounds } from '../globals.js';
import Input from '../../lib/Input.js';
import GameStateName from '../enums/GameStateName.js';
import Easing from '../../lib/Easing.js';
import SoundName from '../enums/SoundName.js';
import renderScore from '../ui/ScoreRenderer.js';
import Persistence from '../services/Persistence.js';


export default class VictoryState extends State {
	constructor() {
		super();

		this.bgImage = new Image();
		this.bgImage.src = './assets/images/background2.png';

		this.loaded = false;
		this.bgImage.onload = () => (this.loaded = true);

		this.winner = 'blue';
		this.blueScore = 0;
		this.redScore = 0;

		this.playAgainHovered = false;
		this.menuHovered = false;

		// Animation
		this.winScale = 0;

		this.handleClick = this.handleClick.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
	}

	async enter(params = {}) {
		
		this.winner = params.winner ?? this.winner;
		this.blueScore = params.blueScore ?? this.blueScore;
		this.redScore = params.redScore ?? this.redScore;

		this.winScale = 0;

		const canvas = document.querySelector('canvas');
		canvas.addEventListener('click', this.handleClick);
		canvas.addEventListener('mousemove', this.handleMouseMove);

		await timer.tweenAsync(
			this,
			{ winScale: 1 },
			0.45,
			Easing.easeOutBack
		);
	}

	exit() {
		const canvas = document.querySelector('canvas');
		canvas.removeEventListener('click', this.handleClick);
		canvas.removeEventListener('mousemove', this.handleMouseMove);
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

		this.playAgainHovered =
			x > CANVAS_WIDTH / 2 - 120 &&
			x < CANVAS_WIDTH / 2 + 120 &&
			y > 245 &&
			y < 280;

		this.menuHovered =
			x > CANVAS_WIDTH / 2 - 80 &&
			x < CANVAS_WIDTH / 2 + 80 &&
			y > 290 &&
			y < 325;
	}

	handleClick(event) {
		const { x, y } = this.getMousePos(event);

		if (this.playAgainHovered) {
			Persistence.resetScore();
			stateMachine.change(GameStateName.Play);
		}

		if (this.menuHovered) {
			sounds.stop(SoundName.EpicBackgroundMusic);
			Persistence.resetScore();
			stateMachine.change(GameStateName.Menu);
		}
	}

	update() {
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			Persistence.resetScore();
			stateMachine.change(GameStateName.Play);
		}
		if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
			Persistence.resetScore();
			stateMachine.change(GameStateName.Menu);
		}
	}

	render() {
		if (this.loaded) {
			context.drawImage(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		} else {
			context.fillStyle = '#000';
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		this.renderScore();
		this.renderWinner();
		this.renderSubtitle();
		this.renderButtons();
	}

	renderScore() {
		renderScore(this.blueScore, this.redScore);
	}

	/* ---------- WINNER TEXT ---------- */
	renderWinner() {
		const text = this.winner === 'blue' ? 'BLUE WINS!' : 'RED WINS!';
		const color = this.winner === 'blue' ? '#2d6bff' : '#ff2d2d';

		context.save();
		context.translate(CANVAS_WIDTH / 2, 150);
		context.scale(this.winScale, this.winScale);

		context.font = '64px FutureMillennium';
		context.textAlign = 'center';
		context.lineWidth = 8;
		context.fillStyle = color;
		context.strokeStyle = 'black';

		context.strokeText(text, 0, 0);
		context.fillText(text, 0, 0);

		context.restore();
	}

	/* ---------- SUBTITLE ---------- */
	renderSubtitle() {
		const color = this.winner === 'blue' ? '#2d6bff' : '#ff2d2d';
		context.font = '26px FutureMillennium';
		context.textAlign = 'center';
		context.lineWidth = 5;
		context.fillStyle = color;
		context.strokeStyle = 'black';

		const text =
			this.winner === 'blue'
				? 'Blue teach Red how to play the game'
				: 'Red teach Blue how to play the game';


		context.strokeText(text, CANVAS_WIDTH / 2, 210);
		context.fillText(text, CANVAS_WIDTH / 2, 210);
	}

	/* ---------- BUTTONS ---------- */
	renderButtons() {
		context.textAlign = 'center';
		
		// PLAY AGAIN
		context.font = '32px FutureMillennium';
		context.lineWidth = 4;
		context.fillStyle = this.playAgainHovered ? '#ffdd00' : '#ffc400';
		context.strokeStyle = 'black';

		context.strokeText('PLAY AGAIN', CANVAS_WIDTH / 2, 270);
		context.fillText('PLAY AGAIN', CANVAS_WIDTH / 2, 270);

		// MENU
		context.font = '32px FutureMillennium';
		context.fillStyle = this.menuHovered ?  '#2dffaeff':'#198a19ff' ;

		context.strokeText('MENU', CANVAS_WIDTH / 2, 315);
		context.fillText('MENU', CANVAS_WIDTH / 2, 315);
	}
}