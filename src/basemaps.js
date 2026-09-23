// Optional untracked configuration. A clean checkout contains no map provider,
// endpoint, attribution link, or remote preview.
const localConfig = Object.values(import.meta.glob('./basemaps.local.json', {
  eager: true,
  import: 'default',
}))[0] || {};

const presets = [
  { id: 'standard', name: '标准地图' },
  { id: 'english', name: '英文地图' },
  { id: 'mobile', name: '移动地图' },
  { id: 'gray', name: '灰色地图' },
  { id: 'blue', name: '深色地图', dark: true },
  { id: 'warm', name: '暖色地图' },
];
const overrides = Array.isArray(localConfig.styles) ? localConfig.styles : [];
export const basemaps = presets.map(preset => {
  const custom = overrides.find(style => style.id === preset.id) || {};
  return {
    tileSize: 256,
    zoomOffset: 0,
    maxNativeZoom: 19,
    dark: false,
    ...preset,
    ...custom,
    id: preset.id,
    url: typeof custom.url === 'string' ? custom.url : '',
    preview: typeof custom.preview === 'string' ? custom.preview : '',
  };
});
export const defaultBasemap = basemaps.some(style => style.id === localConfig.defaultBasemap)
  ? localConfig.defaultBasemap : 'gray';
export const basemapAttribution = typeof localConfig.attribution === 'string' ? localConfig.attribution : '';
