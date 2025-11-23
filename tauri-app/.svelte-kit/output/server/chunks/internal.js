import{H as S,C as P,a as V,g as C,b as Y,c as j,e as $,d as O,s as z,r as tt,u as et,q as G,i as L,f as w,h as nt,j as m,B as x,p as F,k as K,l as N,m as b,n as B,o as st,t as D,v as W,w as it,x as rt,y as A,z as q,A as at,E as ot,D as lt,F as ht,G as J,I as M,J as ct,K as ut,L as ft,M as dt,N as _t,O as pt,P as vt,Q as gt,R as mt,S as yt,T as bt,U as wt,V as Et}from"./index-client.js";import{e as kt}from"./escaping.js";import"clsx";import"./environment.js";import"./server.js";let xt={};function Jt(s){}function Qt(s){xt=s}function Q(s){console.warn("https://svelte.dev/e/hydration_mismatch")}function Tt(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}let p=!1;function T(s){p=s}let d;function E(s){if(s===null)throw Q(),S;return d=s}function Rt(){return E(C(d))}function St(s=1){if(p){for(var t=s,e=d;t--;)e=C(e);d=e}}function Ot(s=!0){for(var t=0,e=d;;){if(e.nodeType===P){var r=e.data;if(r===V){if(t===0)return e;t-=1}else(r===Y||r===j)&&(t+=1)}var a=C(e);s&&e.remove(),e=a}}function Nt(s){let t=0,e=z(0),r;return()=>{$()&&(O(e),tt(()=>(t===0&&(r=et(()=>s(()=>L(e)))),t+=1,()=>{G(()=>{t-=1,t===0&&(r?.(),r=void 0,L(e))})})))}}var Pt=ot|lt|ht;function Ct(s,t,e){new Ft(s,t,e)}class Ft{parent;#e=!1;#t;#v=p?d:null;#i;#u;#r;#s=null;#n=null;#a=null;#o=null;#l=null;#f=0;#h=0;#d=!1;#c=null;#y=Nt(()=>(this.#c=z(this.#f),()=>{this.#c=null}));constructor(t,e,r){this.#t=t,this.#i=e,this.#u=r,this.parent=w.b,this.#e=!!this.#i.pending,this.#r=nt(()=>{if(w.b=this,p){const n=this.#v;Rt(),n.nodeType===P&&n.data===j?this.#w():this.#b()}else{var a=this.#g();try{this.#s=m(()=>r(a))}catch(n){this.error(n)}this.#h>0?this.#p():this.#e=!1}return()=>{this.#l?.remove()}},Pt),p&&(this.#t=d)}#b(){try{this.#s=m(()=>this.#u(this.#t))}catch(t){this.error(t)}this.#e=!1}#w(){const t=this.#i.pending;t&&(this.#n=m(()=>t(this.#t)),x.enqueue(()=>{var e=this.#g();this.#s=this.#_(()=>(x.ensure(),m(()=>this.#u(e)))),this.#h>0?this.#p():(F(this.#n,()=>{this.#n=null}),this.#e=!1)}))}#g(){var t=this.#t;return this.#e&&(this.#l=K(),this.#t.before(this.#l),t=this.#l),t}is_pending(){return this.#e||!!this.parent&&this.parent.is_pending()}has_pending_snippet(){return!!this.#i.pending}#_(t){var e=w,r=D,a=W;N(this.#r),b(this.#r),B(this.#r.ctx);try{return t()}catch(n){return st(n),null}finally{N(e),b(r),B(a)}}#p(){const t=this.#i.pending;this.#s!==null&&(this.#o=document.createDocumentFragment(),this.#o.append(this.#l),it(this.#s,this.#o)),this.#n===null&&(this.#n=m(()=>t(this.#t)))}#m(t){if(!this.has_pending_snippet()){this.parent&&this.parent.#m(t);return}this.#h+=t,this.#h===0&&(this.#e=!1,this.#n&&F(this.#n,()=>{this.#n=null}),this.#o&&(this.#t.before(this.#o),this.#o=null))}update_pending_count(t){this.#m(t),this.#f+=t,this.#c&&rt(this.#c,this.#f)}get_effect_pending(){return this.#y(),O(this.#c)}error(t){var e=this.#i.onerror;let r=this.#i.failed;if(this.#d||!e&&!r)throw t;this.#s&&(A(this.#s),this.#s=null),this.#n&&(A(this.#n),this.#n=null),this.#a&&(A(this.#a),this.#a=null),p&&(E(this.#v),St(),E(Ot()));var a=!1,n=!1;const i=()=>{if(a){Tt();return}a=!0,n&&at(),x.ensure(),this.#f=0,this.#a!==null&&F(this.#a,()=>{this.#a=null}),this.#e=this.has_pending_snippet(),this.#s=this.#_(()=>(this.#d=!1,m(()=>this.#u(this.#t)))),this.#h>0?this.#p():this.#e=!1};var o=D;try{b(null),n=!0,e?.(t,i),n=!1}catch(c){q(c,this.#r&&this.#r.parent)}finally{b(o)}r&&G(()=>{this.#a=this.#_(()=>{x.ensure(),this.#d=!0;try{return m(()=>{r(this.#t,()=>t,()=>i)})}catch(c){return q(c,this.#r.parent),null}finally{this.#d=!1}})})}}const At=["touchstart","touchmove"];function Dt(s){return At.includes(s)}const Mt=new Set,H=new Set;let U=null;function R(s){var t=this,e=t.ownerDocument,r=s.type,a=s.composedPath?.()||[],n=a[0]||s.target;U=s;var i=0,o=U===s&&s.__root;if(o){var c=a.indexOf(o);if(c!==-1&&(t===document||t===window)){s.__root=t;return}var v=a.indexOf(t);if(v===-1)return;c<=v&&(i=c)}if(n=a[i]||s.target,n!==t){J(s,"currentTarget",{configurable:!0,get(){return n||e}});var g=D,u=w;b(null),N(null);try{for(var l,h=[];n!==null;){var f=n.assignedSlot||n.parentNode||n.host||null;try{var _=n["__"+r];_!=null&&(!n.disabled||s.target===n)&&_.call(n,s)}catch(k){l?h.push(k):l=k}if(s.cancelBubble||f===t||f===null)break;n=f}if(l){for(let k of h)queueMicrotask(()=>{throw k});throw l}}finally{s.__root=t,delete s.currentTarget,b(g),N(u)}}}function It(s,t){var e=w;e.nodes_start===null&&(e.nodes_start=s,e.nodes_end=t)}function X(s,t){return Z(s,t)}function Lt(s,t){M(),t.intro=t.intro??!1;const e=t.target,r=p,a=d;try{for(var n=ct(e);n&&(n.nodeType!==P||n.data!==Y);)n=C(n);if(!n)throw S;T(!0),E(n);const i=Z(s,{...t,anchor:n});return T(!1),i}catch(i){if(i instanceof Error&&i.message.split(`
`).some(o=>o.startsWith("https://svelte.dev/e/")))throw i;return i!==S&&console.warn("Failed to hydrate: ",i),t.recover===!1&&ut(),M(),ft(e),T(!1),X(s,t)}finally{T(r),E(a)}}const y=new Map;function Z(s,{target:t,anchor:e,props:r={},events:a,context:n,intro:i=!0}){M();var o=new Set,c=u=>{for(var l=0;l<u.length;l++){var h=u[l];if(!o.has(h)){o.add(h);var f=Dt(h);t.addEventListener(h,R,{passive:f});var _=y.get(h);_===void 0?(document.addEventListener(h,R,{passive:f}),y.set(h,1)):y.set(h,_+1)}}};c(dt(Mt)),H.add(c);var v=void 0,g=_t(()=>{var u=e??t.appendChild(K());return Ct(u,{pending:()=>{}},l=>{if(n){pt({});var h=W;h.c=n}if(a&&(r.$$events=a),p&&It(l,null),v=s(l,r)||{},p&&(w.nodes_end=d,d===null||d.nodeType!==P||d.data!==V))throw Q(),S;n&&vt()}),()=>{for(var l of o){t.removeEventListener(l,R);var h=y.get(l);--h===0?(document.removeEventListener(l,R),y.delete(l)):y.set(l,h)}H.delete(c),u!==e&&u.parentNode?.removeChild(u)}});return I.set(v,g),v}let I=new WeakMap;function Bt(s,t){const e=I.get(s);return e?(I.delete(s),e(t)):Promise.resolve()}function qt(s){return class extends Ht{constructor(t){super({component:s,...t})}}}class Ht{#e;#t;constructor(t){var e=new Map,r=(n,i)=>{var o=bt(i,!1,!1);return e.set(n,o),o};const a=new Proxy({...t.props||{},$$events:{}},{get(n,i){return O(e.get(i)??r(i,Reflect.get(n,i)))},has(n,i){return i===mt?!0:(O(e.get(i)??r(i,Reflect.get(n,i))),Reflect.has(n,i))},set(n,i,o){return gt(e.get(i)??r(i,o),o),Reflect.set(n,i,o)}});this.#t=(t.hydrate?Lt:X)(t.component,{target:t.target,anchor:t.anchor,props:a,context:t.context,intro:t.intro??!1,recover:t.recover}),(!t?.props?.$$host||t.sync===!1)&&yt(),this.#e=a.$$events;for(const n of Object.keys(this.#t))n==="$set"||n==="$destroy"||n==="$on"||J(this,n,{get(){return this.#t[n]},set(i){this.#t[n]=i},enumerable:!0});this.#t.$set=n=>{Object.assign(a,n)},this.#t.$destroy=()=>{Bt(this.#t)}}$set(t){this.#t.$set(t)}$on(t,e){this.#e[t]=this.#e[t]||[];const r=(...a)=>e.call(this,...a);return this.#e[t].push(r),()=>{this.#e[t]=this.#e[t].filter(a=>a!==r)}}$destroy(){this.#t.$destroy()}}let Ut=null;function Xt(s){Ut=s}function Zt(s){}function Vt(s,t){s.component(e=>{let{stores:r,page:a,constructors:n,components:i=[],form:o,data_0:c=null,data_1:v=null}=t,g=!1,u=!1,l=null;wt(()=>{const f=r.page.subscribe(()=>{g&&(u=!0,Et().then(()=>{l=document.title||"untitled page"}))});return g=!0,f});const h=n[1];if(n[1]){e.push("<!--[-->");const f=n[0];e.push("<!---->"),f(e,{data:c,form:o,params:a.params,children:_=>{_.push("<!---->"),h(_,{data:v,form:o,params:a.params}),_.push("<!---->")},$$slots:{default:!0}}),e.push("<!---->")}else{e.push("<!--[!-->");const f=n[0];e.push("<!---->"),f(e,{data:c,form:o,params:a.params}),e.push("<!---->")}e.push("<!--]--> "),g?(e.push("<!--[-->"),e.push('<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px">'),u?(e.push("<!--[-->"),e.push(`${kt(l)}`)):e.push("<!--[!-->"),e.push("<!--]--></div>")):e.push("<!--[!-->"),e.push("<!--]-->")})}const Yt=qt(Vt),$t={app_template_contains_nonce:!1,async:!1,csp:{mode:"auto",directives:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1},reportOnly:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1}},csrf_check_origin:!0,csrf_trusted_origins:[],embedded:!1,env_public_prefix:"PUBLIC_",env_private_prefix:"",hash_routing:!1,hooks:null,preload_strategy:"modulepreload",root:Yt,service_worker:!1,service_worker_options:void 0,templates:{app:({head:s,body:t,assets:e,nonce:r,env:a})=>`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>1Key - Password Manager</title>
    `+s+`
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">`+t+`</div>
  </body>
</html>

`,error:({status:s,message:t})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>`+t+`</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">`+s+`</span>
			<div class="message">
				<h1>`+t+`</h1>
			</div>
		</div>
	</body>
</html>
`},version_hash:"10btezh"};async function te(){return{handle:void 0,handleFetch:void 0,handleError:void 0,handleValidationError:void 0,init:void 0,reroute:void 0,transport:void 0}}export{Qt as a,Xt as b,Zt as c,te as g,$t as o,xt as p,Ut as r,Jt as s};
