/**
 * quotes: a board of instrument tiles grouped by heading.
 * Row with one cell = group heading (may be a link).
 * Row with five cells = tile: code | name (may be a link) | last | volume | change.
 * The sign of the change (+/-) colors the tile.
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
    li.className = `quotes-tile ${sign === '-' ? 'quotes-down' : 'quotes-up'}`;
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
