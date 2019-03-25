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

    get occupiableCoordinates() {
        const coords = [];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const coordinate = [col, row] as Coordinate;
                if (!this.hasObstacle(coordinate)) {
                    coords.push(coordinate);
                }
            }
        }

        return coords;
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

    isFirstRow([_, y]: Coordinate) {
        return y === 0;
    }

    isLastRow([_, y]: Coordinate) {
        return y === this.rows - 1;
    }

    isFirstColumn([x, _]: Coordinate) {
        return x === 0;
    }

    isLastColumn([x, _]: Coordinate) {
        return x === this.columns - 1;
    }
}
