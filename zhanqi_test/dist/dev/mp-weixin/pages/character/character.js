"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_gameStore = require("../../stores/gameStore.js");
const utils_gameData = require("../../utils/gameData.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "character",
  setup(__props, { expose: __expose }) {
    __expose();
    const gameStore = stores_gameStore.useGameStore();
    const currentIndex = common_vendor.ref(0);
    const classList = [
      { type: "warrior", name: "战士", emoji: "⚔️" },
      { type: "knight", name: "骑士", emoji: "🛡️" },
      { type: "archer", name: "弓箭手", emoji: "🏹" },
      { type: "mage", name: "法师", emoji: "🔮" },
      { type: "witch", name: "巫师", emoji: "🧙" },
      { type: "assassin", name: "刺客", emoji: "🗡️" }
    ];
    const currentHero = common_vendor.computed(() => {
      if (gameStore.heroes.length === 0) return null;
      return gameStore.heroes[currentIndex.value];
    });
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function switchHero() {
      if (gameStore.heroes.length > 0) {
        currentIndex.value = (currentIndex.value + 1) % gameStore.heroes.length;
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
    function getExpNeeded(level) {
      return utils_gameData.getExpForLevel(level);
    }
    function changeClass(classType) {
      if (currentHero.value && currentHero.value.isHero) {
        gameStore.changeHeroClass(currentIndex.value, classType);
        common_vendor.index.showToast({
          title: "职业切换成功",
          icon: "success"
        });
      }
    }
    const __returned__ = { gameStore, currentIndex, classList, currentHero, goBack, switchHero, getClassName, getClassEmoji, getExpNeeded, changeClass };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($setup.goBack),
    b: common_vendor.o($setup.switchHero),
    c: $setup.currentHero
  }, $setup.currentHero ? common_vendor.e({
    d: common_vendor.t($setup.getClassEmoji($setup.currentHero.classType)),
    e: common_vendor.t($setup.currentHero.name),
    f: common_vendor.t($setup.getClassName($setup.currentHero.classType)),
    g: $setup.currentHero.isHero
  }, $setup.currentHero.isHero ? {} : {}, {
    h: $setup.currentHero.isHero
  }, $setup.currentHero.isHero ? {
    i: common_vendor.f($setup.classList, (cls, k0, i0) => {
      return {
        a: common_vendor.t(cls.emoji),
        b: common_vendor.t(cls.name),
        c: cls.type,
        d: $setup.currentHero.classType === cls.type ? 1 : "",
        e: common_vendor.o(($event) => $setup.changeClass(cls.type), cls.type)
      };
    })
  } : {}, {
    j: common_vendor.t($setup.currentHero.level),
    k: common_vendor.t($setup.currentHero.exp),
    l: common_vendor.t($setup.getExpNeeded($setup.currentHero.level)),
    m: common_vendor.t($setup.currentHero.maxHp),
    n: common_vendor.t($setup.currentHero.attack),
    o: common_vendor.t($setup.currentHero.defense),
    p: common_vendor.t($setup.currentHero.moveRange),
    q: common_vendor.t($setup.currentHero.attackRange),
    r: common_vendor.t($setup.currentHero.statPoints),
    s: common_vendor.t($setup.currentHero.skill.name),
    t: common_vendor.t($setup.currentHero.skill.cooldown),
    v: common_vendor.t($setup.currentHero.skill.description)
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3b01ff47"], ["__file", "E:/project_jy/zhanqi_test/src/pages/character/character.vue"]]);
wx.createPage(MiniProgramPage);
