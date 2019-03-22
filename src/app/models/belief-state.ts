import { Coordinate } from './coordinate';

export interface BeliefState {
    coordinate: Coordinate;
    probability: number;
}
