/* ================= S7 对弈落子（game.html 专属：MOVES 驱动，取子→飞行→落子→补子，全闭式） =================
   片内时间 t 已含 T_OPEN 偏移（t=16.0 ≡ 开场末帧）；每手窗口 [T_OPEN+k*PERIOD, +PERIOD]。
   相位（u = t - 手起点）：0.10–0.30 蓄势微升预亮 → 0.30–1.55 单段抛物线飞行（水平 inOutCubic+拱高 MV_ARC，一气呵成）
   → 1.55 落子定格，最新子高亮常亮（下一手取子瞬间让位还原）→ 1.85–2.15 取子台柱顶补子弹出 → 收静。 */
const MV_TAKE0=0.30,MV_LAND=1.55;
const MV_BACK0=1.85,MV_BACK1=2.15;
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
  flyGlow.scale.setScalar(0.34);fly.add(flyGlow);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(0.13,0.115),
    new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:0,depthWrite:false}));
  sh.rotation.x=-Math.PI/2;sh.position.set(tx,0.0025,tz);sh.renderOrder=2;sh.visible=false;scene.add(sh);
  const st=mkStone(black);st.position.set(tx,STONE_Y,tz);st.visible=false;scene.add(st);
  const flash=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:COL.sweep,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  flash.position.set(tx,0.035,tz);flash.scale.setScalar(0.32);flash.visible=false;scene.add(flash);  // 落子后转为最新子高亮晕
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
    // 飞子：单段抛物线（水平 inOutCubic + 4e(1-e) 拱高），全航迹无内部接缝
    let show=false;
    if(u>MV_TAKE0&&u<MV_LAND){
      show=true;
      const wb=bowlC.items[p.black?0:1],ta=T_OPEN+p.k*PERIOD+MV_TAKE0;
      const sp=slotW(wb.col.position.x,ta),y0=slotBob(ta)+0.05;   // 起飞点冻结于取子瞬间（含柱自转，交接零跳变）
      const e=ease.inOutCubic(remap(u,MV_TAKE0,MV_LAND));
      p.fly.position.set(lerp(sp.x,p.tx,e),lerp(y0,STONE_Y,e)+MV_ARC*4*e*(1-e),lerp(sp.z,p.tz,e));
      p.flyGlow.material.opacity=.45*(e>0.7?1-remap(e,0.7,1):1);
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
    if(mu>0.10&&mu<MV_TAKE0){                    // 蓄势：微升 + 预亮渐起渐隐
      stone.visible=true;stone.scale.setScalar(1);
      stone.position.y=slotBob(t)+0.05*ease.outCubic(remap(mu,0.10,MV_TAKE0));
      slotGlow.visible=true;slotGlow.position.set(sp.x,stone.position.y+0.05,sp.z);
      slotGlow.material.opacity=.4*ease.outCubic(remap(mu,0.10,MV_TAKE0))*(1-remap(mu,MV_TAKE0,MV_TAKE0+0.35));
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
