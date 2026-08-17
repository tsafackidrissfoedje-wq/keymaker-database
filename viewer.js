/**
 * KeyMaker Pro - Static CHM Web Portal Controller
 * GitHub Pages Compatible & Fully Responsive
 */

(function () {
  'use strict';

  // State
  let activePage = 'second_topic.htm';
  let isSearching = false;
  let zoomLevel = 1.0;
  let rotationDeg = 0;

  // DOM Elements
  const DOM = {
    treeContainer: document.getElementById('tree-container'),
    searchResults: document.getElementById('search-results'),
    searchInput: document.getElementById('search-input'),
    searchClear: document.getElementById('search-clear'),
    pageIframe: document.getElementById('page-iframe'),
    breadcrumbCat: document.getElementById('bc-cat'),
    breadcrumbBrand: document.getElementById('bc-brand'),
    breadcrumbPage: document.getElementById('bc-page'),
    directLink: document.getElementById('direct-link'),
    sidebar: document.getElementById('sidebar'),
    menuToggle: document.getElementById('menu-toggle'),
    themeToggle: document.getElementById('theme-toggle'),
    lightbox: document.getElementById('image-lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxTitle: document.getElementById('lightbox-title'),
    btnExpandAll: document.getElementById('btn-expand-all'),
    btnCollapseAll: document.getElementById('btn-collapse-all'),
    btnHome: document.getElementById('btn-home')
  };

  // Map file -> { path: [cat, brand, name], title, chips, transponders, images }
  const pageLookup = {};

  // Initialize
  function init() {
    buildPageLookup();
    renderTree();
    setupEvents();
    setupRouting();
  }

  // Build reverse lookup from tree
  function buildPageLookup() {
    if (!window.KEYMAKER_TREE) return;

    window.KEYMAKER_TREE.forEach(cat => {
      cat.children.forEach(brand => {
        if (brand.local) {
          // Direct item under category
          pageLookup[brand.local.toLowerCase()] = {
            cat: cat.name,
            brand: '',
            name: brand.name,
            file: brand.local
          };
        }
        if (brand.children) {
          brand.children.forEach(item => {
            if (item.local) {
              pageLookup[item.local.toLowerCase()] = {
                cat: cat.name,
                brand: brand.name,
                name: item.name,
                file: item.local
              };
            }
          });
        }
      });
    });
  }

  // Category Icon Resolver
  function getCategoryIcon(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('asia')) return '⛩️';
    if (n.includes('europe')) return '🏰';
    if (n.includes('usa')) return '🦅';
    if (n.includes('interbrand')) return '🔄';
    if (n.includes('appendix')) return '📚';
    if (n.includes('intro')) return '📖';
    return '📁';
  }

  // Render Sidebar Tree
  function renderTree() {
    if (!window.KEYMAKER_TREE || !DOM.treeContainer) return;

    let html = '';
    window.KEYMAKER_TREE.forEach((cat, catIdx) => {
      const catIcon = getCategoryIcon(cat.name);
      let count = 0;
      cat.children.forEach(b => {
        count += (b.children && b.children.length > 0) ? b.children.length : 1;
      });

      html += `
        <div class="tree-cat ${catIdx === 0 ? 'open' : ''}" data-cat-id="${catIdx}">
          <div class="tree-cat-header" onclick="window.KeyMaker.toggleCategory(${catIdx})">
            <span class="tree-cat-icon">${catIcon}</span>
            <span class="tree-cat-title">${escapeHtml(cat.name)}</span>
            <span class="tree-cat-count">${count}</span>
            <svg class="tree-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="tree-cat-body">
      `;

      cat.children.forEach((brand, brandIdx) => {
        if (brand.children && brand.children.length > 0) {
          html += `
            <div class="tree-brand" data-brand-id="${catIdx}_${brandIdx}">
              <div class="tree-brand-header" onclick="window.KeyMaker.toggleBrand('${catIdx}_${brandIdx}')">
                <svg class="tree-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <span class="tree-brand-title">${escapeHtml(brand.name)}</span>
                <span class="tree-brand-count">${brand.children.length}</span>
              </div>
              <div class="tree-brand-body">
          `;

          brand.children.forEach(item => {
            const pageData = window.KEYMAKER_PAGES ? window.KEYMAKER_PAGES[item.local] : null;
            const chipBadge = pageData && pageData.chips && pageData.chips[0] 
              ? `<span class="tree-item-chip">${escapeHtml(pageData.chips[0])}</span>` : '';

            html += `
              <a class="tree-item" data-file="${escapeHtml(item.local)}" onclick="window.KeyMaker.loadPage('${escapeHtml(item.local)}')">
                <span class="tree-item-icon">📄</span>
                <span class="tree-item-title">${escapeHtml(item.name)}</span>
                ${chipBadge}
              </a>
            `;
          });

          html += `
              </div>
            </div>
          `;
        } else if (brand.local) {
          html += `
            <a class="tree-item" data-file="${escapeHtml(brand.local)}" onclick="window.KeyMaker.loadPage('${escapeHtml(brand.local)}')">
              <span class="tree-item-icon">📄</span>
              <span class="tree-item-title">${escapeHtml(brand.name)}</span>
            </a>
          `;
        }
      });

      html += `
          </div>
        </div>
      `;
    });

    DOM.treeContainer.innerHTML = html;
  }

  // Load Page into Iframe
  function loadPage(filename, updateHash = true) {
    if (!filename) return;
    activePage = filename;

    // Set Iframe Source
    if (DOM.pageIframe) {
      DOM.pageIframe.src = filename;
    }

    // Update Direct Link
    if (DOM.directLink) {
      DOM.directLink.href = filename;
    }

    // Update Breadcrumbs
    updateBreadcrumbs(filename);

    // Highlight active in tree & search
    highlightActiveInTree(filename);

    // Update URL hash
    if (updateHash) {
      window.location.hash = filename;
    }

    // Close mobile sidebar
    if (window.innerWidth <= 768 && DOM.sidebar) {
      DOM.sidebar.classList.remove('open');
    }
  }

  // Update Breadcrumbs
  function updateBreadcrumbs(filename) {
    const meta = pageLookup[filename.toLowerCase()];
    const pageMeta = window.KEYMAKER_PAGES ? window.KEYMAKER_PAGES[filename] : null;
    const title = (pageMeta && pageMeta.title) || (meta && meta.name) || filename;

    if (DOM.breadcrumbCat) {
      DOM.breadcrumbCat.textContent = meta ? meta.cat : 'Accueil';
    }
    if (DOM.breadcrumbBrand) {
      if (meta && meta.brand) {
        DOM.breadcrumbBrand.style.display = 'inline';
        DOM.breadcrumbBrand.textContent = meta.brand;
      } else {
        DOM.breadcrumbBrand.style.display = 'none';
      }
    }
    if (DOM.breadcrumbPage) {
      DOM.breadcrumbPage.textContent = title;
    }
  }

  // Highlight item in tree and auto-expand its accordion parents
  function highlightActiveInTree(filename) {
    document.querySelectorAll('.tree-item').forEach(el => {
      if (el.getAttribute('data-file') === filename) {
        el.classList.add('active');

        // Open parent brand
        const parentBrand = el.closest('.tree-brand');
        if (parentBrand) {
          parentBrand.classList.add('open');
        }

        // Open parent category
        const parentCat = el.closest('.tree-cat');
        if (parentCat) {
          parentCat.classList.add('open');
        }

        // Scroll into view if needed
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        el.classList.remove('active');
      }
    });

    // Also highlight in search results
    document.querySelectorAll('.search-result-item').forEach(el => {
      if (el.getAttribute('data-file') === filename) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // Toggle Category Accordion
  function toggleCategory(catIdx) {
    const el = document.querySelector(`.tree-cat[data-cat-id="${catIdx}"]`);
    if (el) {
      el.classList.toggle('open');
    }
  }

  // Toggle Brand Accordion
  function toggleBrand(brandId) {
    const el = document.querySelector(`.tree-brand[data-brand-id="${brandId}"]`);
    if (el) {
      el.classList.toggle('open');
    }
  }

  // Expand / Collapse All
  function expandAll() {
    document.querySelectorAll('.tree-cat, .tree-brand').forEach(el => el.classList.add('open'));
  }

  function collapseAll() {
    document.querySelectorAll('.tree-cat, .tree-brand').forEach(el => el.classList.remove('open'));
  }

  // Live Search
  function handleSearch(query) {
    const q = (query || '').trim().toLowerCase();

    if (!q) {
      isSearching = false;
      DOM.treeContainer.style.display = 'block';
      DOM.searchResults.style.display = 'none';
      DOM.searchClear.style.display = 'none';
      return;
    }

    isSearching = true;
    DOM.treeContainer.style.display = 'none';
    DOM.searchResults.style.display = 'block';
    DOM.searchClear.style.display = 'block';

    const pages = window.KEYMAKER_PAGES || {};
    const results = [];

    for (const [file, data] of Object.entries(pages)) {
      if (data.search_text && data.search_text.includes(q)) {
        results.push(data);
      }
    }

    if (results.length === 0) {
      DOM.searchResults.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 6px;">🔍 Aucun résultat</p>
          <p style="font-size: 0.8rem;">Aucune fiche ne correspond à "${escapeHtml(query)}"</p>
        </div>
      `;
      return;
    }

    let html = `<div style="padding: 6px 4px; font-size: 0.78rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase;">${results.length} résultats trouvés</div>`;
    results.forEach(res => {
      const meta = pageLookup[res.file.toLowerCase()];
      const brandBadge = meta && meta.brand ? `<span style="background:var(--bg-card-active); color:#fff; padding:1px 6px; border-radius:4px; font-size:0.7rem;">${escapeHtml(meta.brand)}</span>` : '';
      const chipsBadge = res.chips.map(c => `<span style="background:rgba(56,189,248,0.15); color:var(--accent-cyan); padding:1px 5px; border-radius:4px; font-size:0.68rem;">${escapeHtml(c)}</span>`).join(' ');
      const tpBadge = res.transponders.map(t => `<span style="background:rgba(16,185,129,0.15); color:var(--accent-green); padding:1px 5px; border-radius:4px; font-size:0.68rem;">${escapeHtml(t)}</span>`).join(' ');

      html += `
        <div class="search-result-item ${res.file === activePage ? 'active' : ''}" data-file="${escapeHtml(res.file)}" onclick="window.KeyMaker.loadPage('${escapeHtml(res.file)}')">
          <div class="search-result-title">${escapeHtml(res.title)}</div>
          <div class="search-result-meta">
            ${brandBadge}
            ${chipsBadge}
            ${tpBadge}
          </div>
        </div>
      `;
    });

    DOM.searchResults.innerHTML = html;
  }

  // Setup Event Listeners
  function setupEvents() {
    // Search Input
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Search Clear
    if (DOM.searchClear) {
      DOM.searchClear.addEventListener('click', () => {
        DOM.searchInput.value = '';
        handleSearch('');
        DOM.searchInput.focus();
      });
    }

    // Expand / Collapse
    if (DOM.btnExpandAll) DOM.btnExpandAll.addEventListener('click', expandAll);
    if (DOM.btnCollapseAll) DOM.btnCollapseAll.addEventListener('click', collapseAll);
    if (DOM.btnHome) DOM.btnHome.addEventListener('click', () => loadPage('second_topic.htm'));

    // Mobile Menu Toggle
    if (DOM.menuToggle && DOM.sidebar) {
      DOM.menuToggle.addEventListener('click', () => {
        DOM.sidebar.classList.toggle('open');
      });
    }

    // Theme Toggle
    if (DOM.themeToggle) {
      DOM.themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
        DOM.themeToggle.textContent = isLight ? '🌙' : '☀️';
      });
    }

    // Global Keyboards
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== DOM.searchInput) {
        e.preventDefault();
        DOM.searchInput.focus();
      } else if (e.key === 'Escape') {
        closeLightbox();
        if (DOM.searchInput && document.activeElement === DOM.searchInput) {
          DOM.searchInput.value = '';
          handleSearch('');
          DOM.searchInput.blur();
        }
      }
    });

    // Iframe Load Enhancement
    if (DOM.pageIframe) {
      DOM.pageIframe.addEventListener('load', onIframeLoaded);
    }
  }

  // Injects styling and image click handlers into the loaded iframe
  function onIframeLoaded() {
    try {
      const doc = DOM.pageIframe.contentDocument || DOM.pageIframe.contentWindow.document;
      if (!doc) return;

      // Inject custom styling inside iframe
      const styleEl = doc.createElement('style');
      styleEl.textContent = `
        body {
          padding: 24px 28px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          background: #ffffff !important;
          color: #0f172a !important;
          line-height: 1.6 !important;
        }
        img {
          max-width: 100% !important;
          height: auto !important;
          cursor: zoom-in !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
          transition: transform 0.2s ease !important;
          margin: 8px 0 !important;
        }
        img:hover {
          transform: scale(1.015) !important;
        }
        table {
          max-width: 100% !important;
        }
        a {
          color: #0284c7 !important;
          font-weight: 600 !important;
          text-decoration: underline !important;
        }
      `;
      doc.head.appendChild(styleEl);

      // Attach Lightbox click on all images in iframe
      doc.querySelectorAll('img').forEach(img => {
        img.title = "Cliquez pour agrandir en HD";
        img.addEventListener('click', (e) => {
          e.preventDefault();
          const src = img.getAttribute('src');
          const alt = img.getAttribute('alt') || 'Schéma Électronique';
          openLightbox(src, alt);
        });
      });

      // Intercept internal link clicks in iframe
      doc.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.endsWith('.htm') && !href.startsWith('http')) {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage(href);
          });
        }
      });
    } catch (e) {
      // Cross-origin fallback (when hosted on different domain)
      console.warn('Iframe style injection notice:', e);
    }
  }

  // Setup Hash Routing
  function setupRouting() {
    function handleHash() {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && hash.endsWith('.htm')) {
        loadPage(hash, false);
      } else {
        loadPage('second_topic.htm', false);
      }
    }

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  // Lightbox Functions
  function openLightbox(src, title) {
    if (!DOM.lightbox || !DOM.lightboxImg) return;
    zoomLevel = 1.0;
    rotationDeg = 0;
    DOM.lightboxImg.src = src;
    DOM.lightboxImg.style.transform = `scale(${zoomLevel}) rotate(${rotationDeg}deg)`;
    if (DOM.lightboxTitle) DOM.lightboxTitle.textContent = title || 'Schéma Électronique';
    DOM.lightbox.classList.add('active');
  }

  function closeLightbox() {
    if (DOM.lightbox) {
      DOM.lightbox.classList.remove('active');
    }
  }

  function zoomImage(factor) {
    zoomLevel = Math.max(0.4, Math.min(4.0, zoomLevel * factor));
    if (DOM.lightboxImg) {
      DOM.lightboxImg.style.transform = `scale(${zoomLevel}) rotate(${rotationDeg}deg)`;
    }
  }

  function rotateImage() {
    rotationDeg = (rotationDeg + 90) % 360;
    if (DOM.lightboxImg) {
      DOM.lightboxImg.style.transform = `scale(${zoomLevel}) rotate(${rotationDeg}deg)`;
    }
  }

  function resetZoom() {
    zoomLevel = 1.0;
    rotationDeg = 0;
    if (DOM.lightboxImg) {
      DOM.lightboxImg.style.transform = `scale(1) rotate(0deg)`;
    }
  }

  // Helpers
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Export to Global Scope
  window.KeyMaker = {
    loadPage,
    toggleCategory,
    toggleBrand,
    openLightbox,
    closeLightbox,
    zoomImage,
    rotateImage,
    resetZoom
  };

  // Launch
  document.addEventListener('DOMContentLoaded', init);
})();
