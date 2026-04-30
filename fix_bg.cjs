const fs = require('fs');

const fixBg = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[var\(--cream\)\]/g, 'bg-[var(--dark)]');
  content = content.replace(/background: 'var\(--cream\)'/g, "background: 'var(--bg-card)'");
  fs.writeFileSync(file, content);
  console.log('Fixed bg in', file);
};

fixBg('App.tsx');
fixBg('components/PlannerTab.tsx');
