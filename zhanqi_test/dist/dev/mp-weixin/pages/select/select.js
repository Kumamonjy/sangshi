"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_gameStore = require("../../stores/gameStore.js");
const utils_gameData = require("../../utils/gameData.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "select",
  setup(__props, { expose: __expose }) {
    __expose();
    const gameStore = stores_gameStore.useGameStore();
    const selectedCount = common_vendor.computed(() => gameStore.selectedBattleUnits.length);
    common_vendor.onMounted(() => {
      if (gameStore.selectedBattleUnits.length === 0 && gameStore.heroes.length > 0) {
        const hero = gameStore.heroes.find((h) => h.isHero);
        if (hero) {
          gameStore.toggleBattleUnitSelection(hero.id);
        }
      }
    });
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function isSelected(id) {
      return gameStore.selectedBattleUnits.includes(id);
    }
    function toggleSelect(id) {
      if (!isSelected(id) && selectedCount.value >= 3) return;
      gameStore.toggleBattleUnitSelection(id);
    }
    function confirmSelection() {
      if (selectedCount.value > 0) {
        gameStore.startBattle();
        common_vendor.index.navigateTo({ url: "/pages/battle/battle" });
      }
    }
    function getClassName(classType) {
      var _a;
      return ((_a = utils_gameData.CLASS_CONFIG[classType]) == null ? void 0 : _a.name) || classType;
    }
    function getClassEmoji(classType) {
      const emojis = {
        warrior: "⚔️",
        knight: "🛡️",
        archer: "🏹",
        mage: "🔮",
        witch: "💀"
      };
      return emojis[classType] || "👤";
    }
    const __returned__ = { gameStore, selectedCount, goBack, isSelected, toggleSelect, confirmSelection, getClassName, getClassEmoji };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($setup.goBack),
    b: common_vendor.t($setup.selectedCount),
    c: common_vendor.f($setup.gameStore.heroes, (hero, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($setup.getClassEmoji(hero.classType)),
        b: common_vendor.t(hero.name),
        c: hero.isHero
      }, hero.isHero ? {} : {}, {
        d: common_vendor.t($setup.getClassName(hero.classType)),
        e: common_vendor.t(hero.level),
        f: common_vendor.t(hero.hp),
        g: common_vendor.t(hero.maxHp),
        h: common_vendor.t(hero.attack),
        i: common_vendor.t(hero.defense),
        j: common_vendor.t($setup.isSelected(hero.id) ? "已选择" : $setup.selectedCount >= 3 ? "已达上限" : "点击选择"),
        k: hero.id,
        l: $setup.isSelected(hero.id) ? 1 : "",
        m: !$setup.isSelected(hero.id) && $setup.selectedCount >= 3 ? 1 : "",
        n: common_vendor.o(($event) => $setup.toggleSelect(hero.id), hero.id)
      });
    }),
    d: $setup.selectedCount === 0,
    e: common_vendor.o($setup.confirmSelection)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c0eed202"], ["__file", "E:/project_jy/zhanqi_test/src/pages/select/select.vue"]]);
wx.createPage(MiniProgramPage);
