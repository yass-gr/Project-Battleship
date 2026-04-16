import GameBoard from "./gameBoard.js";

export default class Player {
  constructor(type) {
    this.type = type;
    this.gameBoard = new GameBoard();
  }
}