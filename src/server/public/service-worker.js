/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  const singleRequire = name => {
    if (name !== 'require') {
      name = name + '.js';
    }
    let promise = Promise.resolve();
    if (!registry[name]) {
      
        promise = new Promise(async resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = name;
            document.head.appendChild(script);
            script.onload = resolve;
          } else {
            importScripts(name);
            resolve();
          }
        });
      
    }
    return promise.then(() => {
      if (!registry[name]) {
        throw new Error(`Module ${name} didn’t register its module`);
      }
      return registry[name];
    });
  };

  const require = (names, resolve) => {
    Promise.all(names.map(singleRequire))
      .then(modules => resolve(modules.length === 1 ? modules[0] : modules));
  };
  
  const registry = {
    require: Promise.resolve(require)
  };

  self.define = (moduleName, depsNames, factory) => {
    if (registry[moduleName]) {
      // Module is already loading or loaded.
      return;
    }
    registry[moduleName] = Promise.resolve().then(() => {
      let exports = {};
      const module = {
        uri: location.origin + moduleName.slice(1)
      };
      return Promise.all(
        depsNames.map(depName => {
          switch(depName) {
            case "exports":
              return exports;
            case "module":
              return module;
            default:
              return singleRequire(depName);
          }
        })
      ).then(deps => {
        const facValue = factory(...deps);
        if(!exports.default) {
          exports.default = facValue;
        }
        return exports;
      });
    });
  };
}
define("./service-worker.js",['./workbox-64f1e998'], function (workbox) { 'use strict';

  /**
  * Welcome to your Workbox-powered service worker!
  *
  * You'll need to register this file in your web app.
  * See https://goo.gl/nhQhGp
  *
  * The rest of the code is auto-generated. Please don't update this file
  * directly; instead, make changes to your Workbox build configuration
  * and re-run your build process.
  * See https://goo.gl/2aRDsh
  */

  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */

  workbox.precacheAndRoute([{
    "url": "bundle.js",
    "revision": "c969e6970006274d9cedcd1e7d752c4b"
  }, {
    "url": "css/index.css",
    "revision": "401e898bc70083a79a6ce599834ffa46"
  }, {
    "url": "html/abstractWindowTemplate.html",
    "revision": "aa07ad88ed4c48de7d2247366b69a2a4"
  }, {
    "url": "html/alphabeticListFragment.html",
    "revision": "c268b769e1e439d3eed36858ecbae8b9"
  }, {
    "url": "html/changeUserSite.html",
    "revision": "b416ddd8f231490201243a26afa49ca8"
  }, {
    "url": "html/checkMailSite.html",
    "revision": "a474e83e1e3c4db3b9c6a186ce653595"
  }, {
    "url": "html/chooseDialog.html",
    "revision": "0171b83550d8a21f1332a5360c10baf5"
  }, {
    "url": "html/container.html",
    "revision": "a7285c607fdacd912f47738462150efe"
  }, {
    "url": "html/editListsSite.html",
    "revision": "29cc79d06d42863f748eb1e543bade63"
  }, {
    "url": "html/editPersonSite.html",
    "revision": "60171de73cc0489f1a2831d3d4803a26"
  }, {
    "url": "html/forgotPasswordSite.html",
    "revision": "b063ea7614dce48ed6794400d34b135f"
  }, {
    "url": "html/loginSite.html",
    "revision": "4d8c2f02ba16dbf38ad679827cbd62f2"
  }, {
    "url": "html/menuSite.html",
    "revision": "8dae573b1dcba5727f4bc598b1a09007"
  }, {
    "url": "html/navbar.html",
    "revision": "c05137331eb009895ba6862df4293b4a"
  }, {
    "url": "html/notAllowedSite.html",
    "revision": "2a65f4f3da6f1f508736bd63c3d093ea"
  }, {
    "url": "html/registrationSite.html",
    "revision": "5d732604002df8c6eb1f206709bc4b9a"
  }, {
    "url": "html/selectListSite.html",
    "revision": "496b16e87c8f1d43de3f75806994327a"
  }, {
    "url": "html/selectPersonFragment.html",
    "revision": "e43bf966a198f0faeb66e1705e057546"
  }, {
    "url": "html/selectPersonSite.html",
    "revision": "a98f2c013ad6213b5bc4a59a2fcbb2ca"
  }, {
    "url": "html/selectUserDialog.html",
    "revision": "3cd8fc58c0d2c6a260747475f861b855"
  }, {
    "url": "html/shareDialog.html",
    "revision": "76d5c09c81f7315c036a9d642fb85c49"
  }, {
    "url": "html/swipeFragment.html",
    "revision": "3278efb5dd279a359cdd950fa002b234"
  }, {
    "url": "html/tabFragment.html",
    "revision": "1517131fb1cff5828064e65b1a248abd"
  }, {
    "url": "img/arrowLeft.svg",
    "revision": "6bbb4f0e313bb88cd0cc80c2b3cd36fc"
  }, {
    "url": "img/errorIcon.png",
    "revision": "b48a01a1871b83b30c317f0fc4aed555"
  }, {
    "url": "img/telegram.svg",
    "revision": "e366fed4603e06142a2d6b8221be51b8"
  }, {
    "url": "img/whatsapp.svg",
    "revision": "0fa4092ac1f91a5390e74a3c2c03d5e3"
  }, {
    "url": "scripts/localforage.js",
    "revision": "7e2a4110781376e372c538e67787773a"
  }, {
    "url": "scripts/sql-wasm.js",
    "revision": "bc2421756a16dc81506a009c738cf36e"
  }, {
    "url": "sql-wasm.wasm",
    "revision": "b01552bc79c0b957d4228839bb9b74bf"
  }], {});

});
//# sourceMappingURL=service-worker.js.map
