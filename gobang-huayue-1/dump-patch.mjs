// dump-patch.mjs —— 打印一块区域的逐像素颜色（临时 QC）
import fs from 'node:fs';import zlib from 'node:zlib';
const file=process.argv[2],X=+process.argv[3],Y=+process.argv[4],W=+process.argv[5],H=+process.argv[6],step=+(process.argv[7]||4);
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
for(let y=Y;y<Y+H;y+=step){
  let line='';
  for(let x=X;x<X+W;x+=step){const i=(y*w+x)*ch;
    const r=out[i],g=out[i+1],b=out[i+2];
    line+=`(${r},${g},${b})`}
  console.log(`y=${y} ${line}`)}
