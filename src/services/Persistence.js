export default class Persistence {
    static saveCurrentState(stateName, payload = {}) {
        localStorage.setItem('game-state', JSON.stringify({
            state: stateName,
            payload,
            timestamp: Date.now()
        }));
    }

    static loadCurrentState() {
        const raw = localStorage.getItem('game-state');
        return raw ? JSON.parse(raw) : null;
    }
}
