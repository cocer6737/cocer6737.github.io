// This copy belongs only to the small introduction on the home page.
const zhSegments = [
  'Inner Capital Group ', '是面向', '高净值家庭', '与家族办公室的', '平台及咨询服务公司。', '\n\n',
  '核心业务：', '财富数据整合与可视化、', '家办数字化及 AI 转型，', '以及银行与', '专业机构服务协调。', '\n\n',
  '增值服务：', '围绕教育、', '健康、', '下一代成长与生活方式，', '提供家庭礼宾服务', '（Family Concierge）。',
];
const yueSegments = [
  'Inner Capital Group ', '係服務', '高淨值家庭', '同家族辦公室嘅', '平台及諮詢服務公司。', '\n\n',
  '核心業務：', '財富數據整合同視覺化、', '家辦數碼化及 AI 轉型，', '以及銀行同', '專業機構嘅服務協調。', '\n\n',
  '增值服務：', '圍繞教育、', '健康、', '下一代成長同生活方式，', '提供家庭禮賓服務', '（Family Concierge）。',
];

export const homeIntroduction = {
  zh: zhSegments.join(''),
  en: 'Inner Capital Group is a platform and consulting services company serving high-net-worth families and family offices.\n\nCore business: Wealth data aggregation and visualisation; family office digitalisation and AI transformation; and service coordination with banks and professional firms.\n\nValue-added services: Family Concierge services covering education, health, next-generation development and lifestyle.',
  yue: yueSegments.join(''),
};
export const homeIntroductionSources = new Set([
  'Inner Capital Group 围绕财富与家族、企业国际化、AI 科技赋能及高端社群与生态四大核心服务，为企业家、高净值家庭与家族办公室，提供家办基础建设、企业出海咨询及全球专业资源的一站式综合解决方案。',
  homeIntroduction.zh,
]);

export function homeIntroductionSegments(locale) {
  if (locale === 'zh') return zhSegments;
  if (locale === 'yue') return yueSegments;
  // Keep paragraph breaks outside the non-wrapping word spans.
  return homeIntroduction.en.split(/(\n+)/).filter(Boolean).flatMap(part => part.startsWith('\n') ? [part] : part.match(/\S+[ \t]*/g) || [part]);
}
