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

    // Let's add more spacing to make it cleaner and uncluttered.
    // We need to match precise classes using word boundaries so we don't accidentally replace part of another class.

    // Padding Y sections (often in section containers)
    content = content.replace(/\bpy-16\b/g, 'py-24');
    content = content.replace(/\bpy-24\b/g, 'py-32');
    content = content.replace(/\bpt-24\b/g, 'pt-32');
    content = content.replace(/\bpb-16\b/g, 'pb-24');

    // Gaps
    content = content.replace(/\bgap-4\b/g, 'gap-6');
    content = content.replace(/\bgap-6\b/g, 'gap-8');
    content = content.replace(/\bgap-8\b/g, 'gap-12');

    // Margins
    content = content.replace(/\bmb-4\b/g, 'mb-6');
    content = content.replace(/\bmb-6\b/g, 'mb-8');
    content = content.replace(/\bmb-8\b/g, 'mb-12');
    content = content.replace(/\bmb-12\b/g, 'mb-16');

    // Card paddings
    content = content.replace(/\bp-6\b/g, 'p-8');
    content = content.replace(/\bp-8\b/g, 'p-10');

    fs.writeFileSync(file, content);
});

console.log('Spacing refactoring complete.');
