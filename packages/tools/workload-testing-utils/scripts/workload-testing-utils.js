class TestInvoker {
  constructor(syncCallback, asyncCallback, reportCallback, waitBeforeSync = 0) {
    this._syncCallback = syncCallback;
    this._asyncCallback = asyncCallback;
    this._reportCallback = reportCallback;
    this.waitBeforeSync = waitBeforeSync;
  }
}

export class TimerTestInvoker extends TestInvoker {
  start() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._syncCallback();
        setTimeout(() => {
          this._asyncCallback();
          requestAnimationFrame(async () => {
            await this._reportCallback();
            resolve();
          });
        }, 0);
      }, this.waitBeforeSync);
    });
  }
}

class BaseRAFTestInvoker extends TestInvoker {
  start() {
    return new Promise((resolve) => {
      if (this.waitBeforeSync)
        setTimeout(() => this._scheduleCallbacks(resolve), this.waitBeforeSync);
      else this._scheduleCallbacks(resolve);
    });
  }
}

export class RAFTestInvoker extends BaseRAFTestInvoker {
  _scheduleCallbacks(resolve) {
    requestAnimationFrame(() => this._syncCallback());
    requestAnimationFrame(() => {
      setTimeout(() => {
        this._asyncCallback();
        setTimeout(async () => {
          await this._reportCallback();
          resolve();
        }, 0);
      }, 0);
    });
  }
}

/**
 * BenchmarkTestStep
 *
 * A single test step, with a common interface to interact with.
 */
export class BenchmarkTestStep {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
  }

  run() {
    this.fn();
  }

  async runAsync(delay = 0) {
    return new Promise((resolve) => {
      this.fn();
      setTimeout(() => resolve(), delay);
    });
  }

  async runAndRecord({
    waitBeforeSync,
    measurementMethod,
    warmupBeforeSync,
    suitename,
    callback,
  }) {
    const startLabel = `${suitename}.${this.name}-start`;
    const syncEndLabel = `${suitename}.${this.name}-sync-end`;
    const asyncStartLabel = `${suitename}.${this.name}-async-start`;
    const asyncEndLabel = `${suitename}.${this.name}-async-end`;

    let syncTime;
    let asyncStartTime;
    let asyncTime;

    const invokerClass =
      measurementMethod === "raf" ? RAFTestInvoker : TimerTestInvoker;
    const runSync = () => {
      if (warmupBeforeSync) {
        performance.mark("warmup-start");
        const startTime = performance.now();
        // Infinite loop for the specified ms.
        while (performance.now() - startTime < warmupBeforeSync) continue;
        performance.mark("warmup-end");
      }
      performance.mark(startLabel);
      const syncStartTime = performance.now();
      this.run();
      const syncEndTime = performance.now();
      performance.mark(syncEndLabel);

      syncTime = syncEndTime - syncStartTime;

      performance.mark(asyncStartLabel);
      asyncStartTime = performance.now();
    };
    const measureAsync = () => {
      // Some browsers don't immediately update the layout for paint.
      // Force the layout here to ensure we're measuring the layout time.
      const height = document.body.getBoundingClientRect().height;
      const asyncEndTime = performance.now();
      asyncTime = asyncEndTime - asyncStartTime;
      window._unusedHeightValue = height; // Prevent dead code elimination.
      performance.mark(asyncEndLabel);
      if (warmupBeforeSync)
        performance.measure("warmup", "warmup-start", "warmup-end");
      performance.measure(
        `${suitename}.${this.name}-sync`,
        startLabel,
        syncEndLabel
      );
      performance.measure(
        `${suitename}.${this.name}-async`,
        asyncStartLabel,
        asyncEndLabel
      );
    };

    // const report = () => this._recordTestResults(suite, test, syncTime, asyncTime);
    const report = () =>
      callback({ suite: suitename, test: this.name, syncTime, asyncTime });
    const invoker = new invokerClass(
      runSync,
      measureAsync,
      report,
      waitBeforeSync
    );

    return invoker.start();
  }
}

/**
 * BenchmarkTestSuite
 *
 * A single test suite that contains one or more test steps.
 */
export class BenchmarkTestSuite {
  constructor(name, tests) {
    this.name = name;
    this.tests = tests;
    this._measuredValues = {
      tests: {},
      total: 0,
      mean: NaN,
      geomean: NaN,
      score: NaN,
    };
  }

  getTestByName(name) {
    return this.tests.find((test) => test.name === name);
  }

  run() {
    for (const test of this.tests) test.run();
    return { type: "suite-tests-complete", status: "success" };
  }

  async runAndRecord({
    waitBeforeSync = 0,
    measurementMethod = "raf",
    warmupBeforeSync = -1,
  }) {
    this._measuredValues = {
      tests: {},
      total: 0,
      mean: NaN,
      geomean: NaN,
      score: NaN,
    };
    const suiteStartLabel = `suite-${this.name}-start`;
    const suiteEndLabel = `suite-${this.name}-end`;

    performance.mark(suiteStartLabel);

    for (const test of this.tests)
      await test.runAndRecord({
        waitBeforeSync,
        measurementMethod,
        warmupBeforeSync,
        suitename: this.name,
        callback: this.record,
      });

    performance.mark(suiteEndLabel);
    performance.measure(`suite-${this.name}`, suiteStartLabel, suiteEndLabel);

    return {
      type: "suite-tests-complete",
      status: "success",
      result: this._measuredValues,
    };
  }

  record({ suite, test, syncTime, asyncTime }) {
    const suiteResults = this._measuredValues.tests[suite.name] || {
      tests: {},
      total: 0,
    };
    const total = syncTime + asyncTime;
    this._measuredValues.tests[suite.name] = suiteResults;
    suiteResults.tests[test.name] = {
      tests: { Sync: syncTime, Async: asyncTime },
      total: total,
    };
    suiteResults.total += total;
  }
}

/**
 * BenchmarkTestManager
 *
 * A collection of test suites for a single workload.
 */
export class BenchmarkTestManager {
  constructor(name, suites) {
    this.name = name;
    this.suites = suites;
  }

  getSuiteByName(name) {
    return this.suites.find((suite) => suite.name === name);
  }

  run(suitesToRun) {
    console.log(`Starting tests for ${this.name}`);
    const selectedSuites = !suitesToRun
      ? [...this.suites]
      : this.suites.filter((suite) => suitesToRun.includes(suite.name));

    for (const suite of selectedSuites) {
      console.log(`Starting ${suite.name} test.`);
      suite.run();
      console.log(`Completed ${suite.name} test.`);
    }

    return `Done with tests for ${this.name}`;
  }

  async runAsync(suitesToRun) {
    console.log(`Starting tests for ${this.name}`);
    const selectedSuites = !suitesToRun
      ? [...this.suites]
      : this.suites.filter((suite) => suitesToRun.includes(suite.name));

    for (const suite of selectedSuites) {
      console.log(`Starting ${suite.name} test.`);
      await suite.runAsync();
      console.log(`Completed ${suite.name} test.`);
    }

    return `Done with tests for ${this.name}`;
  }
}

// Helper Methods
export function getParent(lookupStartNode, path) {
  lookupStartNode = lookupStartNode.shadowRoot ?? lookupStartNode;
  const parent = path.reduce((root, selector) => {
    const node = root.querySelector(selector);
    return node.shadowRoot ?? node;
  }, lookupStartNode);

  return parent;
}

export function getElement(selector, path = [], lookupStartNode = document) {
  const element = getParent(lookupStartNode, path).querySelector(selector);
  return element;
}

export function getAllElements(
  selector,
  path = [],
  lookupStartNode = document
) {
  const elements = Array.from(
    getParent(lookupStartNode, path).querySelectorAll(selector)
  );
  return elements;
}

export function forceLayout() {
  const rect = document.body.getBoundingClientRect();
  const e = document.elementFromPoint(
    (rect.width / 2) | 0,
    (rect.height / 2) | 0
  );
  return e;
}
