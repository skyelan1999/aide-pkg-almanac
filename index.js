'use strict';
module.exports={name:'almanac',apply(ctx){
 const add=(name,description,properties,handler)=>ctx.tool({name,description,parameters:{type:'object',properties,additionalProperties:false},scheduling:{resources:[]},handler});
 add('almanac_query','查询今天或指定公历日期的公历、农历、节日、节气、干支、生肖、传统黄历宜忌、冲煞、彭祖百忌、值神和胎神。省略日期按中国标准时间确定今天。民俗资料不是科学预测，节日不是调休信息。支持1901–2099年。',{date:{type:'string',description:'可选，公历 YYYY-MM-DD；省略为 Asia/Shanghai 今天'}},args=>require('./lib/almanac').query(args));
 add('almanac_month','查询公历整月，每日包含公历/农历/闰月/节气/节日；不含法定调休安排。年月一同提供或一同省略，默认中国标准时间当前月。',{year:{type:'integer',minimum:1901,maximum:2099},month:{type:'integer',minimum:1,maximum:12}},args=>require('./lib/almanac').month(args));
 ctx.slot({id:'almanac-workbench',name:'黄历工作台'});
}};
