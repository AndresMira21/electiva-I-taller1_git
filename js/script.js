// js/script.js
(function(){
  // Datos de ejemplo (reemplazar por fetch a API o /data/products.json en producción)
  const SAMPLE_PRODUCTS = [
    {"id":1,"title":"Smartphone X200","price":1299.00,"category":"Celulares","brand":"BrandA","image":"https://via.placeholder.com/160x160?text=X200"},
    {"id":2,"title":"Auriculares Wireless Pro","price":199.99,"category":"Audio","brand":"BrandB","image":"https://via.placeholder.com/160x160?text=Headphones"},
    {"id":3,"title":"Smart TV 55 4K","price":899.00,"category":"Televisores","brand":"BrandC","image":"https://via.placeholder.com/160x160?text=TV55"},
    {"id":4,"title":"Laptop Ultraligera 14","price":1499.00,"category":"Computación","brand":"BrandD","image":"https://via.placeholder.com/160x160?text=Laptop14"},
    {"id":5,"title":"Cámara Mirrorless Z","price":799.00,"category":"Cámaras","brand":"BrandE","image":"https://via.placeholder.com/160x160?text=Camera"},
    {"id":6,"title":"Smartwatch Series 6","price":299.00,"category":"Wearables","brand":"BrandA","image":"https://via.placeholder.com/160x160?text=Watch"},
    {"id":7,"title":"Parlante Bluetooth Mini","price":49.99,"category":"Audio","brand":"BrandF","image":"https://via.placeholder.com/160x160?text=Speaker"},
    {"id":8,"title":"Teclado Mecánico RGB","price":129.00,"category":"Computación","brand":"BrandG","image":"https://via.placeholder.com/160x160?text=Keyboard"},
    {"id":9,"title":"Monitor 27 QHD","price":329.00,"category":"Computación","brand":"BrandH","image":"https://via.placeholder.com/160x160?text=Monitor"},
    {"id":10,"title":"Cargador Rápido 65W","price":39.99,"category":"Accesorios","brand":"BrandI","image":"https://via.placeholder.com/160x160?text=Charger"}
  ];

  // Elementos DOM
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const suggestionsEl = document.getElementById('search-suggestions');
  const resultsEl = document.getElementById('search-results');
  const paginationEl = document.getElementById('search-pagination');

  // Estado
  let products = SAMPLE_PRODUCTS.slice();
  let filtered = [];
  let page = 1;
  const PAGE_SIZE = 6;
  let suggestionIndex = -1;

  // Utilidades
  function debounce(fn, wait){
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(()=> fn.apply(this, args), wait);
    };
  }
  function norm(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Búsqueda
  function searchProducts(q){
    const qn = norm(q);
    if(!qn) return [];
    return products.filter(p => {
      return norm(p.title).includes(qn) || norm(p.brand).includes(qn) || norm(p.category).includes(qn);
    });
  }

  // Render sugerencias
  function renderSuggestions(list, q){
    suggestionsEl.innerHTML = '';
    suggestionIndex = -1;
    if(!list.length){ suggestionsEl.hidden = true; input.setAttribute('aria-expanded','false'); return; }
    list.slice(0,6).forEach((p, i) => {
      const li = document.createElement('li');
      li.setAttribute('role','option');
      li.id = `sugg-${p.id}`;
      li.dataset.index = i;
      li.innerHTML = highlight(p.title, q) + `<span class="muted"> — ${escapeHtml(p.brand)}</span>`;
      li.addEventListener('click', ()=> {
        input.value = p.title;
        doSearch();
        suggestionsEl.hidden = true;
        input.setAttribute('aria-expanded','false');
      });
      suggestionsEl.appendChild(li);
    });
    suggestionsEl.hidden = false;
    input.setAttribute('aria-expanded','true');
  }

  function highlight(text, q){
    if(!q) return escapeHtml(text);
    const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
    return escapeHtml(text).replace(re, '<strong class="match">$1</strong>');
  }

  // Render resultados y paginación
  function renderResults(list){
    resultsEl.innerHTML = '';
    if(!list.length){
      resultsEl.innerHTML = '<div class="no-results">No se encontraron productos.</div>';
      paginationEl.hidden = true;
      return;
    }
    const start = (page-1)*PAGE_SIZE;
    const pageItems = list.slice(start, start + PAGE_SIZE);
    pageItems.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.image}" alt="${escapeHtml(p.title)}">
        <div class="meta">
          <h3>${escapeHtml(p.title)}</h3>
          <p class="muted">${escapeHtml(p.brand)} • ${escapeHtml(p.category)}</p>
          <p class="price">$${p.price.toFixed(2)}</p>
        </div>
      `;
      resultsEl.appendChild(card);
    });
    renderPagination(list.length);
  }

  function renderPagination(total){
    const pages = Math.ceil(total / PAGE_SIZE);
    paginationEl.innerHTML = '';
    if(pages <= 1){ paginationEl.hidden = true; return; }
    for(let i=1;i<=pages;i++){
      const b = document.createElement('button');
      b.textContent = i;
      b.disabled = (i === page);
      b.addEventListener('click', ()=> { page = i; renderResults(filtered); });
      paginationEl.appendChild(b);
    }
    paginationEl.hidden = false;
  }

  // Ejecutar búsqueda
  function doSearch(){
    const q = input.value.trim();
    filtered = q ? searchProducts(q) : [];
    page = 1;
    renderResults(filtered);
    suggestionsEl.hidden = true;
    input.setAttribute('aria-expanded','false');
  }

  // Navegación por sugerencias con teclado
  function onKeyDown(e){
    if(suggestionsEl.hidden) return;
    const items = Array.from(suggestionsEl.querySelectorAll('li'));
    if(!items.length) return;
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      suggestionIndex = Math.min(suggestionIndex + 1, items.length - 1);
      updateSuggestionSelection(items);
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      suggestionIndex = Math.max(suggestionIndex - 1, 0);
      updateSuggestionSelection(items);
    } else if(e.key === 'Enter'){
      e.preventDefault();
      if(suggestionIndex >= 0){
        items[suggestionIndex].click();
      } else {
        doSearch();
      }
    } else if(e.key === 'Escape'){
      suggestionsEl.hidden = true;
      input.setAttribute('aria-expanded','false');
    }
  }

  function updateSuggestionSelection(items){
    items.forEach((it, idx) => {
      const sel = idx === suggestionIndex;
      it.setAttribute('aria-selected', sel ? 'true' : 'false');
      if(sel) it.scrollIntoView({block:'nearest'});
    });
  }

  const onInput = debounce((e) => {
    const q = e.target.value.trim();
    if(!q){ suggestionsEl.hidden = true; input.setAttribute('aria-expanded','false'); return; }
    const matches = searchProducts(q);
    renderSuggestions(matches, q);
  }, 180);

  function init(){
    if(!input || !btn || !suggestionsEl || !resultsEl || !paginationEl) return;
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onKeyDown);
    btn.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e)=> { if(e.key === 'Enter') doSearch(); });
    renderResults([]); // estado inicial vacío
  }

  init();

  // Conectar buscador global (header) con el componente
  const globalInput = document.getElementById('global-search');
  const globalBtn = document.getElementById('global-search-btn');
  if(globalInput && globalBtn){
    globalBtn.addEventListener('click', () => {
      const q = globalInput.value.trim();
      if(!q) return;
      input.value = q;
      doSearch();
      document.getElementById('product-search').scrollIntoView({behavior:'smooth'});
    });
    globalInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter'){
        globalBtn.click();
      }
    });
  }
})();
