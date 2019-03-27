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

    getNeighbors(coord: Coordinate) {
        const isFirstRow = this.isFirstRow(coord);
        const isFirstColumn = this.isFirstColumn(coord);
        const isLastRow = this.isLastRow(coord);
        const isLastColumn = this.isLastColumn(coord);
        const neighbors = [] as Coordinate[];
        const [x, y] = coord;

        // neighbors.push([x, y]);

        // add north
        if (!isFirstRow && !this.hasObstacle([x, y - 1])) {
            neighbors.push([x, y - 1]);
        }

        // add south
        if (!isLastRow && !this.hasObstacle([x, y + 1])) {
            neighbors.push([x, y + 1]);
        }

        // add east
        if (!isLastColumn && !this.hasObstacle([x + 1, y])) {
            neighbors.push([x + 1, y]);
        }

        // add west
        if (!isFirstColumn && !this.hasObstacle([x - 1, y])) {
            neighbors.push([x - 1, y]);
        }

        return neighbors;
    }

     /**
     * Returns the actual obstacle sensor readings from the environment
     * @param coordinate The location on the grid
     */
     getTrueEnvironmentSensorReading(coordinate: Coordinate) {
        const [x, y] = coordinate;
        const sensorReading = { north: false, south: false, east: false, west: false };
        if (this.isFirstColumn(coordinate) || this.hasObstacle([x - 1, y])) {
            sensorReading.west = true;
        }

        if (this.isLastColumn(coordinate) || this.hasObstacle([x + 1, y])) {
            sensorReading.east = true;
        }

        if (this.isFirstRow(coordinate) || this.hasObstacle([x, y - 1])) {
            sensorReading.north = true;
        }

        if (this.isLastRow(coordinate) || this.hasObstacle([x, y + 1])) {
            sensorReading.south = true;
        }
        return sensorReading;
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
