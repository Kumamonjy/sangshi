"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_gameStore = require("../../stores/gameStore.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const gameStore = stores_gameStore.useGameStore();
    const showSettings = common_vendor.ref(false);
    function goToCharacter() {
      common_vendor.index.navigateTo({ url: "/pages/character/character" });
    }
    function goToHire() {
      common_vendor.index.navigateTo({ url: "/pages/hire/hire" });
    }
    function startBattle() {
      common_vendor.index.navigateTo({ url: "/pages/select/select" });
    }
    function onEnemyCountChange(e) {
      gameStore.updateSettings({ enemyCount: e.detail.value });
    }
    function onAllyAiCountChange(e) {
      gameStore.updateSettings({ allyAiCount: e.detail.value });
    }
    function onEnemyMinLevelChange(e) {
      const val = parseInt(e.detail.value) || 1;
      gameStore.updateSettings({ enemyAiMinLevel: Math.min(val, gameStore.settings.enemyAiMaxLevel) });
    }
    function onEnemyMaxLevelChange(e) {
      const val = parseInt(e.detail.value) || 10;
      gameStore.updateSettings({ enemyAiMaxLevel: Math.max(val, gameStore.settings.enemyAiMinLevel) });
    }
    function onAllyMinLevelChange(e) {
      const val = parseInt(e.detail.value) || 1;
      gameStore.updateSettings({ allyAiMinLevel: Math.min(val, gameStore.settings.allyAiMaxLevel) });
    }
    function onAllyMaxLevelChange(e) {
      const val = parseInt(e.detail.value) || 10;
      gameStore.updateSettings({ allyAiMaxLevel: Math.max(val, gameStore.settings.allyAiMinLevel) });
    }
    const __returned__ = { gameStore, showSettings, goToCharacter, goToHire, startBattle, onEnemyCountChange, onAllyAiCountChange, onEnemyMinLevelChange, onEnemyMaxLevelChange, onAllyMinLevelChange, onAllyMaxLevelChange };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $setup.showSettings = true),
    b: common_vendor.t($setup.gameStore.gold),
    c: common_vendor.o($setup.goToCharacter),
    d: common_vendor.o($setup.startBattle),
    e: common_vendor.o($setup.goToHire),
    f: $setup.showSettings
  }, $setup.showSettings ? {
    g: common_vendor.o(($event) => $setup.showSettings = false),
    h: $setup.gameStore.settings.enemyCount,
    i: common_vendor.o($setup.onEnemyCountChange),
    j: common_vendor.t($setup.gameStore.settings.enemyCount),
    k: $setup.gameStore.settings.allyAiCount,
    l: common_vendor.o($setup.onAllyAiCountChange),
    m: common_vendor.t($setup.gameStore.settings.allyAiCount),
    n: $setup.gameStore.settings.enemyAiMinLevel,
    o: common_vendor.o($setup.onEnemyMinLevelChange),
    p: $setup.gameStore.settings.enemyAiMaxLevel,
    q: common_vendor.o($setup.onEnemyMaxLevelChange),
    r: $setup.gameStore.settings.allyAiMinLevel,
    s: common_vendor.o($setup.onAllyMinLevelChange),
    t: $setup.gameStore.settings.allyAiMaxLevel,
    v: common_vendor.o($setup.onAllyMaxLevelChange),
    w: common_vendor.t(3 + $setup.gameStore.settings.allyAiCount),
    x: common_vendor.o(($event) => $setup.showSettings = false),
    y: common_vendor.o(() => {
    }),
    z: common_vendor.o(($event) => $setup.showSettings = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83a5a03c"], ["__file", "E:/project_jy/zhanqi_test/src/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
