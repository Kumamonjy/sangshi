if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LAUNCH = "onLaunch";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const onHide = /* @__PURE__ */ createHook(ON_HIDE);
  const onLaunch = /* @__PURE__ */ createHook(ON_LAUNCH);
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof globalThis !== "undefined" && ((_a = globalThis.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = globalThis.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy) {
        setupFn(proxy.proxiedTarget);
      }
    }
  }
  /*!
   * pinia v2.3.1
   * (c) 2025 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject(o) {
    return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store) {
    return isPinia(store) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store.$id,
      label: store.$id
    };
  }
  function formatStoreForInspectorState(store) {
    if (isPinia(store)) {
      const storeNames = Array.from(store._s.keys());
      const storeMap = store._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store2 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store2._getters.reduce((getters, key) => {
              getters[key] = store2[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store.$state).map((key) => ({
        editable: true,
        key,
        value: store.$state[key]
      }))
    };
    if (store._getters && store._getters.length) {
      state.getters = store._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store[getterName]
      }));
    }
    if (store._customProperties.size) {
      state.customProperties = Array.from(store._customProperties).map((key) => ({
        editable: true,
        key,
        value: store[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store = pinia._s.get(nodeId);
              if (!store) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store) => {
            payload.instanceData.state.push({
              type: getStoreType(store.$id),
              key: "state",
              editable: true,
              value: store._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store.$state).reduce((state, key) => {
                  state[key] = store.$state[key];
                  return state;
                }, {})
              )
            });
            if (store._getters && store._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store.$id),
                key: "getters",
                editable: false,
                value: store._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store) => "$id" in store ? store.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      globalThis.$pinia = pinia;
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            if (payload.nodeId !== PINIA_ROOT_ID)
              globalThis.$store = vue.toRaw(inspectedStore);
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store = pinia._s.get(storeId);
          if (!store) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store) {
    if (!componentStateTypes.includes(getStoreType(store.$id))) {
      componentStateTypes.push(getStoreType(store.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store._hotUpdate;
      store._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store;
      store.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`"${store.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store, options }) {
    if (store.$id.startsWith("__hot:")) {
      return;
    }
    store._isOptionsAPI = !!options.state;
    if (!store._p._testing) {
      patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
      const originalHotUpdate = store._hotUpdate;
      vue.toRaw(store)._hotUpdate = function(newStore) {
        originalHotUpdate.apply(this, arguments);
        patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
      };
    }
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (IS_CLIENT) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && true) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (IS_CLIENT && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  const ACTION_MARKER = Symbol();
  const ACTION_NAME = Symbol();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    } else if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o) {
    return !!(vue.isRef(o) && o.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store2 = pinia._s.get(id);
          return getters[name].call(store2, store2);
        }));
        return computedGetters;
      }, {}));
    }
    store = createSetupStore(id, setup, options, pinia, hot, true);
    return store;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = { deep: true };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    const action = (fn, name = "") => {
      if (ACTION_MARKER in fn) {
        fn[ACTION_NAME] = name;
        return fn;
      }
      const wrappedAction = function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name: wrappedAction[ACTION_NAME],
          store,
          after,
          onError
        });
        let ret;
        try {
          ret = fn.apply(this && this.$id === $id ? this : store, args);
        } catch (error) {
          triggerSubscriptions(onErrorCallbackList, error);
          throw error;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
      wrappedAction[ACTION_MARKER] = true;
      wrappedAction[ACTION_NAME] = name;
      return wrappedAction;
    };
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(() => setup({ action }))));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : action(prop, key);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store, setupStore);
      assign(vue.toRaw(store), setupStore);
    }
    Object.defineProperty(store, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store._hotUpdate = vue.markRaw((newStore) => {
        store._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const actionFn = newStore[actionName];
          set(store, actionName, action(actionFn, actionName));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store, store);
            })
          ) : getter;
          set(store, getterName, getterValue);
        }
        Object.keys(store._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store, key);
          }
        });
        Object.keys(store._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store, key);
          }
        });
        store._hmrPayload = newStore._hmrPayload;
        store._getters = newStore._getters;
        store._hotUpdating = false;
      });
    }
    if (IS_CLIENT) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
        Object.defineProperty(store, p, assign({ value: store[p] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (IS_CLIENT) {
        const extensions = scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
        assign(store, extensions);
      } else {
        assign(store, scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store;
  }
  /*! #__NO_SIDE_EFFECTS__ */
  // @__NO_SIDE_EFFECTS__
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    }
    function useStore(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore._pinia = pinia;
        }
      }
      const store = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store;
        }
      }
      return store;
    }
    useStore.$id = id;
    return useStore;
  }
  const CLASS_CONFIG = {
    warrior: {
      name: "战士",
      moveRange: 3,
      attackRange: 1,
      maxHp: 220,
      attack: 60,
      defense: 20,
      skill: {
        name: "防御姿态",
        description: "回复15%血量，本场战斗攻击提高10%、防御力提高15%，可无限叠加",
        cooldown: 3
      }
    },
    knight: {
      name: "骑士",
      moveRange: 4,
      attackRange: 1,
      maxHp: 230,
      attack: 65,
      defense: 10,
      skill: {
        name: "冲锋",
        description: "向指定方向直线移动，路径上敌人受普攻伤害",
        cooldown: 3
      }
    },
    archer: {
      name: "弓箭手",
      moveRange: 3,
      attackRange: 3,
      maxHp: 190,
      attack: 70,
      defense: 10,
      skill: {
        name: "远程射击",
        description: "对单个敌方目标造成1.3倍普通攻击伤害，射程4格",
        cooldown: 3
      }
    },
    mage: {
      name: "法师",
      moveRange: 3,
      attackRange: 3,
      maxHp: 180,
      attack: 70,
      defense: 10,
      skill: {
        name: "范围爆破",
        description: "以自身为中心，对移动距离≤2范围内的所有敌方目标造成1.1倍普通攻击伤害",
        cooldown: 3
      }
    },
    witch: {
      name: "巫师",
      moveRange: 3,
      attackRange: 4,
      maxHp: 190,
      attack: 50,
      defense: 20,
      skill: {
        name: "治愈术",
        description: "对单个己方目标恢复生命值（恢复量=攻击力×2）",
        cooldown: 3
      }
    },
    assassin: {
      name: "刺客",
      moveRange: 3,
      attackRange: 1,
      maxHp: 190,
      attack: 70,
      defense: 0,
      skill: {
        name: "暗影打击",
        description: "瞬间移动到5格范围内的任何位置发动攻击，攻击力为普通攻击×1.3（向上取整）",
        cooldown: 3
      }
    },
    architect: {
      name: "建筑师",
      moveRange: 3,
      attackRange: 1,
      maxHp: 210,
      attack: 50,
      defense: 20,
      skill: {
        name: "大兴土木",
        description: "在自己身边相邻四格范围内，至多选择3个没有角色的格子，有障碍物则清除，无障碍物则生成",
        cooldown: 2
      }
    },
    strategist: {
      name: "军师",
      moveRange: 3,
      attackRange: 2,
      maxHp: 200,
      attack: 60,
      defense: 10,
      skill: {
        name: "斗转星移",
        description: "选择4格范围内任意两个角色或障碍物交换位置",
        cooldown: 3
      }
    }
  };
  const LEVEL_EXP = {
    0: 50,
    1: 80,
    2: 110,
    3: 140,
    4: 170,
    5: 200,
    6: 230,
    7: 260,
    8: 290,
    9: 320
  };
  const MAP_ROWS = 12;
  const MAP_COLS = 11;
  let currentObstacles = [
    { row: 2, col: 3 },
    { row: 2, col: 7 },
    { row: 2, col: 10 },
    { row: 5, col: 1 },
    { row: 5, col: 5 },
    { row: 5, col: 8 },
    { row: 8, col: 2 },
    { row: 8, col: 6 },
    { row: 8, col: 9 },
    { row: 10, col: 4 },
    { row: 10, col: 7 }
  ];
  function generateRandomObstacles() {
    const obstacleCount = 12 + Math.floor(Math.random() * 5);
    const obstacles = [];
    const forbiddenRows = [0, 1, 11, 12];
    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts && obstacles.length < obstacleCount; attempt++) {
      const row = Math.floor(Math.random() * (MAP_ROWS - 4)) + 2;
      const col = Math.floor(Math.random() * MAP_COLS);
      const pos = { row, col };
      if (forbiddenRows.includes(row)) continue;
      if (obstacles.some((o) => o.row === pos.row && o.col === pos.col)) continue;
      obstacles.push(pos);
      if (!isMapConnected(obstacles)) {
        obstacles.pop();
      }
    }
    return obstacles;
  }
  function isMapConnected(obstacles) {
    const obstacleSet = new Set(obstacles.map((o) => `${o.row},${o.col}`));
    const visited = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(false));
    const queue = [];
    queue.push({ row: 0, col: 0 });
    visited[0][0] = true;
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];
    while (queue.length > 0) {
      const current = queue.shift();
      for (const dir of directions) {
        const newRow = current.row + dir.dr;
        const newCol = current.col + dir.dc;
        if (newRow >= 0 && newRow < MAP_ROWS && newCol >= 0 && newCol < MAP_COLS) {
          if (!visited[newRow][newCol] && !obstacleSet.has(`${newRow},${newCol}`)) {
            visited[newRow][newCol] = true;
            queue.push({ row: newRow, col: newCol });
          }
        }
      }
    }
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (!obstacleSet.has(`${r},${c}`) && !visited[r][c]) {
          return false;
        }
      }
    }
    return true;
  }
  function isObstacle(row, col) {
    return currentObstacles.some((p) => p.row === row && p.col === col);
  }
  function setObstacles(obstacles) {
    currentObstacles = obstacles;
  }
  function removeObstacle(row, col) {
    const index = currentObstacles.findIndex((p) => p.row === row && p.col === col);
    if (index !== -1) {
      currentObstacles.splice(index, 1);
      return true;
    }
    return false;
  }
  function addObstacle(row, col) {
    if (!isObstacle(row, col)) {
      currentObstacles.push({ row, col });
      return true;
    }
    return false;
  }
  function removeObstacleWithGrassChance(row, col) {
    const removed = removeObstacle(row, col);
    const generateGrass = removed && Math.random() < 0.3;
    return { removed, generateGrass };
  }
  function generateHealingGrass(obstacles) {
    const grass = [];
    const middleStartRow = Math.floor(MAP_ROWS / 2) - 2;
    const middleEndRow = Math.floor(MAP_ROWS / 2) + 2;
    const maxAttempts = 50;
    for (let attempt = 0; attempt < maxAttempts && grass.length < 2; attempt++) {
      const row = Math.floor(Math.random() * (middleEndRow - middleStartRow + 1)) + middleStartRow;
      const col = Math.floor(Math.random() * MAP_COLS);
      const pos = { row, col };
      if (obstacles.some((o) => o.row === pos.row && o.col === pos.col)) continue;
      if (grass.some((g) => g.row === pos.row && g.col === pos.col)) continue;
      if (row === 0 || row === 1 || row === MAP_ROWS - 1 || row === MAP_ROWS - 2) continue;
      grass.push(pos);
    }
    return grass;
  }
  let unitIdCounter = 0;
  function generateUnitId() {
    return "unit_" + ++unitIdCounter;
  }
  function getExpForLevel(level) {
    if (level <= 9) {
      return LEVEL_EXP[level] || 50;
    }
    return 50 + level * 30;
  }
  function getLevelUpStats(heroClass, currentLevel) {
    const stats = {
      warrior: {
        hp: 40,
        attack: 10,
        defense: 15
      },
      knight: {
        hp: 40,
        attack: 15,
        defense: 10
      },
      archer: {
        hp: 30,
        attack: 15,
        defense: 5
      },
      mage: {
        hp: 30,
        attack: 15,
        defense: 5
      },
      witch: {
        hp: 40,
        attack: 5,
        defense: 15
      },
      assassin: {
        hp: 30,
        attack: 15,
        defense: 5
      },
      architect: {
        hp: 35,
        attack: 10,
        defense: 15
      },
      strategist: {
        hp: 35,
        attack: 10,
        defense: 10
      }
    };
    return stats[heroClass] || stats.warrior;
  }
  function createUnit(config) {
    const classConfig = CLASS_CONFIG[config.classType];
    const level = config.level || 1;
    let maxHp = classConfig.maxHp;
    let attack = classConfig.attack;
    let defense = classConfig.defense;
    for (let l = 2; l <= level; l++) {
      const stats = getLevelUpStats(config.classType);
      maxHp += stats.hp;
      attack += stats.attack;
      defense += stats.defense;
    }
    return {
      id: generateUnitId(),
      name: config.name,
      classType: config.classType,
      isHero: config.isHero || false,
      isAI: config.isAI || false,
      isEnemy: config.isEnemy || false,
      level,
      exp: config.exp || 0,
      statPoints: 1,
      usedStatPoints: 0,
      maxHp,
      hp: maxHp,
      attack,
      defense,
      moveRange: classConfig.moveRange,
      attackRange: classConfig.attackRange,
      skill: {
        name: classConfig.skill.name,
        description: classConfig.skill.description,
        cooldown: classConfig.skill.cooldown,
        currentCooldown: 0
      },
      position: config.position || { row: 0, col: 0 },
      isDefending: false,
      hasActed: false,
      hasMoved: false,
      hasAttacked: false,
      defenseBuffDuration: 0,
      permanentAttackBonus: 0,
      permanentDefenseBonus: 0
    };
  }
  function createInitialHeroes() {
    return [
      createUnit({
        name: "熊熊",
        classType: "warrior",
        isHero: true,
        level: 1,
        exp: 0
      }),
      createUnit({
        name: "兔兔",
        classType: "archer",
        isHero: true,
        level: 1,
        exp: 0
      }),
      createUnit({
        name: "大黑熊",
        classType: "mage",
        isHero: true,
        level: 1,
        exp: 0
      })
    ];
  }
  function createEnemyUnit(classType, position, level) {
    return createUnit({
      name: `敌方-${CLASS_CONFIG[classType].name}`,
      classType,
      isEnemy: true,
      level: level || 1,
      position
    });
  }
  function createAllyAI(classType, position, level) {
    return createUnit({
      name: `我方AI-${CLASS_CONFIG[classType].name}`,
      classType,
      isAI: true,
      isEnemy: false,
      level: level || 1,
      position
    });
  }
  function getDistance(pos1, pos2) {
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
  }
  function calculateDamage(attacker, defender) {
    let actualAttack = attacker.attack * (1 + attacker.permanentAttackBonus / 100);
    let actualDefense = defender.defense * (1 + defender.permanentDefenseBonus / 100);
    if (defender.isDefending) {
      actualDefense = Math.ceil(actualDefense * 1.1);
    }
    const damage = actualAttack - actualDefense;
    return Math.max(1, Math.ceil(damage));
  }
  function isValidPosition(row, col) {
    return row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS;
  }
  function getAvailablePositions(units, unit, moveRange, thunderAreas = []) {
    const positions = [];
    const visited = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(false));
    const queue = [];
    queue.push({ row: unit.position.row, col: unit.position.col, distance: 0 });
    visited[unit.position.row][unit.position.col] = true;
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];
    while (queue.length > 0) {
      const current = queue.shift();
      for (const dir of directions) {
        const newRow = current.row + dir.dr;
        const newCol = current.col + dir.dc;
        const newDistance = current.distance + 1;
        if (newRow >= 0 && newRow < MAP_ROWS && newCol >= 0 && newCol < MAP_COLS) {
          if (!visited[newRow][newCol] && newDistance <= moveRange) {
            if (!isObstacle(newRow, newCol)) {
              const occupied = units.some((u) => u.position.row === newRow && u.position.col === newCol);
              if (!occupied) {
                visited[newRow][newCol] = true;
                queue.push({ row: newRow, col: newCol, distance: newDistance });
                if (newDistance > 0) {
                  positions.push({ row: newRow, col: newCol, distance: newDistance });
                }
              }
            }
          }
        }
      }
    }
    const isThunder = (row, col) => thunderAreas.some((t) => t.row === row && t.col === col);
    const currentInThunder = isThunder(unit.position.row, unit.position.col);
    positions.sort((a, b) => {
      const aIsThunder = isThunder(a.row, a.col);
      const bIsThunder = isThunder(b.row, b.col);
      if (currentInThunder) {
        if (!aIsThunder && bIsThunder) return -1;
        if (aIsThunder && !bIsThunder) return 1;
      } else {
        if (!aIsThunder && bIsThunder) return -1;
        if (aIsThunder && !bIsThunder) return 1;
      }
      return a.distance - b.distance;
    });
    return positions;
  }
  function getAttackablePositions(units, unit) {
    const positions = [];
    const range = unit.attackRange;
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (row === unit.position.row && col === unit.position.col) continue;
        const distance = getDistance(unit.position, { row, col });
        if (distance <= range) {
          const targetUnit = units.find((u) => u.position.row === row && u.position.col === col);
          if (targetUnit) {
            const isEnemy = unit.isEnemy !== targetUnit.isEnemy;
            if (isEnemy) {
              positions.push({ row, col, target: targetUnit });
            }
          }
        }
      }
    }
    return positions;
  }
  function evaluateMoveSkillDamage(unit, allUnits, thunderAreas = []) {
    if (unit.skill.currentCooldown > 0 && unit.classType !== "warrior") return null;
    const movePositions = getAvailablePositions(allUnits, unit, unit.moveRange, thunderAreas);
    let bestResult = null;
    if (unit.classType === "knight") {
      const originalRow = unit.position.row;
      const originalCol = unit.position.col;
      let bestDamage = 0;
      let bestTargetIds = [];
      let bestTargetPos = null;
      const directions = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 }
      ];
      for (const dir of directions) {
        for (let endDistance = 1; endDistance <= unit.moveRange; endDistance++) {
          const endRow = originalRow + dir.dr * endDistance;
          const endCol = originalCol + dir.dc * endDistance;
          if (!isValidPosition(endRow, endCol)) {
            break;
          }
          const unitAtEnd = allUnits.find((u) => u.position.row === endRow && u.position.col === endCol);
          if (unitAtEnd) {
            continue;
          }
          let tempDamage = 0;
          const tempTargetIds = [];
          for (let i = 1; i < endDistance; i++) {
            const row = originalRow + dir.dr * i;
            const col = originalCol + dir.dc * i;
            const target = allUnits.find((u) => u.position.row === row && u.position.col === col);
            if (target && unit.isEnemy !== target.isEnemy) {
              const damage = Math.ceil(calculateDamage(unit, target) * 1.1);
              tempDamage += damage;
              tempTargetIds.push(target.id);
            }
          }
          if (tempDamage > bestDamage) {
            bestDamage = tempDamage;
            bestTargetIds = [...tempTargetIds];
            bestTargetPos = { row: endRow, col: endCol };
          }
        }
      }
      if (bestTargetPos && bestDamage > 0) {
        bestResult = {
          moveRow: originalRow,
          moveCol: originalCol,
          targetRow: bestTargetPos.row,
          targetCol: bestTargetPos.col,
          totalDamage: bestDamage,
          targetIds: bestTargetIds
        };
      }
      return bestResult;
    }
    if (unit.classType === "assassin") {
      const originalRow = unit.position.row;
      const originalCol = unit.position.col;
      let bestDamage = 0;
      let bestTargetIds = [];
      let bestTargetPos = null;
      let bestPosIsThunder = true;
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const distance = getDistance(unit.position, { row, col });
          if (distance <= 5 && distance > 0) {
            const hasUnit = allUnits.some((u) => u.position.row === row && u.position.col === col);
            if (!hasUnit && !isObstacle(row, col)) {
              let tempDamage = 0;
              const tempTargetIds = [];
              const directions = [
                { dr: -1, dc: 0 },
                { dr: 1, dc: 0 },
                { dr: 0, dc: -1 },
                { dr: 0, dc: 1 }
              ];
              for (const dir of directions) {
                const checkRow = row + dir.dr;
                const checkCol = col + dir.dc;
                const target = allUnits.find((u) => u.position.row === checkRow && u.position.col === checkCol && unit.isEnemy !== u.isEnemy);
                if (target) {
                  const damage = Math.ceil(calculateDamage(unit, target) * 1.3);
                  tempDamage += damage;
                  tempTargetIds.push(target.id);
                }
              }
              const isThunderPos = thunderAreas.some((t) => t.row === row && t.col === col);
              if (bestPosIsThunder && !isThunderPos) {
                bestDamage = tempDamage;
                bestTargetIds = [...tempTargetIds];
                bestTargetPos = { row, col };
                bestPosIsThunder = false;
              } else if (bestPosIsThunder === isThunderPos && tempDamage > bestDamage) {
                bestDamage = tempDamage;
                bestTargetIds = [...tempTargetIds];
                bestTargetPos = { row, col };
              } else if (bestTargetPos === null && tempDamage > 0) {
                bestDamage = tempDamage;
                bestTargetIds = [...tempTargetIds];
                bestTargetPos = { row, col };
                bestPosIsThunder = isThunderPos;
              }
            }
          }
        }
      }
      if (bestTargetPos && bestDamage > 0) {
        bestResult = {
          moveRow: originalRow,
          moveCol: originalCol,
          targetRow: bestTargetPos.row,
          targetCol: bestTargetPos.col,
          totalDamage: bestDamage,
          targetIds: bestTargetIds
        };
      }
      return bestResult;
    }
    for (const movePos of movePositions) {
      const originalRow = unit.position.row;
      const originalCol = unit.position.col;
      unit.position.row = movePos.row;
      unit.position.col = movePos.col;
      let totalDamage = 0;
      const targetIds = [];
      if (unit.classType === "mage") {
        for (let row = 0; row < MAP_ROWS; row++) {
          for (let col = 0; col < MAP_COLS; col++) {
            const distance = getDistance({ row: movePos.row, col: movePos.col }, { row, col });
            if (distance <= 2 && distance > 0) {
              const target = allUnits.find((u) => u.position.row === row && u.position.col === col && unit.isEnemy !== u.isEnemy);
              if (target) {
                const damage = Math.ceil(calculateDamage(unit, target) * 1.1);
                totalDamage += damage;
                targetIds.push(target.id);
              }
            }
          }
        }
      } else if (unit.classType === "archer") {
        let bestTargetId = null;
        let bestTargetPos = null;
        let maxDamage = 0;
        for (let row = 0; row < MAP_ROWS; row++) {
          for (let col = 0; col < MAP_COLS; col++) {
            const dist = getDistance({ row: movePos.row, col: movePos.col }, { row, col });
            if (dist <= 4 && dist > 0) {
              const target = allUnits.find((u) => u.position.row === row && u.position.col === col && unit.isEnemy !== u.isEnemy);
              if (target) {
                const damage = Math.floor(calculateDamage(unit, target) * 1.3);
                if (damage > maxDamage) {
                  maxDamage = damage;
                  bestTargetId = target.id;
                  bestTargetPos = { row, col };
                }
              }
            }
          }
        }
        if (bestTargetId && bestTargetPos) {
          targetIds.push(bestTargetId);
          totalDamage = maxDamage;
          if (!bestResult || totalDamage > bestResult.totalDamage) {
            bestResult = {
              moveRow: movePos.row,
              moveCol: movePos.col,
              targetRow: bestTargetPos.row,
              targetCol: bestTargetPos.col,
              totalDamage,
              targetIds: [...targetIds]
            };
          }
          targetIds.length = 0;
          totalDamage = 0;
        }
      } else if (unit.classType === "witch") {
        let bestHealValue = 0;
        let bestTargetId = null;
        let bestTargetPos = null;
        for (let row = 0; row < MAP_ROWS; row++) {
          for (let col = 0; col < MAP_COLS; col++) {
            const dist = getDistance({ row: movePos.row, col: movePos.col }, { row, col });
            if (dist <= 4 && dist > 0) {
              const target = allUnits.find((u) => u.position.row === row && u.position.col === col && unit.isEnemy === u.isEnemy);
              if (target) {
                const healAmount = unit.attack * 2;
                const missingHp = target.maxHp - target.hp;
                const healValue = Math.min(missingHp, healAmount);
                if (healValue > bestHealValue) {
                  bestHealValue = healValue;
                  bestTargetId = target.id;
                  bestTargetPos = { row, col };
                }
              }
            }
          }
        }
        let maxAttackDamage = 0;
        for (let row = 0; row < MAP_ROWS; row++) {
          for (let col = 0; col < MAP_COLS; col++) {
            const dist = getDistance({ row: movePos.row, col: movePos.col }, { row, col });
            if (dist <= unit.attackRange && dist > 0) {
              const target = allUnits.find((u) => u.position.row === row && u.position.col === col && unit.isEnemy !== u.isEnemy);
              if (target) {
                const damage = calculateDamage(unit, target);
                if (damage > maxAttackDamage) {
                  maxAttackDamage = damage;
                }
              }
            }
          }
        }
        if (bestTargetId && bestTargetPos && bestHealValue > maxAttackDamage) {
          targetIds.push(bestTargetId);
          totalDamage = bestHealValue;
          if (!bestResult || totalDamage > bestResult.totalDamage) {
            bestResult = {
              moveRow: movePos.row,
              moveCol: movePos.col,
              targetRow: bestTargetPos.row,
              targetCol: bestTargetPos.col,
              totalDamage,
              targetIds: [...targetIds]
            };
          }
          targetIds.length = 0;
          totalDamage = 0;
        }
      } else if (unit.classType === "warrior") {
        const healAmount = Math.ceil(unit.maxHp * 0.15);
        totalDamage = -healAmount;
      }
      unit.position.row = originalRow;
      unit.position.col = originalCol;
      if (targetIds.length > 0 && totalDamage > 0) {
        if (!bestResult || totalDamage > bestResult.totalDamage) {
          bestResult = {
            moveRow: movePos.row,
            moveCol: movePos.col,
            targetRow: movePos.row,
            targetCol: movePos.col,
            totalDamage,
            targetIds
          };
        }
      } else if (unit.classType === "warrior" && totalDamage < 0) {
        if (!bestResult || totalDamage < bestResult.totalDamage) {
          bestResult = {
            moveRow: movePos.row,
            moveCol: movePos.col,
            targetRow: movePos.row,
            targetCol: movePos.col,
            totalDamage: Math.abs(totalDamage),
            targetIds: []
          };
        }
      }
    }
    return bestResult;
  }
  function evaluateMoveAttackDamage(unit, allUnits, thunderAreas = []) {
    const movePositions = getAvailablePositions(allUnits, unit, unit.moveRange, thunderAreas);
    let bestResult = null;
    let bestResultIsThunder = true;
    for (const movePos of movePositions) {
      const originalRow = unit.position.row;
      const originalCol = unit.position.col;
      unit.position.row = movePos.row;
      unit.position.col = movePos.col;
      const attackPositions = getAttackablePositions(allUnits, unit);
      unit.position.row = originalRow;
      unit.position.col = originalCol;
      const movePosIsThunder = thunderAreas.some((t) => t.row === movePos.row && t.col === movePos.col);
      if (attackPositions.length > 0) {
        for (const attackPos of attackPositions) {
          if (bestResultIsThunder && !movePosIsThunder) {
            bestResult = {
              moveRow: movePos.row,
              moveCol: movePos.col,
              targetRow: attackPos.row,
              targetCol: attackPos.col,
              damage: attackPos.target.hp,
              targetId: attackPos.target.id
            };
            bestResultIsThunder = false;
          } else if (bestResultIsThunder === movePosIsThunder && (!bestResult || attackPos.target.hp < bestResult.damage)) {
            bestResult = {
              moveRow: movePos.row,
              moveCol: movePos.col,
              targetRow: attackPos.row,
              targetCol: attackPos.col,
              damage: attackPos.target.hp,
              targetId: attackPos.target.id
            };
          } else if (bestResult === null) {
            bestResult = {
              moveRow: movePos.row,
              moveCol: movePos.col,
              targetRow: attackPos.row,
              targetCol: attackPos.col,
              damage: attackPos.target.hp,
              targetId: attackPos.target.id
            };
            bestResultIsThunder = movePosIsThunder;
          }
        }
      }
    }
    return bestResult;
  }
  function findClosestEnemyPosition(unit, allUnits, thunderAreas = []) {
    const enemies = allUnits.filter((u) => unit.isEnemy !== u.isEnemy && u.hp > 0);
    if (enemies.length === 0) return null;
    let best = null;
    let bestIsThunder = true;
    const movePositions = getAvailablePositions(allUnits, unit, unit.moveRange, thunderAreas);
    for (const movePos of movePositions) {
      const movePosIsThunder = thunderAreas.some((t) => t.row === movePos.row && t.col === movePos.col);
      for (const enemy of enemies) {
        const dist = getDistance(movePos, enemy.position);
        if (bestIsThunder && !movePosIsThunder) {
          best = {
            row: movePos.row,
            col: movePos.col,
            distance: dist,
            targetId: enemy.id
          };
          bestIsThunder = false;
        } else if (bestIsThunder === movePosIsThunder && (!best || dist < best.distance)) {
          best = {
            row: movePos.row,
            col: movePos.col,
            distance: dist,
            targetId: enemy.id
          };
        } else if (best === null) {
          best = {
            row: movePos.row,
            col: movePos.col,
            distance: dist,
            targetId: enemy.id
          };
          bestIsThunder = movePosIsThunder;
        }
      }
    }
    return best;
  }
  function getSkillRangePositions(unit, units) {
    const positions = [];
    const centerRow = unit.position.row;
    const centerCol = unit.position.col;
    if (unit.classType === "mage") {
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const distance = getDistance(unit.position, { row, col });
          if (distance <= 2 && distance > 0) {
            const target = units.find((u) => u.position.row === row && u.position.col === col);
            if (target && unit.isEnemy !== target.isEnemy || isObstacle(row, col)) {
              positions.push({ row, col });
            }
          }
        }
      }
    } else if (unit.classType === "archer") {
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const distance = getDistance(unit.position, { row, col });
          if (distance <= 4 && distance > 0) {
            const target = units.find((u) => u.position.row === row && u.position.col === col);
            if (target && unit.isEnemy !== target.isEnemy || isObstacle(row, col)) {
              positions.push({ row, col });
            }
          }
        }
      }
    } else if (unit.classType === "knight") {
      const directions = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 }
      ];
      for (const dir of directions) {
        for (let i = 1; i <= unit.moveRange; i++) {
          const row = centerRow + dir.dr * i;
          const col = centerCol + dir.dc * i;
          if (!isValidPosition(row, col)) {
            break;
          }
          const unitAtPos = units.find((u) => u.position.row === row && u.position.col === col);
          if (!unitAtPos) {
            positions.push({ row, col });
          }
        }
      }
    } else if (unit.classType === "witch") {
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const distance = getDistance(unit.position, { row, col });
          if (distance <= 3 && distance > 0) {
            const target = units.find((u) => u.position.row === row && u.position.col === col);
            if (target && unit.isEnemy === target.isEnemy) {
              positions.push({ row, col });
            }
          }
        }
      }
    } else if (unit.classType === "warrior") {
      positions.push({ row: centerRow, col: centerCol });
    } else if (unit.classType === "assassin") {
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const distance = getDistance(unit.position, { row, col });
          if (distance <= 5 && distance > 0) {
            const hasUnit = units.some((u) => u.position.row === row && u.position.col === col);
            if (!hasUnit && !isObstacle(row, col)) {
              positions.push({ row, col });
            }
          }
        }
      }
    } else if (unit.classType === "architect") {
      const directions = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 }
      ];
      for (const dir of directions) {
        const row = centerRow + dir.dr;
        const col = centerCol + dir.dc;
        if (isValidPosition(row, col)) {
          const hasUnit = units.some((u) => u.position.row === row && u.position.col === col);
          if (!hasUnit) {
            positions.push({ row, col });
          }
        }
      }
    } else if (unit.classType === "strategist") {
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const distance = getDistance(unit.position, { row, col });
          if (distance <= 4 && distance > 0) {
            const hasUnit = units.some((u) => u.position.row === row && u.position.col === col);
            if (hasUnit || isObstacle(row, col)) {
              positions.push({ row, col });
            }
          }
        }
      }
    }
    return positions;
  }
  function useSkill(unit, targetPos, allUnits, skillTargets) {
    const results = {
      damage: [],
      healing: [],
      positionChange: null,
      removedObstacles: [],
      addedObstacles: []
    };
    if (unit.classType === "archer") {
      if (targetPos) {
        const target = allUnits.find((u) => u.position.row === targetPos.row && u.position.col === targetPos.col);
        if (target && unit.isEnemy !== target.isEnemy) {
          const damage = Math.floor(calculateDamage(unit, target) * 1.3);
          target.hp = Math.max(0, target.hp - damage);
          results.damage.push({ target, damage, killed: target.hp <= 0 });
        }
        if (isObstacle(targetPos.row, targetPos.col)) {
          if (removeObstacle(targetPos.row, targetPos.col)) {
            results.removedObstacles.push({ row: targetPos.row, col: targetPos.col });
          }
        }
      }
    } else if (unit.classType === "mage") {
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const distance = getDistance(unit.position, { row, col });
          if (distance <= 2 && distance > 0) {
            const target = allUnits.find((u) => u.position.row === row && u.position.col === col);
            if (target && unit.isEnemy !== target.isEnemy) {
              const damage = Math.ceil(calculateDamage(unit, target) * 1.1);
              target.hp = Math.max(0, target.hp - damage);
              results.damage.push({ target, damage, killed: target.hp <= 0 });
            }
            if (isObstacle(row, col)) {
              if (removeObstacle(row, col)) {
                results.removedObstacles.push({ row, col });
              }
            }
          }
        }
      }
    } else if (unit.classType === "knight" && targetPos) {
      const dr = targetPos.row - unit.position.row;
      const dc = targetPos.col - unit.position.col;
      let dirDr = 0;
      let dirDc = 0;
      if (dr !== 0) {
        dirDr = dr > 0 ? 1 : -1;
      } else if (dc !== 0) {
        dirDc = dc > 0 ? 1 : -1;
      }
      if (dirDr === 0 && dirDc === 0) {
        return results;
      }
      const distance = Math.abs(dr) + Math.abs(dc);
      if (distance > unit.moveRange) {
        return results;
      }
      const unitAtTarget = allUnits.find((u) => u.position.row === targetPos.row && u.position.col === targetPos.col && u.id !== unit.id);
      if (unitAtTarget) {
        return results;
      }
      for (let i = 1; i < distance; i++) {
        const row = unit.position.row + dirDr * i;
        const col = unit.position.col + dirDc * i;
        if (!isValidPosition(row, col)) {
          break;
        }
        if (isObstacle(row, col)) {
          if (removeObstacle(row, col)) {
            results.removedObstacles.push({ row, col });
          }
        }
        const target = allUnits.find((u) => u.position.row === row && u.position.col === col && u.id !== unit.id);
        if (target) {
          if (unit.isEnemy !== target.isEnemy) {
            const damage = Math.ceil(calculateDamage(unit, target) * 1.1);
            target.hp = Math.max(0, target.hp - damage);
            results.damage.push({ target, damage, killed: target.hp <= 0 });
          }
        }
      }
      unit.position.row = targetPos.row;
      unit.position.col = targetPos.col;
      results.positionChange = { row: targetPos.row, col: targetPos.col };
    } else if (unit.classType === "warrior") {
      const healAmount = Math.ceil(unit.maxHp * 0.15);
      unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
      unit.permanentAttackBonus += 10;
      unit.permanentDefenseBonus += 15;
      results.healing.push({ target: unit, amount: healAmount });
    } else if (unit.classType === "witch") {
      if (targetPos) {
        const target = allUnits.find((u) => u.position.row === targetPos.row && u.position.col === targetPos.col);
        if (target && unit.isEnemy === target.isEnemy) {
          const healAmount = unit.attack * 2;
          target.hp = Math.min(target.maxHp, target.hp + healAmount);
          results.healing.push({ target, amount: healAmount });
        }
      }
    } else if (unit.classType === "assassin") {
      if (targetPos) {
        const hasUnit = allUnits.some((u) => u.position.row === targetPos.row && u.position.col === targetPos.col);
        if (!hasUnit && !isObstacle(targetPos.row, targetPos.col)) {
          const distance = getDistance(unit.position, targetPos);
          if (distance <= 5) {
            unit.position.row = targetPos.row;
            unit.position.col = targetPos.col;
            results.positionChange = { row: targetPos.row, col: targetPos.col };
            const directions = [
              { dr: -1, dc: 0 },
              { dr: 1, dc: 0 },
              { dr: 0, dc: -1 },
              { dr: 0, dc: 1 }
            ];
            for (const dir of directions) {
              const row = targetPos.row + dir.dr;
              const col = targetPos.col + dir.dc;
              const target = allUnits.find((u) => u.position.row === row && u.position.col === col);
              if (target && unit.isEnemy !== target.isEnemy) {
                const damage = Math.ceil(calculateDamage(unit, target) * 1.3);
                target.hp = Math.max(0, target.hp - damage);
                results.damage.push({ target, damage, killed: target.hp <= 0 });
              }
              if (isObstacle(row, col)) {
                if (removeObstacle(row, col)) {
                  results.removedObstacles.push({ row, col });
                }
              }
            }
          }
        }
      }
    } else if (unit.classType === "architect") {
      const processedCount = Math.min(3, skillTargets.length);
      for (let i = 0; i < processedCount; i++) {
        const pos = skillTargets[i];
        const hasUnit = allUnits.some((u) => u.position.row === pos.row && u.position.col === pos.col);
        if (!hasUnit) {
          if (isObstacle(pos.row, pos.col)) {
            if (removeObstacle(pos.row, pos.col)) {
              results.removedObstacles.push({ row: pos.row, col: pos.col });
            }
          } else {
            if (addObstacle(pos.row, pos.col)) {
              results.addedObstacles.push({ row: pos.row, col: pos.col });
            }
          }
        }
      }
    } else if (unit.classType === "strategist") {
      if (skillTargets.length === 2) {
        const pos1 = skillTargets[0];
        const pos2 = skillTargets[1];
        const unit1 = allUnits.find((u) => u.position.row === pos1.row && u.position.col === pos1.col);
        const unit2 = allUnits.find((u) => u.position.row === pos2.row && u.position.col === pos2.col);
        const hasObstacle1 = isObstacle(pos1.row, pos1.col);
        const hasObstacle2 = isObstacle(pos2.row, pos2.col);
        const target1Name = unit1 ? `【${unit1.name}】` : "障碍物";
        const target2Name = unit2 ? `【${unit2.name}】` : "障碍物";
        if (unit1 && unit2) {
          const tempPos = { ...unit1.position };
          unit1.position = { ...unit2.position };
          unit2.position = tempPos;
        } else if (unit1 && hasObstacle2) {
          const tempPos = { ...unit1.position };
          unit1.position = { ...pos2 };
          removeObstacle(pos2.row, pos2.col);
          addObstacle(tempPos.row, tempPos.col);
          results.removedObstacles.push(pos2);
          results.addedObstacles.push(tempPos);
        } else if (hasObstacle1 && unit2) {
          const tempPos = { ...unit2.position };
          unit2.position = { ...pos1 };
          removeObstacle(pos1.row, pos1.col);
          addObstacle(tempPos.row, tempPos.col);
          results.removedObstacles.push(pos1);
          results.addedObstacles.push(tempPos);
        }
        results.swapInfo = { target1: target1Name, target2: target2Name };
      }
    }
    return results;
  }
  const useGameStore = /* @__PURE__ */ defineStore("game", () => {
    const gold = vue.ref(100);
    const heroes = vue.ref(createInitialHeroes());
    const selectedBattleUnits = vue.ref([]);
    const settings = vue.ref({
      enemyCount: 4,
      allyAiCount: 4
    });
    function initSettings() {
      const userAdjusted = uni.getStorageSync("settings_user_adjusted");
      if (!userAdjusted) {
        settings.value.enemyCount = 4;
        settings.value.allyAiCount = 4;
      } else {
        if (settings.value.enemyCount < 3 || settings.value.enemyCount > 10) {
          settings.value.enemyCount = 4;
        }
        if (settings.value.allyAiCount < 3 || settings.value.allyAiCount > 10) {
          settings.value.allyAiCount = 4;
        }
      }
    }
    const battle = vue.ref({
      units: [],
      currentTurn: "player",
      selectedUnit: null,
      turnNumber: 1,
      speed: 1,
      playerUnitsActed: 0,
      totalPlayerUnits: 0,
      gameResult: null,
      aiJoinPending: false,
      pendingAiSide: null,
      pendingAiClass: null,
      moveMode: false,
      attackMode: false,
      skillMode: false,
      skillTargets: [],
      summonCount: 0,
      maxSummons: 3,
      healingGrass: [],
      weather: "normal",
      snowAreas: []
    });
    const aiJoinMessage = vue.ref("");
    const showAiJoinMessage = vue.ref(false);
    const subtitle = vue.ref("");
    const battleLog = vue.ref([]);
    function addBattleLog(message) {
      const currentTurn = battle.value.turnNumber;
      const existingTurn = battleLog.value.find((entry) => entry.turn === currentTurn);
      if (existingTurn) {
        existingTurn.messages.push(message);
        const index = battleLog.value.findIndex((entry) => entry.turn === currentTurn);
        if (index !== -1) {
          battleLog.value[index] = { ...existingTurn };
        }
      } else {
        battleLog.value = [...battleLog.value, { turn: currentTurn, messages: [message] }];
      }
    }
    function clearBattleLog() {
      battleLog.value = [];
    }
    const totalPlayerUnits = vue.computed(() => {
      return battle.value.units.filter((u) => !u.isEnemy).length;
    });
    const totalEnemyUnits = vue.computed(() => {
      return battle.value.units.filter((u) => u.isEnemy).length;
    });
    const alivePlayerUnits = vue.computed(() => {
      return battle.value.units.filter((u) => !u.isEnemy && u.hp > 0);
    });
    const aliveEnemyUnits = vue.computed(() => {
      return battle.value.units.filter((u) => u.isEnemy && u.hp > 0);
    });
    function updateSettings(newSettings) {
      Object.assign(settings.value, newSettings);
      uni.setStorageSync("settings_user_adjusted", "true");
    }
    function addGold(amount) {
      gold.value += amount;
    }
    function deductGold(amount) {
      gold.value = Math.max(0, gold.value - amount);
    }
    function showSubtitle(text) {
      subtitle.value = text;
      setTimeout(() => {
        subtitle.value = "";
      }, 2e3);
    }
    function callReinforcements() {
      if (battle.value.summonCount >= battle.value.maxSummons) {
        showSubtitle("已达到最大支援次数");
        return;
      }
      const classes = ["warrior", "knight", "archer", "mage", "witch", "assassin"];
      const allyClass = classes[Math.floor(Math.random() * classes.length)];
      const enemyClass = classes[Math.floor(Math.random() * classes.length)];
      addAiUnitDirect("ally", allyClass);
      addAiUnitDirect("enemy", enemyClass);
      battle.value.summonCount++;
      showAiJoinMessage.value = true;
      aiJoinMessage.value = `我方AI【${CLASS_CONFIG[allyClass].name}】和敌方AI【${CLASS_CONFIG[enemyClass].name}】加入战斗！`;
      setTimeout(() => {
        showAiJoinMessage.value = false;
      }, 3e3);
    }
    function addAiUnitDirect(side, classType) {
      const emptyPositions = [];
      const isAlly = side === "ally";
      const startRow = isAlly ? MAP_ROWS - 2 : 0;
      const endRow = isAlly ? MAP_ROWS - 1 : 1;
      for (let r = startRow; r <= endRow; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          if (!isObstacle(r, c)) {
            const occupied = battle.value.units.some((u) => u.position.row === r && u.position.col === c);
            if (!occupied) {
              emptyPositions.push({ row: r, col: c });
            }
          }
        }
      }
      if (emptyPositions.length > 0) {
        const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        if (side === "ally") {
          const playerUnits = battle.value.units.filter((u) => !u.isEnemy);
          const avgLevel = playerUnits.length > 0 ? Math.floor(playerUnits.reduce((sum, u) => sum + u.level, 0) / playerUnits.length) : 1;
          const aiUnit = createAllyAI(classType, pos, avgLevel);
          battle.value.units.push(aiUnit);
        } else {
          const playerUnits = battle.value.units.filter((u) => !u.isEnemy);
          const avgLevel = playerUnits.length > 0 ? Math.floor(playerUnits.reduce((sum, u) => sum + u.level, 0) / playerUnits.length) : 1;
          const aiUnit = createEnemyUnit(classType, pos, avgLevel);
          battle.value.units.push(aiUnit);
        }
      }
    }
    function hireHero() {
      if (gold.value < 100) {
        return { success: false, message: "金币不足，无法雇佣新角色" };
      }
      const classes = ["warrior", "knight", "archer", "mage", "witch", "assassin", "architect", "strategist"];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const classConfig = CLASS_CONFIG[randomClass];
      deductGold(100);
      const newHero = {
        id: generateUnitId(),
        name: `新角色-${classConfig.name}`,
        classType: randomClass,
        isHero: true,
        isAI: false,
        isEnemy: false,
        level: 1,
        exp: 0,
        statPoints: 1,
        maxHp: classConfig.maxHp,
        hp: classConfig.maxHp,
        attack: classConfig.attack,
        defense: classConfig.defense,
        moveRange: classConfig.moveRange,
        attackRange: classConfig.attackRange,
        skill: {
          name: classConfig.skill.name,
          description: classConfig.skill.description,
          cooldown: classConfig.skill.cooldown,
          currentCooldown: 0
        },
        position: { row: 0, col: 0 },
        isDefending: false,
        hasActed: false,
        hasMoved: false,
        hasAttacked: false
      };
      heroes.value.push(newHero);
      return { success: true, message: "雇佣成功", hero: newHero };
    }
    function fireHero(heroId) {
      const hero = heroes.value.find((h) => h.id === heroId);
      if (!hero) {
        return { success: false, message: "角色不存在" };
      }
      if (hero.isHero) {
        return { success: false, message: "主角不可被解雇" };
      }
      const index = heroes.value.findIndex((h) => h.id === heroId);
      heroes.value.splice(index, 1);
      addGold(50);
      return { success: true, message: "解雇成功，获得50金币" };
    }
    function renameHero(heroId, newName) {
      const hero = heroes.value.find((h) => h.id === heroId);
      if (hero) {
        hero.name = newName;
        return { success: true, message: "重命名成功" };
      }
      return { success: false, message: "角色不存在" };
    }
    function changeHeroClass(heroIndex, newClass) {
      const hero = heroes.value[heroIndex];
      if (!hero) return;
      const oldLevel = hero.level;
      const oldExp = hero.exp;
      const oldStatPoints = hero.statPoints;
      const usedStatPoints = hero.usedStatPoints;
      const oldName = hero.name;
      const oldIsHero = hero.isHero;
      const newHero = createUnit({
        name: oldName,
        classType: newClass,
        isHero: oldIsHero,
        level: 1
      });
      newHero.level = oldLevel;
      newHero.exp = oldExp;
      newHero.statPoints = oldStatPoints + usedStatPoints;
      newHero.usedStatPoints = 0;
      for (let i = 2; i <= oldLevel; i++) {
        const stats = getLevelUpStats(newClass);
        newHero.maxHp = Math.round((newHero.maxHp + stats.hp) * 10) / 10;
        newHero.attack = Math.round((newHero.attack + stats.attack) * 10) / 10;
        newHero.defense = Math.round((newHero.defense + stats.defense) * 10) / 10;
      }
      newHero.hp = newHero.maxHp;
      heroes.value[heroIndex] = newHero;
    }
    function addHeroStat(heroIndex, statType, value) {
      const hero = heroes.value[heroIndex];
      if (hero && hero.statPoints > 0) {
        hero.statPoints--;
        hero.usedStatPoints++;
        if (statType === "maxHp") {
          hero.maxHp += value;
          hero.hp += value;
        } else if (statType === "attack") {
          hero.attack += value;
        } else if (statType === "defense") {
          hero.defense += value;
        }
      }
    }
    function awardExpToHeroes(exp) {
      heroes.value.forEach((hero) => {
        if (hero.level > 0 && selectedBattleUnits.value.includes(hero.id)) {
          hero.exp += exp;
          const expNeeded = getExpForLevel(hero.level);
          while (hero.exp >= expNeeded && hero.level < 10) {
            hero.exp -= expNeeded;
            hero.level++;
            const stats = getLevelUpStats(hero.classType, hero.level);
            hero.maxHp = Math.round((hero.maxHp + stats.hp) * 10) / 10;
            hero.hp = hero.maxHp;
            hero.attack = Math.round((hero.attack + stats.attack) * 10) / 10;
            hero.defense = Math.round((hero.defense + stats.defense) * 10) / 10;
            if (hero.isHero) {
              hero.statPoints += 1;
            }
          }
        }
      });
    }
    function toggleBattleUnitSelection(unitId) {
      const index = selectedBattleUnits.value.indexOf(unitId);
      if (index !== -1) {
        selectedBattleUnits.value.splice(index, 1);
      } else {
        if (selectedBattleUnits.value.length < 5) {
          selectedBattleUnits.value.push(unitId);
        }
      }
    }
    function clearBattleSelection() {
      selectedBattleUnits.value = [];
    }
    function startBattle() {
      if (selectedBattleUnits.value.length === 0) {
        return;
      }
      battle.value.units = [];
      clearBattleLog();
      const randomObstacles = generateRandomObstacles();
      setObstacles(randomObstacles);
      const healingGrass = generateHealingGrass(randomObstacles);
      battle.value.healingGrass = healingGrass;
      const classes = ["warrior", "knight", "archer", "mage", "witch", "assassin"];
      const BOTTOM_ROW = MAP_ROWS - 1;
      const TOP_ROW = 0;
      const usedPlayerCols = /* @__PURE__ */ new Set();
      const usedEnemyCols = /* @__PURE__ */ new Set();
      const getRandomCol = (used) => {
        let col;
        do {
          col = Math.floor(Math.random() * MAP_COLS);
        } while (used.has(col));
        used.add(col);
        return col;
      };
      const selectedHeroes = heroes.value.filter((h) => selectedBattleUnits.value.includes(h.id));
      const allPlayerUnits = [...selectedHeroes];
      const allyTotalCount = settings.value.allyAiCount || 5;
      const neededAiCount = allyTotalCount - selectedHeroes.length;
      if (neededAiCount > 0) {
        for (let i = 0; i < neededAiCount; i++) {
          const randomClass = classes[Math.floor(Math.random() * classes.length)];
          const avgLevel = selectedHeroes.length > 0 ? Math.floor(selectedHeroes.reduce((sum, h) => sum + h.level, 0) / selectedHeroes.length) : 1;
          const aiUnit = createAllyAI(randomClass, { row: 0, col: 0 }, avgLevel);
          allPlayerUnits.push(aiUnit);
        }
      }
      const avgPlayerLevel = allPlayerUnits.length > 0 ? Math.floor(allPlayerUnits.reduce((sum, u) => sum + u.level, 0) / allPlayerUnits.length) : 1;
      allPlayerUnits.forEach((hero) => {
        const battleHero = { ...hero };
        battleHero.id = generateUnitId();
        battleHero.position = { row: BOTTOM_ROW, col: getRandomCol(usedPlayerCols) };
        battleHero.hp = battleHero.maxHp;
        battleHero.hasActed = false;
        battleHero.hasMoved = false;
        battleHero.hasAttacked = false;
        battleHero.skill = { ...hero.skill, currentCooldown: 0 };
        battleHero.isDefending = false;
        battleHero.isEnemy = false;
        battleHero.permanentAttackBonus = 0;
        battleHero.permanentDefenseBonus = 0;
        battle.value.units.push(battleHero);
      });
      const realEnemyCount = settings.value.enemyCount || 3;
      for (let i = 0; i < realEnemyCount; i++) {
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        const position = {
          row: TOP_ROW,
          col: getRandomCol(usedEnemyCols)
        };
        const enemy = createEnemyUnit(randomClass, position, avgPlayerLevel);
        battle.value.units.push(enemy);
      }
      battle.value.currentTurn = "player";
      battle.value.selectedUnit = null;
      battle.value.turnNumber = 1;
      battle.value.speed = 1;
      battle.value.gameResult = null;
      battle.value.aiJoinPending = false;
      battle.value.pendingAiSide = null;
      battle.value.pendingAiClass = null;
      battle.value.moveMode = false;
      battle.value.attackMode = false;
      battle.value.skillMode = false;
      battle.value.skillTargets = [];
      battle.value.summonCount = 0;
      battle.value.maxSummons = 3;
      const playerUnits = battle.value.units.filter((u) => !u.isEnemy);
      battle.value.totalPlayerUnits = playerUnits.length;
      battle.value.playerUnitsActed = 0;
      updateWeather();
    }
    function selectUnit(unitId) {
      const unit = battle.value.units.find((u) => u.id === unitId);
      if (unit && battle.value.currentTurn === "player") {
        if (!unit.isEnemy && !unit.hasActed && !unit.isAI) {
          battle.value.selectedUnit = unit;
          battle.value.moveMode = false;
          battle.value.attackMode = false;
          battle.value.skillMode = false;
          battle.value.skillTargets = [];
        } else if (unit.isEnemy) {
          battle.value.selectedUnit = unit;
          battle.value.moveMode = false;
          battle.value.attackMode = false;
          battle.value.skillMode = false;
          battle.value.skillTargets = [];
        } else if (!unit.isEnemy && unit.hasActed && !unit.isAI) {
          battle.value.selectedUnit = unit;
          battle.value.moveMode = false;
          battle.value.attackMode = false;
          battle.value.skillMode = false;
          battle.value.skillTargets = [];
        } else if (!unit.isEnemy && unit.isAI) {
          battle.value.selectedUnit = unit;
          battle.value.moveMode = false;
          battle.value.attackMode = false;
          battle.value.skillMode = false;
          battle.value.skillTargets = [];
        }
      }
    }
    function deselectUnit() {
      battle.value.selectedUnit = null;
      battle.value.moveMode = false;
      battle.value.attackMode = false;
      battle.value.skillMode = false;
      battle.value.skillTargets = [];
    }
    function moveUnit(unitId, row, col) {
      const unit = battle.value.units.find((u) => u.id === unitId);
      if (unit) {
        const occupied = battle.value.units.some((u) => u.id !== unitId && u.position.row === row && u.position.col === col);
        if (occupied) {
          return;
        }
        unit.position = { row, col };
        unit.hasMoved = true;
        if (unit.hasAttacked) {
          unit.hasActed = true;
        }
        battle.value.moveMode = false;
        const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === row && g.col === col);
        if (grassIndex !== -1) {
          const healAmount = Math.ceil(unit.maxHp * 0.3);
          unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
          battle.value.healingGrass.splice(grassIndex, 1);
          showSubtitle(`我方【${unit.name}】服用了草药，回复${healAmount}点生命值！`);
          addBattleLog(`我方【${unit.name}】服用了草药，回复${healAmount}点生命值！`);
        }
      }
    }
    function setAttackMode(enabled) {
      if (enabled) {
        battle.value.attackMode = true;
        battle.value.moveMode = false;
        battle.value.skillMode = false;
        battle.value.skillTargets = [];
      } else {
        battle.value.attackMode = false;
      }
    }
    function setSkillMode(enabled) {
      if (enabled && battle.value.selectedUnit && battle.value.selectedUnit.skill.currentCooldown === 0) {
        battle.value.skillMode = true;
        battle.value.moveMode = false;
        battle.value.attackMode = false;
        const isArchitectOrStrategist = battle.value.selectedUnit.classType === "architect" || battle.value.selectedUnit.classType === "strategist";
        if (!isArchitectOrStrategist) {
          battle.value.skillTargets = getSkillRangePositions(battle.value.selectedUnit, battle.value.units);
        } else {
          battle.value.skillTargets = [];
        }
      } else {
        battle.value.skillMode = false;
        battle.value.skillTargets = [];
      }
    }
    function attackTarget(targetId) {
      if (!battle.value.selectedUnit) return;
      const attacker = battle.value.selectedUnit;
      const target = battle.value.units.find((u) => u.id === targetId);
      if (target && attacker.isEnemy !== target.isEnemy) {
        const damage = calculateDamage(attacker, target);
        target.hp = Math.max(0, target.hp - damage);
        attacker.hasAttacked = true;
        if (attacker.hasMoved) {
          attacker.hasActed = true;
        }
        const side = attacker.isEnemy ? "敌方" : attacker.isHero ? "我方主角" : "我方";
        const targetSide = target.isEnemy ? "敌方" : target.isHero ? "我方主角" : "我方";
        const classConfig = CLASS_CONFIG[attacker.classType];
        const targetClassConfig = CLASS_CONFIG[target.classType];
        const attackerName = attacker.isHero ? attacker.name : classConfig.name;
        const targetName = target.isHero ? target.name : targetClassConfig.name;
        let logMessage = `${side}【${attackerName}】对${targetSide}【${targetName}】使用【普通攻击】，造成 ${damage} 点伤害`;
        if (target.hp <= 0) {
          battle.value.units = battle.value.units.filter((u) => u.id !== targetId);
          const defeatMessage = `${targetSide}【${targetName}】被击败！`;
          logMessage += `，${defeatMessage}`;
          showSubtitle(defeatMessage);
        } else {
          showSubtitle(logMessage);
        }
        addBattleLog(logMessage);
        checkBattleEnd();
      }
      deselectUnit();
    }
    function attackObstacle(row, col) {
      if (!battle.value.selectedUnit) return;
      const attacker = battle.value.selectedUnit;
      const { removed, generateGrass } = removeObstacleWithGrassChance(row, col);
      if (removed) {
        attacker.hasAttacked = true;
        if (attacker.hasMoved) {
          attacker.hasActed = true;
        }
        const side = attacker.isEnemy ? "敌方" : attacker.isHero ? "我方主角" : "我方";
        const classConfig = CLASS_CONFIG[attacker.classType];
        const attackerName = attacker.isHero ? attacker.name : classConfig.name;
        if (generateGrass) {
          battle.value.healingGrass = [...battle.value.healingGrass, { row, col }];
          showSubtitle(`${side}【${attackerName}】清除了障碍物，获得了草药！`);
          addBattleLog(`${side}【${attackerName}】清除了障碍物，获得了草药！`);
        } else {
          showSubtitle(`${side}【${attackerName}】清除了障碍物`);
          addBattleLog(`${side}【${attackerName}】清除了障碍物`);
        }
      }
      deselectUnit();
    }
    function useSkillTarget(targetPos) {
      if (!battle.value.selectedUnit) return;
      const unit = battle.value.selectedUnit;
      if (unit.classType === "architect") {
        const existingIndex = battle.value.skillTargets.findIndex((t) => t.row === targetPos.row && t.col === targetPos.col);
        if (existingIndex !== -1) {
          battle.value.skillTargets = battle.value.skillTargets.filter((_, i) => i !== existingIndex);
        } else if (battle.value.skillTargets.length < 3) {
          battle.value.skillTargets.push(targetPos);
        }
        return;
      }
      if (unit.classType === "strategist") {
        const existingIndex = battle.value.skillTargets.findIndex((t) => t.row === targetPos.row && t.col === targetPos.col);
        if (existingIndex !== -1) {
          battle.value.skillTargets = battle.value.skillTargets.filter((_, i) => i !== existingIndex);
        } else if (battle.value.skillTargets.length < 2) {
          battle.value.skillTargets.push(targetPos);
        }
        return;
      }
      battle.value.healingGrass.length;
      unit.hp;
      const results = useSkill(unit, targetPos, battle.value.units, battle.value.skillTargets);
      let usedGrass = false;
      if (results.positionChange) {
        unit.hasMoved = true;
        const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === results.positionChange.row && g.col === results.positionChange.col);
        if (grassIndex !== -1) {
          const healAmount = Math.ceil(unit.maxHp * 0.3);
          unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
          battle.value.healingGrass.splice(grassIndex, 1);
          usedGrass = true;
        }
      }
      const killedUnits = [];
      results.damage.forEach((d) => {
        if (d.killed) {
          const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
          const targetClassConfig = CLASS_CONFIG[d.target.classType];
          const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
          killedUnits.push({ target: d.target, targetSide, targetName });
          battle.value.units = battle.value.units.filter((u) => u.id !== d.target.id);
        }
      });
      unit.skill.currentCooldown = unit.skill.cooldown;
      unit.hasAttacked = true;
      if (unit.hasMoved) {
        unit.hasActed = true;
      }
      const side = unit.isEnemy ? "敌方" : unit.isHero ? "我方主角" : "我方";
      const classConfig = CLASS_CONFIG[unit.classType];
      const attackerName = unit.isHero ? unit.name : classConfig.name;
      let subtitleText = "";
      let battleLogText = "";
      if (results.damage.length > 0) {
        const damageParts = [];
        results.damage.forEach((d) => {
          const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
          const targetClassConfig = CLASS_CONFIG[d.target.classType];
          const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
          damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`);
        });
        subtitleText = `${side}【${attackerName}】使用技能【${classConfig.skill.name}】，${damageParts.join("，")}`;
        battleLogText = subtitleText;
        if (killedUnits.length > 0) {
          killedUnits.forEach((k) => {
            const defeatMessage2 = `${k.targetSide}【${k.targetName}】被击败！`;
            battleLogText += `，${defeatMessage2}`;
          });
          const lastKilled = killedUnits[killedUnits.length - 1];
          const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`;
          showSubtitle(defeatMessage);
        } else {
          showSubtitle(subtitleText);
        }
      } else if (results.healing.length > 0) {
        const heal = results.healing[0];
        const targetSide = heal.target.isEnemy ? "敌方" : heal.target.isHero ? "我方主角" : "我方";
        const targetClassConfig = CLASS_CONFIG[heal.target.classType];
        const targetName = heal.target.isHero ? heal.target.name : targetClassConfig.name;
        subtitleText = `${side}【${attackerName}】对${targetSide}【${targetName}】使用技能【${classConfig.skill.name}】`;
        battleLogText = subtitleText;
        showSubtitle(subtitleText);
      } else {
        subtitleText = `${side}【${attackerName}】使用技能【${classConfig.skill.name}】`;
        battleLogText = subtitleText;
        showSubtitle(subtitleText);
      }
      if (results.removedObstacles.length > 0) {
        const grassPositions = [];
        results.removedObstacles.forEach((pos) => {
          if (Math.random() < 0.25) {
            grassPositions.push(pos);
            battle.value.healingGrass = [...battle.value.healingGrass, pos];
          }
        });
        if (grassPositions.length > 0) {
          subtitleText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
          battleLogText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
        } else {
          subtitleText += `，清除了${results.removedObstacles.length}个障碍物`;
          battleLogText += `，清除了${results.removedObstacles.length}个障碍物`;
        }
      }
      if (usedGrass) {
        const healAmount = Math.ceil(unit.maxHp * 0.3);
        subtitleText += `，服用了草药，回复${healAmount}点生命值！`;
        battleLogText += `，服用了草药，回复${healAmount}点生命值！`;
      }
      addBattleLog(battleLogText);
      showSubtitle(subtitleText);
      checkBattleEnd();
      deselectUnit();
    }
    function confirmArchitectSkill() {
      if (!battle.value.selectedUnit || battle.value.selectedUnit.classType !== "architect") return;
      const unit = battle.value.selectedUnit;
      const results = useSkill(unit, null, battle.value.units, battle.value.skillTargets);
      unit.skill.currentCooldown = unit.skill.cooldown;
      unit.hasAttacked = true;
      if (unit.hasMoved) {
        unit.hasActed = true;
      }
      const side = unit.isEnemy ? "敌方" : unit.isHero ? "我方主角" : "我方";
      const classConfig = CLASS_CONFIG[unit.classType];
      const attackerName = unit.isHero ? unit.name : classConfig.name;
      let subtitleText = `${side}【${attackerName}】使用技能【${classConfig.skill.name}】`;
      let battleLogText = subtitleText;
      if (results.addedObstacles.length > 0 || results.removedObstacles.length > 0) {
        const actions = [];
        if (results.addedObstacles.length > 0) {
          actions.push(`生成了${results.addedObstacles.length}个障碍物`);
        }
        if (results.removedObstacles.length > 0) {
          actions.push(`清除了${results.removedObstacles.length}个障碍物`);
        }
        subtitleText += `，${actions.join("，")}`;
        battleLogText += `，${actions.join("，")}`;
      }
      addBattleLog(battleLogText);
      showSubtitle(subtitleText);
      battle.value.skillTargets = [];
      checkBattleEnd();
      deselectUnit();
    }
    function confirmStrategistSkill() {
      if (!battle.value.selectedUnit || battle.value.selectedUnit.classType !== "strategist") return;
      const unit = battle.value.selectedUnit;
      if (battle.value.skillTargets.length !== 2) {
        showSubtitle("请选择2个目标");
        return;
      }
      const results = useSkill(unit, null, battle.value.units, battle.value.skillTargets);
      unit.skill.currentCooldown = unit.skill.cooldown;
      unit.hasAttacked = true;
      if (unit.hasMoved) {
        unit.hasActed = true;
      }
      const side = unit.isEnemy ? "敌方" : unit.isHero ? "我方主角" : "我方";
      const classConfig = CLASS_CONFIG[unit.classType];
      const attackerName = unit.isHero ? unit.name : classConfig.name;
      let subtitleText = `${side}【${attackerName}】使用技能【${classConfig.skill.name}】`;
      let battleLogText = subtitleText;
      if (results.swapInfo) {
        subtitleText += `，交换了${results.swapInfo.target1}和${results.swapInfo.target2}的位置`;
        battleLogText += `，交换了${results.swapInfo.target1}和${results.swapInfo.target2}的位置`;
      } else {
        const pos1 = battle.value.skillTargets[0];
        const pos2 = battle.value.skillTargets[1];
        const pos1Desc = `(${pos1.row + 1},${pos1.col + 1})`;
        const pos2Desc = `(${pos2.row + 1},${pos2.col + 1})`;
        subtitleText += `，交换了${pos1Desc}和${pos2Desc}的位置`;
        battleLogText += `，交换了${pos1Desc}和${pos2Desc}的位置`;
      }
      addBattleLog(battleLogText);
      showSubtitle(subtitleText);
      battle.value.skillTargets = [];
      checkBattleEnd();
      deselectUnit();
    }
    function defend() {
      if (!battle.value.selectedUnit) return;
      const unit = battle.value.selectedUnit;
      unit.isDefending = true;
      unit.hasAttacked = true;
      if (unit.hasMoved) {
        unit.hasActed = true;
      }
      const side = unit.isEnemy ? "敌方" : unit.isHero ? "我方主角" : "我方";
      const classConfig = CLASS_CONFIG[unit.classType];
      const attackerName = unit.isHero ? unit.name : classConfig.name;
      const isSkill = unit.classType === "warrior";
      const actionName = isSkill ? "【" + classConfig.skill.name + "】" : "【原地防御】";
      const logMessage = `${side}【${attackerName}】使用技能${actionName}`;
      showSubtitle(logMessage);
      addBattleLog(logMessage);
      deselectUnit();
    }
    function markUnitActed(unitId) {
      const unit = battle.value.units.find((u) => u.id === unitId);
      if (unit) {
        unit.hasActed = true;
        unit.hasMoved = true;
        unit.hasAttacked = true;
      }
    }
    async function endPlayerTurn() {
      formatAppLog("log", "at stores/gameStore.ts:910", "endPlayerTurn called, currentTurn:", battle.value.currentTurn);
      if (battle.value.currentTurn !== "player") {
        formatAppLog("log", "at stores/gameStore.ts:912", "Not player turn, returning");
        return;
      }
      battle.value.selectedUnit = null;
      battle.value.moveMode = false;
      battle.value.attackMode = false;
      battle.value.skillMode = false;
      battle.value.skillTargets = [];
      battle.value.units.forEach((u) => {
        u.isDefending = false;
      });
      const allyAIUnits = battle.value.units.filter((u) => !u.isEnemy && u.isAI && !u.hasActed && u.hp > 0);
      formatAppLog("log", "at stores/gameStore.ts:927", "Ally AI units to act:", allyAIUnits.length);
      const speed = battle.value.speed;
      for (const allyAI of allyAIUnits) {
        formatAppLog("log", "at stores/gameStore.ts:932", "Executing AI action for:", allyAI.name);
        await new Promise((resolve) => setTimeout(resolve, 660 / speed));
        executeAllyAIAction(allyAI);
        const unitIndex = battle.value.units.findIndex((u) => u.id === allyAI.id);
        if (unitIndex !== -1) {
          battle.value.units[unitIndex] = { ...battle.value.units[unitIndex] };
        }
      }
      battle.value.currentTurn = "enemy";
      formatAppLog("log", "at stores/gameStore.ts:943", "Turn changed to enemy, executing enemy turn");
      await executeEnemyTurn();
    }
    function executeAllyAIAction(allyAI) {
      const enemyUnits = battle.value.units.filter((u) => u.isEnemy && u.hp > 0);
      if (enemyUnits.length === 0) return;
      const isInSnow = isInSnowArea(allyAI.position.row, allyAI.position.col);
      const isInThunder = isInThunderArea(allyAI.position.row, allyAI.position.col);
      if (allyAI.classType === "warrior") {
        if ((isInSnow || isInThunder) && !isInSnow) {
          const movePositions = getAvailablePositions(battle.value.units, allyAI, allyAI.moveRange, battle.value.thunderAreas);
          let safePosition = null;
          for (const pos of movePositions) {
            const posIsThunder = battle.value.thunderAreas.some((t) => t.row === pos.row && t.col === pos.col);
            const posIsSnow = isInSnowArea(pos.row, pos.col);
            if (!posIsThunder && !posIsSnow) {
              safePosition = pos;
              break;
            }
          }
          if (safePosition) {
            const occupied = battle.value.units.some((u) => u.id !== allyAI.id && u.position.row === safePosition.row && u.position.col === safePosition.col);
            if (!occupied) {
              allyAI.position = { row: safePosition.row, col: safePosition.col };
              const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === safePosition.row && g.col === safePosition.col);
              if (grassIndex !== -1) {
                const healAmount = Math.ceil(allyAI.maxHp * 0.3);
                allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount);
                battle.value.healingGrass.splice(grassIndex, 1);
                showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
                addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
              }
            }
          }
        }
        const hpPercent = allyAI.hp / allyAI.maxHp;
        if (hpPercent < 0.8 && allyAI.skill.currentCooldown === 0 && !isInSnow) {
          useSkill(allyAI, null, battle.value.units, []);
          allyAI.skill.currentCooldown = allyAI.skill.cooldown;
          allyAI.hasActed = true;
          const logMsg = `我方【${allyAI.name}】使用技能【${allyAI.skill.name}】`;
          showSubtitle(logMsg);
          addBattleLog(logMsg);
          return;
        }
        const attackResult2 = evaluateMoveAttackDamage(allyAI, battle.value.units, battle.value.thunderAreas);
        if (attackResult2 && !isInSnow) {
          const occupied = battle.value.units.some((u) => u.id !== allyAI.id && u.position.row === attackResult2.moveRow && u.position.col === attackResult2.moveCol);
          if (!occupied) {
            allyAI.position = { row: attackResult2.moveRow, col: attackResult2.moveCol };
            const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === attackResult2.moveRow && g.col === attackResult2.moveCol);
            if (grassIndex !== -1) {
              const healAmount = Math.ceil(allyAI.maxHp * 0.3);
              allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount);
              battle.value.healingGrass.splice(grassIndex, 1);
              showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
              addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
            }
          }
          const target = battle.value.units.find((u) => u.id === attackResult2.targetId);
          if (target) {
            const damage = calculateDamage(allyAI, target);
            target.hp = Math.max(0, target.hp - damage);
            if (target.hp <= 0) {
              battle.value.units = battle.value.units.filter((u) => u.id !== target.id);
            }
            const classConfig = CLASS_CONFIG[allyAI.classType];
            const attackLogMsg = `我方【${allyAI.name}】对敌方【${classConfig.name}】使用【普通攻击】，造成 ${damage} 点伤害`;
            showSubtitle(attackLogMsg);
            addBattleLog(attackLogMsg);
          }
          allyAI.hasActed = true;
          return;
        }
        const closestResult2 = findClosestEnemyPosition(allyAI, battle.value.units, battle.value.thunderAreas);
        if (closestResult2 && !isInSnow) {
          const occupied = battle.value.units.some((u) => u.id !== allyAI.id && u.position.row === closestResult2.row && u.position.col === closestResult2.col);
          if (!occupied) {
            allyAI.position = { row: closestResult2.row, col: closestResult2.col };
            const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === closestResult2.row && g.col === closestResult2.col);
            if (grassIndex !== -1) {
              const healAmount = Math.ceil(allyAI.maxHp * 0.3);
              allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount);
              battle.value.healingGrass.splice(grassIndex, 1);
              showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
              addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
            }
          }
        }
        allyAI.isDefending = true;
        allyAI.hasActed = true;
        const defendLogMsg2 = `我方【${allyAI.name}】使用【原地防御】`;
        showSubtitle(defendLogMsg2);
        addBattleLog(defendLogMsg2);
        return;
      }
      const skillResult = evaluateMoveSkillDamage(allyAI, battle.value.units, battle.value.thunderAreas);
      if (skillResult && !isInSnow) {
        if (allyAI.classType === "assassin" || allyAI.classType === "knight") {
          if (skillResult.moveRow !== allyAI.position.row || skillResult.moveCol !== allyAI.position.col) {
            const occupied2 = battle.value.units.some((u) => u.id !== allyAI.id && u.position.row === skillResult.moveRow && u.position.col === skillResult.moveCol);
            if (!occupied2) {
              allyAI.position = { row: skillResult.moveRow, col: skillResult.moveCol };
              const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === skillResult.moveRow && g.col === skillResult.moveCol);
              if (grassIndex !== -1) {
                const healAmount = Math.ceil(allyAI.maxHp * 0.3);
                allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount);
                battle.value.healingGrass.splice(grassIndex, 1);
                showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
                addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
              }
            }
          }
          const results2 = useSkill(allyAI, { row: skillResult.targetRow, col: skillResult.targetCol }, battle.value.units, []);
          if (results2.positionChange) {
            const unitIndex = battle.value.units.findIndex((u) => u.id === allyAI.id);
            if (unitIndex !== -1) {
              battle.value.units[unitIndex] = { ...allyAI };
            }
          }
          const killedUnits2 = [];
          results2.damage.forEach((d) => {
            if (d.killed) {
              const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
              const targetClassConfig = CLASS_CONFIG[d.target.classType];
              const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
              killedUnits2.push({ target: d.target, targetSide, targetName });
              battle.value.units = battle.value.units.filter((u) => u.id !== d.target.id);
            }
          });
          allyAI.skill.currentCooldown = allyAI.skill.cooldown;
          allyAI.hasActed = true;
          const side2 = "我方";
          const classConfig2 = CLASS_CONFIG[allyAI.classType];
          let subtitleText2 = "";
          let battleLogText2 = "";
          if (results2.damage.length > 0) {
            const damageParts = [];
            results2.damage.forEach((d) => {
              const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
              const targetClassConfig = CLASS_CONFIG[d.target.classType];
              const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
              damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`);
            });
            subtitleText2 = `${side2}【${allyAI.name}】使用技能【${classConfig2.skill.name}】，${damageParts.join("，")}`;
            battleLogText2 = subtitleText2;
            if (killedUnits2.length > 0) {
              killedUnits2.forEach((k) => {
                const defeatMessage2 = `${k.targetSide}【${k.targetName}】被击败！`;
                battleLogText2 += `，${defeatMessage2}`;
              });
              const lastKilled = killedUnits2[killedUnits2.length - 1];
              const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`;
              showSubtitle(defeatMessage);
            } else {
              showSubtitle(subtitleText2);
            }
          } else if (results2.healing.length > 0) {
            const heal = results2.healing[0];
            const targetSide = heal.target.isEnemy ? "敌方" : heal.target.isHero ? "我方主角" : "我方";
            const targetClassConfig = CLASS_CONFIG[heal.target.classType];
            const targetName = heal.target.isHero ? heal.target.name : targetClassConfig.name;
            subtitleText2 = `${side2}【${allyAI.name}】对${targetSide}【${targetName}】使用技能【${classConfig2.skill.name}】，回复 ${heal.amount} 点生命值`;
            battleLogText2 = subtitleText2;
            showSubtitle(subtitleText2);
          } else {
            subtitleText2 = `${side2}【${allyAI.name}】使用技能【${classConfig2.skill.name}】`;
            battleLogText2 = subtitleText2;
            showSubtitle(subtitleText2);
          }
          if (results2.removedObstacles.length > 0) {
            const grassPositions = [];
            results2.removedObstacles.forEach((pos) => {
              if (Math.random() < 0.3) {
                grassPositions.push(pos);
                battle.value.healingGrass = [...battle.value.healingGrass, pos];
              }
            });
            if (grassPositions.length > 0) {
              subtitleText2 += `，清除了${results2.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
              battleLogText2 += `，清除了${results2.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
            } else {
              subtitleText2 += `，清除了${results2.removedObstacles.length}个障碍物`;
              battleLogText2 += `，清除了${results2.removedObstacles.length}个障碍物`;
            }
          }
          addBattleLog(battleLogText2);
          checkBattleEnd();
          return;
        }
        const occupied = battle.value.units.some((u) => u.id !== allyAI.id && u.position.row === skillResult.moveRow && u.position.col === skillResult.moveCol);
        if (!occupied) {
          allyAI.position = { row: skillResult.moveRow, col: skillResult.moveCol };
          const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === skillResult.moveRow && g.col === skillResult.moveCol);
          if (grassIndex !== -1) {
            const healAmount = Math.ceil(allyAI.maxHp * 0.3);
            allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount);
            battle.value.healingGrass.splice(grassIndex, 1);
            showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
            addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
          }
        }
        const results = useSkill(allyAI, { row: skillResult.targetRow, col: skillResult.targetCol }, battle.value.units, []);
        if (results.positionChange) {
          const unitIndex = battle.value.units.findIndex((u) => u.id === allyAI.id);
          if (unitIndex !== -1) {
            battle.value.units[unitIndex] = { ...allyAI };
          }
        }
        const killedUnits = [];
        results.damage.forEach((d) => {
          if (d.killed) {
            const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
            const targetClassConfig = CLASS_CONFIG[d.target.classType];
            const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
            killedUnits.push({ target: d.target, targetSide, targetName });
            battle.value.units = battle.value.units.filter((u) => u.id !== d.target.id);
          }
        });
        allyAI.skill.currentCooldown = allyAI.skill.cooldown;
        allyAI.hasActed = true;
        const side = "我方";
        const classConfig = CLASS_CONFIG[allyAI.classType];
        let subtitleText = "";
        let battleLogText = "";
        if (results.damage.length > 0) {
          const damageParts = [];
          results.damage.forEach((d) => {
            const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
            const targetClassConfig = CLASS_CONFIG[d.target.classType];
            const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
            damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`);
          });
          subtitleText = `${side}【${allyAI.name}】使用技能【${classConfig.skill.name}】，${damageParts.join("，")}`;
          battleLogText = subtitleText;
          if (killedUnits.length > 0) {
            killedUnits.forEach((k) => {
              const defeatMessage2 = `${k.targetSide}【${k.targetName}】被击败！`;
              battleLogText += `，${defeatMessage2}`;
            });
            const lastKilled = killedUnits[killedUnits.length - 1];
            const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`;
            showSubtitle(defeatMessage);
          } else {
            showSubtitle(subtitleText);
          }
        } else if (results.healing.length > 0) {
          const heal = results.healing[0];
          const targetSide = heal.target.isEnemy ? "敌方" : heal.target.isHero ? "我方主角" : "我方";
          const targetClassConfig = CLASS_CONFIG[heal.target.classType];
          const targetName = heal.target.isHero ? heal.target.name : targetClassConfig.name;
          subtitleText = `${side}【${allyAI.name}】对${targetSide}【${targetName}】使用技能【${classConfig.skill.name}】，回复 ${heal.amount} 点生命值`;
          battleLogText = subtitleText;
          showSubtitle(subtitleText);
        } else {
          subtitleText = `${side}【${allyAI.name}】使用技能【${classConfig.skill.name}】`;
          battleLogText = subtitleText;
          showSubtitle(subtitleText);
        }
        if (results.removedObstacles.length > 0) {
          const grassPositions = [];
          results.removedObstacles.forEach((pos) => {
            if (Math.random() < 0.3) {
              grassPositions.push(pos);
              battle.value.healingGrass = [...battle.value.healingGrass, pos];
            }
          });
          if (grassPositions.length > 0) {
            subtitleText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
            battleLogText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
          } else {
            subtitleText += `，清除了${results.removedObstacles.length}个障碍物`;
            battleLogText += `，清除了${results.removedObstacles.length}个障碍物`;
          }
        }
        addBattleLog(battleLogText);
        checkBattleEnd();
        return;
      }
      const attackResult = evaluateMoveAttackDamage(allyAI, battle.value.units, battle.value.thunderAreas);
      if (attackResult && !isInSnow) {
        const occupied = battle.value.units.some((u) => u.id !== allyAI.id && u.position.row === attackResult.moveRow && u.position.col === attackResult.moveCol);
        if (!occupied) {
          allyAI.position = { row: attackResult.moveRow, col: attackResult.moveCol };
          const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === attackResult.moveRow && g.col === attackResult.moveCol);
          if (grassIndex !== -1) {
            const healAmount = Math.ceil(allyAI.maxHp * 0.3);
            allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount);
            battle.value.healingGrass.splice(grassIndex, 1);
            showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
            addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
          }
        }
        const target = battle.value.units.find((u) => u.id === attackResult.targetId);
        if (target) {
          const damage = calculateDamage(allyAI, target);
          target.hp = Math.max(0, target.hp - damage);
          CLASS_CONFIG[allyAI.classType];
          const targetClassConfig = CLASS_CONFIG[target.classType];
          const targetName = targetClassConfig.name;
          let attackLogMsg = `我方【${allyAI.name}】对敌方【${targetName}】使用【普通攻击】，造成 ${damage} 点伤害`;
          if (target.hp <= 0) {
            battle.value.units = battle.value.units.filter((u) => u.id !== target.id);
            const defeatMessage = `敌方【${targetName}】被击败！`;
            attackLogMsg += `，${defeatMessage}`;
            showSubtitle(defeatMessage);
          } else {
            showSubtitle(attackLogMsg);
          }
          addBattleLog(attackLogMsg);
        }
        allyAI.hasActed = true;
        return;
      }
      const closestResult = findClosestEnemyPosition(allyAI, battle.value.units, battle.value.thunderAreas);
      if (closestResult && !isInSnow) {
        allyAI.position = { row: closestResult.row, col: closestResult.col };
        const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === closestResult.row && g.col === closestResult.col);
        if (grassIndex !== -1) {
          const healAmount = Math.ceil(allyAI.maxHp * 0.3);
          allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount);
          battle.value.healingGrass.splice(grassIndex, 1);
          showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
          addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`);
        }
      }
      allyAI.isDefending = true;
      allyAI.hasActed = true;
      const defendLogMsg = `我方【${allyAI.name}】使用【原地防御】`;
      showSubtitle(defendLogMsg);
      addBattleLog(defendLogMsg);
    }
    async function executeEnemyTurn() {
      formatAppLog("log", "at stores/gameStore.ts:1350", "executeEnemyTurn called");
      const enemyUnits = battle.value.units.filter((u) => u.isEnemy && !u.hasActed && u.hp > 0);
      formatAppLog("log", "at stores/gameStore.ts:1352", "Enemy units to act:", enemyUnits.length);
      const playerUnits = battle.value.units.filter((u) => !u.isEnemy && u.hp > 0);
      formatAppLog("log", "at stores/gameStore.ts:1355", "Player units alive:", playerUnits.length);
      const speed = battle.value.speed;
      for (const enemy of enemyUnits) {
        if (playerUnits.length === 0) break;
        await new Promise((resolve) => setTimeout(resolve, 660 / speed));
        const alivePlayerUnits2 = battle.value.units.filter((u) => !u.isEnemy && u.hp > 0);
        if (alivePlayerUnits2.length === 0) break;
        const isInSnow = isInSnowArea(enemy.position.row, enemy.position.col);
        if (enemy.classType === "warrior") {
          const attackResult2 = evaluateMoveAttackDamage(enemy, battle.value.units, battle.value.thunderAreas);
          if (attackResult2 && !isInSnow) {
            const occupied = battle.value.units.some((u) => u.id !== enemy.id && u.position.row === attackResult2.moveRow && u.position.col === attackResult2.moveCol);
            if (!occupied) {
              enemy.position = { row: attackResult2.moveRow, col: attackResult2.moveCol };
              const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === attackResult2.moveRow && g.col === attackResult2.moveCol);
              if (grassIndex !== -1) {
                const healAmount = Math.ceil(enemy.maxHp * 0.3);
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
                battle.value.healingGrass.splice(grassIndex, 1);
                showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
                addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
              }
            }
            await new Promise((resolve) => setTimeout(resolve, 300 / speed));
            const target = battle.value.units.find((u) => u.id === attackResult2.targetId);
            if (target) {
              const damage = calculateDamage(enemy, target);
              target.hp = Math.max(0, target.hp - damage);
              if (target.hp <= 0) {
                battle.value.units = battle.value.units.filter((u) => u.id !== target.id);
              }
              const targetSide = target.isHero ? "我方主角" : "我方";
              const targetClassConfig = CLASS_CONFIG[target.classType];
              const targetName = target.isHero ? target.name : targetClassConfig.name;
              const enemyAttackLog = `敌方【${enemy.name}】对${targetSide}【${targetName}】使用【普通攻击】，造成 ${damage} 点伤害`;
              showSubtitle(enemyAttackLog);
              addBattleLog(enemyAttackLog);
            }
            enemy.hasActed = true;
            continue;
          }
          if (enemy.hp < enemy.maxHp && enemy.skill.currentCooldown === 0 && !isInSnow) {
            const healAmount = Math.ceil(enemy.maxHp * 0.15);
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
            enemy.defense += 3;
            enemy.defenseBuffDuration = 2;
            enemy.skill.currentCooldown = enemy.skill.cooldown;
            enemy.hasActed = true;
            const logMsg1 = `敌方【${enemy.name}】使用技能【${enemy.skill.name}】`;
            showSubtitle(logMsg1);
            addBattleLog(logMsg1);
            continue;
          }
          const closestResult2 = findClosestEnemyPosition(enemy, battle.value.units, battle.value.thunderAreas);
          if (closestResult2 && !isInSnow) {
            const occupied = battle.value.units.some((u) => u.id !== enemy.id && u.position.row === closestResult2.row && u.position.col === closestResult2.col);
            if (!occupied) {
              enemy.position = { row: closestResult2.row, col: closestResult2.col };
              const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === closestResult2.row && g.col === closestResult2.col);
              if (grassIndex !== -1) {
                const healAmount = Math.ceil(enemy.maxHp * 0.3);
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
                battle.value.healingGrass.splice(grassIndex, 1);
                showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
                addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
              }
              await new Promise((resolve) => setTimeout(resolve, 300 / speed));
            }
          }
          enemy.isDefending = true;
          enemy.hasActed = true;
          const enemyDefendLog2 = `敌方【${enemy.name}】使用【原地防御】`;
          showSubtitle(enemyDefendLog2);
          addBattleLog(enemyDefendLog2);
          continue;
        }
        const skillResult = evaluateMoveSkillDamage(enemy, battle.value.units, battle.value.thunderAreas);
        if (skillResult && !isInSnow) {
          if (enemy.classType === "assassin" || enemy.classType === "knight") {
            if (skillResult.moveRow !== enemy.position.row || skillResult.moveCol !== enemy.position.col) {
              const occupied2 = battle.value.units.some((u) => u.id !== enemy.id && u.position.row === skillResult.moveRow && u.position.col === skillResult.moveCol);
              if (!occupied2) {
                enemy.position = { row: skillResult.moveRow, col: skillResult.moveCol };
                const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === skillResult.moveRow && g.col === skillResult.moveCol);
                if (grassIndex !== -1) {
                  const healAmount = Math.ceil(enemy.maxHp * 0.3);
                  enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
                  battle.value.healingGrass.splice(grassIndex, 1);
                  showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
                  addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
                }
                await new Promise((resolve) => setTimeout(resolve, 300 / speed));
              }
            }
            const results2 = useSkill(enemy, { row: skillResult.targetRow, col: skillResult.targetCol }, battle.value.units, []);
            if (results2.positionChange) {
              const unitIndex2 = battle.value.units.findIndex((u) => u.id === enemy.id);
              if (unitIndex2 !== -1) {
                battle.value.units[unitIndex2] = { ...enemy };
              }
            }
            const killedUnits2 = [];
            results2.damage.forEach((d) => {
              if (d.killed) {
                const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
                const targetClassConfig = CLASS_CONFIG[d.target.classType];
                const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
                killedUnits2.push({ target: d.target, targetSide, targetName });
                battle.value.units = battle.value.units.filter((u) => u.id !== d.target.id);
              }
            });
            enemy.skill.currentCooldown = enemy.skill.cooldown;
            enemy.hasActed = true;
            const side2 = "敌方";
            const classConfig2 = CLASS_CONFIG[enemy.classType];
            let subtitleText2 = "";
            let battleLogText2 = "";
            if (results2.damage.length > 0) {
              const damageParts = [];
              results2.damage.forEach((d) => {
                const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
                const targetClassConfig = CLASS_CONFIG[d.target.classType];
                const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
                damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`);
              });
              subtitleText2 = `${side2}【${enemy.name}】使用技能【${classConfig2.skill.name}】，${damageParts.join("，")}`;
              battleLogText2 = subtitleText2;
              if (killedUnits2.length > 0) {
                killedUnits2.forEach((k) => {
                  const defeatMessage2 = `${k.targetSide}【${k.targetName}】被击败！`;
                  battleLogText2 += `，${defeatMessage2}`;
                });
                const lastKilled = killedUnits2[killedUnits2.length - 1];
                const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`;
                showSubtitle(defeatMessage);
              } else {
                showSubtitle(subtitleText2);
              }
            } else if (results2.healing.length > 0) {
              const heal = results2.healing[0];
              const targetSide = heal.target.isEnemy ? "敌方" : "我方";
              const targetClassConfig = CLASS_CONFIG[heal.target.classType];
              const targetName = targetClassConfig.name;
              subtitleText2 = `${side2}【${enemy.name}】对${targetSide}【${targetName}】使用技能【${classConfig2.skill.name}】，回复 ${heal.amount} 点生命值`;
              battleLogText2 = subtitleText2;
              showSubtitle(subtitleText2);
            } else {
              subtitleText2 = `${side2}【${enemy.name}】使用技能【${classConfig2.skill.name}】`;
              battleLogText2 = subtitleText2;
              showSubtitle(subtitleText2);
            }
            if (results2.removedObstacles.length > 0) {
              const grassPositions = [];
              results2.removedObstacles.forEach((pos) => {
                if (Math.random() < 0.3) {
                  grassPositions.push(pos);
                  battle.value.healingGrass = [...battle.value.healingGrass, pos];
                }
              });
              if (grassPositions.length > 0) {
                subtitleText2 += `，清除了${results2.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
                battleLogText2 += `，清除了${results2.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
              } else {
                subtitleText2 += `，清除了${results2.removedObstacles.length}个障碍物`;
                battleLogText2 += `，清除了${results2.removedObstacles.length}个障碍物`;
              }
            }
            addBattleLog(battleLogText2);
            checkBattleEnd();
            continue;
          }
          const occupied = battle.value.units.some((u) => u.id !== enemy.id && u.position.row === skillResult.moveRow && u.position.col === skillResult.moveCol);
          if (!occupied) {
            enemy.position = { row: skillResult.moveRow, col: skillResult.moveCol };
            const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === skillResult.moveRow && g.col === skillResult.moveCol);
            if (grassIndex !== -1) {
              const healAmount = Math.ceil(enemy.maxHp * 0.3);
              enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
              battle.value.healingGrass.splice(grassIndex, 1);
              showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
              addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
            }
          }
          const results = useSkill(enemy, { row: skillResult.targetRow, col: skillResult.targetCol }, battle.value.units, []);
          if (results.positionChange) {
            const unitIndex2 = battle.value.units.findIndex((u) => u.id === enemy.id);
            if (unitIndex2 !== -1) {
              battle.value.units[unitIndex2] = { ...enemy };
            }
          }
          const killedUnits = [];
          results.damage.forEach((d) => {
            if (d.killed) {
              const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
              const targetClassConfig = CLASS_CONFIG[d.target.classType];
              const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
              killedUnits.push({ target: d.target, targetSide, targetName });
              battle.value.units = battle.value.units.filter((u) => u.id !== d.target.id);
            }
          });
          enemy.skill.currentCooldown = enemy.skill.cooldown;
          enemy.hasActed = true;
          const side = "敌方";
          const classConfig = CLASS_CONFIG[enemy.classType];
          let subtitleText = "";
          let battleLogText = "";
          if (results.damage.length > 0) {
            const damageParts = [];
            results.damage.forEach((d) => {
              const targetSide = d.target.isEnemy ? "敌方" : d.target.isHero ? "我方主角" : "我方";
              const targetClassConfig = CLASS_CONFIG[d.target.classType];
              const targetName = d.target.isHero ? d.target.name : targetClassConfig.name;
              damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`);
            });
            subtitleText = `${side}【${enemy.name}】使用技能【${classConfig.skill.name}】，${damageParts.join("，")}`;
            battleLogText = subtitleText;
            if (killedUnits.length > 0) {
              killedUnits.forEach((k) => {
                const defeatMessage2 = `${k.targetSide}【${k.targetName}】被击败！`;
                battleLogText += `，${defeatMessage2}`;
              });
              const lastKilled = killedUnits[killedUnits.length - 1];
              const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`;
              showSubtitle(defeatMessage);
            } else {
              showSubtitle(subtitleText);
            }
          } else if (results.healing.length > 0) {
            const heal = results.healing[0];
            const targetSide = heal.target.isEnemy ? "敌方" : "我方";
            const targetClassConfig = CLASS_CONFIG[heal.target.classType];
            const targetName = targetClassConfig.name;
            subtitleText = `${side}【${enemy.name}】对${targetSide}【${targetName}】使用技能【${classConfig.skill.name}】，回复 ${heal.amount} 点生命值`;
            battleLogText = subtitleText;
            showSubtitle(subtitleText);
          } else {
            subtitleText = `${side}【${enemy.name}】使用技能【${classConfig.skill.name}】`;
            battleLogText = subtitleText;
            showSubtitle(subtitleText);
          }
          if (results.removedObstacles.length > 0) {
            const grassPositions = [];
            results.removedObstacles.forEach((pos) => {
              if (Math.random() < 0.3) {
                grassPositions.push(pos);
                battle.value.healingGrass = [...battle.value.healingGrass, pos];
              }
            });
            if (grassPositions.length > 0) {
              subtitleText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
              battleLogText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`;
            } else {
              subtitleText += `，清除了${results.removedObstacles.length}个障碍物`;
              battleLogText += `，清除了${results.removedObstacles.length}个障碍物`;
            }
          }
          addBattleLog(battleLogText);
          checkBattleEnd();
          continue;
        }
        const attackResult = evaluateMoveAttackDamage(enemy, battle.value.units, battle.value.thunderAreas);
        if (attackResult && !isInSnow) {
          const occupied = battle.value.units.some((u) => u.id !== enemy.id && u.position.row === attackResult.moveRow && u.position.col === attackResult.moveCol);
          if (!occupied) {
            enemy.position = { row: attackResult.moveRow, col: attackResult.moveCol };
            const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === attackResult.moveRow && g.col === attackResult.moveCol);
            if (grassIndex !== -1) {
              const healAmount = Math.ceil(enemy.maxHp * 0.3);
              enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
              battle.value.healingGrass.splice(grassIndex, 1);
              showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
              addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
            }
            await new Promise((resolve) => setTimeout(resolve, 300 / speed));
          }
          const target = battle.value.units.find((u) => u.id === attackResult.targetId);
          if (target) {
            const damage = calculateDamage(enemy, target);
            target.hp = Math.max(0, target.hp - damage);
            const targetSide = target.isHero ? "我方主角" : "我方";
            const targetClassConfig = CLASS_CONFIG[target.classType];
            const targetName = target.isHero ? target.name : targetClassConfig.name;
            let enemyAttackLog = `敌方【${enemy.name}】对${targetSide}【${targetName}】使用【普通攻击】，造成 ${damage} 点伤害`;
            if (target.hp <= 0) {
              battle.value.units = battle.value.units.filter((u) => u.id !== target.id);
              const defeatMessage = `${targetSide}【${targetName}】被击败！`;
              enemyAttackLog += `，${defeatMessage}`;
              showSubtitle(defeatMessage);
            } else {
              showSubtitle(enemyAttackLog);
            }
            addBattleLog(enemyAttackLog);
          }
          enemy.hasActed = true;
          continue;
        }
        const closestResult = findClosestEnemyPosition(enemy, battle.value.units, battle.value.thunderAreas);
        if (closestResult && !isInSnow) {
          enemy.position = { row: closestResult.row, col: closestResult.col };
          const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === closestResult.row && g.col === closestResult.col);
          if (grassIndex !== -1) {
            const healAmount = Math.ceil(enemy.maxHp * 0.3);
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
            battle.value.healingGrass.splice(grassIndex, 1);
            showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
            addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`);
          }
          await new Promise((resolve) => setTimeout(resolve, 300 / speed));
        }
        enemy.isDefending = true;
        enemy.hasActed = true;
        const enemyDefendLog = `敌方【${enemy.name}】使用【原地防御】`;
        showSubtitle(enemyDefendLog);
        addBattleLog(enemyDefendLog);
        const unitIndex = battle.value.units.findIndex((u) => u.id === enemy.id);
        if (unitIndex !== -1) {
          battle.value.units[unitIndex] = { ...battle.value.units[unitIndex] };
        }
        showSubtitle(`敌方【${enemy.name}】使用【原地防御】`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500 / speed));
      endEnemyTurn();
    }
    function endEnemyTurn() {
      applyThunderDamage();
      battle.value.turnNumber++;
      battle.value.currentTurn = "player";
      updateWeather();
      battle.value.units.forEach((u) => {
        u.hasActed = false;
        u.hasMoved = false;
        u.hasAttacked = false;
        u.isDefending = false;
        if (u.skill.currentCooldown > 0) {
          u.skill.currentCooldown--;
        }
      });
      const playerUnits = battle.value.units.filter((u) => !u.isEnemy);
      battle.value.totalPlayerUnits = playerUnits.length;
      battle.value.playerUnitsActed = 0;
      checkBattleEnd();
    }
    function addAiUnit() {
      if (!battle.value.pendingAiSide || !battle.value.pendingAiClass) return;
      const emptyPositions = [];
      const isAlly = battle.value.pendingAiSide === "ally";
      const startRow = isAlly ? MAP_ROWS - 2 : 0;
      const endRow = isAlly ? MAP_ROWS - 1 : 1;
      for (let r = startRow; r <= endRow; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          if (!isObstacle(r, c)) {
            const occupied = battle.value.units.some((u) => u.position.row === r && u.position.col === c);
            if (!occupied) {
              emptyPositions.push({ row: r, col: c });
            }
          }
        }
      }
      if (emptyPositions.length > 0) {
        const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        if (battle.value.pendingAiSide === "ally") {
          const aiUnit = createAllyAI(battle.value.pendingAiClass, pos);
          battle.value.units.push(aiUnit);
          showAiJoinMessage.value = true;
          aiJoinMessage.value = `己方AI（${CLASS_CONFIG[battle.value.pendingAiClass].name}）加入战斗`;
        } else {
          const aiUnit = createEnemyUnit(battle.value.pendingAiClass, pos);
          battle.value.units.push(aiUnit);
          showAiJoinMessage.value = true;
          aiJoinMessage.value = `敌方AI（${CLASS_CONFIG[battle.value.pendingAiClass].name}）加入战斗`;
        }
        battle.value.summonCount++;
        setTimeout(() => {
          showAiJoinMessage.value = false;
        }, 3e3);
      }
      battle.value.aiJoinPending = false;
      battle.value.pendingAiSide = null;
      battle.value.pendingAiClass = null;
    }
    function checkBattleEnd() {
      const alivePlayer = battle.value.units.filter((u) => !u.isEnemy && u.hp > 0);
      const aliveEnemy = battle.value.units.filter((u) => u.isEnemy && u.hp > 0);
      if (aliveEnemy.length === 0) {
        const initialEnemyCount = settings.value.enemyCount;
        const summonedCount = battle.value.summonCount;
        const totalEnemiesSpawned = initialEnemyCount + summonedCount;
        const killedEnemies = totalEnemiesSpawned - aliveEnemy.length;
        const exp = 20 + killedEnemies * 10;
        const gold2 = 50 + killedEnemies * 5;
        addGold(gold2);
        awardExpToHeroes(exp);
        battle.value.gameResult = "victory";
        showSubtitle("战斗胜利！获得金币：" + gold2 + "，所有存活我方角色获得经验值：" + exp);
        return "victory";
      }
      if (alivePlayer.length === 0) {
        addGold(20);
        awardExpToHeroes(20);
        battle.value.gameResult = "defeat";
        showSubtitle("战斗失败...参战角色获得经验值：20，获得金币：20");
        return "defeat";
      }
      return null;
    }
    function setSpeed(speed) {
      battle.value.speed = speed;
    }
    function clearBattle() {
      battle.value.units = [];
      battle.value.selectedUnit = null;
      battle.value.currentTurn = "player";
      battle.value.turnNumber = 1;
      battle.value.gameResult = null;
      battle.value.summonCount = 0;
      battle.value.weather = "normal";
      battle.value.snowAreas = [];
      battle.value.thunderAreas = [];
    }
    function generateSnowAreas(areaCount) {
      const snowAreas = [];
      const usedCenters = [];
      for (let i = 0; i < areaCount; i++) {
        let centerRow;
        let centerCol;
        let attempts = 0;
        do {
          centerRow = 1 + Math.floor(Math.random() * (MAP_ROWS - 2));
          centerCol = 1 + Math.floor(Math.random() * (MAP_COLS - 2));
          attempts++;
        } while (attempts < 50 && (isObstacle(centerRow, centerCol) || usedCenters.some((c) => Math.abs(c.row - centerRow) < 3 && Math.abs(c.col - centerCol) < 3)));
        if (attempts < 50) {
          usedCenters.push({ row: centerRow, col: centerCol });
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const r = centerRow + dr;
              const c = centerCol + dc;
              if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS && !isObstacle(r, c)) {
                if (!snowAreas.some((s) => s.row === r && s.col === c)) {
                  snowAreas.push({ row: r, col: c });
                }
              }
            }
          }
        }
      }
      return snowAreas;
    }
    function generateThunderAreas(areaType) {
      const thunderAreas = [];
      let count;
      let size;
      if (areaType === "small") {
        count = 6;
        size = 1;
      } else if (areaType === "medium") {
        count = 3;
        size = 2;
      } else {
        count = 5;
        size = 2;
      }
      for (let i = 0; i < count; i++) {
        let startRow;
        let startCol;
        let attempts = 0;
        do {
          startRow = Math.floor(Math.random() * (MAP_ROWS - size + 1));
          startCol = Math.floor(Math.random() * (MAP_COLS - size + 1));
          attempts++;
        } while (attempts < 50 && thunderAreas.some((t) => t.row >= startRow && t.row < startRow + size && t.col >= startCol && t.col < startCol + size));
        if (attempts < 50) {
          for (let dr = 0; dr < size; dr++) {
            for (let dc = 0; dc < size; dc++) {
              const r = startRow + dr;
              const c = startCol + dc;
              if (!isObstacle(r, c) && !thunderAreas.some((t) => t.row === r && t.col === c)) {
                thunderAreas.push({ row: r, col: c });
              }
            }
          }
        }
      }
      return thunderAreas;
    }
    function updateWeather() {
      const rand = Math.random();
      if (rand < 0.1) {
        battle.value.weather = "snow";
        battle.value.snowAreas = generateSnowAreas(1);
        battle.value.thunderAreas = [];
        showSubtitle("❄️ 小雪！雪地区域的角色无法移动！");
        addBattleLog("❄️ 本回合是小雪天");
      } else if (rand < 0.3) {
        battle.value.weather = "snow";
        battle.value.snowAreas = generateSnowAreas(2);
        battle.value.thunderAreas = [];
        showSubtitle("❄️ 中雪！雪地区域的角色无法移动！");
        addBattleLog("❄️ 本回合是中雪天");
      } else if (rand < 0.4) {
        battle.value.weather = "snow";
        battle.value.snowAreas = generateSnowAreas(3);
        battle.value.thunderAreas = [];
        showSubtitle("❄️ 大雪！雪地区域的角色无法移动！");
        addBattleLog("❄️ 本回合是大雪天");
      } else if (rand < 0.5) {
        battle.value.weather = "thunder";
        battle.value.snowAreas = [];
        battle.value.thunderAreas = generateThunderAreas("small");
        showSubtitle("⚡ 小雷雨！小心雷电格子！");
        addBattleLog("⚡ 本回合是小雷雨");
      } else if (rand < 0.7) {
        battle.value.weather = "thunder";
        battle.value.snowAreas = [];
        battle.value.thunderAreas = generateThunderAreas("medium");
        showSubtitle("⚡ 中雷雨！小心雷电格子！");
        addBattleLog("⚡ 本回合是中雷雨");
      } else if (rand < 0.8) {
        battle.value.weather = "thunder";
        battle.value.snowAreas = [];
        battle.value.thunderAreas = generateThunderAreas("large");
        showSubtitle("⚡ 大雷雨！小心雷电格子！");
        addBattleLog("⚡ 本回合是大雷雨");
      } else {
        battle.value.weather = "normal";
        battle.value.snowAreas = [];
        battle.value.thunderAreas = [];
      }
    }
    function isInThunderArea(row, col) {
      return battle.value.thunderAreas.some((t) => t.row === row && t.col === col);
    }
    function applyThunderDamage() {
      battle.value.units.forEach((unit, index) => {
        if (isInThunderArea(unit.position.row, unit.position.col) && unit.hp > 0) {
          const damage = Math.floor(unit.maxHp * 0.5);
          unit.hp = Math.max(0, unit.hp - damage);
          const side = unit.isEnemy ? "敌方" : "我方";
          const subtitle2 = `⚡ ${side}【${unit.name}】被雷电击中！受到 ${damage} 点伤害！`;
          showSubtitle(subtitle2);
          addBattleLog(subtitle2);
          battle.value.units[index] = { ...unit };
        }
      });
    }
    function isInSnowArea(row, col) {
      return battle.value.snowAreas.some((s) => s.row === row && s.col === col);
    }
    function resetGame() {
      gold.value = 100;
      heroes.value = createInitialHeroes();
      settings.value = {
        enemyCount: 4,
        allyAiCount: 4
      };
      uni.removeStorageSync("settings_user_adjusted");
      clearBattle();
    }
    function getSaveFolderPath() {
      try {
        if (typeof plus !== "undefined" && plus.io) {
          const downloadDir = plus.io.convertLocalFileSystemURL("_downloads");
          return `${downloadDir}/zhanqi`;
        }
      } catch (e) {
        formatAppLog("log", "at stores/gameStore.ts:2069", "获取保存路径失败:", e);
      }
      return "_doc/zhanqi";
    }
    function ensureSaveFolderExists(folderPath) {
      return new Promise((resolve) => {
        try {
          if (typeof plus !== "undefined" && plus.io) {
            plus.io.resolveLocalFileSystemURL(
              folderPath,
              () => {
                resolve(true);
              },
              () => {
                plus.io.requestFileSystem(
                  plus.io.PRIVATE_WDOC,
                  (fs) => {
                    const path = folderPath.replace(plus.io.convertLocalFileSystemURL("_downloads"), "");
                    fs.root.getDirectory(
                      path,
                      { create: true },
                      () => resolve(true),
                      () => resolve(false)
                    );
                  },
                  () => resolve(false)
                );
              }
            );
          } else {
            resolve(true);
          }
        } catch (e) {
          formatAppLog("log", "at stores/gameStore.ts:2108", "创建文件夹失败:", e);
          resolve(false);
        }
      });
    }
    async function saveToFileSystem(saveData, fileName) {
      try {
        const folderPath = getSaveFolderPath();
        const folderExists = await ensureSaveFolderExists(folderPath);
        if (!folderExists) {
          formatAppLog("log", "at stores/gameStore.ts:2120", "无法创建保存文件夹");
          return false;
        }
        if (typeof plus !== "undefined" && plus.io) {
          const fullPath = `${folderPath}/${fileName}`;
          return new Promise((resolve) => {
            plus.io.requestFileSystem(
              plus.io.PUBLIC_DOWNLOADS,
              (fs) => {
                fs.root.getDirectory(
                  "zhanqi",
                  { create: true },
                  (dirEntry) => {
                    dirEntry.getFile(
                      fileName,
                      { create: true, exclusive: false },
                      (fileEntry) => {
                        fileEntry.createWriter(
                          (writer) => {
                            writer.onwriteend = () => {
                              formatAppLog("log", "at stores/gameStore.ts:2143", `存档已保存到文件系统: ${fullPath}`);
                              resolve(true);
                            };
                            writer.onerror = (e) => {
                              formatAppLog("log", "at stores/gameStore.ts:2147", "写入文件失败:", e);
                              resolve(false);
                            };
                            writer.write(JSON.stringify(saveData));
                          },
                          (e) => {
                            formatAppLog("log", "at stores/gameStore.ts:2153", "创建文件写入器失败:", e);
                            resolve(false);
                          }
                        );
                      },
                      (e) => {
                        formatAppLog("log", "at stores/gameStore.ts:2159", "创建文件失败:", e);
                        resolve(false);
                      }
                    );
                  },
                  (e) => {
                    formatAppLog("log", "at stores/gameStore.ts:2165", "创建 zhanqi 文件夹失败:", e);
                    resolve(false);
                  }
                );
              },
              (e) => {
                formatAppLog("log", "at stores/gameStore.ts:2171", "请求文件系统失败:", e);
                resolve(false);
              }
            );
          });
        }
        return false;
      } catch (e) {
        formatAppLog("log", "at stores/gameStore.ts:2179", "保存到文件系统失败:", e);
        return false;
      }
    }
    async function loadFromFileSystem(fileName) {
      try {
        if (typeof plus !== "undefined" && plus.io) {
          return new Promise((resolve) => {
            plus.io.requestFileSystem(
              plus.io.PUBLIC_DOWNLOADS,
              (fs) => {
                fs.root.getFile(
                  `zhanqi/${fileName}`,
                  { create: false },
                  (fileEntry) => {
                    fileEntry.file(
                      (file) => {
                        const reader = new FileReader();
                        reader.onloadend = (e) => {
                          try {
                            const content = e.target.result;
                            const data = JSON.parse(content);
                            formatAppLog("log", "at stores/gameStore.ts:2203", `从文件系统加载存档成功: zhanqi/${fileName}`);
                            resolve(data);
                          } catch (parseError) {
                            formatAppLog("log", "at stores/gameStore.ts:2206", "解析存档文件失败:", parseError);
                            resolve(null);
                          }
                        };
                        reader.onerror = () => {
                          formatAppLog("log", "at stores/gameStore.ts:2211", "读取文件失败");
                          resolve(null);
                        };
                        reader.readAsText(file);
                      },
                      () => {
                        formatAppLog("log", "at stores/gameStore.ts:2217", "获取文件失败");
                        resolve(null);
                      }
                    );
                  },
                  () => {
                    formatAppLog("log", "at stores/gameStore.ts:2223", "文件不存在");
                    resolve(null);
                  }
                );
              },
              () => {
                formatAppLog("log", "at stores/gameStore.ts:2229", "请求文件系统失败");
                resolve(null);
              }
            );
          });
        }
        return null;
      } catch (e) {
        formatAppLog("log", "at stores/gameStore.ts:2237", "从文件系统加载失败:", e);
        return null;
      }
    }
    function getSaveFileName(slotIndex) {
      return `gameSave_${slotIndex}.json`;
    }
    async function getSaveSlotsInfo() {
      const slotsInfo = [];
      for (let i = 0; i < 3; i++) {
        let hasData = false;
        let saveName;
        let savedAt;
        const fileData = await loadFromFileSystem(getSaveFileName(i));
        if (fileData) {
          hasData = true;
          saveName = fileData.saveName;
          savedAt = fileData.savedAt;
        } else {
          const localData = uni.getStorageSync(`gameSave_${i}`);
          if (localData) {
            try {
              const data = JSON.parse(localData);
              hasData = true;
              saveName = data.saveName;
              savedAt = data.savedAt;
            } catch (e) {
            }
          }
        }
        slotsInfo.push({
          index: i,
          hasData,
          saveName,
          savedAt
        });
      }
      return slotsInfo;
    }
    const SAVE_VERSION = 2;
    function migrateSaveData(data) {
      if (!data.version || data.version < 1) {
        formatAppLog("log", "at stores/gameStore.ts:2293", "迁移存档数据到版本 1...");
        if (!data.heroes) {
          data.heroes = [];
        }
        if (!data.gold) {
          data.gold = 100;
        }
        if (!data.settings) {
          data.settings = {};
        }
        data.version = 1;
      }
      if (data.version < 2) {
        formatAppLog("log", "at stores/gameStore.ts:2308", "迁移存档数据到版本 2...");
        if (data.heroes && Array.isArray(data.heroes)) {
          data.heroes = data.heroes.map((hero) => {
            if (!hero.classType) hero.classType = "warrior";
            if (!hero.level) hero.level = 1;
            if (!hero.exp) hero.exp = 0;
            if (!hero.hp) hero.hp = hero.maxHp || 100;
            if (!hero.maxHp) hero.maxHp = 100;
            if (!hero.attack) hero.attack = 10;
            if (!hero.defense) hero.defense = 10;
            if (!hero.statPoints) hero.statPoints = 1;
            if (!hero.usedStatPoints) hero.usedStatPoints = 0;
            if (!hero.skill) {
              hero.skill = {
                name: "",
                description: "",
                cooldown: 0,
                currentCooldown: 0
              };
            }
            return hero;
          });
        }
        data.version = 2;
      }
      return data;
    }
    async function saveGame(saveName) {
      try {
        const now2 = /* @__PURE__ */ new Date();
        const saveData = {
          version: SAVE_VERSION,
          gold: gold.value,
          heroes: heroes.value,
          settings: settings.value,
          savedAt: `${now2.getFullYear()}${String(now2.getMonth() + 1).padStart(2, "0")}${String(now2.getDate()).padStart(2, "0")} ${String(now2.getHours()).padStart(2, "0")}:${String(now2.getMinutes()).padStart(2, "0")}:${String(now2.getSeconds()).padStart(2, "0")}`,
          saveName: saveName || `存档`
        };
        uni.setStorageSync("gameSave_backup", JSON.stringify(saveData));
        await saveToFileSystem(saveData, "gameSave_backup.json");
        let saveIndex = -1;
        for (let i = 0; i < 3; i++) {
          const existing = uni.getStorageSync(`gameSave_${i}`);
          if (!existing) {
            saveIndex = i;
            break;
          }
        }
        if (saveIndex >= 0) {
          uni.setStorageSync(`gameSave_${saveIndex}`, JSON.stringify(saveData));
          await saveToFileSystem(saveData, getSaveFileName(saveIndex));
          return { success: true };
        } else {
          let oldestIndex = 0;
          let oldestTime = Date.now();
          for (let i = 0; i < 3; i++) {
            const existing = uni.getStorageSync(`gameSave_${i}`);
            if (existing) {
              try {
                const data = JSON.parse(existing);
                const timeStr = data.savedAt.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1/$2/$3 $4:$5:$6");
                const saveTime = new Date(timeStr).getTime();
                if (saveTime < oldestTime) {
                  oldestTime = saveTime;
                  oldestIndex = i;
                }
              } catch (e) {
                oldestIndex = i;
                break;
              }
            }
          }
          return { success: false, needDeleteOldest: true, oldestSlotIndex: oldestIndex };
        }
      } catch (e) {
        formatAppLog("error", "at stores/gameStore.ts:2395", "保存游戏失败:", e);
        return { success: false };
      }
    }
    async function saveGameOverwrite(saveName, slotIndex) {
      try {
        const now2 = /* @__PURE__ */ new Date();
        const saveData = {
          version: SAVE_VERSION,
          gold: gold.value,
          heroes: heroes.value,
          settings: settings.value,
          savedAt: `${now2.getFullYear()}${String(now2.getMonth() + 1).padStart(2, "0")}${String(now2.getDate()).padStart(2, "0")} ${String(now2.getHours()).padStart(2, "0")}:${String(now2.getMinutes()).padStart(2, "0")}:${String(now2.getSeconds()).padStart(2, "0")}`,
          saveName: saveName || `存档`
        };
        uni.setStorageSync("gameSave_backup", JSON.stringify(saveData));
        await saveToFileSystem(saveData, "gameSave_backup.json");
        uni.setStorageSync(`gameSave_${slotIndex}`, JSON.stringify(saveData));
        await saveToFileSystem(saveData, getSaveFileName(slotIndex));
        return true;
      } catch (e) {
        formatAppLog("error", "at stores/gameStore.ts:2422", "保存游戏失败:", e);
        return false;
      }
    }
    async function loadGame(slotIndex = 0) {
      try {
        let savedData = null;
        let data = null;
        formatAppLog("log", "at stores/gameStore.ts:2433", "尝试从文件系统加载存档...");
        const fileData = await loadFromFileSystem(getSaveFileName(slotIndex));
        if (fileData) {
          data = fileData;
          formatAppLog("log", "at stores/gameStore.ts:2438", "从文件系统加载存档成功");
        } else {
          formatAppLog("log", "at stores/gameStore.ts:2441", "文件系统中没有存档，尝试从本地存储加载...");
          savedData = uni.getStorageSync(`gameSave_${slotIndex}`);
          if (!savedData) {
            formatAppLog("log", "at stores/gameStore.ts:2446", "本地存储中没有存档，尝试从文件系统备份恢复...");
            const backupFileData = await loadFromFileSystem("gameSave_backup.json");
            if (backupFileData) {
              data = backupFileData;
            } else {
              formatAppLog("log", "at stores/gameStore.ts:2452", "尝试从本地存储备份恢复...");
              savedData = uni.getStorageSync("gameSave_backup");
            }
          }
          if (savedData) {
            data = JSON.parse(savedData);
          }
        }
        if (!data) {
          formatAppLog("log", "at stores/gameStore.ts:2463", "没有存档数据");
          return false;
        }
        data = migrateSaveData(data);
        if (!data.heroes || !Array.isArray(data.heroes)) {
          formatAppLog("log", "at stores/gameStore.ts:2472", "存档数据不完整，使用默认值");
          data.heroes = [];
        }
        if (!data.gold || typeof data.gold !== "number") {
          data.gold = 100;
        }
        if (!data.settings || typeof data.settings !== "object") {
          data.settings = {};
        }
        gold.value = data.gold;
        heroes.value = data.heroes;
        settings.value = data.settings;
        uni.setStorageSync("settings_user_adjusted", "true");
        initSettings();
        clearBattle();
        uni.setStorageSync("gameSave_backup", JSON.stringify(data));
        await saveToFileSystem(data, "gameSave_backup.json");
        formatAppLog("log", "at stores/gameStore.ts:2493", "存档加载成功");
        return true;
      } catch (e) {
        formatAppLog("error", "at stores/gameStore.ts:2496", "加载游戏失败:", e);
        try {
          const backupFileData = await loadFromFileSystem("gameSave_backup.json");
          if (backupFileData) {
            formatAppLog("log", "at stores/gameStore.ts:2503", "尝试从文件系统备份恢复...");
            let data = migrateSaveData(backupFileData);
            gold.value = data.gold || 100;
            heroes.value = data.heroes || [];
            settings.value = data.settings || {};
            uni.setStorageSync("settings_user_adjusted", "true");
            initSettings();
            clearBattle();
            formatAppLog("log", "at stores/gameStore.ts:2513", "从文件系统备份恢复成功");
            return true;
          }
          const backupData = uni.getStorageSync("gameSave_backup");
          if (backupData) {
            formatAppLog("log", "at stores/gameStore.ts:2520", "尝试从本地存储备份恢复...");
            let data = JSON.parse(backupData);
            data = migrateSaveData(data);
            gold.value = data.gold || 100;
            heroes.value = data.heroes || [];
            settings.value = data.settings || {};
            uni.setStorageSync("settings_user_adjusted", "true");
            initSettings();
            clearBattle();
            formatAppLog("log", "at stores/gameStore.ts:2531", "从本地存储备份恢复成功");
            return true;
          }
        } catch (backupError) {
          formatAppLog("error", "at stores/gameStore.ts:2535", "备份恢复失败:", backupError);
        }
        return false;
      }
    }
    return {
      gold,
      heroes,
      selectedBattleUnits,
      settings,
      battle,
      aiJoinMessage,
      showAiJoinMessage,
      totalPlayerUnits,
      totalEnemyUnits,
      alivePlayerUnits,
      aliveEnemyUnits,
      updateSettings,
      initSettings,
      addGold,
      deductGold,
      hireHero,
      fireHero,
      renameHero,
      changeHeroClass,
      addHeroStat,
      awardExpToHeroes,
      toggleBattleUnitSelection,
      clearBattleSelection,
      startBattle,
      selectUnit,
      deselectUnit,
      moveUnit,
      setAttackMode,
      setSkillMode,
      attackTarget,
      attackObstacle,
      useSkillTarget,
      confirmArchitectSkill,
      confirmStrategistSkill,
      defend,
      markUnitActed,
      endPlayerTurn,
      addAiUnit,
      addAiUnitDirect,
      setSpeed,
      clearBattle,
      resetGame,
      saveGame,
      saveGameOverwrite,
      loadGame,
      getSaveSlotsInfo,
      getAvailablePositions,
      getAttackablePositions,
      getSkillRangePositions,
      subtitle,
      callReinforcements,
      battleLog,
      addBattleLog,
      clearBattleLog,
      isInSnowArea,
      updateWeather
    };
  });
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    __name: "start",
    setup(__props, { expose: __expose }) {
      __expose();
      const gameStore = useGameStore();
      const showSaveModal = vue.ref(false);
      const saveSlots = vue.ref([]);
      async function refreshSaveSlots() {
        saveSlots.value = await gameStore.getSaveSlotsInfo();
      }
      function getSaveSlots() {
        const slots = [];
        for (const slot of saveSlots.value) {
          if (slot.hasData) {
            let data = null;
            try {
              const fileName = `gameSave_${slot.index}.json`;
              const saveData = uni.getStorageSync(`gameSave_${slot.index}`);
              if (saveData) {
                data = JSON.parse(saveData);
              }
            } catch (e) {
            }
            if (!data) {
              data = {
                saveName: slot.saveName || "存档",
                savedAt: slot.savedAt || "",
                gold: 0,
                heroes: [],
                settings: {}
              };
            }
            if (!data.saveName) data.saveName = `存档 ${slot.index + 1}`;
            if (!data.gold) data.gold = 0;
            slots.push({
              ...data,
              slotIndex: slot.index
            });
          }
        }
        if (slots.length === 0) {
          const backupData = uni.getStorageSync("gameSave_backup");
          if (backupData) {
            try {
              let data = JSON.parse(backupData);
              if (!data.saveName) data.saveName = "备份存档";
              if (!data.gold) data.gold = 0;
              slots.push({
                ...data,
                slotIndex: 0
              });
            } catch (e) {
              formatAppLog("error", "at pages/start/start.vue:138", "解析备份存档失败:", e);
            }
          }
        }
        return slots;
      }
      function onNewGame() {
        uni.showModal({
          title: "全新游戏",
          content: "开始新游戏将重置所有数据，是否继续？",
          confirmText: "确定",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              gameStore.resetGame();
              uni.navigateTo({
                url: "/pages/index/index"
              });
            }
          }
        });
      }
      async function showSaveList() {
        await refreshSaveSlots();
        showSaveModal.value = true;
      }
      async function onLoadSave(index) {
        uni.showModal({
          title: "加载存档",
          content: `确定要加载存档 ${index + 1} 吗？当前未保存的数据将丢失。`,
          confirmText: "确定",
          cancelText: "取消",
          success: async (res) => {
            if (res.confirm) {
              const success = await gameStore.loadGame(index);
              if (success) {
                showSaveModal.value = false;
                uni.navigateTo({
                  url: "/pages/index/index"
                });
                uni.showToast({
                  title: "加载成功",
                  icon: "success"
                });
              } else {
                uni.showToast({
                  title: "加载失败",
                  icon: "none"
                });
              }
            }
          }
        });
      }
      async function onDeleteSave(index) {
        uni.showModal({
          title: "删除存档",
          content: `确定要删除存档 ${index + 1} 吗？此操作不可恢复。`,
          confirmText: "确定",
          cancelText: "取消",
          success: async (res) => {
            if (res.confirm) {
              uni.removeStorageSync(`gameSave_${index}`);
              try {
                if (typeof plus !== "undefined" && plus.io) {
                  const saveFolderPath = plus.io.convertLocalFileSystemURL("_downloads/zhanqi");
                  const filePath = `${saveFolderPath}/gameSave_${index}.json`;
                  plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
                    entry.remove(() => {
                      formatAppLog("log", "at pages/start/start.vue:216", "文件系统存档删除成功");
                    }, (error) => {
                      formatAppLog("log", "at pages/start/start.vue:218", "文件系统存档删除失败（可能不存在）:", error);
                    });
                  }, (error) => {
                    formatAppLog("log", "at pages/start/start.vue:221", "文件系统存档不存在:", error);
                  });
                }
              } catch (e) {
                formatAppLog("log", "at pages/start/start.vue:225", "删除文件系统存档失败:", e);
              }
              await refreshSaveSlots();
              uni.showToast({
                title: "删除成功",
                icon: "success"
              });
            }
          }
        });
      }
      vue.onMounted(() => {
        refreshSaveSlots();
      });
      const __returned__ = { gameStore, showSaveModal, saveSlots, refreshSaveSlots, getSaveSlots, onNewGame, showSaveList, onLoadSave, onDeleteSave };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "logo-section" }, [
        vue.createElementVNode("image", {
          class: "logo",
          src: "/static/icon.png",
          mode: "aspectFit"
        }),
        vue.createElementVNode("text", { class: "title" }, "养成战棋"),
        vue.createElementVNode("text", { class: "subtitle" }, "策略回合制战斗游戏")
      ]),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("button", {
          class: "menu-btn new-game-btn",
          onClick: $setup.onNewGame
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "🎮"),
          vue.createElementVNode("text", { class: "btn-text" }, "全新游戏")
        ]),
        vue.createElementVNode("button", {
          class: "menu-btn load-game-btn",
          onClick: $setup.showSaveList
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "📁"),
          vue.createElementVNode("text", { class: "btn-text" }, "载入存档")
        ])
      ]),
      vue.createElementVNode("view", { class: "version" }, [
        vue.createElementVNode("text", { class: "version-text" }, "v1.1.2")
      ]),
      $setup.showSaveModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal-mask",
        onClick: _cache[2] || (_cache[2] = ($event) => $setup.showSaveModal = false)
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[1] || (_cache[1] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "选择存档"),
            vue.createElementVNode("button", {
              class: "close-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.showSaveModal = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            $setup.getSaveSlots().length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "empty-state"
            }, [
              vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
              vue.createElementVNode("text", { class: "empty-text" }, "暂无存档")
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "save-list"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.getSaveSlots(), (slot) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: slot.slotIndex,
                    class: "save-item"
                  }, [
                    vue.createElementVNode("view", {
                      class: "save-info",
                      onClick: ($event) => $setup.onLoadSave(slot.slotIndex)
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "save-name" },
                        vue.toDisplayString(slot.saveName || "存档"),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "save-time" },
                        vue.toDisplayString(slot.savedAt),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "save-gold" },
                        "💰 " + vue.toDisplayString(slot.gold),
                        1
                        /* TEXT */
                      )
                    ], 8, ["onClick"]),
                    vue.createElementVNode("view", { class: "save-actions" }, [
                      vue.createElementVNode("button", {
                        class: "action-btn load-btn",
                        onClick: ($event) => $setup.onLoadSave(slot.slotIndex)
                      }, [
                        vue.createElementVNode("text", null, "加载")
                      ], 8, ["onClick"]),
                      vue.createElementVNode("button", {
                        class: "action-btn delete-btn",
                        onClick: ($event) => $setup.onDeleteSave(slot.slotIndex)
                      }, [
                        vue.createElementVNode("text", null, "删除")
                      ], 8, ["onClick"])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]))
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesStartStart = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-ccccf83a"], ["__file", "E:/project_jy/zhanqi_test/src/pages/start/start.vue"]]);
  const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const gameStore = useGameStore();
      const showSettings = vue.ref(false);
      function goBack() {
        uni.showModal({
          title: "返回开始界面",
          content: "确定要返回开始界面吗？未保存的数据将丢失。",
          confirmText: "确定",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      }
      function openSettings() {
        gameStore.initSettings();
        showSettings.value = true;
      }
      function goToCharacter() {
        uni.navigateTo({ url: "/pages/character/character" });
      }
      function goToHire() {
        uni.navigateTo({ url: "/pages/hire/hire" });
      }
      function startBattle() {
        uni.navigateTo({ url: "/pages/select/select" });
      }
      async function onSaveGame() {
        uni.showModal({
          title: "保存游戏",
          editable: true,
          placeholderText: "请输入存档名称",
          success: async (res) => {
            if (res.confirm && res.content) {
              const saveName = res.content.trim() || "存档";
              const result = await gameStore.saveGame(saveName);
              if (result.success) {
                uni.showToast({
                  title: "保存成功",
                  icon: "success"
                });
              } else if (result.needDeleteOldest && result.oldestSlotIndex !== void 0) {
                uni.showModal({
                  title: "存档已满",
                  content: "存档数量已达到上限（3个），是否删除最旧的存档并保存？",
                  confirmText: "确定",
                  cancelText: "取消",
                  success: async (confirmRes) => {
                    if (confirmRes.confirm) {
                      const overwriteSuccess = await gameStore.saveGameOverwrite(saveName, result.oldestSlotIndex);
                      if (overwriteSuccess) {
                        uni.showToast({
                          title: "保存成功",
                          icon: "success"
                        });
                      } else {
                        uni.showToast({
                          title: "保存失败",
                          icon: "none"
                        });
                      }
                    }
                  }
                });
              } else {
                uni.showToast({
                  title: "保存失败",
                  icon: "none"
                });
              }
            }
          }
        });
      }
      function onEnemyCountChange(e) {
        gameStore.updateSettings({ enemyCount: e.detail.value });
      }
      function onAllyAiCountChange(e) {
        gameStore.updateSettings({ allyAiCount: e.detail.value });
      }
      const __returned__ = { gameStore, showSettings, goBack, openSettings, goToCharacter, goToHire, startBattle, onSaveGame, onEnemyCountChange, onAllyAiCountChange };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-left" }, [
          vue.createElementVNode("button", {
            class: "back-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "icon" }, "←")
          ]),
          vue.createElementVNode("button", {
            class: "settings-btn",
            onClick: $setup.openSettings
          }, [
            vue.createElementVNode("text", { class: "icon" }, "⚙️")
          ])
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "title" }, "养成战棋")
        ]),
        vue.createElementVNode("view", { class: "header-right" }, [
          vue.createElementVNode("button", {
            class: "save-btn",
            onClick: $setup.onSaveGame
          }, [
            vue.createElementVNode("text", { class: "icon" }, "💾")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "gold-section" }, [
        vue.createElementVNode(
          "text",
          { class: "gold-text" },
          "💰 " + vue.toDisplayString($setup.gameStore.gold),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "main-content" }, [
        vue.createElementVNode("button", {
          class: "main-btn",
          onClick: $setup.goToCharacter
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "👤"),
          vue.createElementVNode("text", { class: "btn-text" }, "人物信息")
        ]),
        vue.createElementVNode("button", {
          class: "main-btn battle-btn",
          onClick: $setup.startBattle
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "⚔️"),
          vue.createElementVNode("text", { class: "btn-text" }, "开始战斗")
        ]),
        vue.createElementVNode("button", {
          class: "main-btn",
          onClick: $setup.goToHire
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "📝"),
          vue.createElementVNode("text", { class: "btn-text" }, "雇佣/解雇")
        ])
      ]),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("text", { class: "tip-text" }, "战斗胜利可获得经验和金币，提升主角等级与属性；战斗中可点击加速按钮切换速度；可通过雇佣按钮扩展主角团；回合可选择原地防御提升本回合10%防御")
      ]),
      $setup.showSettings ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal-mask",
        onClick: _cache[3] || (_cache[3] = ($event) => $setup.showSettings = false)
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "设置"),
            vue.createElementVNode("button", {
              class: "close-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.showSettings = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createElementVNode("view", { class: "setting-item" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "敌方总人数 (3-10)"),
              vue.createElementVNode("slider", {
                value: $setup.gameStore.settings.enemyCount,
                min: 3,
                max: 10,
                onChange: $setup.onEnemyCountChange,
                activeColor: "#667eea",
                backgroundColor: "#ddd"
              }, null, 40, ["value"]),
              vue.createElementVNode(
                "text",
                { class: "setting-value" },
                vue.toDisplayString($setup.gameStore.settings.enemyCount),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "setting-item" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "我方总人数 (3-10)"),
              vue.createElementVNode("slider", {
                value: $setup.gameStore.settings.allyAiCount,
                min: 3,
                max: 10,
                onChange: $setup.onAllyAiCountChange,
                activeColor: "#667eea",
                backgroundColor: "#ddd"
              }, null, 40, ["value"]),
              vue.createElementVNode(
                "text",
                { class: "setting-value" },
                vue.toDisplayString($setup.gameStore.settings.allyAiCount),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "setting-summary" }, [
              vue.createElementVNode(
                "text",
                { class: "summary-text" },
                "我方 " + vue.toDisplayString($setup.gameStore.settings.allyAiCount) + " vs 敌方 " + vue.toDisplayString($setup.gameStore.settings.enemyCount),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("button", {
              class: "confirm-btn",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.showSettings = false)
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-83a5a03c"], ["__file", "E:/project_jy/zhanqi_test/src/pages/index/index.vue"]]);
  const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
    __name: "character",
    setup(__props, { expose: __expose }) {
      __expose();
      const gameStore = useGameStore();
      const currentIndex = vue.ref(0);
      const isEditingName = vue.ref(false);
      const newName = vue.ref("");
      const classList = [
        { type: "warrior", name: "战士", emoji: "⚔️" },
        { type: "knight", name: "骑士", emoji: "🛡️" },
        { type: "archer", name: "弓箭手", emoji: "🏹" },
        { type: "mage", name: "法师", emoji: "🔮" },
        { type: "witch", name: "巫师", emoji: "💀" },
        { type: "assassin", name: "刺客", emoji: "🗡️" },
        { type: "architect", name: "建筑师", emoji: "🏗️" },
        { type: "strategist", name: "军师", emoji: "💡" }
      ];
      const currentHero = vue.computed(() => {
        if (gameStore.heroes.length === 0) return null;
        return gameStore.heroes[currentIndex.value];
      });
      const totalHeroes = vue.computed(() => gameStore.heroes.length);
      const isMainHero = vue.computed(() => {
        if (!currentHero.value) return false;
        const mainHeroNames = ["熊熊", "兔兔", "大黑熊"];
        return mainHeroNames.includes(currentHero.value.name);
      });
      const heroImagePath = vue.computed(() => {
        if (!currentHero.value) return "";
        const heroIndex = ["熊熊", "兔兔", "大黑熊"].indexOf(currentHero.value.name);
        if (heroIndex >= 0) {
          return `/static/hero_${heroIndex + 1}.png`;
        }
        return "";
      });
      function goBack() {
        uni.navigateBack();
      }
      function switchHero() {
        if (gameStore.heroes.length > 0) {
          currentIndex.value = (currentIndex.value + 1) % gameStore.heroes.length;
        }
      }
      function getClassName(classType) {
        var _a;
        return ((_a = CLASS_CONFIG[classType]) == null ? void 0 : _a.name) || classType;
      }
      function getClassEmoji(classType) {
        const emojis = {
          warrior: "🛡️",
          knight: "⚔️",
          archer: "🏹",
          mage: "🔮",
          witch: "💀",
          assassin: "🗡️",
          architect: "🏗️",
          strategist: "💡"
        };
        return emojis[classType] || "👤";
      }
      function getExpNeeded(level) {
        return getExpForLevel(level);
      }
      function changeClass(classType) {
        if (currentHero.value) {
          gameStore.changeHeroClass(currentIndex.value, classType);
          uni.showToast({
            title: "职业切换成功",
            icon: "success"
          });
        }
      }
      function toggleEditName() {
        if (!currentHero.value) return;
        if (isEditingName.value) {
          const trimmed = newName.value.trim();
          const chineseRegex = /^[\u4e00-\u9fa5]{1,4}$/;
          if (chineseRegex.test(trimmed)) {
            gameStore.renameHero(currentHero.value.id, trimmed);
            isEditingName.value = false;
            uni.showToast({
              title: "修改成功",
              icon: "success"
            });
          } else {
            uni.showToast({
              title: "请输入1-4个中文字符",
              icon: "none"
            });
          }
        } else {
          newName.value = currentHero.value.name;
          isEditingName.value = true;
        }
      }
      function addHp() {
        if (currentHero.value && currentHero.value.statPoints > 0) {
          gameStore.addHeroStat(currentIndex.value, "maxHp", 30);
          uni.showToast({
            title: "生命值+30",
            icon: "success"
          });
        }
      }
      function addAttack() {
        if (currentHero.value && currentHero.value.statPoints > 0) {
          gameStore.addHeroStat(currentIndex.value, "attack", 10);
          uni.showToast({
            title: "攻击力+10",
            icon: "success"
          });
        }
      }
      function addDefense() {
        if (currentHero.value && currentHero.value.statPoints > 0) {
          gameStore.addHeroStat(currentIndex.value, "defense", 10);
          uni.showToast({
            title: "防御力+10",
            icon: "success"
          });
        }
      }
      const __returned__ = { gameStore, currentIndex, isEditingName, newName, classList, currentHero, totalHeroes, isMainHero, heroImagePath, goBack, switchHero, getClassName, getClassEmoji, getExpNeeded, changeClass, toggleEditName, addHp, addAttack, addDefense };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-left" }, [
          vue.createElementVNode("button", {
            class: "back-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "←")
          ])
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "title" }, "人物信息")
        ]),
        vue.createElementVNode("view", { class: "header-right" }, [
          vue.createElementVNode(
            "text",
            { class: "hero-count" },
            vue.toDisplayString($setup.currentIndex + 1) + "/" + vue.toDisplayString($setup.totalHeroes),
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            class: "switch-btn",
            onClick: $setup.switchHero
          }, [
            vue.createElementVNode("text", { class: "switch-icon" }, "↻")
          ])
        ])
      ]),
      $setup.currentHero ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "hero-card"
      }, [
        vue.createElementVNode("view", { class: "hero-header" }, [
          vue.createElementVNode("view", { class: "hero-icon" }, [
            $setup.isMainHero ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "hero-image",
              src: $setup.heroImagePath,
              mode: "aspectFill"
            }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 1,
                class: "icon-text"
              },
              vue.toDisplayString($setup.getClassEmoji($setup.currentHero.classType)),
              1
              /* TEXT */
            ))
          ]),
          vue.createElementVNode("view", { class: "hero-title" }, [
            vue.createElementVNode("view", { class: "name-edit-row" }, [
              !$setup.isEditingName ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "hero-name"
                },
                vue.toDisplayString($setup.currentHero.name),
                1
                /* TEXT */
              )) : vue.withDirectives((vue.openBlock(), vue.createElementBlock(
                "input",
                {
                  key: 1,
                  class: "name-input",
                  type: "text",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.newName = $event),
                  maxlength: "4",
                  placeholder: "输入1-4个中文字符"
                },
                null,
                512
                /* NEED_PATCH */
              )), [
                [vue.vModelText, $setup.newName]
              ]),
              vue.createElementVNode("button", {
                class: "edit-name-btn",
                onClick: $setup.toggleEditName
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($setup.isEditingName ? "✓" : "✎"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode(
              "text",
              { class: "hero-class" },
              "职业：" + vue.toDisplayString($setup.getClassName($setup.currentHero.classType)),
              1
              /* TEXT */
            )
          ]),
          $setup.currentHero.isHero ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "hero-badge"
          }, [
            vue.createElementVNode("text", { class: "badge-text" }, "主角")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "class-switch-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "切换职业"),
          vue.createElementVNode("view", { class: "class-grid" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.classList, (cls) => {
                return vue.createElementVNode("button", {
                  key: cls.type,
                  class: vue.normalizeClass(["class-btn", { active: $setup.currentHero.classType === cls.type }]),
                  onClick: ($event) => $setup.changeClass(cls.type)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "class-icon" },
                    vue.toDisplayString(cls.emoji),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "class-name" },
                    vue.toDisplayString(cls.name),
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("text", { class: "switch-hint" }, "切换职业后经验值和天赋点保持不变")
        ]),
        vue.createElementVNode("view", { class: "stats-section" }, [
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-label" }, "等级"),
            vue.createElementVNode(
              "text",
              { class: "stat-value" },
              vue.toDisplayString($setup.currentHero.level),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-label" }, "经验"),
            vue.createElementVNode(
              "text",
              { class: "stat-value" },
              vue.toDisplayString($setup.currentHero.exp) + "/" + vue.toDisplayString($setup.getExpNeeded($setup.currentHero.level)),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "divider" }),
        vue.createElementVNode("view", { class: "attributes-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "属性信息"),
          vue.createElementVNode("view", { class: "attribute-grid" }, [
            vue.createElementVNode("view", { class: "attribute-item" }, [
              vue.createElementVNode("text", { class: "attribute-icon" }, "❤️"),
              vue.createElementVNode("view", { class: "attribute-info" }, [
                vue.createElementVNode("text", { class: "attribute-name" }, "生命值"),
                vue.createElementVNode(
                  "text",
                  { class: "attribute-value" },
                  vue.toDisplayString(Math.round($setup.currentHero.maxHp)),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "attribute-item" }, [
              vue.createElementVNode("text", { class: "attribute-icon" }, "🗡️"),
              vue.createElementVNode("view", { class: "attribute-info" }, [
                vue.createElementVNode("text", { class: "attribute-name" }, "攻击力"),
                vue.createElementVNode(
                  "text",
                  { class: "attribute-value" },
                  vue.toDisplayString(Math.round($setup.currentHero.attack)),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "attribute-item" }, [
              vue.createElementVNode("text", { class: "attribute-icon" }, "🛡️"),
              vue.createElementVNode("view", { class: "attribute-info" }, [
                vue.createElementVNode("text", { class: "attribute-name" }, "防御力"),
                vue.createElementVNode(
                  "text",
                  { class: "attribute-value" },
                  vue.toDisplayString(Math.round($setup.currentHero.defense)),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "attribute-item" }, [
              vue.createElementVNode("text", { class: "attribute-icon" }, "👟"),
              vue.createElementVNode("view", { class: "attribute-info" }, [
                vue.createElementVNode("text", { class: "attribute-name" }, "移动力"),
                vue.createElementVNode(
                  "text",
                  { class: "attribute-value" },
                  vue.toDisplayString($setup.currentHero.moveRange),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "attribute-item" }, [
              vue.createElementVNode("text", { class: "attribute-icon" }, "🎯"),
              vue.createElementVNode("view", { class: "attribute-info" }, [
                vue.createElementVNode("text", { class: "attribute-name" }, "攻击射程"),
                vue.createElementVNode(
                  "text",
                  { class: "attribute-value" },
                  vue.toDisplayString($setup.currentHero.attackRange),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "attribute-item" }, [
              vue.createElementVNode("text", { class: "attribute-icon" }, "⭐"),
              vue.createElementVNode("view", { class: "attribute-info" }, [
                vue.createElementVNode("text", { class: "attribute-name" }, "天赋点"),
                vue.createElementVNode(
                  "text",
                  { class: "attribute-value" },
                  vue.toDisplayString($setup.currentHero.statPoints),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          $setup.currentHero.isHero && $setup.currentHero.statPoints > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "talent-section"
          }, [
            vue.createElementVNode("text", { class: "section-title" }, "天赋点分配"),
            vue.createElementVNode("view", { class: "talent-grid" }, [
              vue.createElementVNode("button", {
                class: "talent-btn",
                onClick: $setup.addHp
              }, [
                vue.createElementVNode("text", { class: "talent-icon" }, "❤️"),
                vue.createElementVNode("text", { class: "talent-name" }, "生命+30"),
                vue.createElementVNode("text", { class: "talent-cost" }, "消耗1点")
              ]),
              vue.createElementVNode("button", {
                class: "talent-btn",
                onClick: $setup.addAttack
              }, [
                vue.createElementVNode("text", { class: "talent-icon" }, "🗡️"),
                vue.createElementVNode("text", { class: "talent-name" }, "攻击+10"),
                vue.createElementVNode("text", { class: "talent-cost" }, "消耗1点")
              ]),
              vue.createElementVNode("button", {
                class: "talent-btn",
                onClick: $setup.addDefense
              }, [
                vue.createElementVNode("text", { class: "talent-icon" }, "🛡️"),
                vue.createElementVNode("text", { class: "talent-name" }, "防御+10"),
                vue.createElementVNode("text", { class: "talent-cost" }, "消耗1点")
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "divider" }),
        vue.createElementVNode("view", { class: "skill-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "技能信息"),
          vue.createElementVNode("view", { class: "skill-card" }, [
            vue.createElementVNode("view", { class: "skill-header" }, [
              vue.createElementVNode(
                "text",
                { class: "skill-name" },
                vue.toDisplayString($setup.currentHero.skill.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "skill-cooldown" },
                "冷却: " + vue.toDisplayString($setup.currentHero.skill.cooldown) + "回合",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "text",
              { class: "skill-description" },
              vue.toDisplayString($setup.currentHero.skill.description),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-text" }, "暂无角色")
      ]))
    ]);
  }
  const PagesCharacterCharacter = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-3b01ff47"], ["__file", "E:/project_jy/zhanqi_test/src/pages/character/character.vue"]]);
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    __name: "hire",
    setup(__props, { expose: __expose }) {
      __expose();
      const gameStore = useGameStore();
      const showRename = vue.ref(false);
      const selectedHero = vue.ref(null);
      const newName = vue.ref("");
      function goBack() {
        uni.navigateBack();
      }
      function hireHero() {
        const result = gameStore.hireHero();
        uni.showToast({
          title: result.message,
          icon: result.success ? "success" : "none"
        });
      }
      function confirmFire(hero) {
        if (gameStore.heroes.length <= 1) {
          uni.showToast({
            title: "主角团至少保留1名角色",
            icon: "none"
          });
          return;
        }
        uni.showModal({
          title: "确认解雇",
          content: `确定要解雇 ${hero.name} 吗？将获得50金币。`,
          success: (res) => {
            if (res.confirm) {
              const result = gameStore.fireHero(hero.id);
              uni.showToast({
                title: result.message,
                icon: result.success ? "success" : "none"
              });
            }
          }
        });
      }
      function showRenameModal(hero) {
        selectedHero.value = hero;
        newName.value = hero.name;
        showRename.value = true;
      }
      function doRename() {
        if (selectedHero.value && newName.value.trim()) {
          gameStore.renameHero(selectedHero.value.id, newName.value.trim());
          uni.showToast({
            title: "重命名成功",
            icon: "success"
          });
          showRename.value = false;
        } else {
          uni.showToast({
            title: "请输入有效名称",
            icon: "none"
          });
        }
      }
      function getClassName(classType) {
        var _a;
        return ((_a = CLASS_CONFIG[classType]) == null ? void 0 : _a.name) || classType;
      }
      function getClassEmoji(classType) {
        const emojis = {
          warrior: "🛡️",
          knight: "⚔️",
          archer: "🏹",
          mage: "🔮",
          witch: "💀",
          assassin: "🗡️",
          architect: "🏗️",
          strategist: "💡"
        };
        return emojis[classType] || "👤";
      }
      const __returned__ = { gameStore, showRename, selectedHero, newName, goBack, hireHero, confirmFire, showRenameModal, doRename, getClassName, getClassEmoji };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-left" }, [
          vue.createElementVNode("button", {
            class: "back-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "←")
          ])
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "title" }, "雇佣/解雇")
        ]),
        vue.createElementVNode("view", { class: "header-right" }, [
          vue.createElementVNode(
            "text",
            { class: "gold-text" },
            "💰 " + vue.toDisplayString($setup.gameStore.gold),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "hire-section" }, [
        vue.createElementVNode("button", {
          class: "hire-btn",
          onClick: $setup.hireHero
        }, [
          vue.createElementVNode("text", { class: "hire-icon" }, "➕"),
          vue.createElementVNode("text", { class: "hire-text" }, "雇佣新角色 (100金币)")
        ])
      ]),
      vue.createElementVNode("view", { class: "hero-list" }, [
        vue.createElementVNode(
          "text",
          { class: "list-title" },
          "当前角色 (" + vue.toDisplayString($setup.gameStore.heroes.length) + "人)",
          1
          /* TEXT */
        ),
        $setup.gameStore.heroes.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-list"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "暂无角色")
        ])) : vue.createCommentVNode("v-if", true),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.gameStore.heroes, (hero) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: hero.id,
              class: "hero-item"
            }, [
              vue.createElementVNode("view", { class: "hero-info" }, [
                vue.createElementVNode("view", { class: "hero-icon-small" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($setup.getClassEmoji(hero.classType)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "hero-details" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "hero-name" },
                    vue.toDisplayString(hero.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "hero-level" },
                    "等级 " + vue.toDisplayString(hero.level) + " · " + vue.toDisplayString($setup.getClassName(hero.classType)),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "hero-actions" }, [
                vue.createElementVNode("button", {
                  class: "rename-btn",
                  onClick: ($event) => $setup.showRenameModal(hero)
                }, [
                  vue.createElementVNode("text", null, "✏️")
                ], 8, ["onClick"]),
                vue.createElementVNode("button", {
                  class: "fire-btn",
                  disabled: $setup.gameStore.heroes.length <= 1,
                  onClick: ($event) => $setup.confirmFire(hero)
                }, [
                  vue.createElementVNode("text", null, "🗑️")
                ], 8, ["disabled", "onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      $setup.showRename ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal-mask",
        onClick: _cache[4] || (_cache[4] = ($event) => $setup.showRename = false)
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[3] || (_cache[3] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "重命名"),
            vue.createElementVNode("button", {
              class: "close-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.showRename = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.newName = $event),
                class: "name-input",
                placeholder: "输入新名称",
                maxlength: 20
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.newName]
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("button", {
              class: "cancel-btn",
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.showRename = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "confirm-btn",
              onClick: $setup.doRename
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesHireHire = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-6f1a931c"], ["__file", "E:/project_jy/zhanqi_test/src/pages/hire/hire.vue"]]);
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "select",
    setup(__props, { expose: __expose }) {
      __expose();
      const gameStore = useGameStore();
      const selectedCount = vue.computed(() => gameStore.selectedBattleUnits.length);
      const maxSelectable = vue.computed(() => {
        return Math.min(gameStore.heroes.length, gameStore.settings.allyAiCount);
      });
      vue.onMounted(() => {
        gameStore.clearBattleSelection();
        if (gameStore.heroes.length > 0) {
          const hero = gameStore.heroes.find((h) => h.isHero);
          if (hero) {
            gameStore.toggleBattleUnitSelection(hero.id);
          }
        }
      });
      function goBack() {
        uni.navigateBack();
      }
      function isSelected(id) {
        return gameStore.selectedBattleUnits.includes(id);
      }
      function toggleSelect(id) {
        if (!isSelected(id) && selectedCount.value >= maxSelectable.value) return;
        gameStore.toggleBattleUnitSelection(id);
      }
      function confirmSelection() {
        if (selectedCount.value > 0) {
          gameStore.startBattle();
          uni.navigateTo({ url: "/pages/battle/battle" });
        }
      }
      function getClassName(classType) {
        var _a;
        return ((_a = CLASS_CONFIG[classType]) == null ? void 0 : _a.name) || classType;
      }
      function getClassEmoji(classType) {
        const emojis = {
          warrior: "🛡️",
          knight: "⚔️",
          archer: "🏹",
          mage: "🔮",
          witch: "💀"
        };
        return emojis[classType] || "👤";
      }
      const __returned__ = { gameStore, selectedCount, maxSelectable, goBack, isSelected, toggleSelect, confirmSelection, getClassName, getClassEmoji };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "title" }, "选择参战角色"),
        vue.createElementVNode("view", { class: "header-right" })
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "selection-info" }, [
          vue.createElementVNode(
            "text",
            { class: "info-text" },
            "已选择 " + vue.toDisplayString($setup.selectedCount) + " / " + vue.toDisplayString($setup.maxSelectable) + " 人",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "character-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.gameStore.heroes, (hero) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: hero.id,
                class: vue.normalizeClass(["character-card", { selected: $setup.isSelected(hero.id), disabled: !$setup.isSelected(hero.id) && $setup.selectedCount >= $setup.maxSelectable }]),
                onClick: ($event) => $setup.toggleSelect(hero.id)
              }, [
                vue.createElementVNode("view", { class: "card-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "class-icon" },
                    vue.toDisplayString($setup.getClassEmoji(hero.classType)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "hero-name" },
                    vue.toDisplayString(hero.name),
                    1
                    /* TEXT */
                  ),
                  hero.isHero ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "hero-badge"
                  }, "★")) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("view", { class: "card-body" }, [
                  vue.createElementVNode("view", { class: "stat-row" }, [
                    vue.createElementVNode("text", { class: "stat-label" }, "职业"),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      vue.toDisplayString($setup.getClassName(hero.classType)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "stat-row" }, [
                    vue.createElementVNode("text", { class: "stat-label" }, "等级"),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      vue.toDisplayString(hero.level),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "stat-row" }, [
                    vue.createElementVNode("text", { class: "stat-label" }, "HP"),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      vue.toDisplayString(hero.hp) + "/" + vue.toDisplayString(hero.maxHp),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "stat-row" }, [
                    vue.createElementVNode("text", { class: "stat-label" }, "攻击"),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      vue.toDisplayString(hero.attack),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "stat-row" }, [
                    vue.createElementVNode("text", { class: "stat-label" }, "防御"),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      vue.toDisplayString(hero.defense),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "card-footer" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "select-hint" },
                    vue.toDisplayString($setup.isSelected(hero.id) ? "已选择" : $setup.selectedCount >= $setup.maxSelectable ? "已达上限" : "点击选择"),
                    1
                    /* TEXT */
                  )
                ])
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("button", {
          class: "confirm-btn",
          disabled: $setup.selectedCount === 0,
          onClick: $setup.confirmSelection
        }, [
          vue.createElementVNode("text", null, "确认出战")
        ], 8, ["disabled"])
      ])
    ]);
  }
  const PagesSelectSelect = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-c0eed202"], ["__file", "E:/project_jy/zhanqi_test/src/pages/select/select.vue"]]);
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "battle",
    setup(__props, { expose: __expose }) {
      __expose();
      const showUnitInfo = vue.ref(false);
      const showBattleLog = vue.ref(false);
      const gameStore = useGameStore();
      const battle = vue.computed(() => gameStore.battle);
      const battleLog = vue.computed(() => gameStore.battleLog);
      const alivePlayerUnits = vue.computed(() => gameStore.alivePlayerUnits);
      const aliveEnemyUnits = vue.computed(() => gameStore.aliveEnemyUnits);
      const aiJoinMessage = vue.computed(() => gameStore.aiJoinMessage);
      const showAiJoinMessage = vue.computed(() => gameStore.showAiJoinMessage);
      const subtitle = vue.computed(() => gameStore.subtitle);
      function isSnowArea(row, col) {
        var _a;
        return ((_a = battle.value.snowAreas) == null ? void 0 : _a.some((s) => s.row === row && s.col === col)) || false;
      }
      function isThunderArea(row, col) {
        var _a;
        return ((_a = battle.value.thunderAreas) == null ? void 0 : _a.some((t) => t.row === row && t.col === col)) || false;
      }
      const movablePositions = vue.computed(() => {
        if (!battle.value.selectedUnit || !battle.value.moveMode) return [];
        if (isSnowArea(battle.value.selectedUnit.position.row, battle.value.selectedUnit.position.col)) {
          return [];
        }
        return gameStore.getAvailablePositions(battle.value.units, battle.value.selectedUnit, battle.value.selectedUnit.moveRange, battle.value.thunderAreas);
      });
      const attackableTargets = vue.computed(() => {
        if (!battle.value.selectedUnit || !battle.value.attackMode) return [];
        return gameStore.getAttackablePositions(battle.value.units, battle.value.selectedUnit);
      });
      const skillRangePositions = vue.computed(() => {
        if (!battle.value.selectedUnit || !battle.value.skillMode) return [];
        return getSkillRangePositions(battle.value.selectedUnit, battle.value.units);
      });
      function goBack() {
        gameStore.clearBattle();
        uni.navigateBack();
      }
      function callReinforcements() {
        gameStore.callReinforcements();
      }
      function getUnitAt(row, col) {
        return battle.value.units.find((u) => u.position.row === row && u.position.col === col);
      }
      function isSelected(row, col) {
        var _a, _b;
        return ((_a = battle.value.selectedUnit) == null ? void 0 : _a.position.row) === row && ((_b = battle.value.selectedUnit) == null ? void 0 : _b.position.col) === col;
      }
      function isHealingGrass(row, col) {
        var _a;
        return ((_a = battle.value.healingGrass) == null ? void 0 : _a.some((g) => g.row === row && g.col === col)) || false;
      }
      function isMovable(row, col) {
        return movablePositions.value.some((p) => p.row === row && p.col === col);
      }
      function isAttackable(row, col) {
        return attackableTargets.value.some((p) => p.row === row && p.col === col);
      }
      function isInSkillRange(row, col) {
        return skillRangePositions.value.some((p) => p.row === row && p.col === col);
      }
      function isSkillTarget(row, col) {
        return battle.value.skillTargets.some((p) => p.row === row && p.col === col);
      }
      function onCellClick(row, col) {
        var _a, _b;
        if (battle.value.currentTurn !== "player") return;
        const clickedUnit = getUnitAt(row, col);
        if (battle.value.moveMode && isMovable(row, col)) {
          gameStore.moveUnit(battle.value.selectedUnit.id, row, col);
          return;
        }
        if (battle.value.attackMode && clickedUnit && clickedUnit.isEnemy) {
          gameStore.attackTarget(clickedUnit.id);
          return;
        }
        if (battle.value.attackMode && isObstacle(row, col)) {
          gameStore.attackObstacle(row, col);
          return;
        }
        if (battle.value.skillMode) {
          const isTargetSelected = isSkillTarget(row, col);
          const isTargetInRange = isInSkillRange(row, col);
          const isArchitectOrStrategist = ((_a = battle.value.selectedUnit) == null ? void 0 : _a.classType) === "architect" || ((_b = battle.value.selectedUnit) == null ? void 0 : _b.classType) === "strategist";
          if (isArchitectOrStrategist && (isTargetSelected || isTargetInRange)) {
            gameStore.useSkillTarget({ row, col });
            return;
          } else if (isTargetInRange) {
            gameStore.useSkillTarget({ row, col });
            return;
          }
        }
        if (!battle.value.moveMode && !battle.value.attackMode && !battle.value.skillMode) {
          if (clickedUnit) {
            gameStore.selectUnit(clickedUnit.id);
          } else {
            gameStore.deselectUnit();
          }
        }
      }
      function toggleMoveMode() {
        var _a, _b;
        if (((_a = battle.value.selectedUnit) == null ? void 0 : _a.hasMoved) || ((_b = battle.value.selectedUnit) == null ? void 0 : _b.hasActed)) return;
        gameStore.battle.moveMode = !gameStore.battle.moveMode;
        gameStore.battle.attackMode = false;
        gameStore.battle.skillMode = false;
      }
      function toggleAttackMode() {
        var _a, _b;
        if (((_a = battle.value.selectedUnit) == null ? void 0 : _a.hasAttacked) || ((_b = battle.value.selectedUnit) == null ? void 0 : _b.hasActed)) return;
        gameStore.battle.attackMode = !gameStore.battle.attackMode;
        gameStore.battle.moveMode = false;
        gameStore.battle.skillMode = false;
      }
      function toggleSkillMode() {
        var _a, _b, _c;
        if (((_a = battle.value.selectedUnit) == null ? void 0 : _a.hasAttacked) || ((_b = battle.value.selectedUnit) == null ? void 0 : _b.hasActed) || ((_c = battle.value.selectedUnit) == null ? void 0 : _c.skill.currentCooldown) > 0) return;
        gameStore.setSkillMode(!gameStore.battle.skillMode);
      }
      function cancelAction() {
        gameStore.battle.moveMode = false;
        gameStore.battle.attackMode = false;
        gameStore.battle.skillMode = false;
        gameStore.battle.skillTargets = [];
      }
      function defend() {
        gameStore.defend();
      }
      function confirmArchitectSkill() {
        gameStore.confirmArchitectSkill();
      }
      function confirmStrategistSkill() {
        gameStore.confirmStrategistSkill();
      }
      async function endTurn() {
        formatAppLog("log", "at pages/battle/battle.vue:533", "endTurn clicked, currentTurn:", gameStore.battle.currentTurn);
        if (gameStore.battle.currentTurn === "player") {
          await gameStore.endPlayerTurn();
        }
      }
      function setSpeed(speed) {
        gameStore.setSpeed(speed);
      }
      function addAiUnit() {
        gameStore.addAiUnit();
      }
      function getClassName(classType) {
        var _a;
        return ((_a = CLASS_CONFIG[classType]) == null ? void 0 : _a.name) || classType;
      }
      function getClassEmoji(classType) {
        const emojis = {
          warrior: "🛡️",
          knight: "⚔️",
          archer: "🏹",
          mage: "🔮",
          witch: "💀",
          assassin: "🗡️",
          architect: "🏗️",
          strategist: "💡"
        };
        return emojis[classType] || "👤";
      }
      function isMainHeroUnit(unit) {
        const mainHeroNames = ["熊熊", "兔兔", "大黑熊"];
        return mainHeroNames.includes(unit.name);
      }
      function getHeroImagePath(unit) {
        const heroIndex = ["熊熊", "兔兔", "大黑熊"].indexOf(unit.name);
        if (heroIndex >= 0) {
          return `/static/hero_${heroIndex + 1}.png`;
        }
        return "";
      }
      function getClassShortName(classType) {
        const names = {
          warrior: "战",
          knight: "骑",
          archer: "弓",
          mage: "法",
          witch: "巫",
          assassin: "刺",
          architect: "建"
        };
        return names[classType] || "";
      }
      function getRealDefense(unit) {
        let defense = unit.defense * (1 + unit.permanentDefenseBonus / 100);
        if (unit.isDefending) {
          defense = defense * 1.1;
        }
        if (unit.defenseBuffDuration > 0) {
          defense = defense + 3;
        }
        return parseFloat(defense.toFixed(1));
      }
      function getRealAttack(unit) {
        let attack = unit.attack * (1 + unit.permanentAttackBonus / 100);
        return parseFloat(attack.toFixed(1));
      }
      const __returned__ = { showUnitInfo, showBattleLog, gameStore, battle, battleLog, alivePlayerUnits, aliveEnemyUnits, aiJoinMessage, showAiJoinMessage, subtitle, isSnowArea, isThunderArea, movablePositions, attackableTargets, skillRangePositions, goBack, callReinforcements, getUnitAt, isSelected, isHealingGrass, isMovable, isAttackable, isInSkillRange, isSkillTarget, onCellClick, toggleMoveMode, toggleAttackMode, toggleSkillMode, cancelAction, defend, confirmArchitectSkill, confirmStrategistSkill, endTurn, setSpeed, addAiUnit, getClassName, getClassEmoji, isMainHeroUnit, getHeroImagePath, getClassShortName, getRealDefense, getRealAttack, get isObstacle() {
        return isObstacle;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b, _c, _d;
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "battle-header" }, [
        vue.createElementVNode("view", { class: "header-left" }, [
          vue.createElementVNode("button", {
            class: "back-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "←")
          ])
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode(
            "text",
            { class: "turn-text" },
            "回合 " + vue.toDisplayString($setup.battle.turnNumber),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["turn-indicator", $setup.battle.currentTurn])
            },
            vue.toDisplayString($setup.battle.currentTurn === "player" ? "我方回合" : "敌方回合"),
            3
            /* TEXT, CLASS */
          )
        ]),
        vue.createElementVNode("view", { class: "header-right" }, [
          vue.createElementVNode("view", { class: "speed-controls" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList([1, 2, 3], (s) => {
                return vue.createElementVNode("button", {
                  key: s,
                  class: vue.normalizeClass(["speed-btn", { active: $setup.battle.speed === s }]),
                  onClick: ($event) => $setup.setSpeed(s)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(s) + "x",
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("button", {
            class: "call-reinforcements-btn",
            disabled: $setup.battle.summonCount >= $setup.battle.maxSummons || $setup.battle.currentTurn === "enemy",
            onClick: $setup.callReinforcements
          }, [
            vue.createElementVNode(
              "text",
              null,
              "呼叫支援 (" + vue.toDisplayString($setup.battle.summonCount) + "/" + vue.toDisplayString($setup.battle.maxSummons) + ")",
              1
              /* TEXT */
            )
          ], 8, ["disabled"])
        ])
      ]),
      vue.createElementVNode("view", { class: "map-container" }, [
        vue.createElementVNode("view", { class: "map-grid" }, [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList(12, (row) => {
              return vue.createElementVNode("view", {
                key: row,
                class: "map-row"
              }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(11, (col) => {
                    var _a2, _b2, _c2, _d2, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
                    return vue.createElementVNode("view", {
                      key: col,
                      class: vue.normalizeClass(["map-cell", {
                        obstacle: $setup.isObstacle(row - 1, col - 1),
                        selected: $setup.isSelected(row - 1, col - 1),
                        movable: $setup.isMovable(row - 1, col - 1),
                        attackable: $setup.isAttackable(row - 1, col - 1),
                        "skill-range": $setup.isInSkillRange(row - 1, col - 1),
                        "skill-target": $setup.isSkillTarget(row - 1, col - 1),
                        "snow-area": $setup.isSnowArea(row - 1, col - 1),
                        "thunder-area": $setup.isThunderArea(row - 1, col - 1)
                      }]),
                      onClick: ($event) => $setup.onCellClick(row - 1, col - 1)
                    }, [
                      $setup.isObstacle(row - 1, col - 1) ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "obstacle-icon"
                      }, [
                        vue.createElementVNode("text", null, "🗿")
                      ])) : $setup.isHealingGrass(row - 1, col - 1) ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "healing-grass"
                      }, [
                        vue.createElementVNode("text", null, "🌿")
                      ])) : vue.createCommentVNode("v-if", true),
                      $setup.isSnowArea(row - 1, col - 1) ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 2,
                        class: "snow-icon"
                      }, [
                        vue.createElementVNode("text", null, "❄️")
                      ])) : vue.createCommentVNode("v-if", true),
                      $setup.isThunderArea(row - 1, col - 1) ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 3,
                        class: "thunder-icon"
                      }, [
                        vue.createElementVNode("text", null, "⚡")
                      ])) : vue.createCommentVNode("v-if", true),
                      $setup.getUnitAt(row - 1, col - 1) ? (vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          key: 4,
                          class: vue.normalizeClass(["unit", {
                            enemy: (_a2 = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _a2.isEnemy,
                            selected: ((_b2 = $setup.battle.selectedUnit) == null ? void 0 : _b2.position.row) === row - 1 && ((_c2 = $setup.battle.selectedUnit) == null ? void 0 : _c2.position.col) === col - 1,
                            ai: (_d2 = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _d2.isAI,
                            hero: (_e = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _e.isHero,
                            warrior: ((_f = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _f.classType) === "warrior",
                            knight: ((_g = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _g.classType) === "knight",
                            archer: ((_h = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _h.classType) === "archer",
                            mage: ((_i = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _i.classType) === "mage",
                            witch: ((_j = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _j.classType) === "witch",
                            assassin: ((_k = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _k.classType) === "assassin",
                            architect: ((_l = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _l.classType) === "architect",
                            strategist: ((_m = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _m.classType) === "strategist"
                          }])
                        },
                        [
                          vue.createElementVNode("view", { class: "unit-content" }, [
                            $setup.getUnitAt(row - 1, col - 1) && $setup.isMainHeroUnit($setup.getUnitAt(row - 1, col - 1)) ? (vue.openBlock(), vue.createElementBlock("image", {
                              key: 0,
                              class: "unit-image",
                              src: $setup.getHeroImagePath($setup.getUnitAt(row - 1, col - 1)),
                              mode: "aspectFill"
                            }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                              "text",
                              {
                                key: 1,
                                class: "unit-icon"
                              },
                              vue.toDisplayString($setup.getClassEmoji(((_n = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _n.classType) || "")),
                              1
                              /* TEXT */
                            )),
                            ((_o = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _o.isHero) ? (vue.openBlock(), vue.createElementBlock("text", {
                              key: 2,
                              class: "hero-badge"
                            }, "★")) : vue.createCommentVNode("v-if", true)
                          ]),
                          vue.createElementVNode("view", { class: "unit-hp-bar" }, [
                            vue.createElementVNode(
                              "view",
                              {
                                class: vue.normalizeClass(["unit-hp-fill", {
                                  "is-enemy": (_p = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _p.isEnemy
                                }]),
                                style: vue.normalizeStyle({ width: (((_q = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _q.hp) || 0) / (((_r = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _r.maxHp) || 1) * 100 + "%" })
                              },
                              null,
                              6
                              /* CLASS, STYLE */
                            )
                          ])
                        ],
                        2
                        /* CLASS */
                      )) : vue.createCommentVNode("v-if", true)
                    ], 10, ["onClick"]);
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ]),
      $setup.subtitle ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "subtitle-panel"
      }, [
        vue.createElementVNode(
          "text",
          { class: "subtitle-text" },
          vue.toDisplayString($setup.subtitle),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "bottom-panel" }, [
        $setup.battle.selectedUnit && !$setup.battle.selectedUnit.isEnemy && !$setup.battle.selectedUnit.isAI ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "action-panel"
        }, [
          vue.createElementVNode("view", { class: "unit-stats" }, [
            vue.createElementVNode("view", { class: "stat-row" }, [
              vue.createElementVNode("text", { class: "stat-label" }, "角色:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.battle.selectedUnit.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "stat-class" },
                vue.toDisplayString($setup.getClassName($setup.battle.selectedUnit.classType)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "stat-row" }, [
              vue.createElementVNode("text", { class: "stat-label" }, "等级:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.battle.selectedUnit.level),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "HP:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value hp" },
                vue.toDisplayString($setup.battle.selectedUnit.hp) + "/" + vue.toDisplayString($setup.battle.selectedUnit.maxHp),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "攻击:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.getRealAttack($setup.battle.selectedUnit)),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "防御:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.getRealDefense($setup.battle.selectedUnit)),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "action-buttons" }, [
            vue.createElementVNode("button", {
              class: "action-btn move-btn",
              disabled: $setup.battle.selectedUnit.hasMoved || $setup.isSnowArea($setup.battle.selectedUnit.position.row, $setup.battle.selectedUnit.position.col),
              onClick: $setup.toggleMoveMode
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "👟"),
              vue.createElementVNode("text", { class: "btn-text" }, "移动")
            ], 8, ["disabled"]),
            vue.createElementVNode("button", {
              class: "action-btn attack-btn",
              disabled: $setup.battle.selectedUnit.hasAttacked,
              onClick: $setup.toggleAttackMode
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "⚔️"),
              vue.createElementVNode("text", { class: "btn-text" }, "攻击")
            ], 8, ["disabled"]),
            vue.createElementVNode("button", {
              class: "action-btn skill-btn",
              disabled: $setup.battle.selectedUnit.hasAttacked || $setup.battle.selectedUnit.skill.currentCooldown > 0,
              onClick: $setup.toggleSkillMode
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "✨"),
              vue.createElementVNode(
                "text",
                { class: "btn-text" },
                "技能" + vue.toDisplayString($setup.battle.selectedUnit.skill.currentCooldown > 0 ? "(" + $setup.battle.selectedUnit.skill.currentCooldown + ")" : ""),
                1
                /* TEXT */
              )
            ], 8, ["disabled"]),
            vue.createElementVNode("button", {
              class: "action-btn defend-btn",
              disabled: $setup.battle.selectedUnit.hasAttacked,
              onClick: $setup.defend
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "🛡️"),
              vue.createElementVNode("text", { class: "btn-text" }, "防御")
            ], 8, ["disabled"])
          ]),
          $setup.battle.moveMode || $setup.battle.attackMode || $setup.battle.skillMode ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "action-hint"
          }, [
            $setup.battle.moveMode ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "点击蓝色格子移动")) : $setup.battle.attackMode ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "点击敌人攻击")) : $setup.battle.skillMode && ((_a = $setup.battle.selectedUnit) == null ? void 0 : _a.classType) === "architect" ? (vue.openBlock(), vue.createElementBlock(
              "text",
              { key: 2 },
              " 选择最多3个格子（有障碍物清除，无则生成），已选择：" + vue.toDisplayString($setup.battle.skillTargets.length) + "/3 ",
              1
              /* TEXT */
            )) : $setup.battle.skillMode && ((_b = $setup.battle.selectedUnit) == null ? void 0 : _b.classType) === "strategist" ? (vue.openBlock(), vue.createElementBlock(
              "text",
              { key: 3 },
              " 选择2个目标（角色或障碍物）交换位置，已选择：" + vue.toDisplayString($setup.battle.skillTargets.length) + "/2 ",
              1
              /* TEXT */
            )) : $setup.battle.skillMode ? (vue.openBlock(), vue.createElementBlock("text", { key: 4 }, "点击释放技能")) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "hint-buttons" }, [
              $setup.battle.skillMode && ((_c = $setup.battle.selectedUnit) == null ? void 0 : _c.classType) === "architect" ? (vue.openBlock(), vue.createElementBlock("button", {
                key: 0,
                class: "confirm-btn",
                disabled: $setup.battle.skillTargets.length === 0,
                onClick: $setup.confirmArchitectSkill
              }, " 确认 ", 8, ["disabled"])) : vue.createCommentVNode("v-if", true),
              $setup.battle.skillMode && ((_d = $setup.battle.selectedUnit) == null ? void 0 : _d.classType) === "strategist" ? (vue.openBlock(), vue.createElementBlock("button", {
                key: 1,
                class: "confirm-btn",
                disabled: $setup.battle.skillTargets.length !== 2,
                onClick: $setup.confirmStrategistSkill
              }, " 确认 ", 8, ["disabled"])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("button", {
                class: "cancel-btn",
                onClick: $setup.cancelAction
              }, "取消")
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])) : $setup.battle.selectedUnit && $setup.battle.selectedUnit.isEnemy ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "action-panel"
        }, [
          vue.createElementVNode("view", { class: "unit-stats enemy-stats" }, [
            vue.createElementVNode("view", { class: "stat-row" }, [
              vue.createElementVNode("text", { class: "stat-label" }, "角色:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value enemy" },
                vue.toDisplayString($setup.battle.selectedUnit.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "stat-class" },
                vue.toDisplayString($setup.getClassName($setup.battle.selectedUnit.classType)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "stat-row" }, [
              vue.createElementVNode("text", { class: "stat-label" }, "等级:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.battle.selectedUnit.level),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "HP:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value hp enemy" },
                vue.toDisplayString($setup.battle.selectedUnit.hp) + "/" + vue.toDisplayString($setup.battle.selectedUnit.maxHp),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "攻击:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.getRealAttack($setup.battle.selectedUnit)),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "防御:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.getRealDefense($setup.battle.selectedUnit)),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : $setup.battle.selectedUnit && !$setup.battle.selectedUnit.isEnemy && $setup.battle.selectedUnit.isAI ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "action-panel"
        }, [
          vue.createElementVNode("view", { class: "unit-stats ally-ai-stats" }, [
            vue.createElementVNode("view", { class: "stat-row" }, [
              vue.createElementVNode("text", { class: "stat-label" }, "角色:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value ally-ai" },
                vue.toDisplayString($setup.battle.selectedUnit.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "stat-class" },
                vue.toDisplayString($setup.getClassName($setup.battle.selectedUnit.classType)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "stat-row" }, [
              vue.createElementVNode("text", { class: "stat-label" }, "等级:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.battle.selectedUnit.level),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "HP:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value hp ally-ai" },
                vue.toDisplayString($setup.battle.selectedUnit.hp) + "/" + vue.toDisplayString($setup.battle.selectedUnit.maxHp),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "攻击:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.getRealAttack($setup.battle.selectedUnit)),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "防御:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.getRealDefense($setup.battle.selectedUnit)),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "action-panel"
        }, [
          vue.createElementVNode("view", { class: "info-content" }, [
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "turn-label" }, "当前回合:"),
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["turn-status", $setup.battle.currentTurn])
                },
                vue.toDisplayString($setup.battle.currentTurn === "player" ? "我方回合" : "敌方回合"),
                3
                /* TEXT, CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "turn-label" }, "回合数:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.battle.turnNumber),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "turn-label" }, "己方:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value ally" },
                vue.toDisplayString($setup.alivePlayerUnits.length),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "turn-label" }, "敌方:"),
              vue.createElementVNode(
                "text",
                { class: "stat-value enemy" },
                vue.toDisplayString($setup.aliveEnemyUnits.length),
                1
                /* TEXT */
              )
            ])
          ])
        ])),
        vue.createElementVNode("view", { class: "bottom-actions" }, [
          vue.createElementVNode("view", {
            class: "battle-log-btn",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.showBattleLog = true)
          }, [
            vue.createElementVNode("text", null, "📜 战斗记录")
          ]),
          vue.createElementVNode("view", {
            class: "end-turn-wrapper",
            onClick: $setup.endTurn
          }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["end-turn-btn", { disabled: $setup.battle.currentTurn !== "player" }])
              },
              "结束行动",
              2
              /* CLASS */
            )
          ])
        ])
      ]),
      $setup.showBattleLog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "battle-log-modal",
        onClick: _cache[2] || (_cache[2] = vue.withModifiers(($event) => $setup.showBattleLog = false, ["self"]))
      }, [
        vue.createElementVNode("view", { class: "battle-log-content" }, [
          vue.createElementVNode("view", { class: "battle-log-header" }, [
            vue.createElementVNode("text", { class: "battle-log-title" }, "📜 战斗记录"),
            vue.createElementVNode("view", {
              class: "battle-log-close",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.showBattleLog = false)
            }, "✕")
          ]),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "battle-log-body"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.battleLog, (entry) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: entry.turn,
                  class: "battle-log-turn-group"
                }, [
                  vue.createElementVNode("view", { class: "battle-log-turn-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "battle-log-turn-number" },
                      "回合 " + vue.toDisplayString(entry.turn),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "battle-log-turn-messages" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(entry.messages, (message, idx) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: idx,
                          class: "battle-log-item"
                        }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(message),
                            1
                            /* TEXT */
                          )
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            $setup.battleLog.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "battle-log-empty"
            }, [
              vue.createElementVNode("text", null, "暂无战斗记录")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.battle.gameResult ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "result-modal"
      }, [
        vue.createElementVNode("view", { class: "result-content" }, [
          vue.createElementVNode(
            "text",
            { class: "result-icon" },
            vue.toDisplayString($setup.battle.gameResult === "victory" ? "🎉" : "💀"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "result-title" },
            vue.toDisplayString($setup.battle.gameResult === "victory" ? "胜利！" : "失败..."),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "result-text" },
            vue.toDisplayString($setup.battle.gameResult === "victory" ? "恭喜获得金币和经验！记得保存游戏" : "我方全军覆没...记得保存游戏"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            class: "result-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($setup.battle.gameResult === "victory" ? "继续游戏" : "返回主页"),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showAiJoinMessage ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "ai-join-message"
      }, [
        vue.createElementVNode(
          "text",
          null,
          vue.toDisplayString($setup.aiJoinMessage),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      $setup.battle.aiJoinPending ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "ai-join-modal"
      }, [
        vue.createElementVNode("view", { class: "ai-join-content" }, [
          vue.createElementVNode("text", { class: "ai-join-title" }, "有人加入战斗！"),
          vue.createElementVNode(
            "text",
            { class: "ai-join-class" },
            vue.toDisplayString($setup.getClassName($setup.battle.pendingAiClass || "")),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "ai-join-side" },
            vue.toDisplayString($setup.battle.pendingAiSide === "ally" ? "加入我方" : "加入敌方"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            class: "ai-join-btn",
            onClick: $setup.addAiUnit
          }, [
            vue.createElementVNode("text", null, "确认")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showUnitInfo && $setup.battle.selectedUnit ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 5,
        class: "unit-info-modal"
      }, [
        vue.createElementVNode("view", { class: "unit-info-content" }, [
          vue.createElementVNode("view", { class: "unit-info-header" }, [
            vue.createElementVNode(
              "text",
              { class: "unit-info-title" },
              vue.toDisplayString($setup.battle.selectedUnit.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode("button", {
              class: "close-btn",
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.showUnitInfo = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "unit-info-body" }, [
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "info-label" }, "职业"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.getClassName($setup.battle.selectedUnit.classType)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "info-label" }, "等级"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.battle.selectedUnit.level),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "info-label" }, "生命值"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.battle.selectedUnit.hp) + "/" + vue.toDisplayString($setup.battle.selectedUnit.maxHp),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "info-label" }, "攻击力"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.getRealAttack($setup.battle.selectedUnit)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "info-label" }, "防御力"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.getRealDefense($setup.battle.selectedUnit)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "info-label" }, "移动力"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.battle.selectedUnit.moveRange),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("text", { class: "info-label" }, "攻击射程"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.battle.selectedUnit.attackRange),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "skill-info" }, [
              vue.createElementVNode(
                "text",
                { class: "skill-name" },
                vue.toDisplayString($setup.battle.selectedUnit.skill.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "skill-desc" },
                vue.toDisplayString($setup.battle.selectedUnit.skill.description),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "skill-cd" },
                "冷却: " + vue.toDisplayString($setup.battle.selectedUnit.skill.cooldown) + "回合",
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesBattleBattle = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-1ff1a1ca"], ["__file", "E:/project_jy/zhanqi_test/src/pages/battle/battle.vue"]]);
  __definePage("pages/start/start", PagesStartStart);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/character/character", PagesCharacterCharacter);
  __definePage("pages/hire/hire", PagesHireHire);
  __definePage("pages/select/select", PagesSelectSelect);
  __definePage("pages/battle/battle", PagesBattleBattle);
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      onLaunch(() => {
        formatAppLog("log", "at App.vue:5", "App Launch");
      });
      onShow(() => {
        formatAppLog("log", "at App.vue:9", "App Show");
      });
      onHide(() => {
        formatAppLog("log", "at App.vue:13", "App Hide");
      });
      const __returned__ = { get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "E:/project_jy/zhanqi_test/src/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    const pinia = createPinia();
    app.use(pinia);
    return {
      app,
      pinia
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
