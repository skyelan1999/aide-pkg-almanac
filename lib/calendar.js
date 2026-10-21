'use strict';
// Deterministic date-only conversion using attributed HKO month boundaries.
const data=require('../vendor/hko-reference.json'),DAY=86400000;
const GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥',ANIMALS='鼠牛虎兔龙蛇马羊猴鸡狗猪';
const MONTHS=['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
const digits='〇一二三四五六七八九',norm=s=>s.replace(/[驚蟄穀滿種處]/g,c=>({'驚':'惊','蟄':'蛰','穀':'谷','滿':'满','種':'种','處':'处'}[c]));
const terms=Object.entries(data.solarTerms).map(([date,name])=>({date,name:norm(name)})).sort((a,b)=>a.date.localeCompare(b.date));
const jie=['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
const source=Object.freeze({name:'香港天文台公历与农历对照表',url:data.url,retrieved:data.retrieved,range:data.range,timeZone:'Asia/Shanghai',method:'offline-month-boundaries',note:'日期按固定版本官方公开历表；远期朔或节气接近午夜时，来源提示可能出现一日差异，不代表官方认证本插件。'});
function argsObject(args){if(args===null||typeof args!=='object'||Array.isArray(args))throw TypeError('参数必须为对象');return args;}
function today(now=new Date()){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;}
function parseDate(date){if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw TypeError('日期格式应为 YYYY-MM-DD');const [y,m,d]=date.split('-').map(Number),stamp=Date.UTC(y,m-1,d);if(y<1901||y>2099||new Date(stamp).toISOString().slice(0,10)!==date)throw RangeError('无效日期或超出1901–2099年范围');return stamp/DAY;}
function dayName(n){return n===10?'初十':n===20?'二十':n===30?'三十':n<10?'初'+digits[n]:n<20?'十'+digits[n%10]:'廿'+digits[n%10];}
function gz(y){const n=((y-4)%60+60)%60;return GAN[n%10]+ZHI[n%12];}
function lookup(date=today()){
 const epoch=parseDate(date),arr=data.monthStarts;let lo=0,hi=arr.length-1;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(arr[mid][0]<=epoch)lo=mid;else hi=mid-1;}
 const [start,year,signedMonth,baseDay]=arr[lo],month=Math.abs(signedMonth),day=epoch-start+baseDay,isLeapMonth=signedMonth<0,monthName=(isLeapMonth?'闰':'')+MONTHS[month-1],yearGanZhi=gz(year),name=dayName(day);
 if(day<1||day>30)throw Error('历表月份锚点异常');
 return {year,month,day,isLeapMonth,monthName,dayName:name,text:String(year).split('').map(n=>digits[Number(n)]).join('')+'年'+monthName+name,yearGanZhi,zodiac:ANIMALS[((year-4)%12+12)%12],daysInMonth:arr[lo+1]?arr[lo+1][0]-start+baseDay-1:null};
}
function month(year,month){if(!Number.isInteger(year)||!Number.isInteger(month)||year<1901||year>2099||month<1||month>12)throw RangeError('年份1901–2099，月份1–12，须为整数');const days=[];for(let d=1,n=new Date(Date.UTC(year,month,0)).getUTCDate();d<=n;d++){const date=`${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;days.push({date,day:d,weekday:new Date(date+'T12:00:00Z').getUTCDay()||7,lunar:lookup(date),solarTerm:norm(data.solarTerms[date]||'')});}return {year,month,today:today(),timeZone:'Asia/Shanghai',firstWeekday:days[0].weekday,days,source};}
function solarContext(date){parseDate(date);let previous=null,next=null,lastJie=null;for(const t of terms){if(t.date<=date){previous=t;if(jie.includes(t.name))lastJie=t;}else{next=t;break;}}
 const year=Number(date.slice(0,4)),spring=terms.find(t=>t.date.startsWith(year+'-')&&t.name==='立春'),gzYear=spring&&date>=spring.date?year:year-1,ordinal=lastJie?jie.indexOf(lastJie.name):10,yearGan=((gzYear-4)%10+10)%10,monthZhiIndex=(ordinal+2)%12,monthGanIndex=(yearGan%5*2+2+ordinal)%10;
 return {today:norm(data.solarTerms[date]||''),previous,next,yearGanZhi:gz(gzYear),monthGanZhi:GAN[monthGanIndex]+ZHI[monthZhiIndex],monthZhiIndex,monthZhi:ZHI[monthZhiIndex]};
}
module.exports={lookup,month,today,parseDate,argsObject,solarContext,source,MIN:1901,MAX:2099};
