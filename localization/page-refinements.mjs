const node = (tag, props, children, key = null) => ['$', tag, key, {...props, children}];

export const lawyerCopy = {
  zh: {
    title: '私人财富与家族办公室法律顾问',
    experience: '拥有十余年新加坡私人财富法律服务经验。',
    qualification: '持有中华人民共和国法律职业资格、英格兰及威尔士律师资格及美国纽约州律师资格，并为新加坡注册外国律师。',
    focus: '其业务重点涵盖私人财富、家族办公室及跨境交易法律服务。'
  },
  en: {
    title: 'Private Wealth & Family Office Counsel',
    experience: 'Over a decade of experience in Singapore private wealth legal services.',
    qualification: 'Holds the legal professional qualification of the People’s Republic of China, is qualified as a solicitor in England and Wales and as an attorney in New York State, and is a registered foreign lawyer in Singapore.',
    focus: 'The practice focuses on legal services for private wealth, family offices and cross-border transactions.'
  },
  yue: {
    title: '私人財富及家族辦公室法律顧問',
    experience: '擁有十多年新加坡私人財富法律服務經驗。',
    qualification: '持有中華人民共和國法律職業資格、英格蘭及威爾斯律師資格及美國紐約州律師資格，並為新加坡註冊外國律師。',
    focus: '其業務重點涵蓋私人財富、家族辦公室及跨境交易法律服務。'
  }
};

const lawyerTitleParts = {zh:['私人财富与','家族办公室法律顾问'],en:['Private Wealth & ','Family Office Counsel'],yue:['私人財富及','家族辦公室法律顧問']};
export function lawyerCard(locale) {
  const text = lawyerCopy[locale];
  const titleParts = lawyerTitleParts[locale];
  return node('article', {id:'legal-counsel',className:'lawyer-profile', 'data-lawyer-profile':'true', 'aria-labelledby':'legal-counsel-title'}, [
    node('header', {className:'lawyer-profile__header'}, node('h3', {id:'legal-counsel-title',className:'lawyer-profile__title'}, titleParts.map(part => node('span',{},part)))),
    node('div', {className:'lawyer-profile__copy'}, [
      node('p', {}, text.experience), node('p', {}, text.qualification), node('p', {}, text.focus)
    ])
  ], 'private-wealth-legal-counsel');
}

const titles = {
  zh: ['从一次交流开始，', '聊聊您的需求。'],
  en: ['Let’s talk about', 'what matters to you.'],
  yue: ['由一次交流開始，', '傾吓您嘅需要。']
};
export function translateRefinement(value, locale) {
  for (const key of Object.keys(lawyerCopy.zh)) if (value === lawyerCopy.zh[key]) return lawyerCopy[locale][key];
  const lawyerTitleIndex = lawyerTitleParts.zh.indexOf(value);
  if (lawyerTitleIndex >= 0) return lawyerTitleParts[locale][lawyerTitleIndex];
  const titleIndex = titles.zh.indexOf(value);
  if (titleIndex >= 0) return titles[locale][titleIndex];
}
export const contactTitle = locale => node('h1', {id:'contact-title',className:'contact-heading'}, titles[locale].map(text => node('span', {}, text)));

export function prepareNode(value, route) {
  if (route !== 'about' || !Array.isArray(value) || value[0] !== '$' || value[1] !== 'article' || value[2] !== 'Dr.C' || value[3]['data-text-profile']) return value;
  const article = structuredClone(value);
  article[3].id = 'technology-lead';
  article[3]['data-text-profile'] = 'true';
  const layout = article[3].children[3];
  layout.className = layout.className.replace('min-h-[31rem]', '').replace('lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]', '').replace(/\s+/g, ' ').trim();
  layout.children = [layout.children[0]];
  return article;
}

export function refineNode(value, locale, route) {
  if (!Array.isArray(value) || value[0] !== '$') return null;
  const props = value[3] || {};
  if (route === 'about' && value[1] === 'article' && (value[2] === '于岚律师' || props['data-lawyer-profile'])) return lawyerCard(locale);
  if (route === 'contact' && props.id === 'contact-title') return contactTitle(locale);
  return null;
}

export function refineHtml(html, locale, route, render, flight) {
  if (route === 'about') {
    const doctor = flight.split('\n').map(line => {
      try { return JSON.parse(line.slice(line.indexOf(':') + 1)); } catch { return null; }
    }).find(value => Array.isArray(value) && value[1] === 'article' && value[3]?.['data-text-profile']);
    if (!doctor || !doctor[3]['data-text-profile']) throw Error(`Missing text-only Dr.C profile on ${locale}/about`);
    let replaced = 0;
    html = html.replace(/<article\b[^>]*>[\s\S]*?<\/article>/g, article => {
      if (/>Dr\.\s?C<\/h3>/.test(article)) return render(doctor);
      if (!article.includes('yu-lan.jpg') && !article.includes('data-lawyer-profile=')) return article;
      replaced++;
      return render(lawyerCard(locale));
    });
    if (replaced !== 1) throw Error(`Expected one lawyer card on ${locale}/about, found ${replaced}`);
  }
  if (route === 'contact') html = html.replace(/<h1 id="contact-title"[^>]*>[\s\S]*?<\/h1>/, render(contactTitle(locale)));
  return html;
}
