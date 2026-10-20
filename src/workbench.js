'use strict';
(() => {
 const $=id=>document.getElementById(id),root=document.documentElement,bridge=AideWorkbenchClient.create('almanac');
 let current=null,calendar=null,busy=false,disposed=false;
 const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const notice=text=>{if(disposed)return;$('notice').hidden=!text;$('notice').textContent=text;};
 function setBusy(value) {busy=value;$('content').setAttribute('aria-busy',String(value));for(const e of document.querySelectorAll('main button,main input'))e.disabled=value;bounds();}
 function bounds(){if(!calendar)return;$('prev-month').disabled=busy||(calendar.year===1901&&calendar.month===1);$('next-month').disabled=busy||(calendar.year===2099&&calendar.month===12);}
 async function call(name,args){const reply=await bridge.call(name,args);if(disposed)throw Error('工作台已关闭');if(reply.status!=='result')throw Error('未收到查询结果，请重新打开工作台');return reply.result;}
 function dateOffset(date,days){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
 function monthOffset(date,delta){const [y,m,d]=date.split('-').map(Number),first=new Date(Date.UTC(y,m-1+delta,1));const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();first.setUTCDate(Math.min(d,last));return first.toISOString().slice(0,10);}
 async function load(date,focus=false) {
  if(busy||disposed)return;
  if(date!==undefined&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<'1901-01-01'||date>'2099-12-31')){notice('支持公历 1901–2099 年');return;}
  setBusy(true);notice('正在查询…');
  try {
   const day=await call('almanac_query',date===undefined?{}:{date}),year=day.gregorian.year,month=day.gregorian.month;
   const next=calendar?.year===year&&calendar?.month===month?calendar:await call('almanac_month',{year,month});
   if(disposed)return;current=day;calendar={...next,today:day.today};render();notice('');
   if(focus)document.querySelector(`[data-date="${day.date}"]`)?.focus();
  }catch(e){notice('查询失败：'+e.message+'。可重试查看，或关闭后重新打开工作台。');}
  finally{if(!disposed){setBusy(false);if(focus)document.querySelector(`[data-date="${current?.date}"]`)?.focus();}}
 }
 function renderCalendar(){
  $('month-title').textContent=`${calendar.year} 年 ${String(calendar.month).padStart(2,'0')} 月`;
  $('date').value=current.date;$('days').replaceChildren();
  for(let i=1;i<calendar.firstWeekday;i++){$('days').append(node('span','empty'));}
  for(const day of calendar.days){
   const selected=day.date===current.date,b=node('button',(day.date===calendar.today?'today ':'')+(day.solarTerm?'term':''));b.type='button';b.dataset.date=day.date;b.tabIndex=selected?0:-1;b.setAttribute('aria-pressed',String(selected));if(day.date===calendar.today)b.setAttribute('aria-current','date');
   b.setAttribute('aria-label',[day.date,day.lunar.monthName+day.lunar.dayName,...day.festivals,day.solarTerm].filter(Boolean).join('，'));
   b.append(node('span','number',day.day),node('span','lunar',day.solarTerm||day.festivals[0]||(day.lunar.day===1?day.lunar.monthName:day.lunar.dayName)));
   b.onclick=()=>load(day.date);b.onkeydown=e=>{
    const days={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:1-day.weekday,End:7-day.weekday};
    let target;if(e.key in days)target=dateOffset(day.date,days[e.key]);else if(e.key==='PageUp')target=monthOffset(day.date,-1);else if(e.key==='PageDown')target=monthOffset(day.date,1);else return;
    e.preventDefault();void load(target,true);
   };$('days').append(b);
  }
 }
 const fact=(host,label,value)=>{const row=node('div');row.append(node('dt','',label),node('dd','',value||'—'));host.append(row);};
 function render(){
  renderCalendar();const d=current,l=d.lunar,h=d.huangli;
  $('selected-date').textContent=d.date+' · '+d.gregorian.weekdayName;$('daily-title').textContent=l.monthName+l.dayName;$('lunar-title').textContent=l.yearGanZhi+'年 · '+l.zodiac+'年 · '+d.ganzhi.month+'月 '+d.ganzhi.day+'日';$('day-number').textContent=String(d.gregorian.day).padStart(2,'0');
  $('day-tags').replaceChildren();for(const text of [d.solarTerms.today,...d.festivals,h.officer+'日',h.guardian+' · '+h.guardianType]){if(text)$('day-tags').append(node('span','tag',text));}
  for(const [id,items] of [['yi',h.yi],['ji',h.ji]]){$(id).replaceChildren();for(const item of items.length?items:['暂无资料'])$(id).append(node('span','',item));}
  const facts=$('facts');facts.replaceChildren();fact(facts,'干支',d.ganzhi.year+'年 '+d.ganzhi.month+'月 '+d.ganzhi.day+'日');fact(facts,'冲煞',h.chong+' · '+h.sha);fact(facts,'彭祖百忌',h.pengzu.join('；'));fact(facts,'喜 / 财',h.directions.joy+' / '+h.directions.wealth);fact(facts,'节日',d.festivals.join(' · ')||'无（不含调休安排）');
  const more=$('more-facts');more.replaceChildren();fact(more,'胎神',h.taiShen);fact(more,'吉神宜趋',h.auspiciousGods.join('、'));fact(more,'凶神宜忌',h.inauspiciousGods.join('、'));fact(more,'福神',h.directions.fortune);fact(more,'干支年界','立春；农历年以正月初一为界');fact(more,'当前节气',d.solarTerms.previous.name+' · '+d.solarTerms.previous.time+'（中国时间）');
  const next=d.solarTerms.next;$('next-term').textContent=(d.solarTerms.today?'今日 · '+d.solarTerms.today+'　｜　':'')+next.name+' · '+next.date;
 }
 $('go').onclick=()=>{if($('date').reportValidity())void load($('date').value);};
 $('date').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('go').click();}};
 $('prev-month').onclick=()=>current&&load(monthOffset(current.date,-1));$('next-month').onclick=()=>current&&load(monthOffset(current.date,1));$('today').onclick=()=>load();
 $('theme').onclick=()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';};
 function theme(e){if(e.source!==window.parent)return;const m=e.data;if(m?.type!=='aide.workbench.theme'||m.protocol!==1)return;root.dataset.theme=m.theme==='dark'?'dark':'light';root.dataset.palette=['blue','comfort','green'].includes(m.palette)?m.palette:'comfort';}
 window.addEventListener('message',theme);window.parent.postMessage({type:'aide.workbench.theme.ready',protocol:1},'*');
 bridge.onEvent(e=>{if(e.event==='scope.revoked')notice('工作区或授权已变化，请关闭后重新打开工作台');});
 window.addEventListener('pagehide',()=>{disposed=true;window.removeEventListener('message',theme);bridge.close();});
 void load();
})();
