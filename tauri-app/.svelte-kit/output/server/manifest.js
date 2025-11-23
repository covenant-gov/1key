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
		client: {start:"_app/immutable/entry/start.DATGwyh_.js",app:"_app/immutable/entry/app.D3RomIH0.js",imports:["_app/immutable/entry/start.DATGwyh_.js","_app/immutable/chunks/CjJhdk4A.js","_app/immutable/chunks/BA8RC1HY.js","_app/immutable/chunks/Bk-e5Ehq.js","_app/immutable/entry/app.D3RomIH0.js","_app/immutable/chunks/BA8RC1HY.js","_app/immutable/chunks/DXS9DpZ9.js","_app/immutable/chunks/Dr4Qhj0q.js","_app/immutable/chunks/Bk-e5Ehq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
