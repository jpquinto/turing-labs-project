#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Node.js Lambda Packager
 *
 * This script packages a Node.js Lambda function by:
 * 1. Copying source files to the export directory
 * 2. Installing production dependencies
 * 3. Creating a deployment-ready package
 */

class NodePackager {
  constructor(config) {
    this.entryFilePath = path.resolve(config.entryFilePath);
    this.exportDir = path.resolve(config.exportDir);
    this.sourceDirs = config.sourceDirs || [];
    this.includeNodeModules = config.includeNodeModules !== false;
    this.packageJsonPath = config.packageJsonPath || null;
    this.buildCommand = config.buildCommand || null;
    this.buildDir = config.buildDir || null;
  }

  /**
   * Recursively copy directory contents
   */
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // Skip node_modules, .git, and common development directories
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name === ".terraform" ||
        entry.name === "dist" ||
        entry.name === "build" ||
        entry.name.startsWith(".")
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Run build command (e.g., TypeScript compilation)
   */
  runBuild() {
    if (!this.buildCommand) {
      return;
    }

    const projectRoot = this.packageJsonPath
      ? path.dirname(path.resolve(this.packageJsonPath))
      : path.dirname(this.entryFilePath);

    // Check if package.json exists
    const packageJsonPath = path.join(projectRoot, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json not found at: ${packageJsonPath}`);
    }

    // Read and check for the build script
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      if (this.buildCommand.startsWith("npm run ")) {
        const scriptName = this.buildCommand.replace("npm run ", "");
        if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
          throw new Error(
            `Script "${scriptName}" not found in package.json. ` +
              `Available scripts: ${
                packageJson.scripts
                  ? Object.keys(packageJson.scripts).join(", ")
                  : "none"
              }`
          );
        }
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`Cannot read package.json at: ${packageJsonPath}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in package.json at: ${packageJsonPath}`);
      }
      // Re-throw our own errors
      if (error.message.includes("Script")) {
        throw error;
      }
    }

    try {
      execSync(this.buildCommand, {
        cwd: projectRoot,
        stdio: ["inherit", "pipe", "pipe"],
        encoding: "utf8",
      });
    } catch (error) {
      const errorMessage = error.stderr || error.message || "Unknown error";
      throw new Error(
        `Build command failed in directory ${projectRoot}:\n` +
          `Command: ${this.buildCommand}\n` +
          `Error: ${errorMessage}`
      );
    }
  }

  /**
   * Copy source files to export directory
   */
  copySources() {
    // If buildDir is specified, copy from there instead of entry file location
    if (this.buildDir) {
      const buildPath = path.resolve(this.buildDir);
      if (!fs.existsSync(buildPath)) {
        throw new Error(`Build directory not found: ${buildPath}`);
      }

      this.copyDirectory(buildPath, this.exportDir);
      return;
    }

    // Copy entry file
    const entryFileName = path.basename(this.entryFilePath);
    const entryDestPath = path.join(this.exportDir, entryFileName);
    fs.copyFileSync(this.entryFilePath, entryDestPath);

    // Copy additional source directories
    for (const sourceDir of this.sourceDirs) {
      const sourcePath = path.resolve(sourceDir);
      if (!fs.existsSync(sourcePath)) {
        // Silently skip - already logged
        continue;
      }

      const sourceName = path.basename(sourcePath);
      const destPath = path.join(this.exportDir, sourceName);

      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  /**
   * Install production dependencies
   */
  installDependencies() {
    if (!this.includeNodeModules) {
      return;
    }

    let packageJsonSource = this.packageJsonPath;

    // If no package.json specified, look for one in the entry file's directory
    if (!packageJsonSource) {
      const entryDir = path.dirname(this.entryFilePath);
      const possiblePackageJson = path.join(entryDir, "package.json");
      if (fs.existsSync(possiblePackageJson)) {
        packageJsonSource = possiblePackageJson;
      }
    }

    if (!packageJsonSource || !fs.existsSync(packageJsonSource)) {
      // Silently skip if no package.json
      return;
    }

    // Copy package.json to export directory
    const packageJsonDest = path.join(this.exportDir, "package.json");
    fs.copyFileSync(packageJsonSource, packageJsonDest);

    // Copy package-lock.json if it exists
    const packageLockSource = path.join(
      path.dirname(packageJsonSource),
      "package-lock.json"
    );
    if (fs.existsSync(packageLockSource)) {
      const packageLockDest = path.join(this.exportDir, "package-lock.json");
      fs.copyFileSync(packageLockSource, packageLockDest);
    }

    // Install production dependencies
    try {
      execSync("npm ci --omit=dev --ignore-scripts", {
        cwd: this.exportDir,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (error) {
      // Fallback to npm install if npm ci fails
      try {
        execSync("npm install --production --ignore-scripts", {
          cwd: this.exportDir,
          stdio: ["pipe", "pipe", "pipe"],
        });
      } catch (installError) {
        throw new Error(
          `Failed to install dependencies: ${installError.message}`
        );
      }
    }
  }

  /**
   * Main packaging function
   */
  package() {
    // Run build command first (e.g., TypeScript compilation)
    this.runBuild();

    // Clean export directory if it exists
    if (fs.existsSync(this.exportDir)) {
      fs.rmSync(this.exportDir, { recursive: true, force: true });
    }

    // Create export directory
    fs.mkdirSync(this.exportDir, { recursive: true });

    // Copy source files
    this.copySources();

    // Install dependencies
    this.installDependencies();
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    sourceDirs: [],
    includeNodeModules: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--export-dir") {
      config.exportDir = args[++i];
    } else if (arg === "--source-dirs") {
      // Collect all source directories until next flag
      while (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        config.sourceDirs.push(args[++i]);
      }
    } else if (arg === "--package-json") {
      config.packageJsonPath = args[++i];
    } else if (arg === "--build-command") {
      config.buildCommand = args[++i];
    } else if (arg === "--build-dir") {
      config.buildDir = args[++i];
    } else if (arg === "--no-deps") {
      config.includeNodeModules = false;
    } else if (!arg.startsWith("--") && !config.entryFilePath) {
      // First non-flag argument is the entry file
      config.entryFilePath = arg;
    }
  }

  return config;
}

/**
 * Main execution
 */
function main() {
  try {
    const config = parseArgs();

    if (!config.entryFilePath) {
      throw new Error("Entry file path is required");
    }

    if (!config.exportDir) {
      throw new Error("Export directory is required (--export-dir)");
    }

    const packager = new NodePackager(config);
    packager.package();

    // Output result as JSON for Terraform external data source
    // IMPORTANT: Only JSON should go to stdout, all other output must use stderr
    const result = {
      success: "true",
      build_directory: path.normalize(config.exportDir),
    };

    // This is the ONLY stdout - must be valid JSON
    console.log(JSON.stringify(result));
  } catch (error) {
    // Errors go to stderr, not stdout
    process.stderr.write(`Packaging failed: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { NodePackager };
