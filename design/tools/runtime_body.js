const IMG={grain:'522d4bea723b964b3fe1e0995b2e088ec8c1b7a4',fibre:'7b6504128a50f1b163b37d29737bc904ee5ba612'};

const SW={300:'Light',400:'Regular',500:'Medium',600:'SemiBold',700:'Bold',800:'ExtraBold'};
const fn=f=>{let s=SW[f.w]||'Regular';if(f.fam==='DM Mono'&&f.w>500)s='Medium';if(f.it)s=s==='Regular'?'Italic':s+' Italic';const fam=['Hanken Grotesk','Newsreader','DM Mono'].includes(f.fam)?f.fam:'Hanken Grotesk';return{family:fam,style:s}};
const fk=f=>f.family+'|'+f.style;const need={};
for(const o of D.ops)if(o.t==='text')for(const r of o.runs){const n=fn(r.f);need[fk(n)]=n}
await Promise.all(Object.values(need).map(n=>figma.loadFontAsync(n)));
const sol=c=>({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a});
const fills=v=>{const f=[];if(v.bg)f.push(sol(v.bg));if(v.grad){const g=v.grad;f.push({type:'GRADIENT_LINEAR',gradientTransform:g.angle===90?[[1,0,0],[0,1,0]]:[[0,1,0],[-1,0,1]],gradientStops:g.stops.map(s=>({position:s.pos,color:{r:s.c.r,g:s.c.g,b:s.c.b,a:s.c.a}}))})}
 if(v.images)for(const k of v.images.slice().reverse())if(IMG[k])f.push({type:'IMAGE',imageHash:IMG[k],scaleMode:'TILE',scalingFactor:1});return f};
let frame,K=D.keys||{};
if(D.frameId)frame=await figma.getNodeByIdAsync(D.frameId);else{frame=figma.createFrame();frame.name=D.frame.name;frame.resize(D.frame.w,D.frame.h);frame.x=D.frame.x;frame.y=D.frame.y;frame.fills=fills(D.frame.v);frame.clipsContent=true}
const P={};const par=async k=>{if(!k)return{n:frame,tx:0,ty:0,a:0};if(!P[k])P[k]=await figma.getNodeByIdAsync(K[k].id);return{n:P[k],tx:K[k].tx,ty:K[k].ty,a:K[k].a}};
const loc=(pp,x,y)=>{const r=-pp.a*Math.PI/180,dx=x-pp.tx,dy=y-pp.ty;return[dx*Math.cos(r)-dy*Math.sin(r),dx*Math.sin(r)+dy*Math.cos(r)]};
const place=(n,g,pp)=>{const a=g.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);const tx=g.cx+c*(-g.w/2)-s*(-g.h/2),ty=g.cy+s*(-g.w/2)+c*(-g.h/2);const[lx,ly]=loc(pp,tx,ty);const la=(g.a-pp.a)*Math.PI/180;n.relativeTransform=[[Math.cos(la),-Math.sin(la),lx],[Math.sin(la),Math.cos(la),ly]];return[tx,ty]};
const deco=(n,v)=>{const ef=[];let st=null;for(const s of v.shadows||[]){if(!s.blur&&!s.x&&!s.y&&s.spread){st=s;continue}ef.push({type:s.inset?'INNER_SHADOW':'DROP_SHADOW',color:{r:s.c.r,g:s.c.g,b:s.c.b,a:s.c.a},offset:{x:s.x,y:s.y},radius:s.blur,spread:s.spread,visible:true,blendMode:'NORMAL'})}
 if(st){n.strokes=[sol(st.c)];n.strokeWeight=st.spread;n.strokeAlign=st.inset?'INSIDE':'OUTSIDE'}if(ef.length)n.effects=ef;if(v.radius&&'topLeftRadius'in n){[n.topLeftRadius,n.topRightRadius,n.bottomRightRadius,n.bottomLeftRadius]=v.radius}
 if(v.opacity!=null)n.opacity=v.opacity;if(v.blend==='overlay')n.blendMode='OVERLAY';if(v.blend==='multiply')n.blendMode='MULTIPLY'};
let lastSvg=D.lastSvg?await figma.getNodeByIdAsync(D.lastSvg):null;let made=0;
for(const o of D.ops){const pp=await par(o.p);let n;
 if(o.t==='group'){n=figma.createFrame();n.name=o.n;n.resize(Math.max(o.g.w,.01),Math.max(o.g.h,.01));n.clipsContent=false;n.fills=fills(o.v);pp.n.appendChild(n);const[tx,ty]=place(n,o.g,pp);deco(n,o.v);K[o.k]={id:n.id,tx,ty,a:o.g.a}}
 else if(o.t==='rect'){const v=o.v;const onlySh=!v.bg&&!v.images&&!v.grad&&(v.shadows||[]).every(s=>!s.inset&&s.blur);
  n=v.ellipse?figma.createEllipse():figma.createRectangle();n.name=v.images?'Texture':onlySh?'Soft shadow':'Shape';pp.n.appendChild(n);
  if(onlySh){const s=v.shadows[0];const g={...o.g,cx:o.g.cx+s.x,cy:o.g.cy+s.y,w:Math.max(o.g.w+2*s.spread,1),h:Math.max(o.g.h+2*s.spread,1)};n.resize(g.w,g.h);place(n,g,pp);n.fills=[sol(s.c)];n.effects=[{type:'LAYER_BLUR',blurType:'NORMAL',radius:s.blur/2,visible:true}];if(v.radius&&!v.ellipse)[n.topLeftRadius,n.topRightRadius,n.bottomRightRadius,n.bottomLeftRadius]=v.radius}
  else{n.resize(Math.max(o.g.w,.01),Math.max(o.g.h,.01));place(n,o.g,pp);n.fills=fills(v);deco(n,v)}}
 else if(o.t==='line'){const[x1,y1,x2,y2]=o.pts;const[a1,b1]=loc(pp,x1,y1),[a2,b2]=loc(pp,x2,y2);const L=Math.hypot(a2-a1,b2-b1);if(L<.5)continue;n=figma.createLine();n.name=o.dash?'Dotted rule':'Rule';pp.n.appendChild(n);n.resize(L,0);const an=Math.atan2(b2-b1,a2-a1);n.relativeTransform=[[Math.cos(an),-Math.sin(an),a1],[Math.sin(an),Math.cos(an),b1]];n.strokes=[sol(o.c)];n.strokeWeight=o.w;if(o.dash){n.dashPattern=o.dash;n.strokeCap='ROUND'}}
 else if(o.t==='svg'){n=figma.createNodeFromSvg(o.svg);n.name='Vector';pp.n.appendChild(n);const[lx,ly]=loc(pp,o.x,o.y);n.x=lx;n.y=ly;n.clipsContent=false;n.fills=[];lastSvg=n}
 else if(o.t==='grainPrev'){if(lastSvg)for(const v of lastSvg.findAllWithCriteria({types:['VECTOR']})){if(Array.isArray(v.fills)&&v.fills.length)v.fills=[...v.fills,{type:'IMAGE',imageHash:IMG.grain,scaleMode:'TILE',scalingFactor:1,opacity:o.o,blendMode:'OVERLAY'}]}continue}
 else if(o.t==='text'){n=figma.createText();const f0=fn(o.runs[0].f);n.fontName=f0;n.characters=o.text;
  for(const r of o.runs){const e=r.start+r.l;if(e<=r.start)continue;const f=r.f;n.setRangeFontName(r.start,e,fn(f));n.setRangeFontSize(r.start,e,f.size);n.setRangeFills(r.start,e,[sol(f.c)]);n.setRangeLetterSpacing(r.start,e,{unit:'PIXELS',value:f.ls});n.setRangeLineHeight(r.start,e,f.lh?{unit:'PIXELS',value:f.lh}:{unit:'AUTO'});if(f.u)n.setRangeTextDecoration(r.start,e,'UNDERLINE')}
  n.name=o.text.slice(0,40);pp.n.appendChild(n);const al={center:'CENTER',right:'RIGHT',end:'RIGHT',justify:'JUSTIFIED'}[o.align]||'LEFT';
  if(o.single){n.textAutoResize='WIDTH_AND_HEIGHT';let cx=o.g.cx;if(!o.g.a){if(al==='LEFT')cx=o.g.cx-o.g.w/2+n.width/2;else if(al==='RIGHT')cx=o.g.cx+o.g.w/2-n.width/2}place(n,{cx,cy:o.g.cy,w:n.width,h:n.height,a:o.g.a},pp)}
  else{n.resize(o.g.w+3,Math.max(o.g.h,1));n.textAutoResize='HEIGHT';n.textAlignHorizontal=al;place(n,{cx:o.g.cx+1.5,cy:o.g.cy-o.g.h/2+n.height/2,w:n.width,h:n.height,a:o.g.a},pp)}}
 made++}
return{frameId:frame.id,keys:K,lastSvg:lastSvg?lastSvg.id:null,made};
