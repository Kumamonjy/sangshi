"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_gameStore = require("../../stores/gameStore.js");
const utils_gameData = require("../../utils/gameData.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "hire",
  setup(__props, { expose: __expose }) {
    __expose();
    const gameStore = stores_gameStore.useGameStore();
    const showRename = common_vendor.ref(false);
    const selectedHero = common_vendor.ref(null);
    const newName = common_vendor.ref("");
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function hireHero() {
      const result = gameStore.hireHero();
      common_vendor.index.showToast({
        title: result.message,
        icon: result.success ? "success" : "none"
      });
    }
    function confirmFire(hero) {
      if (gameStore.heroes.length <= 1) {
        common_vendor.index.showToast({
          title: "主角团至少保留1名角色",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认解雇",
        content: `确定要解雇 ${hero.name} 吗？将获得50金币。`,
        success: (res) => {
          if (res.confirm) {
            const result = gameStore.fireHero(hero.id);
            common_vendor.index.showToast({
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
        common_vendor.index.showToast({
          title: "重命名成功",
          icon: "success"
        });
        showRename.value = false;
      } else {
        common_vendor.index.showToast({
          title: "请输入有效名称",
          icon: "none"
        });
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
    const __returned__ = { gameStore, showRename, selectedHero, newName, goBack, hireHero, confirmFire, showRenameModal, doRename, getClassName, getClassEmoji };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($setup.goBack),
    b: common_vendor.t($setup.gameStore.gold),
    c: common_vendor.o($setup.hireHero),
    d: common_vendor.t($setup.gameStore.heroes.length),
    e: $setup.gameStore.heroes.length === 0
  }, $setup.gameStore.heroes.length === 0 ? {} : {}, {
    f: common_vendor.f($setup.gameStore.heroes, (hero, k0, i0) => {
      return {
        a: common_vendor.t($setup.getClassEmoji(hero.classType)),
        b: common_vendor.t(hero.name),
        c: common_vendor.t(hero.level),
        d: common_vendor.t($setup.getClassName(hero.classType)),
        e: common_vendor.o(($event) => $setup.showRenameModal(hero), hero.id),
        f: common_vendor.o(($event) => $setup.confirmFire(hero), hero.id),
        g: hero.id
      };
    }),
    g: $setup.gameStore.heroes.length <= 1,
    h: $setup.showRename
  }, $setup.showRename ? {
    i: common_vendor.o(($event) => $setup.showRename = false),
    j: $setup.newName,
    k: common_vendor.o(($event) => $setup.newName = $event.detail.value),
    l: common_vendor.o(($event) => $setup.showRename = false),
    m: common_vendor.o($setup.doRename),
    n: common_vendor.o(() => {
    }),
    o: common_vendor.o(($event) => $setup.showRename = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6f1a931c"], ["__file", "E:/project_jy/zhanqi_test/src/pages/hire/hire.vue"]]);
wx.createPage(MiniProgramPage);
