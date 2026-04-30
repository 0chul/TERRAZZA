const fs = require('fs');

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/var\(--dark\)/g, 'var(--cream)');
  fs.writeFileSync(file, content);
  console.log('Replaced in', file);
};

replaceInFile('components/PlannerTab.tsx');
replaceInFile('App.tsx');
