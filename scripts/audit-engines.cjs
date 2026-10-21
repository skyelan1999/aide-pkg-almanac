'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),root=path.resolve(__dirname,'..'),{Solar}=require('../vendor/lunar');
const rows=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'test/hko-days.json.gz'))));
const fmt=new Intl.DateTimeFormat('en-u-ca-chinese',{timeZone:'Asia/Shanghai',year:'numeric',month:'numeric',day:'numeric'});
const groups={lunarJavascript:[],icu:[],solarTerms:[]};const tr=s=>s.replace(/[驚蟄穀滿種處]/g,c=>({'驚':'惊','蟄':'蛰','穀':'谷','滿':'满','種':'种','處':'处'}[c]));
for(const [date,year,month,day,term] of rows){const [y,m,d]=date.split('-').map(Number),l=Solar.fromYmd(y,m,d).getLunar();
 const raw={year:l.getYear(),month:l.getMonth(),day:l.getDay()};if(raw.year!==year||raw.month!==month||raw.day!==day)groups.lunarJavascript.push({date,expected:{year,month,day},actual:raw});
 const p=Object.fromEntries(fmt.formatToParts(new Date(date+'T12:00:00Z')).map(p=>[p.type,p.value])),im=Number.parseInt(p.month)*(p.month.includes('bis')?-1:1),actual={year:Number(p.relatedYear),month:im,day:Number(p.day)};
 if(actual.year!==year||actual.month!==month||actual.day!==day)groups.icu.push({date,expected:{year,month,day},actual});
 if(tr(term)!==l.getJieQi())groups.solarTerms.push({date,expected:tr(term),actual:l.getJieQi()});
}
const report={date:'2026-10-21',days:rows.length,reference:'Hong Kong Observatory 1901–2099 daily conversion tables',runtime:{node:process.version,icu:process.versions.icu},lunarJavascriptVersion:'1.7.7',differences:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,{count:v.length,examples:v.slice(0,12)}]))};
fs.writeFileSync(path.join(root,'docs/calendar-audit-baseline.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
