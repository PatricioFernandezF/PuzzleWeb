// Constants for game settings
const GAME_CONTAINER_ID = 'game-container';
const INTRO_SCREEN_ID = 'intro-screen';
const RESET_BUTTON_ID = 'reset-btn';
const DIFFICULTY_BUTTON_CLASS = 'difficulty-btn';
const PUZZLE_AREA_ID = 'puzzle-area';
const DEFAULT_IMAGE_URL = 'image.jpg';

// Game state variables
let currentDifficulty = 'easy';
let shuffledIndexes = [];
let timerInterval;


// Ensure valid image paths and setup for the grid

document.addEventListener('DOMContentLoaded', () => {
    setupDifficultyButtons();
    
    setupReturnButton();
    const resetButton = document.getElementById('reset-btn');
    resetButton.addEventListener('click', resetGame); // Bind the resetGame function
});

function resetGame() {
    // ... any other reset logic ...
    startGame(); // Call startGame to reset the puzzle and the timer
}


// Setup the return button event listener
function setupReturnButton() {
    const returnButton = document.getElementById('return-main-btn');
    returnButton.addEventListener('click', returnToMainScreen);
}

function resetAndStartTimer() {
    stopTimer(); // Stop the current timer
    // Reset the timer display to "00:00"
    const timerDisplay = document.getElementById('time-counter');
    timerDisplay.textContent = formatTime(0);
    startTimer(); // Start a new timer
}

// Function to handle returning to the main screen
// Adjust the returnToMainScreen to show the achieved time on the main screen
function returnToMainScreen(timeAchieved) {
    // Code to return to the main screen
    // Update the display for the achieved time, assuming an element with id 'score' exists to show it
    const scoreDisplay = document.getElementById('score');
    if(scoreDisplay) {
        scoreDisplay.textContent = `Achieved Time: ${timeAchieved}`;
    }

    // Then hide the puzzle and show the intro screen
    hideElement('game-container');
    showElement('intro-screen');
}

// Setup event listeners for difficulty buttons
function setupDifficultyButtons() {
    const difficultyButtons = document.querySelectorAll(`.${DIFFICULTY_BUTTON_CLASS}`);
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            setDifficulty(button.dataset.difficulty);
        });
    });
}

// Setup event listener for reset button
function setupResetButton() {
    const resetButton = document.getElementById(RESET_BUTTON_ID);
    resetButton.addEventListener('click', startGame);
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    hideElement(INTRO_SCREEN_ID);
    showElement(GAME_CONTAINER_ID);
    startGame();
}


// Starts the timer
function startTimer() {
    const timerDisplay = document.getElementById('time-counter');
    let secondsElapsed = 0;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        timerDisplay.textContent = formatTime(secondsElapsed);
    }, 1000);
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'block';
}

function startGame() {
    resetAndStartTimer(); // Reset and start the timer
    fetchRandomImage()
        .then(createPuzzle)
        .catch(handleImageFetchError);
    // Removed the extra startTimer() call from here
}

// Stops the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Formats the time from seconds into a MM:SS string
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${pad(minutes)}:${pad(secondsLeft)}`;
}

// Adds a leading zero to numbers less than 10
function pad(number) {
    return number < 10 ? `0${number}` : number;
}


// Handle image fetch error
function handleImageFetchError(error) {
    console.error('Error fetching image:', error);
    createPuzzle(DEFAULT_IMAGE_URL);
}

function createPuzzle(imageUrl) {
    const gridSize = getGridSize(currentDifficulty);
    createPuzzlePieces(imageUrl, gridSize);
    initDragAndDrop();
}


// Determine grid size based on difficulty
function getGridSize(difficulty) {
    switch (difficulty) {
        case 'easy': return [3, 3];
        case 'medium': return [4, 4];
        case 'hard': return [6, 6];
        default: return [3, 3];
    }
}

// Create and display puzzle pieces
function createPuzzlePieces(imageUrl, gridSize) {
    const [cols, rows] = gridSize;
    const puzzleArea = document.getElementById(PUZZLE_AREA_ID);
    const pieceSize = calculatePieceSize(cols);

    shuffledIndexes = [...Array(cols * rows).keys()];
    shuffleArray(shuffledIndexes);

    setupPuzzleArea(puzzleArea, cols, rows, imageUrl, pieceSize);
    createAndPlacePieces(puzzleArea, cols, rows, imageUrl, pieceSize);
}

// Create and place puzzle pieces in the puzzle area
function createAndPlacePieces(puzzleArea, cols, rows, imageUrl, pieceSize) {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.style.width = `${pieceSize}px`;
            piece.style.height = `${pieceSize}px`;
            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundSize = `${cols * pieceSize}px ${rows * pieceSize}px`;
            piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
            piece.style.position = 'relative';
            piece.style.border = '1px solid #fff';
            piece.setAttribute('data-position', `${row},${col}`);
            piece.setAttribute('data-current-index', shuffledIndexes[row * cols + col]);
            piece.setAttribute('data-correct-index', row * cols + col);

            // Add the piece to the shuffled position
            const shuffledIndex = shuffledIndexes[row * cols + col];
            const shuffledRow = Math.floor(shuffledIndex / cols);
            const shuffledCol = shuffledIndex % cols;
            piece.style.gridRowStart = shuffledRow + 1;
            piece.style.gridColumnStart = shuffledCol + 1;

            puzzleArea.appendChild(piece);
        }
    }
}


// Fetch a random image for the puzzle
function fetchRandomImage() {
    // Replace with actual image fetching logic
    return Promise.resolve(DEFAULT_IMAGE_URL);
}


function displayImage(imageUrl) {
    const gameBoard = document.getElementById('puzzle-area');
    gameBoard.style.backgroundImage = 'url(' + imageUrl + ')';
    gameBoard.innerHTML = '';
}


function getPieceCount(difficulty) {
    switch(difficulty) {
        case 'easy': return 4;
        case 'medium': return 16;
        case 'hard': return 36;
        default: return 4;
    }
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// Initialize drag and drop functionality
function initDragAndDrop() {
    const puzzlePieces = document.querySelectorAll('.puzzle-piece');
    let draggedPiece = null;

    puzzlePieces.forEach(piece => {
        piece.setAttribute('draggable', true);

        // Drag start event
        piece.addEventListener('dragstart', (e) => {
            draggedPiece = piece;
            e.dataTransfer.setData('text/plain', piece.dataset.position);
        });

        // Drag over event
        piece.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping
        });

        // Drop event
        piece.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetPosition = e.target.dataset.position;
            const draggedPosition = draggedPiece.dataset.position;

            if (targetPosition !== draggedPosition) {
                swapPieces(e.target, draggedPiece);
                //checkIfPuzzleCompleted();
            }
        });
    });
}

// Swap pieces
function swapPieces(piece1, piece2) {
    // Swapping grid positions
    let tempGridRow = piece1.style.gridRowStart;
    let tempGridColumn = piece1.style.gridColumnStart;
    piece1.style.gridRowStart = piece2.style.gridRowStart;
    piece1.style.gridColumnStart = piece2.style.gridColumnStart;
    piece2.style.gridRowStart = tempGridRow;
    piece2.style.gridColumnStart = tempGridColumn;
    
    // Swapping data-current-index attributes
    let tempIndex = piece1.getAttribute('data-current-index');
    piece1.setAttribute('data-current-index', piece2.getAttribute('data-current-index'));
    piece2.setAttribute('data-current-index', tempIndex);

    // Check if the puzzle is completed after each swap
    checkIfPuzzleCompleted();
}


// Check if the puzzle is completed
function checkIfPuzzleCompleted() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    let isCompleted = true;

    pieces.forEach(piece => {
        const current = parseInt(piece.getAttribute('data-current-index'), 10);
        const correct = parseInt(piece.getAttribute('data-correct-index'), 10);

        if (current !== correct) {
            isCompleted = false;
        }
    });

    if (isCompleted) {
        // Stop the timer and get the achieved time
        stopTimer();
        const achievedTime = document.getElementById('time-counter').textContent;

        // Call returnToMainScreen with the achieved time
        returnToMainScreen(achievedTime);
    }
}




function handleDragStart(event) {
    // Set the data transfer object with the id of the piece being dragged
    event.dataTransfer.setData('text/plain', event.target.id);
    event.dropEffect = 'move';
}

function handleDragOver(event) {
    // Prevent default to allow the drop
    event.preventDefault();
}


function handleDrop(event) {
    event.preventDefault();
    
    const id = event.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(id);
    const dropZone = event.target.closest('.puzzle-piece'); // Use closest to ensure we get the puzzle piece

    if (dropZone && draggableElement) {
        swapPuzzlePieces(draggableElement, dropZone);
    } else {
        console.error('Drop zone or draggable element not found', { dropZone, draggableElement });
    }
}


function swapPuzzlePieces(piece1, piece2) {
    // Check if both pieces are not null
    if (!piece1 || !piece2) {
        console.error('One of the pieces is null', { piece1, piece2 });
        return; // Exit the function if one of the pieces is null
    }

    // Swap the grid positions
    const piece1Style = window.getComputedStyle(piece1);
    const piece2Style = window.getComputedStyle(piece2);

    const style1 = { 
        gridColumnStart: piece1Style.gridColumnStart, 
        gridRowStart: piece1Style.gridRowStart 
    };
    const style2 = { 
        gridColumnStart: piece2Style.gridColumnStart, 
        gridRowStart: piece2Style.gridRowStart 
    };

    piece1.style.gridColumnStart = style2.gridColumnStart;
    piece1.style.gridRowStart = style2.gridRowStart;
    piece2.style.gridColumnStart = style1.gridColumnStart;
    piece2.style.gridRowStart = style1.gridRowStart;
    
}





function checkCompletion() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    // Check if all pieces are in the correct order
    for (let i = 0; i < pieces.length; i++) {
        if (parseInt(pieces[i].getAttribute('data-correct-order')) !== i) {
            return false; // Puzzle is not completed
        }
    }
    // Puzzle completed
    alert('Congratulations! You have completed the puzzle.');
    return true;
}


function calculatePieceSize(cols) {
    const puzzleArea = document.getElementById(PUZZLE_AREA_ID);
    const maxWidth = puzzleArea.clientWidth < window.innerWidth ? puzzleArea.clientWidth : window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.8;
    const maxPuzzleSize = Math.min(maxWidth, maxHeight);
    return maxPuzzleSize / cols;
}

// When setting up the puzzle area:
function setupPuzzleArea(puzzleArea, cols, rows) {
    const pieceSize = calculatePieceSize(cols);
    puzzleArea.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    puzzleArea.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    // Now set the size of the puzzle pieces
    const puzzlePieces = document.querySelectorAll('.puzzle-piece');
    puzzlePieces.forEach(piece => {
        piece.style.width = `${pieceSize}px`;
        piece.style.height = `${pieceSize}px`;
        // Adjust background size and position if necessary
    });
}

// Function to calculate the number of pieces per row based on difficulty
function piecesPerRow(difficulty) {
    return difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;}


window.addEventListener('resize', resizePuzzle);

function resizePuzzle() {
    const gridSize = getGridSize(currentDifficulty); // Assuming this returns [cols, rows]
    setupPuzzleArea(document.getElementById(PUZZLE_AREA_ID), gridSize[0], gridSize[1]);
    // Call any functions necessary to resize and reposition the pieces
}