import { PRICING, SHOOT_CONFIGS, TRAVEL_REGIONS, YOUTUBE_PLANS, SERVICES, calculate, summary } from './estimate-pricing.js';
const form=document.querySelector('#estimate-form'), fields=document.querySelector('#fields');
const state={product:'youtube',production:'editOnly',service:'youtube',shootKind:'general',overtimeMinutes:0,hours:4,travel:'taichung',edit:'youtube',partnership:'none',quantity:1,duration:5,customDuration:5,rawYoutube:'unknown',tier:'basic',raw:'unknown',podcastType:'audio',recording:60,episodes:1,extras:0,subtitle:'none',finished:60,effects:false,shootExtra:false,specialRequest:''};
const money=n=>`NT$${n.toLocaleString('zh-TW')}`;
const select=(name,label,options)=>`<label class="field"><span>${label}</span><select name="${name}">${options.map(([v,t])=>`<option value="${v}" ${String(state[name]??(name==='bundleKind'?state.shootKind:''))===String(v)?'selected':''}>${t}</option>`).join('')}</select></label>`;
const number=(name,label,min,max)=>`<label class="field"><span>${label}</span><input name="${name}" type="number" min="${min}" max="${max}" step="1" value="${state[name]}" required></label>`;
const isShoot=()=>['shoot','podcastShoot','bundle'].includes(state.service);
const edit=()=>state.service==='bundle'?state.edit:state.service;
function resetDuration(){const p=PRICING[edit()];if(p?.durations)state.duration=p.durations[0];}
const products=[['youtube','YouTube 影片','長篇內容、訪談與頻道影片'],['short','短影音','社群短片與直式內容'],['podcast','Podcast','聲音節目與 Video Podcast'],['event','活動精華','濃縮現場，留下精彩片段'],['shootOnly','只需要拍攝','已有後製安排，交付拍攝原始檔']];
function syncService(){
 state.edit=state.product;
 state.shootKind=state.bundleKind||(state.product==='podcast'?'podcast':'general');
 if(state.product==='shootOnly')state.shootKind=state.shootKindOnly||'general';
 state.service=state.product==='shootOnly'?(state.shootKindOnly==='podcast'?'podcastShoot':'shoot'):state.production==='withShoot'?'bundle':state.product;
}
function renderProducts(){document.querySelector('#services').innerHTML=products.map(([v,t,d],i)=>`<label class="service product"><input type="radio" name="product" value="${v}" ${v===state.product?'checked':''}><span><small>0${i+1} / ${v==='shootOnly'?'PRODUCTION':'CONTENT'}</small><strong>${t}</strong><em>${d}</em></span></label>`).join('');}
renderProducts();
document.querySelector('#line').href=PRICING.line;
function renderFields(){let html='';
 const effectsLabel=form.elements.effects.closest('label');effectsLabel.hidden=state.product==='shootOnly';form.elements.effects.disabled=state.product==='shootOnly';
 if(state.product!=='shootOnly'){
 html+=select('production','這次需要搭配拍攝嗎？',[['editOnly','我有素材，只需要剪輯／後製'],['withShoot','需要 SU STUDIO 拍攝＋剪輯／後製']]);
 if(state.service==='bundle'){
 html+=select('bundleKind','拍攝配置',Object.entries(SHOOT_CONFIGS).map(([key,config])=>[key,config.name]));
 html+='<p class="help">拍攝優惠僅限同時委託SU STUDIO拍攝與剪輯，拍攝費與剪輯費分開計算。</p>';
 }
 }else{
 html+=select('shootKindOnly','拍攝類型',Object.entries(SHOOT_CONFIGS).map(([key,config])=>[key,config.name]));
 html+='<p class="help">純拍攝交付拍攝原始檔，依純拍攝費率估算。</p>';
 }
 if(isShoot()){
 html+=select('hours','基本拍攝方案',[[4,'4 小時'],[8,'8 小時']]);
 html+=number('overtimeMinutes','預計超過方案的時間（分鐘，無超時填0）',0,10000)+'<p class="help">不足1小時以1小時計費，不提供半小時計費。時間包含架設、測試、拍攝與撤場，超時費不適用推廣折扣。</p>';
 html+=select('travel','拍攝地區（車馬費）',Object.entries(TRAVEL_REGIONS).map(([key,label])=>[key,key==='taichung'||key==='other'?label:`${label}｜${money(PRICING.travel[key])}${key==='far'?'起，依地點確認':''}`]));
 html+='<label class="check"><input type="checkbox" name="shootExtra" '+(state.shootExtra?'checked':'')+'>加機位、深夜拍攝或其他特殊需求</label><p class="help">特殊需求另行報價；一般超時請填寫上方分鐘數，系統會自動估算。</p>';
 }
 if(isShoot()&&state.shootExtra)html+='<label class="field"><span>特殊需求說明（選填）</span><textarea name="specialRequest" rows="3" maxlength="1000" placeholder="例如：預計延長拍攝1小時、希望增加機位，或其他拍攝需求"></textarea></label>';
 const e=edit();
 if(['youtube','short','event'].includes(e)){
 const p=PRICING[e];
 html+=select('duration','預計成品長度（每支）',[...p.durations.map(v=>[v,`${v} ${e==='short'?'秒':'分鐘'}內`]),['custom','自行填寫']]);
 if(state.duration==='custom')html+=`<label class="field"><span>自行填寫成品長度（${e==='short'?'秒':'分鐘'}）</span><input name="customDuration" type="number" min="0.01" max="10000" step="any" value="${Number.isFinite(state.customDuration)?state.customDuration:''}" required></label><p class="help">依涵蓋此長度的既有級距估算；超過${p.durations.at(-1)}${e==='short'?'秒':'分鐘'}另行報價。</p>`;
 if(e==='youtube'){
 html+='<fieldset class="comparison"><legend>選擇剪輯方案・內容比較</legend><div class="plan-grid">'+['basic','pro'].map(t=>`<label class="plan"><input type="radio" name="tier" value="${t}" ${state.tier===t?'checked':''}><span><strong>${YOUTUBE_PLANS[t].name}${t==='pro'?'<span class="plan-recommended">★ 推薦</span>':''}</strong><ul class="plan-features">${YOUTUBE_PLANS[t].features.map(f=>`<li class="${(/修改|贈送封面/.test(f))?'plan-difference':''}">${f}</li>`).join('')}</ul><b>${state.tier===t?'已選擇':'選擇此方案'}</b></span></label>`).join('')+'</div><p class="help">專業方案加含字卡設計、2次修改，並贈送1張封面設計。基本字幕的校對程度、修改是否包含重剪或新增素材，依需求確認。</p></fieldset>';
 if(!isShoot())html+=select('rawYoutube','原始素材量（選填）',[['under30','30 分鐘內'],['under60','30～60 分鐘'],['over60','超過 60 分鐘'],['unknown','不確定']]);
 if(!isShoot())html+='<p class="help">提供大概素材量即可，不影響目前級距價格；超量或複雜素材會再與你確認。</p>';
 }else if(!isShoot())html+=select('raw',`原始素材是否在 ${p.rawLimit} 分鐘內？（選填）`,[['unknown','不確定，請工作室協助確認'],['within',`是，${p.rawLimit} 分鐘內`],['over','超過標準素材量，請人工報價']]);
 html+=number('quantity','成品數量（支）',1,10000)+'<p class="help">30支以內依相同規格單價乘數量計算；超過30支另行報價。未套用批量優惠，不同規格請分別估算。搭配拍攝仍以一次拍攝方案計算。</p>';
 if(e==='youtube')html+=`<aside id="youtube-partnership" class="partnership" ${state.quantity>=3?'':'hidden'} aria-labelledby="partnership-title"><p class="eyebrow">LONG-TERM PARTNERSHIP</p><h3 id="partnership-title">固定更新，也有長期合作方案</h3><p>合作 <strong>6個月／12個月</strong>，每月固定 <strong>3支以上</strong>，剪輯費享 <strong>95折</strong>。</p><ul><li>合作確認後，先收取<strong>合約總金額50%</strong>的訂金，用來保留剪輯排程。</li><li>尾款於合約期滿、結案後支付。</li><li>若合約期間內實際剪輯數量未達原約定支數，相關費用依原價計算，不適用折扣。</li></ul><p class="help">目前估算維持原價；長期合作優惠需確認合約期間與每月支數後，由工作室提供正式報價。95折僅適用剪輯費。</p><div class="partnership-choice"><p>是否考慮長期合作？</p>${select('partnership','長期合作意向',[['none','先以單次製作估算'],['6','有興趣，合作6個月'],['12','有興趣，合作12個月']])}</div><p class="help">選擇僅代表洽詢意向，不會自動成立合約；請在聯繫時確認每月固定支數。</p></aside>`;

 }
 if(e==='podcast'){
 html+=select('podcastType','每集後製方案',[['audio','純音訊｜雙軌'],['video','Video Podcast｜雙機、不含字幕'],['videoShort','Video Podcast＋30秒短影音']]);
 html+=number('episodes','後製集數',1,100)+number('recording','每集錄製長度（分鐘）',1,10000)+(state.podcastType==='audio'?number('extras','每集額外音軌數（雙軌以外）',0,100):'');
 html+='<p class="help">每集規格不同時，請分別估算。標準錄製60分鐘內；超時依每10分鐘加價，未滿10分鐘進位待確認；超過90分鐘人工報價。</p>';
 if(state.podcastType!=='audio'){
 html+=select('subtitle','字幕加購（依每集成品長度）',[['none','不加購字幕'],['ai','AI 未校對｜每分鐘50元，最低1,000元'],['checked','AI＋基本人工校對｜每分鐘120元，最低2,000元']]);
 if(state.subtitle!=='none')html+=number('finished','每集預估成品長度（分鐘）',1,10000);
 }
 }
 fields.innerHTML=html;
 const request=fields.querySelector('[name=specialRequest]');if(request)request.value=state.specialRequest;
}
let current;
function renderResult(){const target=document.querySelector('#result');
 const partnership=document.querySelector('#youtube-partnership');if(partnership){partnership.hidden=!(edit()==='youtube'&&Number.isInteger(Number(state.quantity))&&Number(state.quantity)>=3);partnership.querySelector('select').disabled=partnership.hidden;}
 try{current=calculate({...state,raw:edit()==='youtube'?state.rawYoutube:state.raw,extras:edit()==='podcast'&&state.podcastType!=='audio'?0:state.extras});
 target.replaceChildren();
 const el=(tag,text,cls)=>{const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;};
 target.append(el('p',current.needsQuote?'製作費用':current.manual.length?'已知項目小計 · 部分費用待確認':'參考製作費用','total-label'),el('div',current.needsQuote?'需另行報價':money(current.total),'amount'),el('p',current.needsQuote?'50% 訂金依正式報價確認':`50% 參考訂金 ${money(current.deposit)}；依正式報價確認`,'deposit'));
 const rows=el('div','','rows');for(const line of current.lines){const row=el('div','','row');row.append(el('span',line.label),el('span',money(line.amount)));rows.append(row);}target.append(rows);
 if(edit()==='youtube'&&Number(state.quantity)>=3&&['6','12'].includes(state.partnership))target.append(el('p',`長期合作洽詢：有興趣合作${state.partnership}個月。每月固定支數待確認；目前金額未套用95折，依正式合約報價。`,'pending'));
 if(current.pending.length)target.append(el('p',`資料待確認：${current.pending.join('；')}。`,'pending'));
 if(current.manual.length)target.append(el('p',`尚未包含：${current.manual.join('；')}。`,'manual'));
 const details=el('details','','quote-details');details.append(el('summary','查看交付方式與估價提醒'));const notes=el('ul','','notes');for(const note of current.notes)notes.append(el('li',note));details.append(notes);target.append(details);
 document.querySelector('#mobile-total').textContent=current.needsQuote?'需另行報價':`${current.manual.length?'已知小計':'參考費用'} ${money(current.total)}`;
 document.querySelector('#copy').disabled=false;
 }catch(error){current=null;target.textContent=error.message;document.querySelector('#mobile-total').textContent='請確認填寫內容';document.querySelector('#copy').disabled=true;}
 document.querySelector('#copy-status').textContent='';document.querySelector('#fallback').hidden=true;
}
form.addEventListener('submit',event=>event.preventDefault());
form.addEventListener('change',event=>{const t=event.target;if(!t.name)return;state[t.name]=t.type==='checkbox'?t.checked:t.type==='number'?Number(t.value):t.value;
 if(t.name==='hours')state.hours=Number(t.value);
 if(['product','production','shootKindOnly','bundleKind'].includes(t.name)){syncService();if(t.name==='product'){state.bundleKind=state.product==='podcast'?'podcast':'general';state.overtimeMinutes=0;state.partnership='none';state.production='editOnly';state.shootExtra=false;state.specialRequest='';state.effects=false;state.quantity=1;state.podcastType='audio';state.finished=60;state.customDuration=5;state.shootKindOnly='general';state.episodes=1;state.recording=60;state.extras=0;state.subtitle='none';state.raw='unknown';state.rawYoutube='unknown';state.hours=4;state.travel='taichung';state.tier='basic';syncService();resetDuration();form.elements.effects.checked=false;document.querySelector('#selection-status').textContent='已切換內容類型，製作方式、數量與加購選項已重設，請重新確認需求。';}}
 if(['product','production','shootKindOnly','bundleKind','podcastType','subtitle','duration','shootExtra'].includes(t.name))renderFields();
 if(t.name==='tier'){for(const radio of fields.querySelectorAll('[name=tier]'))radio.closest('label').querySelector('b').textContent=radio.checked?'已選擇':'選擇此方案';}
 renderResult();
});
form.addEventListener('input',event=>{if(event.target.name==='specialRequest'){state.specialRequest=event.target.value;renderResult();}if(event.target.type==='number'){state[event.target.name]=event.target.value===''?NaN:Number(event.target.value);renderResult();}});
document.querySelector('#copy').addEventListener('click',async()=>{if(!current)return;const text=summary(state,current);try{await navigator.clipboard.writeText(text);document.querySelector('#copy-status').textContent='已複製！可到 LINE 貼上摘要。';}catch{document.querySelector('#fallback').hidden=false;const area=document.querySelector('#summary-text');area.value=text;area.focus();area.select();document.querySelector('#copy-status').textContent='瀏覽器無法自動複製，請手動複製下方摘要。';}});
renderFields();renderResult();

// Styled listbox layered over a native select; native control remains the fallback.
let openMenu=null;
function closeMenu(restore=false){if(!openMenu)return;const {button,menu}=openMenu;button.setAttribute('aria-expanded','false');menu.remove();openMenu=null;if(restore)button.focus();}
function enhanceSelects(){
 closeMenu();
 for(const native of fields.querySelectorAll('select')){
  if(native.dataset.enhanced)continue;
  native.dataset.enhanced='true';
  const label=native.closest('label');
  const title=label.querySelector('span').textContent;
  const wrapper=document.createElement('div');wrapper.className='glass-select';
  const button=document.createElement('button');button.type='button';button.className='glass-trigger';button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',`${title}：${native.selectedOptions[0].textContent}`);button.textContent=native.selectedOptions[0].textContent;
  native.after(wrapper);wrapper.append(button);native.hidden=true;
  // Keep a label from forwarding clicks to its hidden native select.
  button.addEventListener('click',event=>{event.preventDefault();if(openMenu?.button===button){closeMenu();return;}show();});
  function show(){
   closeMenu();const menu=document.createElement('div');menu.className='glass-menu';menu.role='listbox';menu.setAttribute('aria-label',title);
   let options=[];
   for(const option of native.options){const item=document.createElement('button');item.type='button';item.role='option';item.className='glass-option';item.textContent=option.textContent;item.setAttribute('aria-selected',String(option.selected));item.tabIndex=-1;
    item.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();native.value=option.value;button.textContent=option.textContent;button.setAttribute('aria-label',`${title}：${option.textContent}`);closeMenu();native.dispatchEvent(new Event('change',{bubbles:true}));const replacement=fields.querySelector(`select[name="${native.name}"]`);replacement?.nextElementSibling?.querySelector('button')?.focus();});menu.append(item);options.push(item);}
   wrapper.append(menu);openMenu={button,menu};button.setAttribute('aria-expanded','true');
   const rect=button.getBoundingClientRect();const needed=Math.min(menu.scrollHeight,310);const below=window.innerHeight-rect.bottom-16;const above=rect.top-16;const up=below<needed&&above>below;menu.classList.toggle('opens-up',up);menu.style.maxHeight=`${Math.max(80,Math.min(310,up?above:below))}px`;
   const selected=Math.max(0,native.selectedIndex);options[selected]?.focus();
   menu.addEventListener('keydown',event=>{let i=options.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();i=event.key==='Home'?0:event.key==='End'?options.length-1:(i+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[i].focus();}else if(event.key==='Escape'){event.preventDefault();closeMenu(true);}else if(event.key==='Tab')closeMenu();});
  }
  button.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();show();}});
 }
}
new MutationObserver(enhanceSelects).observe(fields,{childList:true});
document.addEventListener('click',event=>{if(openMenu&&!event.target.closest('.glass-select'))closeMenu();});
enhanceSelects();
