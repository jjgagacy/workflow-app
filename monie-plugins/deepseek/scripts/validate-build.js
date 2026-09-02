import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validateBuild() {
  try {
    const projectRoot = process.cwd();
    const distPath = join(projectRoot, 'dist');

    if (!existsSync(distPath)) {
      throw new Error('dist directory does not exists');
    }

    const requiredFiles = [
      'package.json',
      'manifest.yaml',
      'index.js',
    ];

    const missingFiles = [];
    for (const file of requiredFiles) {
      const filePath = join(distPath, file);
      if (!existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files in dist/: ${missingFiles.join(',')}`);
    }

    const packageJsonPath = join(distPath, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    const requiredFields = ['name', 'version', 'main'];
    const missingFields = [];
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in dist/package.json: ${missingFields.join(', ')}`);
    }

  } catch (error) {
    console.error('Build validation failed: ', error.message);
    process.exit(-1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  validateBuild();
}

export default validateBuild;
