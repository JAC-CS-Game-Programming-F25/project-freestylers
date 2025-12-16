import State from '../../lib/State.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, input, stateMachine, timer, sounds } from '../globals.js';
import Input from '../../lib/Input.js';
import GameStateName from '../enums/GameStateName.js';
import SoundName from '../enums/SoundName.js';
import renderScore from '../ui/ScoreRenderer.js';
import Persistence from '../services/Persistence.js';

export default class PauseState extends State {
    constructor() {
        super();
        this.bgImage = new Image();
        this.bgImage.src = './assets/images/background2.png';
        this.loaded = false;
        this.bgImage.onload = () => (this.loaded = true);

        this.resumeHovered = false;
        this.menuHovered = false;

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    enter({ player1Score, player2Score } = {}) {
        const savedInfo = Persistence.loadGameInfo();
        this.player1Score = player1Score ?? savedInfo.player1Score ?? 0;
        this.player2Score = player2Score ?? savedInfo.player2Score ?? 0;

        const canvas = document.querySelector('canvas');
        canvas.addEventListener('click', this.handleClick);
        canvas.addEventListener('mousemove', this.handleMouseMove);
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

        this.resumeHovered =
            x > CANVAS_WIDTH / 2 - 100 &&
            x < CANVAS_WIDTH / 2 + 100 &&
            y > 220 &&
            y < 260;

        this.menuHovered =
            x > CANVAS_WIDTH / 2 - 80 &&
            x < CANVAS_WIDTH / 2 + 80 &&
            y > 280 &&
            y < 320;
    }

    handleClick(event) {
        if (this.resumeHovered) {
            stateMachine.change(GameStateName.Play);
        }

        if (this.menuHovered) {
            sounds.stop(SoundName.EpicBackgroundMusic);
            stateMachine.change(GameStateName.Menu);
        }
    }

    update() {
        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            stateMachine.change(GameStateName.Play);
        }
    }

    render() {
        // Draw background
        if (this.loaded) {
            context.drawImage(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            context.fillStyle = '#000';
            context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        // Optional semi-transparent overlay for pause effect
        context.fillStyle = 'rgba(0,0,0,0.4)';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.renderButtons();
        renderScore(this.player1Score, this.player2Score)
    }

    renderButtons() {
        context.textAlign = 'center';
        context.font = '32px FutureMillennium';
        context.lineWidth = 4;

        // RESUME
        context.fillStyle = this.resumeHovered ? '#ffdd00' : '#ffc400';
        context.strokeStyle = 'black';
        context.strokeText('RESUME', CANVAS_WIDTH / 2, 250);
        context.fillText('RESUME', CANVAS_WIDTH / 2, 250);

        // MENU
        context.fillStyle = this.menuHovered ? '#2dffaeff' : '#198a19ff';
        context.strokeText('MENU', CANVAS_WIDTH / 2, 310);
        context.fillText('MENU', CANVAS_WIDTH / 2, 310);
    }
}
