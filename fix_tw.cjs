const fs = require('fs');

const file = 'components/PlannerTab.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/divide-gray-100/g, 'divide-[rgba(201,150,58,0.1)]');
txt = txt.replace(/text-gray-800/g, 'text-[var(--cream)]');
txt = txt.replace(/text-gray-600/g, 'text-[var(--mist)]');
txt = txt.replace(/text-gray-500/g, 'text-[var(--stone)]');
txt = txt.replace(/text-gray-400/g, 'text-[var(--stone)]');
txt = txt.replace(/text-[a-z]+-900/g, 'text-[var(--amber)]');
txt = txt.replace(/bg-amber-50\/30/g, 'bg-[rgba(201,150,58,0.03)]');
txt = txt.replace(/bg-amber-50/g, 'bg-[rgba(201,150,58,0.1)]');
txt = txt.replace(/border-amber-100/g, 'border-[rgba(201,150,58,0.2)]');
txt = txt.replace(/hover:bg-gray-50/g, 'hover:bg-[rgba(201,150,58,0.05)]');

fs.writeFileSync(file, txt);
console.log('Fixed hardcoded tailwind in PlannerTab');
