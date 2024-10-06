#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import minimist from 'minimist';

// Parse command-line arguments
const args = minimist(process.argv.slice(2), {
  boolean: ['sall'], // Ensure sall is treated as a boolean flag
});
const targetDir = args._[0] || '.';
const showAll = args.sall === true;
const excludeDotFiles = args.dotfiles === false && !showAll;
const excludeDirs = args.exclude && !showAll ? args.exclude.split(',') : [];

// Helper function to determine file type and apply color
function getColoredName(item, fullPath) {
  const isDirectory = fs.lstatSync(fullPath).isDirectory();
  const ext = path.extname(item);

  // Directory: Blue color
  if (isDirectory) return chalk.blue.bold(item);

  // Handle lock files specifically
  if (item === 'package-lock.json' || item === 'yarn.lock' || item === 'pnpm-lock.yaml' || item === 'bun.lockb') {
    return chalk.red(item); // Red for all lock files
  }

  // YAML files: Orange/Yellow
  if (ext === '.yaml' || ext === '.yml') {
    return chalk.hex('#FFA500')(item); // Orange
  }

  // Other file types with colors
  switch (ext) {
    case '.js':
      return chalk.yellow(item);
    case '.json':
      return chalk.green(item);
    case '.md':
      return chalk.magenta(item);
    case '.html':
      return chalk.cyan(item);
    case '.css':
      return chalk.blue(item);
    case '.ts':
      return chalk.greenBright(item);
    default:
      return chalk.white(item); // Default color for unknown types
  }
}

// Utility function to create the directory tree
function generateTree(dir, prefix = '') {
  if (excludeDirs.includes(path.basename(dir)) && !showAll) return;

  // Read contents of the directory
  const items = fs.readdirSync(dir);

  // Filter items based on flags
  const filteredItems = items.filter(item => {
    const fullPath = path.join(dir, item);

    // Exclude nothing if --sall is true
    if (showAll) return true;

    // Otherwise, exclude .git, node_modules, dotfiles, and user-specified directories
    if (item === '.git' || item === 'node_modules') return false;
    if (excludeDotFiles && item.startsWith('.')) return false;
    return true;
  });

  // Iterate over each item
  filteredItems.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const isDirectory = fs.lstatSync(fullPath).isDirectory();

    // Apply color based on type and print the tree structure
    const coloredName = getColoredName(item, fullPath);
    console.log(`${prefix}${index === filteredItems.length - 1 ? '└── ' : '├── '}${coloredName}`);

    // Recursively generate tree for subdirectories
    if (isDirectory) {
      generateTree(fullPath, `${prefix}${index === filteredItems.length - 1 ? '    ' : '│   '}`);
    }
  });
}

// Start generating the tree
generateTree(targetDir);
