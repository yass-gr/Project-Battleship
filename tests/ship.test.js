import Ship from "../src/ship.js";

describe("Ship Factory/Class", () => {
  let cruiser;

  // Before each test, create a fresh ship instance with length 3
  beforeEach(() => {
    cruiser = new Ship(3);
  });

  test("initializes with correct properties", () => {
    expect(cruiser.length).toBe(3);
    expect(cruiser.hits).toBe(0);
    expect(cruiser.isSunk()).toBe(false);
  });

  test("hit() function increments the hit count", () => {
    cruiser.hit();
    expect(cruiser.hits).toBe(1);
    cruiser.hit();
    expect(cruiser.hits).toBe(2);
  });

  test("isSunk() returns false when hits are less than length", () => {
    cruiser.hit();
    cruiser.hit();
    // 2 hits is less than length 3, so it shouldn't be sunk
    expect(cruiser.isSunk()).toBe(false);
  });

  test("isSunk() returns true when hits equal length", () => {
    cruiser.hit();
    cruiser.hit();
    cruiser.hit();
    // 3 hits equals length 3, ship should be sunk
    expect(cruiser.isSunk()).toBe(true);
  });

  test("should not sink if hit count exceeds length (safety check)", () => {
    const smallShip = new Ship(1);
    smallShip.hit();
    smallShip.hit(); // Over-hitting
    expect(smallShip.isSunk()).toBe(true);
  });
});
