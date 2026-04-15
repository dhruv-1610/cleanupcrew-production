import fs from 'fs';

// --- Fix Leaderboard.jsx ---
let lb = fs.readFileSync('src/pages/Leaderboard.jsx', 'utf8');

// 1. Profiles become pixel-art (humans) instead of bottts
lb = lb.replace(/bottts/g, 'pixel-art');

// 2. Badges become bottts (robots) instead of identicon
// In the list view:
lb = lb.replace(/identicon\/svg\?seed=\$\{badge\.name\}&rowColor=10b981/g, 'bottts/svg?seed=${badge.name}');
// In the Badge earned section:
lb = lb.replace(/identicon\/svg\?seed=\$\{badge\.name\}&rowColor=10b981/g, 'bottts/svg?seed=${badge.name}');

fs.writeFileSync('src/pages/Leaderboard.jsx', lb);

// --- Fix Landing.jsx (Mini Leaderboard) ---
let landing = fs.readFileSync('src/pages/Landing.jsx', 'utf8');
// Profiles become pixel-art instead of bottts
landing = landing.replace(/bottts/g, 'pixel-art');
fs.writeFileSync('src/pages/Landing.jsx', landing);

console.log('Avatars swapped.');
