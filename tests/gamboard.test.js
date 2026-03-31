import GameBoard from "../src/GameBoard.js";

describe("gameBoard tests", () => {
  beforeEach(() => {
    const board = new GameBoard();
  });

  test("starting board to be empty", () => {
    expect(board.board).toEqual(
      Array.from({ length: 10 }, () => Array(10).fill(null)),
    );
  });

  test("ship's list is empty at start", () => {
    expect(board.ships).toEqual([]);
  });

  test("adding shipts to the board using cordinates", () => {
    expect(board.board).toEqual(
      Array.from({ length: 10 }, () => Array(10).fill(null)),
    );
  });
});
