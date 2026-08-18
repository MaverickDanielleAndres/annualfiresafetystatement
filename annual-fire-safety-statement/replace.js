const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('app');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('<CTASection')) {
    c = c.replace(/<CTASection[\s\S]*?\/>/g, '<ContactCTA />');
    if (!c.includes('import ContactCTA')) {
      c = c.replace('import CTASection from "@/components/CTASection";', 'import ContactCTA from "@/components/ContactCTA";');
    }
    fs.writeFileSync(f, c);
  }
});
