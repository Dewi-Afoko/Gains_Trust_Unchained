const fs = require('fs-extra');
const path = require('path');

const SOURCE = path.join(__dirname, '../../Gains_Trust');
const DEST = path.join(__dirname, '../resources/backend');

// Files and folders to exclude from the backend bundle
const EXCLUDE_PATTERNS = [
  'venv',
  'env',
  '__pycache__',
  '*.pyc',
  '.pytest_cache',
  'node_modules',
  '.git',
  'frontend_build',
  'staticfiles',
  'htmlcov',
  '.coverage',
  '*.log',
  'db.sqlite3',
  '.DS_Store',
  '*.pem',
  '*.key',
];

/**
 * Check if a file should be excluded based on patterns
 */
function shouldExclude(filePath) {
  const basename = path.basename(filePath);

  return EXCLUDE_PATTERNS.some((pattern) => {
    if (pattern.includes('*')) {
      // Convert glob pattern to regex
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\./g, '\\.'));
      return regex.test(basename);
    }
    return basename === pattern;
  });
}

/**
 * Build the backend for distribution
 */
async function buildBackend() {
  console.log('🔨 Building backend...');
  console.log('Source:', SOURCE);
  console.log('Destination:', DEST);

  try {
    // Clean destination
    console.log('Cleaning destination directory...');
    await fs.remove(DEST);
    await fs.ensureDir(DEST);

    // Copy backend files with filtering
    console.log('Copying backend files...');
    await fs.copy(SOURCE, DEST, {
      filter: (src) => {
        // Always copy directories (filtering happens on files)
        const stats = fs.statSync(src);
        if (stats.isDirectory()) {
          return !shouldExclude(src);
        }

        // Filter files
        return !shouldExclude(src);
      },
    });

    // Create a production requirements.txt (exclude dev dependencies)
    console.log('Creating production requirements.txt...');
    const requirementsPath = path.join(SOURCE, 'requirements.txt');
    if (await fs.pathExists(requirementsPath)) {
      const requirements = await fs.readFile(requirementsPath, 'utf8');

      // Filter out development dependencies
      const prodRequirements = requirements
        .split('\n')
        .filter((line) => {
          const lower = line.toLowerCase();
          return (
            line.trim() !== '' &&
            !line.startsWith('#') &&
            !lower.includes('pytest') &&
            !lower.includes('black') &&
            !lower.includes('flake8') &&
            !lower.includes('coverage')
          );
        })
        .join('\n');

      await fs.writeFile(path.join(DEST, 'requirements.txt'), prodRequirements);
    }

    console.log('✅ Backend built successfully!');
    console.log('Output:', DEST);
  } catch (error) {
    console.error('❌ Error building backend:', error);
    throw error;
  }
}

// Run the build
buildBackend().catch((error) => {
  console.error(error);
  process.exit(1);
});
