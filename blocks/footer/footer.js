import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer-layout: legal
 * Section 1: link groups (heading + list), section 2: social icons + language,
 * section 3: legal band (disclaimer, copyright, legal links).
 * @param {Element} block
 */
function decorateLegal(block) {
  block.classList.add('footer-legal');
  const [links, social, legal] = block.querySelectorAll('.section');
  links?.classList.add('footer-links');
  social?.classList.add('footer-social');
  legal?.classList.add('footer-band');

  const wrapper = links?.querySelector('.default-content-wrapper');
  if (wrapper) {
    let group;
    [...wrapper.children].forEach((el) => {
      if (/^H[2-6]$/.test(el.tagName) || !group) {
        group = document.createElement('div');
        group.className = 'footer-group';
        wrapper.append(group);
      }
      group.append(el);
    });
  }
  social?.querySelectorAll('a').forEach((a) => {
    const icon = a.querySelector('.icon');
    if (icon && !a.getAttribute('aria-label')) {
      const name = [...icon.classList].find((c) => c.startsWith('icon-'))?.slice(5) || '';
      a.setAttribute('aria-label', name.replace(/-/g, ' '));
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment (skip if aem-embed already provided content)
  if (block.textContent === '') {
    const footerMeta = getMetadata('footer');
    const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
    const fragment = await loadFragment(footerPath);

    block.textContent = '';
    const footer = document.createElement('div');
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
    block.append(footer);
  }

  if (getMetadata('footer-layout') === 'legal') {
    decorateLegal(block);
    return;
  }

  // merge social icons into copyright row
  const sections = block.querySelectorAll('.section');
  if (sections.length >= 4) {
    const copyrightSection = sections[2];
    const socialSection = sections[3];
    const socialUl = socialSection.querySelector('ul');
    const copyrightWrapper = copyrightSection.querySelector('.default-content-wrapper');
    if (socialUl && copyrightWrapper) {
      const pipe = document.createElement('span');
      pipe.className = 'footer-separator';
      pipe.textContent = '|';
      copyrightWrapper.append(pipe, socialUl);
      socialSection.remove();
    }
  }
}
