import { context, CANVAS_WIDTH } from '../globals.js';

export default function renderScore(blueScore, redScore) {
    context.textAlign = 'center';
    context.font = '48px FutureMillennium';
    context.lineWidth = 6;

    // Blue
    context.fillStyle = '#2d6bff';
    context.strokeStyle = 'black';
    context.strokeText(blueScore, CANVAS_WIDTH / 2 - 120, 60);
    context.fillText(blueScore, CANVAS_WIDTH / 2 - 120, 60);

    // TO
    context.fillStyle = 'white';
    context.strokeText('TO', CANVAS_WIDTH / 2, 60);
    context.fillText('TO', CANVAS_WIDTH / 2, 60);

    // Red
    context.fillStyle = '#ff2d2d';
    context.strokeText(redScore, CANVAS_WIDTH / 2 + 120, 60);
    context.fillText(redScore, CANVAS_WIDTH / 2 + 120, 60);
}
