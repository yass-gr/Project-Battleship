import Ship from "./ship.js";

export default class GameBoard {
  constructor() {
    this.board = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
  }

  addShip(startCord, endCord, direction) {
    let shipLength;
    if (direction === "h") {
      shipLength = endCord[0] - startCord[0] + 1;
      this.ships.push(new Ship(shipLength));
      for (let i = startCord[0]; i < startCord[0] + shipLength; i++) {
        this.board[startCord[1]][i] = String(this.ships.length - 1);
      }
    } else if (direction === "v") {
      shipLength = endCord[1] - startCord[1] + 1;
      this.ships.push(new Ship(shipLength));
      for (let i = startCord[1]; i < startCord[1] + shipLength; i++) {
        this.board[i][startCord[0]] = String(this.ships.length - 1);
      }
    }
  }

  reciveAttack(cords) {
    let rowIndex = cords[1];
    let colIndex = cords[0];
    let square = this.board[rowIndex][colIndex];
    if (square === null) {
      this.board[rowIndex][colIndex] = "(miss)";
    } else {
      this.ships[parseInt(square)].hit();
      this.board[rowIndex][colIndex] += "(hit)";
    }
  }

  isAllSunk() {
    return this.ships.every((s) => s.isSunk());
  }
}

let b = new GameBoard();

b.addShip([2, 1], [4, 1], "h");
b.reciveAttack([0, 0]);
console.log(b.board);
