import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { BeliefState } from '../models/belief-state';
import { Coordinate } from '../models/coordinate';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { CoordinateMapping } from '../models/coordinate-mapping';
import { Agent } from '../agent';
import { Grid } from '../grid';
import { SensorReading } from '../models/sensor-reading';
import { Direction } from '../models/direction';


@Component({
  selector: 'app-belief-state-grid',
  templateUrl: './belief-state-grid.component.html',
  styleUrls: ['./belief-state-grid.component.css']
})
export class BeliefStateGridComponent implements OnInit {
  @ViewChild('agentBeliefState') beliefStateRef: ElementRef;
  simulationDataString = '';
  // todo: clean this up, make it a real component... use getters / setters or @Input where applicable,
  // #region public properties
  browserOffset = 8;
  boxWidthPixels = 50;
  boxHeightPixels = 50;
  directionUp = Direction.Up;
  directionLeft = Direction.Left;
  directionRight = Direction.Right;
  directionDown = Direction.Down;
  grid: Grid;
  lineWidthPixels = 2;
  percepts: SensorReading[] = [];
  perceivedLocation: Coordinate;
  obstacleLocations: Coordinate[] = [[0, 1], [0, 2], [1, 1], [2, 3],
  [4, 0], [4, 1], [4, 2], [6, 1],
  [6, 2], [6, 3], [7, 1], [7, 2],
  [9, 1], [10, 0], [11, 1], [11, 3],
  [13, 1], [13, 2], [14, 0], [14, 1],
  [14, 2], [15, 1]];
  //obstacleLocations: Coordinate[] = [];
  startXCoordinate = 25;
  startYCoordinate = 25;
  title = '';

  agentCurrentPosition: Array<Coordinate> = [];
  timeSlice = 0;
  // #endregion

  // #region private properties
  private agent: Agent;
  private $mouseMoveEvents: Subject<CoordinateMapping> = new Subject<CoordinateMapping>();
  private beliefState: Array<BeliefState[]>;  // = [
  private ctx: CanvasRenderingContext2D;
  private gridCells: CoordinateMapping[] = [];
   simulationData = [];
  // #endregion


  constructor() { }

  isOpenCoordinate(direction: Direction) {
    const [x, y] = this.getMoveCoordinate(direction, this.agentCurrentPosition[this.timeSlice]);
    return this.grid.occupiableCoordinates.some(([xpos, ypos]) => x === xpos && y === ypos);
  }

  move(direction: Direction = null) {
    let [x, y] = this.agentCurrentPosition[this.timeSlice];

    if (typeof direction !== undefined && direction != null && this.isOpenCoordinate(direction)) {
      [x, y] = this.getMoveCoordinate(direction, this.agentCurrentPosition[this.timeSlice]);
    }

    this.timeSlice++;
    this.agentCurrentPosition[this.timeSlice] = [x, y];
    this.percepts.push(this.agent.getPercept(this.agentCurrentPosition[this.timeSlice]));
    this.agent.update(this.percepts[this.timeSlice]);
    this.beliefState.push(this.agent.beliefState);
    this.updatePerceivedLocation();
    this.drawGrid();

    this.simulationData.push(this.getManhattanDistance(this.perceivedLocation, this.agentCurrentPosition[this.timeSlice]));
  }

  updatePerceivedLocation() {
    const highestProbability = Math.max(...this.beliefState[this.timeSlice].map(b => b.probability));
    // get the first with that probability (no tie breakers or random choice)
    const perceivedLocation = this.beliefState[this.timeSlice].find(b => b.probability === highestProbability);
    this.perceivedLocation = perceivedLocation ? perceivedLocation.coordinate : undefined;
  }

  // if perceived location p=(p1,p2) and the true location is point q=(q1,q2),
  // then the localization error is defined as: |p1−𝑞1|+|𝑝2−𝑞2|.
  getManhattanDistance(perceivedCoord: Coordinate, trueCoord: Coordinate) {
    const [p1, p2] = perceivedCoord;
    const [q1, q2] = trueCoord;

    return Math.abs(p1 - q1) + Math.abs(p2 - q2);
  }

  ngOnInit() {
    this.percepts.push(null); // percepts do not begin until timeslice 1
    this.agentCurrentPosition.push([0, 0]);
    // this.grid = new Grid(64, 1, this.obstacleLocations);
    this.grid = new Grid(16, 4, this.obstacleLocations);
    this.agent = new Agent(0.20, this.grid);
    this.beliefState = [];
    this.beliefState.push(this.agent.beliefState);
    this.drawGrid();

    this.$mouseMoveEvents.pipe(
      filter((mapping) => {
        if (!mapping || !mapping.gridCoordinate) {
          return false;
        }

        const [x, y] = mapping.gridCoordinate;
        return x < this.grid.columns && y < this.grid.rows;
      }),
      distinctUntilChanged((mapping1, mapping2) => {
        const [x, y] = mapping1.gridCoordinate;
        const [x2, y2] = mapping2.gridCoordinate;
        return x === x2 && y === y2;
      })
      ).subscribe(mapping => {
        this.displayTooltip(mapping.gridCoordinate);
    });
  }

  onMouseMove(event: MouseEvent) {
    this.$mouseMoveEvents.next({gridCoordinate: this.getCoordinateFromMousePosition(event.clientX, event.clientY),
       mouseCoordinate: [event.clientX, event.clientY]});
  }

  /** move 40 times, record the localization error at each step.  Average localization error at each step over 400 runs */
  runSimulation() {
      this.simulationData = [];
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionLeft);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionRight);
      this.move(this.directionLeft);

      // simulation 1
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionDown);
      // this.move(this.directionDown);
      // this.move(this.directionDown);
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionUp);
      // this.move(this.directionUp);
      // this.move(this.directionUp);
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionDown);
      // this.move(this.directionDown);
      // this.move(this.directionDown);
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionUp);
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionDown);
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionRight);
      // this.move(this.directionUp);
      // this.move(this.directionDown);
      // this.move(this.directionLeft);
      // this.move(this.directionLeft);
      // this.move(this.directionLeft);
      // this.move(this.directionUp);
      // this.move(this.directionUp);
      // this.move(this.directionUp);
      // this.move(this.directionRight);
      // this.move(this.directionLeft);
      // this.move(this.directionDown);
      // this.move(this.directionDown);
      // this.move(this.directionLeft);
      // this.move(this.directionLeft);

    // console.log(this.simulationData);
    // for (let j = 0; j < this.simulationData.length; j++) {
    //   this.simulationDataString += this.simulationData[j] ;
    // }
  }

  private addBeliefState(ctx: CanvasRenderingContext2D, coord: Coordinate) {
    const [x, y] = coord;

    const beliefState = this.getBeliefState(coord);

    if (beliefState) {
      ctx.fillStyle = 'black';
      const arcCenterX = this.startXCoordinate + x * this.boxWidthPixels + 25;
      const arcCenterY = this.startYCoordinate + y * this.boxHeightPixels + 25;
      ctx.moveTo(arcCenterX, arcCenterY);
      ctx.arc(arcCenterX, arcCenterY, this.getArcRadius(beliefState.probability), 0, 360);
      ctx.fill();
    }
  }

  private addObstacle(ctx: CanvasRenderingContext2D, coord: Coordinate) {
    const [x, y] = coord;

    if (this.obstacleLocations.some(([xpos, ypos]) => x === xpos && y === ypos)) {
      ctx.fillStyle = 'grey';
      ctx.fillRect(
        this.startXCoordinate + this.lineWidthPixels / 2 + x * this.boxWidthPixels,
        this.startYCoordinate + this.lineWidthPixels / 2 + y * this.boxWidthPixels,
        this.boxWidthPixels - this.lineWidthPixels,
        this.boxHeightPixels - this.lineWidthPixels);
    }
  }

  /** Does not work unless the scrollbar is at the top */
  private displayTooltip(gridCoordinate: Coordinate) {
    if (!gridCoordinate) {
      return;
    }

    const beliefState = this.getBeliefState(gridCoordinate);
    const [x, y] = gridCoordinate;

    if (beliefState) {
      this.title = `[${x}, ${y}]: ${(beliefState.probability * 100).toString()}%`;
    } else {
      this.title = `[${x}, ${y}]: 0%`;
    }
  }

  private drawGrid() {
    this.ctx = this.beliefStateRef.nativeElement.getContext('2d');
    const gridWidth = this.startXCoordinate + this.grid.columns * this.boxWidthPixels + this.lineWidthPixels;
    const gridHeight = this.startYCoordinate + this.grid.rows * this.boxHeightPixels + this.lineWidthPixels;
    this.ctx.canvas.width = gridWidth;
    this.ctx.canvas.height = gridHeight;
    this.ctx.canvas.style.width = gridWidth.toString();
    this.ctx.canvas.style.height = gridHeight.toString();

    this.ctx.lineWidth = 2;
    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.columns; col++) {
        const x = this.startXCoordinate + col * this.boxWidthPixels;
        const y = this.startYCoordinate + row * this.boxWidthPixels;

        // current (real) coordinate of the agent outlined in yellow
       this.checkAndMarkRealPosition([col, row]);

        this.ctx.strokeRect(
          x,
          y,
          this.boxWidthPixels,
          this.boxHeightPixels);

          this.addBeliefState(this.ctx, [col, row]);
          this.addObstacle(this.ctx, [col, row]);

          // locations of each cell
          this.gridCells.push({gridCoordinate: [col, row], mouseCoordinate: [x, y]});
      }
    }
  }

  private checkAndMarkRealPosition([col, row]: Coordinate) {
    const [currentCol, currentRow] = this.agentCurrentPosition[this.timeSlice];
    if (currentCol === col && currentRow === row) {
      this.markRealPosition([col, row]);
    }
  }

  private getArcRadius(probability: number) {
    if (probability === 0) {
      return 0;
    } else if (probability <= .01) {
      return 2;
    } else if (probability <= .03) {
      return 3;
    } else if (probability <= .05) {
      return 5;
    } else if (probability <= .07) {
      return 7;
    } else if (probability <= .10) {
      return 9;
    } else if (probability <= .25) {
      return 11;
    } else if (probability <= .6) {
      return 13;
    } else if (probability <= .80) {
      return 15;
    } else {
      return 16;
    }
  }

  private getBeliefState([x, y]: Coordinate) {
    return this.beliefState[this.timeSlice].find(item => {
      const [xpos, ypos] = item.coordinate;
      return x === xpos && y === ypos;
    });
  }

  /** Note: this only works if the grid is at the top, no scroll, etc. "good enough" to gather results. */
  private getCoordinateFromMousePosition(x: number, y: number): Coordinate {
    const cell = this.gridCells.find((mapping) => {
      const [mouseX, mouseY] = mapping.mouseCoordinate;
      return x >= mouseX && x <= mouseX + this.boxWidthPixels + 8 && y >= mouseY && y <= mouseY + this.boxHeightPixels + this.browserOffset;
    });

    return cell ? cell.gridCoordinate : undefined;
  }

  private getMoveCoordinate(direction: Direction, [x, y]: Coordinate) {
    if (direction === Direction.Up) {
      y--;
    } else if (direction === Direction.Down) {
      y++;
    } else if (direction === Direction.Left) {
      x--;
    } else {
      x++;
    }

    return [x, y];
  }

  private markRealPosition([col, row]: Coordinate) {
    this.ctx.fillStyle = 'yellow';
    this.ctx.fillRect(
      this.startXCoordinate + this.lineWidthPixels / 2 + col * this.boxWidthPixels,
      this.startYCoordinate + this.lineWidthPixels / 2 + row * this.boxWidthPixels,
      this.boxWidthPixels - this.lineWidthPixels,
      this.boxHeightPixels - this.lineWidthPixels);
  }
}
