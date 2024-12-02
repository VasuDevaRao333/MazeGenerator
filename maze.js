const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');

const mazeSize = 20;  // Number of rows/columns
const cellSize = 30;  // Size of each cell

let maze = [];
let playerPos = { x: 1, y: 1 };
let goalPos = { x: 0, y: 0 };  // Default, will be randomized
let timerInterval;
let startTime;
let isTimerRunning = false; // Flag to check if the timer is running

// Set canvas size
canvas.width = mazeSize * cellSize;
canvas.height = mazeSize * cellSize;

// Maze generation using Randomized Prim's Algorithm
function generateMaze() {
    maze = [];
    for (let y = 0; y < mazeSize; y++) {
        maze[y] = [];
        for (let x = 0; x < mazeSize; x++) {
            maze[y][x] = 1; // 1 represents a wall
        }
    }

    // Randomized Prim's Algorithm for maze generation
    let walls = [];
    let startX = 1;
    let startY = 1;
    maze[startY][startX] = 0; // Start point

    // Add neighboring cells to walls list
    function addWalls(x, y) {
        if (x > 1 && maze[y][x - 2] === 1) walls.push([x - 2, y]);
        if (x < mazeSize - 2 && maze[y][x + 2] === 1) walls.push([x + 2, y]);
        if (y > 1 && maze[y - 2][x] === 1) walls.push([x, y - 2]);
        if (y < mazeSize - 2 && maze[y + 2][x] === 1) walls.push([x, y + 2]);
    }

    addWalls(startX, startY);

    while (walls.length > 0) {
        const wall = walls.splice(Math.floor(Math.random() * walls.length), 1)[0];
        const [x, y] = wall;

        if (maze[y][x] === 1) {
            maze[y][x] = 0;

            // Remove wall between two cells
            if (y > 1 && maze[y - 2][x] === 0) maze[y - 1][x] = 0;
            if (y < mazeSize - 2 && maze[y + 2][x] === 0) maze[y + 1][x] = 0;
            if (x > 1 && maze[y][x - 2] === 0) maze[y][x - 1] = 0;
            if (x < mazeSize - 2 && maze[y][x + 2] === 0) maze[y][x + 1] = 0;

            addWalls(x, y);
        }
    }

    // Randomly place goal in an open space
    placeGoal();

    // Redraw maze
    drawMaze();
}

// Function to place goal in a random open space (0)
function placeGoal() {
    let goalPlaced = false;
    while (!goalPlaced) {
        const randomX = Math.floor(Math.random() * mazeSize);
        const randomY = Math.floor(Math.random() * mazeSize);
        if (maze[randomY][randomX] === 0 && (randomX !== playerPos.x || randomY !== playerPos.y)) {
            goalPos = { x: randomX, y: randomY };
            goalPlaced = true;
        }
    }
}

// Draw maze
function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = 'black';
            } else {
                ctx.fillStyle = 'white';
            }
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(playerPos.x * cellSize, playerPos.y * cellSize, cellSize, cellSize);

    // Draw goal
    ctx.fillStyle = 'green';
    ctx.fillRect(goalPos.x * cellSize, goalPos.y * cellSize, cellSize, cellSize);
}

// Start the timer
function startTimer() {
    if (!isTimerRunning) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerElement.textContent = `Time: ${elapsedTime}s`;
        }, 1000);
        isTimerRunning = true;
    }
}

// Move player through the maze with keyboard controls
function movePlayer(event) {
    const key = event.key;

    // Start timer when first movement occurs
    if (!isTimerRunning) {
        startTimer();
    }

    if (key === "ArrowUp" || key === "w") {
        if (maze[playerPos.y - 1][playerPos.x] === 0) playerPos.y--;
    } else if (key === "ArrowDown" || key === "s") {
        if (maze[playerPos.y + 1][playerPos.x] === 0) playerPos.y++;
    } else if (key === "ArrowLeft" || key === "a") {
        if (maze[playerPos.y][playerPos.x - 1] === 0) playerPos.x--;
    } else if (key === "ArrowRight" || key === "d") {
        if (maze[playerPos.y][playerPos.x + 1] === 0) playerPos.x++;
    }

    // Redraw the maze and player
    drawMaze();

    // Check if player reached the goal
    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
        clearInterval(timerInterval);
        timerElement.textContent = "You Win!";
    }
}

// Solve maze using Depth-First Search (DFS)
function solveMaze() {
    const stack = [];
    const visited = Array.from({ length: mazeSize }, () => Array(mazeSize).fill(false));
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 1, y: 0 },  // Right
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }, // Left
    ];

    function isValidMove(x, y) {
        return x >= 0 && y >= 0 && x < mazeSize && y < mazeSize && maze[y][x] === 0 && !visited[y][x];
    }

    stack.push({ x: 1, y: 1 });
    visited[1][1] = true;

    while (stack.length > 0) {
        const { x, y } = stack[stack.length - 1];

        if (x === goalPos.x && y === goalPos.y) {
            return;
        }

        let moved = false;
        for (let i = 0; i < directions.length; i++) {
            const newX = x + directions[i].x;
            const newY = y + directions[i].y;

            if (isValidMove(newX, newY)) {
                stack.push({ x: newX, y: newY });
                visited[newY][newX] = true;
                moved = true;
                break;
            }
        }

        if (!moved) {
            stack.pop();
        }
    }

    // Visualize the solution path
    for (let i = 0; i < stack.length; i++) {
        const { x, y } = stack[i];
        ctx.fillStyle = 'blue';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
}

// Event listeners for controls
document.getElementById('generateMazeBtn').addEventListener('click', () => {
    playerPos = { x: 1, y: 1 };
    generateMaze();
    isTimerRunning = false;
    timerElement.textContent = "Time: 0s";
});

document.getElementById('solveMazeBtn').addEventListener('click', () => {
    solveMaze();
});

document.addEventListener('keydown', movePlayer);

// Initial setup
generateMaze();