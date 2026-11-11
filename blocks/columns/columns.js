export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  decorateVariants(block);
}

/**
 * columns feature: a column holding a picture or a stats list (item text + bold value)
 * becomes a dark panel. Inside a panel each heading starts a card; a card's picture
 * becomes its background.
 * @param {Element} block
 */
function decorateFeature(block) {
  block.querySelectorAll(':scope > div > div').forEach((col) => {
    // a plain column with several sub-headings becomes a grid of items
    const subheads = col.querySelectorAll(':scope > h4');
    if (subheads.length > 1 && !col.querySelector('picture')) {
      col.classList.add('columns-grid');
      let item;
      [...col.children].forEach((el) => {
        if (el.tagName === 'H4' || !item) {
          item = document.createElement('div');
          item.className = 'columns-item';
          col.append(item);
        }
        item.append(el);
      });
      return;
    }
    const stats = [...col.querySelectorAll(':scope > ul > li')].filter((li) => li.querySelector('strong'));
    if (!col.querySelector('picture') && !stats.length) return;
    col.classList.add('columns-panel');
    col.classList.remove('columns-img-col');
    stats.forEach((li) => li.classList.add('columns-stat'));

    const cards = [];
    let card;
    [...col.children].forEach((el) => {
      const isHeading = /^H[1-6]$/.test(el.tagName);
      if (!card || (isHeading && card.querySelector('h1, h2, h3, h4, h5, h6'))) {
        card = document.createElement('div');
        card.className = 'columns-card';
        cards.push(card);
      }
      card.append(el);
    });
    cards.forEach((c) => {
      const pic = c.querySelector('picture');
      if (pic) {
        c.classList.add('columns-card-media');
        (pic.closest('p') || pic).classList.add('columns-card-bg');
      }
      const link = c.querySelector(':is(h1, h2, h3, h4, h5, h6) a');
      if (link) c.classList.add('columns-card-link');
    });
    col.append(...cards);
  });
}

function decorateVariants(block) {
  if (block.classList.contains('feature')) decorateFeature(block);
}
