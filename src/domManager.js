export default class DOMManager {
  constructor() {
    this.modeSelectEl = document.getElementById('mode-select');
    this.passScreenEl = document.getElementById('pass-screen');
    this.passMessageEl = document.getElementById('pass-message');
    this.readyBtn = document.getElementById('ready-btn');
    this.placementPanel = document.getElementById('placement-panel');
    this.gameContainer = document.getElementById('game-container');
    this.playerBoardEl = document.getElementById('player-board');
    this.playerBoardGameEl = document.getElementById('player-board-game');
    this.enemyBoardEl = document.getElementById('enemy-board');
    this.shipDockEl = document.getElementById('ship-dock');
    this.statusEl = document.getElementById('status');
    this.resetBtn = document.getElementById('reset-btn');
    this.randomBtn = document.getElementById('random-btn');
    this.doneBtn = document.getElementById('done-btn');
    this.boardLabelEl = document.getElementById('board-label');
    this.playerLabelEl = document.getElementById('player-label');
    this.enemyLabelEl = document.getElementById('enemy-label');
    this.placementTitleEl = document.getElementById('placement-title');
    this.attackHandler = null;
    
    this.vsComputerBtn = document.getElementById('vs-computer-btn');
    this.vsPlayerBtn = document.getElementById('vs-player-btn');
  }

  renderBoard(gameBoard, isEnemy = false) {
    const board = gameBoard.board;
    const container = isEnemy ? this.enemyBoardEl : this.playerBoardGameEl;
    container.innerHTML = '';
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement('div');
        const cellX = x;
        const cellY = y;
        cell.className = 'cell';
        
        const value = board[y][x];
        
        if (value === null) {
          cell.classList.add('empty');
        } else if (value === '(miss)') {
          cell.classList.add('miss');
          cell.textContent = '•';
        } else if (value.includes('(hit)')) {
          cell.classList.add('hit');
          cell.textContent = 'X';
        } else if (!isEnemy && value !== null) {
          cell.classList.add('ship');
        }
        
        if (isEnemy) {
          cell.classList.add('enemy-cell');
          cell.onclick = () => {
            window.dispatchEvent(new CustomEvent('attack', { detail: { x: cellX, y: cellY } }));
          };
        }
        
        container.appendChild(cell);
      }
    }
  }

  renderPlacementBoard(gameBoard, placedShips) {
    const board = gameBoard.board;
    this.playerBoardEl.innerHTML = '';
    this.playerBoardEl.classList.add('placement-board');
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement('div');
        const cellX = x;
        const cellY = y;
        cell.className = 'cell';
        
        const value = board[y][x];
        if (value !== null && !value.includes('(hit)') && value !== '(miss)') {
          cell.classList.add('ship');
        }
        
        this.playerBoardEl.appendChild(cell);
      }
    }
  }

  renderShipDock(ships, placedIndices) {
    this.shipDockEl.innerHTML = '';
    
    ships.forEach((ship, index) => {
      const item = document.createElement('div');
      item.className = 'ship-item';
      item.dataset.index = index;
      item.dataset.length = ship.length;
      item.dataset.name = ship.name;
      item.draggable = true;
      
      if (placedIndices.includes(index)) {
        item.classList.add('placed');
        item.draggable = false;
      }
      
      for (let i = 0; i < ship.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'ship-cell';
        item.appendChild(cell);
      }
      
      const name = document.createElement('span');
      name.className = 'ship-name';
      name.textContent = ship.name;
      item.appendChild(name);
      
      this.shipDockEl.appendChild(item);
    });
  }

  showPreview(x, y, length, direction, gameBoard, placedCells) {
    this.clearPreview();
    
    const cells = this.playerBoardEl.querySelectorAll('.cell');
    const valid = this.canPlace(x, y, length, direction, gameBoard, placedCells);
    
    for (let i = 0; i < length; i++) {
      const cellX = direction === 'h' ? x + i : x;
      const cellY = direction === 'v' ? y + i : y;
      
      if (cellX >= 0 && cellX < 10 && cellY >= 0 && cellY < 10) {
        const index = cellY * 10 + cellX;
        cells[index].classList.add(valid ? 'preview' : 'preview-invalid');
      }
    }
  }

  clearPreview() {
    const cells = this.playerBoardEl.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.classList.remove('preview', 'preview-invalid');
    });
  }

  canPlace(x, y, length, direction, gameBoard, placedCells) {
    for (let i = 0; i < length; i++) {
      const cellX = direction === 'h' ? x + i : x;
      const cellY = direction === 'v' ? y + i : y;
      
      if (cellX < 0 || cellX >= 10 || cellY < 0 || cellY >= 10) {
        return false;
      }
      
      const key = `${cellX},${cellY}`;
      if (placedCells.has(key)) {
        return false;
      }
    }
    return true;
  }

  setModeSelectHandler(handler) {
    this.vsComputerBtn.onclick = () => handler('computer');
    this.vsPlayerBtn.onclick = () => handler('player');
  }

  setReadyHandler(handler) {
    this.readyBtn.onclick = handler;
  }

  setRandomHandler(handler) {
    this.randomBtn.onclick = handler;
  }

  setDoneHandler(handler) {
    this.doneBtn.onclick = handler;
  }

  setDragStartHandler(handler) {
    this.shipDockEl.addEventListener('dragstart', (e) => {
      const shipItem = e.target.closest('.ship-item');
      if (shipItem && !shipItem.classList.contains('placed')) {
        shipItem.classList.add('dragging');
        handler(parseInt(shipItem.dataset.index), parseInt(shipItem.dataset.length), shipItem.dataset.name);
      }
    });
  }

  setDragEndHandler(handler) {
    this.shipDockEl.addEventListener('dragend', (e) => {
      const shipItem = e.target.closest('.ship-item');
      if (shipItem) {
        shipItem.classList.remove('dragging');
      }
      handler();
    });
  }

  setupBoardDragDrop(placedCells, ships, getDirection) {
    this.playerBoardEl.ondragover = (e) => {
      e.preventDefault();
      const rect = this.playerBoardEl.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / 33);
      const y = Math.floor((e.clientY - rect.top) / 33);
      
      const shipData = window.currentDragShip;
      if (shipData) {
        this.showPreview(x, y, shipData.length, getDirection(), null, placedCells);
      }
    };
    
    this.playerBoardEl.ondragleave = () => {
      this.clearPreview();
    };
    
    this.playerBoardEl.ondrop = (e) => {
      e.preventDefault();
      const rect = this.playerBoardEl.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / 33);
      const y = Math.floor((e.clientY - rect.top) / 33);
      window.dispatchEvent(new CustomEvent('dropShip', { 
        detail: { x, y } 
      }));
    };
    
    this.playerBoardEl.oncontextmenu = (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('rotateShip'));
    };
    
    const cells = this.playerBoardEl.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
      cell.onclick = () => {
        const x = index % 10;
        const y = Math.floor(index / 10);
        window.dispatchEvent(new CustomEvent('clickBoard', { detail: { x, y } }));
      };
      
      cell.onmouseenter = () => {
        const shipData = window.currentDragShip;
        if (shipData) {
          const x = index % 10;
          const y = Math.floor(index / 10);
          this.showPreview(x, y, shipData.length, getDirection(), null, placedCells);
        }
      };
      
      cell.onmouseleave = () => {
        this.clearPreview();
      };
    });
  }

  showModeSelect() {
    this.modeSelectEl.style.display = 'block';
    this.passScreenEl.style.display = 'none';
    this.placementPanel.style.display = 'none';
    this.gameContainer.style.display = 'none';
  }

  showPassScreen(message) {
    this.modeSelectEl.style.display = 'none';
    this.passScreenEl.style.display = 'block';
    this.passMessageEl.textContent = message;
    this.placementPanel.style.display = 'none';
    this.gameContainer.style.display = 'none';
  }

  showPlacement(title, showDone = false) {
    this.modeSelectEl.style.display = 'none';
    this.passScreenEl.style.display = 'none';
    this.placementPanel.style.display = 'block';
    this.gameContainer.style.display = 'none';
    this.placementTitleEl.textContent = title;
    this.doneBtn.style.display = showDone ? 'inline-block' : 'none';
  }

  showGame(playerLabel, enemyLabel) {
    this.modeSelectEl.style.display = 'none';
    this.passScreenEl.style.display = 'none';
    this.placementPanel.style.display = 'none';
    this.gameContainer.style.display = 'flex';
    this.playerLabelEl.textContent = playerLabel;
    this.enemyLabelEl.textContent = enemyLabel;
  }

  clearBoards() {
    this.playerBoardEl.innerHTML = '';
    this.playerBoardGameEl.innerHTML = '';
    this.enemyBoardEl.innerHTML = '';
  }

  updateStatus(msg) {
    this.statusEl.textContent = msg;
  }

  setResetHandler(handler) {
    this.resetBtn.onclick = handler;
  }

  setAttackHandler(handler) {
    window.removeEventListener('attack', this.attackHandler);
    this.attackHandler = (e) => handler(e.detail.x, e.detail.y);
    window.addEventListener('attack', this.attackHandler);
  }

  setDropShipHandler(handler) {
    window.addEventListener('dropShip', (e) => handler(e.detail));
  }

  setClickBoardHandler(handler) {
    window.addEventListener('clickBoard', (e) => handler(e.detail));
  }

  setRotateHandler(handler) {
    window.addEventListener('rotateShip', handler);
  }
}
