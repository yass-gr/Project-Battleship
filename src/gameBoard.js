import Ship from "./ship.js";

export default class GameBoard {
  constructor() {
    this.board = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
  }

  addShip(startCord, endCord, direction) {
    if (startCord[0] < 0 || startCord[0] > 9) return false;
    if (startCord[1] < 0 || startCord[1] > 9) return false;
    if (endCord[0] < 0 || endCord[0] > 9) return false;
    if (endCord[1] < 0 || endCord[1] > 9) return false;

    let shipLength;
    if (direction === "h") {
      shipLength = endCord[0] - startCord[0] + 1;
      for (let i = startCord[0]; i < startCord[0] + shipLength; i++) {
        if (this.board[startCord[1]][i] !== null) return false;
      }

      this.ships.push(new Ship(shipLength));

      for (let i = startCord[0]; i < startCord[0] + shipLength; i++) {
        this.board[startCord[1]][i] = String(this.ships.length - 1);
      }
    } else if (direction === "v") {
      shipLength = endCord[1] - startCord[1] + 1;
      for (let i = startCord[1]; i < startCord[1] + shipLength; i++) {
        if (this.board[i][startCord[0]] !== null) return false;
      }

      this.ships.push(new Ship(shipLength));

      for (let i = startCord[1]; i < startCord[1] + shipLength; i++) {
        this.board[i][startCord[0]] = String(this.ships.length - 1);
      }
    }
    return true;
  }

  reciveAttack(cords) {
    let rowIndex = cords[1];
    let colIndex = cords[0];
    let square = this.board[rowIndex][colIndex];
    if (square === null) {
      this.board[rowIndex][colIndex] = "(miss)";
    } else {
      if (square === "(miss)") return;
      if (square.length > 2) return;
      this.ships[parseInt(square)].hit();
      this.board[rowIndex][colIndex] += "(hit)";
    }
  }

  isAllSunk() {
    return this.ships.every((s) => s.isSunk());
  }

  getShipAt(cords) {
    const rowIndex = cords[1];
    const colIndex = cords[0];
    const square = this.board[rowIndex][colIndex];
    if (square === null || square.length > 2) return null;
    return this.ships[parseInt(square)];
  }

  isOverlapping() {}
}
