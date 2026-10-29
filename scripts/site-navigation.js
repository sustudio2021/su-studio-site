// Shared mobile navigation. Desktop links and no-JavaScript navigation stay available.
const sourceNav=document.querySelector('nav.site-nav');
if(sourceNav){
 const trigger=document.createElement('button');
 trigger.type='button';trigger.className='mobile-nav-toggle';trigger.innerHTML='<span class="mobile-nav-bars" aria-hidden="true"><i></i><i></i><i></i></span>';trigger.setAttribute('aria-label','開啟導覽選單');
 trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','mobile-site-menu');
 const dialog=document.createElement('dialog');dialog.id='mobile-site-menu';dialog.className='mobile-nav-dialog';dialog.setAttribute('aria-labelledby','mobile-menu-title');
 const panel=document.createElement('div');panel.className='mobile-nav-panel';
 const heading=document.createElement('div');heading.className='mobile-nav-heading';
 const title=document.createElement('h2');title.id='mobile-menu-title';title.textContent='網站導覽';title.className='mobile-nav-sr-only';
 const close=document.createElement('button');close.type='button';close.className='mobile-nav-close';close.innerHTML='<span class="mobile-nav-x" aria-hidden="true"></span>';close.setAttribute('aria-label','關閉選單');
 heading.append(title,close);
 const nav=document.createElement('nav');nav.className='mobile-nav-links';nav.setAttribute('aria-label','手機版主要導覽');
 const links=[...sourceNav.querySelectorAll('a')].map(a=>a.cloneNode(true));
 if(!links.some(a=>a.textContent.trim()==='HOME')){const home=document.createElement('a');home.href='/';home.textContent='HOME';links.unshift(home);}
 const currentPath=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
 for(const link of links){
  const path=new URL(link.href).pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
  if(path===currentPath||(path==='/index'&&currentPath==='/'))link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
  nav.append(link);
 }
 panel.append(heading,nav);dialog.append(panel);document.body.append(trigger,dialog);
 document.documentElement.classList.add('mobile-nav-enhanced');
 function hide(){dialog.close();}
 trigger.addEventListener('click',()=>{dialog.showModal();trigger.setAttribute('aria-expanded','true');document.documentElement.classList.add('mobile-menu-open');});
 close.addEventListener('click',hide);
 dialog.addEventListener('click',event=>{if(event.target===dialog)hide();});
 nav.addEventListener('click',event=>{if(event.target.closest('a'))hide();});
 dialog.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');document.documentElement.classList.remove('mobile-menu-open');trigger.focus();});
 matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches&&dialog.open)hide();});
}
