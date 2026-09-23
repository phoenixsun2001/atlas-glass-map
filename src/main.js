import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createIcons, Layers2, ChevronDown, Search, Scan, Sun, MapPin, ArrowUpRight, MousePointer2, Route, CircleDot, SlidersHorizontal, Sparkles, Blend, Navigation2, Plus, Minus, LocateFixed, Ruler, Download, Compass, Landmark, RadioTower, Trees, Coffee, Building2, Palette, Bookmark } from 'lucide';
import './style.css';
import './liquid-glass.css';
import { initGlassInteractions } from './glass';
import { basemaps, defaultBasemap, basemapAttribution } from './basemaps';
const icons = { Layers2, ChevronDown, Search, Scan, Sun, MapPin, ArrowUpRight, MousePointer2, Route, CircleDot, SlidersHorizontal, Sparkles, Blend, Navigation2, Plus, Minus, LocateFixed, Ruler, Download, Compass, Landmark, RadioTower, Trees, Coffee, Building2, Palette, Bookmark };

const icon = (name, cls = '') => `<i data-lucide="${name}" class="${cls}"></i>`;
const places = [
  { id: 'bund', name: '外滩', en: 'THE BUND', type: 'landmark', category: '城市地标', lat: 31.2400, lng: 121.4905, icon: 'landmark', desc: '沿着黄浦江，读一读这座城市的过去与现在。', address: '黄浦区 · 中山东一路', tags: ['滨江漫步', '历史建筑'], color: 'green' },
  { id: 'pearl', name: '东方明珠', en: 'ORIENTAL PEARL', type: 'landmark', category: '城市地标', lat: 31.2397, lng: 121.4998, icon: 'radio-tower', desc: '从城市天际线的标志处，发现上海的另一种视角。', address: '浦东新区 · 世纪大道 1 号', tags: ['城市天际线', '观景'], color: 'green' },
  { id: 'garden', name: '豫园', en: 'YU GARDEN', type: 'park', category: '公园绿地', lat: 31.2272, lng: 121.4921, icon: 'trees', desc: '穿过曲桥与庭院，在城市中心遇见一片江南。', address: '黄浦区 · 福佑路', tags: ['古典园林', '慢游'], color: 'green' },
  { id: 'coffee', name: '圆明园路咖啡街区', en: 'COFFEE & CITY', type: 'coffee', category: '咖啡与生活', lat: 31.2432, lng: 121.4868, icon: 'coffee', desc: '找一个临街的位置，让城市的日常慢一点经过。', address: '黄浦区 · 圆明园路', tags: ['街区探索', '咖啡'], color: 'orange' },
  { id: 'park', name: '人民公园', en: 'PEOPLE’S PARK', type: 'park', category: '公园绿地', lat: 31.2345, lng: 121.4716, icon: 'trees', desc: '树荫、步道与微风，一处适合短暂停留的城市绿洲。', address: '黄浦区 · 南京西路', tags: ['城市绿洲', '步行'], color: 'green' },
  { id: 'museum', name: '上海博物馆', en: 'SHANGHAI MUSEUM', type: 'culture', category: '艺术与文化', lat: 31.2303, lng: 121.4755, icon: 'building-2', desc: '从一件器物开始，开启一场跨越时间的旅行。', address: '黄浦区 · 人民大道 201 号', tags: ['艺术', '人文'], color: 'purple' },
  { id: 'art', name: '浦东美术馆', en: 'MUSEUM OF ART PUDONG', type: 'culture', category: '艺术与文化', lat: 31.2376, lng: 121.4966, icon: 'palette', desc: '在江岸的光与影之间，与艺术相遇。', address: '浦东新区 · 滨江大道 2777 号', tags: ['当代艺术', '滨江'], color: 'purple' },
];
let saved;
try { saved = new Set(JSON.parse(localStorage.getItem('atlas-saved') || '[]')); } catch { saved = new Set(); }
let category = 'all', savedOnly = false, activePlace = places[0], measuring = false, measurePoints = [];
let popup, routeLine, measureLine;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelector('#app').innerHTML = `
  <div id="map" aria-label="上海交互地图"></div>
  <header class="topbar">
    <div class="header-brand glass liquid-control">
    <a class="brand" href="/" aria-label="浮屿 Atlas 首页"><span class="brand-icon">${icon('layers-2')}</span><span>浮屿<span class="brand-en">ATLAS</span></span></a>
    <span class="header-divider"></span>
    <button class="city-button" id="city">上海 ${icon('chevron-down')}</button>
    </div>
    <div class="search-wrap glass liquid-control"><label class="searchbox" for="search">${icon('search')}<input id="search" aria-label="搜索精选地点" autocomplete="off" placeholder="搜索地点，发现城市的另一面" /><kbd>⌘ K</kbd></label><div id="search-results" class="glass" hidden></div></div>
    <div class="header-actions glass liquid-control">
    <nav aria-label="主导航"><button class="nav-button active" id="explore">探索地图</button><button class="nav-button" id="collections">我的收藏 <span id="saved-count">0</span></button></nav>
    <button class="icon-button" id="focus" title="专注模式" aria-label="切换专注模式">${icon('scan')}</button>
    <span class="avatar" title="本地演示工作台">S</span>
    </div>
  </header>
  <aside class="left-stack" aria-label="城市探索面板">
    <section class="glass overview">
      <div class="eyebrow"><span class="live-dot"></span> CITY EXPLORER <span class="demo-label">概念演示</span></div>
      <div class="city-title"><div><h1>你好，上海<span>。</span></h1><p>在熟悉的城市，发现新的风景。</p></div><span class="sun-art">${icon('sun')}</span></div>
      <div class="overview-stats"><div><strong>07<span>处</span></strong><small>精选地点</small></div><div><strong>04<span>类</span></strong><small>探索主题</small></div><div><strong>∞</strong><small>城市可能</small></div></div>
      <div class="area-note">${icon('map-pin')} 黄浦江 · 两岸漫游 <span>SHANGHAI</span></div>
    </section>
    <section class="glass discover">
      <div class="section-head"><h2 id="list-title">发现周边</h2><span class="small-label" id="result-count">7 个地点</span></div>
      <div class="categories" role="group" aria-label="地点分类">
        <button data-category="all" class="category active" aria-pressed="true">全部</button><button data-category="landmark" class="category" aria-pressed="false">地标</button><button data-category="park" class="category" aria-pressed="false">绿地</button><button data-category="coffee" class="category" aria-pressed="false">咖啡</button><button data-category="culture" class="category" aria-pressed="false">文化</button>
      </div>
      <div id="place-list"></div>
      <div class="list-footer"><span class="live-dot"></span> 让好奇心，带你走远一点 ${icon('arrow-up-right')}</div>
    </section>
    <div class="glass subtle-note">${icon('mouse-pointer-2')} 拖动探索地图 · 滚轮缩放</div>
  </aside>
  <div class="map-caption"><span class="caption-line"></span><span>城市的每一面，都值得探索</span></div>
  <aside class="right-stack" aria-label="地图设置">
    <section class="glass layers-panel">
      <div class="section-head"><h2>${icon('layers-2')} 地图图层</h2><span class="small-label">LAYERS</span></div>
      <div class="basemaps" role="group" aria-label="底图风格">${basemaps.map(style => `<button class="basemap ${style.id === defaultBasemap ? 'active' : ''}" data-style="${style.id}" aria-pressed="${style.id === defaultBasemap}"><span class="map-thumb ${style.preview ? '' : `placeholder-thumb placeholder-${style.id}`}">${style.preview ? `<img src="${style.preview}" alt="" width="256" height="256" />` : ''}</span>${style.name}<span class="selected-dot"></span></button>`).join('')}</div>
      <div class="basemap-status-row"><span id="basemap-status" role="status" aria-live="polite">正在准备底图</span><button id="retry-basemap" hidden>重试</button></div>
      <div class="layer-options"><label>${icon('map-pin')} 精选地点<input type="checkbox" id="poi-toggle" checked role="switch" /></label><label>${icon('route')} 漫步路线<span class="mini-tag">示意</span><input type="checkbox" id="route-toggle" role="switch" /></label><label>${icon('circle-dot')} 步行探索圈<input type="checkbox" id="radius-toggle" checked role="switch" /></label></div>
      <div class="legend"><span><i class="green-dot"></i> 地标 / 绿地</span><span><i class="orange-dot"></i> 咖啡</span><span><i class="purple-dot"></i> 文化</span></div>
    </section>
    <section class="glass appearance-panel">
      <div class="section-head"><h2>${icon('sliders-horizontal')} 玻璃外观</h2><span class="lab-icon">${icon('sparkles')}</span></div>
      <p class="panel-description">让地图透进来，让信息更清晰。</p>
      <div class="glass-presets" role="group" aria-label="玻璃预设"><button data-preset="clear">清透</button><button data-preset="soft" class="active">柔雾</button><button data-preset="deep">凝霜</button></div>
      <details class="glass-details"><summary>精细调整<span id="glass-summary">58% · 22px</span>${icon('chevron-down')}</summary><div class="glass-details-content">
      <label class="slider-label" for="opacity">玻璃透明度 <output id="opacity-value">58%</output></label><input class="range" type="range" id="opacity" min="15" max="80" value="58" />
      <label class="slider-label" for="blur">背景模糊 <output id="blur-value">22 px</output></label><input class="range" type="range" id="blur" min="0" max="32" value="22" />
      <div class="readability-setting layer-options"><label for="readability"><span>增强可读性<small>加深衬底，减少背景干扰</small></span><input id="readability" type="checkbox" role="switch" /></label></div>
      </div></details>
      <div class="appearance-foot">${icon('blend')} 边缘映光 · 自适应明暗</div>
    </section>
  </aside>
  <div class="map-controls glass liquid-control" aria-label="地图视图工具"><button id="north" class="compass" aria-label="回到上海全景" title="回到上海全景"><span>N</span>${icon('navigation-2')}</button><span class="control-divider"></span><button id="zoom-in" aria-label="放大" title="放大">${icon('plus')}</button><span id="zoom-level">14</span><button id="zoom-out" aria-label="缩小" title="缩小">${icon('minus')}</button><span class="control-divider"></span><button id="locate" aria-label="定位到外滩" title="定位到外滩">${icon('locate-fixed')}</button></div>
  <div class="bottom-dock glass liquid-control"><button id="pan-tool" class="active" title="自由探索">${icon('mouse-pointer-2')}<span>探索</span></button><button id="measure-tool" title="点击地图上的两个点测距">${icon('ruler')}<span>测距</span></button><span class="dock-divider"></span><button id="layer-tool" title="显示或隐藏图层面板" aria-label="显示或隐藏图层面板" aria-expanded="true">${icon('layers-2')}</button><button id="export-tool" title="导出当前视图及收藏" aria-label="导出当前视图及收藏">${icon('download')}</button></div>
  <div class="bottom-status glass"><span class="live-dot"></span><span id="map-status">上海 · 黄浦江</span><span class="status-divider"></span><span id="coordinates">31.2360° N, 121.4900° E</span></div>
  <div id="toast" class="glass" role="status" aria-live="polite" hidden></div>
  <button class="mobile-panel glass" id="mobile-panel">${icon('compass')} 发现地点</button>
`;

const map = L.map('map', { zoomControl: false, attributionControl: true, minZoom: 3, maxZoom: 19 }).setView([31.2355, 121.49], 14);
let tileLayer, activeBasemap, basemapTimeout;
function setTiles(id) {
  const style = basemaps.find(item => item.id === id);
  if (!style) return;
  clearTimeout(basemapTimeout);
  if (tileLayer) map.removeLayer(tileLayer);
  activeBasemap = style;
  document.body.classList.toggle('dark-map', style.dark);
  document.querySelectorAll('[data-style]').forEach(button => {
    const selected = button.dataset.style === id;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
  });
  const status = document.querySelector('#basemap-status');
  const retry = document.querySelector('#retry-basemap');
  tileLayer = null;
  document.querySelector('#map').classList.toggle('unconfigured-map', !style.url);
  document.querySelector('#map').dataset.basemap = id;
  retry.hidden = true;
  if (!style.url) {
    status.textContent = '未配置底图 · 当前为界面演示';
    return;
  }
  const nextLayer = L.tileLayer(style.url, {
    attribution: basemapAttribution,
    tileSize: style.tileSize,
    zoomOffset: style.zoomOffset,
    maxNativeZoom: style.maxNativeZoom,
    maxZoom: 19,
  });
  tileLayer = nextLayer;
  let loaded = 0, failed = 0;
  nextLayer.on('loading', () => {
    if (tileLayer !== nextLayer) return;
    loaded = 0; failed = 0;
    retry.hidden = true;
    status.textContent = `${style.name}加载中…`;
    clearTimeout(basemapTimeout);
    basemapTimeout = setTimeout(() => {
      if (tileLayer !== nextLayer) return;
      status.textContent = '加载较慢，请检查网络或重试';
      retry.hidden = false;
    }, 12000);
  });
  nextLayer.on('tileload', () => loaded++);
  nextLayer.on('tileerror', () => { failed++; });
  nextLayer.on('load', () => {
    if (tileLayer !== nextLayer) return;
    clearTimeout(basemapTimeout);
    status.textContent = failed ? (loaded ? '部分瓦片加载失败，可重试' : '底图加载失败，请检查网络') : style.name;
    retry.hidden = failed === 0;
  });
  nextLayer.addTo(map);
}
setTiles(defaultBasemap);
document.querySelector('#retry-basemap').onclick = () => setTiles(activeBasemap.id);
L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 100 }).addTo(map);
const poiLayer = L.layerGroup().addTo(map);
const radius = L.circle([places[0].lat, places[0].lng], { radius: 750, color: '#458574', weight: 1.2, dashArray: '5 7', fillColor: '#86bcac', fillOpacity: .075, interactive: false }).addTo(map);
const markers = new Map();
places.forEach(place => {
  const marker = L.marker([place.lat, place.lng], { title: place.name, icon: L.divIcon({ className: 'place-marker', html: `<div class="pin ${place.color}">${icon(place.icon)}</div><span class="pin-label">${place.name}</span>`, iconSize: [40, 40], iconAnchor: [20, 20] }) });
  marker.on('click', () => { if (!measuring) selectPlace(place.id); });
  markers.set(place.id, marker);
});
function refreshIcons() { createIcons({ icons, attrs: { 'stroke-width': 1.65 } }); }
function filteredPlaces() { return places.filter(p => (category === 'all' || p.type === category) && (!savedOnly || saved.has(p.id))); }
function renderPlaces() {
  const filtered = filteredPlaces();
  document.querySelector('#place-list').innerHTML = filtered.length ? filtered.map(p => `<button class="place-row ${p.id === activePlace.id ? 'selected' : ''}" data-place="${p.id}"><span class="place-symbol ${p.color}">${icon(p.icon)}</span><span class="place-text"><strong>${p.name}</strong><small>${p.category} <span>·</span> ${p.address.split(' · ')[0]}</small></span>${icon('arrow-up-right', 'place-arrow')}</button>`).join('') : '<p class="empty-state">这里还没有地点。<br>点击地图上的地点，将喜欢的风景收藏起来。</p>';
  document.querySelector('#result-count').textContent = `${filtered.length} 个地点`;
  document.querySelector('#saved-count').textContent = saved.size;
  poiLayer.clearLayers();
  filtered.forEach(p => poiLayer.addLayer(markers.get(p.id)));
  refreshIcons();
}
function selectPlace(id, pan = true) {
  activePlace = places.find(p => p.id === id);
  const p = activePlace;
  radius.setLatLng([p.lat, p.lng]);
  if (popup) map.closePopup(popup);
  const content = document.createElement('div');
  content.className = 'place-card';
  content.innerHTML = `<div class="popup-eyebrow"><span class="live-dot"></span> 城市精选 <span>${p.en}</span></div><h2>${p.name}<span>${icon(p.icon)}</span></h2><p>${p.desc}</p><div class="place-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div><div class="popup-address">${icon('map-pin')} ${p.address}</div><div class="popup-actions"><button class="route-button">${icon('route')} 从人民公园出发 ${icon('arrow-up-right')}</button><button class="save-button ${saved.has(id) ? 'saved' : ''}" aria-label="${saved.has(id) ? '取消收藏' : '收藏地点'}" title="${saved.has(id) ? '取消收藏' : '收藏地点'}">${icon('bookmark')}</button></div>`;
  content.querySelector('.save-button').addEventListener('click', () => {
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    try { localStorage.setItem('atlas-saved', JSON.stringify([...saved])); } catch { toast('当前浏览器无法保存收藏，收藏仅保留在本次会话。'); }
    selectPlace(id, false); renderPlaces();
  });
  content.querySelector('.route-button').addEventListener('click', () => showRoute());
  popup = L.popup({ className: 'glass-popup', offset: [0, -25], closeButton: true, autoPan: false, maxWidth: 288, minWidth: 268 }).setLatLng([p.lat, p.lng]).setContent(content).openOn(map);
  if (pan) {
    const zoom = Math.max(map.getZoom(), 14);
    const point = map.project([p.lat, p.lng], zoom).subtract([0, 100]);
    map.setView(map.unproject(point, zoom), zoom, { animate: !reducedMotion });
  }
  renderPlaces();
}
let toastTimer;
function toast(message, duration = 3500) {
  clearTimeout(toastTimer);
  const el = document.querySelector('#toast'); el.textContent = message; el.hidden = false;
  toastTimer = setTimeout(() => { el.hidden = true; }, duration);
}
function showRoute() {
  if (activePlace.id === 'park') { toast('当前地点就是起点人民公园，请选择另一个目的地。'); return; }
  if (routeLine) map.removeLayer(routeLine);
  const p = activePlace;
  const route = [[31.2345,121.4716],[31.2352,121.475],[31.239,121.4795],[31.2393,121.484],[p.lat,p.lng]];
  routeLine = L.polyline(route, { color: '#347e6e', weight: 4, dashArray: '8 9', opacity: .85 }).addTo(map);
  document.querySelector('#route-toggle').checked = true;
  toast('已显示漫步路线示意 · 未接入道路导航，请勿用于实际导航。', 6000);
}
document.querySelector('#place-list').addEventListener('click', e => { const button = e.target.closest('[data-place]'); if (button) { selectPlace(button.dataset.place); document.body.classList.remove('mobile-open'); } });
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', b === button); });
  map.closePopup(); renderPlaces();
}));
function setCollection(value) {
  savedOnly = value;
  document.querySelector('#collections').classList.toggle('active', value);
  document.querySelector('#explore').classList.toggle('active', !value);
  document.querySelector('#list-title').textContent = value ? '我的收藏' : '发现周边';
  map.closePopup(); renderPlaces();
  if (innerWidth <= 760) document.body.classList.add('mobile-open');
}
document.querySelector('#collections').onclick = () => setCollection(true);
document.querySelector('#explore').onclick = () => setCollection(false);
document.querySelectorAll('[data-style]').forEach(button => button.addEventListener('click', () => setTiles(button.dataset.style)));
document.querySelector('#poi-toggle').onchange = e => e.target.checked ? poiLayer.addTo(map) : (map.removeLayer(poiLayer), map.closePopup());
document.querySelector('#radius-toggle').onchange = e => e.target.checked ? radius.addTo(map) : map.removeLayer(radius);
document.querySelector('#route-toggle').onchange = e => { if (e.target.checked) { if(activePlace.id === 'park') selectPlace('bund'); showRoute(); } else if (routeLine) map.removeLayer(routeLine); };
function updateGlass() {
  const opacity = +document.querySelector('#opacity').value, blur = +document.querySelector('#blur').value;
  document.documentElement.style.setProperty('--glass-alpha', (100 - opacity) / 100);
  document.documentElement.style.setProperty('--glass-blur', `${blur}px`);
  document.querySelector('#opacity-value').textContent = `${opacity}%`;
  document.querySelector('#blur-value').textContent = `${blur} px`;
  document.querySelector('#glass-summary').textContent = `${opacity}% · ${blur}px`;
  document.querySelectorAll('.range').forEach(input => input.style.setProperty('--range-progress', `${(input.value - input.min) / (input.max - input.min) * 100}%`));
}
['opacity', 'blur'].forEach(id => document.querySelector(`#${id}`).addEventListener('input', () => { updateGlass(); document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active')); }));
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  const values = { clear: [72, 12], soft: [58, 22], deep: [28, 28] }[button.dataset.preset];
  document.querySelector('#opacity').value = values[0]; document.querySelector('#blur').value = values[1]; updateGlass();
  document.querySelectorAll('[data-preset]').forEach(b => b.classList.toggle('active', b === button));
}));
document.querySelector('#zoom-in').onclick = () => map.zoomIn();
document.querySelector('#zoom-out').onclick = () => map.zoomOut();
function resetView() { map.closePopup(); map.setView([31.2355,121.49],14, { animate: !reducedMotion }); }
document.querySelector('#north').onclick = resetView;
document.querySelector('#city').onclick = () => { resetView(); toast('当前 Demo 城市：上海 · 点击精选地点开始探索'); };
document.querySelector('#locate').onclick = () => selectPlace('bund');
document.querySelector('#focus').onclick = () => { document.body.classList.toggle('focus-mode'); document.querySelector('#focus').setAttribute('aria-pressed', document.body.classList.contains('focus-mode')); syncPanelState(); };
document.querySelector('#layer-tool').onclick = () => { document.body.classList.toggle('hide-settings'); if (innerWidth <= 760) document.body.classList.remove('mobile-open'); syncPanelState(); };
function syncPanelState() { document.querySelector('#layer-tool').setAttribute('aria-expanded', getComputedStyle(document.querySelector('.right-stack')).display !== 'none'); }
window.addEventListener('resize', syncPanelState);
syncPanelState();
document.querySelector('#mobile-panel').onclick = () => { document.body.classList.toggle('mobile-open'); document.body.classList.remove('hide-settings'); syncPanelState(); };
map.on('moveend zoomend', () => { const c = map.getCenter(); document.querySelector('#coordinates').textContent = `${Math.abs(c.lat).toFixed(4)}° ${c.lat >= 0 ? 'N' : 'S'}, ${Math.abs(c.lng).toFixed(4)}° ${c.lng >= 0 ? 'E' : 'W'}`; document.querySelector('#zoom-level').textContent = map.getZoom(); });
function setMeasuring(value) {
  measuring = value; measurePoints = [];
  if (measureLine) map.removeLayer(measureLine);
  document.querySelector('#measure-tool').classList.toggle('active', value);
  document.querySelector('#pan-tool').classList.toggle('active', !value);
  document.querySelector('#map').classList.toggle('measuring', value);
  document.querySelector('#map-status').textContent = value ? '测距 · 请选择起点' : '上海 · 黄浦江';
  if (value) { map.closePopup(); toast('在地图空白处依次点击起点和终点，测量直线距离。', 5000); }
}
document.querySelector('#measure-tool').onclick = () => setMeasuring(!measuring);
document.querySelector('#pan-tool').onclick = () => setMeasuring(false);
map.on('click', e => {
  if (!measuring) return;
  if (measurePoints.length === 2) { measurePoints = []; map.removeLayer(measureLine); }
  measurePoints.push(e.latlng);
  if (measurePoints.length === 1) document.querySelector('#map-status').textContent = '测距 · 请选择终点';
  else {
    measureLine = L.polyline(measurePoints, { color: '#397e70', weight: 3, dashArray: '5 7' }).addTo(map);
    const distance = measurePoints[0].distanceTo(measurePoints[1]);
    const text = distance < 1000 ? `${Math.round(distance)} 米` : `${(distance / 1000).toFixed(2)} 公里`;
    document.querySelector('#map-status').textContent = `直线距离 ${text}`;
    measureLine.bindTooltip(text, { permanent: true, direction: 'center', className: 'distance-label' }).openTooltip();
    toast(`直线距离 ${text} · 再次点击开始新的测量`);
  }
});
const search = document.querySelector('#search'), searchResults = document.querySelector('#search-results');
function searchPlaces() {
  const query = search.value.trim().toLowerCase();
  if (!query) { searchResults.hidden = true; return; }
  const results = places.filter(p => `${p.name}${p.en}${p.category}${p.address}`.toLowerCase().includes(query));
  searchResults.innerHTML = results.length ? results.map(p => `<button data-result="${p.id}">${icon(p.icon)}<span>${p.name}<small>${p.address}</small></span>${icon('arrow-up-right')}</button>`).join('') : '<p>未找到地点，试试「外滩」「公园」或「艺术」。</p>';
  searchResults.hidden = false; refreshIcons();
}
search.addEventListener('input', searchPlaces);
search.addEventListener('focus', searchPlaces);
function chooseSearch(id) { selectPlace(id); searchResults.hidden = true; search.value = ''; search.blur(); }
searchResults.addEventListener('click', e => { const item = e.target.closest('[data-result]'); if (item) chooseSearch(item.dataset.result); });
search.addEventListener('keydown', e => { if (e.key === 'Enter') { const item = searchResults.querySelector('[data-result]'); if (item) chooseSearch(item.dataset.result); } });
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.focus(); } if(e.key === 'Escape') { searchResults.hidden = true; setMeasuring(false); document.body.classList.remove('mobile-open'); } });
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) searchResults.hidden = true; });
document.querySelector('#export-tool').onclick = () => {
  const data = { app: '浮屿 Atlas', exportedAt: new Date().toISOString(), center: map.getCenter(), zoom: map.getZoom(), basemap: { id: activeBasemap.id, name: activeBasemap.name }, savedPlaces: places.filter(p => saved.has(p.id)), appearance: { transparency: +document.querySelector('#opacity').value, blur: +document.querySelector('#blur').value, enhancedReadability: document.querySelector('#readability').checked } };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'atlas-exploration.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('已导出地图视图、玻璃设置与收藏地点。');
};
renderPlaces();
selectPlace('bund');
refreshIcons();
updateGlass();
initGlassInteractions();
