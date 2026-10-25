// hues.mjs —— 色相字母图：把帧重建成色块布局（临时 QC 工具）
// 图例: C=赛博青(盘/线) T=青绿(青子) R=玫(玫子) V=紫(界面A) G=金(界面B) S=银(界面C) W=白 D=暗
import fs from 'node:fs';import zlib from 'node:zlib';
const file=process.argv[2];
const buf=fs.readFileSync(file);let pos=8,w=0,h=0,ct;const idat=[];
while(pos<buf.length){const len=buf.readUInt32BE(pos);const ty=buf.toString('ascii',pos+4,pos+8);const d=buf.subarray(pos+8,pos+8+len);
if(ty==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9]}else if(ty==='IDAT')idat.push(d);else if(ty==='IEND')break;pos+=12+len}
const ch={0:1,2:3,3:1,4:2,6:4}[ct];const raw=zlib.inflateSync(Buffer.concat(idat));const st=w*ch;const out=Buffer.alloc(h*st);
for(let y=0;y<h;y++){const f=raw[y*(st+1)];const row=raw.subarray(y*(st+1)+1,y*(st+1)+1+st);
  const pr=y?out.subarray((y-1)*st,y*st):Buffer.alloc(st);const cu=out.subarray(y*st,(y+1)*st);
  for(let x=0;x<st;x++){const a=x>=ch?cu[x-ch]:0,b=pr[x],c=x>=ch?pr[x-ch]:0;let v=row[x];
    switch(f){case 0:break;case 1:v+=a;break;case 2:v+=b;break;case 3:v+=(a+b)>>1;break;
      case 4:{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);break}}
    cu[x]=v&0xff}}
const CW=80,CH=22;
for(let cy=0;cy<CH;cy++){let line='';
  for(let cx=0;cx<CW;cx++){const cnt={C:0,T:0,R:0,V:0,G:0,S:0,W:0,D:0,tot:0};
    for(let y=Math.floor(cy*h/CH);y<Math.floor((cy+1)*h/CH);y+=3)
      for(let x=Math.floor(cx*w/CW);x<Math.floor((cx+1)*w/CW);x+=3){
        const i=(y*w+x)*ch;const r=out[i],g=out[i+1],b=out[i+2];cnt.tot++;
        const mx=Math.max(r,g,b),mn=Math.min(r,g,b),lum=0.2126*r+0.7152*g+0.0722*b;
        if(lum<18)cnt.D++;
        else if(mx>230&&mn>210)cnt.W++;
        else if(r>200&&g<130&&b<150)cnt.R++;
        else if(r>120&&b>150&&r>g+30)cnt.V++;
        else if(r>170&&g>140&&b<120)cnt.G++;
        else if(r>170&&g>170&&b>170&&mx-mn<25)cnt.S++;
        else if(g>150&&b>170&&g>r+40)cnt.C++;
        else if(g>150&&g>b+15)cnt.T++;}
    let best='D',bv=0;for(const k of ['C','T','R','V','G','S','W','D'])if(cnt[k]>bv){bv=cnt[k];best=k}
    line+=(bv>cnt.tot*0.06?best:' ')}
  console.log(line)}
