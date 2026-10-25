// check-board.mjs —— 盘面分区中位色采样（临时 QC）
import fs from 'node:fs';import zlib from 'node:zlib';
function dec(f){const buf=fs.readFileSync(f);let pos=8,w=0,h=0,ct;const idat=[];
  while(pos<buf.length){const len=buf.readUInt32BE(pos);const ty=buf.toString('ascii',pos+4,pos+8);const d=buf.subarray(pos+8,pos+8+len);
    if(ty==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9]}else if(ty==='IDAT')idat.push(d);else if(ty==='IEND')break;pos+=12+len}
  const ch={0:1,2:3,3:1,4:2,6:4}[ct];const raw=zlib.inflateSync(Buffer.concat(idat));const st=w*ch;const out=Buffer.alloc(h*st);
  for(let y=0;y<h;y++){const f=raw[y*(st+1)];const row=raw.subarray(y*(st+1)+1,y*(st+1)+1+st);
    const pr=y?out.subarray((y-1)*st,y*st):Buffer.alloc(st);const cu=out.subarray(y*st,(y+1)*st);
    for(let x=0;x<st;x++){const a=x>=ch?cu[x-ch]:0,b=pr[x],c=x>=ch?pr[x-ch]:0;let v=row[x];
      switch(f){case 0:break;case 1:v+=a;break;case 2:v+=b;break;case 3:v+=(a+b)>>1;break;
        case 4:{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);break}}
      cu[x]=v&0xff}}
  return{w,h,ch,data:out}}
const im=dec(process.argv[2]||'cyber-preview/A_11.99s.png');
const pts=[[760,340],[960,340],[1160,340],[760,540],[960,540],[1160,540],[760,740],[960,740],[1160,740]];
pts.forEach(([px,py],k)=>{
  const cols=[];
  for(let y=py-40;y<py+40;y+=2)for(let x=px-40;x<px+40;x+=2){const i=(y*im.w+x)*im.ch;cols.push([im.data[i],im.data[i+1],im.data[i+2]])}
  cols.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));
  const m=cols[cols.length>>1];
  const gb=m[2]?(m[1]/m[2]).toFixed(2):'-';
  console.log(`区${k} (${px},${py}) 中位 rgb(${m.join(',')}) G/B=${gb}`)});
let hi=0,hiX=0,hiY=0;
for(let y=0;y<im.h;y+=3)for(let x=0;x<im.w;x+=3){const i=(y*im.w+x)*im.ch;if(im.data[i+1]>150){hi++;hiX+=x;hiY+=y}}
console.log(hi?`G>150 亮青像素 ${hi} 个，质心(${Math.round(hiX/hi)},${Math.round(hiY/hi)})`:'无 G>150 像素');
