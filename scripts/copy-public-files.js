#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const ncp = promisify(require('ncp').ncp);

const sourceDir = path.join(__dirname, '..', 'public');
const destDir = path.join(__dirname, '..', 'dist');

// Ignore specific files that shouldn't be copied
const ignoreFiles = ['**/.DS_Store', '**/Thumbs.db'];

async function copyPublicFiles() {
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    console.log('Copying public files...');
    
    // Copy files with progress
    await ncp(sourceDir, destDir, {
      filter: (source) => {
        const relativePath = path.relative(sourceDir, source);
        return !ignoreFiles.some(pattern => {
          const regex = new RegExp(pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '[^/]')
          );
          return regex.test(relativePath);
        });
      },
      clobber: true, // Overwrite existing files
      stopOnErr: true
    });

    console.log('Public files copied successfully!');
  } catch (error) {
    console.error('Error copying public files:', error);
    process.exit(1);
  }
}

copyPublicFiles();
