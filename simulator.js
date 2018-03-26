"use strict";

const REQUEST_PROBABILITY = 0.3;
const REQUEST_FREQUENCY = 1;

/**
 * A class encapsulating the building simulation.
 */
class Simulator {
  /**
   * Constructs the simulator.
   * @param {Number} floors The number of floors in the building.
   * @param {Number} elevators The number of elevators servicing the building.
   */
  constructor(floors, elevators) {
    this.label = 'Simulator';
    this.floors = floors;
    this.timeToRequest = REQUEST_FREQUENCY;
    this.waitingRequests = [];

    const configTable = document.querySelector('#configuration');
    this.elevators = [];
    for (let i = 0; i < elevators; i++) {
      const row = document.createElement('TR');
      const label = document.createElement('TD');
      const display = document.createElement('TD');
      const elevator = new Elevator(this, i, floors, display);
      this.elevators.push(elevator);
      label.innerHTML = elevator.label;
      row.appendChild(label);
      row.appendChild(display);
      configTable.appendChild(row);
    }

    // Ensure proper this-binding of the tick function
    this.tick = this.tick.bind(this);
  }

  get currentHour() {
    const hour = Math.floor(this.currentTime / 60) % 12;
    return hour === 0 ? 12 : hour;
  }

  get currentMinute() {
    return ('0' + this.currentTime % 60).substr(-2);
  }

  /**
   * Starts the simulation.
   * @param {Element} output An HTML element to put the simulation output into.
   */
  run(output) {
    this.currentTime = 8 * 60;
    this.output = output;
    this.output.innerHTML = '';
    this.report(this, `Simulation started: ${this.floors} floor(s), ${this.elevators.length} elevator(s).`);
    window.requestAnimationFrame(this.tick);
  }

  /**
   * Evaluate a single tick of the simulation.
   *
   * This function is not strictly necessary: The entire simulation could be run from within a loop in a single
   * function. However, in the interests of making the browser remain responsive while the simulation is running, using
   * this tick function in conjunction with requestAnimationFrame allows the browser to run the simulation when it is
   * idle.
   */
  tick() {
    this.timeToRequest--;
    if (this.timeToRequest < 0) {
      this.timeToRequest = REQUEST_FREQUENCY;
      if (Math.random() < REQUEST_PROBABILITY) {
        const sourceFloor = Math.floor(Math.random() * this.floors);
        const destFloor = Math.floor(Math.random() * this.floors);
        const elevator = this.pickElevator(sourceFloor, destFloor);
        if (elevator) {
          this.report(this, `Pressed ${sourceFloor < destFloor ? 'up' : 'down'} button on floor ${sourceFloor + 1}, ${elevator.label} answering.`);
          elevator.summon(sourceFloor, destFloor);
        }
      }
    }
    this.elevators.forEach(elevator => elevator.tick());
    if (this.elevators.some(elevator => elevator.running)) {
      // If any elevators are still running, ask the browser to run the simulation for another tick.
      this.currentTime++;
      window.requestAnimationFrame(this.tick);
    }
  }

  /**
   * Reports a message to the simulation log.
   * @param {Object} source The source of the message, probably an elevator.
   * @param {String} message The message to report.
   */
  report(source, message) {
    const div = document.createElement('DIV');
    div.innerHTML = `${this.currentHour}:${this.currentMinute} - <b> ${source.label}:</b> ${message}`;
    this.output.appendChild(div);
  }

  pickElevator(sourceFloor, destFloor) {
    if (sourceFloor === destFloor) {
      // No elevators need to be summoned if the passenger is already on the right floor.
      return null;
    }
    const emptyElevators = this.elevators.filter(elevator => !elevator.occupied);

    const perfectElevator = emptyElevators.find(elevator => elevator.currentFloor === sourceFloor);
    if (perfectElevator) {
      // If an elevator is already on the source floor, use it.
      return perfectElevator;
    }

    const enRouteElevators = this.elevators.filter(elevator => elevator.isEnRouteTo(sourceFloor));

    const availableElevators = enRouteElevators.length > 0 ? enRouteElevators : emptyElevators;
    availableElevators.sort((lhs, rhs) => {
      const distance = lhs.distanceTo(sourceFloor) - rhs.distanceTo(sourceFloor);
      if (distance === 0) {
        // This wasn't in the specification, but let's wear-level the elevators if more than one is a valid candidate.
        return lhs.tripsUntilServiced - rhs.tripsUntilServiced;
      }
      return distance;
    });

    return availableElevators[0];
  }
}

// Wait for the document to finish loading, then attach the Simulate button.
window.addEventListener('load', () => {
  document.querySelector('button#simulate').addEventListener('click', () => {
    [...document.querySelectorAll('.elevatorRow')].forEach(row => row.remove());
    const floors = parseInt(document.querySelector('#floors').value) || 1;
    const elevators = parseInt(document.querySelector('#elevators').value) || 1;
    const simulator = new Simulator(floors, elevators);
    window.sim = simulator;
    simulator.run(document.querySelector('#output'));
  });
});
