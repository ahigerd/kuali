"use strict";

const ELEVATOR_SPEED = 1;
const ELEVATOR_LINGER_TIME = 1;

class Elevator {
  /**
   * Constructs a single elevator simulator.
   * @param {Simulator} simulator The simulation that owns the elevator.
   * @param {Number} index The elevator's identifying index.
   * @param {Number} floors The number of floors serviced by the elevator.
   */
  constructor(simulator, index, floors) {
    this.simulator = simulator;
    this.index = index;
    this.floors = floors;
    this.tripsUntilService = 100;
    this.distanceTraveled = 0;
    this.numPassengers = 0;
    this.label = 'Elevator ' + (index + 1);

    // When the elevator needs serviced, it must stop running.
    this.running = true;

    // A possibility to consider is defining a home floor for elevators.
    this.currentFloor = 1;

    // A list of floors that the elevator must visit.
    this.destinations = [];
  }

  /**
   * A read-only property telling if the elevator is occupied.
   * @returns {Boolean} True if there are any passengers on board.
   */
  get occupied() {
    return this.numPassengers > 0;
  }

  /**
   * Calculates the distance this elevator would need to travel to reach the specified floor.
   * @param {Number} floor The destination floor.
   * @returns {Number} The distance to the destination floor.
   */
  distanceTo(floor) {
    return Math.abs(floor - this.currentFloor);
  }

  /**
   * Determines if this elevator is currently on or en route to the specified floor.
   * @param {Number} floor The floor being considered.
   * @returns {Boolean} True if the elevator will pass by the specified floor.
   */
  isEnRouteTo(floor) {
    // TODO: implement
  }

  /**
   * Summons the elevator to the specified floor to travel in a requested direction.
   * @param {Number} floor The origin floor.
   * @param {Boolean} direction True to go up, False to go down.
   */ 
  summon(floor, direction) {
    // TODO: implement
  }

  /**
   * Processes a single tick of the simulation.
   */
  tick() {
    // TODO: implement
  }
}
