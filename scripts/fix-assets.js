const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const assetsPath = path.join(distPath, 'assets');
const nodeModulesPath = path.join(assetsPath, 'node_modules');
const vPath = path.join(assetsPath, 'v');

// 1. Mover pasta node_modules para v
if (fs.existsSync(nodeModulesPath)) {
    fs.renameSync(nodeModulesPath, vPath);
    console.log('Pasta node_modules renomeada para v.');
}

// 2. Substituir caminhos recursivamente
function replaceInFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('/assets/node_modules')) {
                const newContent = content.replace(/\/assets\/node_modules/g, '/assets/v');
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    });
}

replaceInFiles(distPath);
console.log('Caminhos nos arquivos atualizados para /assets/v.');
