'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');let html=fs.readFileSync(path.join(root,'src/workbench.html'),'utf8');
for(const [marker,file] of Object.entries({CSS:'src/workbench.css',BRIDGE:'vendor/plugin-workbench-client.js',JS:'src/workbench.js'})){
 let content=fs.readFileSync(path.join(root,file),'utf8');if(marker!=='CSS')content=content.replace(/<\/script/gi,'<\\/script');
 html=html.replace('/* '+marker+' */',()=>content);
}
if(Buffer.byteLength(html)>2*1024*1024)throw Error('Workbench exceeds host size limit');fs.writeFileSync(path.join(root,'workbench.html'),html);console.log('Built offline workbench',Buffer.byteLength(html),'bytes');
