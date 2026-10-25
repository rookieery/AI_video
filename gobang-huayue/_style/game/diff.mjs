// diff.mjs —— 拼缝逐像素 diff（用法：node diff.mjs a.png b.png 标签）
import fs from 'node:fs';import zlib from 'node:zlib';

function decodePNG(file){const buf=fs.readFileSync(file);let pos=8,w=0,h=0,colorType;const idat=[];
  while(pos<buf.length){const len=buf.readUInt32BE(pos);const type=buf.toString('ascii',pos+4,pos+8);
    const data=buf.subarray(pos+8,pos+8+len);
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);colorType=data[9]}
    else if(type==='IDAT')idat.push(data);else if(type==='IEND')break;pos+=12+len}
  const channels={0:1,2:3,3:1,4:2,6:4}[colorType];
  const raw=zlib.inflateSync(Buffer.concat(idat));const stride=w*channels;const out=Buffer.alloc(h*stride);
  for(let y=0;y<h;y++){const f=raw[y*(stride+1)];const row=raw.subarray(y*(stride+1)+1,y*(stride+1)+1+stride);
    const prev=y?out.subarray((y-1)*stride,y*stride):Buffer.alloc(stride);const cur=out.subarray(y*stride,(y+1)*stride);
    for(let x=0;x<stride;x++){const a=x>=channels?cur[x-channels]:0,b=prev[x],c=x>=channels?prev[x-channels]:0;let v=row[x];
      switch(f){case 0:break;case 1:v+=a;break;case 2:v+=b;break;case 3:v+=(a+b)>>1;break;
        case 4:{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);break}}
      cur[x]=v&0xff}}
  return{w,h,channels,data:out}}

const [a,b,label]=process.argv.slice(2);
const A=decodePNG(a),B=decodePNG(b);
if(A.w!==B.w||A.h!==B.h||A.channels!==B.channels){console.log('尺寸/通道不一致',A,B);process.exit(1)}
let max=0,sum=0,nDiff=0;const n=A.data.length;
for(let i=0;i<n;i++){const d=Math.abs(A.data[i]-B.data[i]);if(d>0){nDiff++;sum+=d;if(d>max)max=d}}
console.log(`${label}: 变化字节 ${(100*nDiff/n).toFixed(2)}%  max=${max}  mean=${(sum/n).toFixed(4)}`);
