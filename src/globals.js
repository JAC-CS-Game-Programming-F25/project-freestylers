import Fonts from '../lib/Fonts.js';
import Images from '../lib/Images.js';
import Sounds from '../lib/Sounds.js';
import StateMachine from '../lib/StateMachine.js';
import Timer from '../lib/Timer.js';
import Input from '../lib/Input.js';

export const canvas = document.createElement('canvas');
export const context =
	canvas.getContext('2d') || new CanvasRenderingContext2D();

export const CANVAS_WIDTH = 18 * 32;  // 576px
export const CANVAS_HEIGHT = 10 * 32; // 320px

const resizeCanvas = () => {
	const scaleX = window.innerWidth / CANVAS_WIDTH;
	const scaleY = window.innerHeight / CANVAS_HEIGHT;
	const scale = Math.min(scaleX, scaleY);  

	canvas.style.width = `${CANVAS_WIDTH * scale}px`;
	canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
};

window.addEventListener('resize', resizeCanvas);

resizeCanvas();  

export const keys = {};
export const images = new Images(context);
export const fonts = new Fonts();
export const stateMachine = new StateMachine();
export const timer = new Timer();
export const input = new Input(canvas);
export const sounds = new Sounds();

export const matter = Matter;
export const engine = Matter.Engine.create();
export const world = engine.world;