

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.llUyBP35.js","_app/immutable/chunks/sZaBqZ7P.js","_app/immutable/chunks/BykR2jw5.js","_app/immutable/chunks/BnMwdpAs.js"];
export const stylesheets = ["_app/immutable/assets/0.Mf6ivEbn.css"];
export const fonts = [];
