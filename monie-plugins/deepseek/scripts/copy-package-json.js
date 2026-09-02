#!/usr/bin/env node

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copyPackageJson() {
  try {
    const projectRoot = process.cwd();
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const distPath = join(projectRoot, 'dist');
    const distPackageJsonPath = join(distPath, 'package.json');

    const processedDependencies = processDependencies(packageJson.dependencies || {}, projectRoot);
    const processedDevDependencies = processDependencies(packageJson.devDependencies || {}, projectRoot);
    const processedPeerDependencies = processDependencies(packageJson.peerDependencies || {}, projectRoot);

    const buildInfo = getBuildInfo(projectRoot, processedDependencies);

    const distPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description || '',
      main: adjustPath(packageJson.main, 'src/', ''),
      types: adjustPath(packageJson.types, 'src/', ''),
      type: packageJson.type || 'commonjs',
      scripts: {},
      dependencies: processedDependencies,
      devDependencies: packageJson.devDependencies ? processedDevDependencies : undefined,
      peerDependencies: packageJson.peerDependencies ? processedPeerDependencies : undefined,
      peerDependenciesMeta: packageJson.peerDependenciesMeta || {},
      optionalDependencies: packageJson.optionalDependencies || {},
      engines: packageJson.engines || {},
      os: packageJson.os || [],
      cpu: packageJson.cpu || [],
      keywords: packageJson.keywords || [],
      author: packageJson.author || '',
      license: packageJson.license || 'MIT',
      repository: packageJson.repository || {},
      bugs: packageJson.bugs || {},
      homepage: packageJson.homepage || '',
      files: ['**/*'],
      private: false,
      publishConfig: packageJson.publishConfig || {},
      // 添加构建信息
      monie: {
        builtAt: new Date().toISOString(),
        nodeVersion: process.version,
        ...buildInfo
      }
    };

    if (packageJson.type === 'module' && packageJson.exports) {
      distPackageJson.exports = adjustExport(packageJson.exports);
    }

    Object.keys(distPackageJson).forEach(key => {
      if (distPackageJson[key] === undefined)
        delete (distPackageJson[key]);
    });

    writeFileSync(
      distPackageJsonPath,
      JSON.stringify(distPackageJson, null, 2),
      'utf8'
    );

    copyRelatedFiles(projectRoot, distPath);
  } catch (error) {
    console.error('Error copying package.json', error.message);
    process.exit(-1);
  }
}

function processDependencies(dependencies, projectRoot) {
  const processed = {};

  for (const [name, version] of Object.entries(dependencies)) {
    if (typeof version === 'string') {
      if (version.startsWith('file:') || version.startsWith('link:')) {
        const protocol = version.startsWith('file:') ? 'file:' : 'link:';
        const relativePath = version.substring(protocol.length);

        try {
          const absolutePath = resolve(projectRoot, relativePath);

          if (existsSync(absolutePath)) {
            processed[name] = `${protocol}${absolutePath}`;
          } else {
            console.warn(`Path does not exist for ${name}: ${absolutePath}`);
            processed[name] = version;
          }
        } catch (error) {
          console.log(`Failed to resolve path for ${name}: ${version}`);
          processed[name] = version;
        }
      } else {
        processed[name] = version;
      }
    }
  }

  return processed;
}

function getBuildInfo(projectRoot, dependencies) {
  const info = {};

  const moniePluginDep = Object.entries(dependencies).find(([name]) => name === 'monie-plugin');
  if (moniePluginDep) {
    const [, version] = moniePluginDep;
    if (version === 'file:') {
      const pluginPath = version.replace('file:', '');
      const packageJsonPath = join(pluginPath, 'package.json');

      try {
        if (existsSync(packageJsonPath)) {
          const pluginPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
          info.moniePluginVersion = pluginPackageJson.version;
          info.moniePluginCommit = getGitCommitVersion(pluginPath);
        }
      } catch (error) {
      }
    }
  }

  info.commit = getGitCommitVersion(projectRoot);
  return info;
}

function getGitCommitVersion(dir) {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: dir, encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}


function adjustPath(originalPath, search, replace) {
  if (!originalPath) return '';
  return originalPath.replace(new RegExp(search, 'g'), replace);
}

function adjustExport(exportsConfig) {
  if (typeof exportsConfig === 'string') {
    return exportsConfig.replace('src/', '');
  }
  if (typeof exportsConfig === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(exportsConfig)) {
      result[key] = adjustExport(value);
    }
    return result;
  }
  return exportsConfig;
}

function copyRelatedFiles(projectRoot, distPath) {
  const files = [
    { src: '.npmignore', optional: true },
    { src: 'README.md', optional: true },
    { src: 'LICENSE', optional: true },
  ];

  files.forEach(({ src, optional }) => {
    const srcPath = join(projectRoot, src);
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, join(distPath, src));
    } else if (!optional) {
      console.warn(`${src} not found`);
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  copyPackageJson();
}


export default copyPackageJson;

