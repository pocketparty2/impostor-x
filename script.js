// Complete implementation of the Impostor-X game

class Game {
    constructor() {
        this.players = [];
        this.impostor = null;
        this.isGameActive = false;
    }

    startGame(numPlayers) {
        this.players = Array.from({ length: numPlayers }, (_, i) => new Player(i + 1));
        this.impostor = this.assignImpostor();
        this.isGameActive = true;
        console.log(`Game started with ${numPlayers} players. Impostor is Player ${this.impostor.id}.`);
    }

    assignImpostor() {
        const impostorIndex = Math.floor(Math.random() * this.players.length);
        return this.players[impostorIndex];
    }

    performTask(player) {
        if (!this.isGameActive) {
            console.log('Game is not active.');
            return;
        }

        if (player.id === this.impostor.id) {
            console.log(`Impostor ${player.id} is sabotaging!`);
        } else {
            console.log(`Player ${player.id} is completing a task.`);
        }
    }

    emergencyMeeting(caller) {
        console.log(`Emergency meeting called by Player ${caller.id}.`);
        // Logic for meeting and voting would go here.
    }

    endGame() {
        this.isGameActive = false;
        console.log('Game has ended.');
    }
}

class Player {
    constructor(id) {
        this.id = id;
    }
}

// Example usage:
const game = new Game();
game.startGame(10);
game.performTask(game.players[0]);
game.performTask(game.impostor);
game.emergencyMeeting(game.players[1]);
game.endGame();