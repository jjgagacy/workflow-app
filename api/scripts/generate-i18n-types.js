const fs = require('fs');
const path = require('path');

function generateTypes() {
    const i18nPath = path.join(__dirname, '../src/i18n');
    const outputPath = path.join(__dirname, '../src/generated/i18n.generated.ts');

    const languages = fs.readdirSync(i18nPath);
    const readLang = 'zh-Hans';
    const enFiles = fs.readdirSync(path.join(i18nPath, readLang));

    let typeDefinition = `export interface I18nTranslations {\n`;

    enFiles.forEach(file => {
        if (path.extname(file) === '.json') {
            const namespace = path.basename(file, '.json');
            const filePath = path.join(i18nPath, readLang, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            typeDefinition += `  ${namespace}: ${generateInterface(content, 2)};\n`;
        }
    });

    typeDefinition += `}\n`;

    // 确保目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, typeDefinition);
    console.log('i18n types generated successfully!');
}

function generateInterface(obj, indent) {
    const spaces = ' '.repeat(indent);
    let result = '{\n';

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result += `${spaces}  ${key}: string;\n`;
        } else if (typeof value === 'object') {
            result += `${spaces}  ${key}: ${generateInterface(value, indent + 2)};\n`;
        }
    }

    result += `${spaces}}`;
    return result;
}

generateTypes();