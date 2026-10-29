import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,summary,PRICING} from '../scripts/estimate-pricing.js';
const baseline={service:'shoot',shootKind:'general',hours:4,travel:'taichung',edit:'event',duration:3,tier:'basic',raw:'within',podcastType:'audio',episodes:1,recording:60,extras:0,subtitle:'none'};
const expected={general:{regular:[8000,14000],bundle:[7000,12000],rate:2000},dual:{regular:[12000,21000],bundle:[10500,18000],rate:3000},podcast:{regular:[15000,27000],bundle:[12000,23000],rate:3500}};
const required=[
 ['單人單機4h純拍攝','general',4,false,0,8000],
 ['單人單機8h搭配剪輯','general',8,true,0,12000],
 ['雙人雙機4h純拍攝','dual',4,false,0,12000],
 ['雙人雙機4h搭配剪輯','dual',4,true,0,10500],
 ['雙人雙機8h純拍攝','dual',8,false,0,21000],
 ['雙人雙機8h搭配剪輯','dual',8,true,0,18000],
 ['Podcast4h純拍攝','podcast',4,false,0,15000],
 ['Podcast8h搭配剪輯','podcast',8,true,0,23000],
 ['雙人雙機4h超時30分鐘','dual',4,false,30,15000],
 ['Podcast4h超時90分鐘','podcast',4,false,90,22000]
];
for(const [name,shootKind,hours,bundle,overtimeMinutes,want] of required)test(name,()=>{
 const s={...baseline,shootKind,hours,service:bundle?'bundle':'shoot',overtimeMinutes};const r=calculate(s);
 assert.equal(r.lines.filter(l=>l.label.startsWith('基本拍攝費')||l.label.startsWith('拍攝超時')).reduce((n,l)=>n+l.amount,0),want);
 assert.equal(r.total,want+(bundle?5000:0));assert.equal(r.manual.length,0);
 assert.match(summary(s,r),new RegExp(`參考總額：NT\\$${r.total.toLocaleString()}`));
});
test('三配置、4/8h、純拍攝/搭配剪輯、超時邊界（84組）',()=>{
 for(const [kind,p] of Object.entries(expected))for(const [i,hours] of [4,8].entries())for(const bundle of [false,true])for(const minutes of [0,1,30,60,61,90,120]){
 const r=calculate({...baseline,service:bundle?'bundle':'shoot',shootKind:kind,hours,overtimeMinutes:minutes});
 const overtime=r.lines.filter(l=>l.label.startsWith('拍攝超時'));assert.equal(overtime.length,1);
 assert.equal(overtime[0].amount,Math.ceil(minutes/60)*p.rate);
 assert.equal(r.total,p[bundle?'bundle':'regular'][i]+Math.ceil(minutes/60)*p.rate+(bundle?5000:0));
 assert.equal(r.deposit,r.total*.5);
 }
});
test('車馬費級距、遠程起價、特殊交通人工確認',()=>{
 for(const [travel,fee] of Object.entries({taichung:0,near:1500,middle:2000,far:2500})){
 const s={...baseline,travel};const r=calculate(s);assert.equal(r.total,8000+fee);assert.equal(r.lines.filter(l=>l.label.startsWith('車馬費')).length,1);
 if(travel==='far'){assert.match(r.manual.join(''),/起價/);assert.match(summary(s,r),/2,500起/);}
 }
 const r=calculate({...baseline,travel:'other'});assert.equal(r.total,8000);assert.match(r.manual.join(''),/特殊交通/);
});
test('純剪輯不收拍攝、超時及車馬費；搭配各類剪輯僅加一次拍攝費',()=>{
 for(const [edit,duration,editing] of [['youtube',5,6300],['short',30,2000],['event',3,5000],['podcast',3,3000]]){
 const s={...baseline,service:edit,duration,travel:'far',overtimeMinutes:120};const r=calculate(s);
 assert.equal(r.total,edit==='event'?6500:editing);assert.equal(r.lines.filter(l=>/基本拍攝費|拍攝超時|車馬費/.test(l.label)).length,0);
 const bundle=calculate({...s,service:'bundle',edit,shootKind:'dual',hours:4,travel:'near',overtimeMinutes:30});assert.equal(bundle.total,10500+3000+1500+editing);
 }
 assert.throws(()=>calculate({...baseline,service:'bundle',edit:'shoot'}));
});
test('其他後製與字幕價格保持已確認值',()=>{
 assert.deepEqual(PRICING.youtube,{durations:[5,10,15,20,30],basic:[6300,7500,8500,9500,10500],pro:[7300,8500,9500,10500,11500]});
 assert.deepEqual(PRICING.short,{durations:[30,60,90],prices:[2000,2500,3000],rawLimit:15});
 assert.deepEqual(PRICING.event,{durations:[3,5,10],bundle:[5000,6000,8000],own:[6500,8000,10500],rawLimit:30});
 assert.equal(PRICING.podcast.audio,3000);assert.equal(PRICING.podcast.video,6000);assert.equal(PRICING.podcast.videoShort,6800);
});
