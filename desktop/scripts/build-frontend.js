const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../../frontend');
const BUILD_DIR = path.join(FRONTEND_DIR, 'build');
const DEST = path.join(__dirname, '../resources/frontend');
const DJANGO_DEST = path.join(__dirname, '../resources/backend/frontend_build'); // Where Django expects it

/**
 * Build the frontend for distribution
 */
async function buildFrontend() {
  console.log('🔨 Building frontend...');
  console.log('Frontend directory:', FRONTEND_DIR);
  console.log('Destination:', DEST);

  try {
    // Set environment variables for production build
    process.env.REACT_APP_API_BASE_URL = '/api'; // Use relative URL for Django
    process.env.NODE_ENV = 'production';

    // Build React app
    console.log('Running npm run build...');
    execSync('npm run build', {
      cwd: FRONTEND_DIR,
      stdio: 'inherit',
      env: process.env,
    });

    // Verify build directory exists
    if (!(await fs.pathExists(BUILD_DIR))) {
      throw new Error('Build directory not found after running npm build');
    }

    // Clean destination
    console.log('Cleaning destination directory...');
    await fs.remove(DEST);

    // Copy build to resources (for reference)
    console.log('Copying build files to resources...');
    await fs.copy(BUILD_DIR, DEST);

    // Also copy to Django's expected location
    console.log('Copying build files to Django frontend_build...');
    await fs.remove(DJANGO_DEST);
    await fs.copy(BUILD_DIR, DJANGO_DEST);

    console.log('✅ Frontend built successfully!');
    console.log('Output:', DEST);
    console.log('Django location:', DJANGO_DEST);
  } catch (error) {
    console.error('❌ Error building frontend:', error);
    throw error;
  }
}

// Run the build
buildFrontend().catch((error) => {
  console.error(error);
  process.exit(1);
});
