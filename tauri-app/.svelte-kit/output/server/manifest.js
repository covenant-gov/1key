export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.C54u31EN.js",app:"_app/immutable/entry/app.BA0zzAQ3.js",imports:["_app/immutable/entry/start.C54u31EN.js","_app/immutable/chunks/wQU8rNoD.js","_app/immutable/chunks/BykR2jw5.js","_app/immutable/chunks/BEEfpOzW.js","_app/immutable/entry/app.BA0zzAQ3.js","_app/immutable/chunks/BykR2jw5.js","_app/immutable/chunks/YzXI-VLL.js","_app/immutable/chunks/sZaBqZ7P.js","_app/immutable/chunks/BEEfpOzW.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
