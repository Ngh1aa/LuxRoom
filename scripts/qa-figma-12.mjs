import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.cwd());
const routes=['figma-12.html','figma-01-overview.html','figma-02-research.html','figma-03-strategy.html','figma-04-ia.html','figma-05-user-flows.html','figma-06-wireframes.html','figma-07-design-system.html','figma-08-components-states.html','figma-09-final-ui.html','figma-10-responsive.html','figma-11-prototype.html','figma-12-iteration-handoff.html'];
let assertions=0;
for(const file of routes){
  const source=await readFile(path.join(root,file),'utf8');
  for(const required of ['css/design-system.css','css/common.css','css/figma-case-study.css','css/figma-12.css']){
    if(!source.includes(required)) throw new Error(`${file}: missing ${required}`);
    await access(path.join(root,required)); assertions+=2;
  }
  if(source.includes('<script')) throw new Error(`${file}: Figma evidence route must stay static`);
  if(!source.includes('figma-frame')) throw new Error(`${file}: missing importer-friendly frame`);
  assertions+=2;
}
for(let i=1;i<=12;i++){const needle=String(i).padStart(2,'0');const matches=routes.filter(file=>file.includes(`figma-${needle}-`));if(matches.length!==1)throw new Error(`Screen ${needle}: expected exactly one numbered route`);assertions+=1}
console.log(`PASS: ${assertions} Figma-12 static route assertions.`);
