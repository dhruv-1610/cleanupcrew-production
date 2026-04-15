import fs from 'fs';
import path from 'path';

const filesToUpdate = [];

function findFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            filesToUpdate.push(fullPath);
        }
    }
}

findFiles('./src');

filesToUpdate.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Background colors
    content = content.replace(/bg-dark-950/g, 'bg-gray-50');
    content = content.replace(/bg-dark-900/g, 'bg-gray-100');

    // Translucent backgrounds
    content = content.replace(/bg-white\/3/g, 'bg-white');
    content = content.replace(/bg-white\/5/g, 'bg-white shadow-sm border border-gray-100');
    content = content.replace(/bg-white\/10/g, 'bg-gray-50 border border-gray-200');

    // Borders
    content = content.replace(/border-white\/5/g, 'border-gray-200');
    content = content.replace(/border-white\/10/g, 'border-gray-200');
    content = content.replace(/border-white\/20/g, 'border-gray-300');

    // Dividers
    content = content.replace(/divide-white\/5/g, 'divide-gray-200');

    // Text colors - Order matters
    content = content.replace(/text-gray-500/g, 'text-gray-600');
    content = content.replace(/text-gray-400/g, 'text-gray-500');
    content = content.replace(/text-white/g, 'text-gray-900');
    content = content.replace(/hover:text-white/g, 'hover:text-gray-900');

    // Replace logos for light theme (needs the darker logo)
    content = content.replace(/logo-light\.png/g, 'logo-dark.png');

    fs.writeFileSync(file, content);
});

console.log('JSX refactoring complete.');
