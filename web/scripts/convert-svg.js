// scripts/convert-svg-to-component.js
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  inputDir: './app/components/base/app-icon/custom',           // SVG 源文件目录
  outputDir: './app/components/base/app-icon/custom-generated',    // 输出组件目录
  componentPrefix: '',          // 组件名前缀（可选）
  componentSuffix: '',      // 组件名后缀（可选）
  useTypescript: true,          // 是否生成 TypeScript
  defaultSize: 24,              // 默认尺寸
};

const convertErrorSvg = ['filled-square.svg', 'lovable.svg', 'vector-square.svg'];

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 将文件名转换为 PascalCase 组件名
function toPascalCase(fileName) {
  // 移除扩展名和特殊字符
  const name = fileName.replace(/\.svg$/i, '').replace(/[^a-zA-Z0-9]/g, '-');
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

// 解析 SVG 内容，提取 viewBox 和 path
function parseSvg(content) {
  // 提取 viewBox
  const viewBoxMatch = content.match(/viewBox=["']([^"']*)["']/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // 提取所有 path 的 d 属性
  const paths = [];
  const pathRegex = /<path\s+([^>]*?)>/g;
  let match;

  while ((match = pathRegex.exec(content)) !== null) {
    const attrs = match[1];
    const dMatch = attrs.match(/d=["']([^"']*)["']/);
    const fillMatch = attrs.match(/fill=["']([^"']*)["']/);

    if (dMatch) {
      paths.push({
        d: dMatch[1],
        fill: fillMatch ? fillMatch[1] : 'currentColor',
      });
    }
  }

  return { viewBox, paths };
}

// 生成 React 组件代码
function generateComponent(componentName, svgContent, options = {}) {
  const { viewBox, paths } = parseSvg(svgContent);
  const defaultSize = options.defaultSize || CONFIG.defaultSize;
  const useTypescript = options.useTypescript !== false;

  // 生成 paths JSX
  const pathsJsx = paths.map((path, index) => {
    const fill = path.fill === 'currentColor' ? 'currentColor' : `"${path.fill}"`;
    return `      <path key={${index}} d="${path.d}" fill={${fill}} />`;
  }).join('\n');

  // TypeScript 类型定义
  const propsType = useTypescript
    ? `interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number;
}`
    : '';

  const component = useTypescript
    ? `const ${componentName} = ({ className, size = ${defaultSize}, ...props }: ${componentName}Props) => {
  const width = props.width ?? size;
  const height = props.height ?? size;
  const currentColor = props.fill ?? 'currentColor';

  return (
    <svg
      className={\`monie-icon \${className || ''}\`}
      {...props}
      viewBox="${viewBox}"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
${pathsJsx}
    </svg>
  );
};`
    : `const ${componentName} = ({ className, size = ${defaultSize}, ...props }) => {
  const width = props.width ?? size;
  const height = props.height ?? size;
  const currentColor = props.fill ?? 'currentColor';

  return (
    <svg
      className={\`monie-icon \${className || ''}\`}
      {...props}
      viewBox="${viewBox}"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
${pathsJsx}
    </svg>
  );
};`;

  const exportCode = `export default ${componentName};`;

  return {
    component,
    propsType,
    exportCode,
    fullCode: `${propsType ? propsType + '\n\n' : ''}${component}\n\n${exportCode}`,
  };
}

// 处理单个 SVG 文件
function processSvgFile(filePath, outputPath, options = {}) {
  try {
    const svgContent = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const componentName = toPascalCase(fileName) + (options.componentSuffix || CONFIG.componentSuffix);

    const { fullCode } = generateComponent(componentName, svgContent, options);

    // 确定输出文件扩展名
    const ext = options.useTypescript !== false ? '.tsx' : '.jsx';
    const outputFile = path.join(outputPath, componentName + ext);

    fs.writeFileSync(outputFile, fullCode, 'utf8');
    console.log(`✅ 已生成: ${outputFile}`);

    return { success: true, componentName, outputFile };
  } catch (error) {
    console.error(`❌ 处理失败 ${filePath}:`, error.message);
    return { success: false, error: error.message };
  }
}

// 批量处理目录中的所有 SVG 文件
function batchProcess(inputDir, outputDir, options = {}) {
  console.log(`\n📁 扫描目录: ${inputDir}`);

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ 目录不存在: ${inputDir}`);
    return;
  }

  ensureDir(outputDir);

  const files = fs.readdirSync(inputDir);
  const svgFiles = files.filter(file => file.toLowerCase().endsWith('.svg'));

  if (svgFiles.length === 0) {
    console.log('⚠️ 未找到 SVG 文件');
    return;
  }

  console.log(`📄 找到 ${svgFiles.length} 个 SVG 文件\n`);

  const results = [];
  for (const file of svgFiles) {
    if (convertErrorSvg.includes(file)) {
      console.warn(`⚠️ 跳过已知转换失败的文件: ${file}`);
      continue;
    }
    const filePath = path.join(inputDir, file);
    const result = processSvgFile(filePath, outputDir, options);
    results.push(result);
  }

  // 生成索引文件
  generateIndexFile(outputDir, results, options);

  console.log(`\n🎉 批量处理完成！共处理 ${results.length} 个文件`);
  console.log(`📁 输出目录: ${outputDir}`);
}

// 生成索引文件
function generateIndexFile(outputDir, results, options = {}) {
  const components = results
    .filter(r => r.success)
    .map(r => r.componentName);

  if (components.length === 0) return;

  // const ext = options.useTypescript !== false ? '.tsx' : '.jsx';
  const indexContent = components.map(name => {
    const fileName = name;
    return `export { default as ${name} } from './${fileName}';`;
  }).join('\n');

  const indexPath = path.join(outputDir, 'index.ts');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`\n📦 已生成索引文件: ${indexPath}`);
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  // 支持命令行参数
  const inputDir = args[0] || CONFIG.inputDir;
  const outputDir = args[1] || CONFIG.outputDir;

  console.log(`
╔════════════════════════════════════════╗
║     SVG to React Component Converter   ║
╚════════════════════════════════════════╝
  `);

  batchProcess(inputDir, outputDir, CONFIG);
}

// 导出模块供其他脚本使用
module.exports = {
  parseSvg,
  generateComponent,
  processSvgFile,
  batchProcess,
  toPascalCase,
};

// 如果直接运行脚本
if (require.main === module) {
  main();
}