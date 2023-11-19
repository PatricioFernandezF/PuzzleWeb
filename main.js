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



// Ensure valid image paths and setup for the grid

document.addEventListener('DOMContentLoaded', () => {
    setupDifficultyButtons();
    setupResetButton();
});


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

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'block';
}

function startGame() {
    fetchRandomImage()
        .then(createPuzzle)
        .catch(handleImageFetchError);
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


// Setup puzzle area styles
function setupPuzzleArea(puzzleArea, cols, rows, imageUrl, pieceSize) {
    puzzleArea.style.display = 'grid';
    puzzleArea.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    puzzleArea.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    puzzleArea.style.backgroundImage = `url(${imageUrl})`;
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
                checkIfPuzzleCompleted();
            }
        });
    });
}

// Swap pieces
function swapPieces(piece1, piece2) {
    const tempPosition = piece1.style.gridRowStart;
    piece1.style.gridRowStart = piece2.style.gridRowStart;
    piece2.style.gridRowStart = tempPosition;

    const tempColPosition = piece1.style.gridColumnStart;
    piece1.style.gridColumnStart = piece2.style.gridColumnStart;
    piece2.style.gridColumnStart = tempColPosition;
}

// Check if the puzzle is completed
function checkIfPuzzleCompleted() {
    const puzzlePieces = document.querySelectorAll('.puzzle-piece');
    const isCompleted = Array.from(puzzlePieces).every(piece => {
        const [row, col] = piece.dataset.position.split(',');
        return piece.style.gridRowStart === row && piece.style.gridColumnStart === col;
    });

    if (isCompleted) {
        // Handle puzzle completion (e.g., display a message)
        console.log('Puzzle Completed!');
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


// Calculate piece size based on grid columns
function calculatePieceSize(cols) {
    const puzzleArea = document.getElementById(PUZZLE_AREA_ID);
    return puzzleArea.offsetWidth / cols;
}


// Function to calculate the number of pieces per row based on difficulty
function piecesPerRow(difficulty) {
    return difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;}


