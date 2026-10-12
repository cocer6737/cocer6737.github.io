import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copy } from './copy.mjs';
import { refineEnglishInsights } from './english-editorial.mjs';
import { homeIntroduction, homeIntroductionSources, homeIntroductionSegments } from './home-introduction.mjs';
import { siteOrigin } from './site-config.mjs';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = ['', 'services', 'about', 'insights', 'contact'];
const locales = ['zh', 'en', 'yue'];
const chunks = ['0mm76i68izmm_', '0p6x_ig3clcq_', '2fyh3ok81idvc', '2nrgwjf1qvm9h-about-v3', '1nefr52yq5w43-contact-qr-v2'];
const revision = '20261012-1';
const clientRevision = (chunk, locale) => locale === 'en' ? '20261012-3' : revision;
const untranslated = new Set();
const escape = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const unescape = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const destination = (locale, route) => `${locale === 'zh' ? '' : '/' + locale}/${route ? route + '/' : ''}`;
function translate(value, locale, report = true) {
  if (homeIntroductionSources.has(value)) return homeIntroduction[locale];
  if (locale === 'zh') {
    if (value === 'Inner Capital Group｜中文首页视觉样板') return 'Inner Capital Group｜财富、企业与全球资源';
    if (value === 'Inner Capital Group 中文首页静态视觉设计样板。') return 'Inner Capital Group 提供财富与家族、企业国际化、AI 与创新及私享社群综合服务。';
    return value;
  }
  if (copy.has(value)) return copy.get(value)[locale];
  if (copy.has(value.trim())) return value.replace(value.trim(), copy.get(value.trim())[locale]);
  const match = value.match(/^观看 (.+) 的微信视频号视频（新窗口打开）$/);
  if (match) return locale === 'en' ? `Watch ${translate(match[1], locale, false)} on WeChat Channels (opens in a new window)` : `觀看 ${translate(match[1], locale, false)} 嘅微信影片（新視窗開啟）`;
  if (/^The Next (卓越者|合伙人) .+ 人物海报$/.test(value) || /^The Next 卓越者 侯明伟人物海报$/.test(value)) {
    const name = value.replace(/^The Next (卓越者|合伙人) /, '').replace(/ ?人物海报$/, '');
    return locale === 'en' ? `The Next portrait poster: ${translate(name, locale, false)}` : `The Next 人物海報：${translate(name, locale, false).replace('侯明伟','侯明偉')}`;
  }
  for (const [pattern, en, yue] of [
    [/^打开(.+)详细介绍$/, n=>`Explore ${n}`, n=>`查看${n}詳情`],
    [/^将(.+)移到中央$/, n=>`Bring ${n} to the centre`, n=>`將${n}移到中央`],
    [/^(.+)服务主题视觉$/, n=>`${n} service illustration`, n=>`${n}服務圖片`],
    [/^(.+)主题视觉$/, n=>`${n} illustration`, n=>`${n}圖片`],
  ]) {
    const found = value.match(pattern);
    if (found) return (locale === 'en' ? en : yue)(translate(found[1], locale, false));
  }
  if (/^(联系|信息)-/.test(value)) return value; // React keys, not visible copy.
  if (report && /[\u3400-\u9fff]/.test(value) && !value.startsWith('$')) untranslated.add(value);
  return value;
}
function localHref(value, locale) {
  if (locale === 'zh') return value;
  if (/^\/(?:en|yue)(?:\/|$)/.test(value)) return value;
  if (/^\/(?:services|about|insights|contact)(?:[\/#?]|$)/.test(value) || /^\/(?:[?#]|$)/.test(value)) return `/${locale}${value}`;
  return value;
}
function chunkRef(value, locale) {
  if (locale === 'zh') return value;
  for (const chunk of chunks) value = value.replaceAll(`${chunk}.js`, `${chunk}-${locale}-${clientRevision(chunk, locale)}.js`);
  return value;
}
const element = (tag, props, children) => ['$' ,tag, null, {...props, ...(children === undefined ? {} : {children})}];
function selector(locale, route) {
  return element('nav', {className:'language-switch', 'aria-label':'Language / 语言 / 語言'}, locales.map(code => element('a', {
    href:destination(code, route), lang:code === 'zh' ? 'zh-Hans' : code === 'yue' ? 'yue-Hant' : 'en',
    hrefLang:code === 'zh' ? 'zh-Hans' : code === 'yue' ? 'yue-Hant' : 'en',
    'data-language':code, ...(code === locale ? {'aria-current':'true'} : {}),
    'aria-label':{zh:'简体中文',en:'English',yue:'繁體粵語'}[code]
  }, {zh:'简中', en:'EN', yue:'粵語'}[code])));
}
function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (Array.isArray(value) && value[0] !== '$') return value.map(render).join('');
  if (!Array.isArray(value)) return escape(value);
  const [,tag,,{children,...props}] = value;
  return `<${tag}${Object.entries(props).map(([key,v])=>` ${key === 'className' ? 'class' : key === 'hrefLang' ? 'hreflang' : key}="${escape(v)}"`).join('')}>${render(children)}</${tag}>`;
}
function transform(value, locale, route, key = '') {
  if (typeof value === 'string') {
    if (key === 'href') return localHref(value, locale);
    if (['src','srcSet','poster'].includes(key)) return chunkRef(value,locale);
    if (['id','className','name','key','aria-labelledby','aria-controls'].includes(key)) return value;
    return chunkRef(translate(value, locale), locale);
  }
  if (Array.isArray(value)) {
    if (value[0] === '$' && value[1] === 'html') {
      const node=value.map((v,i)=>i===2?v:transform(v,locale,route));
      node[3].lang=locale==='zh'?'zh-Hans':locale==='en'?'en-SG':'yue-Hant';
      node[3]['data-site-language']=locale;
      return node;
    }
    if (value[0] === '$' && value[1] === 'header') {
      const props={...value[3]};
      const children=Array.isArray(props.children) && props.children[0]!=='$'?props.children:[props.children];
      props.children=children.filter(child=>child?.[3]?.className!=='language-switch');
      const node = [value[0],value[1],value[2],transform(props,locale,route)];
      const classes=(node[3].className || '').replace(/ ?site-header/g,'');
      const masthead=classes.includes('bg-ink text-foreground');
      node[3].className = `${classes}${masthead?' site-header':''}`.trim();
      if(masthead) node[3].children = [selector(locale,route), ...node[3].children];
      return node;
    }
    return value.map(v=>transform(v,locale,route,key));
  }
  if (value && typeof value === 'object') {
    const result = Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k === 'wrapSegments' ? v : transform(v,locale,route,k)]));
    if (typeof value.children === 'string' && 'baseOpacity' in value && 'baseRotation' in value) {
      if (route === '' && homeIntroductionSources.has(value.children)) {
        result.wrapSegments = homeIntroductionSegments(locale);
        result.textClassName = (result.textClassName || '').replace(/(^|\s)!flex(?=\s|$)/g,' ').trim();
      }
      else if (locale !== 'zh') result.wrapSegments = locale === 'en' ? result.children.match(/\S+\s*/g) || [result.children] : Array.from(result.children);
    }
    return result;
  }
  return value;
}
function records(text, locale, route) {
  return text.split('\n').map(line=>{
    const colon = line.indexOf(':');
    if (colon < 0) return line;
    const data = line.slice(colon+1);
    if (!data.startsWith('[') && !data.startsWith('{')) return chunkRef(line,locale);
    try {return `${line.slice(0,colon+1)}${JSON.stringify(transform(JSON.parse(data),locale,route))}`;} catch {return chunkRef(line,locale);}
  }).join('\n');
}
function collectReveals(text) {
  const result=[];
  function visit(x) {
    if (!x || typeof x!=='object') return;
    if (typeof x.children==='string' && 'baseOpacity' in x && 'baseRotation' in x) result.push(x);
    else Object.values(x).forEach(visit);
  }
  for (const line of text.split('\n')) {try{visit(JSON.parse(line.slice(line.indexOf(':')+1)));}catch{}}
  return result;
}
function syncReveals(html, flight) {
  let n=0; const props=collectReveals(flight);
  return html.replace(/<p class="scroll-reveal__text[^>]*>[\s\S]*?<\/p>/g,()=>{
    const p=props[n++]; if (!p) throw Error('Missing reveal props');
    const chars=s=>Array.from(s).map(c=>c==='\n'?'<br/>':`<span data-scroll-reveal-character="true" class="scroll-reveal__character">${escape(c===' '?'\u00a0':c)}</span>`).join('');
    const content=(p.wrapSegments?.join('')===p.children?p.wrapSegments:[p.children]).map(s=>/^\s+$/.test(s)?chars(s):`<span class="scroll-reveal__segment" data-scroll-reveal-segment="true">${chars(s)}</span>`).join('');
    return `<p class="${escape(('scroll-reveal__text '+(p.textClassName||'')).trim())}">${content}</p>`;
  });
}
function htmlPage(source, locale, route, flight) {
  // Rendered character spans are regenerated from the same translated props as React.
  let html=source.replace(/<nav class="language-switch"[^>]*>[\s\S]*?<\/nav>/g,'').replace(/ ?site-header/g,'').replace(/<p class="scroll-reveal__text[^>]*>[\s\S]*?<\/p>/g,m=>m.replace(/[\u3400-\u9fff]/g,c=>`&#${c.codePointAt(0)};`));
  html=html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/g,token=>{
    if (token.startsWith('<script')) {
      const prefix='<script>self.__next_f.push(';
      if (token.startsWith(prefix)) {
        const end=token.lastIndexOf(')</script>');
        try {const array=JSON.parse(token.slice(prefix.length,end));if(array[0]===1 && typeof array[1]==='string')array[1]=records(array[1],locale,route);return prefix+JSON.stringify(array)+')</script>';}catch{}
      }
      return chunkRef(token,locale);
    }
    if (token.startsWith('<style') || token.startsWith('<!--')) return token;
    if (token.startsWith('<')) return chunkRef(token.replace(/\b(alt|aria-label|placeholder|title|content|href)="([^"]*)"/g,(m,key,v)=>`${key}="${escape(key==='href'?localHref(unescape(v),locale):translate(unescape(v),locale))}"`),locale);
    return escape(translate(unescape(token),locale));
  });
  html=html.replace(/ data-site-language="[^"]*"/g,'').replace(/<html lang="[^"]*"/,`<html lang="${locale==='zh'?'zh-Hans':locale==='en'?'en-SG':'yue-Hant'}" data-site-language="${locale}"`);
  if (!html.includes('class="language-switch"')) html=html.replace(/<header\b([^>]*)>/,(m,attrs)=>`<header${attrs.replace(/class="([^"]*)"/,'class="$1 site-header"')}>${render(selector(locale,route))}`);
  if (locale==='en' && route==='about') html=html.replace('>，</span>','>. </span>');
  html=syncReveals(html,flight);
  if (locale === 'en' && route === 'insights') html = refineEnglishInsights(html);
  const head=locales.map(code=>`<link rel="alternate" hreflang="${code==='zh'?'zh-Hans':code==='yue'?'yue-Hant':'en'}" href="${siteOrigin}${destination(code,route)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${siteOrigin}/${route?route+'/':''}"><link rel="canonical" href="${siteOrigin}${destination(locale,route)}"><link rel="stylesheet" href="/language-switch-${revision}.css"><script defer src="/language-switch-${revision}.js"></script>` + (route===''?'<link rel="stylesheet" href="/home-introduction-20261012-1.css">':'');
  // Idempotent when rebuilding from the existing Chinese export.
  html=html.replace(/<link[^>]+(?:rel="(?:alternate|canonical)"|href="\/(?:language-switch-|home-introduction-))[^>]*>|<script[^>]+src="\/language-switch-[^>]*><\/script>/g,'');
  return html.replace(/site-performance\.css\?v=[^"<]+/g,'site-performance.css?v=20261012-3').replace('</head>',head+'</head>');
}
for (const locale of ['en','yue']) for (const chunk of chunks) {
  let text=fs.readFileSync(path.join(site,'_next/static/chunks',chunk+'.js'),'utf8');
  text=text.replace(/"(?:[^"\\]|\\.)*"/g,literal=>{
    let value;try{value=JSON.parse(literal);}catch{return literal;}
    return JSON.stringify(chunkRef(localHref(translate(value,locale),locale),locale));
  });
  text=text.replace('${n}主题视觉',locale==='en'?'${n} illustration':'${n}圖片')
    .replace('${d.title}服务主题视觉',locale==='en'?'${d.title} service illustration':'${d.title}服務圖片')
    .replace('打开${e.title}详细介绍',locale==='en'?'Explore ${e.title}':'查看${e.title}詳情')
    .replace('将${e.title}移到中央',locale==='en'?'Bring ${e.title} to the centre':'將${e.title}移到中央');
  if(locale==='en' && chunk.startsWith('2nrg')) text=text.replace('children:"，"','children:". "');
  fs.writeFileSync(path.join(site,'_next/static/chunks',`${chunk}-${locale}-${clientRevision(chunk, locale)}.js`),text);
}
// Read all sources before altering the Chinese originals.
const sources=new Map(routes.map(route=>[route,{
  html:fs.readFileSync(path.join(site,route,'index.html'),'utf8'),
  flight:route==='insights'?'':fs.readFileSync(path.join(site,route,'index.txt'),'utf8'),
  records:route==='insights'?[]:fs.readdirSync(path.join(site,route)).filter(f=>f.endsWith('.txt')).map(f=>[f,fs.readFileSync(path.join(site,route,f),'utf8')])
}]));
for(const locale of locales) for(const route of routes) {
  const source=sources.get(route), dir=path.join(site,locale==='zh'?'':locale,route);
  fs.mkdirSync(dir,{recursive:true});
  const flight=records(source.flight,locale,route);
  fs.writeFileSync(path.join(dir,'index.html'),htmlPage(source.html,locale,route,flight));
  if(route!=='insights') for(const [file,content] of source.records) fs.writeFileSync(path.join(dir,file),records(content,locale,route));
}
console.log('Created 15 pages with matching rendered and interactive copy.');
console.log('Untranslated candidates:',JSON.stringify([...untranslated].filter(v=>v.trim() && v.length>1),null,2));
