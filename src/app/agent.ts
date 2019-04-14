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
    private belief: BeliefState[];
    private readonly environment: Grid;
    private readonly hmm: HiddenMarkovModel;

    /**
     * Constructor - initializes an agent in a partially observable environment (noisy sensors) with each of four location sensors (NSEW)
     * returning the wrong reading with probability of errorRate
     * @param errorRate the probability that each sensor will report the wrong state
     */
    constructor(errorRate: number, environment: Grid) {
        this.errorRate = errorRate;
        this.environment = environment;

        this.belief = this.initializeBeliefState();

        this.hmm = new HiddenMarkovModel(environment, this.errorRate);
    }

    /**
     * Creates the initial belief state, where being in any possible square is equally likely
     * @param environment the grid environment the agent is placed in
     */
    private initializeBeliefState() {
        const beliefState = [] as BeliefState[];
        const numSpaces = this.environment.rows * this.environment.columns - this.environment.obstacles.length;

        this.environment.occupiableCoordinates.forEach(coord => {
            beliefState.push({coordinate: coord, probability: 1 / numSpaces});
        });

        return beliefState;
    }

    getPercept(coordinate: Coordinate) {
        const percept = this.environment.getTrueEnvironmentSensorReading(coordinate);
        const northHasError = Math.floor(Math.random() * 101) <= this.errorRate * 100;
        const southHasError = Math.floor(Math.random() * 101) <= this.errorRate * 100;
        const eastHasError = Math.floor(Math.random() * 101) <= this.errorRate * 100;
        const westHasError = Math.floor(Math.random() * 101) <= this.errorRate * 100;

        if (northHasError) {
            percept.north = !percept.north;
        }

        if (southHasError) {
            percept.south = !percept.south;
        }

        if (eastHasError) {
            percept.east = !percept.east;
        }

        if (westHasError) {
            percept.west = !percept.west;
        }

        return percept;
    }

    /**
     * Update the belief state based on the current precept
     * given b is the initial belief state, o is the percept, then the new belief state is
     * b' = update(b, o)
     */
    update(percept: SensorReading) {
        // todo: use hmm here to update belief state
        // hmm
        this.belief = this.toBeliefState(this.hmm.updateBeliefState(percept));


    }

    private toBeliefState(probabilities: number[]) {
        return this.environment.occupiableCoordinates.map((coord, index) => {
                return { coordinate: coord, probability: probabilities[index] } as BeliefState;
            }
        );
    }
}
