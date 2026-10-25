// patch-mk.mjs —— 修 mkpreview.mjs 的第 18/19 条替换
import fs from 'node:fs';
let s=fs.readFileSync('mkpreview.mjs','utf8');
const lines=s.split('\n');
const i18=lines.findIndex(l=>l.includes('// 18) 黑子'));
const i20=lines.findIndex(l=>l.includes('// 20) 粒子'));
if(i18<0||i20<0){console.error('anchor not found',i18,i20);process.exit(1)}
const repl=[
'// 18) 黑子扫过亮环（基础 + 闪烁两行）',
'[`  blackMat.emissive.setRGB(0.10,0.12,0.16);',
'  if(stoneFlash>0){blackMat.emissive.setRGB(0.10+0.4*stoneFlash,0.12+0.35*stoneFlash,0.16+0.3*stoneFlash)}`,',
' `  blackMat.emissive.setRGB(_sbRim.r*0.45,_sbRim.g*0.45,_sbRim.b*0.45);',
'  if(stoneFlash>0){blackMat.emissive.setRGB(_sbRim.r*(0.45+2.4*stoneFlash),_sbRim.g*(0.45+2.4*stoneFlash),_sbRim.b*(0.45+2.4*stoneFlash))}`,1],',
'// 19) 盘底着色器（页面中该字符串位于反引号模板内，直接注入 ${} 插值）',
'[`vec3 col=mix(vec3(0.078,0.063,0.051),vec3(0.11,0.086,0.07),pow(max(0.0,1.0-2.0*cheb),2.0));`,',
' `vec3 col=mix(vec3(\\${_bbA.r.toFixed(4)},\\${_bbA.g.toFixed(4)},\\${_bbA.b.toFixed(4)}),vec3(\\${_bbB.r.toFixed(4)},\\${_bbB.g.toFixed(4)},\\${_bbB.b.toFixed(4)}),pow(max(0.0,1.0-2.0*cheb),2.0));`,1],',
];
lines.splice(i18,i20-i18,...repl);
fs.writeFileSync('mkpreview.mjs',lines.join('\n'));
console.log('patched:',repl.length,'行 → 18/19 重写');
