import State from '../../lib/State.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, input, stateMachine } from '../globals.js';
import Input from '../../lib/Input.js';

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
    }

    enter() {
		this.player1Ready = false;
		this.player2Ready = false;
	}

    update(dt) {
        if(input.isKeyHeld(Input.KEYS.SHIFT)&& input.isKeyHeld(Input.KEYS.W)){
			this.player1Ready = true;
			console.log("Player 1 ready");
		}
		if(input.isKeyHeld(Input.KEYS.SPACE)&& input.isKeyHeld(Input.KEYS.ARROW_UP)){
			this.player2Ready = true;
			console.log("Player 2 ready");
		}
		
		if(this.player1Ready && this.player2Ready){
			console.log("Both players ready");
			stateMachine.change('play');
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
    }

	renderTitle(){
		context.font = '32px FutureMillennium';
		context.textAlign = 'center';
		context.fillStyle = '#afacacff';	
		context.fillText('PlatForm Shooters', CANVAS_WIDTH / 2, 100);
	}

	
}
