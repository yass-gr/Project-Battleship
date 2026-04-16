export default class Ship {
  constructor(length, name = 'Ship') {
    this.length = length;
    this.name = name;
    this.hits = 0;
  }
  isSunk() {
    return this.length === this.hits ? true : false;
  }
  hit() {
    if (this.hits + 1 <= this.length) {
      this.hits++;
    }
  }
}
