// mkpreview.mjs —— 由 starcodex.html 生成主题化 preview-cyber.html（赛博朋克预览，临时构建脚本）
// 每条替换断言精确命中次数，防漏防错
import fs from 'node:fs';

const THEMES_BLOCK = `
/* ================= 赛博朋克主题（预览版，URL ?theme=A/B/C） ================= */
const THEMES={
A:{ // 霓虹夜城：青×品红，不透明碳纤底
  col:{starWarm:'#DCEBFF',starGold:'#7FF7FF',gold:'#00E5FF',goldHi:'#9BFBFF',sweep:'#AFFFFF',
       crimson:'#FF2E97',crimsonHi:'#FF8AC8',obsidian:'#07090F',rimCool:'#5A7BD0',pearl:'#EAF6FF',lacquer:'#0B0E1E'},
  bg:['#05010F','#08021C','#12042A'],ambient:'#141B33',keyL:'#00C8E8',rimL:'#5A7BD0',colLight:'#EAF6FF',holeLight:'#FF5BC0',
  neb1:['rgba(0,229,255,A)','rgba(0,110,170,A)','rgba(170,250,255,A)','rgba(80,60,220,A)'],
  neb2:['rgba(255,46,151,A)','rgba(140,20,95,A)','rgba(120,40,220,A)','rgba(255,130,200,A)'],
  cover:{g:['#0D1120','#0A0D1A','#070A14'],dot:'rgba(0,229,255,.14)',frame1:'rgba(0,229,255,.36)',frame2:'rgba(155,251,255,.20)',corner:'#00E5FF',dark:'#0B0F1E'},
  card:{glass:'rgba(9,13,26,.92)',edge:'#5A7BD0'},
  grid:{line:'rgba(0,229,255,.55)',hi:'rgba(155,251,255,.9)'},
  direct:{main:'#00E5FF',hi:'#9BFBFF',halo:'rgba(0,229,255,.33)'},
  indirect:{main:'#FF2E97',hi:'#FF8AC8',halo:'rgba(255,46,151,.33)'},
  stoneW:['#FFFFFF','#EAF6FF','#BFD9E8','#8FB2C6'],stoneWglow:'#1A2A38',
  stoneB:{g:['#2A3448','#121826','#07090F'],rim:'#00E5FF',rimC:'#00E5FF',glint:'rgba(155,251,255,.6)'},
  rings:['#00E5FF','#FF2E97'],
  vortex:['#FF2E97','#B44CFF','#00E5FF'],vortexCore:['rgba(255,235,255,.95)','rgba(255,46,151,0)'],
  acc:['rgba(255,255,255,1)','rgba(255,92,193,.95)','rgba(180,76,255,.8)','rgba(0,229,255,.5)','rgba(0,120,180,.18)','rgba(0,60,90,0)'],accSpoke:'#AFFFFF',
  page:'#D8E6F0',pageGlow:'#EAF6FF',coreA:'#EAF6FF',coreC:'#F4FBFF',
  fx:{spark:'#9BFBFF',ember:'#FF8AC8',dustA:'#CFEFFF',dustB:'#FF9BD6'},
  board:{a:'#0A0F22',b:'#101A36'},
  starMark:{fill:'rgba(255,46,151,.35)',stroke:'rgba(255,138,200,.95)'},
  bloomScale:1.15,bloomThr:.80,bloomRad:.55,exposure:1.15,scan:.045,ca:.0012,vig:.22},
B:{ // 全息矩阵：青×电紫，半透全息
  col:{starWarm:'#E8F2FF',starGold:'#9BFBFF',gold:'#00E5FF',goldHi:'#BFF9FF',sweep:'#BFF9FF',
       crimson:'#B44CFF',crimsonHi:'#E3B8FF',obsidian:'#060A14',rimCool:'#3D6BD0',pearl:'#EAF6FF',lacquer:'#060C1C'},
  bg:['#020617','#050E26','#0A1230'],ambient:'#101A33',keyL:'#00D4F4',rimL:'#3D6BD0',colLight:'#EAF6FF',holeLight:'#6FD8FF',
  neb1:['rgba(0,229,255,A)','rgba(0,90,180,A)','rgba(180,250,255,A)','rgba(60,80,220,A)'],
  neb2:['rgba(180,76,255,A)','rgba(90,50,180,A)','rgba(0,150,220,A)','rgba(160,140,255,A)'],
  cover:{g:['#0A1224','#070E1C','#050A16'],dot:'rgba(0,229,255,.16)',frame1:'rgba(0,229,255,.40)',frame2:'rgba(155,251,255,.22)',corner:'#00E5FF',dark:'#081020'},
  card:{glass:'rgba(8,14,30,.80)',edge:'#5A8CFF'},
  grid:{line:'rgba(0,229,255,.60)',hi:'rgba(191,249,255,.95)'},
  direct:{main:'#00E5FF',hi:'#BFF9FF',halo:'rgba(0,229,255,.35)'},
  indirect:{main:'#B44CFF',hi:'#E3B8FF',halo:'rgba(180,76,255,.35)'},
  stoneW:['#FFFFFF','#EAF4FF','#C4D8EC','#93AECB'],stoneWglow:'#16283A',
  stoneB:{g:['#243048','#101830','#060A14'],rim:'#00E5FF',rimC:'#00E5FF',glint:'rgba(191,249,255,.65)'},
  rings:['#00E5FF','#EAF6FF'],
  vortex:['#9BFBFF','#00E5FF','#0080FF'],vortexCore:['rgba(230,250,255,.95)','rgba(0,229,255,0)'],
  acc:['rgba(255,255,255,1)','rgba(155,251,255,.95)','rgba(0,229,255,.8)','rgba(0,120,200,.5)','rgba(0,60,120,.18)','rgba(0,30,70,0)'],accSpoke:'#DFFBFF',
  page:'#C9DDF0',pageGlow:'#DFF4FF',coreA:'#EAF6FF',coreC:'#F0FAFF',
  fx:{spark:'#BFF9FF',ember:'#E3B8FF',dustA:'#BFD9F5',dustB:'#9FB8FF'},
  board:{a:'#060C1C',b:'#0C1830'},
  starMark:{fill:'rgba(0,229,255,.35)',stroke:'rgba(155,251,255,.95)'},
  bloomScale:1.10,bloomThr:.78,bloomRad:.50,exposure:1.12,scan:.090,ca:.0020,vig:.24},
C:{ // 绯紫余烬：品红×熔橙（斜指承袭暖红血统）
  col:{starWarm:'#FFE4F1',starGold:'#FF8AC8',gold:'#FF2E97',goldHi:'#FF8AC8',sweep:'#FFC4E6',
       crimson:'#FF6A2B',crimsonHi:'#FFB36B',obsidian:'#0C0710',rimCool:'#9A5CC8',pearl:'#F6E4EE',lacquer:'#160920'},
  bg:['#0A0118','#12041F','#1C0533'],ambient:'#251433',keyL:'#FF4FA8',rimL:'#9A5CC8',colLight:'#FFE4F1',holeLight:'#FF6A2B',
  neb1:['rgba(255,46,151,A)','rgba(180,76,220,A)','rgba(255,150,210,A)','rgba(255,106,43,A)'],
  neb2:['rgba(150,40,200,A)','rgba(90,20,140,A)','rgba(255,46,151,A)','rgba(255,106,43,A)'],
  cover:{g:['#1A0A22','#140818','#0E0512'],dot:'rgba(255,46,151,.15)',frame1:'rgba(255,46,151,.38)',frame2:'rgba(255,138,200,.20)',corner:'#FF2E97',dark:'#150A1C'},
  card:{glass:'rgba(16,8,24,.92)',edge:'#B44CFF'},
  grid:{line:'rgba(255,46,151,.55)',hi:'rgba(255,179,107,.9)'},
  direct:{main:'#FF2E97',hi:'#FF8AC8',halo:'rgba(255,46,151,.33)'},
  indirect:{main:'#FF6A2B',hi:'#FFB36B',halo:'rgba(255,106,43,.33)'},
  stoneW:['#FFFFFF','#F6E4EE','#E0BCD4','#B88CA8'],stoneWglow:'#33202C',
  stoneB:{g:['#2E1C38','#180E22','#0C0710'],rim:'#FF2E97',rimC:'#FF2E97',glint:'rgba(255,138,200,.6)'},
  rings:['#FF2E97','#FF6A2B'],
  vortex:['#FF2E97','#B44CFF','#FF6A2B'],vortexCore:['rgba(255,235,220,.95)','rgba(255,46,151,0)'],
  acc:['rgba(255,255,255,1)','rgba(255,179,107,.95)','rgba(255,106,43,.8)','rgba(255,46,151,.5)','rgba(180,76,255,.18)','rgba(90,20,140,0)'],accSpoke:'#FFD9C0',
  page:'#EFD8E8',pageGlow:'#FFE4F1',coreA:'#FFE4F1',coreC:'#FFF0F8',
  fx:{spark:'#FF8AC8',ember:'#FF6A2B',dustA:'#FFD4EC',dustB:'#FFB36B'},
  board:{a:'#120718',b:'#1E0C2A'},
  starMark:{fill:'rgba(255,106,43,.35)',stroke:'rgba(255,179,107,.95)'},
  bloomScale:1.12,bloomThr:.80,bloomRad:.55,exposure:1.14,scan:.050,ca:.0015,vig:.22},
};
const TH=THEMES[new URLSearchParams(location.search).get('theme')||'A'];
const hx=h=>new THREE.Color(h).getHex();
const hexA=(h,a)=>{const c=new THREE.Color(h);return 'rgba('+Math.round(c.r*255)+','+Math.round(c.g*255)+','+Math.round(c.b*255)+','+a+')'};
const THC=h=>{const c=new THREE.Color(h);return[c.r,c.g,c.b]};
const _lin=h=>{const c=new THREE.Color(h);c.convertSRGBToLinear();return c};
const _bbA=_lin(TH.board.a),_bbB=_lin(TH.board.b),_sbRim=_lin(TH.stoneB.rimC);
`;

const R=[
// 0) 注入主题表（在常量注释前）
[`/* ================= 常量（prompt.md §2/§3） ================= */`,
 THEMES_BLOCK+`\n/* ================= 常量（prompt.md §2/§3） ================= */`,1],
// 1) COL 主题化
[`  starWarm: '#F5EFE0', starGold: '#E8C96A',
  gold: '#C9A227', goldHi: '#E8C96A', sweep: '#FFE9B8',
  crimson: '#B03A2E', crimsonHi: '#FF6B52',
  obsidian: '#0B0D12', rimCool: '#6B7A8F',
  pearl: '#F5EFE0', lacquer: '#14100D',`,
 `  starWarm: TH.col.starWarm, starGold: TH.col.starGold,
  gold: TH.col.gold, goldHi: TH.col.goldHi, sweep: TH.col.sweep,
  crimson: TH.col.crimson, crimsonHi: TH.col.crimsonHi,
  obsidian: TH.col.obsidian, rimCool: TH.col.rimCool,
  pearl: TH.col.pearl, lacquer: TH.col.lacquer,`,1],
// 2) CSS 底色
[`background:#04060E`,`background:#030208`,1],
// 3) ShaderPass import
[`import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';`,
 `import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';`,1],
// 4) 曝光
[`renderer.toneMappingExposure=1.12;`,`renderer.toneMappingExposure=TH.exposure;`,1],
// 5) 环境光/灯
[`scene.add(new THREE.AmbientLight(0x1E2634,0.9));`,`scene.add(new THREE.AmbientLight(hx(TH.ambient),0.9));`,1],
[`const keyL=new THREE.DirectionalLight(0xE8C96A,1.5);`,`const keyL=new THREE.DirectionalLight(hx(TH.keyL),1.5);`,1],
[`const rimL=new THREE.DirectionalLight(0x6B7A8F,1.0);`,`const rimL=new THREE.DirectionalLight(hx(TH.rimL),1.0);`,1],
[`const colLight=new THREE.PointLight(0xF5EFE0,0,6,2);`,`const colLight=new THREE.PointLight(hx(TH.colLight),0,6,2);`,1],
[`const holeLight=new THREE.PointLight(0xFF6B52,0,5,2);`,`const holeLight=new THREE.PointLight(hx(TH.holeLight),0,5,2);`,1],
// 6) 背景径向渐变
[`  g.addColorStop(0,'#04060E');g.addColorStop(.6,'#060A16');g.addColorStop(1,'#0A0F1E');`,
 `  g.addColorStop(0,TH.bg[0]);g.addColorStop(.6,TH.bg[1]);g.addColorStop(1,TH.bg[2]);`,1],
// 7) glowTex 中性白化（霓虹由各精灵自染色）
[`g.addColorStop(.22,'rgba(255,233,192,.85)');`,'g.addColorStop(.22,\'rgba(255,255,255,.85)\');',1],
[`g.addColorStop(.55,'rgba(232,201,106,.28)');g.addColorStop(1,'rgba(232,201,106,0)');`,
 'g.addColorStop(.55,\'rgba(255,255,255,.30)\');g.addColorStop(1,\'rgba(255,255,255,0)\');',1],
// 8) 菱形星标
[`  x.fillStyle='rgba(201,162,39,.30)';x.fill();
  x.strokeStyle='rgba(232,201,106,.95)';x.lineWidth=3.5;x.stroke();return tex(c)})();`,
 `  x.fillStyle=TH.starMark.fill;x.fill();
  x.strokeStyle=TH.starMark.stroke;x.lineWidth=3.5;x.stroke();return tex(c)})();`,1],
// 9) 吸积盘
[`  g.addColorStop(0,'rgba(255,107,82,1)');g.addColorStop(.18,'rgba(255,138,94,.95)');
  g.addColorStop(.38,'rgba(232,160,74,.8)');g.addColorStop(.62,'rgba(232,201,106,.5)');
  g.addColorStop(.85,'rgba(201,162,39,.18)');g.addColorStop(1,'rgba(201,162,39,0)');`,
 `  g.addColorStop(0,TH.acc[0]);g.addColorStop(.18,TH.acc[1]);
  g.addColorStop(.38,TH.acc[2]);g.addColorStop(.62,TH.acc[3]);
  g.addColorStop(.85,TH.acc[4]);g.addColorStop(1,TH.acc[5]);`,1],
[`x.globalAlpha=.10;x.strokeStyle='#FFE9B8';`,`x.globalAlpha=.10;x.strokeStyle=TH.accSpoke;`,1],
// 10) 漩涡
[`      if(pass===0){x.strokeStyle='rgba(176,58,46,.30)';x.lineWidth=16;x.shadowColor='rgba(255,107,82,.7)';x.shadowBlur=22}
      else{const g=x.createLinearGradient(-140,-140,140,140);
        g.addColorStop(0,'#FF6B52');g.addColorStop(.55,'#D64541');g.addColorStop(1,'#B03A2E');`,
 `      if(pass===0){x.strokeStyle=hexA(TH.vortex[0],.30);x.lineWidth=16;x.shadowColor=hexA(TH.vortex[0],.7);x.shadowBlur=22}
      else{const g=x.createLinearGradient(-140,-140,140,140);
        g.addColorStop(0,TH.vortex[0]);g.addColorStop(.55,TH.vortex[1]);g.addColorStop(1,TH.vortex[2]);`,1],
[`  g.addColorStop(0,'rgba(255,220,200,.95)');g.addColorStop(1,'rgba(255,107,82,0)');`,
 `  g.addColorStop(0,TH.vortexCore[0]);g.addColorStop(1,TH.vortexCore[1]);`,1],
// 11) 星云
[`const neb1=nebulaTex(20260101,['rgba(232,201,106,A)','rgba(201,162,39,A)','rgba(245,239,224,A)','rgba(255,107,82,A)']);`,
 `const neb1=nebulaTex(20260101,TH.neb1);`,1],
[`const neb2=nebulaTex(990311,['rgba(107,122,143,A)','rgba(58,80,120,A)','rgba(176,58,46,A)','rgba(90,70,110,A)']);`,
 `const neb2=nebulaTex(990311,TH.neb2);`,1],
// 12) 书皮
[`  g.addColorStop(0,'#171310');g.addColorStop(.5,'#12100C');g.addColorStop(1,'#0E0C09');`,
 `  g.addColorStop(0,TH.cover.g[0]);g.addColorStop(.5,TH.cover.g[1]);g.addColorStop(1,TH.cover.g[2]);`,1],
[`x.strokeStyle='rgba(201,162,39,.12)';x.lineWidth=1.6;`,`x.strokeStyle=TH.cover.dot;x.lineWidth=1.6;`,1],
[`  x.strokeStyle='rgba(201,162,39,.34)';x.lineWidth=3;x.strokeRect(22,22,468,660);
  x.strokeStyle='rgba(232,201,106,.18)';x.lineWidth=1.5;x.strokeRect(34,34,444,636);
  return tex(c)})();`,
 `  x.strokeStyle=TH.cover.frame1;x.lineWidth=3;x.strokeRect(22,22,468,660);
  x.strokeStyle=TH.cover.frame2;x.lineWidth=1.5;x.strokeRect(34,34,444,636);
  // 霓虹角标
  x.strokeStyle=TH.cover.corner;x.lineWidth=7;const cl=44;
  for(const[cx,cy,sx,sy] of [[26,26,1,1],[486,26,-1,1],[26,678,1,-1],[486,678,-1,-1]]){
    x.beginPath();x.moveTo(cx+sx*cl,cy);x.lineTo(cx,cy);x.lineTo(cx,cy+sy*cl);x.stroke()}
  return tex(c)})();`,1],
// 13) 卡面
[`  const bd=kind==='gold'?'#C9A227':'#B03A2E', bh=kind==='gold'?'#E8C96A':'#FF6B52';`,
 `  const bd=kind==='gold'?TH.direct.main:TH.indirect.main, bh=kind==='gold'?TH.direct.hi:TH.indirect.hi;`,1],
[`rr(14,14,484,484,34);x.fillStyle='rgba(11,13,18,.94)';x.fill();`,`rr(14,14,484,484,34);x.fillStyle=TH.card.glass;x.fill();`,1],
[`  rr(20,20,472,472,28);x.strokeStyle='rgba(107,122,143,.30)';x.lineWidth=3;x.stroke();
  rr(26,26,460,460,24);x.strokeStyle='rgba(107,122,143,.12)';x.lineWidth=6;x.stroke();`,
 `  rr(20,20,472,472,28);x.strokeStyle=hexA(TH.card.edge,.32);x.lineWidth=3;x.stroke();
  rr(26,26,460,460,24);x.strokeStyle=hexA(TH.card.edge,.12);x.lineWidth=6;x.stroke();`,1],
[`  rr(14,14,484,484,34);x.strokeStyle=bh.replace(')',',.35)').replace('rgb','rgba');x.strokeStyle=kind==='gold'?'rgba(232,201,106,.33)':'rgba(255,107,82,.33)';
  x.lineWidth=20;x.stroke();`,
 `  rr(14,14,484,484,34);x.strokeStyle=kind==='gold'?TH.direct.halo:TH.indirect.halo;
  x.lineWidth=20;x.stroke();
  // 霓虹角标
  x.strokeStyle=bh;x.lineWidth=6;const cl=30;
  for(const[cx,cy,sx,sy] of [[30,30,1,1],[482,30,-1,1],[30,482,1,-1],[482,482,-1,-1]]){
    x.beginPath();x.moveTo(cx+sx*cl,cy);x.lineTo(cx,cy);x.lineTo(cx,cy+sy*cl);x.stroke()}`,1],
[`    x.strokeStyle='rgba(201,162,39,.55)';x.lineWidth=3;`,`    x.strokeStyle=TH.grid.line;x.lineWidth=3;`,1],
[`    x.strokeStyle='rgba(232,201,106,.85)';x.lineWidth=4.5;`,`    x.strokeStyle=TH.grid.hi;x.lineWidth=4.5;`,1],
[`x.save();x.translate(256,256);x.strokeStyle='rgba(232,201,106,.8)';x.lineWidth=3;`,`x.save();x.translate(256,256);x.strokeStyle=TH.grid.hi;x.lineWidth=3;`,1],
// 14) 2D 棋子
[`function drawStone2D(x,px,py,r,white){
  if(white){
    const g=x.createRadialGradient(px-r*.3,py-r*.35,r*.1,px,py,r);
    g.addColorStop(0,'#FFFFFF');g.addColorStop(.35,'#F5EFE0');g.addColorStop(.8,'#D9D2C0');g.addColorStop(1,'#B9B2A2');
    x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();
    x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(px-r*.32,py-r*.38,r*.16,0,7);x.fill();
  }else{
    const g=x.createRadialGradient(px-r*.3,py-r*.35,r*.1,px,py,r);
    g.addColorStop(0,'#2A3038');g.addColorStop(.55,'#141820');g.addColorStop(1,'#0B0D12');
    x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();
    x.strokeStyle='rgba(107,122,143,.85)';x.lineWidth=3;x.beginPath();x.arc(px,py,r-1.5,0,7);x.stroke();
    x.fillStyle='rgba(150,170,195,.5)';x.beginPath();x.arc(px-r*.32,py-r*.38,r*.13,0,7);x.fill();
  }}`,
 `function drawStone2D(x,px,py,r,white){
  if(white){
    const g=x.createRadialGradient(px-r*.3,py-r*.35,r*.1,px,py,r);
    g.addColorStop(0,TH.stoneW[0]);g.addColorStop(.35,TH.stoneW[1]);g.addColorStop(.8,TH.stoneW[2]);g.addColorStop(1,TH.stoneW[3]);
    x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();
    x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(px-r*.32,py-r*.38,r*.16,0,7);x.fill();
    x.strokeStyle=hexA(TH.direct.main,.35);x.lineWidth=2.5;x.beginPath();x.arc(px,py,r-1.2,0,7);x.stroke();
  }else{
    const g=x.createRadialGradient(px-r*.3,py-r*.35,r*.1,px,py,r);
    g.addColorStop(0,TH.stoneB.g[0]);g.addColorStop(.55,TH.stoneB.g[1]);g.addColorStop(1,TH.stoneB.g[2]);
    x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();
    x.strokeStyle=TH.stoneB.rim;x.lineWidth=3;x.beginPath();x.arc(px,py,r-1.5,0,7);x.stroke();
    x.fillStyle=TH.stoneB.glint;x.beginPath();x.arc(px-r*.32,py-r*.38,r*.13,0,7);x.fill();
  }}`,1],
// 15) 书体材质
[`emissive:0xC9A227,emissiveIntensity:0.03`,`emissive:hx(TH.direct.main),emissiveIntensity:0.05`,1],
[`const darkM=new THREE.MeshStandardMaterial({color:0x171310,roughness:.5,metalness:.2});`,
 `const darkM=new THREE.MeshStandardMaterial({color:hx(TH.cover.dark),roughness:.35,metalness:.55});`,1],
[`color:0xEFE7D2,roughness:.85`,`color:hx(TH.page),roughness:.8`,1],
[`new THREE.MeshBasicMaterial({color:0xE8C96A,transparent:true,opacity:0})`,`new THREE.MeshBasicMaterial({color:hx(TH.direct.hi),transparent:true,opacity:0})`,2],
[`      new THREE.MeshStandardMaterial({color:0xE8A04A,emissive:0xE8A04A,emissiveIntensity:.6,roughness:.4}));`,
 `      new THREE.MeshStandardMaterial({color:hx(i%2?TH.rings[1]:TH.rings[0]),emissive:hx(i%2?TH.rings[1]:TH.rings[0]),emissiveIntensity:.95,roughness:.3}));`,1],
// 16) 光柱/亮核/辉光（先处理唯一上下文，再全局 0xFFE9B8）
[`color:0xFFF3D8,`,`color:hx(TH.pageGlow),`,1],
[`color:0xF5EFE0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide`,
 `color:hx(TH.coreA),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide`,1],
[`color:0xE8C96A,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide`,
 `color:hx(TH.direct.hi),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide`,1],
[`color:0xFFF6DC,`,`color:hx(TH.coreC),`,1],
[`0xFFE9B8`,`hx(TH.sweep)`,6],
[`0xE8C96A`,`hx(TH.direct.hi)`,1],  // 剩余：lensRing
[`new THREE.LineBasicMaterial({color:0xC9A227,transparent:true,opacity:0})`,
 `new THREE.LineBasicMaterial({color:hx(TH.direct.main),transparent:true,opacity:0})`,1],
// 17) 棋子 3D
[`const whiteMat=new THREE.MeshStandardMaterial({color:COL.pearl,roughness:.32,metalness:.02,emissive:0x2A2A28,emissiveIntensity:.25});`,
 `const whiteMat=new THREE.MeshStandardMaterial({color:COL.pearl,roughness:.3,metalness:.05,emissive:hx(TH.stoneWglow),emissiveIntensity:.3});`,1],
// 18) 黑子扫过亮环（基础 + 闪烁两行）
[`  blackMat.emissive.setRGB(0.10,0.12,0.16);
  if(stoneFlash>0){blackMat.emissive.setRGB(0.10+0.4*stoneFlash,0.12+0.35*stoneFlash,0.16+0.3*stoneFlash)}`,
 `  blackMat.emissive.setRGB(_sbRim.r*0.45,_sbRim.g*0.45,_sbRim.b*0.45);
  if(stoneFlash>0){blackMat.emissive.setRGB(_sbRim.r*(0.45+2.4*stoneFlash),_sbRim.g*(0.45+2.4*stoneFlash),_sbRim.b*(0.45+2.4*stoneFlash))}`,1],
// 19) 盘底着色器（页面中该字符串位于反引号模板内，直接注入 ${} 插值）
[`vec3 col=mix(vec3(0.078,0.063,0.051),vec3(0.11,0.086,0.07),pow(max(0.0,1.0-2.0*cheb),2.0));`,
 `vec3 col=mix(vec3(\${_bbA.r.toFixed(4)},\${_bbA.g.toFixed(4)},\${_bbA.b.toFixed(4)}),vec3(\${_bbB.r.toFixed(4)},\${_bbB.g.toFixed(4)},\${_bbB.b.toFixed(4)}),pow(max(0.0,1.0-2.0*cheb),2.0));`,1],
// 20) 粒子
[`c:[1,0.85,0.5],curv:0.15`,`c:THC(TH.fx.spark),curv:0.15`,1],
[`c:rr()<0.5?[1,0.85,0.5]:[1,0.5,0.35],curv:0.85`,`c:rr()<0.5?THC(TH.fx.spark):THC(TH.fx.ember),curv:0.85`,1],
[`c:r()<0.6?[1,0.92,0.72]:[0.85,0.7,0.45],curv:0`,`c:r()<0.6?THC(TH.fx.dustA):THC(TH.fx.dustB),curv:0`,1],
// 21) 封面火环运行时重置色
[`rs.ring.material.color.setHex(0xE8A04A);`,`rs.ring.material.color.setHex(hx(rs.i%2?TH.rings[1]:TH.rings[0]));`,1],
// 22) Bloom 构造 + 运行时缩放
[`const bloom=new UnrealBloomPass(new THREE.Vector2(1920,1080),0.7,0.6,0.85); // §7：0.85/0.7/0.6`,
 `const bloom=new UnrealBloomPass(new THREE.Vector2(1920,1080),0.7*TH.bloomScale,TH.bloomRad,TH.bloomThr);`,1],
[`bloom.strength=env(t,[[0,0.7],`,`bloom.strength=TH.bloomScale*env(t,[[0,0.7],`,1],
// 23) 赛博后期（色差+扫描线+暗收）
[`composer.addPass(bloom);`,
 `composer.addPass(bloom);
// 赛博后期：径向色差 + 扫描线 + 边缘暗收（无时间项，保持确定性）
const cyberPass=new ShaderPass({
  uniforms:{tDiffuse:{value:null},uCA:{value:TH.ca},uScan:{value:TH.scan},uVig:{value:TH.vig}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform sampler2D tDiffuse;uniform float uCA,uScan,uVig;varying vec2 vUv;void main(){vec2 d=vUv-0.5;vec2 off=d*uCA;vec3 c;c.r=texture2D(tDiffuse,vUv+off).r;c.g=texture2D(tDiffuse,vUv).g;c.b=texture2D(tDiffuse,vUv-off).b;float sl=0.5+0.5*sin(gl_FragCoord.y*3.14159);c*=1.0-uScan*sl;c*=1.0-uVig*smoothstep(0.38,1.1,length(d)*1.55);gl_FragColor=vec4(c,1.0);}'
});
composer.addPass(cyberPass);`,1],
];

let s=fs.readFileSync('starcodex.html','utf8');
let idx=0;
for(const[find,repl,count] of R){
  idx++;
  const n=s.split(find).length-1;
  if(idx===42){let j=-1;while((j=s.indexOf('0xE8C96A',j+1))>=0){console.log('剩余上下文:',JSON.stringify(s.slice(j-80,j+30)))}}
  if(n!==count){console.error(`✗ 第${idx}条 期望命中${count} 实际${n}：${find.slice(0,70).replace(/\n/g,'\\n')}...`);process.exit(1)}
  s=s.replace(find,repl);
}
fs.writeFileSync('preview-cyber.html',s);
console.log(`✓ ${R.length} 条替换全部精确命中 → preview-cyber.html（${(s.length/1024).toFixed(1)}KB）`);
