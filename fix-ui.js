import fs from 'fs';
import path from 'path';

// 1. Fix Logos
const modifyLogo = (file) => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/h-8 w-auto/g, 'h-16 w-auto');
        content = content.replace(/h-10 w-auto/g, 'h-20 w-auto');
        content = content.replace(/h-14 w-auto/g, 'h-20 w-auto');
        fs.writeFileSync(file, content);
    }
};
['src/components/Navbar.jsx', 'src/components/Footer.jsx', 'src/pages/Login.jsx', 'src/pages/Register.jsx'].forEach(modifyLogo);

// 2. Fix Landing Spacing
let landing = fs.readFileSync('src/pages/Landing.jsx', 'utf8');
landing = landing.replace(/py-32/g, 'py-20');
landing = landing.replace(/py-24/g, 'py-16');
landing = landing.replace(/mb-16/g, 'mb-10');
landing = landing.replace(/gap-12/g, 'gap-8');
landing = landing.replace(/mb-12/g, 'mb-8');
fs.writeFileSync('src/pages/Landing.jsx', landing);

// 3. Fix Leaderboard Avatars & Rankings
let lb = fs.readFileSync('src/pages/Leaderboard.jsx', 'utf8');
lb = lb.replace(/\{v\.name\.charAt\(0\)\}/g, '<img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${v.name}`} alt={v.name} className="w-full h-full rounded-full object-cover border-2 border-white" />');
lb = lb.replace(/\{d\.name\.charAt\(0\)\}/g, '<img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${d.name}`} alt={d.name} className="w-full h-full rounded-full object-cover border-2 border-white" />');
lb = lb.replace(/\{item\.name\.charAt\(0\)\}/g, '<img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.name}`} alt={item.name} className="w-full h-full rounded-full object-cover border-2 border-[#005202]" />');

// Update rank styles to fit the new neo-brutalist theme
lb = lb.replace(/bg-white border-gray-200/g, 'bg-white border-4 border-[#005202] shadow-[4px_4px_0px_#005202]');
lb = lb.replace(/from-yellow-400\/20 to-yellow-600\/10/g, 'bg-white');
lb = lb.replace(/border-yellow-500\/20/g, 'border-4 border-yellow-400 shadow-[6px_6px_0px_#005202]');
lb = lb.replace(/from-gray-300\/10 to-gray-500\/5/g, 'bg-white');
lb = lb.replace(/border-gray-400\/20/g, 'border-4 border-gray-300 shadow-[4px_4px_0px_#005202]');
lb = lb.replace(/from-orange-400\/10 to-orange-600\/5/g, 'bg-white');
lb = lb.replace(/border-orange-500\/20/g, 'border-4 border-orange-400 shadow-[4px_4px_0px_#005202]');
fs.writeFileSync('src/pages/Leaderboard.jsx', lb);

// 4. Fix UI backgrounds in Drives to enforce text visibility mapping
let drives = fs.readFileSync('src/pages/Drives.jsx', 'utf8');
drives = drives.replace(/bg-gray-100/g, 'bg-white'); // Forces white background, triggering the green text override in index.css
fs.writeFileSync('src/pages/Drives.jsx', drives);

console.log('UI issues fixed.');
