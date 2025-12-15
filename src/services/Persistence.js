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

    static saveScores(player1Score, player2Score) {
        localStorage.setItem('game-scores', JSON.stringify({
            player1Score,
            player2Score,
            timestamp: Date.now()
        }));
    }

    static loadScores() {
        const raw = localStorage.getItem('game-scores');
        return raw ? JSON.parse(raw) : { player1Score: 0, player2Score: 0 };
    }

    static clear() {
        localStorage.removeItem('game-state');
        localStorage.removeItem('game-scores');
    }
}
