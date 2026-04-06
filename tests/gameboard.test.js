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

  test("adding ship vertically", () => {
    board.addShip([1, 2], [1, 4], "v");
    expect(board.ships.pop()).toEqual(new Ship(3));
    expect(board.board).toEqual([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, "0", null, null, null, null, null, null, null, null],
      [null, "0", null, null, null, null, null, null, null, null],
      [null, "0", null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ]);
  });

  test("adding multiple ships", () => {
    board.addShip([0, 0], [0, 2], "h");
    board.addShip([5, 5], [5, 8], "h");
    expect(board.ships.length).toEqual(2);
  });

  test("ship placement out of bounds returns false", () => {
    const result = board.addShip([9, 0], [9, 10], "h");
    expect(result).toEqual(false);
  });

  test("overlapping ship placement returns false", () => {
    board.addShip([2, 2], [2, 4], "h");
    const result = board.addShip([2, 3], [2, 5], "h");
    expect(result).toEqual(false);
  });

  test("attack on already attacked square does nothing", () => {
    board.addShip([2, 1], [4, 1], "h");
    board.reciveAttack([2, 1]);
    board.reciveAttack([2, 1]);
    expect(board.ships[0].hits).toEqual(1);
  });

  test("attack on empty square marks as miss", () => {
    board.reciveAttack([5, 5]);
    expect(board.board[5][5]).toContain("miss");
  });

  test("not all ships sunk when one remains", () => {
    board.addShip([0, 0], [0, 2], "h");
    board.addShip([5, 0], [5, 3], "h");
    board.reciveAttack([0, 0]);
    board.reciveAttack([0, 1]);
    board.reciveAttack([0, 2]);
    expect(board.isAllSunk()).toEqual(false);
  });

  test("all ships sunk with multiple ships", () => {
    board.addShip([0, 0], [0, 2], "h");
    board.addShip([5, 0], [5, 3], "h");
    board.reciveAttack([0, 0]);
    board.reciveAttack([0, 1]);
    board.reciveAttack([0, 2]);
    board.reciveAttack([5, 0]);
    board.reciveAttack([5, 1]);
    board.reciveAttack([5, 2]);
    board.reciveAttack([5, 3]);
    expect(board.isAllSunk()).toEqual(true);
  });

  test("ship sunk after all positions hit", () => {
    board.addShip([1, 1], [1, 1], "h");
    expect(board.ships[0].isSunk()).toEqual(false);
    board.reciveAttack([1, 1]);
    expect(board.ships[0].isSunk()).toEqual(true);
  });

  test("ship with different length", () => {
    board.addShip([0, 0], [0, 4], "h");
    expect(board.ships[0].length).toEqual(5);
  });

  test("mixed horizontal and vertical ships", () => {
    board.addShip([0, 0], [0, 3], "h");
    board.addShip([5, 0], [7, 0], "v");
    expect(board.ships.length).toEqual(2);
    expect(board.board[0][0]).toEqual("0");
    expect(board.board[7][0]).toEqual("0");
  });

  test("get ship at position", () => {
    board.addShip([2, 2], [4, 2], "h");
    const ship = board.getShipAt([3, 2]);
    expect(ship).toBeDefined();
    expect(ship.length).toEqual(3);
  });

  test("no ship at empty position", () => {
    board.addShip([2, 2], [4, 2], "h");
    const ship = board.getShipAt([0, 0]);
    expect(ship).toEqual(null);
  });
});
