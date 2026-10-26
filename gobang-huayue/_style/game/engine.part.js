/* ================= S7 对弈落子（game.html 专属：MOVES 驱动，取子→飞行→落子→补子，全闭式） =================
   片内时间 t 已含 T_OPEN 偏移（t=16.0 ≡ 开场末帧）；每手窗口 [T_OPEN+k*PERIOD, +PERIOD]。
   相位（u = t - 手起点）：0.09–0.26 蓄势微升预亮 → 0.26–1.36 单段抛物线飞行（水平 inCubic 先慢后快——悬停似思考、末段加速果断落子+拱高 MV_ARC，一气呵成）
   → 1.36 落子定格，最新子高亮常亮（下一手取子瞬间让位还原）→ 1.62–1.88 取子台柱顶补子弹出 → 收静。 */
const MV_TAKE0=0.26,MV_LAND=1.36;
const MV_BACK0=1.62,MV_BACK1=1.88;
const STONE_Y=0.012,MV_ARC=0.60;                        // 盘面落子高度 / 抛物线拱高
const MV_HL=0.40,MV_HL_IN=0.15,MV_HL_OUT=0.20;          // 最新落子高亮：亮度 / 渐入 / 让位渐出
const SLOT_I=5,SLOT_A=5*2.35+0.5,SLOT_R=0.115+(5%2?0.035:0),SLOT_TY=0.075+5*0.03;  // 柱顶第 6 颗（与 holo 构建式一致）
const MV_SPIN=0.22;                                     // 取子柱自转速（与 holo 块 col.rotation.y=t*0.22 同步）
const slotW=(cx,ct)=>{const a=SLOT_A-MV_SPIN*ct;return{x:cx+Math.cos(a)*SLOT_R,z:Math.sin(a)*SLOT_R}};  // 柱顶世界位置（含自转）
const slotBob=t=>SLOT_TY+0.006*Math.sin(2*Math.PI*t/1.6+5*1.3);
const mvPieces=MOVES.map((mv,k)=>{
  const black=mv.c!=='W',tx=mv.x*S,tz=-mv.y*S;
  const fly=mkStone(black);fly.visible=false;scene.add(fly);
  const flyGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:COL.sweep,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  flyGlow.scale.setScalar(0.34);flyGlow.renderOrder=1;fly.add(flyGlow);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(0.13,0.115),
    new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:0,depthWrite:false}));
  sh.rotation.x=-Math.PI/2;sh.position.set(tx,0.0025,tz);sh.renderOrder=2;sh.visible=false;scene.add(sh);
  const st=mkStone(black);st.position.set(tx,STONE_Y,tz);st.visible=false;scene.add(st);
  const flash=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:COL.sweep,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  flash.position.set(tx,0.035,tz);flash.scale.setScalar(0.32);flash.renderOrder=1;flash.visible=false;scene.add(flash);  // 落子后转为最新子高亮晕（RO1：须高于 boardBase RO0，见 prompt-game.md §5 透明排序坑）
  return{k,black,tx,tz,fly,flyGlow,sh,st,flash};
});
const slotGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:COL.sweep,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
slotGlow.scale.setScalar(0.22);slotGlow.visible=false;scene.add(slotGlow);
function updateMoves(t){
  if(BOWL_ID!=='holo'||!bowlC||!MOVES.length)return;
  for(const p of mvPieces){
    const u=t-(T_OPEN+p.k*PERIOD);
    // 落子定格（恒久）+ 软影坠落末段渐入
    p.st.visible=u>=MV_LAND;
    p.sh.visible=u>=MV_LAND-0.5;
    p.sh.material.opacity=.42*clamp01((u-(MV_LAND-0.5))/0.5);
    // 最新落子保持高亮：渐入后常亮；下一手取子瞬间 0.2s 渐出让位（末手持续到片尾）
    let hl=0;
    if(u>=MV_LAND){
      hl=MV_HL*clamp01((u-MV_LAND)/MV_HL_IN);
      if(p.k+1<MOVES.length){const nt=T_OPEN+(p.k+1)*PERIOD+MV_TAKE0;if(t>nt)hl*=1-clamp01((t-nt)/MV_HL_OUT)}
    }
    p.flash.visible=hl>0.001;
    p.flash.material.opacity=hl;
    // 飞子：单段抛物线（水平 inCubic 先慢后快 + 4e(1-e) 拱高），全航迹无内部接缝；辉光按航时 55%→95% 渐隐（与进度解耦，inCubic 下不再突兀）
    let show=false;
    if(u>MV_TAKE0&&u<MV_LAND){
      show=true;
      const wb=bowlC.items[p.black?0:1],ta=T_OPEN+p.k*PERIOD+MV_TAKE0;
      const sp=slotW(wb.col.position.x,ta),y0=slotBob(ta)+0.05;   // 起飞点冻结于取子瞬间（含柱自转，交接零跳变）
      const fu=remap(u,MV_TAKE0,MV_LAND),e=ease.inCubic(fu);
      p.fly.position.set(lerp(sp.x,p.tx,e),lerp(y0,STONE_Y,e)+MV_ARC*4*e*(1-e),lerp(sp.z,p.tz,e));
      p.flyGlow.material.opacity=.45*(1-remap(fu,0.55,0.95));
    }else{p.fly.visible=false;p.flyGlow.material.opacity=0}
    p.fly.visible=show;
  }
  // 取子台柱顶（每色盒各一槽）：蓄势预亮 → 被取走 → 补子弹出（各自最近一手窗口）
  for(let side=0;side<2;side++){
    const black=side===0,col=bowlC.items[side].col,stone=col.children[SLOT_I];
    let mu=-1;
    for(let k=MOVES.length-1;k>=0;k--){
      if((MOVES[k].c!=='W')!==black)continue;
      const u=t-(T_OPEN+k*PERIOD);
      if(u>0){mu=u;break}
    }
    const sp=slotW(col.position.x,t);                           // 预亮/回闪跟随柱自转，悬在真实石子上方
    if(mu>0.09&&mu<MV_TAKE0){                    // 蓄势：微升 + 预亮渐起渐隐
      stone.visible=true;stone.scale.setScalar(1);
      stone.position.y=slotBob(t)+0.05*ease.outCubic(remap(mu,0.09,MV_TAKE0));
      slotGlow.visible=true;slotGlow.position.set(sp.x,stone.position.y+0.05,sp.z);
      slotGlow.material.opacity=.4*ease.outCubic(remap(mu,0.09,MV_TAKE0))*(1-remap(mu,MV_TAKE0,MV_TAKE0+0.31));
    }else if(mu>=MV_TAKE0&&mu<MV_BACK0){         // 被取走
      stone.visible=false;slotGlow.visible=false;
    }else if(mu>=MV_BACK0&&mu<MV_BACK1+0.3){     // 补子弹出 + 回闪
      stone.visible=true;stone.position.y=slotBob(t);
      stone.scale.setScalar(Math.max(0.001,ease.outBack(remap(mu,MV_BACK0,MV_BACK1))));
      slotGlow.visible=true;slotGlow.position.set(sp.x,stone.position.y+0.05,sp.z);
      slotGlow.material.opacity=.45*Math.sin(Math.PI*clamp01(remap(mu,MV_BACK0,MV_BACK1+0.2)));
    }else{                                        // 待机
      stone.visible=true;stone.scale.setScalar(1);slotGlow.visible=false;
    }
  }
}
/* ================= S8 五连特效 + S9 退场（v2.0：全闭式纯函数，无状态无随机） =================
   取胜检测：开局三子 + MOVES 逐手落图，四轴（横/竖/两斜）任一连五即胜；WIN_AT 可手动指定。
   T0（特效起点）= 胜手落定 +0.12；特效配色按胜方分冷暖：黑胜=冰青（全场主色家族）/ 白胜=暖金香槟（唯一暖色分野）。
   WIN_FX：'beam' 光轨贯珠 | 'const' 星座连线 | 'pulse' 脉冲悬浮——均含逐子点火光环+落点扩散环。
   退场 EXIT_MODE（END_DUR>0 才追加片尾）：棋子按序归位取子台，柱顶吸收闪光+柱身脉冲；开局三子随
   miniBoard 局部系同步归位（世界→局部 = (X,-Z,Y)）；软影随子离盘渐隐；终拍盘框缓暗收静。 */

// —— 取胜检测已提前至文件头（DUR 钳制依赖）；此处仅做特效/退场对象构建 ——
const WINFX_ID=WIN_FX||'beam',EXIT_ID=EXIT_MODE||'arc';
let updateWinFx=()=>{},updateExit=()=>{};              // frame() 钩子（无胜负时为空操作）

if(WIN){
const seqIndex=new Map(seqCells.map((s,i)=>[s,i]));
// —— 胜方五子引用（开局子在 miniBoard 局部系，落子在盘面世界系）——
const winRefs=WIN.cells.map(cl=>{
  const i=seqIndex.get(cl);
  if(i<3)return{st:miniStones[i],sh:boardShadows[i],mini:true,tx:cl.x*S,tz:-cl.y*S};
  const p=mvPieces[i-3];
  return{st:p.st,sh:p.sh,mini:false,tx:p.tx,tz:p.tz};
});
const jw=WIN.cells.indexOf(seqCells[WIN.i]);          // 胜手在线内位次（点火/行波原点）
const winPts=winRefs.map(r=>({x:r.tx,z:r.tz}));
const WA=winPts[0];
const cum=[0];                                        // 沿线累计弧长（5 子共线，pointAt 即线性插值）
for(let j=1;j<5;j++)cum.push(cum[j-1]+Math.hypot(winPts[j].x-winPts[j-1].x,winPts[j].z-winPts[j-1].z));
const WIN_L=cum[4];
const DIRU={x:(winPts[4].x-WA.x)/WIN_L,z:(winPts[4].z-WA.z)/WIN_L};
const ptAt=p=>({x:WA.x+DIRU.x*p,z:WA.z+DIRU.z*p});
const WIN_YAW=Math.atan2(-DIRU.z,DIRU.x);             // 局部 +x → 线向
const FXC=WIN.black?{core:'#EAFFFF',main:'#04C7E8',hi:'#9BEEFF'}     // 黑=冰青
                   :{core:'#FFF6DC',main:'#E8C25A',hi:'#FFE9B8'};    // 白=暖金香槟
const hiRGB=(()=>{const n=parseInt(FXC.hi.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]})();
// —— 时间轴（对弈片秒）——
const T0=(WIN.i-3)*PERIOD+MV_LAND+0.12;               // 特效起点（胜手落定 +0.12）
const ignJ=j=>T0+0.14*Math.abs(j-jw);                 // 逐子点火：自胜子向两端 0.14s/步
const TD0=T0+0.62,TD_DUR=0.55;                        // 光轨/连线绘制窗口
const T_X0=Math.max(TD0+TD_DUR+0.33,MOVES.length*PERIOD+0.15);   // 退场起点
// —— 全体棋子引用 + 退场次序 ——
const allStones=seqCells.map((cl,i)=>{
  if(i<3)return{st:miniStones[i],sh:boardShadows[i],mini:true,tx:cl.x*S,tz:-cl.y*S,black:cl.black,seq:i};
  const p=mvPieces[i-3];
  return{st:p.st,sh:p.sh,mini:false,tx:p.tx,tz:p.tz,black:cl.black,seq:i};
});
const TRAIN5=new Set(winRefs.map(r=>r.st));
const exitRank=new Map();                              // st → 次序：arc/dust=纯逆布局序；train=胜五按线序先行、余子接续
if(EXIT_ID==='train'){
  winRefs.forEach((r,i)=>exitRank.set(r.st,i));
  allStones.filter(s=>!TRAIN5.has(s.st)).sort((a,b)=>b.seq-a.seq).forEach((s,i)=>exitRank.set(s.st,5+i));
}else allStones.slice().sort((a,b)=>b.seq-a.seq).forEach((s,i)=>exitRank.set(s.st,i));
// —— 共用贴图（胜方配色）——
const beamTex=(()=>{const c=cnv(1024,128),x=c.getContext('2d');   // 光轨：纵向高斯 + 高饱和芯（与白热棋子辉光拉开色相）+ 端部外露
  const g=x.createLinearGradient(0,0,1024,0);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.03,rgba(FXC.main,.30));g.addColorStop(.3,rgba(FXC.main,.75));
  g.addColorStop(.5,rgba(FXC.hi,.97));g.addColorStop(.7,rgba(FXC.main,.75));g.addColorStop(.97,rgba(FXC.main,.30));g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(0,0,1024,128);
  const v=x.createLinearGradient(0,0,0,128);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.28,'rgba(255,255,255,1)');v.addColorStop(.72,'rgba(255,255,255,1)');v.addColorStop(1,'rgba(0,0,0,0)');
  x.globalCompositeOperation='destination-in';x.fillStyle=v;x.fillRect(0,0,1024,128);
  return tex(c)})();
const pulseTex=(()=>{const c=cnv(256,64),x=c.getContext('2d');    // 行波段：横向均匀亮带（两端羽化）
  const g=x.createLinearGradient(0,0,0,64);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.3,rgba(FXC.main,.9));g.addColorStop(.5,rgba(FXC.core,1));g.addColorStop(.7,rgba(FXC.main,.9));g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(0,0,256,64);
  const h=x.createLinearGradient(0,0,256,0);
  h.addColorStop(0,'rgba(0,0,0,0)');h.addColorStop(.18,'rgba(255,255,255,1)');h.addColorStop(.82,'rgba(255,255,255,1)');h.addColorStop(1,'rgba(0,0,0,0)');
  x.globalCompositeOperation='destination-in';x.fillStyle=h;x.fillRect(0,0,256,64);
  return tex(c)})();
const flareTex=(()=>{const c=cnv(128,128),x=c.getContext('2d');   // 四芒星（const 变体）
  x.translate(64,64);
  const g=x.createRadialGradient(0,0,0,0,0,14);g.addColorStop(0,rgba(FXC.core,.98));g.addColorStop(1,rgba(FXC.core,0));
  x.fillStyle=g;x.beginPath();x.arc(0,0,14,0,7);x.fill();
  x.lineCap='round';
  for(const rot of[0,Math.PI/2]){
    x.save();x.rotate(rot);
    x.strokeStyle=rgba(FXC.hi,.85);x.lineWidth=5;x.beginPath();x.moveTo(-56,0);x.lineTo(56,0);x.stroke();
    x.strokeStyle=rgba(FXC.core,.6);x.lineWidth=11;x.beginPath();x.moveTo(-30,0);x.lineTo(30,0);x.stroke();
    x.restore();
  }
  return tex(c)})();
const ringFxTex=(()=>{const c=cnv(128,128),x=c.getContext('2d');  // 盘面扩散环
  x.strokeStyle=rgba(FXC.hi,.9);x.lineWidth=7;x.shadowColor=FXC.main;x.shadowBlur=12;
  x.beginPath();x.arc(64,64,50,0,7);x.stroke();
  x.strokeStyle=rgba(FXC.main,.55);x.lineWidth=2.5;x.shadowBlur=0;x.beginPath();x.arc(64,64,50,0,7);x.stroke();
  return tex(c)})();
const mkSpr=(map,color,sc,ro)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map,color,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.scale.setScalar(sc);s.renderOrder=ro??1;s.visible=false;scene.add(s);return s};
const ringMesh=(x0,z0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.6),
  new THREE.MeshBasicMaterial({map:ringFxTex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.rotation.x=-Math.PI/2;m.position.set(x0,0.004,z0);m.renderOrder=1;m.visible=false;scene.add(m);return m};
// —— S8 对象：逐子光环/扩散环（+pulse 二段环）/四芒星/光轨/行波段/星屑 ——
const winHalos=winRefs.map(r=>{const s=mkSpr(glowTex,FXC.hi,0.26,1);s.position.set(r.tx,0.035,r.tz);return s});
const winRings=winRefs.map(r=>ringMesh(r.tx,r.tz));
const winRings2=WINFX_ID==='pulse'?winRefs.map(r=>ringMesh(r.tx,r.tz)):[];
const starFlares=winRefs.map(r=>{const s=mkSpr(flareTex,FXC.hi,0.30,2);s.position.set(r.tx,0.045,r.tz);return s});
const beamLen=WIN_L+0.34;
const mkBeam=(w,y,col)=>{const g=new THREE.PlaneGeometry(beamLen,w);g.translate(beamLen/2,0,0);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:beamTex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  if(col)m.material.color.set(col);
  m.rotation.order='YXZ';m.rotation.y=WIN_YAW;m.rotation.x=-Math.PI/2;m.position.set(WA.x,y,WA.z);m.renderOrder=1;m.visible=false;scene.add(m);return m};
const beam=mkBeam(0.16,0.016,FXC.main),beamWide=mkBeam(0.42,0.008,FXC.main);  // 主轨 + 盘面底光带（draw 用 scale.x）
const coreBeam=mkBeam(0.06,0.02,FXC.hi);                          // 高饱和芯线
const lineThin=mkBeam(0.055,0.016,FXC.hi);                        // const 变体细连线
const comet=mkSpr(glowTex,FXC.core,0.26,2);
const pulseSegs=[1,-1].map(()=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(0.50,0.14),
  new THREE.MeshBasicMaterial({map:pulseTex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.rotation.order='YXZ';m.rotation.y=WIN_YAW;m.rotation.x=-Math.PI/2;m.renderOrder=1;m.visible=false;scene.add(m);return m});
const winMotes=particleSys(46,i=>{const r=mulberry32(3100+i*7);    // const 变体：沿线上空漂浮星屑
  const u=r(),px=WA.x+DIRU.x*WIN_L*u+(r()-0.5)*0.16,pz=WA.z+DIRU.z*WIN_L*u+(r()-0.5)*0.16;
  return{p:[px,0.05+r()*0.10,pz],v:[(r()-0.5)*0.05,0.10+r()*0.12,(r()-0.5)*0.05],
    t0:T0+0.3+r()*2.2,life:0.7+r()*0.5,size:0.10+r()*0.16,c:hiRGB,curv:0.2}});
// —— S9 对象：逐子归台光尾 / 盒位吸收闪光 ——
const exitTrail=allStones.map(()=>mkSpr(glowTex,FXC.core,0.26,2));
const trayFlash=[0,1].map(()=>mkSpr(glowTex,FXC.hi,0.34,2));
const trayX=black=>black?-BOWL_X:BOWL_X;
const absorbAt=(black,ct)=>{const sp=slotW(trayX(black),ct);return{x:sp.x,y:slotBob(ct)+0.05,z:sp.z}};  // ct=片内时间
const EXIT_STAG=0.15,EXIT_FL=0.95;                     // 退场：间隔 / 单子窗口（u=0.95 吸收）
const planOf=s=>{                                      // 每子退场计划：u0 起步时刻；L 吸收时刻
  const r=exitRank.get(s.st);
  if(EXIT_ID==='train'&&TRAIN5.has(s.st)){
    const j=winRefs.findIndex(w=>w.st===s.st);
    return{u0:T_X0+j*0.06,L:T_X0+1.38+j*0.09,r:j,train5:true};
  }
  if(EXIT_ID==='dust')return{u0:T_X0+r*0.13,L:T_X0+r*0.13+0.62,r};
  const u0=(EXIT_ID==='train'?T_X0+1.75:T_X0)+(EXIT_ID==='train'?r-5:r)*EXIT_STAG;
  return{u0,L:u0+EXIT_FL,r};
};
const plans=allStones.map(s=>planOf(s));
// —— S8 帧更新：点火 → 光轨/连线/行波 →（t≥T_X0 整体让位）——
updateWinFx=t=>{
  if(t<T0-0.001)return;
  const gFade=1-remap(t,T_X0,T_X0+0.60);              // 退场开始后特效整体溶解
  winRefs.forEach((r,j)=>{
    const ig=ignJ(j),a=remap(t,ig,ig+0.20),h=winHalos[j];
    const tp=EXIT_ID==='pulse'?TD0+Math.abs(cum[j]-cum[jw])/(WIN_L/0.55):-9;
    const boost=EXIT_ID==='pulse'?0.30*Math.exp(-Math.pow((t-tp)/0.13,2)):0;   // 行波过子增亮
    h.visible=a>0.001&&gFade>0.001;
    const settle=WINFX_ID==='beam'?0.10*remap(t,TD0,TD0+0.4):0;   // 光轨成形后光环让位收一档
    h.material.opacity=(0.26-settle+boost+0.04*Math.sin(2*Math.PI*t/1.6+j*1.3))*ease.outCubic(a)*gFade;
    const rg=winRings[j],ru=remap(t,ig,ig+0.55);
    rg.visible=ru>0.001&&ru<0.999&&gFade>0.001;
    rg.material.opacity=0.34*(1-ru)*ease.outCubic(Math.min(1,ru*3))*gFade;
    rg.scale.setScalar(0.35+0.95*ease.outCubic(ru));
    if(EXIT_ID==='const'){
      const f=starFlares[j];
      f.visible=a>0.001&&gFade>0.001;
      f.material.opacity=0.75*ease.outCubic(a)*(0.8+0.2*Math.sin(2*Math.PI*t/0.9+j*2.1))*gFade;
      f.material.rotation=t*0.45;
    }
  });
  if(WINFX_ID==='beam'){
    const d=ease.outQuart(remap(t,TD0,TD0+TD_DUR)),vis=d>0.001&&gFade>0.001;
    beam.visible=beamWide.visible=coreBeam.visible=vis;
    beam.scale.x=beamWide.scale.x=coreBeam.scale.x=Math.max(0.001,d);
    const hold=1+0.06*Math.sin(2*Math.PI*t/1.8);
    beam.material.opacity=0.85*Math.min(1,d*3)*gFade*hold;
    beamWide.material.opacity=0.18*Math.min(1,d*3)*gFade*hold;
    coreBeam.material.opacity=1.0*Math.min(1,d*3)*gFade*hold;
    if(d>=0.999){                                      // 保持段：光珠沿轨巡游（能量流动感）
      const cu=((t-TD0-TD_DUR)%1.2)/1.2,su=ease.inOutCubic(cu);
      comet.visible=gFade>0.001;
      comet.position.set(ptAt(WIN_L*su).x,0.05,ptAt(WIN_L*su).z);
      comet.material.opacity=0.4*gFade;
    }else{
      comet.visible=d>0.001;                           // 绘制彗头
      if(comet.visible){const u=d;
        comet.position.set(ptAt(WIN_L*u).x,0.05,ptAt(WIN_L*u).z);
        comet.material.opacity=0.8*(1-remap(u,0.82,1))*gFade;}
    }
  }else if(WINFX_ID==='const'){
    const d=ease.outQuart(remap(t,TD0,TD0+TD_DUR));
    lineThin.visible=d>0.001&&gFade>0.001;
    lineThin.scale.x=Math.max(0.001,d);
    lineThin.material.opacity=0.95*Math.min(1,d*3)*gFade;
    winMotes.uniforms.uTime.value=t;
  }else{                                               // pulse：自胜子向两端的行波 + 过子环 + 浮空
    const SPD=WIN_L/0.55;
    pulseSegs.forEach((sg,si)=>{
      const dir=si?-1:1,p=cum[jw]+dir*(t-TD0)*SPD,on=t>TD0&&p<WIN_L+0.12&&p>-0.12&&gFade>0.001;
      sg.visible=on;
      if(on){const pc=Math.min(WIN_L,Math.max(0,p)),pt=ptAt(pc);
        sg.position.set(pt.x,0.02,pt.z);sg.material.opacity=0.8*gFade;}
    });
    winRefs.forEach((r,j)=>{
      const tp=TD0+Math.abs(cum[j]-cum[jw])/SPD,ru=remap(t,tp,tp+0.5),rg=winRings2[j];
      rg.visible=ru>0.001&&ru<0.999&&gFade>0.001;
      rg.material.opacity=0.42*(1-ru)*gFade;
      rg.scale.setScalar(0.5+1.3*ease.outCubic(ru));
      if(t>tp+0.18&&t<T_X0){                            // 波过后缓升悬浮（局部位次相位）
        const lift=0.02*ease.outCubic(remap(t,tp+0.18,tp+0.68))+0.006*Math.sin(2*Math.PI*t/1.7+j*1.1);
        if(r.mini)r.st.position.set(r.tx,-r.tz,STONE_Y+lift);   // miniBoard 局部系：世界(X,Y,Z)→局部(X,-Z,Y)
        else r.st.position.y=STONE_Y+lift;
      }
    });
  }
};
// —— S9 帧更新：按序离盘 → 抛物线归台 → 柱顶吸收 ——
updateExit=t=>{
  if(t<T_X0-0.001)return;
  const hlFade=1-remap(t,T_X0,T_X0+0.40);            // 末手“最新子高亮”随退场让位（updateMoves 每帧重写，此处压回）
  if(hlFade<1)for(const p of mvPieces)p.flash.material.opacity*=hlFade;
  allStones.forEach((s,i)=>{
    const pl=plans[i],u=(t-pl.u0)/EXIT_FL;
    if(t<pl.u0)return;                                 // 未动：盘面原位
    if(EXIT_ID==='dust'){                              // —— 星尘回流：原地溶解 + 光痕归台
      const du=remap(t,pl.u0,pl.u0+0.30);
      if(du<1){s.st.visible=true;s.st.scale.setScalar(Math.max(0.001,1-ease.inCubic(du)));
        s.sh.material.opacity*=(1-du);}
      else s.st.visible=false;
      const su=remap(t,pl.u0+0.12,pl.u0+0.62),tr=exitTrail[i];
      tr.visible=su>0.001&&su<0.999;
      if(tr.visible){const ab=absorbAt(s.black,T_OPEN+Math.min(pl.L,t)),e=ease.inOutCubic(su);
        const nx=lerp(s.tx,ab.x,e),nz=lerp(s.tz,ab.z,e),ny=lerp(STONE_Y,ab.y,e)+0.30*4*e*(1-e);
        tr.position.set(nx,ny,nz);tr.scale.setScalar(0.20+0.10*(1-su));
        tr.material.opacity=0.7*Math.sin(Math.PI*su);}
      return;
    }
    if(pl.train5){                                     // —— train：胜五随线升起 → 压缩编队飞向胜方盒 → 逐子吸收
      const j=pl.r;
      if(t>=pl.L){s.st.visible=false;s.sh.visible=false;return}
      const rise=ease.inOutCubic(remap(t,T_X0,T_X0+0.45));
      const trayC={x:trayX(s.black),z:0};
      const fl=ease.inOutCubic(remap(t,T_X0+0.55,T_X0+1.30));
      const o=(cum[j]-cum[jw]);
      const gx=lerp(s.tx,trayC.x+DIRU.x*o*0.5,fl),gz=lerp(s.tz,trayC.z+DIRU.z*o*0.5,fl);
      const gy=lerp(STONE_Y,0.26,Math.max(rise,fl))+0.02*Math.sin(2*Math.PI*t/1.6+j);
      const ab=absorbAt(s.black,T_OPEN+Math.min(pl.L,t));
      const dash=ease.outCubic(remap(t,pl.L-0.10,pl.L));
      const nx=lerp(gx,ab.x,dash),nz=lerp(gz,ab.z,dash),ny=lerp(gy,ab.y,dash);
      if(s.mini)s.st.position.set(nx,-nz,ny);else s.st.position.set(nx,ny,nz);
      s.sh.material.opacity*=(1-clamp01(rise));
      const tr=exitTrail[i];tr.visible=dash<0.999&&fl>0.001;
      tr.position.set(nx,ny,nz);tr.material.opacity=0.4*fl;
      s.st.scale.setScalar(Math.max(0.001,1-remap(t,pl.L-0.03,pl.L)));
      return;
    }
    // —— arc：蓄势微升 → 单段抛物线归台 → 柱顶吸收（目标实时跟随旋柱，交接零跳变）——
    if(u>=1){s.st.visible=false;s.sh.visible=false;return}
    const antic=ease.outCubic(remap(u,0,0.08));
    const e=ease.inOutCubic(remap(u,0.08,EXIT_FL));
    const ab=absorbAt(s.black,T_OPEN+Math.min(pl.L,t));
    const arch=0.34*4*e*(1-e);
    const nx=lerp(s.tx,ab.x,e),nz=lerp(s.tz,ab.z,e);
    const ny=lerp(STONE_Y,ab.y,e)+arch+0.05*antic*(1-e);
    if(s.mini)s.st.position.set(nx,-nz,ny);else s.st.position.set(nx,ny,nz);
    s.sh.material.opacity*=(1-clamp01(u/0.4));
    const tr=exitTrail[i];tr.visible=u>0.08&&u<EXIT_FL;
    tr.position.set(nx,ny+0.01,nz);tr.material.opacity=0.45*Math.sin(Math.PI*clamp01((u-0.08)/(EXIT_FL-0.08)));
    s.st.scale.setScalar(u>0.93?Math.max(0.001,1-remap(u,0.93,1)*0.7):1);
  });
  [0,1].forEach(side=>{                                // 柱身脉冲 + 盒位吸收闪光（各色最近一次吸收驱动）
    const black=side===0,col=bowlC.items[side].col,tf=trayFlash[side];
    let pk=0;
    plans.forEach((pl,i)=>{
      if(allStones[i].black!==black)return;
      const d=t-pl.L;
      if(d>0&&d<0.55)pk=Math.max(pk,Math.exp(-6.5*d));
    });
    col.children[SLOT_I].scale.setScalar(1+0.16*pk);
    tf.visible=pk>0.01;
    tf.material.opacity=0.5*pk;
    tf.position.set(trayX(black),0.10,0);
  });
  // 终拍：全场霓虹缓暗一档（盘框 + 天元微光），归空收静（窗口随 END_DUR 定位，收在片尾前 0.6s）
  const T_END=MOVES.length*PERIOD+END_DUR;
  const dim=ease.inOutCubic(remap(t,T_END-1.3,T_END-0.6));
  if(dim>0){
    boardNeon.material.opacity*=1-0.30*dim;
    tyGlow.material.opacity*=1-0.4*dim;
  }
};
}  // end if(WIN)
