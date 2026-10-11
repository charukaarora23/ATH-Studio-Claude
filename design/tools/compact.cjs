// Compact encoding of ops.json -> chunks2/NN.json (font table + hex colours + short keys)
const fs=require('fs');const [,,opsFile,outDir,limitArg]=process.argv;const LIMIT=+limitArg||27000;
const frames=JSON.parse(fs.readFileSync(opsFile,'utf8'));fs.mkdirSync(outDir,{recursive:true});
const R1=n=>Math.round(n*10)/10;
const hx=c=>{const h='#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');return c.a<1?h+'/'+Math.round(c.a*1000)/1000:h};
const FAM=['Hanken Grotesk','Newsreader','DM Mono'];const FT=[];const fkey=f=>[FAM.indexOf(f.fam),f.w,f.it?1:0,f.size,f.lh,f.ls,f.u?1:0];
const fidx=f=>{const k=JSON.stringify(fkey(f));let i=FT.findIndex(x=>JSON.stringify(x)===k);if(i<0){FT.push(fkey(f));i=FT.length-1}return i};
const G=g=>{const a=[R1(g.cx),R1(g.cy),R1(g.w),R1(g.h)];if(g.a)a.push(g.a);return a};
const V=v=>{const o={};if(v.bg)o.bg=hx(v.bg);if(v.images)o.im=v.images;if(v.grad)o.grad=[v.grad.angle,v.grad.stops.map(s=>[hx(s.c),Math.round(s.pos*1000)/1000])];if(v.ellipse)o.el=1;if(v.radius)o.rd=v.radius;if(v.shadows)o.sh=v.shadows.map(s=>[s.inset?1:0,hx(s.c),s.x,s.y,s.blur,s.spread]);if(v.opacity!=null)o.opacity=v.opacity;if(v.blend)o.blend=v.blend;return o};
const enc=o=>{const p=o.p||undefined;switch(o.t){
 case 'group':return{t:'g',k:o.k,p,n:o.n,g:G(o.g),v:V(o.v)};
 case 'rect':return{t:'r',p,g:G(o.g),v:V(o.v)};
 case 'line':return{t:'l',p,pts:o.pts.map(R1),w:o.w,c:hx(o.c),d:o.dash||undefined};
 case 'text':{const runs=o.runs.map(r=>[r.start,r.s.length,fidx(r.f),hx(r.f.c)]);const al=/center/.test(o.align)?'c':/right|end/.test(o.align)?'r':undefined;return{t:'x',p,g:G(o.g),s:o.text,r:runs,al,one:o.single?1:undefined}}
 default:return o}};
const pos={};let dx=0,mx=0,sx=0;
for(const f of frames){const n=parseInt(f.name,10);if(n<=7){pos[f.name]={x:dx,y:400};dx+=f.w+160}else if(n<=10){pos[f.name]={x:mx,y:1600};mx+=f.w+120}else{pos[f.name]={x:sx,y:2700};sx+=f.w+160}}
const list=[];
for(const f of frames){const ops=f.ops.map(enc);let chunk=[],size=0,part=0;
 const flush=()=>{if(!chunk.length)return;list.push({frame:f.name,part:part++,data:{frame:{name:f.name,w:f.w,h:f.h,v:V(f.v),...pos[f.name]},ops:chunk}});chunk=[];size=0};
 for(const o of ops){const s=JSON.stringify(o).length+2;if(size+s>LIMIT)flush();chunk.push(o);size+=s}flush()}
fs.writeFileSync(outDir+'/fonts.json',JSON.stringify(FT));
list.forEach((c,i)=>{fs.writeFileSync(`${outDir}/${String(i).padStart(2,'0')}.json`,JSON.stringify(c));console.log(i,c.frame,'part',c.part,JSON.stringify(c.data).length)});
console.log('fonts',JSON.stringify(FT).length);
