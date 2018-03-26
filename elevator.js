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
    this.currentFloor = 0;

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
  isEnRouteTo(floor, direction) {
    const lastDestination = this.destinations[this.destinations.length - 1];
    if (lastDestination >= this.currentFloor) {
      // moving upward
      return direction && this.currentFloor <= floor && floor <= lastDestination;
    } else {
      // moving downward
      return !direction && this.currentFloor >= floor && floor >= lastDestination;
    }
  }

  /**
   * Summons the elevator to the specified floor to travel to another floor.
   * @param {Number} floor The origin floor.
   * @param {Number} dest The target floor.
   */ 
  summon(floor, dest) {
    this.waitingPassengers.push({ from: floor, to: dest, direction: dest > floor });
    this.addDestination(floor);
  }

  addDestination(floor) {
    if (this.destinations.includes(floor) || floor === this.currentFloor) {
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
      this.currentFloor += Math.sign(this.destinations[0] - this.currentFloor);
      this.distanceTraveled++;
      this.simulator.report(this, `Moved to floor ${this.currentFloor + 1}`);
      if (this.currentFloor === this.destinations[0]) {
        // The elevator has reached its destination
        this.destinations.shift();
        this.lingerTime = ELEVATOR_LINGER_TIME;

        let direction; 
        if (this.destinations.length > 0) {
          // If the elevator is already moving in a certain direction, keep going that way
          if (this.destinations[0] > this.currentFloor) {
            direction = true;
          } else {
            direction = false;
          }
        } else if (this.waitingPassengers.length > 0) {
          // Otherwise, the elevator services the person who's been waiting longest
          direction = this.waitingPassengers[0].direction;
        } 

        const boardingPassengers = this.waitingPassengers.filter(
          pass => pass.from === this.currentFloor && pass.direction === direction
        );
        const disembarkingPassengers = this.passengers.filter(
          pass => pass.to === this.currentFloor
        );

        if (boardingPassengers.length > 0 || disembarkingPassengers.length > 0) {
          this.doorOpen = true;
          this.simulator.report(this, `Doors open on floor ${this.currentFloor + 1}.`);

          boardingPassengers.forEach(pass => {
            this.waitingPassengers.splice(this.waitingPassengers.indexOf(pass), 1);
            this.passengers.push(pass);
            this.simulator.report(this, `Passenger enters, presses floor ${pass.to + 1}.`);
            this.addDestination(pass.to);
          });

          disembarkingPassengers.forEach(pass => {
            this.passengers.splice(this.passengers.indexOf(pass), 1);
          });

          if (disembarkingPassengers.length > 1) {
            this.simulator.report(this, `${disembarkingPassengers.length} passengers disembarked.`);
          } else if (disembarkingPassengers.length === 1) {
            this.simulator.report(this, '1 passenger disembarked.');
          }
          this.tripsUntilService -= disembarkingPassengers.length;
        }
      }
    }
    if (!this.running) {
      if (this.passengers.length > 0) {
        this.display.innerHTML = `Unloading (${this.passengers.length})`;
      } else {
        this.display.innerHTML = '[Out of Service]';
      }
    } else {
      this.display.innerHTML = (
        `${this.currentFloor + 1} - ${this.doorOpen ? 'Open' : 'Closed'} ` + 
        `(${this.passengers.length})`
      );
    }
  }
}
