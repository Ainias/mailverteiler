if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise(async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()})),r.then(()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]})},r=(r,i)=>{Promise.all(r.map(e)).then(e=>i(1===e.length?e[0]:e))},i={require:Promise.resolve(r)};self.define=(r,t,l)=>{i[r]||(i[r]=Promise.resolve().then(()=>{let i={};const s={uri:location.origin+r.slice(1)};return Promise.all(t.map(r=>{switch(r){case"exports":return i;case"module":return s;default:return e(r)}})).then(e=>{const r=l(...e);return i.default||(i.default=r),i})}))}}define("./service-worker.js",["./workbox-1bbb3e0e"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"bundle.js",revision:"913243b4fb15bae42d6d21c30dbddafc"},{url:"css/index.css",revision:"3df5f67e86f94a8aef7a5973e42fad68"},{url:"html/abstractWindowTemplate.html",revision:"194a55a319d2fdc5181a80ce4b756a27"},{url:"html/alphabeticListFragment.html",revision:"c268b769e1e439d3eed36858ecbae8b9"},{url:"html/changeUserSite.html",revision:"b416ddd8f231490201243a26afa49ca8"},{url:"html/checkMailSite.html",revision:"747126a1571cd58bd17a17b7268f995b"},{url:"html/chooseDialog.html",revision:"0171b83550d8a21f1332a5360c10baf5"},{url:"html/container.html",revision:"a7285c607fdacd912f47738462150efe"},{url:"html/editListsSite.html",revision:"c273c8a7bbed6554dfcdb072fdc8d7ec"},{url:"html/editPersonSite.html",revision:"df353b7458fbc4c111bc7019ba48b0c7"},{url:"html/forgotPasswordSite.html",revision:"b063ea7614dce48ed6794400d34b135f"},{url:"html/loginSite.html",revision:"4d8c2f02ba16dbf38ad679827cbd62f2"},{url:"html/menuSite.html",revision:"8dae573b1dcba5727f4bc598b1a09007"},{url:"html/navbar.html",revision:"c05137331eb009895ba6862df4293b4a"},{url:"html/notAllowedSite.html",revision:"2a65f4f3da6f1f508736bd63c3d093ea"},{url:"html/registrationSite.html",revision:"5d732604002df8c6eb1f206709bc4b9a"},{url:"html/selectListSite.html",revision:"496b16e87c8f1d43de3f75806994327a"},{url:"html/selectPersonFragment.html",revision:"e43bf966a198f0faeb66e1705e057546"},{url:"html/selectPersonSite.html",revision:"a98f2c013ad6213b5bc4a59a2fcbb2ca"},{url:"html/selectUserDialog.html",revision:"3cd8fc58c0d2c6a260747475f861b855"},{url:"html/shareDialog.html",revision:"76d5c09c81f7315c036a9d642fb85c49"},{url:"html/swipeFragment.html",revision:"3278efb5dd279a359cdd950fa002b234"},{url:"html/tabFragment.html",revision:"1517131fb1cff5828064e65b1a248abd"},{url:"img/arrowLeft.svg",revision:"6bbb4f0e313bb88cd0cc80c2b3cd36fc"},{url:"img/errorIcon.png",revision:"b48a01a1871b83b30c317f0fc4aed555"},{url:"img/telegram.svg",revision:"e366fed4603e06142a2d6b8221be51b8"},{url:"img/whatsapp.svg",revision:"0fa4092ac1f91a5390e74a3c2c03d5e3"},{url:"scripts/localforage.js",revision:"612e9ba908eb8f1026cae4e91e7f71a7"},{url:"scripts/sql-wasm.js",revision:"bc2421756a16dc81506a009c738cf36e"},{url:"sql-wasm.wasm",revision:"b01552bc79c0b957d4228839bb9b74bf"}],{})}));
//# sourceMappingURL=service-worker.js.map
