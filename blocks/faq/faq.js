import { createTag } from '../../scripts/shared.js';
import { extendSchema } from '../../scripts/schema.js';

const FAQ_INDEX_PATH = '/faq-index.json';

async function fetchFaqs() {
  const resp = await fetch(FAQ_INDEX_PATH);
  if (!resp.ok) return [];
  const json = await resp.json();
  return json?.data || [];
}

function toggleItem(button) {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  const panel = button.nextElementSibling;
  panel.hidden = expanded;
}

function buildFaqItem(faq) {
  const item = createTag('div', { class: 'faq-item' });

  const button = createTag('button', {
    class: 'faq-question',
    'aria-expanded': 'false',
    type: 'button',
  }, faq.question);

  const panel = createTag('div', {
    class: 'faq-answer',
    role: 'region',
    hidden: true,
  });
  if (faq.answerNodes) panel.append(...faq.answerNodes);
  else panel.append(createTag('p', {}, faq.answer));

  button.addEventListener('click', () => toggleItem(button));

  item.append(button, panel);
  return item;
}

function buildCategoryGroup(category, faqs) {
  const group = createTag('div', { class: 'faq-category' });
  group.append(createTag('h3', { class: 'faq-category-heading' }, category));
  faqs.forEach((faq) => group.append(buildFaqItem(faq)));
  return group;
}

function addSchema(faqs) {
  extendSchema('WebPage', {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  });
}

/**
 * Authored mode: each row is a question cell and an answer cell.
 * @param {Element[]} rows
 */
function decorateAuthored(block, rows) {
  const faqs = rows.map((row) => {
    const [q, a] = row.children;
    return {
      question: q.textContent.trim(),
      answer: a.textContent.trim(),
      answerNodes: [...a.childNodes],
    };
  }).filter((faq) => faq.question);
  block.textContent = '';
  faqs.forEach((faq) => block.append(buildFaqItem(faq)));
  addSchema(faqs);
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length && rows.every((row) => row.children.length >= 2)) {
    decorateAuthored(block, rows);
    return;
  }

  const categories = [...block.children].map(
    (row) => row.textContent.trim(),
  ).filter(Boolean);

  block.textContent = '';

  const allFaqs = await fetchFaqs();
  if (!allFaqs.length) {
    block.append(createTag('p', { class: 'faq-empty' }, 'No FAQs available.'));
    return;
  }

  const filtered = categories.length
    ? allFaqs.filter((faq) => categories.includes(faq.category))
    : allFaqs;

  if (!filtered.length) {
    block.append(createTag('p', { class: 'faq-empty' }, 'No FAQs found for the selected categories.'));
    return;
  }

  const grouped = {};
  filtered.forEach((faq) => {
    if (!grouped[faq.category]) grouped[faq.category] = [];
    grouped[faq.category].push(faq);
  });

  Object.keys(grouped).forEach((category) => {
    block.append(buildCategoryGroup(category, grouped[category]));
  });

  addSchema(filtered);
}
