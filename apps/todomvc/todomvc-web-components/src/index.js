import { BenchmarkConnector } from "/node_modules/workload-testing-utils/dist/benchmark.mjs";
import suites, { appName, appVersion } from "/src/workload-test.mjs";

/*
Paste below into dev console for manual testing:
window.addEventListener("message", (event) => console.log(event.data));
window.postMessage({ id: "todomvc-web-components-1.0.0", key: "benchmark-connector", type: "benchmark-suite", name: "default" }, "*");
*/
const benchmarkConnector = new BenchmarkConnector(suites, appName, appVersion);
benchmarkConnector.connect();
