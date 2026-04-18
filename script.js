// Word categories with keywords and related hints
const CATEGORIES = {
    animals: {
        name: 'Animals',
        words: [
            { keyword: 'Lion', hint: 'Mane' },
            { keyword: 'Penguin', hint: 'Tuxedo' },
            { keyword: 'Elephant', hint: 'Trunk' },
            { keyword: 'Butterfly', hint: 'Wings' },
            { keyword: 'Dolphin', hint: 'Intelligent' },
            { keyword: 'Tiger', hint: 'Stripes' },
        ]
    },
    fruits: {
        name: 'Fruits',
        words: [
            { keyword: 'Watermelon', hint: 'Seeds' },
            { keyword: 'Strawberry', hint: 'Red' },
            { keyword: 'Banana', hint: 'Yellow' },
            { keyword: 'Orange', hint: 'Citrus' },
            { keyword: 'Pineapple', hint: 'Spiky' },
            { keyword: 'Grape', hint: 'Bunch' },
        ]
    },
    professions: {
        name: 'Professions',
        words: [
            { keyword: 'Doctor', hint: 'Hospital' },
            { keyword: 'Firefighter', hint: 'Rescue' },
            { keyword: 'Teacher', hint: 'School' },
            { keyword: 'Chef', hint: 'Kitchen' },
            { keyword: 'Engineer', hint: 'Build' },
            { keyword: 'Artist', hint: 'Canvas' },
        ]
    },
    movies: {
        name: 'Movies',
        words: [
            { keyword: 'Avatar', hint: 'Pandora' },
            { keyword: 'Titanic', hint: 'Ship' },
            { keyword: 'Inception', hint: 'Dreams' },
            { keyword: 'Matrix', hint: 'Pills' },
            { keyword: 'Jaws', hint: 'Shark' },
            { keyword: 'Frozen', hint: 'Snow' },
        ]
    },
    sports: {
        name: 'Sports',
        words: [
            { keyword: 'Basketball', hint: 'Hoop' },
            { keyword: 'Tennis', hint: 'Racket' },
            { keyword: 'Swimming', hint: 'Water' },
            { keyword: 'Cycling', hint: 'Bike' },
            { keyword: 'Volleyball', hint: 'Net' },
            { keyword: 'Golf', hint: 'Clubs' },
        ]
    },
    countries: {
        name: 'Countries',
        words: [
            { keyword: 'Japan', hint: 'Sushi' },
            { keyword: 'Brazil', hint: 'Carnival' },
            { keyword: 'Egypt', hint: 'Pyramids' },
            { keyword: 'Canada', hint: 'Maple' },
            { keyword: 'Australia', hint: 'Kangaroo' },
            { keyword: 'Italy', hint: 'Pizza' },
        ]
    }
};

// Game state
let gameState = {
    screen: 'setup', // setup, categories, players-setup, word-reveal, conversation-menu, voting, results
    players: [],
    selectedCategory: null,
    currentWordPair: null,
    impostorIndex: null,
    currentPlayerIndex: 0,
    playersWhoSawWord: new Set(),
    selectedImpostorVote: null
};

// Initialize app
function init() {
    renderScreen();
}

function renderScreen() {
    const app = document.getElementById('app');
    
    switch(gameState.screen) {
        case 'setup':
            app.innerHTML = renderSetup();
            attachSetupListeners();
            break;
        case 'categories':
            app.innerHTML = renderCategories();
            attachCategoryListeners();
            break;
        case 'players-setup':
            app.innerHTML = renderPlayersSetup();
            attachPlayersSetupListeners();
            break;
        case 'word-reveal':
            app.innerHTML = renderWordReveal();
            attachWordRevealListeners();
            break;
        case 'conversation-menu':
            app.innerHTML = renderConversationMenu();
            attachConversationMenuListeners();
            break;
        case 'voting':
            app.innerHTML = renderVoting();
            attachVotingListeners();
            break;
        case 'results':
            app.innerHTML = renderResults();
            attachResultsListeners();
            break;
    }
}

function renderSetup() {
    return `
        <div class="container">
            <h1>🕵️ Impostor-X</h1>
            <p class="subtitle">The party game where deception meets fun!</p>
            <div class="form-group">
                <label for="playerCount">How many players?</label>
                <input type="number" id="playerCount" min="3" max="20" value="4" />
            </div>
            <button class="btn btn-primary" onclick="startGame()">Start Game</button>
        </div>
    `;
}

function renderCategories() {
    const categoryHtml = Object.entries(CATEGORIES).map(([key, category]) => `
        <button class="category-btn ${gameState.selectedCategory === key ? 'selected' : ''}" 
                onclick="selectCategory('${key}')">
            ${category.name}
        </button>
    `).join('');

    return `
        <div class="container">
            <h1>Select Category</h1>
            <p class="subtitle">Choose a category for the word</p>
            <div class="category-grid">
                ${categoryHtml}
            </div>
            <button class="btn btn-primary" 
                    ${!gameState.selectedCategory ? 'disabled' : ''} 
                    onclick="confirmCategory()">
                Next
            </button>
        </div>
    `;
}

function renderPlayersSetup() {
    const playersList = gameState.players.map((player, idx) => `
        <div class="player-item">
            <span class="player-name">${idx + 1}. ${player}</span>
            <button class="btn btn-danger btn-small" onclick="removePlayer(${idx})">Remove</button>
        </div>
    `).join('');

    return `
        <div class="container">
            <h1>Add Players</h1>
            <p class="subtitle">Enter player names</p>
            <div class="form-group">
                <label for="playerName">Player Name</label>
                <div class="player-input-group">
                    <input type="text" id="playerName" placeholder="Enter name" />
                    <button class="btn btn-primary" onclick="addPlayer()">Add</button>
                </div>
            </div>
            <div class="players-list">
                ${playersList}
            </div>
            <button class="btn btn-primary" 
                    ${gameState.players.length < 3 ? 'disabled' : ''} 
                    onclick="startRound()">
                Start Game (${gameState.players.length}/3+)
            </button>
        </div>
    `;
}

function renderWordReveal() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isImpostor = gameState.currentPlayerIndex === gameState.impostorIndex;
    const word = isImpostor ? gameState.currentWordPair.hint : gameState.currentWordPair.keyword;
    const wordLabel = isImpostor ? 'HINT' : 'WORD';

    return `
        <div class="container">
            <div class="screen-title">
                <h2>Player: <span class="current-player">${currentPlayer}</span></h2>
                <p>Hold down to reveal your word</p>
            </div>
            <div class="word-reveal" id="wordReveal">
                <span class="word-reveal-text" id="wordText">${word}</span>
                <span class="word-reveal-text visible" id="wordLabel">${wordLabel}</span>
            </div>
            <p style="color: #999;">Hold your finger on the screen to see your word</p>
        </div>
    `;
}

function renderConversationMenu() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    return `
        <div class="container">
            <h1>Ready?</h1>
            <div class="menu-option" onclick="nextPlayer()">
                <div>${currentPlayer}'s turn</div>
                <p style="font-size: 0.7em; color: #999; margin-top: 10px;">Tap to continue</p>
            </div>
            <button class="btn btn-secondary" onclick="endConversation()">
                End Discussion & Vote
            </button>
        </div>
    `;
}

function renderVoting() {
    const votingPlayers = gameState.players.map((player, idx) => `
        <button class="player-button ${gameState.selectedImpostorVote === idx ? 'selected' : ''}" 
                onclick="selectVote(${idx})">
            ${player}
        </button>
    `).join('');

    return `
        <div class="container">
            <h1>Who is the Impostor?</h1>
            <p class="subtitle">Vote for who you think is the impostor</p>
            <div class="voting-container">
                ${votingPlayers}
            </div>
            <button class="btn btn-primary" 
                    ${gameState.selectedImpostorVote === null ? 'disabled' : ''} 
                    onclick="revealResults()">
                Reveal
            </button>
        </div>
    `;
}

function renderResults() {
    const impostorName = gameState.players[gameState.impostorIndex];
    const keyword = gameState.currentWordPair.keyword;
    const hint = gameState.currentWordPair.hint;
    const wasCorrect = gameState.selectedImpostorVote === gameState.impostorIndex;

    return `
        <div class="container">
            <h1>${wasCorrect ? '🎉 Correct!' : '❌ Wrong!'}</h1>
            <div class="result-container">
                <div class="result-title">The Impostor:</div>
                <div class="result-item">
                    <strong>${impostorName}</strong>
                </div>
                <div class="result-title" style="margin-top: 20px;">The Word:</div>
                <div class="result-item">
                    <strong>${keyword}</strong>
                </div>
                <div class="result-title" style="margin-top: 20px;">Impostor's Hint:</div>
                <div class="result-item">
                    <strong>${hint}</strong>
                </div>
            </div>
            <button class="btn btn-primary" onclick="nextRound()">
                Next Round
            </button>
        </div>
    `;
}

// Event handlers
function attachSetupListeners() {
    const input = document.getElementById('playerCount');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startGame();
    });
}

function attachCategoryListeners() {
    // Already handled by onclick
}

function attachPlayersSetupListeners() {
    const input = document.getElementById('playerName');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });
}

function attachWordRevealListeners() {
    const wordReveal = document.getElementById('wordReveal');
    const wordText = document.getElementById('wordText');
    const wordLabel = document.getElementById('wordLabel');

    wordReveal.addEventListener('mousedown', () => {
        wordReveal.classList.add('pressed');
        wordText.classList.add('visible');
        wordLabel.classList.remove('visible');
    });

    wordReveal.addEventListener('mouseup', () => {
        wordReveal.classList.remove('pressed');
        wordText.classList.remove('visible');
        wordLabel.classList.add('visible');
    });

    wordReveal.addEventListener('mouseleave', () => {
        wordReveal.classList.remove('pressed');
        wordText.classList.remove('visible');
        wordLabel.classList.add('visible');
    });

    // Touch events for mobile
    wordReveal.addEventListener('touchstart', (e) => {
        e.preventDefault();
        wordReveal.classList.add('pressed');
        wordText.classList.add('visible');
        wordLabel.classList.remove('visible');
    });

    wordReveal.addEventListener('touchend', (e) => {
        e.preventDefault();
        wordReveal.classList.remove('pressed');
        wordText.classList.remove('visible');
        wordLabel.classList.add('visible');
    });

    // Auto advance after 3 seconds if no interaction
    setTimeout(() => {
        if (!gameState.playersWhoSawWord.has(gameState.currentPlayerIndex)) {
            nextPlayer();
        }
    }, 8000);
}

function attachConversationMenuListeners() {
    // Already handled by onclick
}

function attachVotingListeners() {
    // Already handled by onclick
}

function attachResultsListeners() {
    // Already handled by onclick
}

// Game flow functions
function startGame() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    if (playerCount < 3) {
        alert('Need at least 3 players');
        return;
    }
    
    if (gameState.players.length === 0) {
        // First time - initialize with empty names
        gameState.players = Array(playerCount).fill('').map((_, i) => `Player ${i + 1}`);
    }
    
    gameState.screen = 'players-setup';
    renderScreen();
}

function addPlayer() {
    const input = document.getElementById('playerName');
    const name = input.value.trim();
    
    if (!name) {
        alert('Please enter a player name');
        return;
    }
    
    gameState.players.push(name);
    input.value = '';
    renderScreen();
}

function removePlayer(idx) {
    gameState.players.splice(idx, 1);
    renderScreen();
}

function selectCategory(key) {
    gameState.selectedCategory = key;
    renderScreen();
}

function confirmCategory() {
    if (!gameState.selectedCategory) {
        alert('Please select a category');
        return;
    }
    
    gameState.screen = 'word-reveal';
    gameState.currentPlayerIndex = 0;
    gameState.playersWhoSawWord = new Set();
    gameState.impostorIndex = Math.floor(Math.random() * gameState.players.length);
    
    const categoryData = CATEGORIES[gameState.selectedCategory];
    gameState.currentWordPair = categoryData.words[
        Math.floor(Math.random() * categoryData.words.length)
    ];
    
    renderScreen();
}

function nextPlayer() {
    gameState.playersWhoSawWord.add(gameState.currentPlayerIndex);
    gameState.currentPlayerIndex++;
    
    if (gameState.currentPlayerIndex >= gameState.players.length) {
        gameState.screen = 'conversation-menu';
        gameState.currentPlayerIndex = 0;
    }
    
    renderScreen();
}

function startRound() {
    if (gameState.players.length < 3) {
        alert('Need at least 3 players');
        return;
    }
    gameState.screen = 'categories';
    renderScreen();
}

function endConversation() {
    gameState.screen = 'voting';
    gameState.selectedImpostorVote = null;
    renderScreen();
}

function selectVote(idx) {
    gameState.selectedImpostorVote = idx;
    renderScreen();
}

function revealResults() {
    if (gameState.selectedImpostorVote === null) {
        alert('Please select who you think is the impostor');
        return;
    }
    gameState.screen = 'results';
    renderScreen();
}

function nextRound() {
    gameState.screen = 'categories';
    gameState.selectedCategory = null;
    gameState.currentWordPair = null;
    gameState.impostorIndex = null;
    gameState.currentPlayerIndex = 0;
    gameState.playersWhoSawWord = new Set();
    gameState.selectedImpostorVote = null;
    renderScreen();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);