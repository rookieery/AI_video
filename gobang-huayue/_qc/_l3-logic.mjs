// L3_EV 检测逻辑单测：复刻 game.html 文件头检测块 + 真实 MOVES，核对事件坐标
const LIVE3_FX='beam',S=0.15,SELECTED={set:'direct',index:3};
const DIRECT=[{},{},{},{dx:1,dy:1}];                    // index 3 = 花月
const MOVES=[
  { c: 'W', x: -1, y: 2 },{ c: 'B', x: 1, y: 0 },{ c: 'W', x: 2, y: 2 },{ c: 'B', x: 2, y: 0 },
  { c: 'W', x: 3, y: 0 },{ c: 'B', x: 0, y: 2 },{ c: 'W', x: -1, y: 3 },{ c: 'B', x: 1, y: 3 },
  { c: 'W', x: 1, y: 2 },{ c: 'B', x: -2, y: 0 },{ c: 'W', x: -1, y: 1 },{ c: 'B', x: -1, y: 0 },
];
const seqCells=[{x:0,y:0,black:true},
  {x:SELECTED.set==='direct'?0:1,y:1,black:false},
  {x:DIRECT[SELECTED.index].dx,y:DIRECT[SELECTED.index].dy,black:true},
  ...MOVES.map(m=>({x:m.x,y:m.y,black:m.c!=='W'}))];
const cellKey=(x,y)=>x+','+y;
const AXES=[[1,0],[0,1],[1,1],[1,-1]];
const G=p=>({x:p.x/S,y:-p.z/S});                        // 世界 → 格坐标
const L3_EV=(()=>{ if(!LIVE3_FX)return[];
  const PATS=[{st:[-1,0,1],g:-9,en:[-2,2]},{st:[0,1,2],g:-9,en:[-1,3]},{st:[-2,-1,0],g:-9,en:[-3,1]},
              {st:[-1,0,2],g:1,en:[-2,3]},{st:[0,2,3],g:1,en:[-1,4]},
              {st:[-3,-2,0],g:-1,en:[-4,1]},{st:[-2,0,1],g:-1,en:[-3,2]}];
  const evs=[];
  for(let i=3;i<seqCells.length-1;i++){
    const s=seqCells[i],C=s.black?'B':'W',mv=seqCells[i+1],bd=new Map();
    for(let k=0;k<=i;k++)bd.set(cellKey(seqCells[k].x,seqCells[k].y),seqCells[k]);
    for(const[dx,dy]of AXES){
      const at=j=>{const x=s.x+dx*j,y=s.y+dy*j;
        if(x<-7||x>7||y<-7||y>7)return'X';
        const cc=bd.get(cellKey(x,y));return cc?(cc.black?'B':'W'):'.'};
      let ev=null;
      for(const p of PATS){
        if(p.st.every(j=>at(j)===C)&&p.en.every(j=>at(j)==='.')&&(p.g<0||at(p.g)==='.')){ev=p;break}
      }
      if(!ev)continue;
      const dot=((mv.x-s.x)*dx+(mv.y-s.y)*dy)/(dx*dx+dy*dy),cr=Math.abs((mv.x-s.x)*dy-(mv.y-s.y)*dx);
      if(cr!==0||(dot!==ev.g&&!ev.en.includes(dot)))continue;
      const w=j=>({x:(s.x+dx*j)*S,z:-(s.y+dy*j)*S});
      const bp=w(dot);
      let beams;
      if(dot===ev.g){
        beams=[{j0:ev.st[0],j1:dot},{j0:ev.st[ev.st.length-1],j1:dot}];
      }else{
        const far=ev.st.reduce((p,q)=>Math.abs(q-dot)>Math.abs(p-dot)?q:p);
        beams=[{j0:far,j1:dot}];
      }
      for(const bm of beams){
        const dir=Math.sign(bm.j1-bm.j0);
        bm.a=w(bm.j0);bm.b=w(bm.j1);bm.via=[];
        for(let j=bm.j0;dir*j<dir*bm.j1;j+=dir)if(ev.st.includes(j))bm.via.push(w(j));
      }
      evs.push({k:i+1-3,black:s.black,block:bp,beams});
      break;
    }
  }
  return evs;
})();
console.log('events:',L3_EV.length);
for(const ev of L3_EV){
  console.log(`k=${ev.k} (${MOVES[ev.k].c}${ev.k+4}) ${ev.black?'黑冰青':'白暖金'} 堵点${JSON.stringify(G(ev.block))}`);
  for(const b of ev.beams)console.log(`   束 ${JSON.stringify(G(b.a))} -> ${JSON.stringify(G(b.b))} 途经${b.via.map(G).map(JSON.stringify).join(',')}`);
}
