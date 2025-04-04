// Game Configuration
const GAME_CONFIG = {
    balloonCount: 15,
    pointsPerPump: 5,
    // Define risk profiles separately
    riskProfiles: {
        high: { minCapacity: 3, maxCapacity: 6, label: 'High Risk' },
        medium: { minCapacity: 7, maxCapacity: 11, label: 'Medium Risk' },
        low: { minCapacity: 12, maxCapacity: 17, label: 'Low Risk' }
    },
    // Define available colors (ensure enough for 3 distinct ones)
    availableColors: [
        { name: 'Crimson', hex: '#DC143C' },
        { name: 'Azure', hex: '#007FFF' },
        { name: 'Emerald', hex: '#2ECC71' },
        { name: 'Gold', hex: '#FFD700' },
        { name: 'Violet', hex: '#8A2BE2' },
        { name: 'Orange', hex: '#FFA500' }
    ]
};

// Game State
const gameState = {
    currentScreen: 'welcome',
    currentBalloon: 1,
    totalScore: 0,
    currentPumps: 0,
    currentPoints: 0,
    currentBalloonColorName: null, // Store color name (e.g., 'Crimson')
    currentBalloonColorHex: null,  // Store hex code (e.g., '#DC143C')
    currentBalloonCapacity: 0,
    statistics: {
        overall: {
            totalPumps: 0,
            balloonsCashed: 0,
            balloonsPopped: 0
        }
        // Color-specific stats will be added dynamically
    },
    balloonSequence: [], // Sequence of color names
    colorRiskMapping: {}, // Maps color name to risk profile key ('high', 'medium', 'low')
    riskColorMapping: {}, // Maps risk profile key to color name
    currentColorSet: []   // Array of { name, hex } objects used in this game
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
    // Placeholders for dynamic color stats
    colorStat1: document.getElementById('color-stat-1'),
    colorStat2: document.getElementById('color-stat-2'),
    colorStat3: document.getElementById('color-stat-3'),
    riskAssessment: document.getElementById('risk-assessment'),
    // Add references for the instruction hints if needed (optional)
    // Hints can be updated dynamically based on the current mapping
};

// Event Listeners
elements.startButton.addEventListener('click', startGame);
elements.pumpButton.addEventListener('click', pumpBalloon);
elements.cashButton.addEventListener('click', cashOut);
elements.playAgainButton.addEventListener('click', resetGame);

// --- Helper Function ---
// Fisher-Yates (Knuth) Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

// Game Functions
function initializeGame() {
    // Set total balloons display
    elements.totalBalloonsDisplay.textContent = GAME_CONFIG.balloonCount;
    resetGameState(); // Reset state variables
    assignColorsToRisks(); // Assign random colors to risks for this game
    generateBalloonSequence(); // Generate sequence based on chosen colors
    // Optional: Update welcome screen hints dynamically if desired
    // updateWelcomeHints();
}

function resetGameState() {
    gameState.currentBalloon = 1;
    gameState.totalScore = 0;
    gameState.currentPumps = 0;
    gameState.currentPoints = 0;
    gameState.currentBalloonColorName = null;
    gameState.currentBalloonColorHex = null;
    gameState.currentBalloonCapacity = 0;
    gameState.balloonSequence = [];
    gameState.colorRiskMapping = {};
    gameState.riskColorMapping = {};
    gameState.currentColorSet = [];
    // Reset statistics object, keeping 'overall'
    gameState.statistics = {
        overall: {
            totalPumps: 0,
            balloonsCashed: 0,
            balloonsPopped: 0
        }
        // Color stats will be re-initialized in assignColorsToRisks
    };
    // Update display elements
    elements.totalScoreDisplay.textContent = '0';
    elements.currentPointsDisplay.textContent = '0';
    elements.currentBalloonDisplay.textContent = '1';
}

function assignColorsToRisks() {
    // 1. Shuffle available colors and select 3
    const shuffledColors = shuffleArray([...GAME_CONFIG.availableColors]);
    gameState.currentColorSet = shuffledColors.slice(0, 3);

    // 2. Get risk profile keys and shuffle them
    const riskKeys = Object.keys(GAME_CONFIG.riskProfiles);
    const shuffledRiskKeys = shuffleArray([...riskKeys]); // ['medium', 'high', 'low'] for example

    // 3. Create the mapping and initialize stats
    gameState.colorRiskMapping = {};
    gameState.riskColorMapping = {};
    gameState.currentColorSet.forEach((color, index) => {
        const assignedRisk = shuffledRiskKeys[index];
        gameState.colorRiskMapping[color.name] = assignedRisk; // e.g., { 'Crimson': 'medium' }
        gameState.riskColorMapping[assignedRisk] = color.name; // e.g., { 'medium': 'Crimson' }

        // Initialize statistics for this color
        gameState.statistics[color.name] = {
            totalPumps: 0,
            balloonCount: 0,
            balloonsCashed: 0,
            balloonsPopped: 0,
            riskProfile: assignedRisk // Store risk profile for easier access later
        };
    });

    console.log("Color-Risk Mapping for this game:", gameState.colorRiskMapping); // For debugging
}


function generateBalloonSequence() {
    gameState.balloonSequence = [];
    const chosenColorNames = gameState.currentColorSet.map(color => color.name);

    // Ensure a relatively balanced distribution (optional but good for fairness)
    const baseCount = Math.floor(GAME_CONFIG.balloonCount / chosenColorNames.length);
    const remainder = GAME_CONFIG.balloonCount % chosenColorNames.length;

    for (const colorName of chosenColorNames) {
        for (let i = 0; i < baseCount; i++) {
            gameState.balloonSequence.push(colorName);
        }
    }
    // Add remainder balloons randomly
    for (let i = 0; i < remainder; i++) {
        const randomColorIndex = Math.floor(Math.random() * chosenColorNames.length);
        gameState.balloonSequence.push(chosenColorNames[randomColorIndex]);
    }

    // Shuffle the final sequence
    gameState.balloonSequence = shuffleArray(gameState.balloonSequence);
     console.log("Balloon sequence:", gameState.balloonSequence); // For debugging
}


function startGame() {
    // Ensure randomization happens if starting fresh (e.g., direct load to game)
    if (gameState.currentColorSet.length === 0) {
        initializeGame(); // Should ideally be called before startGame
    }
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

    // Get balloon color name for this turn
    const balloonColorName = gameState.balloonSequence[gameState.currentBalloon - 1];
    gameState.currentBalloonColorName = balloonColorName;

    // Find the full color object (for hex)
    const colorObject = gameState.currentColorSet.find(c => c.name === balloonColorName);
    gameState.currentBalloonColorHex = colorObject.hex;

    // Look up the assigned risk profile
    const riskProfileKey = gameState.colorRiskMapping[balloonColorName]; // 'high', 'medium', or 'low'
    const riskProfile = GAME_CONFIG.riskProfiles[riskProfileKey];

    // Track balloon count by color
    gameState.statistics[balloonColorName].balloonCount++;

    // Set balloon capacity based on its assigned risk profile
    const capacityRange = riskProfile.maxCapacity - riskProfile.minCapacity + 1;
    gameState.currentBalloonCapacity = riskProfile.minCapacity + Math.floor(Math.random() * capacityRange);
    console.log(`Balloon ${gameState.currentBalloon}: ${balloonColorName} (${riskProfileKey} risk), Capacity: ${gameState.currentBalloonCapacity}`); // For debugging

    // Update balloon appearance
    elements.gameBalloon.className = 'balloon'; // Reset classes
    elements.gameBalloon.style.backgroundColor = gameState.currentBalloonColorHex; // Set color directly
    elements.gameBalloon.style.transform = 'scale(1)';
    elements.popEffect.classList.add('hidden');

    // Enable buttons
    elements.pumpButton.disabled = false;
    elements.cashButton.disabled = false;
}

function pumpBalloon() {
    gameState.currentPumps++;
    gameState.currentPoints += GAME_CONFIG.pointsPerPump;

    // Update statistics (overall and for the specific color name)
    gameState.statistics.overall.totalPumps++;
    gameState.statistics[gameState.currentBalloonColorName].totalPumps++;

    // Update display
    elements.currentPointsDisplay.textContent = gameState.currentPoints;

    // Increase balloon size (adjust multiplier if needed)
    const maxPossiblePumps = GAME_CONFIG.riskProfiles.low.maxCapacity; // Use lowest risk max capacity as a rough guide
    const growthFactor = Math.min(1 + (gameState.currentPumps * (1 / (maxPossiblePumps * 0.6))), 3); // Cap growth reasonably
    elements.gameBalloon.style.transform = `scale(${growthFactor})`;

    // Check if balloon pops
    if (gameState.currentPumps >= gameState.currentBalloonCapacity) {
        popBalloon();
    }
}

function popBalloon() {
    // Update statistics
    gameState.statistics.overall.balloonsPopped++;
    gameState.statistics[gameState.currentBalloonColorName].balloonsPopped++;

    // Update display
    elements.gameBalloon.style.transition = 'none'; // Prevent transition during pop visual
    elements.gameBalloon.style.transform = 'scale(0)'; // Or hide it
    elements.gameBalloon.classList.add('hidden'); // Hide the balloon element
    elements.popEffect.classList.remove('hidden');
    elements.popEffect.style.color = gameState.currentBalloonColorHex; // Match pop color

    // Disable buttons
    elements.pumpButton.disabled = true;
    elements.cashButton.disabled = true;

    // Move to next balloon after delay
    setTimeout(() => {
        elements.gameBalloon.style.transition = 'all 0.3s ease'; // Restore transition
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
    gameState.statistics[gameState.currentBalloonColorName].balloonsCashed++;

    // Move to next balloon immediately
    gameState.currentBalloon++;
    setupNextBalloon();
}

function endGame() {
    // Update final score
    elements.finalScoreDisplay.textContent = gameState.totalScore;

    // Calculate and display statistics
    calculateAndDisplayStatistics();

    // Generate risk assessment based on the dynamic mapping
    generateRiskAssessment();

    // Show results screen
    changeScreen('results');
}

function calculateAndDisplayStatistics() {
    // Overall statistics
    const totalBalloons = GAME_CONFIG.balloonCount;
    const overallCashed = gameState.statistics.overall.balloonsCashed;
    const overallSuccessRate = totalBalloons > 0 ? (overallCashed / totalBalloons) * 100 : 0;
    // Calculate average pumps only on balloons interacted with (cashed or popped)
    const overallInteracted = overallCashed + gameState.statistics.overall.balloonsPopped;
    const overallAvgPumps = overallInteracted > 0 ? gameState.statistics.overall.totalPumps / overallInteracted : 0;

    elements.overallSuccessRate.textContent = `${overallSuccessRate.toFixed(1)}%`;
    elements.overallAvgPumps.textContent = overallAvgPumps.toFixed(1);

    // Color-specific statistics using the dynamic color set
    const colorStatElements = [elements.colorStat1, elements.colorStat2, elements.colorStat3];
    gameState.currentColorSet.forEach((color, index) => {
        const statElement = colorStatElements[index];
        const colorStats = gameState.statistics[color.name];
        const colorTotalBalloons = colorStats.balloonCount;
        const riskProfileKey = gameState.colorRiskMapping[color.name];
        const riskProfileLabel = GAME_CONFIG.riskProfiles[riskProfileKey].label;

        // Find the elements within the stat block
        const labelElement = statElement.querySelector('.color-label');
        const successRateElement = statElement.querySelector('.color-success-rate');
        const avgPumpsElement = statElement.querySelector('.color-avg-pumps');

        if (colorTotalBalloons > 0) {
            const cashed = colorStats.balloonsCashed;
            const popped = colorStats.balloonsPopped;
            const interacted = cashed + popped;
            const successRate = (cashed / colorTotalBalloons) * 100;
            const avgPumps = interacted > 0 ? colorStats.totalPumps / interacted : 0;

            labelElement.textContent = `${color.name} Balloons (${riskProfileLabel})`;
            successRateElement.textContent = `${successRate.toFixed(1)}%`;
            avgPumpsElement.textContent = avgPumps.toFixed(1);
        } else {
            labelElement.textContent = `${color.name} Balloons (${riskProfileLabel})`;
            successRateElement.textContent = 'N/A';
            avgPumpsElement.textContent = 'N/A';
        }
        // Set background color dynamically
        statElement.style.backgroundColor = hexToRgba(color.hex, 0.9); // Use helper for transparency
    });
}

// Helper to convert hex to rgba for background transparency
function hexToRgba(hex, alpha = 1) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function generateRiskAssessment() {
    let assessment = '';
    const stats = gameState.statistics;
    const overallSuccessRate = stats.overall.balloonsCashed / GAME_CONFIG.balloonCount * 100;

    // Identify colors for each risk level in *this* game
    const highRiskColor = gameState.riskColorMapping['high'];
    const mediumRiskColor = gameState.riskColorMapping['medium'];
    const lowRiskColor = gameState.riskColorMapping['low'];

    // Get stats for each risk level using the mapped color names
    const highRiskStats = stats[highRiskColor];
    const mediumRiskStats = stats[mediumRiskColor];
    const lowRiskStats = stats[lowRiskColor];

    // Helper function to calculate average pumps for a given stats object
    const calculateAvgPumps = (colorStats) => {
        if (!colorStats) return 0; // Handle case where a color might not have appeared (unlikely with current generation)
        const interacted = colorStats.balloonsCashed + colorStats.balloonsPopped;
        return interacted > 0 ? colorStats.totalPumps / interacted : 0;
    };

    // Helper function to calculate success rate for a given stats object
    const calculateSuccessRate = (colorStats) => {
         if (!colorStats || colorStats.balloonCount === 0) return 0;
         return (colorStats.balloonsCashed / colorStats.balloonCount) * 100;
    }

    const avgPumpsHigh = calculateAvgPumps(highRiskStats);
    const avgPumpsMedium = calculateAvgPumps(mediumRiskStats);
    const avgPumpsLow = calculateAvgPumps(lowRiskStats);

    const successRateHigh = calculateSuccessRate(highRiskStats);
    const successRateMedium = calculateSuccessRate(mediumRiskStats);
    const successRateLow = calculateSuccessRate(lowRiskStats);

    // --- Risk Adaptation Logic ---
    // Did the player pump significantly less on high-risk than low-risk?
    // Using a threshold difference rather than strict less-than accounts for random variance
    const cautiousWithHigh = (avgPumpsHigh < avgPumpsMedium || highRiskStats.balloonCount === 0) && (avgPumpsHigh < avgPumpsLow || highRiskStats.balloonCount === 0) && successRateHigh > 50; // High success suggests caution worked
    // Did the player pump significantly more on low-risk than high-risk?
    const aggressiveWithLow = (avgPumpsLow > avgPumpsMedium || lowRiskStats.balloonCount === 0) && (avgPumpsLow > avgPumpsHigh || lowRiskStats.balloonCount === 0) && successRateLow > 40; // Lower success acceptable if pushing limits
    // Did the medium risk fall in between?
    const adaptedMedium = (avgPumpsMedium >= avgPumpsHigh || mediumRiskStats.balloonCount === 0) && (avgPumpsMedium <= avgPumpsLow || mediumRiskStats.balloonCount === 0);

    console.log(`Risk Assessment Data: High(${highRiskColor}): AvgP=${avgPumpsHigh.toFixed(1)}, SR=${successRateHigh.toFixed(1)}% | Med(${mediumRiskColor}): AvgP=${avgPumpsMedium.toFixed(1)}, SR=${successRateMedium.toFixed(1)}% | Low(${lowRiskColor}): AvgP=${avgPumpsLow.toFixed(1)}, SR=${successRateLow.toFixed(1)}%`);
    console.log(`Checks: CautiousHigh=${cautiousWithHigh}, AggressiveLow=${aggressiveWithLow}, AdaptedMedium=${adaptedMedium}`);

    // Generate assessment text based on adaptation
    if (cautiousWithHigh && aggressiveWithLow && adaptedMedium && (mediumRiskStats?.balloonCount > 0)) { // Added check for medium existing
        assessment = `Excellent risk adaptation! You successfully identified that ${highRiskColor} balloons were high-risk (avg ${avgPumpsHigh.toFixed(1)} pumps), ${lowRiskColor} were low-risk (avg ${avgPumpsLow.toFixed(1)} pumps), and adjusted your strategy effectively.`;
    } else if ((cautiousWithHigh && aggressiveWithLow) || (cautiousWithHigh && adaptedMedium && (mediumRiskStats?.balloonCount > 0)) || (aggressiveWithLow && adaptedMedium && (mediumRiskStats?.balloonCount > 0)) ) {
         assessment = `Good risk adaptation! You showed clear awareness of different risk levels (e.g., cautious with ${highRiskColor}, bolder with ${lowRiskColor}). Refining your approach for the medium-risk ${mediumRiskColor} balloons could improve your score further.`;
    } else if (cautiousWithHigh || aggressiveWithLow) {
        assessment = `Partial risk adaptation. You seem to have identified either the high-risk ${highRiskColor} balloons or the low-risk ${lowRiskColor} balloons, but didn't consistently adjust your strategy across all discovered risk levels.`;
    } else if (overallSuccessRate > 60) {
        assessment = `You achieved a respectable score! However, your pumping strategy (avg ${avgPumpsHigh.toFixed(1)}/${avgPumpsMedium.toFixed(1)}/${avgPumpsLow.toFixed(1)} pumps for ${highRiskColor}/${mediumRiskColor}/${lowRiskColor}) didn't strongly vary based on the hidden risk levels. Experimenting more might reveal the patterns!`;
    } else {
        assessment = `It seems you used a similar approach for most balloons. The key to maximizing your score is figuring out which color is safe to pump many times (${lowRiskColor} this game) and which is risky (${highRiskColor} this game). Keep trying to spot the pattern!`;
    }

    elements.riskAssessment.textContent = assessment;
}


function resetGame() {
    // Reset state, re-randomize colors/risks, generate new sequence
    initializeGame();
    // Start the game flow
    startGame();
}

function changeScreen(screenName) {
    gameState.currentScreen = screenName;
    // Hide all screens
    for (const screenKey in screens) {
        screens[screenKey].classList.add('hidden');
    }
    // Show current screen
    screens[screenName].classList.remove('hidden');
}

// Initialize the game setup when the script loads
initializeGame();