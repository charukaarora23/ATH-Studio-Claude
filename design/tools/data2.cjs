const fs=require('fs');const [,,i,state]=process.argv;
const c=JSON.parse(fs.readFileSync(`chunks2/${String(i).padStart(2,'0')}.json`,'utf8'));
const st=state?JSON.parse(state):{};const d={...c.data,...st};const ops=d.ops;delete d.ops;
process.stdout.write('const D='+JSON.stringify(d).slice(0,-1)+(Object.keys(d).length?',':'')+'"ops":[\n'+ops.map(o=>JSON.stringify(o)).join(',\n')+']};\n');
