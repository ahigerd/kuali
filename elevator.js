"use strict";

const ELEVATOR_LINGER_TIME = 1;

class Elevator {
  /**
   * Constructs a single elevator simulator.
   * @param {Simulator} simulator The simulation that owns the elevator.
   * @param {Number} index The elevator's identifying index.
   * @param {Number} floors The number of floors serviced by the elevator.
   * @param {Element} display An HTML element to show the elevator's status.
   */
  constructor(simulator, index, floors, display) {
    this.simulator = simulator;
    this.index = index;
    this.floors = floors;
    this.display = display;
    this.tripsUntilService = 100;
    this.distanceTraveled = 0;
    this.passengers = [];
    this.waitingPassengers = [];
    this.doorOpen = false;
    this.lingerTime = 0;
    this.label = 'Elevator ' + (index + 1);

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
    return this.passengers.length > 0;
  }

  /**
   * A read-only property telling if the elevator is running, or if it needs serviced.
   * @returns {Boolean} True if the elevator is running; false if it needs serviced.
   */
  get running() {
    return this.tripsUntilService > 0;
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
    const lastDestination = this.destinations[this.destinations.length - 1];
    if (lastDestination >= this.currentFloor) {
      // moving upward
      return this.currentFloor <= floor && floor <= lastDestination;
    } else {
      // moving downward
      return this.currentFloor >= floor && floor >= lastDestination;
    }
  }

  /**
   * Summons the elevator to the specified floor to travel to another floor.
   * @param {Number} floor The origin floor.
   * @param {Number} dest The target floor.
   */ 
  summon(floor, dest) {
    this.waitingPassengers.push({ from: floor, to: dest });
    this.addDestination(floor);
  }

  addDestination(floor) {
    if (this.destinations.includes(floor)) {
      // Already going to this floor
      return;
    }
    this.destinations.push(floor);
    if (floor < this.currentFloor) {
      // moving down
      this.destinations.sort((lhs, rhs) => rhs - lhs);
    } else {
      // moving up
      this.destinations.sort((lhs, rhs) => lhs - rhs);
    }
  }

  /**
   * Processes a single tick of the simulation.
   */
  tick() {
    if (this.lingerTime > 0) {
      this.lingerTime--;
      if (this.lingerTime <= 0) {
        this.doorOpen = false;
        this.simulator.report(this, `Doors closed on floor ${this.currentFloor + 1}.`);
      }
      return;
    }
    if (this.destinations.length) {
      console.log('moving', this.destinations[0], this.currentFloor, Math.sign(this.destinations[0] - this.currentFloor));
      this.currentFloor += Math.sign(this.destinations[0] - this.currentFloor);
      this.simulator.report(this, `Moved to floor ${this.currentFloor + 1}`);
      if (this.currentFloor === this.destinations[0]) {
        // The elevator has reached its destination
        this.destinations.shift();
        this.lingerTime = ELEVATOR_LINGER_TIME;
        this.doorOpen = true;
        this.simulator.report(this, `Doors open on floor ${this.currentFloor + 1}.`);

        // Remove passengers
        const oldNumPassengers = this.passengers.length;
        this.passengers = this.passengers.filter(pass => pass.to !== this.currentFloor);
        this.tripsUntilService -= (this.passengers.length - oldNumPassengers);

        // Add waiting passengers
        for (let i = this.waitingPassengers.length - 1; i >= 0; --i) {
          if (this.waitingPassengers[i].from === this.currentFloor) {
            const passenger = this.waitingPassengers.splice(i, 1)[0];
            this.passengers.push(passenger);
            this.addDestination(passenger.to);
            this.simulator.report(this, `Passenger enters, presses floor ${passenger.to + 1}.`);
          }
        }
      }
      this.distanceTraveled++;
    }
    if (!this.running) {
      this.display.innerHTML = '[Out of Service]';
    } else {
      this.display.innerHTML = (
        `${this.currentFloor + 1} - ${this.doorOpen ? 'Open' : 'Closed'} ` + 
        `(${this.passengers.length})`
      );
    }
  }
}
