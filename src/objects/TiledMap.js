import { context, matter, world } from '../globals.js';

const { Bodies, World } = matter;

export default class TiledMap {
    constructor(mapData) {
        this.width = mapData.width;
        this.height = mapData.height;
        this.tileWidth = mapData.tilewidth;
        this.tileHeight = mapData.tileheight;
        this.layers = mapData.layers;
        this.tileImages = {};
        this.layerImages = {};
        this.collisionBodies = []; // Store platform collision bodies
    }

    async loadTileImage(tileId) {
        if (this.tileImages[tileId]) {
            return;
        }

        const imagePath = this.getTileImagePath(tileId);
        
        if (imagePath) {
            const img = new Image();
            img.src = imagePath;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => {
                    console.warn(`Failed to load tile ${tileId} from ${imagePath}`);
                    resolve();
                };
            });
            this.tileImages[tileId] = img;
        }
    }

    async loadImageLayer(layer) {
        if (!layer.image) return;
        
        let imagePath = layer.image;
        
        if (imagePath.includes('Downloads')) {
            imagePath = './assets/images/industrialimages/tiles/2 Background/Background.png';
        }
        
        const img = new Image();
        img.src = imagePath;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = () => {
                console.warn(`Failed to load image layer from ${imagePath}`);
                resolve();
            };
        });
        this.layerImages[layer.id] = img;
    }

    getTileImagePath(tileId) {
        if (tileId === 0) return null;
        
        if (tileId >= 1 && tileId <= 81) {
            const tileNumber = String(tileId).padStart(2, '0');
            return `./assets/images/industrialimages/tiles/1 Tiles/IndustrialTile_${tileNumber}.png`;
        }
        
        if (tileId === 88) {
            return './assets/images/industrialimages/tiles/3 Objects/Locker3.png';
        }
        if (tileId === 96) {
            return './assets/images/industrialimages/tiles/3 Objects/Fire-extinguisher2.png';
        }
        if (tileId === 99) {
            return './assets/images/industrialimages/tiles/3 Objects/Fence2.png';
        }
        if (tileId === 100) {
            return './assets/images/industrialimages/tiles/3 Objects/Fence1.png';
        }
        if (tileId === 101) {
            return './assets/images/industrialimages/tiles/3 Objects/Bucket.png';
        }
        if (tileId === 102) {
            return './assets/images/industrialimages/tiles/3 Objects/Box8.png';
        }
        if (tileId === 117) {
            return './assets/images/industrialimages/tiles/3 Objects/Barrel1.png';
        }
        
        console.warn(`No image path mapped for tile ID ${tileId}`);
        return null;
    }

    async preloadTiles() {
        const tileIds = new Set();
        const imageLayerPromises = [];
        
        for (const layer of this.layers) {
            if (layer.type === 'tilelayer' && layer.data) {
                for (const tileId of layer.data) {
                    if (tileId > 0) {
                        tileIds.add(tileId);
                    }
                }
            } else if (layer.type === 'imagelayer') {
                imageLayerPromises.push(this.loadImageLayer(layer));
            }
        }
        
        const tilePromises = Array.from(tileIds).map(id => this.loadTileImage(id));
        await Promise.all([...tilePromises, ...imageLayerPromises]);
        
        // Create collision bodies for the "physical" layer
        this.createCollisionBodies();
        
        console.log(`Loaded ${tileIds.size} unique tiles and ${imageLayerPromises.length} image layers`);
    }

    /**
     * Create static Matter.js bodies for platform tiles
     */
    createCollisionBodies() {
        for (const layer of this.layers) {
            // Only create collision for the "physical" layer
            if (layer.type === 'tilelayer' && layer.name === 'physical' && layer.data) {
                const data = layer.data;
                
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const index = y * this.width + x;
                        const tileId = data[index];
                        
                        // If there's a tile here, create a collision body
                        if (tileId > 0) {
                            const body = Bodies.rectangle(
                                x * this.tileWidth + this.tileWidth / 2,
                                y * this.tileHeight + this.tileHeight / 2,
                                this.tileWidth,
                                this.tileHeight,
                                {
                                    isStatic: true, // Platforms don't move
                                    label: 'platform'
                                }
                            );
                            
                            World.add(world, body);
                            this.collisionBodies.push(body);
                        }
                    }
                }
                
                console.log(`Created ${this.collisionBodies.length} platform collision bodies`);
            }
        }
    }

    render() {
        for (const layer of this.layers) {
            if (!layer.visible) continue;
            
            if (layer.type === 'tilelayer') {
                this.renderTileLayer(layer);
            } else if (layer.type === 'imagelayer') {
                this.renderImageLayer(layer);
            }
        }
    }

    renderImageLayer(layer) {
        const img = this.layerImages[layer.id];
        if (!img) return;
        
        const canvasWidth = this.width * this.tileWidth;
        const canvasHeight = this.height * this.tileHeight;
        
        for (let x = 0; x < canvasWidth; x += img.width) {
            for (let y = 0; y < canvasHeight; y += img.height) {
                context.drawImage(img, x, y);
            }
        }
    }

    renderTileLayer(layer) {
        const data = layer.data;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const index = y * this.width + x;
                const tileId = data[index];
                
                if (tileId === 0) continue;
                
                const tileImage = this.tileImages[tileId];
                if (tileImage) {
                    context.drawImage(
                        tileImage,
                        x * this.tileWidth,
                        y * this.tileHeight,
                        this.tileWidth,
                        this.tileHeight
                    );
                }
            }
        }
    }

    /**
     * Clean up - remove collision bodies from world
     */
    destroy() {
        this.collisionBodies.forEach(body => {
            World.remove(world, body);
        });
        this.collisionBodies = [];
    }
}