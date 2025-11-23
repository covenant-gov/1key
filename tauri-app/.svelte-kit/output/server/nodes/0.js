

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Dhyb1io3.js","_app/immutable/chunks/Dr4Qhj0q.js","_app/immutable/chunks/BA8RC1HY.js","_app/immutable/chunks/CG65uvKC.js"];
export const stylesheets = ["_app/immutable/assets/0.Mf6ivEbn.css"];
export const fonts = [];
