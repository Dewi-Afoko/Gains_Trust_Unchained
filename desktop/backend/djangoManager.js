const { spawn } = require('child_process');
const axios = require('axios');
const findFreePort = require('find-free-port');
const path = require('path');

class DjangoManager {
  constructor(backendDir, isDev = false) {
    this.backendDir = backendDir;
    this.isDev = isDev;
    this.process = null;
    this.port = 8000;
    this.serverUrl = '';
    this.ready = false;
  }

  /**
   * Start the Django development server
   * @returns {Promise<string>} The server URL (e.g., http://127.0.0.1:8000)
   */
  async start() {
    try {
      // Find an available port
      const [freePort] = await findFreePort(this.port);
      this.port = freePort;
      this.serverUrl = `http://127.0.0.1:${this.port}`;

      console.log(`Starting Django server on port ${this.port}...`);

      // Determine Python command (try python3 first, fallback to python)
      const pythonCmd = await this._getPythonCommand();
      const managePath = path.join(this.backendDir, 'manage.py');

      // Set up environment variables
      const env = {
        ...process.env,
        DJANGO_SETTINGS_MODULE: 'Gains_Trust.settings_desktop',
        PYTHONUNBUFFERED: '1',
        DEBUG: 'True',
      };

      // Start Django as a child process
      this.process = spawn(
        pythonCmd,
        [managePath, 'runserver', `127.0.0.1:${this.port}`, '--noreload'],
        {
          cwd: this.backendDir,
          env,
        }
      );

      // Log Django output
      this.process.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Django] ${output}`);

        // Check if server is starting
        if (output.includes('Starting development server')) {
          console.log('Django server is starting...');
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error(`[Django Error] ${data}`);
      });

      this.process.on('close', (code) => {
        console.log(`Django process exited with code ${code}`);
        this.ready = false;
        this.process = null;
      });

      this.process.on('error', (err) => {
        console.error('Failed to start Django process:', err);
        throw err;
      });

      // Wait for server to be ready
      await this._waitForServer();

      this.ready = true;
      console.log(`Django server ready at ${this.serverUrl}`);

      return this.serverUrl;
    } catch (error) {
      console.error('Error starting Django server:', error);
      throw error;
    }
  }

  /**
   * Stop the Django server gracefully
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.process) {
      return;
    }

    console.log('Stopping Django server...');

    return new Promise((resolve) => {
      const cleanup = () => {
        this.process = null;
        this.ready = false;
        resolve();
      };

      // Set up close handler
      this.process.on('close', cleanup);

      // Try graceful shutdown with SIGTERM
      this.process.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          console.log('Force killing Django server...');
          this.process.kill('SIGKILL');
          cleanup();
        }
      }, 5000);
    });
  }

  /**
   * Check if Django server is ready by polling health endpoint
   * @param {number} timeout - Maximum time to wait in milliseconds
   * @returns {Promise<boolean>}
   */
  async _waitForServer(timeout = 30000) {
    const startTime = Date.now();
    const interval = 500; // Check every 500ms

    while (Date.now() - startTime < timeout) {
      try {
        // Try to connect to the server
        await axios.get(this.serverUrl, {
          timeout: 1000,
          validateStatus: () => true, // Accept any status code
        });

        // If we get here, server is responding
        return true;
      } catch (error) {
        // Server not ready yet, wait and try again
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error(`Django server failed to start within ${timeout}ms`);
  }

  /**
   * Determine which Python command to use
   * @returns {Promise<string>}
   */
  async _getPythonCommand() {
    const { promises: fs } = require('fs');
    const { spawn } = require('child_process');

    // First, try to find the user's virtual environment (works in both dev and prod)
    // In production, the venv should be at the user's project location
    const venvPaths = [
      path.join(this.backendDir, '..', 'gains_trust_venv', 'bin', 'python'), // Dev mode
      '/Users/dewi/Desktop/programming/projects/Gains_Trust_Unchained/gains_trust_venv/bin/python', // Prod - absolute path
    ];

    for (const venvPath of venvPaths) {
      try {
        await fs.access(venvPath);
        console.log('Using virtual environment Python:', venvPath);
        return venvPath;
      } catch {
        // Try next path
      }
    }

    // Try different Python commands in order
    // In production, also check for pyenv Python
    const pythonCommands = [
      '/Users/dewi/.pyenv/shims/python3', // User's pyenv Python
      '/usr/local/bin/python3',
      '/opt/homebrew/bin/python3',
      '/usr/bin/python3',
      'python3',
      'python',
    ];

    for (const cmd of pythonCommands) {
      try {
        // Test if the command exists by running --version
        const fullPath = await new Promise((resolve, reject) => {
          const test = spawn(cmd, ['--version'], { shell: true });
          test.on('close', (code) => {
            if (code === 0) {
              // If it's a relative command, try to get the full path
              if (!path.isAbsolute(cmd)) {
                const which = spawn('which', [cmd]);
                let output = '';
                which.stdout.on('data', (data) => {
                  output += data.toString();
                });
                which.on('close', (code) => {
                  if (code === 0) {
                    resolve(output.trim());
                  } else {
                    resolve(cmd); // Fallback to command name
                  }
                });
              } else {
                resolve(cmd);
              }
            } else {
              reject();
            }
          });
          test.on('error', reject);
        });

        console.log('Found Python command:', fullPath);
        return fullPath;
      } catch {
        // Try next command
        continue;
      }
    }

    throw new Error('Python not found. Please install Python 3.9+ and ensure it is in your PATH.');
  }

  /**
   * Check if the server is currently running
   * @returns {boolean}
   */
  isRunning() {
    return this.ready && this.process !== null;
  }

  /**
   * Get the current server URL
   * @returns {string}
   */
  getUrl() {
    return this.serverUrl;
  }
}

module.exports = DjangoManager;
