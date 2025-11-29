export default class SoundPool {
	constructor(source, size = 1, volume, loop = false, playbackRate = 1.0) {
		this.source = source;
		this.size = size;
		this.volume = volume;
		this.loop = loop;
		this.playbackRate = playbackRate;
		this.pool = [];
		this.currentSound = 0;

		this.initializePool();
	}

	initializePool() {
		for (let i = 0; i < this.size; i++) {
			const audio = new Audio(this.source);

			audio.volume = this.volume;
			audio.loop = this.loop;
			audio.playbackRate = this.playbackRate; // Add this line

			this.pool.push(audio);
		}
	}

	play() {
		if (this.pool[this.currentSound].currentTime === 0
			|| this.pool[this.currentSound].ended
			|| this.pool[this.currentSound].paused) {
			this.pool[this.currentSound].play();
		}

		this.currentSound = (this.currentSound + 1) % this.size;
	}

	pause() {
		this.pool[this.currentSound].pause();
	}

	isPaused() {
		return this.pool[this.currentSound].paused;
	}

	stop() {
		this.pause();
		this.pool[this.currentSound].currentTime = 0;
	}
}