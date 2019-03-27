import * as math from 'mathjs';
import { Coordinate } from './models/coordinate';
import { SensorReading } from './models/sensor-reading';
import { Grid } from './grid';

/** Matrix algorithms for distributions with a single discrete state variable */
export class HiddenMarkovModel {

    private numberOfStates: number;
    private errorRate: number;
    private environment: Grid;
    private forwardMessage: number[];

    constructor(environment: Grid, sensorErrorRate: number) {
        this.numberOfStates = environment.rows * environment.columns - environment.obstacles.length;
        this.errorRate = sensorErrorRate;
        this.environment = environment;
        this.initializeTransitionMatrix();
        this.forwardMessage = this.createInitialForwardMessage();
    }

    // If our state variable has S states, our transition matrix will be S x S matrix
    // where T_ij = P(X_t = j | X_t−1 = i )
    // in the grid world example, our possible states are the neighbor squares we can land on (not blocked by obstacles),
    // so P(X_t+1 =j|X_t=i) = T_ij = (1/N(i) if j ∈ NEIGHBORS(i) else 0)
    private transitionMatrix: math.Matrix; // = math.matrix([1, 2]);

    // 16 possible values, 4 bits mapping to NSEW
    // 0100 => Sensor reports south blocked
    // 1111 => Sensor reports NSEW blocked
    // these combinations are placed into an 4 x 4 diagonal matrix
    // let d_it be the number of bits different between true values and sensor reading
    // where P(e_t | X_t = i) = O_t_ij = (1 - \epsilon)^(4_d_it*\epsilon^d_it)
    // [the probability that a square i would receive a sensor reading e_t]
    // and the other entries are 0
    private sensorMatrix: math.Matrix;

    // forwardMessage f_1:t+1 = αO_t+1T^Tf_1:t
    public updateBeliefState(sensorReading: SensorReading) {
       this.initializeSensorMatrix(sensorReading);
        console.log(this.sensorMatrix);

        console.log('transition:');
       console.log(this.transitionMatrix);
        const transposed
        = math.transpose(this.transitionMatrix);
        console.log('transpose');
        console.log(transposed);

        const forward = math.multiply(this.sensorMatrix, transposed);
        console.log(this.forwardMessage);
        console.log(math.multiply(forward, this.forwardMessage));
        const forwardMessage = (math.multiply(forward, this.forwardMessage) as math.Matrix).toArray() as number[];

        console.log(forwardMessage);
        console.log('normalized vector');
        // console.log(this.normalizeVectorSoftmax(forwardMessage).reduce((agg, num) => agg + num, 0));
        console.log(this.normalizeVector(forwardMessage));

        return this.normalizeVector(forwardMessage);
    }

    /**
     * This is the "true" sensor reading for each square in the environment
     */
    private convertEnvironmentToSensorReadingVector() {
        const sensorReadings: SensorReading[] = [];
        // there are S=42 states (locations) if you ignore the obstacles
        this.environment.occupiableCoordinates.forEach(coord => {
            sensorReadings.push(this.environment.getTrueEnvironmentSensorReading(coord));
        });

        return sensorReadings;
    }

    /**
     * Returns the number of bits different between two sensor readings
     * @param sensorReading
     * @param otherSensorReading
     */
    private getHammingDistance(sensorReading: SensorReading, otherSensorReading: SensorReading) { 
        let distance = 0;

        if (sensorReading.north !== otherSensorReading.north) {
            distance++;
        }

        if (sensorReading.south !== otherSensorReading.south) {
            distance++;
        }

        if (sensorReading.east !== otherSensorReading.east) {
            distance++;
        }

        if (sensorReading.west !== otherSensorReading.west) {
            distance++;
        }

        return distance;
    }

    /**
     * Returns the diagonal of the sensor matrix - see initializeSensorMatrix for more detail
     */
    private getSensorMatrixDiagonal(givenReading: SensorReading) {
        const trueReadings = this.convertEnvironmentToSensorReadingVector();
        return trueReadings.map(reading => {
            const distance = this.getHammingDistance(reading, givenReading);
            return Math.pow((1 - this.errorRate), 4 - distance) * Math.pow(this.errorRate, distance);
        });
    }

    /**
     * Initialize an S-element vector with probality 1/S
     * in our application, this S is the number of occupiable coordinates
     */
    private createInitialForwardMessage() {
        const forwardMessage = new Array(this.numberOfStates);

        for (let i = 0; i < this.numberOfStates; i++) {
            forwardMessage[i] = 1 / this.numberOfStates;
        }

        return forwardMessage;
    }

    /**
     * sensor matrix is an S x S matrix (where S is the number of states, or squares in our example)
     * This is also known as the O matrix, let \epsilon be the error rate of the sensors,
     * then P(e_t | X_t = i) = O_t_ii (diagonal entries) = (1 - \epsilon)^(4_d_it*\epsilon^d_it)
     * (we need the probability that we see the evidence at state i)
     * and the other entries are 0.
     */
    private initializeSensorMatrix(sensorReading: SensorReading) {
        /* there are 16 possible sensor readings
        ____ 0000
        ___W 0001
        __E_ 0010
        __EW 0011
        _S__ 0100
        _S_W 0101
        _SE_ 0110
        _SEW 0111
        N___ 1000
        N__W 1001
        N_E_ 1010
        N_EW 1011
        NS__ 1100
        NS_W 1101
        NSE_ 1110
        NSEW 1111
        */

       // i know the evidence variable, what is the probability that the current square shows that?
        // compare this with the sensor reading to get your probability
        const diag = this.getSensorMatrixDiagonal(sensorReading);
        this.sensorMatrix = math.diag(diag);
    }

    /**
     * creates a uniform distribution over all the squares P(X_0=i)=1/n, represented as S x S matrix
     * (where S is the number of possible states, or open squares in our example)
     * @param rows the number of rows in the grid
     * @param cols the number of cols in the grid
     * @param numberOfObstacles the number of obstacles in the grid
     * (these are not part of the transition matrix (prob. distribution) as we cannot move to them)
     */
    private initializeTransitionMatrix() {
        const matrix: number [][] = [];

        // the states are occupiable locations, we need the coordinates
        // to get neighbors
        const coords = this.environment.occupiableCoordinates;

        for (let row = 0; row < this.numberOfStates; row++) {
            matrix[row] = [];
            const currentCoord = coords[row];
            const neighbors = this.environment.getNeighbors(currentCoord);
            // console.log(neighbors);
            for (let col = 0; col < this.numberOfStates; col++) {
                    const [x, y] = coords[col];
                    const isNeighbor = neighbors.some(([xpos, ypos]) => x === xpos && y === ypos);
                    matrix[row][col] = isNeighbor ? 1 / neighbors.length : 0;
            }
        }

        this.transitionMatrix = math.matrix(matrix);
    }

    /** note: this does "good enough" for this project, floating point may not add up to 1.0 */
    private normalizeVector(vector: number[]) {
        const sum = vector.reduce((agg, num) => agg + num, 0);
        const normalizedVector = vector.map(num => num / sum);
        console.log(normalizedVector.reduce((agg, num) => agg + num, 0));
        return normalizedVector;

    }

    /** note: this does "good enough" for this project, floating point may not add up to 1.0 */
    // private normalizeVectorSoftmax(vector: number[]) {
    //     const C = Math.max(...vector);
    //     const d = vector.map((y) => Math.exp(y - C)).reduce((a, b) => a + b);
    //     return vector.map(value => {
    //         return Math.exp(value - C) / d;
    //     });
    // }
    // private normalizeVectorSoftmax(vector: number[]) {
    //     return vector.map(val => {
    //         return Math.exp(val) / vector.map(y => Math.exp(y)).reduce((a, b) => a + b);
    //     });
    // }
}
