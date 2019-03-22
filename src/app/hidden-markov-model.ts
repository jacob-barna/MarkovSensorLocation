import * as math from 'mathjs';
import { Coordinate } from './models/coordinate';

/** Matrix algorithms for distributions with a single discrete state variable */
export class HiddenMarkovModel {
    // If our state variable has S states, our transition matrix will be S x S matrix
    // where T_ij = P(X_t = j | X_t−1 = i )
    // in the grid world example, our possible states are the neighbor squares we can land on (not blocked by obstacles),
    // so P(X_t+1 =j|X_t=i) = T_ij = (1/N(i) if j ∈ NEIGHBORS(i) else 0)
    transitionMatrix: math.Matrix; // = math.matrix([1, 2]);

    // 16 possible values, 4 bits mapping to NSEW
    // 0100 => Sensor reports south blocked
    // 1111 => Sensor reports NSEW blocked
    // these combinations are placed into an 4 x 4 diagonal matrix
    // where P(e_t | X_t = i), and the other entries are 0
    sensorMatrix = math.matrix([1, 2]);

    // forwardMessage f_1:t+1 = αO_t+1T^Tf_1:t

    /**
     * creates a uniform distribution over all the squares P(X_0=i)=1/n.
     * @param rows the number of rows in the grid
     * @param cols the number of cols in the grid
     * @param numberOfObstacles the number of obstacles in the grid
     * (these are not part of the transition matrix (prob. distribution) as we cannot move to them)
     */
    initializeTransitionMatrix(rows: number, columns: number, numberOfObstacles: number) {
        const matrix: number [][] = [];
        const numSpaces = rows * columns - numberOfObstacles;

        for (let row = 0; row < numSpaces; row++) {
            matrix[row] = [];
            for (let col = 0; col < numSpaces; col++) {
                    matrix[row][col] = 1 / numSpaces;
            }
        }

        this.transitionMatrix = math.matrix(matrix);
    }
}
