// All published rates live here. Unconfirmed rules must stay manual.
export const PRICING = {
  shoot: { general: { regular: [8000,14000], bundle: [7000,12000], overtime:2000 }, podcast: { regular:[15000,27000], bundle:[12000,23000], overtime:3500 } },
  youtube:{ durations:[5,10,15,20,30], basic:[6300,7500,8500,9500,10500], pro:[7300,8500,9500,10500,11500] },
  short:{ durations:[30,60,90], prices:[2000,2500,3000], rawLimit:15 },
  event:{ durations:[3,5,10], bundle:[5000,6000,8000], own:[6500,8000,10500], rawLimit:30 },
  podcast:{ audio:3000, video:6000, videoShort:6800, extra:1000, audioOvertime:500, videoOvertime:800, included:60, limit:90 },
  subtitles:{ ai:{rate:50,min:1000}, checked:{rate:120,min:2000} },
  travel:{ taichung:0, near:1500, middle:2000, far:2500 }, deposit:0.5,
  line:'https://lin.ee/uOrsZ8O'
};
export const YOUTUBE_PLANS = {
 basic:{name:'Basic 基本方案',features:['專業剪輯','基本字幕','音量平衡','商用音樂','1080p 輸出','1 次修改']},
 pro:{name:'Pro 專業方案',features:['專業剪輯','基本字幕','音量平衡','商用音樂','1080p 輸出','字卡設計','2 次修改','贈送封面設計 1 張']}
};
export const SERVICES = {shoot:'一般拍攝',podcastShoot:'Podcast 拍攝',bundle:'拍攝＋剪輯',youtube:'YouTube 剪輯',short:'短影音剪輯',podcast:'Podcast 後製',event:'活動精華剪輯'};
export function calculate(s) {
  const lines=[], notes=[], manual=[], pending=[];
  const add=(label,amount)=>lines.push({label,amount});
  const bundled=s.service==='bundle';
  const shooting=bundled||['shoot','podcastShoot'].includes(s.service);
  const edit=bundled?s.edit:s.service;
  const integer=(v,min,max)=>Number.isInteger(Number(v))&&Number(v)>=min&&Number(v)<=max;
  if(shooting){
    const kind=s.service==='podcastShoot'?'podcast':bundled?s.shootKind:'general';
    const p=PRICING.shoot[kind];
    if(!p||![4,8].includes(Number(s.hours)))throw Error('請選擇拍攝方案');
    add(`${kind==='podcast'?'Podcast 雙人雙機':'一般單機'}拍攝 ${s.hours} 小時${bundled?'（搭配剪輯推廣價）':''}`,p[bundled?'bundle':'regular'][s.hours===8?1:0]);
    notes.push(`超時費 NT$${p.overtime.toLocaleString()}/小時；進位方式另行確認。`);
    if(s.shootExtra)manual.push('拍攝超時、加機位或深夜等特殊需求另行報價');
    if(s.travel==='other')manual.push('遠程或例外車馬費人工確認');
    else if(Object.hasOwn(PRICING.travel,s.travel))add('車馬費',PRICING.travel[s.travel]);
    else throw Error('請選擇拍攝地區');
  }
  if(['youtube','short','event'].includes(edit)){
    const p=PRICING[edit];
    const quantity=Number(s.quantity??1);
    if(!integer(quantity,1,10000))throw Error('請填寫成品數量（1至10000支整數）');
    const custom=s.duration==='custom';
    const requested=Number(custom?s.customDuration:s.duration);
    if(!Number.isFinite(requested)||requested<=0||requested>10000)throw Error('請填寫有效的成品長度（大於0）');
    const i=custom?p.durations.findIndex(v=>requested<=v):p.durations.indexOf(requested);
    if(i<0&&!custom)throw Error('請選擇成品長度');
    const tier=edit==='youtube'?s.tier:edit==='event'?(bundled?'bundle':'own'):'prices';
    if(!p[tier])throw Error('請選擇剪輯方案');
    if(quantity>30)manual.push(`${SERVICES[edit]}成品數量 ${quantity} 支超過30支，剪輯費另行報價`);
    else if(i<0)manual.push(`${SERVICES[edit]}成品 ${requested}${edit==='short'?'秒':'分鐘'}超出既有級距，剪輯費另行報價`);
    else add(`${SERVICES[edit]}${edit==='youtube'?` ${s.tier==='pro'?'Pro':'Basic'}`:''}・${p.durations[i]}${edit==='short'?'秒':'分鐘'}內 × ${quantity} 支`,p[tier][i]*quantity);
    notes.push(quantity>30?`成品數量 ${quantity} 支，超過30支另行報價。`:`成品數量 ${quantity} 支，依相同規格單價計算，未套用批量優惠。`);
    if(custom)notes.push(`自填成品長度：${requested}${edit==='short'?'秒':'分鐘'}${i>=0?`，依${p.durations[i]}${edit==='short'?'秒':'分鐘'}內級距估算`:''}。`);
    if(edit==='youtube')notes.push(`${YOUTUBE_PLANS[s.tier].name}：${YOUTUBE_PLANS[s.tier].features.join('、')}。`);
    if(edit==='event')notes.push('活動精華為基本剪輯；大量特效、動畫、合成另報。');
    if(!bundled&&edit!=='youtube')notes.push(`標準原始素材 ${p.rawLimit} 分鐘內；不確定素材量可先聯繫確認，超量人工報價。`);
    else if(!bundled)notes.push('原始素材量為選填，不影響目前級距價格；超量或複雜素材由工作室確認。');
    if(!bundled&&edit==='youtube'&&s.raw&&s.raw!=='unknown')notes.push(`原始素材量（客戶預估）：${{under30:'30分鐘內',under60:'30～60分鐘',over60:'超過60分鐘'}[s.raw]||'待確認'}。`);
    if(!bundled&&s.raw==='over')manual.push('原始素材超出標準量，剪輯費需人工確認');
    if(!bundled&&s.raw==='unknown')pending.push('原始素材量待確認');
  }
  if(edit==='podcast'){
    const p=PRICING.podcast; const video=s.podcastType!=='audio';
    if(!['audio','video','videoShort'].includes(s.podcastType)||!integer(s.episodes,1,100)||!integer(s.recording,1,10000)||!integer(s.extras,0,100))throw Error('請檢查集數、錄製分鐘與額外音軌／機位（需為整數）');
    const n=Number(s.episodes), minutes=Number(s.recording);
    add(`Podcast ${s.podcastType==='audio'?'純音訊（雙軌）':s.podcastType==='video'?'Video（雙機，不含字幕）':'Video＋30秒短影音'} × ${n} 集`,p[s.podcastType]*n);
    if(s.extras>0)add(`額外${video?'機位':'音軌'} ${s.extras} 個 × ${n} 集`,s.extras*p.extra*n);
    if(minutes>p.limit)manual.push('錄製超過90分鐘，後製需人工報價');
    else if(minutes>p.included){
      const over=minutes-p.included;
      if(over%10)manual.push('後製超時不足10分鐘的進位方式待確認');
      else add(`後製超時 ${over} 分鐘 × ${n} 集`,over/10*(video?p.videoOvertime:p.audioOvertime)*n);
    }
    if(video&&s.subtitle!=='none'){
      const sub=PRICING.subtitles[s.subtitle];
      if(!sub||!integer(s.finished,1,10000))throw Error('請填寫每集預估成品分鐘（整數）');
      add(`${s.subtitle==='ai'?'AI字幕未校對':'AI字幕＋基本人工校對'}・每集 ${s.finished} 分鐘 × ${n} 集`,Math.max(sub.min,s.finished*sub.rate)*n);
    }
    notes.push('後製費依集數計算；字幕依每集成品長度計費並套用每集最低費用。');
  }
  if(s.effects&&!['shoot','podcastShoot'].includes(s.service))manual.push('大量特效、動畫或合成另行報價');
  notes.push(bundled?'拍攝＋剪輯僅交付完成影片，不交付原始素材或工程檔。':shooting?'純拍攝交付拍攝原始檔。':'純剪輯交付完成作品，不交付工程檔。');
  notes.push('優惠僅適用拍攝＋剪輯，單純出機不適用。','本估算僅供參考，以確認需求後正式報價為準；確認合作收取50%訂金。');
  const total=lines.reduce((sum,l)=>sum+l.amount,0);
  return {lines,notes,manual,pending,total,needsQuote:manual.length>0&&total===0,deposit:total*PRICING.deposit};
}
export function summary(s,r){
 const shooting=['shoot','podcastShoot','bundle'].includes(s.service);
 const edit=s.service==='bundle'?s.edit:s.service;
 const regions={taichung:'台中市區（免車馬費）',near:'苗栗／彰化／雲林',middle:'新竹／桃園／嘉義',far:'台北／台南',other:'其他地區、遠程或例外'};
 const raw={within:'標準量內',over:'超出標準量',unknown:'不確定',under30:'30分鐘內',under60:'30～60分鐘',over60:'超過60分鐘'};
 const details=[];
 if(edit==='youtube'&&Number(s.quantity)>=3&&['6','12'].includes(s.partnership))details.push(`長期合作洽詢意向：${s.partnership}個月；需每月固定3支以上，剪輯費95折，依正式合約確認。此次估算未套用折扣；合約總額50%訂金，尾款於合約期滿結案後支付；未達約定支數依原價計算。`);
 if(shooting){details.push(`拍攝地區：${regions[s.travel]||'待確認'}`);if(s.shootExtra){details.push('有拍攝特殊需求（另行報價）');if(s.specialRequest?.trim())details.push(`拍攝特殊需求：${s.specialRequest.trim()}`);}}
 if(['youtube','short','event'].includes(edit)){details.push(`成品數量：${s.quantity??1} 支（相同規格）`);const value=edit==='youtube'?s.rawYoutube:s.raw;if(!shooting)details.push(`原始素材量：${raw[value]||'待確認'}`);}
 if(edit==='podcast'){
 details.push(`每集錄製 ${s.recording} 分鐘；後製 ${s.episodes} 集`);
 if(s.podcastType==='audio')details.push(`每集額外音軌：${s.extras} 個`);
 else {details.push(`字幕：${{none:'不加購',ai:'AI未校對',checked:'AI＋基本人工校對'}[s.subtitle]||'待確認'}`);if(s.subtitle!=='none')details.push(`每集預估成品長度：${s.finished} 分鐘`);}
 }
 return ['SU STUDIO 製作費用估算',SERVICES[s.service],...details,...r.lines.map(l=>`${l.label}：NT$${l.amount.toLocaleString()}`),r.needsQuote?'製作費用：需另行報價':`${r.manual.length?'已知項目小計':'參考總額'}：NT$${r.total.toLocaleString()}`,r.needsQuote?'50%訂金：依正式報價確認':`50%參考訂金：NT$${r.deposit.toLocaleString()}（依正式報價確認）`,...r.pending.map(n=>`資料待確認：${n}`),...r.manual.map(n=>`費用另報：${n}`),...r.notes].join('\n');
}
