const FT0=__FT__;const FAMS=['Hanken Grotesk','Newsreader','DM Mono'];
const hx=s=>{const[h,a]=s.split('/');return{r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255,a:a?+a:1}};
const GG=a=>({cx:a[0],cy:a[1],w:a[2],h:a[3],a:a[4]||0});
const VV=v=>{if(!v)return{};const o={};if(v.bg)o.bg=hx(v.bg);if(v.im)o.images=v.im;if(v.grad)o.grad={angle:v.grad[0],stops:v.grad[1].map(s=>({c:hx(s[0]),pos:s[1]}))};if(v.el)o.ellipse=true;if(v.rd)o.radius=v.rd;if(v.sh)o.shadows=v.sh.map(s=>({inset:!!s[0],c:hx(s[1]),x:s[2],y:s[3],blur:s[4],spread:s[5]}));if(v.opacity!=null)o.opacity=v.opacity;if(v.blend)o.blend=v.blend;return o};
const FTX=FT0.map(a=>({fam:FAMS[a[0]],w:a[1],it:!!a[2],size:a[3],lh:a[4],ls:a[5],u:!!a[6]}));
if(D.frame)D.frame.v=VV(D.frame.v);
D.ops=D.ops.map(o=>{const p=o.p||null;switch(o.t){case'g':return{t:'group',k:o.k,p,n:o.n,g:GG(o.g),v:VV(o.v)};case'r':return{t:'rect',p,g:GG(o.g),v:VV(o.v)};case'l':return{t:'line',p,pts:o.pts,w:o.w,c:hx(o.c),dash:o.d||null};case'x':return{t:'text',p,g:GG(o.g),text:o.s,runs:o.r.map(r=>({start:r[0],l:r[1],f:{...FTX[r[2]],c:hx(r[3])}})),align:o.al==='c'?'center':o.al==='r'?'right':'left',single:!!o.one};default:return o}});
