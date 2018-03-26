"use strict";

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
    this.source = 'Simulator';
    this.floors = floors;
    this.elevators = [];
    for (let i = 0; i < elevators; i++) {
      this.elevators.push(new Elevator(this, i, floors));
    }

    // Ensure proper this-binding of the tick function
    this.tick = this.tick.bind(this);
  }

  /**
   * Starts the simulation.
   * @param {Element} output An HTML element to put the simulation output into.
   */
  run(output) {
    this.output = output;
    this.output.innerHTML = '';
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
    // TODO: Implement simulation loop

    if (this.elevators.some(elevator => elevator.running)) {
      // If any elevators are still running, ask the browser to run the simulation for another tick.
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
    div.innerHTML = '<b>' + source.label + ':</b>' + message;
    this.output.appendChild(div);
  }
}

// Wait for the document to finish loading, then attach the Simulate button.
window.addEventListener('load', () => {
  document.querySelector('button#simulate').addEventListener('click', () => {
    const floors = parseInt(document.querySelector('#floors')).value || 1;
    const elevators = parseInt(document.querySelector('#floors')).value || 1;
    const simulator = new Simulator(floors, elevators);
    simulator.run(document.querySelector('#output'));
  });
});
