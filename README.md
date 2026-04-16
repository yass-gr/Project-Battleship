# Battleship Game

A browser-based Battleship game built as a learning project to practice JavaScript, DOM manipulation, and game logic.

## Overview

This is a classic Battleship game where you place ships on a grid and try to sink your opponent's fleet before they sink yours. The game features both single-player (vs Computer) and two-player local modes.

## Features

### Game Modes

- **vs Computer**: Play against an AI with hunt/target mode logic
- **vs Player**: Local two-player mode with pass-and-play mechanics

### Ship Placement

- **Drag & Drop**: Drag ships from the dock onto your board
- **Click to Place**: Click a ship, then click a cell on the board
- **Random Placement**: One-click auto-placement for all ships
- **Rotation**: Press `R` or right-click to rotate ship direction

### Gameplay

- 10x10 grid boards
- 4 ships per player: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- Real-time feedback for hits and misses
- Turn-based attacking system
- Win/lose detection

### UI Features

- Dark/Light mode toggle (persisted to localStorage)
- Responsive design for mobile
- Minimalist flat design

## Learning Concepts

This project demonstrates:

### JavaScript

- ES6 Classes and modules
- Event-driven programming with CustomEvents
- State management
- Drag and Drop API
- LocalStorage for preferences

### DOM Manipulation

- Dynamic element creation
- Event listeners and delegation
- CSS class toggling
- Grid rendering

### Game Logic

- Coordinate systems
- Hit detection
- Ship placement validation
- Win condition checking
- AI targeting (hunt/target mode)

### CSS

- CSS Variables for theming
- Flexbox and Grid layouts
- Responsive design
- Dark/light mode switching

## How to Play

1. **Select Mode**: Choose "vs Computer" or "vs Player"
2. **Place Ships**: Drag or click ships onto your board
3. **Attack**: Click cells on the enemy board to fire
4. **Win**: Sink all enemy ships first

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── index.html      # Main HTML structure
├── index.js        # Game logic and state
├── domManager.js   # DOM manipulation utilities
├── player.js       # Player class
├── gameBoard.js    # Board logic and ship management
├── ship.js         # Ship class
└── style.css       # Styles
```

Built as a learning exercise in game development with vanilla JavaScript.
