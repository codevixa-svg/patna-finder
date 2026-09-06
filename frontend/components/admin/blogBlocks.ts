/**
 * Content Blocks & Article Templates for the CKEditor blog editor.
 *
 * These HTML snippets are inserted into the CKEditor content at the cursor
 * position. They use the site theme (amber-400 / navy text) and the same
 * Tailwind utility classes the public blog page compiles — Tailwind scans
 * this file (components/**), so every class used here is guaranteed to be
 * in the production CSS even though the HTML itself lives in the database.
 */

export interface ContentBlockDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  html: string;
}

export const CONTENT_BLOCKS: ContentBlockDef[] = [
  {
    id: 'section-heading',
    label: 'Section Heading',
    description: 'H2 — shows up in Table of Contents',
    icon: 'H2',
    html: '<h2>Section heading here</h2>',
  },
  {
    id: 'sub-heading',
    label: 'Sub Heading',
    description: 'H3 — smaller section title',
    icon: 'H3',
    html: '<h3>Sub heading here</h3>',
  },
  {
    id: 'info-box',
    label: 'Pro Tip Box',
    description: 'Amber callout with 💡 icon',
    icon: '💡',
    html: '<div class="my-6 flex items-start gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4"><span class="shrink-0 text-lg">💡</span><div><p class="font-bold text-gray-900">Pro Tip</p><p class="mt-0.5 text-sm text-gray-600">Write your tip or note here…</p></div></div>',
  },
  {
    id: 'success-box',
    label: 'Good to Know Box',
    description: 'Green callout with ✅ icon',
    icon: '✅',
    html: '<div class="my-6 flex items-start gap-3 rounded-xl border-l-4 border-green-400 bg-green-50 p-4"><span class="shrink-0 text-lg">✅</span><div><p class="font-bold text-gray-900">Good to know</p><p class="mt-0.5 text-sm text-gray-600">Write your point here…</p></div></div>',
  },
  {
    id: 'warning-box',
    label: 'Warning Box',
    description: 'Yellow caution callout',
    icon: '⚠️',
    html: '<div class="my-6 flex items-start gap-3 rounded-xl border-l-4 border-yellow-400 bg-yellow-50 p-4"><span class="shrink-0 text-lg">⚠️</span><div><p class="font-bold text-gray-900">Important</p><p class="mt-0.5 text-sm text-gray-600">Write your warning here…</p></div></div>',
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Styled quote with author line',
    icon: '❝',
    html: '<blockquote class="my-6 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 py-3 pl-4 pr-4 italic text-gray-700">“A memorable quote goes here…”<cite class="mt-2 block text-sm font-semibold not-italic text-gray-500">— Author Name</cite></blockquote>',
  },
  {
    id: 'key-facts',
    label: 'Key Facts Checklist',
    description: 'Green box with bullet points',
    icon: '📋',
    html: '<div class="my-6 rounded-xl bg-green-50 p-5"><p class="mb-2 font-bold text-gray-900">📋 Key Facts</p><ul class="list-disc space-y-1 pl-5 text-sm text-gray-700"><li>First interesting fact…</li><li>Second interesting fact…</li><li>Third interesting fact…</li></ul></div>',
  },
  {
    id: 'cta-card',
    label: 'CTA Card',
    description: 'Call-to-action with button',
    icon: '📣',
    html: '<div class="my-8 rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 text-center"><h3 class="text-xl font-bold text-gray-900">Ready to explore Patna?</h3><p class="mt-1 text-sm text-gray-600">Add a short line describing the action you want the reader to take.</p><a href="#" class="mt-4 inline-block rounded-lg bg-amber-400 px-6 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-500">Call to Action →</a></div>',
  },
  {
    id: 'faq-item',
    label: 'FAQ Item',
    description: 'Question & answer card',
    icon: '❓',
    html: '<div class="my-6 rounded-xl border border-gray-200 p-5"><p class="font-bold text-gray-900">Q: Write the question here?</p><p class="mt-2 text-sm text-gray-600">A: Write the answer here…</p></div>',
  },
  {
    id: 'two-col-cards',
    label: 'Two-Column Cards',
    description: 'Two side-by-side highlight cards',
    icon: '◧',
    html: '<div class="my-8 grid grid-cols-2 gap-4"><div class="rounded-xl border border-gray-100 p-5 shadow-sm"><p class="text-lg font-bold text-gray-900">📌 Point one</p><p class="mt-1 text-sm text-gray-600">Short supporting text…</p></div><div class="rounded-xl border border-gray-100 p-5 shadow-sm"><p class="text-lg font-bold text-gray-900">📍 Point two</p><p class="mt-1 text-sm text-gray-600">Short supporting text…</p></div></div>',
  },
  {
    id: 'image-caption',
    label: 'Image with Caption',
    description: 'Rounded image + caption below',
    icon: '🖼️',
    html: '<figure class="my-8"><img src="https://placehold.co/1200x630?text=Replace+with+your+image" alt="Describe the image" class="w-full rounded-2xl shadow-md" loading="lazy" /><figcaption class="mt-2 text-center text-sm text-gray-500">Write an image caption here…</figcaption></figure>',
  },
  {
    id: 'comparison-table',
    label: 'Comparison Table',
    description: '3-column editable table',
    icon: '▦',
    html: '<figure class="table"><table><thead><tr><th>Item</th><th>Details</th><th>Price</th></tr></thead><tbody><tr><td>Row 1</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>Row 2</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table></figure>',
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal separator line',
    icon: '—',
    html: '<hr />',
  },
];

export interface ArticleTemplateDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  html: string;
}

export const ARTICLE_TEMPLATES: ArticleTemplateDef[] = [
  {
    id: 'standard-article',
    label: 'Standard Article',
    description: 'Intro → sections → quote → conclusion',
    icon: '📄',
    html: '<p>Write a short engaging introduction (2–3 sentences) that tells the reader what they will learn…</p><h2>First Section</h2><p>Main content of the first section…</p><h2>Second Section</h2><p>Main content of the second section…</p><blockquote class="my-6 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 py-3 pl-4 pr-4 italic text-gray-700">“A quote that sums up the story…”<cite class="mt-2 block text-sm font-semibold not-italic text-gray-500">— Author Name</cite></blockquote><h2>Conclusion</h2><p>Wrap up with a takeaway and invite readers to comment or visit…</p>',
  },
  {
    id: 'travel-guide',
    label: 'Travel Guide',
    description: 'Places, tips, timings & CTA',
    icon: '🧭',
    html: '<p>Set the scene — where is this place and why should anyone visit?</p><h2>Overview</h2><p>Quick facts about the destination…</p><div class="my-6 flex items-start gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4"><span class="shrink-0 text-lg">💡</span><div><p class="font-bold text-gray-900">Best Time to Visit</p><p class="mt-0.5 text-sm text-gray-600">Season, timing and entry fee details…</p></div></div><h2>How to Reach</h2><p>Directions, nearest station, parking info…</p><h2>Things to Do</h2><ul class="list-disc pl-5"><li>Activity one…</li><li>Activity two…</li></ul><div class="my-8 rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 text-center"><h3 class="text-xl font-bold text-gray-900">Plan your Patna trip now</h3><p class="mt-1 text-sm text-gray-600">Find hotels, food and more on Patna Finder.</p><a href="#" class="mt-4 inline-block rounded-lg bg-amber-400 px-6 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-500">Explore →</a></div>',
  },
  {
    id: 'food-review',
    label: 'Food Review',
    description: 'Dishes, ratings & verdict',
    icon: '🍽️',
    html: '<p>Introduce the restaurant/café and what you ordered…</p><h2>What We Ordered</h2><p>Dish-by-dish experience…</p><div class="my-6 rounded-xl bg-green-50 p-5"><p class="mb-2 font-bold text-gray-900">📋 Quick Facts</p><ul class="list-disc space-y-1 pl-5 text-sm text-gray-700"><li>Price for two: ₹…</li><li>Must try: …</li><li>Location: …</li></ul></div><h2>Verdict</h2><p>Final rating and recommendation…</p><blockquote class="my-6 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 py-3 pl-4 pr-4 italic text-gray-700">“One line that captures the taste…”<cite class="mt-2 block text-sm font-semibold not-italic text-gray-500">— Patna Finder Review</cite></blockquote>',
  },
  {
    id: 'news-update',
    label: 'News / Update',
    description: 'What happened → details → impact',
    icon: '📰',
    html: '<p>One-paragraph summary of the news — who, what, when, where.</p><h2>What Happened</h2><p>Detailed account of the announcement or event…</p><div class="my-6 flex items-start gap-3 rounded-xl border-l-4 border-yellow-400 bg-yellow-50 p-4"><span class="shrink-0 text-lg">⚠️</span><div><p class="font-bold text-gray-900">What It Means for You</p><p class="mt-0.5 text-sm text-gray-600">How this affects residents/visitors…</p></div></div><h2>Next Steps</h2><p>What happens next and where to follow updates…</p>',
  },
  {
    id: 'listicle',
    label: 'Listicle (Top 5)',
    description: 'Numbered picks with details',
    icon: '🔢',
    html: '<p>Hook the reader — what makes this list worth reading…</p><h2>1. First Pick</h2><p>Why it deserves the spot…</p><h2>2. Second Pick</h2><p>Why it made the list…</p><h2>3. Third Pick</h2><p>What makes it special…</p><h2>4. Fourth Pick</h2><p>Details here…</p><h2>5. Fifth Pick</h2><p>Details here…</p><div class="my-6 rounded-xl bg-green-50 p-5"><p class="mb-2 font-bold text-gray-900">📋 Quick Recap</p><ul class="list-disc space-y-1 pl-5 text-sm text-gray-700"><li>Best overall: …</li><li>Best budget: …</li></ul></div>',
  },
  {
    id: 'how-to-guide',
    label: 'How-To Guide',
    description: 'Steps, requirements & tips',
    icon: '🛠️',
    html: '<p>Explain what the reader will achieve by following this guide…</p><h2>What You Need</h2><ul class="list-disc pl-5"><li>Requirement one…</li><li>Requirement two…</li></ul><h2>Step 1: …</h2><p>Explain the step…</p><h2>Step 2: …</h2><p>Explain the step…</p><h2>Step 3: …</h2><p>Explain the step…</p><div class="my-6 flex items-start gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4"><span class="shrink-0 text-lg">💡</span><div><p class="font-bold text-gray-900">Pro Tip</p><p class="mt-0.5 text-sm text-gray-600">A shortcut or common mistake to avoid…</p></div></div><h2>Final Thoughts</h2><p>Encourage the reader and link to related resources…</p>',
  },
];

