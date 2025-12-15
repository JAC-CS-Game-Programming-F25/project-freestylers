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

    static saveGameInfo(info = {}) {
        const existing = Persistence.loadGameInfo() || {};
        const merged = { ...existing, ...info, timestamp: Date.now() };
        localStorage.setItem('game-info', JSON.stringify(merged));
    }

    static resetScore() {
        this.saveGameInfo({
            player1Score: 0,
            player2Score: 0
        });
    }

    static loadGameInfo() {
        const raw = localStorage.getItem('game-info');
        return raw ? JSON.parse(raw) : {};
    }

    static clear() {
        localStorage.removeItem('game-state');
        localStorage.removeItem('game-info');
    }
}
