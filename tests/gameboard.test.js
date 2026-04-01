import GameBoard from "../src/gameBoard.js";
import Ship from "../src/ship.js";

describe("gameBoard tests", () => {
  let board;
  beforeEach(() => {
    board = new GameBoard();
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
    board.addShip([2, 1], [4, 1], "h");
    expect(board.ships.pop()).toEqual(new Ship(3));
    expect(board.board).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, "0", "0", "0", null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });

  test("recive attack on a ship", () => {
    board.addShip([2, 1], [4, 1], "h");
    board.reciveAttack([2, 1]);

    expect(board.board).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, "0(hit)", "0", "0", null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);

    expect(board.ships[0].hits).toEqual(1);
  });

  test("recive attack on a empty square", () => {
    board.addShip([2, 1], [4, 1], "h");
    board.reciveAttack([0, 0]);

    expect(board.board).toEqual([
      ["(miss)", null, null, null, null, null, null, null, null, null],
      [null, null, "0", "0", "0", null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });

  test("check if all ships are sunk", () => {
    board.addShip([2, 1], [4, 1], "h");
    board.reciveAttack([2, 1]);
    board.reciveAttack([3, 1]);
    board.reciveAttack([4, 1]);

    expect(board.isAllSunk()).toEqual(true);
  });
});
