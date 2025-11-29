import State from '../../lib/State.js';
import TiledMap from '../objects/TiledMap.js';
import SoundName from '../enums/SoundName.js';
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, sounds } from '../globals.js';

export default class PlayState extends State {
    constructor() {
        super();
        this.map = null;
    }

    async enter() {
    // Load the map JSON
    const mapData = await fetch('./assets/maps/map.json')
        .then(response => response.json());
    
    this.map = new TiledMap(mapData);
    
    // Preload all tile images
    await this.map.preloadTiles();
    
    console.log('Map loaded and ready!');
    
    // Debug: Check if sound loaded
    console.log('Available sounds:', sounds.sounds);
    console.log('Looking for:', SoundName.BackgroundMusic);
    
    // Play background music on loop
    sounds.play(SoundName.BackgroundMusic);
}

    update(dt) {
        // Game logic will go here later
    }

    render() {
        // Clear with sky blue background
        context.fillStyle = '#87CEEB';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Render the map
        if (this.map) {
            this.map.render();
        }
    }
}