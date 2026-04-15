import fs from 'fs';

// --- 1. Fix CSS for .force-white ---
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('.force-white')) {
    css += '\n\n/* Override to force white text inside cards */\n.force-white, .force-white * {\n  color: #ffffff !important;\n}\n';
    fs.writeFileSync('src/index.css', css);
}

// --- 2. Fix Landing.jsx ---
let landing = fs.readFileSync('src/pages/Landing.jsx', 'utf8');

// Swap 35 DRIVES badge and CLEAN TRACK IMPACT
const statBadge = `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-[#008303] border-4 border-[#005202] font-extrabold text-sm mb-8 shadow-[4px_4px_0px_#005202]">
                        <Sparkles size={16} /> {mockStats.completedDrives} DRIVES COMPLETED NATIONWIDE
                    </motion.div>`;

const titleHtml = `<motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-6xl sm:text-8xl lg:text-[140px] font-black leading-none tracking-tight mb-8 drop-shadow-[4px_4px_0px_#005202]">
                        CLEAN. TRACK.<br />IMPACT.
                    </motion.h1>`;

// They are back-to-back in the file, let's swap them
if (landing.includes(statBadge) && landing.includes(titleHtml)) {
    landing = landing.replace(statBadge, '[[STAT_BADGE]]');
    landing = landing.replace(titleHtml, '[[TITLE_HTML]]');
    landing = landing.replace('[[STAT_BADGE]]', titleHtml);
    landing = landing.replace('[[TITLE_HTML]]', statBadge);
}

// Fix invisible texts in DriveCard
landing = landing.replace('bg-[#008303] flex justify-between items-center text-white', 'bg-[#008303] flex justify-between items-center force-white');
landing = landing.replace('bg-[#008303] text-white font-bold', 'bg-[#008303] force-white font-bold'); // View info button
landing = landing.replace('bottts', 'pixel-art'); // avatars

fs.writeFileSync('src/pages/Landing.jsx', landing);

// --- 3. Fix Drives.jsx ---
let drives = fs.readFileSync('src/pages/Drives.jsx', 'utf8');
drives = drives.replace('bg-[#008303] flex justify-between items-center text-white', 'bg-[#008303] flex justify-between items-center force-white');
drives = drives.replace('bg-[#008303] text-white font-black', 'bg-[#008303] force-white font-black'); // View info button
fs.writeFileSync('src/pages/Drives.jsx', drives);

// --- 4. Fix Leaderboard.jsx ---
let lb = fs.readFileSync('src/pages/Leaderboard.jsx', 'utf8');
lb = lb.replace('bg-[#008303] text-white', 'bg-[#008303] force-white');
lb = lb.replace('bg-[#008303] text-white', 'bg-[#008303] force-white'); // replace both tabs
lb = lb.replace('bg-[#008303] text-white', 'bg-[#008303] force-white'); // badges req
lb = lb.replace('bg-[#008303] text-white', 'bg-[#008303] force-white');
// replace bottts with pixel-art globally
lb = lb.replace(/bottts/g, 'pixel-art');
// replace lucide icons for Badges with pixel-art seeds
lb = lb.replace(/<div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">\{badge\.icon\}<\/div>/g, '<img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${badge.name}`} alt="Badge" className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform bg-[#f0fdf4] rounded-lg border-2 border-[#005202]" />');
fs.writeFileSync('src/pages/Leaderboard.jsx', lb);

// --- 5. Fix Transparency.jsx ---
let trans = fs.readFileSync('src/pages/Transparency.jsx', 'utf8');
trans = trans.replace(/<img src="\/images\/logo-light\.png".*?\/>/, '');
fs.writeFileSync('src/pages/Transparency.jsx', trans);

// --- 6. Fix Navbar.jsx ---
let nav = fs.readFileSync('src/components/Navbar.jsx', 'utf8');
if (!nav.includes('>HOME<')) {
    nav = nav.replace(/<Link to="\/drives" className="nav-link">/g, '<Link to="/" className="nav-link text-white font-bold mr-4">HOME</Link>\n              <Link to="/drives" className="nav-link text-white force-white">');
}
fs.writeFileSync('src/components/Navbar.jsx', nav);

console.log('Final polish applied successfully.');
