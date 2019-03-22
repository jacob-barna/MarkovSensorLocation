import { Coordinate } from './models/coordinate';

export class Grid {
    get columns() {
        return this._columns;
    }

    get rows() {
        return this._rows;
    }

    get obstacles() {
        return this._obstacles;
    }

    private readonly _columns: number;
    private readonly _rows: number;
    private readonly _obstacles: Coordinate[];

    constructor(columns: number, rows: number, obstacles: Coordinate[]) {
        this._columns = columns;
        this._rows = rows;
        this._obstacles = obstacles;
    }

    hasObstacle([x, y]: Coordinate) {
        return (this._obstacles.some(([xpos, ypos]) => x === xpos && y === ypos));
    }
}
