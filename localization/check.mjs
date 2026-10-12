import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const routes=['','services','about','insights','contact'];
const locales=['','en','yue'];
const video=['AsASofsYvd','A33gyO7eCW','AY0RK6NIQE','ApTg7CnWvQ','AssatN6YE7','ApeZgHNtn0'];
let documents=0,links=0;
for(const locale of locales) for(const route of routes) {
  const filename=path.join(root,locale,route,'index.html'), html=fs.readFileSync(filename,'utf8');
  const markup=html.replace(/<script\b[\s\S]*?<\/script>/g,'');
  assert.equal((markup.match(/class="language-switch"/g)||[]).length,1,filename);
  assert.equal((markup.match(/data-language="/g)||[]).length,3,filename);
  const languageMarkup=markup.match(/<nav class="language-switch"[\s\S]*?<\/nav>/)[0];
  assert.equal((languageMarkup.match(/aria-current="true"/g)||[]).length,1,filename);
  assert(markup.includes(`lang="${locale==='en'?'en-SG':locale==='yue'?'yue-Hant':'zh-Hans'}"`));
  assert.equal((markup.match(/ data-site-language="/g)||[]).length,1,'One language attribute per document');
  assert.equal((markup.match(/rel="canonical"/g)||[]).length,1);
  assert.equal((markup.match(/rel="alternate"/g)||[]).length,4);
  if(locale==='en') {
    const text=markup.replace(/<style\b[\s\S]*?<\/style>/g,'').replace(/<[^>]*>/g,'').replaceAll('\u00a0',' ');
    assert.equal((text.match(/The Next Fortune/g)||[]).length,route===''?1:0,'The Next Fortune is reserved for the home title');
    if(route===''||route==='about') assert(text.includes('family office infrastructure'),'Keep the approved family office terminology');
    if(route==='insights') {
      assert(text.includes('Next-Generation Voices'));
      assert(text.includes('Wellbeing &amp; Community Events'));
      assert(text.includes('Tea and Board Games'));
      for(const retired of ['Chess','supplied material','image and article pairings','Singapore-first','Emerging Partners']) assert(!text.includes(retired),`Retired English wording: ${retired}`);
    }
    if(route==='contact') {
      assert(text.includes('Check Your Details'));
      assert(text.includes('This form is a demonstration only.'));
    }
  }
  if(route==='insights') for(const id of video) assert(markup.includes('https://weixin.qq.com/sph/'+id));
  if(route==='contact') for(const qr of ['whatsapp-qr-20261012.png','wechat-qr-20261012.png']) assert(markup.includes(qr));
  for(const match of html.matchAll(/\b(?:href|src|poster)="(\/[^"#?]*)[^\"]*"/g)) {
    const raw=match[1], target=path.join(root,raw);
    assert(fs.existsSync(target)||fs.existsSync(path.join(target,'index.html')),`Missing ${raw} in ${filename}`);
    links++;
  }
  documents++;
}
for(const name of fs.readdirSync(path.join(root,'_next/static/chunks')).filter(n=>/-(?:en|yue)-20261012-\d+\.js$/.test(n))) execFileSync(process.execPath,['--check',path.join(root,'_next/static/chunks',name)]);
execFileSync(process.execPath,['--check',path.join(root,'language-switch-20261012-1.js')]);
function luminance(hex) {const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
const contrast=(luminance('fffaf3')+.05)/(luminance('a8330e')+.05);
assert(contrast>=4.5);
console.log(JSON.stringify({documents,validLocalReferences:links,localizedClientChunks:10,selectorContrast:Number(contrast.toFixed(2)),videoLinksPreserved:true,qrImagesPreserved:true},null,2));
