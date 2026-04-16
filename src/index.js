import './style.css';
import Player from './player.js';
import DOMManager from './domManager.js';
import GameBoard from './gameBoard.js';

const SHIPS = [
  { length: 5, name: 'Carrier' },
  { length: 4, name: 'Battleship' },
  { length: 3, name: 'Cruiser' },
  { length: 3, name: 'Submarine' },
  { length: 2, name: 'Destroyer' }
];

class Game {
  constructor() {
    this.dom = new DOMManager();
    this.mode = null;
    this.currentPlayer = 1;
    this.player1 = null;
    this.player2 = null;
    this.gameOver = false;
    this.attackedCoords = new Set();
    this.placedCells = new Set();
    this.placementDirection = 'h';
    this.draggingShipIndex = -1;
    this.draggingShipLength = 0;
    
    this.huntStack = [];
    this.lastHit = null;
    this.hitChain = [];
    
    this.init();
  }

  init() {
    this.setupThemeToggle();
    this.dom.setModeSelectHandler((mode) => this.startMode(mode));
    this.dom.setResetHandler(() => this.reset());
    this.dom.updateStatus('Select a game mode to begin');
  }

  setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('battleship-theme');
    
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      toggleBtn.textContent = 'Dark Mode';
    }
    
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      toggleBtn.textContent = isLight ? 'Dark Mode' : 'Light Mode';
      localStorage.setItem('battleship-theme', isLight ? 'light' : 'dark');
    });
  }

  startMode(mode) {
    this.mode = mode;
    this.currentPlayer = 1;
    this.gameOver = false;
    this.attackedCoords = new Set();
    this.placedCells = new Set();
    this.placedShips = [];
    
    if (mode === 'computer') {
      this.player1 = new Player('real');
      this.player2 = new Player('computer');
      this.startPlacement(1);
    } else {
      this.player1 = new Player('real');
      this.showPassScreen("Player 1 - Place Your Ships");
    }
  }

  showPassScreen(message) {
    this.dom.showPassScreen(message);
    this.dom.setReadyHandler(() => {
      if (this.mode === 'computer') {
        this.startPlacement(this.currentPlayer);
      } else {
        if (this.currentPlayer === 1) {
          this.player1 = new Player('real');
          this.startPlacement(1);
        } else {
          this.player2 = new Player('real');
          this.startPlacement(2);
        }
      }
    });
  }

  startPlacement(player) {
    this.currentPlayer = player;
    this.placedCells = new Set();
    this.placedShips = [];
    this.placementDirection = 'h';
    
    const title = this.mode === 'computer' 
      ? 'Place Your Ships' 
      : `Player ${player} - Place Your Ships`;
    
    this.dom.showPlacement(title, this.mode === 'player');
    this.dom.renderShipDock(SHIPS, []);
    this.dom.renderPlacementBoard(this.getCurrentPlayer().gameBoard, []);
    this.dom.updateStatus(`Place your ${SHIPS[0].name} (${SHIPS[0].length} cells)`);
    
    this.setupDragAndDrop();
    
    this.dom.setRandomHandler(() => this.randomPlaceAll());
    this.dom.setDoneHandler(() => this.donePlacement());
    
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'r') this.rotateShip();
    });
  }

  setupDragAndDrop() {
    this.dom.setDragStartHandler((index, length, name) => {
      this.draggingShipIndex = index;
      this.draggingShipLength = length;
      window.currentDragShip = { index, length, name };
    });
    
    this.dom.setDragEndHandler(() => {
      this.draggingShipIndex = -1;
      this.draggingShipLength = 0;
      window.currentDragShip = null;
    });
    
    this.dom.setupBoardDragDrop(this.placedCells, SHIPS, () => this.placementDirection);
    
    this.dom.setDropShipHandler((details) => this.handleDrop(details));
    this.dom.setClickBoardHandler((details) => this.handleBoardClick(details));
    this.dom.setRotateHandler(() => this.rotateShip());
  }

  handleDrop(details) {
    if (this.draggingShipIndex < 0 || this.placedShips.includes(this.draggingShipIndex)) return;
    this.placeShipAt(details.x, details.y, this.draggingShipIndex);
  }

  handleBoardClick(details) {
    if (this.draggingShipIndex >= 0 && !this.placedShips.includes(this.draggingShipIndex)) {
      this.placeShipAt(details.x, details.y, this.draggingShipIndex);
    }
  }

  placeShipAt(x, y, shipIndex) {
    const ship = SHIPS[shipIndex];
    
    let endX = this.placementDirection === 'h' ? x + ship.length - 1 : x;
    let endY = this.placementDirection === 'v' ? y + ship.length - 1 : y;
    
    if (endX > 9 || endY > 9 || x < 0 || y < 0) {
      this.dom.updateStatus('Ship goes off board!');
      return;
    }
    
    for (let i = 0; i < ship.length; i++) {
      const cellX = this.placementDirection === 'h' ? x + i : x;
      const cellY = this.placementDirection === 'v' ? y + i : y;
      const key = `${cellX},${cellY}`;
      if (this.placedCells.has(key)) {
        this.dom.updateStatus('Invalid placement! Overlapping or occupied.');
        return;
      }
    }
    
    const success = this.getCurrentPlayer().gameBoard.addShip([x, y], [endX, endY], this.placementDirection);
    
    if (!success) {
      this.dom.updateStatus('Invalid placement!');
      return;
    }
    
    for (let i = 0; i < ship.length; i++) {
      const cellX = this.placementDirection === 'h' ? x + i : x;
      const cellY = this.placementDirection === 'v' ? y + i : y;
      this.placedCells.add(`${cellX},${cellY}`);
    }
    
    this.placedShips.push(shipIndex);
    
    if (this.placedShips.length >= SHIPS.length) {
      this.dom.doneBtn.textContent = this.mode === 'computer' ? 'Start Game' : 'Done';
      this.dom.doneBtn.style.display = 'inline-block';
      this.dom.updateStatus(this.mode === 'computer' ? 'All ships placed! Click Start Game.' : 'All ships placed! Click Done.');
    } else {
      const nextIndex = SHIPS.findIndex((_, i) => !this.placedShips.includes(i));
      this.dom.renderShipDock(SHIPS, this.placedShips);
      this.dom.renderPlacementBoard(this.getCurrentPlayer().gameBoard, this.placedShips);
      this.setupDragAndDrop();
      this.dom.updateStatus(`Place your ${SHIPS[nextIndex].name} (${SHIPS[nextIndex].length} cells)`);
    }
  }

  rotateShip() {
    this.placementDirection = this.placementDirection === 'h' ? 'v' : 'h';
  }

  donePlacement() {
    if (this.mode === 'computer') {
      this.startGame();
    } else {
      if (this.currentPlayer === 1) {
        this.currentPlayer = 2;
        this.showPassScreen("Player 2 - Place Your Ships");
      } else {
        this.start2PGame();
      }
    }
  }

  randomPlaceAll() {
    const player = this.getCurrentPlayer();
    player.gameBoard = new GameBoard();
    this.placedShips = SHIPS.map((_, i) => i);
    this.placedCells = new Set();
    
    for (const ship of SHIPS) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const dir = Math.random() < 0.5 ? 'h' : 'v';
        
        let endX = dir === 'h' ? x + ship.length - 1 : x;
        let endY = dir === 'v' ? y + ship.length - 1 : y;
        
        if (endX <= 9 && endY <= 9) {
          placed = player.gameBoard.addShip([x, y], [endX, endY], dir);
        }
        attempts++;
      }
    }
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const value = player.gameBoard.board[y][x];
        if (value !== null && !value.includes('(hit)') && value !== '(miss)') {
          this.placedCells.add(`${x},${y}`);
        }
      }
    }
    
    this.dom.renderShipDock(SHIPS, this.placedShips);
    this.dom.renderPlacementBoard(player.gameBoard, this.placedShips);
    this.setupDragAndDrop();
    
    this.dom.doneBtn.textContent = this.mode === 'computer' ? 'Start Game' : 'Done';
    this.dom.doneBtn.style.display = 'inline-block';
    this.dom.updateStatus(this.mode === 'computer' ? 'Random ships placed! Click Start Game.' : 'Random ships placed! Click Done.');
  }

  startGame() {
    this.placedShips = [];
    this.gameOver = false;
    this.attackedCoords = new Set();
    this.huntStack = [];
    this.lastHit = null;
    this.hitChain = [];
    this.currentPlayer = 1;
    
    if (this.mode === 'computer') {
      this.placeComputerShips();
    }
    
    this.dom.showGame('Your Ships', 'Enemy Waters');
    this.dom.setAttackHandler((x, y) => this.handlePlayerAttack(x, y));
    this.dom.updateStatus('Your turn - click on enemy board to attack!');
    
    this.render();
  }

  placeComputerShips() {
    for (const ship of SHIPS) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const dir = Math.random() < 0.5 ? 'h' : 'v';
        
        let endX = dir === 'h' ? x + ship.length - 1 : x;
        let endY = dir === 'v' ? y + ship.length - 1 : y;
        
        if (endX <= 9 && endY <= 9) {
          placed = this.player2.gameBoard.addShip([x, y], [endX, endY], dir);
        }
        attempts++;
      }
    }
  }

  start2PGame() {
    this.gameOver = false;
    this.attackedCoords = [new Set(), new Set()];
    this.huntStack = [];
    this.lastHit = null;
    this.hitChain = [];
    this.currentPlayer = 1;
    this.placedShips = [];
    
    this.dom.showPassScreen("Player 1 - Attack!");
    this.dom.setReadyHandler(() => {
      this.dom.showGame('Your Ships', 'Enemy Waters');
      this.dom.setAttackHandler((x, y) => this.handlePlayerAttack(x, y));
      this.dom.updateStatus('Player 1 - Your turn to attack!');
      this.render();
    });
  }

  getCurrentPlayer() {
    return this.currentPlayer === 1 ? this.player1 : this.player2;
  }

  getEnemyPlayer() {
    return this.currentPlayer === 1 ? this.player2 : this.player1;
  }

  getCurrentAttackedCoords() {
    if (this.mode === 'player') {
      return this.attackedCoords[this.currentPlayer - 1];
    }
    return this.attackedCoords;
  }

  render() {
    this.dom.clearBoards();
    this.dom.renderBoard(this.getCurrentPlayer().gameBoard, false);
    this.dom.renderBoard(this.getEnemyPlayer().gameBoard, true);
  }

  handlePlayerAttack(x, y) {
    if (this.gameOver) return;
    
    const attackedCoords = this.getCurrentAttackedCoords();
    const key = `${x},${y}`;
    
    if (attackedCoords.has(key)) return;
    attackedCoords.add(key);
    
    const enemy = this.getEnemyPlayer();
    enemy.gameBoard.reciveAttack([x, y]);
    this.render();
    
    if (enemy.gameBoard.isAllSunk()) {
      this.gameOver = true;
      const winner = this.mode === 'computer' ? 'You win!' : `Player ${this.currentPlayer} wins!`;
      this.dom.updateStatus(`${winner} All enemy ships sunk!`);
      return;
    }
    
    if (this.mode === 'player') {
      this.switchPlayer();
    } else {
      this.dom.updateStatus('Computer is thinking...');
      setTimeout(() => this.computerAttack(), 800);
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.dom.clearBoards();
    this.dom.showPassScreen(`Player ${this.currentPlayer}'s Turn`);
    this.dom.setReadyHandler(() => {
      this.dom.showGame('Your Ships', 'Enemy Waters');
      this.dom.setAttackHandler((x, y) => this.handlePlayerAttack(x, y));
      this.dom.updateStatus(`Player ${this.currentPlayer} - Your turn!`);
      this.render();
    });
  }

  computerAttack() {
    if (this.gameOver) return;
    
    let x, y, key;
    
    if (this.huntStack.length > 0) {
      const target = this.huntStack.pop();
      x = target.x;
      y = target.y;
      key = `${x},${y}`;
      
      if (this.attackedCoords.has(key)) {
        this.computerAttack();
        return;
      }
    } else {
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
        key = `${x},${y}`;
      } while (this.attackedCoords.has(key));
    }
    
    this.attackedCoords.add(key);
    this.player1.gameBoard.reciveAttack([x, y]);
    this.render();
    
    const cellValue = this.player1.gameBoard.board[y][x];
    const isHit = cellValue && cellValue.includes('(hit)');
    
    if (isHit) {
      this.lastHit = { x, y };
      this.hitChain.push({ x, y });
      this.addAdjacentTargets(x, y);
      
      if (this.hitChain.length >= 2) {
        this.huntStack = [];
        const first = this.hitChain[0];
        const last = this.hitChain[this.hitChain.length - 1];
        
        if (first.x === last.x) {
          const minY = Math.min(first.y, last.y);
          const maxY = Math.max(first.y, last.y);
          for (let ny = minY - 1; ny <= maxY + 1; ny++) {
            if (ny >= 0 && ny < 10) {
              this.addTarget(first.x, ny);
            }
          }
        } else if (first.y === last.y) {
          const minX = Math.min(first.x, last.x);
          const maxX = Math.max(first.x, last.x);
          for (let nx = minX - 1; nx <= maxX + 1; nx++) {
            if (nx >= 0 && nx < 10) {
              this.addTarget(nx, first.y);
            }
          }
        }
      }
    } else {
      if (this.hitChain.length > 0 && this.lastHit && 
          this.hitChain.every(h => 
            Math.abs(h.x - this.lastHit.x) <= 1 && Math.abs(h.y - this.lastHit.y) <= 1
          )) {
      } else {
        this.hitChain = [];
      }
    }
    
    if (this.player1.gameBoard.isAllSunk()) {
      this.gameOver = true;
      this.dom.updateStatus('Game over! Computer wins!');
      return;
    }
    
    this.dom.updateStatus('Your turn - click on enemy board to attack!');
  }

  addTarget(x, y) {
    const key = `${x},${y}`;
    if (!this.attackedCoords.has(key)) {
      const alreadyInStack = this.huntStack.some(t => t.x === x && t.y === y);
      if (!alreadyInStack) {
        this.huntStack.push({ x, y });
      }
    }
  }

  addAdjacentTargets(x, y) {
    const directions = [
      { x: x - 1, y: y },
      { x: x + 1, y: y },
      { x: x, y: y - 1 },
      { x: x, y: y + 1 }
    ];
    
    directions.forEach(dir => {
      if (dir.x >= 0 && dir.x < 10 && dir.y >= 0 && dir.y < 10) {
        this.addTarget(dir.x, dir.y);
      }
    });
  }

  reset() {
    this.dom.showModeSelect();
    this.mode = null;
    this.currentPlayer = 1;
    this.player1 = null;
    this.player2 = null;
    this.gameOver = false;
    this.attackedCoords = new Set();
    this.placedShips = [];
    this.huntStack = [];
    this.lastHit = null;
    this.hitChain = [];
    this.dom.updateStatus('Select a game mode to begin');
  }
}

new Game();
