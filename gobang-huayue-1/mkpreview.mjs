// mkpreview.mjs —— 由 starcodex.html 生成主题化 preview-cyber.html（赛博朋克预览 v3，临时构建脚本）
// v3 基调（用户指定）：棋子 #2DD4BF(青,黑方)×#F43F5E(玫红,白方)｜棋盘=#2DD4BF 半透明青玻璃
//   星空=还原 v1 原始暗黑系｜双弧+书/卡=另配界面色（禁用青/玫），三套候选 A/B/C
// 每条替换断言精确命中次数，防漏防错
import fs from 'node:fs';

const THEMES_BLOCK = `
/* ================= 赛博朋克主题 v3（预览版，URL ?theme=A/B/C） =================
   棋子双色不变；棋盘直接 #2DD4BF 半透明；星空=v1 原始暗黑；
   界面色（双弧/书/卡/漩涡/吸积盘/粒子）：A 电紫 / B 鎏金 / C 铂银 */
const THEMES={
A:{ // 电紫霓虹：紫罗兰×靛蓝（赛博第三色，居青玫之间的桥色）
  col:{starWarm:'#F5EFE0',starGold:'#E8C96A',gold:'#06B6D4',goldHi:'#67E8F9',sweep:'#F2EDFF',
       crimson:'#6366F1',crimsonHi:'#B4C0FF',obsidian:'#0B0D12',rimCool:'#6B7A8F',pearl:'#F5EFE0',lacquer:'#0C0E16'},
  stoneA:{base:'#06201E',glow:'#2DD4BF',core:'#9FFCF0',mid:'#2DD4BF',edge:'#0C544A',rim:'rgba(125,247,232,.95)',glint:'rgba(255,255,255,.85)'},
  stoneB:{base:'#2A0710',glow:'#F43F5E',core:'#FFC2CC',mid:'#F43F5E',edge:'#7A1029',rim:'rgba(255,143,163,.95)',glint:'rgba(255,255,255,.85)'},
  bg:['#04060E','#060A16','#0A0F1E'],ambient:'#1C2230',keyL:'#E8EDF4',rimL:'#6B7A8F',colLight:'#F5EFE0',holeLight:'#A855F7',
  neb1:['rgba(232,201,106,A)','rgba(201,162,39,A)','rgba(245,239,224,A)','rgba(255,107,82,A)'],
  neb2:['rgba(107,122,143,A)','rgba(58,80,120,A)','rgba(176,58,46,A)','rgba(90,70,110,A)'],
  cover:{g:['#141024','#0F0C1C','#0A0815'],dot:'rgba(168,85,247,.14)',frame1:'rgba(168,85,247,.36)',frame2:'rgba(216,180,254,.20)',corner:'#A855F7',dark:'#100C1C'},
  card:{glass:'rgba(12,10,22,.86)',edge:'#8B7BB8'},
  grid:{line:'rgba(6,182,212,.65)',hi:'#D6F7FF'},
  direct:{main:'#A855F7',hi:'#D8B4FE',halo:'rgba(168,85,247,.35)'},
  indirect:{main:'#6366F1',hi:'#B4C0FF',halo:'rgba(99,102,241,.35)'},
  rings:['#2DD4BF','#F43F5E'],
  vortex:['#D8B4FE','#A855F7','#6D28D9'],vortexCore:['rgba(243,232,255,.95)','rgba(168,85,247,0)'],
  acc:['rgba(255,255,255,1)','rgba(216,180,254,.95)','rgba(168,85,247,.8)','rgba(99,102,241,.5)','rgba(49,46,129,.18)','rgba(30,27,75,0)'],accSpoke:'#EDE9FE',
  page:'#EDEAF4',pageGlow:'#F3EFFF',coreA:'#F5F3FF',coreC:'#FAF8FF',
  fx:{spark:'#D8B4FE',ember:'#A5B4FC',dustA:'#E4DEF9',dustB:'#C7D2FE'},
  board:{a:'#0891B2',b:'#06B6D4'},boardAlpha:0.55,
  starMark:{fill:'rgba(168,85,247,.35)',stroke:'rgba(216,180,254,.95)'},
  bloomScale:1.12,bloomThr:.80,bloomRad:.55,exposure:1.14,scan:.050,ca:.0014,vig:.22},
B:{ // 鎏金典籍：金×琥珀（承袭 v1 血统，青玫霓虹配金框最"贵"）
  col:{starWarm:'#F5EFE0',starGold:'#E8C96A',gold:'#06B6D4',goldHi:'#67E8F9',sweep:'#FFF6DE',
       crimson:'#FF9F45',crimsonHi:'#FFC98F',obsidian:'#0B0D12',rimCool:'#6B7A8F',pearl:'#F5EFE0',lacquer:'#12100B'},
  stoneA:{base:'#06201E',glow:'#2DD4BF',core:'#9FFCF0',mid:'#2DD4BF',edge:'#0C544A',rim:'rgba(125,247,232,.95)',glint:'rgba(255,255,255,.85)'},
  stoneB:{base:'#2A0710',glow:'#F43F5E',core:'#FFC2CC',mid:'#F43F5E',edge:'#7A1029',rim:'rgba(255,143,163,.95)',glint:'rgba(255,255,255,.85)'},
  bg:['#04060E','#060A16','#0A0F1E'],ambient:'#1C2230',keyL:'#E8EDF4',rimL:'#6B7A8F',colLight:'#F5EFE0',holeLight:'#F5C542',
  neb1:['rgba(232,201,106,A)','rgba(201,162,39,A)','rgba(245,239,224,A)','rgba(255,107,82,A)'],
  neb2:['rgba(107,122,143,A)','rgba(58,80,120,A)','rgba(176,58,46,A)','rgba(90,70,110,A)'],
  cover:{g:['#1A150E','#14100A','#0E0B07'],dot:'rgba(245,197,66,.14)',frame1:'rgba(245,197,66,.36)',frame2:'rgba(255,224,138,.20)',corner:'#F5C542',dark:'#161209'},
  card:{glass:'rgba(18,14,8,.86)',edge:'#A08A4A'},
  grid:{line:'rgba(6,182,212,.65)',hi:'#D6F7FF'},
  direct:{main:'#F5C542',hi:'#FFE08A',halo:'rgba(245,197,66,.35)'},
  indirect:{main:'#FF9F45',hi:'#FFC98F',halo:'rgba(255,159,69,.35)'},
  rings:['#2DD4BF','#F43F5E'],
  vortex:['#FFE08A','#F5C542','#B8860B'],vortexCore:['rgba(255,248,220,.95)','rgba(245,197,66,0)'],
  acc:['rgba(255,255,255,1)','rgba(255,224,138,.95)','rgba(245,197,66,.8)','rgba(255,159,69,.5)','rgba(180,110,30,.18)','rgba(90,60,15,0)'],accSpoke:'#FFF3C9',
  page:'#EFE7D2',pageGlow:'#FFF6DC',coreA:'#FFF3D8',coreC:'#FFF9E8',
  fx:{spark:'#FFE3A3',ember:'#FFB56B',dustA:'#F5E9C8',dustB:'#FFD9A8'},
  board:{a:'#0891B2',b:'#06B6D4'},boardAlpha:0.55,
  starMark:{fill:'rgba(245,197,66,.35)',stroke:'rgba(255,224,138,.95)'},
  bloomScale:1.12,bloomThr:.80,bloomRad:.55,exposure:1.14,scan:.045,ca:.0012,vig:.22},
C:{ // 铂银全息：白金×冷银（界面近无彩，青玫双色绝对主角）
  col:{starWarm:'#F5EFE0',starGold:'#E8C96A',gold:'#06B6D4',goldHi:'#67E8F9',sweep:'#F2F6FA',
       crimson:'#94A3B8',crimsonHi:'#D5DCE6',obsidian:'#0B0D12',rimCool:'#6B7A8F',pearl:'#F5EFE0',lacquer:'#0C0E12'},
  stoneA:{base:'#06201E',glow:'#2DD4BF',core:'#9FFCF0',mid:'#2DD4BF',edge:'#0C544A',rim:'rgba(125,247,232,.95)',glint:'rgba(255,255,255,.85)'},
  stoneB:{base:'#2A0710',glow:'#F43F5E',core:'#FFC2CC',mid:'#F43F5E',edge:'#7A1029',rim:'rgba(255,143,163,.95)',glint:'rgba(255,255,255,.85)'},
  bg:['#04060E','#060A16','#0A0F1E'],ambient:'#1C2230',keyL:'#E8EDF4',rimL:'#6B7A8F',colLight:'#F5EFE0',holeLight:'#E2E8F0',
  neb1:['rgba(232,201,106,A)','rgba(201,162,39,A)','rgba(245,239,224,A)','rgba(255,107,82,A)'],
  neb2:['rgba(107,122,143,A)','rgba(58,80,120,A)','rgba(176,58,46,A)','rgba(90,70,110,A)'],
  cover:{g:['#16181D','#111318','#0C0E12'],dot:'rgba(226,232,240,.14)',frame1:'rgba(226,232,240,.36)',frame2:'rgba(241,245,249,.20)',corner:'#F1F5F9',dark:'#101218'},
  card:{glass:'rgba(14,16,20,.86)',edge:'#8A93A3'},
  grid:{line:'rgba(6,182,212,.65)',hi:'#D6F7FF'},
  direct:{main:'#F1F5F9',hi:'#FFFFFF',halo:'rgba(241,245,249,.30)'},
  indirect:{main:'#94A3B8',hi:'#D5DCE6',halo:'rgba(148,163,184,.30)'},
  rings:['#2DD4BF','#F43F5E'],
  vortex:['#FFFFFF','#D5DCE6','#8A93A3'],vortexCore:['rgba(255,255,255,.95)','rgba(200,208,220,0)'],
  acc:['rgba(255,255,255,1)','rgba(235,240,246,.95)','rgba(203,213,225,.8)','rgba(148,163,184,.5)','rgba(80,90,105,.18)','rgba(40,45,55,0)'],accSpoke:'#F4F7FA',
  page:'#EFEEE8',pageGlow:'#F8FAFC',coreA:'#FAFCFF',coreC:'#FFFFFF',
  fx:{spark:'#F8FAFC',ember:'#CBD5E1',dustA:'#E8EDF2',dustB:'#C3CCD6'},
  board:{a:'#0891B2',b:'#06B6D4'},boardAlpha:0.55,
  starMark:{fill:'rgba(226,232,240,.30)',stroke:'rgba(241,245,249,.95)'},
  bloomScale:1.10,bloomThr:.80,bloomRad:.55,exposure:1.13,scan:.060,ca:.0016,vig:.23},
};
const TH=THEMES[new URLSearchParams(location.search).get('theme')||'A'];
const hx=h=>new THREE.Color(h).getHex();
const hexA=(h,a)=>{const c=new THREE.Color(h);return 'rgba('+Math.round(c.r*255)+','+Math.round(c.g*255)+','+Math.round(c.b*255)+','+a+')'};
const THC=h=>{const c=new THREE.Color(h);return[c.r,c.g,c.b]};
const _lin=h=>new THREE.Color(h); // ColorManagement 已自动转 linear，勿再手动二次转换
const _bbA=_lin(TH.board.a),_bbB=_lin(TH.board.b),_sbRim=_lin(TH.stoneA.glow);
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
// 2) CSS 底色（v3 保留 v1 原值）
[`background:#04060E`,`background:#04060E`,1],
// 3) ShaderPass import
[`import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';`,
 `import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';`,1],
// 4) 曝光
[`renderer.toneMappingExposure=1.12;`,`renderer.toneMappingExposure=TH.exposure;`,1],
// 5) 环境光/灯（keyL 改中性白，让青盘/双色子显真色）
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
// 11) 星云（v3 = v1 原始配色，由主题表原样还原）
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
// 12b) 封面四装饰子 → 青玫交替霓虹珠（棋子色，环同色）
[`    const st=new THREE.Mesh(new THREE.SphereGeometry(0.048,20,14),
      new THREE.MeshStandardMaterial({color:COL.obsidian,roughness:.2,metalness:.4}));`,
 `    const st=new THREE.Mesh(new THREE.SphereGeometry(0.048,20,14),
      new THREE.MeshStandardMaterial({color:hx(i%2?TH.stoneB.base:TH.stoneA.base),emissive:hx(i%2?TH.stoneB.glow:TH.stoneA.glow),emissiveIntensity:1.1,roughness:.25,metalness:.3}));`,1],
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
// 14) 2D 棋子 → 青玫双色霓虹球（黑=青A 白=玫B）
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
  const S=white?TH.stoneB:TH.stoneA;
  const g=x.createRadialGradient(px-r*.3,py-r*.35,r*.1,px,py,r);
  g.addColorStop(0,'#FFFFFF');g.addColorStop(.28,S.core);g.addColorStop(.72,S.mid);g.addColorStop(1,S.edge);
  x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();
  x.strokeStyle=S.rim;x.lineWidth=3;x.beginPath();x.arc(px,py,r-1.5,0,7);x.stroke();
  x.fillStyle=S.glint;x.beginPath();x.arc(px-r*.32,py-r*.38,r*.14,0,7);x.fill();
  }`,1],
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
[`0xE8C96A`,`hx(TH.direct.hi)`,1],  // 剩余：lensRing（黑洞透镜环→界面色）
// 16b) 棋盘外框 LineLoop → 盘色（#2DD4BF，不跟界面色）
[`  const l=new THREE.LineLoop(g,new THREE.LineBasicMaterial({color:0xC9A227,transparent:true,opacity:0}));`,
 `  const l=new THREE.LineLoop(g,new THREE.LineBasicMaterial({color:hx(TH.col.gold),transparent:true,opacity:0}));`,1],
// 17) 3D 棋子材质 → 青玫自发光（黑=青A 白=玫B）
[`const blackMat=new THREE.MeshStandardMaterial({color:COL.obsidian,roughness:.22,metalness:.45});`,
 `const blackMat=new THREE.MeshStandardMaterial({color:hx(TH.stoneA.base),emissive:hx(TH.stoneA.glow),emissiveIntensity:1.0,roughness:.25,metalness:.35});`,1],
[`const whiteMat=new THREE.MeshStandardMaterial({color:COL.pearl,roughness:.32,metalness:.02,emissive:0x2A2A28,emissiveIntensity:.25});`,
 `const whiteMat=new THREE.MeshStandardMaterial({color:hx(TH.stoneB.base),emissive:hx(TH.stoneB.glow),emissiveIntensity:1.0,roughness:.3,metalness:.1});`,1],
// 17b) 白子每帧发光强度抬升（原 0.25 基础太暗，玫球不成立）
[`  whiteMat.emissiveIntensity=0.25+0.9*Math.max(0,stoneFlash);`,
 `  whiteMat.emissiveIntensity=1.0+0.9*Math.max(0,stoneFlash);`,1],
// 18) 黑子扫过亮环（基础 + 闪烁两行，青色辉光）
[`  blackMat.emissive.setRGB(0.10,0.12,0.16);
  if(stoneFlash>0){blackMat.emissive.setRGB(0.10+0.4*stoneFlash,0.12+0.35*stoneFlash,0.16+0.3*stoneFlash)}`,
 `  blackMat.emissive.setRGB(_sbRim.r*1.0,_sbRim.g*1.0,_sbRim.b*1.0);
  if(stoneFlash>0){blackMat.emissive.setRGB(_sbRim.r*(1.0+1.8*stoneFlash),_sbRim.g*(1.0+1.8*stoneFlash),_sbRim.b*(1.0+1.8*stoneFlash))}`,1],
// 19) 盘底着色器（页面中该字符串位于反引号模板内，直接注入 ${} 插值）
[`vec3 col=mix(vec3(0.078,0.063,0.051),vec3(0.11,0.086,0.07),pow(max(0.0,1.0-2.0*cheb),2.0));`,
 `vec3 col=mix(vec3(\${_bbA.r.toFixed(4)},\${_bbA.g.toFixed(4)},\${_bbA.b.toFixed(4)}),vec3(\${_bbB.r.toFixed(4)},\${_bbB.g.toFixed(4)},\${_bbB.b.toFixed(4)}),pow(max(0.0,1.0-2.0*cheb),2.0));`,1],
// 19b) 盘底半透明化（#2DD4BF 青玻璃，星海透盘）——仍在模板串内，须 ${} 插值
[`      gl_FragColor=vec4(col,a*0.97);}`,
 `      gl_FragColor=vec4(col,a*\${TH.boardAlpha.toFixed(2)});}`,1],
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
  if(n!==count){console.error(`✗ 第${idx}条 期望命中${count} 实际${n}：${find.slice(0,70).replace(/\n/g,'\\n')}...`);process.exit(1)}
  s=s.split(find).join(repl);
}
fs.writeFileSync('preview-cyber.html',s);
// 生成三个硬编码主题副本（openfilm 解析器不吃 iframe src 查询串）
for(const L of ['A','B','C'])
  fs.writeFileSync(`preview-${L}.html`,s.split(`THEMES[new URLSearchParams(location.search).get('theme')||'A']`).join(`THEMES['${L}']`));
console.log(`✓ ${R.length} 条替换全部精确命中 → preview-cyber.html + preview-A/B/C.html（${(s.length/1024).toFixed(1)}KB）`);
