'use strict';
const {Solar}=require('../vendor/lunar');
const MIN=1901,MAX=2099,TIME_ZONE='Asia/Shanghai';
const source=Object.freeze({name:'lunar-javascript',version:'1.7.7',license:'MIT',yiJiSect:1,yearBoundary:'立春（干支年）；正月初一（农历年）',timeZone:TIME_ZONE});
const note='黄历宜忌为传统民俗资料，非科学预测；不同流派可能有差异。节日名称不代表法定放假或调休安排。';
function today(now=new Date()) {
 const fields=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
 return `${fields.year}-${fields.month}-${fields.day}`;
}
function parseDate(value) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('日期格式应为 YYYY-MM-DD');
 const [y,m,d]=value.split('-').map(Number),utc=new Date(Date.UTC(y,m-1,d));
 if(y<MIN||y>MAX)throw Error(`支持公历 ${MIN}–${MAX} 年`);
 if(utc.toISOString().slice(0,10)!==value)throw Error('无效公历日期');
 return [y,m,d];
}
function suppliedDate(args) {return args.date===undefined?today():args.date;}
function lunarInfo(l) {
 return {year:l.getYear(),month:Math.abs(l.getMonth()),day:l.getDay(),isLeapMonth:l.getMonth()<0,monthName:l.getMonthInChinese()+'月',dayName:l.getDayInChinese(),text:l.toString(),yearGanZhi:l.getYearInGanZhi(),zodiac:l.getYearShengXiao()};
}
function festivals(s,l) {return [...new Set([...s.getFestivals(),...l.getFestivals()])];}
function termInfo(term) {return {name:term.getName(),date:term.getSolar().toYmd(),time:term.getSolar().toYmdHms(),timeZone:TIME_ZONE};}
function query(args={}) {
 const date=suppliedDate(args),[y,m,d]=parseDate(date),s=Solar.fromYmd(y,m,d),l=s.getLunar();
 return {date,today:today(),timeZone:TIME_ZONE,gregorian:{year:y,month:m,day:d,weekday:l.getWeek()||7,weekdayName:'星期'+l.getWeekInChinese()},lunar:lunarInfo(l),ganzhi:{year:l.getYearInGanZhiByLiChun(),month:l.getMonthInGanZhi(),day:l.getDayInGanZhi()},festivals:festivals(s,l),solarTerms:{today:l.getJieQi(),previous:termInfo(l.getPrevJieQi(true)),next:termInfo(l.getNextJieQi(true))},huangli:{yi:l.getDayYi(1),ji:l.getDayJi(1),chong:'冲'+l.getDayChongDesc(),sha:'煞'+l.getDaySha(),pengzu:[l.getPengZuGan(),l.getPengZuZhi()],officer:l.getZhiXing(),guardian:l.getDayTianShen(),guardianType:l.getDayTianShenType(),guardianLuck:l.getDayTianShenLuck(),taiShen:l.getDayPositionTai(),auspiciousGods:l.getDayJiShen(),inauspiciousGods:l.getDayXiongSha(),directions:{joy:l.getPositionXiDesc(),wealth:l.getPositionCaiDesc(),fortune:l.getPositionFuDesc()}},source:{...source},note};
}
function month(args={}) {
 let year=args.year,month=args.month;
 if(year===undefined&&month===undefined)[year,month]=today().split('-').slice(0,2).map(Number);
 if(!Number.isInteger(year)||!Number.isInteger(month)||year<MIN||year>MAX||month<1||month>12)throw Error(`年月应为整数，年份 ${MIN}–${MAX}，月份 1–12`);
 const last=new Date(Date.UTC(year,month,0)).getUTCDate(),days=[];
 for(let day=1;day<=last;day++) {
  const s=Solar.fromYmd(year,month,day),l=s.getLunar();
  days.push({date:s.toYmd(),day,weekday:l.getWeek()||7,lunar:lunarInfo(l),solarTerm:l.getJieQi(),festivals:festivals(s,l)});
 }
 return {year,month,today:today(),timeZone:TIME_ZONE,firstWeekday:days[0].weekday,days,source:{...source},note};
}
module.exports={query,month,today,parseDate,MIN,MAX};
