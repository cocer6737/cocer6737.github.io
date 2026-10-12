// Short English event titles retain their original themes in separate summaries.
// English only: original articles, supplied images and unconfirmed dates stay intact.
const details = {
  '01': 'Art, meditation and fairy tales to welcome the Year of the Snake.',
  '02': 'A mindful gathering in Singapore focused on reflection and renewal.',
  '03': 'A gathering of movement and celebration.',
  '04': 'A full-day experience exploring sound, breath and renewal.',
  '06': 'The original article announces 29 November; the event date remains unconfirmed.',
  '07': 'A workshop exploring stillness and inner growth.',
  '08': 'Letting go of defences and reconnecting through movement.',
  '09': 'A rainy-day gathering focused on listening to the body.',
  '10': 'Sing for Inner Child: exploring the connection between singing and the inner child.',
  '11': 'An afternoon of reflection, without fixed answers.',
};

export function refineEnglishInsights(html) {
  html = html.replace('<h1>The Next</h1>', '<div><h1>The Next</h1><p class="english-section-summary">Conversations, community and wellbeing.</p></div>');
  html = html.replace(/<article class="(?:event|archive-card)"[\s\S]*?<\/article>/g, article => {
    const id = article.match(/activity-(\d\d)\.webp/)?.[1];
    if (!id) return article;
    if (id === '05') {
      return article.replace(/<h3>([^<]+)<br>([^<]+)<\/h3>/, '<h3>$1</h3><p class="english-event-summary">$2</p>');
    }
    const summary = details[id];
    return summary ? article.replace('</h3>', `</h3><p class="english-event-summary">${summary}</p>`) : article;
  });
  return html.replace('</head>', `<style id="english-editorial-details">
    .intro .english-section-summary { margin-top: 12px; font-size: 1rem; line-height: 1.6; color: #59636d; }
    .english-event-summary { margin: 12px 0 0; font-size: .95rem; line-height: 1.75; color: #59636d; max-width: 54ch; }
    .archive-card .english-event-summary { margin-bottom: 16px; }
  </style></head>`);
}
