/**
 * quotes: a board of instrument tiles grouped by heading.
 * Row with one cell = group heading (may be a link), or a group intro when the
 * cell holds a heading plus copy and links.
 * Row with five cells = tile: code | name (may be a link) | last | volume | change.
 * The sign of the change (+/-) colors the tile; UNCH or "-" leaves it neutral.
 * Variant `list` lays each group out as intro beside a stacked list of tiles.
 * @param {Element} block
 */
export default function decorate(block) {
  const board = document.createElement('div');
  board.className = 'quotes-board';
  let group;
  let list;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 1) {
      group = document.createElement('section');
      group.className = 'quotes-group';
      if (cells[0].querySelector('h2, h3, h4, h5, h6')) {
        const intro = document.createElement('div');
        intro.className = 'quotes-intro';
        intro.append(...cells[0].childNodes);
        intro.querySelectorAll('a.button').forEach((a) => a.classList.remove('button'));
        list = document.createElement('ul');
        group.classList.add('quotes-group-intro');
        group.append(intro, list);
        board.append(group);
        return;
      }
      const heading = document.createElement('h3');
      heading.className = 'quotes-heading';
      heading.append(...cells[0].childNodes);
      heading.querySelectorAll('p').forEach((p) => p.replaceWith(...p.childNodes));
      heading.querySelectorAll('a').forEach((a) => a.classList.remove('button'));
      list = document.createElement('ul');
      group.append(heading, list);
      board.append(group);
      return;
    }
    if (!list) {
      group = document.createElement('section');
      group.className = 'quotes-group';
      list = document.createElement('ul');
      group.append(list);
      board.append(group);
    }
    const [code, name, last, volume, change] = cells.map((c) => c.textContent.trim());
    const link = cells[1]?.querySelector('a');
    const li = document.createElement('li');
    const sign = change?.trim().charAt(0);
    let move = sign === '-' ? 'quotes-down' : 'quotes-up';
    if (!change || /^(unch|-)$/i.test(change)) move = 'quotes-flat';
    li.className = `quotes-tile ${move}`;
    const title = document.createElement(link ? 'a' : 'span');
    if (link) title.href = link.href;
    title.className = 'quotes-name';
    title.textContent = name;
    li.innerHTML = `<span class="quotes-code"></span>
      <span class="quotes-last"></span><span class="quotes-volume"></span><span class="quotes-change"></span>`;
    li.querySelector('.quotes-code').textContent = code;
    li.querySelector('.quotes-code').after(title);
    li.querySelector('.quotes-last').textContent = last;
    li.querySelector('.quotes-volume').textContent = volume;
    li.querySelector('.quotes-change').textContent = change;
    list.append(li);
  });

  board.querySelectorAll('.quotes-group').forEach((g) => {
    if (g.querySelectorAll('.quotes-tile').length > 6) g.classList.add('quotes-group-wide');
  });
  block.replaceChildren(board);
}
