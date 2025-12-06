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
        this.collisionBodies = [];
    }

    async loadTileImage(tileId) {
        if (this.tileImages[tileId]) return;

        const imagePath = this.getTileImagePath(tileId);

        if (imagePath) {
            const img = new Image();
            img.src = imagePath;

            await new Promise(resolve => {
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

        // Fix absolute path from Tiled
        if (imagePath.includes('Downloads') || imagePath.includes('Background')) {
            imagePath = './assets/images/IndustrialImages/tiles/Background/Background.png';
        }

        const img = new Image();
        img.src = imagePath;

        await new Promise(resolve => {
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

        // Industrial tiles (1–81)
        if (tileId >= 1 && tileId <= 81) {
            const tileNumber = String(tileId).padStart(2, '0');
            return `./assets/images/IndustrialImages/tiles/Tiles/IndustrialTile_${tileNumber}.png`;
        }

        // Object tiles
        const objectMap = {
            88: 'Locker3.png',
            96: 'Fire-extinguisher2.png',
            99: 'Fence2.png',
            100: 'Fence1.png',
            101: 'Bucket.png',
            102: 'Box8.png',
            117: 'Barrel1.png'
        };

        if (objectMap[tileId]) {
            return `./assets/images/IndustrialImages/tiles/Objects/${objectMap[tileId]}`;
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
                    if (tileId > 0) tileIds.add(tileId);
                }
            } else if (layer.type === 'imagelayer') {
                imageLayerPromises.push(this.loadImageLayer(layer));
            }
        }

        const tilePromises = [...tileIds].map(id => this.loadTileImage(id));
        await Promise.all([...tilePromises, ...imageLayerPromises]);

        this.createCollisionBodies();

        console.log(`Loaded ${tileIds.size} tiles and ${imageLayerPromises.length} image layers`);
    }

    createCollisionBodies() {
        for (const layer of this.layers) {
            if (layer.type === 'tilelayer' && layer.name === 'physical') {

                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const tileId = layer.data[y * this.width + x];
                        if (tileId > 0) {
                            const body = Bodies.rectangle(
                                x * this.tileWidth + this.tileWidth / 2,
                                y * this.tileHeight + this.tileHeight / 2,
                                this.tileWidth,
                                this.tileHeight,
                                { isStatic: true, label: 'platform' }
                            );

                            World.add(world, body);
                            this.collisionBodies.push(body);
                        }
                    }
                }

                console.log(`Created ${this.collisionBodies.length} collision bodies`);
            }
        }
    }

    render() {
        for (const layer of this.layers) {
            if (!layer.visible) continue;

            if (layer.type === 'tilelayer') this.renderTileLayer(layer);
            else if (layer.type === 'imagelayer') this.renderImageLayer(layer);
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
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tileId = layer.data[y * this.width + x];
                if (tileId === 0) continue;

                const tileImage = this.tileImages[tileId];
                if (tileImage) {
                    context.drawImage(tileImage,
                        x * this.tileWidth,
                        y * this.tileHeight,
                        this.tileWidth,
                        this.tileHeight
                    );
                }
            }
        }
    }

    destroy() {
        this.collisionBodies.forEach(body => World.remove(world, body));
        this.collisionBodies = [];
    }
}
