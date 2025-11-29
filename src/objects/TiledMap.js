import { context } from '../globals.js';

export default class TiledMap {
    constructor(mapData) {
        this.width = mapData.width;
        this.height = mapData.height;
        this.tileWidth = mapData.tilewidth;
        this.tileHeight = mapData.tileheight;
        this.layers = mapData.layers;
        this.tileImages = {};
        this.layerImages = {}; // For image layers
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

    /**
     * Load an image layer's image
     */
    async loadImageLayer(layer) {
        if (!layer.image) return;
        
        // Fix the path from Downloads to project folder
        let imagePath = layer.image;
        
        // If path contains Downloads, replace with correct project path
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
        
        console.log(`Loaded ${tileIds.size} unique tiles and ${imageLayerPromises.length} image layers`);
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
        
        // Tile the background across the entire canvas
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
}