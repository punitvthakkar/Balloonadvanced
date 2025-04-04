// Game Configuration
const GAME_CONFIG = {
    balloonCount: 15,
    pointsPerPump: 5,
    balloonTypes: {
        red: {
            color: 'red',
            minCapacity: 3,
            maxCapacity: 6,
            label: 'High Risk'
        },
        blue: {
            color: 'blue',
            minCapacity: 7,
            maxCapacity: 11,
            label: 'Medium Risk'
        },
        green: {
            color: 'green',
            minCapacity: 12,
            maxCapacity: 17,
            label: 'Low Risk'
        }
    }
};

// Game State
const gameState = {
    currentScreen: 'welcome',
    currentBalloon: 1,
    totalScore: 0,
    currentPumps: 0,
    currentPoints: 0,
    currentBalloonColor: null,
    currentBalloonCapacity: 0,
    statistics: {
        overall: {
            totalPumps: 0,
            balloonsCashed: 0,
            balloonsPopped: 0
        },
        red: {
            totalPumps: 0,
            balloonCount: 0,
            balloonsCashed: 0,
            balloonsPopped: 0
        },
        blue: {
            totalPumps: 0,
            balloonCount: 0,
            balloonsCashed: 0,
            balloonsPopped: 0
        },
        green: {
            totalPumps: 0,
            balloonCount: 0,
            balloonsCashed: 0,
            balloonsPopped: 0
        }
    },
    balloonSequence: []
};

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen')
};

const elements = {
    startButton: document.getElementById('start-button'),
    pumpButton: document.getElementById('pump-button'),
    cashButton: document.getElementById('cash-button'),
    playAgainButton: document.getElementById('play-again-button'),
    gameBalloon: document.getElementById('game-balloon'),
    popEffect: document.getElementById('pop-effect'),
    currentBalloonDisplay: document.getElementById('current-balloon'),
    totalBalloonsDisplay: document.getElementById('total-balloons'),
    totalScoreDisplay: document.getElementById('total-score'),
    currentPointsDisplay: document.getElementById('current-points'),
    finalScoreDisplay: document.getElementById('final-score'),
    overallSuccessRate: document.getElementById('overall-success-rate'),
    overallAvgPumps: document.getElementById('overall-avg-pumps'),
    redSuccessRate: document.getElementById('red-success-rate'),
    redAvgPumps: document.getElementById('red-avg-pumps'),
    blueSuccessRate: document.getElementById('blue-success-rate'),
    blueAvgPumps: document.getElementById('blue-avg-pumps'),
    greenSuccessRate: document.getElementById('green-success-rate'),
    greenAvgPumps: document.getElementById('green-avg-pumps'),
    riskAssessment: document.getElementById('risk-assessment')
};

// Event Listeners
elements.startButton.addEventListener('click', startGame);
elements.pumpButton.addEventListener('click', pumpBalloon);
elements.cashButton.addEventListener('click', cashOut);
elements.playAgainButton.addEventListener('click', resetGame);

// Initialize the game
initializeGame();

// Game Functions
function initializeGame() {
    // Set total balloons display
    elements.totalBalloonsDisplay.textContent = GAME_CONFIG.balloonCount;
    
    // Generate a random sequence of balloons
    generateBalloonSequence();
}

function generateBalloonSequence() {
    gameState.balloonSequence = [];
    const balloonTypes = Object.keys(GAME_CONFIG.balloonTypes);
    
    for (let i = 0; i < GAME_CONFIG.balloonCount; i++) {
        const randomType = balloonTypes[Math.floor(Math.random() * balloonTypes.length)];
        gameState.balloonSequence.push(randomType);
    }
}

function startGame() {
    changeScreen('game');
    setupNextBalloon();
}

function setupNextBalloon() {
    if (gameState.currentBalloon > GAME_CONFIG.balloonCount) {
        endGame();
        return;
    }

    // Reset current balloon state
    gameState.currentPumps = 0;
    gameState.currentPoints = 0;
    elements.currentPointsDisplay.textContent = '0';
    elements.currentBalloonDisplay.textContent = gameState.currentBalloon;
    
    // Set balloon color
    const balloonColor = gameState.balloonSequence[gameState.currentBalloon - 1];
    gameState.currentBalloonColor = balloonColor;
    
    // Track balloon count by color
    gameState.statistics[balloonColor].balloonCount++;
    
    // Set balloon capacity
    const balloonType = GAME_CONFIG.balloonTypes[balloonColor];
    const capacityRange = balloonType.maxCapacity - balloonType.minCapacity + 1;
    gameState.currentBalloonCapacity = balloonType.minCapacity + Math.floor(Math.random() * capacityRange);
    
    // Update balloon appearance
    elements.gameBalloon.className = 'balloon';
    elements.gameBalloon.classList.add(balloonColor);
    elements.gameBalloon.style.transform = 'scale(1)';
    elements.popEffect.classList.add('hidden');
    
    // Enable buttons
    elements.pumpButton.disabled = false;
    elements.cashButton.disabled = false;
}

function pumpBalloon() {
    gameState.currentPumps++;
    gameState.currentPoints += GAME_CONFIG.pointsPerPump;
    
    // Update statistics
    gameState.statistics.overall.totalPumps++;
    gameState.statistics[gameState.currentBalloonColor].totalPumps++;
    
    // Update display
    elements.currentPointsDisplay.textContent = gameState.currentPoints;
    
    // Increase balloon size
    const newSize = 1 + (gameState.currentPumps * 0.2);
    elements.gameBalloon.style.transform = `scale(${newSize})`;
    
    // Check if balloon pops
    if (gameState.currentPumps >= gameState.currentBalloonCapacity) {
        popBalloon();
    }
}

function popBalloon() {
    // Update statistics
    gameState.statistics.overall.balloonsPopped++;
    gameState.statistics[gameState.currentBalloonColor].balloonsPopped++;
    
    // Update display
    elements.gameBalloon.classList.add('hidden');
    elements.popEffect.classList.remove('hidden');
    
    // Disable buttons
    elements.pumpButton.disabled = true;
    elements.cashButton.disabled = true;
    
    // Move to next balloon after delay
    setTimeout(() => {
        gameState.currentBalloon++;
        setupNextBalloon();
    }, 1500);
}

function cashOut() {
    // Update score
    gameState.totalScore += gameState.currentPoints;
    elements.totalScoreDisplay.textContent = gameState.totalScore;
    
    // Update statistics
    gameState.statistics.overall.balloonsCashed++;
    gameState.statistics[gameState.currentBalloonColor].balloonsCashed++;
    
    // Move to next balloon
    gameState.currentBalloon++;
    setupNextBalloon();
}

function endGame() {
    // Update final score
    elements.finalScoreDisplay.textContent = gameState.totalScore;
    
    // Calculate and display statistics
    calculateAndDisplayStatistics();
    
    // Generate risk assessment
    generateRiskAssessment();
    
    // Show results screen
    changeScreen('results');
}

function calculateAndDisplayStatistics() {
    // Overall statistics
    const totalBalloons = GAME_CONFIG.balloonCount;
    const overallSuccessRate = (gameState.statistics.overall.balloonsCashed / totalBalloons) * 100;
    const overallAvgPumps = gameState.statistics.overall.totalPumps / totalBalloons;
    
    elements.overallSuccessRate.textContent = `${overallSuccessRate.toFixed(1)}%`;
    elements.overallAvgPumps.textContent = overallAvgPumps.toFixed(1);
    
    // Color-specific statistics
    for (const color of ['red', 'blue', 'green']) {
        const colorStats = gameState.statistics[color];
        const colorTotalBalloons = colorStats.balloonCount;
        
        if (colorTotalBalloons > 0) {
            const successRate = (colorStats.balloonsCashed / colorTotalBalloons) * 100;
            const avgPumps = colorStats.totalPumps / colorTotalBalloons;
            
            document.getElementById(`${color}-success-rate`).textContent = `${successRate.toFixed(1)}%`;
            document.getElementById(`${color}-avg-pumps`).textContent = avgPumps.toFixed(1);
        } else {
            document.getElementById(`${color}-success-rate`).textContent = 'N/A';
            document.getElementById(`${color}-avg-pumps`).textContent = 'N/A';
        }
    }
}

function generateRiskAssessment() {
    let assessment = '';
    
    // Calculate risk adaptation scores
    const redStats = gameState.statistics.red;
    const blueStats = gameState.statistics.blue;
    const greenStats = gameState.statistics.green;
    
    // Calculate average pumps per color as percentage of their ideal max (for comparison)
    const redAvgPumpsPercentage = redStats.balloonCount === 0 ? 0 : 
        (redStats.totalPumps / redStats.balloonCount) / ((GAME_CONFIG.balloonTypes.red.minCapacity + GAME_CONFIG.balloonTypes.red.maxCapacity) / 2);
    
    const blueAvgPumpsPercentage = blueStats.balloonCount === 0 ? 0 : 
        (blueStats.totalPumps / blueStats.balloonCount) / ((GAME_CONFIG.balloonTypes.blue.minCapacity + GAME_CONFIG.balloonTypes.blue.maxCapacity) / 2);
    
    const greenAvgPumpsPercentage = greenStats.balloonCount === 0 ? 0 : 
        (greenStats.totalPumps / greenStats.balloonCount) / ((GAME_CONFIG.balloonTypes.green.minCapacity + GAME_CONFIG.balloonTypes.green.maxCapacity) / 2);
    
    // Calculate success rates for each color
    const redSuccessRate = redStats.balloonCount === 0 ? 0 : (redStats.balloonsCashed / redStats.balloonCount) * 100;
    const blueSuccessRate = blueStats.balloonCount === 0 ? 0 : (blueStats.balloonsCashed / blueStats.balloonCount) * 100;
    const greenSuccessRate = greenStats.balloonCount === 0 ? 0 : (greenStats.balloonsCashed / greenStats.balloonCount) * 100;
    
    // Check if player adapted strategy to balloon colors
    const adaptedToRed = redAvgPumpsPercentage < blueAvgPumpsPercentage && redSuccessRate > 60;
    const adaptedToBlue = blueAvgPumpsPercentage > redAvgPumpsPercentage && blueAvgPumpsPercentage < greenAvgPumpsPercentage;
    const adaptedToGreen = greenAvgPumpsPercentage > blueAvgPumpsPercentage && greenSuccessRate > 40;
    
    const overallSuccessRate = (gameState.statistics.overall.balloonsCashed / GAME_CONFIG.balloonCount) * 100;
    
    // Generate assessment based on player's performance
    if (adaptedToRed && adaptedToBlue && adaptedToGreen) {
        assessment = "Excellent risk adaptation! You clearly recognized the different risk profiles of each balloon color and adjusted your strategy accordingly. You were cautious with high-risk balloons and more aggressive with low-risk ones.";
    } else if ((adaptedToRed && adaptedToBlue) || (adaptedToBlue && adaptedToGreen) || (adaptedToRed && adaptedToGreen)) {
        assessment = "Good risk adaptation! You showed awareness of the different balloon colors and adjusted your strategy for some of them. With more practice, you could further optimize your approach for each risk level.";
    } else if (adaptedToRed || adaptedToBlue || adaptedToGreen) {
        assessment = "Partial risk adaptation. You showed some awareness of the different balloon colors but didn't fully adjust your strategy across all risk levels. Pay attention to how each color responds differently.";
    } else if (overallSuccessRate > 60) {
        assessment = "You achieved a good overall score, but didn't significantly adapt your strategy to the different balloon colors. Try varying your approach based on the risk level indicated by the color.";
    } else {
        assessment = "You took a consistent approach regardless of balloon color. For better results, try being more cautious with red balloons (high risk) and more aggressive with green balloons (low risk).";
    }
    
    elements.riskAssessment.textContent = assessment;
}

function resetGame() {
    // Reset game state
    gameState.currentBalloon = 1;
    gameState.totalScore = 0;
    gameState.currentPumps = 0;
    gameState.currentPoints = 0;
    
    // Reset statistics
    for (const category of ['overall', 'red', 'blue', 'green']) {
        gameState.statistics[category] = {
            totalPumps: 0,
            balloonCount: 0,
            balloonsCashed: 0,
            balloonsPopped: 0
        };
    }
    
    // Generate new balloon sequence
    generateBalloonSequence();
    
    // Update display
    elements.totalScoreDisplay.textContent = '0';
    
    // Start game
    startGame();
}

function changeScreen(screenName) {
    gameState.currentScreen = screenName;
    
    // Hide all screens
    for (const screen in screens) {
        screens[screen].classList.add('hidden');
    }
    
    // Show current screen
    screens[screenName].classList.remove('hidden');
}
