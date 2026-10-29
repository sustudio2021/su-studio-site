import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
const footer=`<footer class="site-footer" id="contact">
  <div class="site-footer-inner">
    <a class="site-footer-home" href="/" aria-label="SU STUDIO 首頁"><img src="/su-logo.png" alt="SU STUDIO" width="54"></a>
    <span class="site-footer-tagline">Image × Sound × Design</span>
  </div>
</footer>`;
for(const file of readdirSync('.').filter(f=>f.endsWith('.html'))){
 let html=readFileSync(file,'utf8');
 // The KAI project return link belongs to its project section, not the site footer.
 html=html.replace(/<footer class="kai-about-footer">([\s\S]*?)<\/footer>/g,'<div class="kai-about-footer">$1</div>');
 html=html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/g,'');
 if(!html.includes('href="/site-footer.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/site-footer.css">\n</head>');
 html=html.replace('</body>',footer+'\n</body>');
 html=html.replace(/^[ \t]+$/gm,'').replace(/\n{3,}/g,'\n\n');
 writeFileSync(file,html);
}
console.log('Synced shared footer across all HTML pages.');
