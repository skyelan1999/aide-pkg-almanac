'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process');
const a=require('../lib/almanac');
test('春节、元宵、中秋、除夕和闰月已知日期',()=>{
 for(const [date,festival,month,day] of [['2024-02-10','春节',1,1],['2024-02-24','元宵节',1,15],['2024-09-17','中秋节',8,15],['2025-01-28','除夕',12,29]]){const q=a.query({date});assert.equal(q.lunar.month,month);assert.equal(q.lunar.day,day);assert.ok(q.festivals.includes(festival));}
 const leap=a.query({date:'2023-03-22'});assert.equal(leap.lunar.isLeapMonth,true);assert.equal(leap.lunar.monthName,'闰二月');assert.equal(leap.lunar.day,1);
});
test('黄历固定数据、节气和立春/春节不同年界',()=>{
 const q=a.query({date:'2024-02-10'});assert.deepEqual(q.huangli.yi,['嫁娶','开光','求嗣','会亲友','安床','牧养','塑绘','针灸']);assert.equal(q.huangli.chong,'冲(戊戌)狗');assert.equal(q.huangli.sha,'煞南');assert.equal(q.ganzhi.day,'甲辰');assert.equal(q.huangli.guardian,'金匮');
 assert.equal(a.query({date:'2024-04-04'}).solarTerms.today,'清明');const before=a.query({date:'2024-02-05'});assert.equal(before.lunar.yearGanZhi,'癸卯');assert.equal(before.ganzhi.year,'甲辰');assert.equal(q.source.version,'1.7.7');
});
test('月历、闰年、世纪边界与星期一列',()=>{
 for(const [year,month,count] of [[2024,2,29],[2023,2,28],[1901,1,31],[2099,12,31]]){const m=a.month({year,month});assert.equal(m.days.length,count);assert.equal(m.firstWeekday,m.days[0].weekday);assert.equal(new Set(m.days.map(d=>d.date)).size,count);for(const d of m.days){const q=a.query({date:d.date});assert.deepEqual(d.lunar,q.lunar);assert.equal(d.solarTerm,q.solarTerms.today);}}
 assert.equal(a.month({year:2024,month:2}).firstWeekday,4);
});
test('严格拒绝日期溢出、时间戳和无效参数',()=>{
 for(const date of ['2023-02-29','2024-02-30','2024-13-01','2024-00-01','2024-01-00','2024-2-01','2024-01-01T00:00:00Z','1900-01-01','2100-01-01','',null,123])assert.throws(()=>a.query({date}));
 for(const arg of [{year:2024},{month:2},{year:'2024',month:2},{year:2024,month:2.5},{year:2100,month:1},{year:2024,month:0}])assert.throws(()=>a.month(arg));
});
test('中国今日跨年跨日不受宿主时区影响',()=>{
 assert.equal(a.today(new Date('2024-12-31T15:59:59Z')),'2024-12-31');assert.equal(a.today(new Date('2024-12-31T16:00:00Z')),'2025-01-01');
 const run=tz=>cp.execFileSync(process.execPath,['-e',"console.log(JSON.stringify(require('./lib/almanac').query({date:'2024-02-10'})))"],{cwd:require('node:path').resolve(__dirname,'..'),env:{...process.env,TZ:tz},encoding:'utf8'});assert.equal(run('UTC'),run('America/Los_Angeles'));
});
test('真实注册的只读工具与安装清单匹配，包内来源完整性',()=>{
 const tools=[];require('../index').apply({tool:d=>tools.push(d),slot:()=>{}});const manifest=require('../manifest.json');assert.deepEqual(tools.map(t=>t.name),manifest.workbench.tools);for(const tool of tools){assert.equal(typeof tool.handler,'function');assert.deepEqual(tool.scheduling.resources,[]);}assert.equal(tools[0].handler({date:'2024-02-10'}).lunar.day,1);
 const provenance=require('../vendor/provenance.json');for(const [f,hash] of Object.entries(provenance.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(require('node:path').join(__dirname,'../vendor',f))).digest('hex'),hash);
 const before=fs.readFileSync(require('node:path').join(__dirname,'../workbench.html'));cp.execFileSync(process.execPath,['scripts/build.cjs'],{cwd:require('node:path').resolve(__dirname,'..')});assert.deepEqual(fs.readFileSync(require('node:path').join(__dirname,'../workbench.html')),before,'reproducible self-contained UI');assert.ok(before.length<2*1024*1024);assert.ok(!/<script[^>]+src=|<link[^>]+href=/i.test(before.toString()));
});

test('单文件入口校验不依赖包内其他文件',()=>{
 const os=require('node:os'),path=require('node:path'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'almanac-entry-'));
 try{const file=path.join(dir,'index.js');fs.copyFileSync(path.join(__dirname,'../index.js'),file);const plugin=require(file);assert.equal(plugin.name,'almanac');assert.equal(typeof plugin.apply,'function');}finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('官方与引擎差异不伪造精确时刻，历法和黄历按同一日期月界',()=>{
 const historical=a.query({date:'1917-12-07'});assert.equal(historical.solarTerms.today,'大雪');assert.equal(historical.solarTerms.previous.date,'1917-12-07');assert.equal(historical.solarTerms.previous.time,null);assert.equal(historical.solarTerms.previous.computedDate,'1917-12-08');assert.equal(historical.ganzhi.month,'壬子');assert.equal(historical.checks.monthGanZhiMatchesReference,false);
 const future=a.query({date:'2057-09-28'});assert.equal(future.lunar.month,9);assert.equal(future.lunar.day,1);assert.equal(future.checks.lunarEngineMatchesReference,false);assert.ok(future.warnings.length);assert.ok(a.query({date:'2057-10-06'}).festivals.includes('重阳节'));
});
