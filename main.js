
// Ensure valid image paths and setup for the grid

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for the difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(button => {
        button.addEventListener('click', () => {
            setDifficulty(button.dataset.difficulty);
        });
    });

    // Event listener for the reset button
    document.getElementById('reset-btn').addEventListener('click', startGame);
});

let currentDifficulty = 'easy';

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    startGame();
}

function startGame() {
    // Attempt to fetch an image and create puzzle pieces
    fetchRandomImage().then(imageUrl => {
        createPuzzlePieces(imageUrl, currentDifficulty);
        initDragAndDrop();
    }).catch(error => {
        console.error('Error fetching image:', error);
        // If image fetch fails, display an error message or a default image
        createPuzzlePieces('image.jpg', currentDifficulty);
        initDragAndDrop();
    });
}

function getGridSize(difficulty) {
  switch(difficulty) {
    case 'easy': return [3, 3]; // 3x3 grid
    case 'medium': return [4, 4]; // 4x4 grid
    case 'hard': return [6, 6]; // 6x6 grid
    default: return [3, 3]; // default to easy
  }
}

// Modify this function based on your existing logic to set the difficulty
function createPuzzlePieces(imageUrl,difficulty) {
  const [cols, rows] = getGridSize(difficulty);
  const puzzleArea = document.getElementById('puzzle-area');
  const pieceSize = puzzleArea.offsetWidth / cols;

   const positions = [];
    for(let i = 0; i < rows * cols; i++) {
        positions.push(i);
    }
    // Shuffle the array to randomize the positions
    shuffleArray(positions);

  // Adjust the grid template settings based on difficulty
  puzzleArea.style.display = 'grid';
  puzzleArea.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  puzzleArea.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    // Set the background for the whole puzzle area
  puzzleArea.style.backgroundImage = `url(${imageUrl})`;


    // Create and place puzzle pieces
    for(let i = 0; i < positions.length; i++) {
        const row = Math.floor(positions[i] / cols);
        const col = positions[i] % cols;
        const piece = document.createElement('div');
        piece.setAttribute('data-correct-order', i); 
        piece.id = `piece-${row}-${col}`;
        piece.classList.add('puzzle-piece');
        piece.style.width = `${pieceSize}px`;
        piece.style.height = `${pieceSize}px`;

        // Calculate the background position
        const posX = col * pieceSize;
        const posY = row * pieceSize;
        piece.style.backgroundImage = `url(${imageUrl})`;
        piece.style.backgroundSize = `${cols * pieceSize}px ${rows * pieceSize}px`;
        piece.style.backgroundPosition = `-${posX}px -${posY}px`;
        piece.style.backgroundRepeat = 'no-repeat';

        // Use the shuffled positions for the grid placement
        const shuffledRow = Math.floor(i / cols) + 1;
        const shuffledCol = (i % cols) + 1;
        piece.style.gridRowStart = shuffledRow;
        piece.style.gridColumnStart = shuffledCol;

        // Append the puzzle piece to the puzzle area
        puzzleArea.appendChild(piece);
    }
    initDragAndDrop();
}

function fetchRandomImage() {
    // This function should fetch a random image from a server or local directory
    return Promise.resolve('image.jpg'); // Make sure this is a valid path
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initDragAndDrop() {
    const puzzlePieces = document.querySelectorAll('.puzzle-piece');
    const puzzleArea = document.getElementById('puzzle-area');

    // Enable dragging on each puzzle piece
    puzzlePieces.forEach(piece => {
        piece.setAttribute('draggable', true);
        piece.addEventListener('dragstart', handleDragStart);
    });

    // Allow the puzzle area to respond to dragover and drop events
    puzzleArea.addEventListener('dragover', handleDragOver);
    puzzleArea.addEventListener('drop', handleDrop);
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



function swapPieces(piece1, piece2) {
    // Swap positions
    let top1 = piece1.style.top;
    let left1 = piece1.style.left;
    let top2 = piece2.style.top;
    let left2 = piece2.style.left;

    piece1.style.top = top2;
    piece1.style.left = left2;
    piece2.style.top = top1;
    piece2.style.left = left1;

    // Swap indexes in shuffledIndexes array
    let index1 = shuffledIndexes.indexOf(parseInt(piece1.id.split('-')[1]));
    let index2 = shuffledIndexes.indexOf(parseInt(piece2.id.split('-')[1]));
    [shuffledIndexes[index1], shuffledIndexes[index2]] = [shuffledIndexes[index2], shuffledIndexes[index1]];
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


function calculatePieceSize(difficulty, containerSize) {
    const piecesPerRow = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
    const pieceSize = containerSize / piecesPerRow;
    return pieceSize;
}


// Function to calculate the number of pieces per row based on difficulty
function piecesPerRow(difficulty) {
    return difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;}


