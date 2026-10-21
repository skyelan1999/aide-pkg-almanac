'use strict';
const {Solar,LunarUtil}=require('../vendor/lunar'),cal=require('./calendar');
const {MIN,MAX,today,parseDate}=cal,TIME_ZONE='Asia/Shanghai';
const source=Object.freeze({name:'lunar-javascript',version:'1.7.7',license:'MIT',yiJiSect:1,yearBoundary:'立春（干支年）；正月初一（农历年）',timeZone:TIME_ZONE,dateAuthority:cal.source,solarTime:'lunar-javascript估算时刻，不宣称秒级权威；日期按HKO历表'});
const note='黄历宜忌为传统民俗资料，非科学预测；不同流派可能有差异。节日名称不代表法定放假或调休安排。';
function dateArg(args){return args.date===undefined?today():args.date;}
function festivals(s,l){const result=[...s.getFestivals()];if(!l.isLeapMonth){const f=LunarUtil.FESTIVAL[l.month+'-'+l.day];if(f)result.push(f);if(l.month===12&&l.day===l.daysInMonth)result.push('除夕');}return [...new Set(result)];}
function termInfo(ref,fallback){
 if(!ref){return {name:fallback.getName(),date:fallback.getSolar().toYmd(),time:fallback.getSolar().toYmdHms(),timeZone:TIME_ZONE,referenceChecked:false,timeAccuracy:'algorithm-estimate'};}
 const stamp=new Date(ref.date+'T12:00:00Z');stamp.setUTCDate(stamp.getUTCDate()+2);const candidate=Solar.fromYmd(stamp.getUTCFullYear(),stamp.getUTCMonth()+1,stamp.getUTCDate()).getLunar().getPrevJieQi(true),sameName=candidate.getName()===ref.name,computedDate=sameName?candidate.getSolar().toYmd():null,computedTime=sameName?candidate.getSolar().toYmdHms():null;
 return {...ref,time:computedDate===ref.date?computedTime:null,timeZone:TIME_ZONE,referenceChecked:true,timeAccuracy:'algorithm-estimate',computedDate,computedTime,dateDisagreement:computedDate!==ref.date};
}
function query(args={}){
 cal.argsObject(args);const date=dateArg(args);parseDate(date);const [y,m,d]=date.split('-').map(Number),s=Solar.fromYmd(y,m,d),l=s.getLunar(),lunar=cal.lookup(date),context=cal.solarContext(date),dayZhi=l.getDayZhiIndex(),dayGz=l.getDayInGanZhi(),guardian=LunarUtil.TIAN_SHEN[(dayZhi+LunarUtil.ZHI_TIAN_SHEN_OFFSET[context.monthZhi])%12+1],guardianType=LunarUtil.TIAN_SHEN_TYPE[guardian];
 const previous=termInfo(context.previous,l.getPrevJieQi(true)),next=termInfo(context.next,l.getNextJieQi(true)),matches=l.getYear()===lunar.year&&l.getMonth()===(lunar.isLeapMonth?-lunar.month:lunar.month)&&l.getDay()===lunar.day,warnings=[];
 if(!matches)warnings.push('原计算引擎与官方历表的农历日期不同，已采用固定HKO历表；远期接近午夜的朔日可能有一日不确定性。');
 if(previous.dateDisagreement||next.dateDisagreement)warnings.push('附近节气的估算时刻跨日结果与官方日期不同；展示官方日期，不拼接为虚假的精确时刻。');
 return {date,today:today(),timeZone:TIME_ZONE,gregorian:{year:y,month:m,day:d,weekday:l.getWeek()||7,weekdayName:'星期'+l.getWeekInChinese()},lunar,ganzhi:{year:context.yearGanZhi,month:context.monthGanZhi,day:dayGz},festivals:festivals(s,lunar),solarTerms:{today:context.today,previous,next},huangli:{yi:LunarUtil.getDayYi(context.monthGanZhi,dayGz),ji:LunarUtil.getDayJi(context.monthGanZhi,dayGz),chong:'冲'+l.getDayChongDesc(),sha:'煞'+l.getDaySha(),pengzu:[l.getPengZuGan(),l.getPengZuZhi()],officer:LunarUtil.ZHI_XING[(dayZhi-context.monthZhiIndex+12)%12+1],guardian,guardianType,guardianLuck:LunarUtil.TIAN_SHEN_TYPE_LUCK[guardianType],taiShen:l.getDayPositionTai(),auspiciousGods:LunarUtil.getDayJiShen(context.monthZhiIndex,dayGz),inauspiciousGods:LunarUtil.getDayXiongSha(context.monthZhiIndex,dayGz),directions:{joy:l.getPositionXiDesc(),wealth:l.getPositionCaiDesc(),fortune:l.getPositionFuDesc()}},checks:{lunarEngineMatchesReference:matches,monthGanZhiMatchesReference:l.getMonthInGanZhi()===context.monthGanZhi},warnings,source:{...source},note};
}
function month(args={}){cal.argsObject(args);let {year,month}=args;if(year===undefined&&month===undefined)[year,month]=today().split('-').slice(0,2).map(Number);const result=cal.month(year,month);for(const day of result.days){const s=Solar.fromYmd(year,month,day.day);day.festivals=festivals(s,day.lunar);}result.source={...source};result.note=note;return result;}
module.exports={query,month,today,parseDate,MIN,MAX};
