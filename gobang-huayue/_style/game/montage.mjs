// montage.mjs —— S7 落子动画七帧细览（0.3 蓄势 / 0.7 拔起 / 1.4 飞行 / 1.85 坠落 / 2.05 落子波纹 / 2.45 补子 / 3.1 收静）
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

const CRC_T=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=buf=>{let c=0xFFFFFFFF;for(const b of buf)c=CRC_T[(c^b)&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);
  const td=Buffer.concat([Buffer.from(type,'ascii'),data]);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len,td,crc])}
function encodePNG(w,h,rgb){
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=2;
  const stride=w*3;const rawBuf=Buffer.alloc((stride+1)*h);
  for(let y=0;y<h;y++){rawBuf[y*(stride+1)]=0;rgb.copy(rawBuf,y*(stride+1)+1,y*stride,(y+1)*stride)}
  return Buffer.concat([Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(rawBuf,{level:6})),chunk('IEND',Buffer.alloc(0))])}

function blit(canvas,W,im,TW,TH,ox,oy){
  const sx=TW/im.w,sy=TH/im.h;
  for(let y=0;y<TH;y++){const sy0=Math.min(im.h-1,(y/sy)|0);
    for(let x=0;x<TW;x++){const sx0=Math.min(im.w-1,(x/sx)|0);
      const si=(sy0*im.w+sx0)*im.channels,di=((oy+y)*W+(ox+x))*3;
      canvas[di]=im.data[si];canvas[di+1]=im.data[si+1];canvas[di+2]=im.data[si+2]}}
}
function sheet(cols,times,TW,out){
  const TH=Math.round(TW*1080/1920),GAP=6;
  const W=cols*TW+(cols+1)*GAP,H=TH+2*GAP;
  const canvas=Buffer.alloc(W*H*3,0x0A);
  for(let c=0;c<cols;c++){
    const im=decodePNG(`../../.film/cache/look/${times[c]==='1'?'1s':times[c]==='2'?'2s':times[c]+'s'}.png`);
    blit(canvas,W,im,TW,TH,GAP+c*(TW+GAP),GAP);
  }
  fs.writeFileSync(out,encodePNG(W,H,canvas));
  console.log('→',out,`${W}x${H}`);
}
sheet(6,['11.6','12.5','13.8','14.6','15.2','15.9'],420,'strip-v5b.png');



