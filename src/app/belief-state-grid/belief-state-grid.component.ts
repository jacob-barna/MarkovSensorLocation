import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { BeliefState } from '../models/belief-state';
import { Coordinate } from '../models/coordinate';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { CoordinateMapping } from '../models/coordinate-mapping';
import { Agent } from '../agent';
import { Grid } from '../grid';
import { SensorReading } from '../models/sensor-reading';


@Component({
  selector: 'app-belief-state-grid',
  templateUrl: './belief-state-grid.component.html',
  styleUrls: ['./belief-state-grid.component.css']
})
export class BeliefStateGridComponent implements OnInit {
  @ViewChild('agentBeliefState') beliefStateRef: ElementRef;

  // todo: clean this up, make it a real component... use getters / setters or @Input where applicable,
  // #region public properties
  browserOffset = 8;
  boxWidthPixels = 50;
  boxHeightPixels = 50;
  // columns = 16;
  lineWidthPixels = 2;
  // numberOfObstacles = 22;
  obstacleLocations: Coordinate[] = [[0, 1], [0, 2], [1, 1], [2, 3],
  [4, 0], [4, 1], [4, 2], [6, 1],
  [6, 2], [6, 3], [7, 1], [7, 2],
  [9, 1], [10, 0], [11, 1], [11, 3],
  [13, 1], [13, 2], [14, 0], [14, 1],
  [14, 2], [15, 1]];
  // rows = 4;
  startXCoordinate = 25;
  startYCoordinate = 25;
  title = '';

  agentCurrentPosition = [0, 0];
  timeSlice = 0;
  // #endregion

  // todo: standardize on private variables having prefix _
  // #region private properties
  private agent: Agent;
  private $mouseMoveEvents: Subject<CoordinateMapping> = new Subject<CoordinateMapping>();
  private beliefState: BeliefState[];
  // = [
  //   {coordinate: [1, 0], probability: 81},
  //   {coordinate: [2, 0], probability: 61},
  //   {coordinate: [3, 0], probability: 41},
  //   {coordinate: [5, 0], probability: 21},
  //   {coordinate: [6, 0], probability: 1},
  //   {coordinate: [7, 0], probability: 0}];
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private gridCells: CoordinateMapping[] = [];
  // #endregion


  // todo: temporary testing variable, remove
  private counter = 0;

  constructor() { }

  // todo: after testing, remove iterate() method and finish implementation for getPreceptAndUpdateBeliefState
  // getPreceptAndUpdateBeliefState() {
  //   const precept = this.agent.getPrecept();
  //   return
  // }

  // todo: remove after model testing is complete
  iterate() {
    if (++this.counter === 1) {
      this.agent.update(this.agent.beliefState, { north: true, south: true, east: false, west: true } as SensorReading);
      this.beliefState = this.agent.beliefState;
    }  else if (++this.counter === 2) {
      this.agent.update(this.agent.beliefState, { north: true, south: true, east: false, west: false } as SensorReading);
      this.beliefState = this.agent.beliefState;
    }
    // todo: when done testing, replace hardcoded percept with random
    // this.beliefState = this.agent.update(this.agent.beliefState, this.agent.getPercept());
  }

  ngOnInit() {
    this.grid = new Grid(16, 4, this.obstacleLocations);
    this.agent = new Agent(0.20, this.grid);
    this.beliefState = this.agent.beliefState;
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

  private displayTooltip(gridCoordinate: Coordinate) {
    if (!gridCoordinate) {
      return;
    }

    const beliefState = this.getBeliefState(gridCoordinate);
    const [x, y] = gridCoordinate;

    if (beliefState) {
      this.title = `[${x}, ${y}]: ${beliefState.probability.toString()}%`;
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
    const [currentCol, currentRow] = this.agentCurrentPosition;
    if (currentCol === col && currentRow === row) {
      this.ctx.fillStyle = 'yellow';
      this.ctx.fillRect(
        this.startXCoordinate + this.lineWidthPixels / 2 + col * this.boxWidthPixels,
        this.startYCoordinate + this.lineWidthPixels / 2 + row * this.boxWidthPixels,
        this.boxWidthPixels - this.lineWidthPixels,
        this.boxHeightPixels - this.lineWidthPixels);
    }
  }

  private getArcRadius(probability: number) {
    if (probability === 0) {
      return 0;
    } else if (probability <= 20) {
      return 4;
    } else if (probability <= 40) {
      return 7;
    } else if (probability <= 60) {
      return 10;
    } else if (probability <= 80) {
      return 13;
    } else {
      return 16;
    }
  }

  private getBeliefState([x, y]: Coordinate) {
    return this.beliefState.find(item => {
      const [xpos, ypos] = item.coordinate;
      return x === xpos && y === ypos;
    });
  }

  private getCoordinateFromMousePosition(x: number, y: number): Coordinate {
    const cell = this.gridCells.find((mapping) => {
      const [mouseX, mouseY] = mapping.mouseCoordinate;
      return x >= mouseX && x <= mouseX + this.boxWidthPixels + 8 && y >= mouseY && y <= mouseY + this.boxHeightPixels + this.browserOffset;
    });

    return cell ? cell.gridCoordinate : undefined;
  }
}
