import { EventEmitter } from "node:events";
import type { APIRoute } from "astro";

export enum MazeSpot {
  Mouse = "🐁",
  Blank = " ",
  Cheese = "🧀",
  Wall = "⬛",
  Key = "🗝️",
  Door = "🚪",
}

export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

export const emitter = new EventEmitter();
export const encoder = new TextEncoder();

export let currentMaze: MazeSpot[][] = [];
let currentMouseSpot: [number, number] = [0, 0];

export const generateMaze = () => {
  const width = 9;
  const height = 9;

  // initialize everything as walls
  currentMaze = Array.from({ length: height }, () => Array.from({ length: width }, () => MazeSpot.Wall));

  const inBounds = (x: number, y: number) => x > 0 && x < width - 1 && y > 0 && y < height - 1;

  const isBlank = (x: number, y: number) => inBounds(x, y) && currentMaze[y][x] == MazeSpot.Blank;

  const directions: [number, number][] = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

  // recursive backtracker
  const carve = (x: number, y: number) => {
    currentMaze[y][x] = MazeSpot.Blank;

    for (const [dx, dy] of shuffle([...directions])) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;

      if (inBounds(nx, ny) && currentMaze[ny][nx] === MazeSpot.Wall) {
        currentMaze[y + dy][x + dx] = MazeSpot.Blank;
        carve(nx, ny);
      }
    }
  };

  // "walks" away from a coordinate
  const walk = (x: number, y: number, n: number = 10) => {
    let walkPosition = [x, y];

    for (let steps = n; steps > 0; steps--) {
      for (const [dx, dy] of shuffle([...directions])) {
        let [cx, cy] = walkPosition;
        if (isBlank(cx + dx, cy + dy)) {
          walkPosition = [cx + dx, cy + dy];
          break;
        }
      }
    }

    return walkPosition;
  };

  // start carving from a fixed point
  carve(1, 1);

  const randomBlank = (): [number, number] => {
    let x = 0,
      y = 0;
    do {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
    } while (currentMaze[y][x] !== MazeSpot.Blank);
    return [x, y];
  };

  // place mouse
  {
    const [x, y] = randomBlank();
    currentMaze[y][x] = MazeSpot.Mouse;
    currentMouseSpot = [x, y];
  }

  let [mx, my] = currentMouseSpot;

  // place cheese
  {
    const [x, y] = walk(mx, my, 50);
    currentMaze[y][x] = MazeSpot.Cheese;
  }

  const numDoors = Math.floor(Math.random() * 4);

  // place door(s) (must be done before placing key!!!)
  for (let i = numDoors; i > 0; i--) {
    const [x, y] = walk(mx, my, 40);
    if (mx === x && my === y) {
      continue;
    }
    currentMaze[y][x] = MazeSpot.Door;
  }

  // place key
  if (numDoors > 0) {
    const [x, y] = walk(mx, my);
    // if we cannot find a spot for the key, blow up the doors!
    if (mx === x && my === y) {
      currentMaze = currentMaze.map((row) => row.map((spot) => (spot == MazeSpot.Door ? MazeSpot.Blank : spot)));
    } else {
      currentMaze[y][x] = MazeSpot.Key;
    }
  }

  emitter.emit("maze_update");
};

export const mouseMove = (direction: Direction) => {
  let coordOffsets = {
    [Direction.Up]: [0, -1],
    [Direction.Down]: [0, 1],
    [Direction.Left]: [-1, 0],
    [Direction.Right]: [1, 0],
  };

  if (!(direction in coordOffsets)) {
    return;
  }

  let [offsetX, offsetY] = coordOffsets[direction];
  let [currentX, currentY] = currentMouseSpot;

  let [newX, newY] = [currentX + offsetX, currentY + offsetY];

  // handle the literal edge cases
  if (newX < 0 || newX >= 9 || newY < 0 || newY >= 9) {
    return;
  }

  // handle walls and doors
  if (currentMaze[newY][newX] == MazeSpot.Wall || currentMaze[newY][newX] == MazeSpot.Door) {
    return;
  }

  // handle keys
  if (currentMaze[newY][newX] == MazeSpot.Key) {
    currentMaze = currentMaze.map((row) => row.map((spot) => (spot == MazeSpot.Door ? MazeSpot.Blank : spot)));
  }

  // handle the win condition
  if (currentMaze[newY][newX] == MazeSpot.Cheese) {
    generateMaze(); // emits "maze_update" by itself.
    return;
  }

  currentMaze[currentY][currentX] = MazeSpot.Blank;
  currentMaze[newY][newX] = MazeSpot.Mouse;

  currentMouseSpot = [newX, newY];

  emitter.emit("maze_update", currentMaze);
};

// if we don't have a maze, make one!
if (currentMaze.length == 0) generateMaze();

export const GET: APIRoute = async () => {
  let update_callback: () => any;

  const customReadable = new ReadableStream({
    start(controller) {
      update_callback = () => {
        controller.enqueue(encoder.encode(`event: maze_update\ndata: none\n\n`));
      };

      emitter.on("maze_update", update_callback);
    },

    cancel() {
      emitter.off("maze_update", update_callback);
    },
  });

  return new Response(customReadable, {
    headers: {
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
};
