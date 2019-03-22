import { Coordinate } from './models/coordinate';
import { BeliefState } from './models/belief-state';
import { SensorReading } from './models/sensor-reading';
import { Grid } from './grid';
import { HiddenMarkovModel } from './hidden-markov-model';

export class Agent {

    get beliefState(): BeliefState[] {
        return this.belief;
    }

    private errorRate: number;
    private readonly belief: BeliefState[];
    private readonly environment: Grid;

    /**
     * Constructor - initializes an agent in a partially observable environment (noisy sensors) with each of four location sensors (NSEW)
     * returning the wrong reading with probability of errorRate
     * @param errorRate the probability that each sensor will report the wrong state
     */
    constructor(errorRate: number, environment: Grid) {
        this.errorRate = errorRate;
        this.environment = environment;

        this.belief = this.initializeBeliefState();

        const hmm = new HiddenMarkovModel();
        hmm.initializeTransitionMatrix(environment.rows, environment.columns, environment.obstacles.length);
        // console.log(hmm);
    }

    /**
     * Creates the initial belief state, where being in any possible square is equally likely
     * @param environment the grid environment the agent is placed in
     */
    private initializeBeliefState() {
        const beliefState = [] as BeliefState[];
        const numSpaces = this.environment.rows * this.environment.columns - this.environment.obstacles.length;

        for (let row = 0; row < this.environment.rows; row++) {
            for (let col = 0; col < this.environment.columns; col++) {
                const coordinate = [col, row] as Coordinate;
                if (this.environment.hasObstacle(coordinate)) {
                    beliefState.push({coordinate: coordinate, probability: 0});
                } else {
                    beliefState.push({coordinate: coordinate, probability: 1 / numSpaces});
                }
            }
        }

        return beliefState;
    }

    /**
     * The agent moves to any of it's neighbors with equal chance
     * P(X_t+1=j | X_t = i) = (1/N(i) if j in Neighbors(i) else 0)
     * @param currentLocation true location of the agent
     */
    // predict(currentLocation: Coordinate) {
    //     return
    // }

    getPercept() {

    }

    /**
     * Update the belief state based on the current precept
     * given b is the initial belief state, o is the percept, then the new belief state is
     * b' = update(b, o)
     */
    update(beliefState: BeliefState[], percept: SensorReading) {
        // todo: use hmm here to update belief state
    }
}
