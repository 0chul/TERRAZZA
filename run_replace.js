const fs = require('fs');
const file = 'components/PlannerTab.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/var\(--dark\)/g, 'var(--cream)');
fs.writeFileSync(file, content);
