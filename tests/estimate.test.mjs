import assert from 'node:assert/strict';
import { calculate,PRICING,summary } from '../scripts/estimate-pricing.js';
const base={service:'shoot',shootKind:'general',hours:4,travel:'taichung',edit:'event',duration:3,tier:'basic',raw:'within',podcastType:'audio',recording:60,episodes:1,extras:0,subtitle:'none',finished:10};
let count=0;
const check=(s,total)=>{assert.equal(calculate({...base,...s}).total,total);count++;};
for(const [service,kind] of [['shoot','general'],['podcastShoot','podcast']])for(const [i,hours] of [4,8].entries())check({service,hours},PRICING.shoot[kind].regular[i]);
for(const kind of ['general','podcast'])for(const [i,hours] of [4,8].entries())check({service:'bundle',shootKind:kind,hours},PRICING.shoot[kind].bundle[i]+5000);
for(const tier of ['basic','pro'])for(const [i,duration] of PRICING.youtube.durations.entries())check({service:'youtube',duration,tier},PRICING.youtube[tier][i]);
for(const [i,duration] of PRICING.short.durations.entries())check({service:'short',duration},PRICING.short.prices[i]);
for(const [i,duration] of PRICING.event.durations.entries()){check({service:'event',duration},PRICING.event.own[i]);check({service:'bundle',duration},7000+PRICING.event.bundle[i]);}
for(const [travel,amount] of Object.entries(PRICING.travel))check({travel},8000+amount);
check({service:'podcast'},3000);check({service:'podcast',podcastType:'video'},6000);check({service:'podcast',podcastType:'videoShort'},6800);
check({service:'podcast',recording:90,episodes:2,extras:1},11000);
check({service:'podcast',podcastType:'video',recording:90,episodes:2,extras:1},18800);
check({service:'podcast',podcastType:'video',subtitle:'ai',finished:10,episodes:2},14000);
check({service:'podcast',podcastType:'video',subtitle:'checked',finished:30},9600);
for(const recording of [61,69,71,89,91])assert.ok(calculate({...base,service:'podcast',recording}).manual.length);
assert.equal(calculate({...base,service:'podcast',recording:90}).manual.length,0);
assert.ok(calculate({...base,service:'event',raw:'unknown'}).pending.length);
assert.ok(calculate({...base,service:'short',duration:30,raw:'over'}).manual.length);
assert.ok(calculate({...base,travel:'other'}).manual.length);
for(const episodes of [0,-1,1.5,NaN,101])assert.throws(()=>calculate({...base,service:'podcast',episodes}));
assert.throws(()=>calculate({...base,service:'youtube',duration:31}));
const r=calculate({...base,service:'event',raw:'over'});assert.equal(r.deposit,r.total*.5);assert.match(summary({...base,service:'event'},r),/已知項目小計/);assert.match(summary(base,r),/50%/);
console.log(`${count} pricing cases and boundary/manual/validation assertions passed.`);
for(const [duration,total] of [[4.5,6300],[5,6300],[5.01,7500],[27,10500],[30,10500]])check({service:'youtube',duration:'custom',customDuration:duration},total);
for(const duration of [0,-1,NaN,Infinity])assert.throws(()=>calculate({...base,service:'youtube',duration:'custom',customDuration:duration}));
const long=calculate({...base,service:'youtube',duration:'custom',customDuration:31});assert.equal(long.total,0);assert.match(long.manual.join(''),/超出既有級距/);
check({service:'bundle',edit:'youtube',duration:'custom',customDuration:31},7000);
for(const raw of ['', 'unknown','under30','under60','over60'])check({service:'youtube',duration:5,raw},6300);
assert.match(summary({...base,service:'youtube'},calculate({...base,service:'youtube',duration:'custom',customDuration:7,raw:'under30'})),/自填成品長度：7分鐘/);
console.log('Custom length boundaries and optional material selections passed.');

const unknownResult=calculate({...base,service:'youtube',duration:5,raw:'unknown'});
assert.equal(unknownResult.manual.length,0);assert.ok(unknownResult.pending.length);
assert.ok(long.needsQuote);assert.doesNotMatch(summary({...base,service:'youtube'},long),/NT\$0/);
assert.match(summary({...base,travel:'near'},calculate({...base,travel:'near'})),/苗栗／彰化／雲林/);
assert.match(summary({...base,service:'podcast',podcastType:'video',subtitle:'ai',finished:12},calculate({...base,service:'podcast',podcastType:'video',subtitle:'ai',finished:12})),/成品長度：12 分鐘/);
check({service:'youtube',duration:5,quantity:3},18900);
check({service:'short',duration:30,quantity:3},6000);
check({service:'bundle',edit:'event',duration:3,quantity:3},22000);
for(const quantity of [0,-1,1.5,10001,NaN])assert.throws(()=>calculate({...base,service:'youtube',duration:5,quantity}));
assert.match(summary({...base,service:'youtube',quantity:3},calculate({...base,service:'youtube',duration:5,quantity:3})),/成品數量：3 支/);

for(const partnership of ['6','12']){
 const s={...base,service:'youtube',duration:5,quantity:3,partnership};
 const result=calculate(s);
 assert.equal(result.total,18900);
 assert.match(summary(s,result),new RegExp(`長期合作洽詢意向：${partnership}個月`));
}
const single={...base,service:'youtube',duration:5,quantity:1,partnership:'6'};
assert.doesNotMatch(summary(single,calculate(single)),/長期合作洽詢意向/);

for(const service of ['shoot','podcastShoot'])assert.doesNotMatch(calculate({...base,service,effects:true}).manual.join(''),/大量特效/);
assert.match(calculate({...base,service:'youtube',duration:5,effects:true}).manual.join(''),/大量特效/);

check({service:'youtube',duration:5,quantity:30},189000);
for(const [service,duration] of [['youtube',5],['short',30],['event',3]]){
 const r=calculate({...base,service,duration,quantity:31});
 assert.equal(r.total,0);assert.ok(r.needsQuote);assert.match(r.manual.join(''),/超過30支/);
}
const bulkBundle=calculate({...base,service:'bundle',edit:'event',quantity:31});assert.equal(bulkBundle.total,7000);assert.match(bulkBundle.manual.join(''),/超過30支/);
for(const edit of ['youtube','short','event']){
 const duration={youtube:5,short:30,event:3}[edit];
 for(const raw of ['unknown','over']){
  const s={...base,service:'bundle',edit,duration,raw,rawYoutube:raw};const r=calculate(s);
  assert.equal(r.pending.length,0);assert.equal(r.manual.length,0);
  assert.doesNotMatch(summary(s,r),/原始素材量|標準原始素材/);
 }
}
