/* ================= S7 对弈落子（game.html 专属：MOVES 驱动，取子→飞行→落子→补子，全闭式） =================
   片内时间 t 已含 T_OPEN 偏移（t=14.0 ≡ 开场末帧）；每手窗口 [T_OPEN+k*PERIOD, +PERIOD]。
   相位（u = t - 手起点）：0.15–0.4 蓄势微升预亮 → 0.4–1.0 拔起 → 1.0–1.75 弧线飞行 → 1.75–1.95 坠落
   → 1.95 落子（波纹环+闪光+软影落定）→ 2.3–2.6 取子台柱顶补子弹出 → 收静。 */
const MV_TAKE0=0.30,MV_LIFT1=0.75,MV_FLY1=1.35,MV_LAND=1.55;
const MV_BACK0=1.85,MV_BACK1=2.15;const MV_RIP_D=0.50;   // 波纹时长（落子后）
const STONE_Y=0.012,HOVER_Y=0.42;                       // 盘面落子高度 / 飞行悬停高度
const SLOT_I=5,SLOT_A=5*2.35+0.5,SLOT_R=0.115+(5%2?0.035:0),SLOT_TY=0.075+5*0.03;  // 柱顶第 6 颗（与 holo 构建式一致）
const slotXY=cx=>({x:cx+Math.cos(SLOT_A)*SLOT_R,z:Math.sin(SLOT_A)*SLOT_R});
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
  flash.position.set(tx,0.035,tz);flash.scale.setScalar(0.30);flash.visible=false;scene.add(flash);
  return{k,black,tx,tz,fly,flyGlow,sh,st,flash};
});
const mvRipple=new THREE.Mesh(new THREE.RingGeometry(0.85,1.0,48),
  new THREE.MeshBasicMaterial({color:'#9BEEFF',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
mvRipple.rotation.x=-Math.PI/2;mvRipple.position.y=0.004;mvRipple.renderOrder=5;mvRipple.visible=false;scene.add(mvRipple);
const slotGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:COL.sweep,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
slotGlow.scale.setScalar(0.22);slotGlow.visible=false;scene.add(slotGlow);
function updateMoves(t){
  if(BOWL_ID!=='holo'||!bowlC||!MOVES.length)return;
  let ripU=-1,ripX=0,ripZ=0;
  for(const p of mvPieces){
    const u=t-(T_OPEN+p.k*PERIOD);
    // 落子定格（恒久）+ 软影坠落末段渐入
    p.st.visible=u>=MV_LAND;
    p.sh.visible=u>=MV_LAND-0.5;
    p.sh.material.opacity=.42*clamp01((u-(MV_LAND-0.5))/0.5);
    // 落子闪光；波纹只留最新一手
    const fU=u-MV_LAND,flashOn=fU>0&&fU<0.5;
    p.flash.visible=flashOn;
    p.flash.material.opacity=flashOn?.55*Math.sin(Math.PI*fU/0.5):0;
    if(fU>0&&fU<MV_RIP_D){ripU=fU;ripX=p.tx;ripZ=p.tz}
    // 飞子：拔起 → 弧线 → 坠落
    let show=false;
    if(u>MV_TAKE0&&u<MV_LAND){
      show=true;
      const wb=bowlC.items[p.black?0:1],cx=wb.col.position.x;
      const sx=cx+Math.cos(SLOT_A)*SLOT_R,sz=Math.sin(SLOT_A)*SLOT_R,sy=slotBob(t);
      if(u<MV_LIFT1){
        const e2=ease.inOutCubic(remap(u,MV_TAKE0,MV_LIFT1));
        p.fly.position.set(lerp(sx,cx,0.7*e2),sy+0.05+0.45*e2,lerp(sz,0,0.7*e2));
      }else if(u<MV_FLY1){
        const e2=ease.inOutCubic(remap(u,MV_LIFT1,MV_FLY1));
        p.fly.position.set(lerp(sx,p.tx,e2),lerp(sy+0.5,HOVER_Y,e2)+Math.sin(Math.PI*e2)*0.16,lerp(sz,p.tz,e2));
      }else{
        const e2=ease.inQuad(remap(u,MV_FLY1,MV_LAND));
        p.fly.position.set(p.tx,lerp(HOVER_Y,STONE_Y,e2),p.tz);
      }
      p.flyGlow.material.opacity=.45*(u>MV_FLY1?1-remap(u,MV_FLY1,MV_LAND):1);
    }else{p.fly.visible=false;p.flyGlow.material.opacity=0}
    p.fly.visible=show;
  }
  if(ripU>0){
    mvRipple.visible=true;mvRipple.position.x=ripX;mvRipple.position.z=ripZ;
    const re=ease.outCubic(ripU/MV_RIP_D);
    mvRipple.scale.setScalar(lerp(0.07,0.55,re));
    mvRipple.material.opacity=0.8*(1-ripU/MV_RIP_D);
  }else mvRipple.visible=false;
  // 取子台柱顶（每色盒各一槽）：蓄势预亮 → 被取走 → 补子弹出（各自最近一手窗口）
  for(let side=0;side<2;side++){
    const black=side===0,col=bowlC.items[side].col,stone=col.children[SLOT_I];
    let mu=-1;
    for(let k=MOVES.length-1;k>=0;k--){
      if((MOVES[k].c!=='W')!==black)continue;
      const u=t-(T_OPEN+k*PERIOD);
      if(u>0){mu=u;break}
    }
    const sp=slotXY(col.position.x);
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
