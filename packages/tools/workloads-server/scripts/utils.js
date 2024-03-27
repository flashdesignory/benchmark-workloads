const fs = require("fs").promises;
const path = require("path");
const { exec, execSync } = require("child_process");
const chalk = require("chalk");

const excludeList = [
  ".angular",
  ".git",
  ".github",
  ".next",
  ".nuxt",
  ".output",
  ".rollup.cache",
  ".wireit",
  "dist",
  "output",
  "docs",
  "node_modules",
  "packages",
  "public",
];

/**
 * findDirectories
 * 
 * Takes a start directory and searches for sub directories that contain a target file.
 * If a target file is present, it will be returned in a directories array.
 * 
 * @param {Object} config - Config object for function to run.
 * @param {string} config.start - Start folder to search from.
 * @param {string} config.target - The file to search for.
 * @param {string} config.root - Start folder package name.
 * @param {string[]} config.directories - Array of directories.
 * @returns {string[]} Array of directories.
 */
async function findDirectories({ start, target, root, directories = [] }) {
  const list = await fs.readdir(start);
  for (const entry of list) {
    const current = path.resolve(start, entry);
    const stat = await fs.stat(current);
    if (stat && stat.isDirectory()) {
      if (!excludeList.includes(entry)) {
        await findDirectories({
          start: current,
          target,
          root,
          directories,
        });
      }
    } else {
      if (entry === target) {
        if (path.basename(path.dirname(current)) !== root) {
          directories.push(path.dirname(current));
        }
      }
    }
  }

  return directories;
}

/**
 * findDirectoryByName
 * 
 * Takes a start directory and searches for sub directories with the target name.
 * 
 * @param {Object} config - Config object for function to run.
 * @param {string} config.start - Start folder to search from.
 * @param {string} config.target - The directory name.
 * @param {string} config.root - Start folder package name.
 * @param {string[]} config.directories - Array of directories.
 * @returns {string[]} Array of directories.
 */
async function findDirectoryByName({ start, target, root, result = [] }) {
  const list = await fs.readdir(start);
  for (const entry of list) {
    const current = path.resolve(start, entry);
    const stat = await fs.stat(current);
    if (stat && stat.isDirectory()) {
      if (entry === target) {
        result.push(current);
      } else if (!excludeList.includes(entry)) {
        await findDirectoryByName({
          start: current,
          target,
          root,
          result,
        });
      }
    }
  }
  return result;
}

/**
 * executeScriptSync
 * 
 * Function to execute a script sync.
 * 
 * @param {Object} config - Config object for function to run.
 * @param {string} config.script - Name of the script to run.
 * @param {string} config.directory - Directory of the script.
 * @param {Object} config.env - Environment variables to pass in.
 * @returns {Object} Status object with directory name and status (success | failure).
 */
function executeScriptSync({ script, directory, env = {} }) {
  try {
    execSync(`npm run ${script}`, {
      cwd: directory,
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    console.log("Success! 👏");
    return {
      dir: path.basename(directory),
      status: "success",
    };
  } catch (e) {
    console.log("Failure! 😔");
    return {
      dir: path.basename(directory),
      status: "failure",
    };
  }
}

/**
 * executeScript
 * 
 * Function to execute a script async.
 * 
 * @param {Object} config - Config object for function to run.
 * @param {string} config.script - Name of the script to run.
 * @param {string} config.directory - Directory of the script.
 * @param {Object} config.env - Environment variables to pass in.
 */
async function executeScript({ script, directory, env = {} }) {
  const currentHex = "#" + Math.floor(Math.random() * 16777215).toString(16);

  const child = exec(`npm run ${script}`, {
    cwd: directory,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });

  child.stdout.on("data", (data) => {
    console.log(chalk.hex(currentHex)(`${path.basename(directory)}: ${data}`));
  });

  child.stderr.on("data", (data) => {
    console.log(chalk.red(`${path.basename(directory)} Failure! 😔 - ${data}`));
  });

  function cleanup() {
    child.kill();
    process.exit();
  }

  process.once("SIGINT", cleanup);
  process.once("SIGTERM", cleanup);
  process.once("SIGQUIT", cleanup);
}

module.exports = {
  findDirectories,
  findDirectoryByName,
  executeScript,
  executeScriptSync,
};
