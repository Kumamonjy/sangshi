"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/stores/gameStore.ts
  var import_pinia = __require("pinia");
  var import_vue = __require("vue");

  // src/utils/gameData.ts
  var STATUS_CONFIG = {
    poison: {
      id: "poison",
      name: "\u4E2D\u6BD2",
      icon: "\u2620",
      description: "\u6BCF\u79D2\u635F\u59313%\u6700\u5927\u751F\u547D\u503C",
      tag: "negative"
    },
    burning: {
      id: "burning",
      name: "\u71C3\u70E7",
      icon: "\u{1F525}",
      description: "\u6BCF\u79D2\u635F\u59315%\u6700\u5927\u751F\u547D\u503C\u548C2.5%\u6700\u5927\u6CD5\u529B\u503C",
      tag: "negative"
    },
    silenced: {
      id: "silenced",
      name: "\u6C89\u9ED8",
      icon: "\u{1F507}",
      description: "\u65E0\u6CD5\u4F7F\u7528\u6280\u80FD",
      tag: "negative"
    },
    bleeding: {
      id: "bleeding",
      name: "\u6D41\u8840",
      icon: "\u{1F534}",
      description: "\u6BCF\u79D2\u635F\u59316%\u6700\u5927\u751F\u547D\u503C",
      tag: "negative"
    },
    cold: {
      id: "cold",
      name: "\u5BD2\u51B7",
      icon: "\u2744",
      description: "\u65E0\u6CD5\u79FB\u52A8",
      tag: "negative"
    },
    disorder: {
      id: "disorder",
      name: "\u7D0A\u4E71",
      icon: "\u{1F300}",
      description: "\u6BCF\u79D2\u635F\u59315%\u6700\u5927\u6CD5\u529B\u503C",
      tag: "negative"
    },
    stun: {
      id: "stun",
      name: "\u7729\u6655",
      icon: "\u{1F4AB}",
      description: "\u65E0\u6CD5\u79FB\u52A8\u3001\u653B\u51FB\u6216\u4F7F\u7528\u6280\u80FD",
      tag: "negative"
    },
    resolute: {
      id: "resolute",
      name: "\u521A\u6BC5",
      icon: "\u{1F6E1}",
      description: "\u9632\u5FA1\u529B\u63D0\u534730%",
      tag: "positive",
      effects: { defensePercent: 30 }
    },
    undying: {
      id: "undying",
      name: "\u4E0D\u706D",
      icon: "\u{1F5E1}",
      description: "\u9632\u5FA1\u529B\u63D0\u534750%",
      tag: "positive",
      effects: { defensePercent: 50 }
    },
    fury: {
      id: "fury",
      name: "\u6124\u6012",
      icon: "\u{1F621}",
      description: "\u653B\u51FB\u529B\u63D0\u534720%\uFF0C\u9632\u5FA1\u529B\u4E0B\u964D20%",
      tag: "positive",
      effects: { attackPercent: 20, defensePercent: -20 }
    },
    strong: {
      id: "strong",
      name: "\u5F3A\u529B",
      icon: "\u{1F4AA}",
      description: "\u653B\u51FB\u529B\u63D0\u534710%",
      tag: "positive",
      effects: { attackPercent: 10 }
    },
    fierce: {
      id: "fierce",
      name: "\u51F6\u608D",
      icon: "\u{1F479}",
      description: "\u653B\u51FB\u529B\u63D0\u534720%",
      tag: "positive",
      effects: { attackPercent: 20 }
    },
    swift: {
      id: "swift",
      name: "\u8FC5\u6377",
      icon: "\u26A1",
      description: "\u79FB\u52A8\u901F\u5EA6+1\u683C/\u79D2",
      tag: "positive",
      effects: { moveSpeedMod: 1 }
    },
    lame: {
      id: "lame",
      name: "\u7638\u817F",
      icon: "\u{1F6B6}",
      description: "\u79FB\u52A8\u901F\u5EA6-1\u683C/\u79D2",
      tag: "negative",
      effects: { moveSpeedMod: -1 }
    },
    weak: {
      id: "weak",
      name: "\u865A\u5F31",
      icon: "\u{1F912}",
      description: "\u653B\u51FB\u529B\u51CF\u5C1110%\uFF0C\u9632\u5FA1\u529B\u51CF\u5C1150%",
      tag: "negative",
      effects: { attackPercent: -10, defensePercent: -50 }
    },
    heal: {
      id: "heal",
      name: "\u6108\u5408",
      icon: "\u{1F49A}",
      description: "\u6BCF\u79D2\u6062\u590D2.5%\u6700\u5927\u751F\u547D\u503C",
      tag: "positive",
      effects: { hpRegenPercent: 2.5 }
    },
    regen: {
      id: "regen",
      name: "\u518D\u751F",
      icon: "\u{1F496}",
      description: "\u6BCF\u79D2\u6062\u590D5%\u6700\u5927\u751F\u547D\u503C",
      tag: "positive",
      effects: { hpRegenPercent: 5 }
    },
    tune: {
      id: "tune",
      name: "\u8C03\u606F",
      icon: "\u{1F499}",
      description: "\u6BCF\u79D2\u6062\u590D2.5%\u6700\u5927\u6CD5\u529B\u503C",
      tag: "positive",
      effects: { mpRegenPercent: 2.5 }
    },
    meditate: {
      id: "meditate",
      name: "\u9759\u5FC3",
      icon: "\u2728",
      description: "\u6BCF\u79D2\u6062\u590D5%\u6700\u5927\u6CD5\u529B\u503C",
      tag: "positive",
      effects: { mpRegenPercent: 5 }
    },
    fear: {
      id: "fear",
      name: "\u6050\u60E7",
      icon: "\u{1F631}",
      description: "\u53EA\u80FD\u79FB\u52A8\uFF0C\u65E0\u6CD5\u653B\u51FB\u6216\u4F7F\u7528\u6280\u80FD",
      tag: "negative",
      effects: {}
    },
    fragile: {
      id: "fragile",
      name: "\u8106\u5F31",
      icon: "\u{1F494}",
      description: "\u9632\u5FA1\u529B\u4E0B\u964D50%",
      tag: "negative",
      effects: { defensePercent: -50 }
    },
    crumble: {
      id: "crumble",
      name: "\u8106\u76AE",
      icon: "\u{1F423}",
      description: "\u751F\u547D\u503C\u4E0A\u9650\u4E0B\u964D10%\uFF0C\u9632\u5FA1\u529B\u4E0B\u964D10%",
      tag: "negative",
      effects: { maxHpPercent: -10, defensePercent: -10 }
    },
    decay: {
      id: "decay",
      name: "\u8150\u673D",
      icon: "\u{1F342}",
      description: "\u751F\u547D\u503C\u4E0A\u9650\u4E0B\u964D20%\uFF0C\u9632\u5FA1\u529B\u4E0B\u964D20%",
      tag: "negative",
      effects: { maxHpPercent: -20, defensePercent: -20 }
    },
    weakened: {
      id: "weakened",
      name: "\u524A\u5F31",
      icon: "\u{1F4C9}",
      description: "\u653B\u51FB\u529B\u4E0B\u964D10%\uFF0C\u9632\u5FA1\u529B\u4E0B\u964D10%",
      tag: "negative",
      effects: { attackPercent: -10, defensePercent: -10 }
    },
    imprison: {
      id: "imprison",
      name: "\u7981\u9522",
      icon: "\u{1F512}",
      description: "\u4E0D\u80FD\u79FB\u52A8",
      tag: "negative",
      effects: { moveSpeedMod: -999 }
    },
    mili: {
      id: "mili",
      name: "\u8FF7\u79BB",
      icon: "\u{1F635}",
      description: "\u653B\u51FB\u529B\u4E0B\u964D10%",
      tag: "negative",
      effects: { attackPercent: -10 }
    },
    xinluan: {
      id: "xinluan",
      name: "\u5FC3\u4E71",
      icon: "\u{1F914}",
      description: "\u653B\u51FB\u529B\u4E0B\u964D20%\uFF0C\u9632\u5FA1\u529B\u4E0B\u964D20%",
      tag: "negative",
      effects: { attackPercent: -20, defensePercent: -20 }
    },
    eagle_eye: {
      id: "eagle_eye",
      name: "\u9E70\u773C",
      icon: "\u{1F52D}",
      description: "\u653B\u51FB\u8303\u56F4+1",
      tag: "positive",
      effects: { attackRange: 1 }
    },
    zhangmu: {
      id: "zhangmu",
      name: "\u969C\u76EE",
      icon: "\u{1F648}",
      description: "\u653B\u51FB\u8303\u56F4-1",
      tag: "negative",
      effects: { attackRange: -1 }
    },
    dissipate: {
      id: "dissipate",
      name: "\u6D88\u6563",
      icon: "\u{1F4A8}",
      description: "\u6BCF\u79D2\u635F\u593112.5%\u6700\u5927\u751F\u547D\u503C",
      tag: "negative"
    }
  };
  var NEGATIVE_STATUSES = Object.keys(STATUS_CONFIG).filter((id) => STATUS_CONFIG[id].tag === "negative");
  var POSITIVE_STATUSES = Object.keys(STATUS_CONFIG).filter((id) => STATUS_CONFIG[id].tag === "positive");
  var FACTION_CONFIG = {
    human: { name: "\u4EBA\u754C", icon: "\u{1F464}", color: "#4ade80" },
    ghost: { name: "\u9B3C\u754C", icon: "\u{1F480}", color: "#9333ea" },
    beast: { name: "\u5996\u754C", icon: "\u{1F479}", color: "#f97316" },
    immortal: { name: "\u4ED9\u754C", icon: "\u2601\uFE0F", color: "#60a5fa" },
    god: { name: "\u795E\u754C", icon: "\u2B50", color: "#fbbf24" },
    demon: { name: "\u9B54\u754C", icon: "\u{1F525}", color: "#ef4444" }
  };
  var CHEST_CONFIG = {
    wanwu: {
      id: "wanwu",
      name: "\u4E07\u7269\u5B9D\u7BB1",
      icon: "/static/avatars/items/wanwubaoxiang.png",
      rarity: "rare",
      description: "\u4F7F\u7528\u540E\u83B7\u5F97\u968F\u673A\u88C5\u5907",
      shopPrice: 1500,
      dropRate: 1
    },
    faqi: {
      id: "faqi",
      name: "\u6CD5\u5668\u5B9D\u7BB1",
      icon: "/static/avatars/items/faqibaoxiang.png",
      rarity: "common",
      description: "\u4F7F\u7528\u540E\u83B7\u5F97\u51E1\u7269\u6216\u6CD5\u5668\u88C5\u5907",
      shopPrice: 800,
      dropRate: 1,
      qualityFilter: ["\u51E1\u7269", "\u6CD5\u5668"]
    }
  };
  function isChestItem(item) {
    return item.subtype === "chest" || Object.values(CHEST_CONFIG).some((c) => c.name === item.name);
  }
  function getChestConfigByName(name) {
    return Object.values(CHEST_CONFIG).find((c) => c.name === name);
  }
  var CHEST_TYPES = Object.keys(CHEST_CONFIG);
  var ITEM_CONFIG = {
    consumable: [
      { name: "\u7075\u8349", icon: "/static/avatars/items/lingcao.png", type: "consumable", description: "\u751F\u547D\u503C\u6062\u590D10%\uFF0C\u6CD5\u529B\u6062\u590D10%", count: 1 },
      { name: "\u4E39\u836F", icon: "/static/avatars/items/danyao.png", type: "consumable", description: "\u751F\u547D\u503C\u6062\u590D30%\uFF0C\u6CD5\u529B\u6062\u590D30%", count: 1 },
      { name: "\u836F\u7BB1", icon: "/static/avatars/items/yaoxiang.png", type: "consumable", description: "\u751F\u547D\u503C\u6062\u590D30%\uFF0C\u6CD5\u529B\u6062\u590D10%", count: 1 },
      { ...CHEST_CONFIG.wanwu, type: "consumable", count: 1 }
    ]
  };
  var JOB_CONFIG = {
    destiny: { name: "\u5929\u547D\u4EBA", rank: 3 },
    \u58EB\u5175: { name: "\u58EB\u5175", rank: 2 },
    \u673A\u7532: { name: "\u673A\u7532", rank: 3 },
    \u666E\u901A\u4E27\u5C38: { name: "\u666E\u901A\u4E27\u5C38", rank: 1 },
    \u53D8\u5F02\u4E27\u5C38: { name: "\u53D8\u5F02\u4E27\u5C38", rank: 2 },
    \u4EBA\u9020\u4E27\u5C38: { name: "\u4EBA\u9020\u4E27\u5C38", rank: 2 },
    \u5389\u9B3C: { name: "\u5389\u9B3C", rank: 3 },
    \u9B3C\u9B42: { name: "\u9B3C\u9B42", rank: 3 },
    \u70BC\u6C14\u4FEE\u58EB: { name: "\u70BC\u6C14\u4FEE\u58EB", rank: 1 },
    \u7B51\u57FA\u4FEE\u58EB: { name: "\u7B51\u57FA\u4FEE\u58EB", rank: 2 },
    \u91D1\u4E39\u4FEE\u58EB: { name: "\u91D1\u4E39\u4FEE\u58EB", rank: 3 },
    \u5080\u5121: { name: "\u5080\u5121", rank: 1 },
    \u9B54\u517D: { name: "\u9B54\u517D", rank: 1 },
    \u9B54\u65CF: { name: "\u9B54\u65CF", rank: 2 },
    \u9B54\u5C06: { name: "\u9B54\u5C06", rank: 3 },
    \u7075\u5BA0: { name: "\u7075\u5BA0", rank: 1 },
    \u7CBE\u602A: { name: "\u7CBE\u602A", rank: 1 },
    \u5996\u602A: { name: "\u5996\u602A", rank: 2 },
    \u5927\u5996: { name: "\u5927\u5996", rank: 3 },
    \u751F\u8096: { name: "\u751F\u8096", rank: 4 },
    \u795E\u5175: { name: "\u795E\u5175", rank: 2 },
    \u6D41\u6C99: { name: "\u6D41\u6C99", rank: 2 },
    \u795E\u5C06: { name: "\u795E\u5C06", rank: 3 },
    \u795E\u88D4: { name: "\u795E\u88D4", rank: 4 },
    \u795E\u517D: { name: "\u795E\u517D", rank: 5 },
    \u4EBA\u7687: { name: "\u4EBA\u7687", rank: 5 },
    \u9B54\u795E: { name: "\u9B54\u795E", rank: 5 },
    \u8840\u8272\u5AC1\u8863: { name: "\u8840\u8272\u5AC1\u8863", rank: 5 },
    \u865A\u5F71: { name: "\u865A\u5F71", rank: 1 },
    \u5929\u72D0\u53F8\u547D: { name: "\u5929\u72D0\u53F8\u547D", rank: 5 },
    \u9B3C\u795E: { name: "\u9B3C\u795E", rank: 5 },
    \u9EC4\u6CC9\u51A5\u795E: { name: "\u9EC4\u6CC9\u51A5\u795E", rank: 5 },
    \u7389\u8861: { name: "\u7389\u8861", rank: 5 },
    \u51B0\u96EA\u5973\u795E: { name: "\u51B0\u96EA\u5973\u795E", rank: 5 },
    \u9AD8\u79D1\u6280: { name: "\u9AD8\u79D1\u6280", rank: 4 },
    \u86C7\u59EC: { name: "\u86C7\u59EC", rank: 5 }
  };
  var ATTRIBUTE_CONFIG = {
    normal: { name: "\u666E", color: "#eaeaea" },
    metal: { name: "\u91D1", color: "#f59e0b" },
    wood: { name: "\u6728", color: "#53c552" },
    water: { name: "\u6C34", color: "#3b82f6" },
    fire: { name: "\u706B", color: "#ef4444" },
    earth: { name: "\u571F", color: "#a16207" },
    ice: { name: "\u51B0", color: "#67e8f9" },
    wind: { name: "\u98CE", color: "#4de083" },
    dark: { name: "\u6697", color: "#A21CAF" },
    yang: { name: "\u9633", color: "#FEF08A" },
    light: { name: "\u5149", color: "#FDE68A" },
    yin: { name: "\u9634", color: "#8B5CF6" }
  };
  var RARITY_CONFIG = {
    common: { name: "\u666E\u901A", color: "#ffffff", bonus: 0 },
    rare: { name: "\u7A00\u6709", color: "#60a5fa", bonus: 0.2 },
    exceptional: { name: "\u975E\u51E1", color: "#4ade80", bonus: 0.4 },
    treasure: { name: "\u73CD\u5B9D", color: "#a855f7", bonus: 0.6 },
    celestial: { name: "\u4ED9\u54C1", color: "#f59e0b", bonus: 0.8 },
    peerless: { name: "\u7EDD\u4E16", color: "#fbbf24", bonus: 1 }
  };
  function getEquipmentStats(item) {
    if (!item.baseStats)
      return {};
    const rarityBonus = RARITY_CONFIG[item.rarity].bonus;
    const levelBonus = (item.level - 1) * 0.1;
    const result = {};
    for (const [key2, value] of Object.entries(item.baseStats)) {
      if (value !== void 0) {
        if (["attackPercent", "defensePercent", "hpPercent", "mpPercent"].includes(key2)) {
          result[key2] = value;
        } else {
          result[key2] = Math.floor(value * (1 + rarityBonus + levelBonus));
        }
      }
    }
    return result;
  }
  function getEquipmentUpgradeCost(item) {
    if (!item.baseStats)
      return 0;
    const totalStats = Object.values(item.baseStats).reduce((sum, val) => sum + (val || 0), 0);
    return totalStats * 5;
  }
  var SET_EFFECTS = {
    "\u7CBE\u7075": {
      name: "\u7CBE\u7075\u5957\u88C5",
      effects: {
        2: { mp: 10 },
        3: { mp: 30, hp: 10 },
        4: { mp: 50, hp: 25 }
      }
    },
    "\u5DE8\u517D": {
      name: "\u5DE8\u517D\u5957\u88C5",
      effects: {
        2: { hp: 20 },
        3: { hp: 40, attack: 10 },
        4: { hp: 60, attack: 20 }
      }
    }
  };
  function calculateSetBonus(equipment) {
    const setCounts = {};
    const slots = [
      equipment.weapon,
      equipment.armor,
      equipment.helmet,
      equipment.shoes,
      equipment.accessory,
      equipment.book
    ];
    for (const item of slots) {
      if (item && item.setTag) {
        setCounts[item.setTag] = (setCounts[item.setTag] || 0) + 1;
      }
    }
    const results = [];
    for (const [setTag, count] of Object.entries(setCounts)) {
      const setEffect = SET_EFFECTS[setTag];
      if (!setEffect)
        continue;
      const thresholds = Object.keys(setEffect.effects).map(Number).sort((a, b) => b - a);
      for (const threshold of thresholds) {
        if (count >= threshold) {
          results.push({
            setName: setEffect.name,
            count: threshold,
            bonus: setEffect.effects[threshold]
          });
          break;
        }
      }
    }
    return results;
  }
  function processEquipmentEffects(equipment) {
    const result = {
      hp: 0,
      mp: 0,
      attack: 0,
      defense: 0,
      moveSpeed: 0.5,
      attackRange: 0,
      attackSpeed: 0.33,
      hpPercent: 0,
      mpPercent: 0,
      attackPercent: 0,
      defensePercent: 0,
      grantedSkills: [],
      setBonuses: []
    };
    if (!equipment)
      return result;
    const slots = [
      equipment.weapon,
      equipment.armor,
      equipment.helmet,
      equipment.shoes,
      equipment.accessory,
      equipment.book
    ];
    for (const item of slots) {
      if (!item)
        continue;
      const stats = getEquipmentStats(item);
      if (stats.hp)
        result.hp += stats.hp;
      if (stats.mp)
        result.mp += stats.mp;
      if (stats.attack)
        result.attack += stats.attack;
      if (stats.defense)
        result.defense += stats.defense;
      if (stats.moveSpeed)
        result.moveSpeed += stats.moveSpeed;
      if (stats.attackRange)
        result.attackRange += stats.attackRange;
      if (stats.attackSpeed)
        result.attackSpeed += stats.attackSpeed;
      if (stats.hpPercent)
        result.hpPercent += stats.hpPercent;
      if (stats.mpPercent)
        result.mpPercent += stats.mpPercent;
      if (stats.attackPercent)
        result.attackPercent += stats.attackPercent;
      if (stats.defensePercent)
        result.defensePercent += stats.defensePercent;
      if (item.grantedSkillId && SKILL_TEMPLATES[item.grantedSkillId]) {
        result.grantedSkills.push({ ...SKILL_TEMPLATES[item.grantedSkillId] });
      }
    }
    result.setBonuses = calculateSetBonus(equipment);
    for (const bonus of result.setBonuses) {
      if (bonus.bonus.hp)
        result.hp += bonus.bonus.hp;
      if (bonus.bonus.mp)
        result.mp += bonus.bonus.mp;
      if (bonus.bonus.attack)
        result.attack += bonus.bonus.attack;
      if (bonus.bonus.defense)
        result.defense += bonus.bonus.defense;
    }
    return result;
  }
  var CHEST_EQUIPMENT_TEMPLATES = [
    { name: "\u6559\u5B66\u5251", icon: "/static/avatars/items/jiaoxue_jian.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 5 }, description: "\u6559\u5B66\u5251\uFF0C\u653B\u51FB+5", quality: "\u51E1\u7269" },
    { name: "\u9A91\u58EB\u7532\u80C4", icon: "/static/avatars/items/qishi_jiazhou.png", type: "equipment", level: 1, subtype: "armor", baseStats: { defense: 20, hp: 50 }, description: "\u9632\u5177\uFF0C\u751F\u547D+50\uFF0C\u9632\u5FA1+20", quality: "\u51E1\u7269" },
    { name: "\u767D\u94F6\u8D5B\u8F66\u5934\u76D4", icon: "/static/avatars/items/baiyin_saiche_toukui.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { defense: 20, hp: 40 }, description: "\u767D\u94F6\u8D5B\u8F66\u5934\u76D4\uFF0C\u751F\u547D+40\uFF0C\u9632\u5FA1+20", quality: "\u51E1\u7269" },
    { name: "\u9A91\u58EB\u9774", icon: "/static/avatars/items/qishi_xue.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 20, defense: 15 }, description: "\u9A91\u58EB\u9774\uFF0C\u751F\u547D+20\uFF0C\u9632\u5FA1+15", quality: "\u51E1\u7269" },
    { name: "\u5E03\u978B", icon: "/static/avatars/items/buxie.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 5, defense: 3 }, description: "\u5E03\u978B\uFF0C\u751F\u547D+5\uFF0C\u9632\u5FA1+3", quality: "\u51E1\u7269" },
    { name: "\u6697\u9ED1\u73AB\u7470", icon: "/static/avatars/items/anheimeigui.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 15, mp: 25, defense: 5 }, description: "\u6697\u9ED1\u73AB\u7470\uFF0C\u751F\u547D+15\uFF0C\u6CD5\u529B+25\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
    { name: "\u9A91\u58EB\u6212\u6307", icon: "/static/avatars/items/qishi_jiezhi.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { attack: 15, defense: 15 }, description: "\u9970\u54C1\uFF0C\u653B\u51FB+15\uFF0C\u9632\u5FA1+15", quality: "\u51E1\u7269" },
    { name: "\u7834\u635F\u7684\u5251", icon: "/static/avatars/items/posun_de_jian.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 10 }, description: "\u7834\u635F\u4F46\u4ECD\u53EF\u4F7F\u7528\u7684\u5251", quality: "\u51E1\u7269" },
    { name: "\u9910\u5200", icon: "/static/avatars/items/caidao.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 8 }, description: "\u9910\u5200\uFF0C\u653B\u51FB+8", quality: "\u51E1\u7269" },
    { name: "\u957F\u77DB", icon: "/static/avatars/items/changmao.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 15 }, description: "\u957F\u77DB\uFF0C\u653B\u51FB+15", quality: "\u51E1\u7269" },
    { name: "\u957F\u6208", icon: "/static/avatars/items/changge.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 12 }, description: "\u957F\u6208\uFF0C\u653B\u51FB+12", quality: "\u51E1\u7269" },
    { name: "\u8033\u73AF", icon: "/static/avatars/items/erhuan.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { mp: 20 }, description: "\u7CBE\u7F8E\u8033\u73AF", quality: "\u51E1\u7269" },
    { name: "\u9A91\u58EB\u5934\u76D4", icon: "/static/avatars/items/qishi_toukui.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { defense: 20, hp: 30 }, description: "\u5934\u76D4\uFF0C\u751F\u547D+30\uFF0C\u9632\u5FA1+20", quality: "\u51E1\u7269" },
    { name: "\u6218\u672F\u5934\u76D4", icon: "/static/avatars/items/zhanshutoukui.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 40, defense: 20 }, description: "\u6218\u672F\u5934\u76D4\uFF0C\u751F\u547D+40\uFF0C\u9632\u5FA1+20", quality: "\u51E1\u7269" },
    { name: "\u5192\u9669\u5BB6\u5E3D\u5B50", icon: "/static/avatars/items/maoxianjiamaozi.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 25, defense: 10 }, description: "\u5192\u9669\u5BB6\u5E3D\u5B50\uFF0C\u751F\u547D+25\uFF0C\u9632\u5FA1+10", quality: "\u51E1\u7269" },
    { name: "\u9B54\u672F\u5E3D", icon: "/static/avatars/items/moshumao.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 10, mp: 20, defense: 5 }, description: "\u9B54\u672F\u5E3D\uFF0C\u751F\u547D+10\uFF0C\u6CD5\u529B+20\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
    { name: "\u7D2B\u53D1\u7C2A", icon: "/static/avatars/items/zifazan.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { mp: 25 }, description: "\u7D2B\u53D1\u7C2A\uFF0C\u6CD5\u529B+25", quality: "\u51E1\u7269" },
    { name: "\u81E3\u76F8\u5E3D", icon: "/static/avatars/items/chenxiangmao.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 40, mp: 40, defense: 10 }, description: "\u81E3\u76F8\u5E3D\uFF0C\u751F\u547D+40\uFF0C\u6CD5\u529B+40\uFF0C\u9632\u5FA1+10", quality: "\u51E1\u7269" },
    { name: "\u767D\u94F6\u72FC\u7259\u68D2", icon: "/static/avatars/items/baiyin_langyabang.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 25 }, description: "\u767D\u94F6\u72FC\u7259\u68D2", quality: "\u51E1\u7269" },
    { name: "\u6559\u4F1A\u6212\u6307", icon: "/static/avatars/items/jiaohui_jiezhi.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { defense: 5, hp: 20 }, description: "\u6559\u4F1A\u6212\u6307\uFF0C\u751F\u547D+20\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
    { name: "\u91D1\u5FBD\u7AE0", icon: "/static/avatars/items/jinhuizhang.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 90, attack: 30, defense: 15 }, description: "\u9970\u54C1\uFF0C\u751F\u547D+90\uFF0C\u653B\u51FB+30\uFF0C\u9632\u5FA1+15", quality: "\u6CD5\u5668" },
    { name: "\u94F6\u5FBD\u7AE0", icon: "/static/avatars/items/yinhuizhang.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 60, attack: 20, defense: 10 }, description: "\u9970\u54C1\uFF0C\u751F\u547D+60\uFF0C\u653B\u51FB+20\uFF0C\u9632\u5FA1+10", quality: "\u6CD5\u5668" },
    { name: "\u94DC\u5FBD\u7AE0", icon: "/static/avatars/items/tonghuizhang.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 30, attack: 10, defense: 5 }, description: "\u9970\u54C1\uFF0C\u751F\u547D+30\uFF0C\u653B\u51FB+10\uFF0C\u9632\u5FA1+5", quality: "\u6CD5\u5668" },
    { name: "\u94C1\u5251", icon: "/static/avatars/items/tiejian.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 20 }, description: "\u94C1\u5251\uFF0C\u653B\u51FB+20", quality: "\u51E1\u7269" },
    { name: "\u722A\u5B50\u5200", icon: "/static/avatars/items/zhuazidao.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 10 }, description: "\u722A\u5B50\u5200\uFF0C\u653B\u51FB+10", quality: "\u51E1\u7269" },
    { name: "\u706B\u7FBD", icon: "/static/avatars/items/huoyu.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { mp: 80, attack: 50, attackRange: 1 }, description: "\u6CD5\u529B\u503C+80\uFF0C\u653B\u51FB\u529B+50\uFF0C\u653B\u51FB\u8303\u56F4+1\uFF0C\u88C5\u5907\u540E\u83B7\u5F97\u4E13\u5C5E\u6280\u80FD\u3010\u706B\u7FBD\u6D41\u661F\u3011", grantedSkillId: "huo_yu_liu_xing", quality: "\u4ED9\u5668" },
    { name: "\u5929\u96C5", icon: "/static/avatars/items/tianya.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { mp: 80, attack: 40, attackRange: 1 }, description: "\u6CD5\u529B\u503C+80\uFF0C\u653B\u51FB\u529B+40\uFF0C\u653B\u51FB\u8303\u56F4+1\uFF0C\u88C5\u5907\u540E\u83B7\u5F97\u4E13\u5C5E\u6280\u80FD\u3010\u5929\u96C5\u503E\u60C5\u3011", grantedSkillId: "tian_ya_qing_qing", quality: "\u4ED9\u5668" },
    { name: "\u9752\u4E91\u767D\u9E64\u5F13", icon: "/static/avatars/items/qingyunbaihegong.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 50, mp: 60, attackRange: 1 }, description: "\u653B\u51FB\u529B+50\uFF0C\u6CD5\u529B\u503C+60\uFF0C\u653B\u51FB\u8303\u56F4+1\uFF0C\u88C5\u5907\u540E\u83B7\u5F97\u4E13\u5C5E\u6280\u80FD\u3010\u4E91\u9E64\u7FD4\u821E\u3011", grantedSkillId: "yun_he_xiang_wu", quality: "\u4ED9\u5668" },
    { name: "\u68C9\u8863", icon: "/static/avatars/items/mianyi.png", type: "equipment", level: 1, subtype: "armor", baseStats: { hp: 20, defense: 5 }, description: "\u68C9\u8863\uFF0C\u751F\u547D+20\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
    { name: "\u5192\u9669\u8005\u670D\u88C5", icon: "/static/avatars/items/maoxianjiayifu.png", type: "equipment", level: 1, subtype: "armor", baseStats: { hp: 25, defense: 10 }, description: "\u5192\u9669\u8005\u670D\u88C5\uFF0C\u751F\u547D+25\uFF0C\u9632\u5FA1+10", quality: "\u51E1\u7269" },
    { name: "\u79C0\u624D\u670D", icon: "/static/avatars/items/xiucaifu.png", type: "equipment", level: 1, subtype: "armor", baseStats: { hp: 10, mp: 20, defense: 5 }, description: "\u79C0\u624D\u670D\uFF0C\u751F\u547D+10\uFF0C\u6CD5\u529B+20\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
    { name: "\u7CBE\u7075\u5E3D", icon: "/static/avatars/items/jinglingmao.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 10, mp: 30 }, description: "\u7CBE\u7075\u5E3D\uFF0C\u751F\u547D+10\uFF0C\u6CD5\u529B+30", setTag: "\u7CBE\u7075", quality: "\u7075\u5668" },
    { name: "\u7CBE\u7075\u9774", icon: "/static/avatars/items/jinglingxue.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 10, mp: 25 }, description: "\u7CBE\u7075\u9774\uFF0C\u751F\u547D+10\uFF0C\u6CD5\u529B+25", setTag: "\u7CBE\u7075", quality: "\u7075\u5668" },
    { name: "\u7CBE\u7075\u6CD5\u6756", icon: "/static/avatars/items/jinglingfazhang.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 10, mp: 40 }, description: "\u7CBE\u7075\u6CD5\u6756\uFF0C\u653B\u51FB+10\uFF0C\u6CD5\u529B+40", setTag: "\u7CBE\u7075", quality: "\u7075\u5668" },
    { name: "\u7CBE\u7075\u5FBD\u7AE0", icon: "/static/avatars/items/jinglinghuizhang.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 30, mp: 50 }, description: "\u7CBE\u7075\u5FBD\u7AE0\uFF0C\u751F\u547D+30\uFF0C\u6CD5\u529B+50", setTag: "\u7CBE\u7075", quality: "\u7075\u5668" },
    { name: "\u5DE8\u517D\u5934\u76D4", icon: "/static/avatars/items/jushoutoukui.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 40, defense: 15 }, description: "\u5DE8\u517D\u5934\u76D4\uFF0C\u751F\u547D+40\uFF0C\u9632\u5FA1+15", setTag: "\u5DE8\u517D", quality: "\u7075\u5668" },
    { name: "\u5DE8\u517D\u978B\u5B50", icon: "/static/avatars/items/jushouxiezi.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 30, defense: 10 }, description: "\u5DE8\u517D\u978B\u5B50\uFF0C\u751F\u547D+30\uFF0C\u9632\u5FA1+10", setTag: "\u5DE8\u517D", quality: "\u7075\u5668" },
    { name: "\u5DE8\u517D\u5C16\u7259", icon: "/static/avatars/items/jushoujianya.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 25, defense: 5 }, description: "\u5DE8\u517D\u5C16\u7259\uFF0C\u653B\u51FB+25\uFF0C\u9632\u5FA1+5", setTag: "\u5DE8\u517D", quality: "\u7075\u5668" },
    { name: "\u5DE8\u517D\u62A4\u76FE", icon: "/static/avatars/items/jushouhudun.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 50, defense: 20 }, description: "\u5DE8\u517D\u62A4\u76FE\uFF0C\u751F\u547D+50\uFF0C\u9632\u5FA1+20", setTag: "\u5DE8\u517D", quality: "\u7075\u5668" }
  ];
  function getRandomRarity() {
    const rand = Math.random() * 100;
    if (rand < 1)
      return "peerless";
    if (rand < 3)
      return "celestial";
    if (rand < 6)
      return "treasure";
    if (rand < 10)
      return "exceptional";
    if (rand < 20)
      return "rare";
    return "common";
  }
  function openChest(chestId) {
    const chestConfig = chestId ? CHEST_CONFIG[chestId] : void 0;
    let filteredTemplates = CHEST_EQUIPMENT_TEMPLATES;
    if (chestConfig?.qualityFilter) {
      filteredTemplates = CHEST_EQUIPMENT_TEMPLATES.filter(
        (template2) => chestConfig.qualityFilter.includes(template2.quality)
      );
    }
    if (filteredTemplates.length === 0) {
      filteredTemplates = CHEST_EQUIPMENT_TEMPLATES;
    }
    const template = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
    const rarity = getRandomRarity();
    return {
      ...template,
      id: `chest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rarity,
      level: 1,
      count: 1
    };
  }
  var SKILL_TEMPLATES = {
    po_kong_zhan: { id: "po_kong_zhan", name: "\u7834\u7A7A\u65A9", mpCost: 50, type: "attack", power: 130, frequency: 6, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210130%\u653B\u51FB\u529B+10%\u5F53\u524D\u751F\u547D\u503C\u7684\u4F24\u5BB3", effectType: "fire", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", damageFormula: "atk_plus_hp_pct", hpPct: 0.1 },
    qian_li_bing_feng: { id: "qian_li_bing_feng", name: "\u5343\u91CC\u51B0\u5C01", mpCost: 60, type: "attack", power: 110, frequency: 8, range: 0, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210110%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u524A\u5F31\u3011\u72B6\u6001", effectType: "ice", areaRange: 3, attribute: "ice", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", statusEffect: "weakened", rangeType: "diamond" },
    bing_feng_zhi_men: { id: "bing_feng_zhi_men", name: "\u51B0\u5C01\u4E4B\u95E8", mpCost: 15, type: "support", power: 0, frequency: 4, range: 2, targetCount: 2, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u7684\u4EFB\u610F\u4E24\u4E2A\u7A7A\u5730\uFF0C\u786E\u8BA4\u540E\u751F\u6210\u969C\u788D\u7269", effectType: "ice", attribute: "ice", category: "special", skillTypeTag: "\u7279\u6B8A", rangeTag: "2\u683C", targetCountTag: "2\u4E2A" },
    bing_jing_fei_she: { id: "bing_jing_fei_she", name: "\u51B0\u6676\u98DE\u5C04", mpCost: 50, type: "attack", power: 90, frequency: 4, range: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u4E2D\u7684\u4E00\u4E2A\u65B9\u5411\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A3\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u621090%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "ice", attribute: "ice", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", elementTag: "\u51B0", rangeTag: "3\u683C", targetCountTag: "\u76F4\u7EBF" },
    ai_de_bao_bao: { id: "ai_de_bao_bao", name: "\u7231\u7684\u62B1\u62B1", mpCost: 40, type: "heal", power: 5, frequency: 4, range: 1, description: "\u5BF9\u76F8\u90BB1\u683C\u8303\u56F4\u5185\u7684\u6307\u5B9A\u76EE\u6807\uFF0C\u6062\u590D\u8840\u91CF\u548C\u6CD5\u529B\u503C\uFF08\u6062\u590D\u91CF\u4E3A0.05*\u81EA\u8EAB\u6700\u5927\u751F\u547D\u503C/\u6CD5\u529B\u503C+0.1*\u76EE\u6807\u6700\u5927\u751F\u547D\u503C/\u6CD5\u529B\u503C\uFF09\uFF0C\u5E76\u9A71\u6563\u76EE\u6807\u6240\u6709\u4E0D\u826F\u72B6\u6001", attribute: "water", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    ai_de_fei_wen: { id: "ai_de_fei_wen", name: "\u7231\u7684\u98DE\u543B", mpCost: 50, type: "heal", power: 0, frequency: 6, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u7684\u4E00\u4E2A\u6307\u5B9A\u76EE\u6807\uFF0C\u6062\u590D\u8840\u91CF\uFF08\u6062\u590D\u91CF\u4E3A0.05*\u81EA\u8EAB\u6700\u5927\u751F\u547D\u503C+0.1*\u76EE\u6807\u6700\u5927\u751F\u547D\u503C\uFF09\uFF0C\u5E76\u9A71\u6563\u76EE\u6807\u6240\u6709\u4E0D\u826F\u72B6\u6001", attribute: "water", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "1\u4E2A" },
    ai_de_hui_yi: { id: "ai_de_hui_yi", name: "\u7231\u7684\u56DE\u5FC6", mpCost: 30, type: "heal", power: 0, frequency: 10, range: 1, description: "\u718A\u718A\u9009\u62E9\u81EA\u5DF1\u4E3A\u76EE\u6807\uFF0C\u6062\u590D10%\u7684\u6700\u5927\u751F\u547D\u503C\u4EE5\u53CA10%\u7684\u6700\u5927\u6CD5\u529B\u503C\uFF0C\u5E76\u9A71\u6563\u81EA\u8EAB\u6240\u6709\u4E0D\u826F\u72B6\u6001", attribute: "water", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    fire_burst: { id: "fire_burst", name: "\u708E\u7206\u672F", mpCost: 20, type: "attack", power: 120, frequency: 4, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    ice_shard: { id: "ice_shard", name: "\u51B0\u6676\u672F", mpCost: 18, type: "attack", power: 100, frequency: 4, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210100%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    thunder_bolt: { id: "thunder_bolt", name: "\u96F7\u7535\u672F", mpCost: 25, type: "attack", power: 140, frequency: 6, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210140%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    shadow_strike: { id: "shadow_strike", name: "\u6697\u5F71\u7A81\u88AD", mpCost: 15, type: "attack", power: 130, frequency: 4, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    nature_power: { id: "nature_power", name: "\u81EA\u7136\u4E4B\u529B", mpCost: 12, type: "heal", power: 60, frequency: 2, description: "\u6062\u590D\u53CB\u65B9\u89D2\u827260%\u6700\u5927\u751F\u547D\u503C", attribute: "normal", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    fierce_attack: { id: "fierce_attack", name: "\u51F6\u731B\u653B\u51FB", mpCost: 50, type: "attack", power: 150, frequency: 6, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "fire", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    jin_shen_ge_dou: { id: "jin_shen_ge_dou", name: "\u8FD1\u8EAB\u683C\u6597", mpCost: 50, type: "attack", power: 110, frequency: 6, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210110%\u653B\u51FB\u529B+30%\u5F53\u524D\u751F\u547D\u503C\u7684\u4F24\u5BB3", effectType: "fire", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", damageFormula: "atk_plus_hp_pct", hpPct: 0.3 },
    shadow_assassination: { id: "shadow_assassination", name: "\u6697\u5F71\u523A\u6740", mpCost: 50, type: "attack", power: 150, frequency: 6, range: 1, areaRange: 1, description: "\u4EE5\u81EA\u5DF1\u4E3A\u4E2D\u5FC3\uFF0C\u5BF91\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "shadow", attribute: "normal", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    throw_grenade: { id: "throw_grenade", name: "\u6295\u63B7\u624B\u96F7", mpCost: 50, type: "attack", power: 200, frequency: 6, range: 3, areaRange: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u683C\u5B50\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u8303\u56F41\u683C\u7684\u83F1\u5F62\u533A\u57DF\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210\u653B\u51FB\u529B200%\u7684\u4F24\u5BB3\uFF0C\u5E76\u6E05\u9664\u8303\u56F4\u5185\u7684\u969C\u788D\u7269", effectType: "fire", attribute: "fire", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "\u8F70\u70B8", clearObstacles: true, rangeType: "diamond" },
    spit_slime: { id: "spit_slime", name: "\u53E3\u5410\u7C98\u6DB2", mpCost: 50, type: "attack", power: 140, frequency: 6, range: 2, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210140%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u865A\u5F31\u3011\u72B6\u6001", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", statusEffect: "weak" },
    fushi_nianye: { id: "fushi_nianye", name: "\u8150\u8680\u7C98\u6DB2", mpCost: 0, type: "attack", power: 225, frequency: 4, range: 2, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\u5F15\u7206\uFF0C\u5BF92\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210225%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u8FDB\u5165\u3010\u865A\u5F31\u3011\u72B6\u6001\uFF08\u653B\u51FB\u529B-10%\uFF0C\u9632\u5FA1\u529B-50%\uFF09\uFF0C\u4F7F\u7528\u540E\u81EA\u8EAB\u6218\u8D25\u9000\u573A\uFF08\u4EC5\u5728\u751F\u547D\u503C<=20%\u65F6\u53EF\u7528\uFF09", attribute: "earth", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", statusEffect: "weak", rangeType: "diamond", selfDefeat: true },
    er_ye_pao_xiao: { id: "er_ye_pao_xiao", name: "\u4E8C\u7237\u5486\u54EE", mpCost: 50, type: "attack", power: 150, frequency: 10, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u6124\u6012\u3011\u72B6\u6001", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", selfStatusEffects: ["fury"] },
    xie_e_kun_bang: { id: "xie_e_kun_bang", name: "\u90AA\u6076\u6346\u7ED1", mpCost: 50, type: "attack", power: 150, frequency: 6, range: 4, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7981\u9522\u3011\u72B6\u6001", attribute: "wood", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "1\u4E2A", statusEffect: "imprison" },
    life_drain: { id: "life_drain", name: "\u6C72\u53D6\u751F\u547D", mpCost: 35, type: "attack", power: 120, frequency: 4, range: 5, description: "\u9009\u62E95\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u6062\u590D\u81EA\u8EAB\u9020\u6210\u4F24\u5BB333%\u7684\u751F\u547D\u503C", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "5\u683C", targetCountTag: "1\u4E2A", lifesteal: 0.333 },
    xiong_meng_si_yao: { id: "xiong_meng_si_yao", name: "\u51F6\u731B\u6495\u54AC", mpCost: 50, type: "attack", power: 150, frequency: 6, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    excited_frenzy: { id: "excited_frenzy", name: "\u5174\u594B\u72C2\u70ED", mpCost: 50, type: "attack", power: 200, frequency: 6, range: 3, description: "\u6D88\u8017\u81EA\u8EAB\u6700\u5927\u751F\u547D\u503C\u768420%\uFF08\u5269\u4F59\u751F\u547D\u4E0D\u4F4E\u4E8E1\uFF09\uFF0C\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210200%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", selfHpCost: 0.2 },
    jue_chu_feng_sheng: { id: "jue_chu_feng_sheng", name: "\u7EDD\u5904\u9022\u751F", mpCost: 10, type: "support", power: 0, frequency: 8, description: "\u6D88\u8017\u81EA\u8EAB\u6700\u5927\u751F\u547D\u503C20%\u7684\u751F\u547D\uFF08\u6D88\u8017\u540E\u751F\u547D\u503C\u81F3\u5C11\u4E3A1\uFF09\uFF0C\u4F7F\u81EA\u5DF1\u8FDB\u5165\u3010\u6124\u6012\u3011\u72B6\u6001", attribute: "normal", category: "support", skillTypeTag: "\u8F85\u52A9", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    jue_ming_fu_ji: { id: "jue_ming_fu_ji", name: "\u7EDD\u547D\u4F0F\u51FB", mpCost: 50, type: "attack", power: 200, frequency: 4, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210200%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    lingqi_bo: { id: "lingqi_bo", name: "\u7075\u6C14\u6CE2", mpCost: 40, type: "attack", power: 150, frequency: 6, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A" },
    hong_hua_lv_ye: { id: "hong_hua_lv_ye", name: "\u7EA2\u82B1\u7EFF\u53F6", mpCost: 60, type: "attack", power: 120, frequency: 6, range: 2, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u63D0\u9AD8\u81EA\u8EAB\u751F\u547D\u503C\u4E0A\u9650\u5E76\u6062\u590D\u751F\u547D\u503C\uFF08\u63D0\u9AD8\u548C\u6062\u590D\u91CF\u4E3A\u653B\u51FB\u529B\u768480%\uFF09", attribute: "wood", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", selfMaxHpBuff: 0.8 },
    ni_tian_can_ren: { id: "ni_tian_can_ren", name: "\u9006\u5929\u6B8B\u5203", mpCost: 60, type: "attack", power: 120, frequency: 8, range: 3, targetCount: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76843\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "3\u4E2A" },
    dao_guang_jian_ying: { id: "dao_guang_jian_ying", name: "\u5200\u5149\u5251\u5F71", mpCost: 50, type: "attack", power: 140, frequency: 4, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210140%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A" },
    tian_han_di_dong: { id: "tian_han_di_dong", name: "\u5929\u5BD2\u5730\u51BB", mpCost: 50, type: "attack", power: 150, frequency: 4, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5728\u76EE\u6807\u811A\u4E0B\u4EA7\u751F\u96EA\u5730", attribute: "water", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", createSnowTerrain: true },
    terror_scream: { id: "terror_scream", name: "\u6050\u6016\u5C16\u53EB", mpCost: 50, type: "attack", power: 150, frequency: 8, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u57282\u683C\u8303\u56F4\u5185\u7684\u7A7A\u683C\u968F\u673A\u751F\u62101\u53EA\u666E\u901A\u4E27\u5C38", attribute: "dark", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond", summonZombie: true },
    tian_beng_di_lie: { id: "tian_beng_di_lie", name: "\u5929\u5D29\u5730\u88C2", mpCost: 60, type: "attack", power: 80, frequency: 6, range: 0, areaRange: 1, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF91\u683C\u6B63\u65B9\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621080%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "fire", attribute: "earth", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "AOE", rangeType: "square" },
    luo_tu_fei_yan: { id: "luo_tu_fei_yan", name: "\u843D\u571F\u98DE\u5CA9", mpCost: 75, type: "attack", power: 150, frequency: 8, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u5F3A\u529B\u3011\u72B6\u6001", effectType: "earth", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", selfStatusEffects: ["strong"] },
    lingqisi: { id: "lingqisi", name: "\u7075\u6C14\u4E1D", mpCost: 40, type: "attack", power: 130, frequency: 6, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u6062\u590D\u81EA\u8EAB\u9020\u6210\u4F24\u5BB338%\u7684\u751F\u547D\u503C", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", lifesteal: 0.385 },
    xing_huo_liao_yuan: { id: "xing_huo_liao_yuan", name: "\u661F\u706B\u71CE\u539F", mpCost: 60, type: "attack", power: 130, frequency: 6, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "fire", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A" },
    ju_huo_fen_tian: { id: "ju_huo_fen_tian", name: "\u4E3E\u706B\u711A\u5929", mpCost: 50, type: "attack", power: 120, frequency: 6, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u5F3A\u529B\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", selfStatusEffects: ["strong"] },
    yuan_cheng_dao_dan: { id: "yuan_cheng_dao_dan", name: "\u8FDC\u7A0B\u5BFC\u5F39", mpCost: 75, type: "attack", power: 130, frequency: 6, range: 4, areaRange: 1, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76841\u4E2A\u683C\u5B50\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76841\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "metal", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u8F70\u70B8", rangeType: "diamond" },
    jing_zhun_da_ji: { id: "jing_zhun_da_ji", name: "\u7CBE\u51C6\u6253\u51FB", mpCost: 60, type: "attack", power: 130, frequency: 6, range: 4, targetCount: 2, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "2\u4E2A" },
    gong_cheng_zhong_pao: { id: "gong_cheng_zhong_pao", name: "\u653B\u57CE\u91CD\u70AE", mpCost: 80, type: "attack", power: 220, frequency: 6, range: 5, areaRange: 1, description: "\u9009\u62E95\u683C\u8303\u56F4\u5185\u76841\u4E2A\u683C\u5B50\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76841\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210220%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF1B\u81EA\u8EAB\u9677\u5165\u3010\u7638\u817F\u3011\u548C\u3010\u9E70\u773C\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "5\u683C", targetCountTag: "\u8F70\u70B8", rangeType: "diamond", selfStatusEffects: ["lame", "eagle_eye"] },
    hong_lian_hua_huo: { id: "hong_lian_hua_huo", name: "\u7EA2\u83B2\u82B1\u706B", mpCost: 80, type: "attack", power: 150, frequency: 6, range: 3, targetCount: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u71C3\u70E7\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "burning" },
    she_jian_du_wen: { id: "she_jian_du_wen", name: "\u86C7\u5251\u6BD2\u543B", mpCost: 80, type: "attack", power: 120, frequency: 6, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001", effectType: "earth", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffect: "bleeding" },
    xie_shen_di_yu: { id: "xie_shen_di_yu", name: "\u90AA\u795E\u4F4E\u8BED", mpCost: 90, type: "attack", power: 120, frequency: 8, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u8FF7\u79BB\u3011\u72B6\u6001", effectType: "shadow", attribute: "earth", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", statusEffect: "mili", rangeType: "diamond" },
    rao_luan_xin_shen: { id: "rao_luan_xin_shen", name: "\u6270\u4E71\u5FC3\u795E", mpCost: 80, type: "attack", power: 180, frequency: 6, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210180%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u9A71\u6563\u76EE\u6807\u6240\u6709\u6B63\u9762\u72B6\u6001", effectType: "shadow", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", clearPositiveStatus: true },
    yi_jian_ting_yu: { id: "yi_jian_ting_yu", name: "\u5955\u5251\u542C\u96E8", mpCost: 100, type: "attack", power: 120, frequency: 8, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u81EA\u8EAB\u83B7\u5F97\u3010\u5F3A\u529B\u3011\u548C\u3010\u8FC5\u6377\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond", selfStatusEffects: ["strong", "swift"] },
    ling_yun_fei_jian: { id: "ling_yun_fei_jian", name: "\u51CC\u4E91\u98DE\u5251", mpCost: 75, type: "attack", power: 130, frequency: 6, range: 3, targetCount: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76843\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "metal", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "3\u4E2A" },
    ju_qi_cheng_ren: { id: "ju_qi_cheng_ren", name: "\u805A\u6C14\u6210\u5203", mpCost: 65, type: "attack", power: 150, frequency: 6, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A" },
    yin_yang_kui_lei_shu: { id: "yin_yang_kui_lei_shu", name: "\u9634\u9633\u5080\u5121\u672F", mpCost: 90, type: "attack", power: 180, frequency: 8, range: 3, targetCount: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210180%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u8106\u5F31\u3011\u72B6\u6001", effectType: "earth", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "fragile" },
    meng_hu_xia_shan: { id: "meng_hu_xia_shan", name: "\u731B\u864E\u4E0B\u5C71", mpCost: 60, type: "attack", power: 180, frequency: 6, range: 1, targetCount: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210180%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A" },
    meng_hu_si_hou: { id: "meng_hu_si_hou", name: "\u731B\u864E\u5636\u543C", mpCost: 60, type: "attack", power: 70, frequency: 8, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u621070%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u8106\u5F31\u3011\u72B6\u6001", effectType: "earth", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffect: "fragile" },
    da_di_zhong_ji: { id: "da_di_zhong_ji", name: "\u5927\u5730\u91CD\u51FB", mpCost: 75, type: "attack", power: 130, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "earth", attribute: "earth", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    man_jia_chong_ji: { id: "man_jia_chong_ji", name: "\u86EE\u7532\u51B2\u51FB", mpCost: 60, type: "attack", power: 160, frequency: 4, range: 2, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210160%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u521A\u6BC5\u3011\u72B6\u6001", effectType: "earth", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", selfStatusEffects: ["resolute"] },
    sui_lie_zhong_ji: { id: "sui_lie_zhong_ji", name: "\u788E\u88C2\u91CD\u51FB", mpCost: 75, type: "attack", power: 200, frequency: 6, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210200%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7729\u6655\u3011\u72B6\u6001", effectType: "earth", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", statusEffect: "stun" },
    mo_lian_gui_shou: { id: "mo_lian_gui_shou", name: "\u9B54\u6B93\u9B3C\u624B", mpCost: 50, type: "attack", power: 120, frequency: 6, range: 0, areaRange: 1, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF91\u683C\u6B63\u65B9\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u6062\u590D\u81EA\u8EAB\u9020\u6210\u4F24\u5BB3\u603B\u548C35%\u7684\u751F\u547D\u503C", effectType: "shadow", attribute: "earth", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "AOE", rangeType: "square", lifesteal: 0.35 },
    qian_zhu_sui_ying: { id: "qian_zhu_sui_ying", name: "\u5343\u86DB\u788E\u5F71", mpCost: 60, type: "attack", power: 110, frequency: 6, range: 3, targetCount: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76843\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210110%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "wood", attribute: "wood", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "3\u4E2A" },
    ju_du_shi_gu: { id: "ju_du_shi_gu", name: "\u5DE8\u6BD2\u566C\u9AA8", mpCost: 50, type: "attack", power: 120, frequency: 6, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001", effectType: "wood", attribute: "wood", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "poison" },
    die_xue_ci_ji: { id: "die_xue_ci_ji", name: "\u558B\u8840\u523A\u51FB", mpCost: 50, type: "attack", power: 150, frequency: 6, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001", effectType: "wind", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", statusEffect: "bleeding" },
    zi_bao_du_ye: { id: "zi_bao_du_ye", name: "\u81EA\u7206\u6BD2\u6DB2", mpCost: 100, type: "attack", power: 150, frequency: 10, range: 1, areaRange: 1, description: "\u5F15\u7206\u81EA\u8EAB\uFF08\u76F4\u63A5\u6218\u8D25\u9000\u573A\uFF09\uFF0C\u5BF9\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\u76841\u683C\u6B63\u65B9\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001", effectType: "wood", attribute: "wood", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "AOE", statusEffect: "poison", rangeType: "square", selfDefeat: true },
    zhai_ye_fei_hua: { id: "zhai_ye_fei_hua", name: "\u6458\u53F6\u98DE\u82B1", mpCost: 50, type: "attack", power: 100, frequency: 6, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210(100%+20%*\u4E0E\u76EE\u6807\u8DDD\u79BB)\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001", effectType: "wind", attribute: "wind", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "bleeding", damageFormula: "move_based" },
    wan_ye_fei_hua: { id: "wan_ye_fei_hua", name: "\u4E07\u53F6\u98DE\u82B1", mpCost: 75, type: "attack", power: 110, frequency: 8, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210110%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001", effectType: "wind", attribute: "wind", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffect: "bleeding" },
    yin_yang_yu_shou_yin: { id: "yin_yang_yu_shou_yin", name: "\u9634\u9633\u7389\u624B\u5370", mpCost: 75, type: "attack", power: 300, frequency: 8, range: 3, targetCount: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76843\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u603B\u8BA1\u9020\u6210300%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u6839\u636E\u76EE\u6807\u6570\u91CF\u5747\u644A\u4F24\u5BB3", attribute: "dark", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "3\u4E2A" },
    xi_xue: { id: "xi_xue", name: "\u5438\u8840", mpCost: 50, type: "attack", power: 120, frequency: 4, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u6062\u590D\u81EA\u8EAB\u9020\u6210\u4F24\u5BB367%\u7684\u751F\u547D\u503C", effectType: "shadow", attribute: "dark", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", lifesteal: 0.667 },
    ling_hun_zu_zhou: { id: "ling_hun_zu_zhou", name: "\u7075\u9B42\u8BC5\u5492", mpCost: 60, type: "attack", power: 110, frequency: 6, range: 5, description: "\u9009\u62E95\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210110%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6C89\u9ED8\u3011\u72B6\u6001\uFF0C\u6301\u7EED6\u79D2", effectType: "shadow", attribute: "dark", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "5\u683C", targetCountTag: "1\u4E2A", statusEffect: "silenced" },
    ling_hun_rao_luan: { id: "ling_hun_rao_luan", name: "\u7075\u9B42\u6270\u4E71", mpCost: 75, type: "attack", power: 75, frequency: 6, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u621075%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u5FC3\u4E71\u3011\u72B6\u6001", effectType: "shadow", attribute: "dark", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffect: "xinluan" },
    mei_huo: { id: "mei_huo", name: "\u9B45\u60D1", mpCost: 50, type: "attack", power: 120, frequency: 6, range: 2, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u5FC3\u4E71\u3011\u72B6\u6001", effectType: "shadow", attribute: "water", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", statusEffect: "xinluan" },
    pu_tong_hu_li: { id: "pu_tong_hu_li", name: "\u666E\u901A\u62A4\u7406", mpCost: 25, type: "heal", power: 50, frequency: 4, range: 2, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u6307\u5B9A\u76EE\u6807\uFF0C\u6062\u590D\u751F\u547D\u503C\u548C\u6CD5\u529B\u503C\uFF0C\u6062\u590D\u91CF\u4E3A50%\u7684\u653B\u51FB\u529B", attribute: "normal", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "2\u683C", targetCountTag: "1\u4E2A" },
    jin_ji_zhi_liao: { id: "jin_ji_zhi_liao", name: "\u7D27\u6025\u6CBB\u7597", mpCost: 50, type: "heal", power: 150, frequency: 6, range: 2, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u6307\u5B9A\u76EE\u6807\uFF0C\u6062\u590D\u751F\u547D\u503C\u548C\u6CD5\u529B\u503C\uFF0C\u6062\u590D\u91CF\u4E3A150%\u7684\u653B\u51FB\u529B\uFF0C\u5E76\u9A71\u6563\u76EE\u6807\u6240\u6709\u4E0D\u826F\u72B6\u6001", attribute: "normal", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "2\u683C", targetCountTag: "1\u4E2A" },
    zhao_huan_ling_chong: { id: "zhao_huan_ling_chong", name: "\u53EC\u5524\u7075\u5BA0", mpCost: 75, type: "support", power: 0, frequency: 10, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u7A7A\u683C\uFF0C\u53EC\u5524\u4E00\u53EA\u804C\u4E1A\u4E3A\u3010\u7075\u5BA0\u3011\u7684\u968F\u673A\u89D2\u8272", attribute: "water", category: "summon", skillTypeTag: "\u53EC\u5524", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", summonJob: "\u7075\u5BA0" },
    gao_shan_liu_shui: { id: "gao_shan_liu_shui", name: "\u9AD8\u5C71\u6D41\u6C34", mpCost: 75, type: "heal", power: 120, frequency: 6, range: 4, targetCount: 2, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76842\u4E2A\u6307\u5B9A\u76EE\u6807\uFF0C\u6062\u590D\u751F\u547D\u503C\u548C\u6CD5\u529B\u503C\uFF0C\u6062\u590D\u91CF\u4E3A75%\u7684\u653B\u51FB\u529B\uFF0C\u5E76\u9A71\u6563\u76EE\u6807\u6240\u6709\u4E0D\u826F\u72B6\u6001", attribute: "water", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "4\u683C", targetCountTag: "2\u4E2A" },
    lian_yu_huo_hai: { id: "lian_yu_huo_hai", name: "\u70BC\u72F1\u706B\u6D77", mpCost: 90, type: "attack", power: 95, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621095%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u71C3\u70E7\u3011\u72B6\u6001", attribute: "fire", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", statusEffect: "burning", rangeType: "diamond" },
    wang_zhe_zhi_qi: { id: "wang_zhe_zhi_qi", name: "\u4EA1\u8005\u4E4B\u6C14", mpCost: 70, type: "attack", power: 100, frequency: 6, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210100%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u5FC3\u4E71\u3011\u72B6\u6001", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffect: "xinluan" },
    ku_lou_xue_shou_yin: { id: "ku_lou_xue_shou_yin", name: "\u9AB7\u9AC5\u8840\u624B\u5370", mpCost: 60, type: "attack", power: 160, frequency: 6, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210160%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "bleeding" },
    liu_hun_kong_zhou: { id: "liu_hun_kong_zhou", name: "\u516D\u9B42\u6050\u5492", mpCost: 80, type: "attack", power: 150, frequency: 8, range: 2, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u548C\u3010\u6C89\u9ED8\u3011\u72B6\u6001", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", statusEffects: ["poison", "silenced"] },
    zhi_yu_zhi_guang: { id: "zhi_yu_zhi_guang", name: "\u6CBB\u6108\u4E4B\u5149", mpCost: 70, type: "heal", power: 100, frequency: 8, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u53CB\u65B9\u76EE\u6807\uFF0C\u6062\u590D\u81EA\u5DF1\u548C\u8BE5\u76EE\u6807100%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\u4E0E\u6CD5\u529B\u503C\uFF0C\u5E76\u9A71\u6563\u76EE\u6807\u6240\u6709\u4E0D\u826F\u72B6\u6001", attribute: "wind", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "1\u4E2A" },
    emp_chong_ji_bo: { id: "emp_chong_ji_bo", name: "EMP\u51B2\u51FB\u6CE2", mpCost: 100, type: "attack", power: 120, frequency: 8, range: 3, areaRange: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u683C\u5B50\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76841\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B120%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6C89\u9ED8\u3011\u72B6\u6001\uFF0C\u6301\u7EED4\u79D2", effectType: "wind", attribute: "wind", category: "aoe", skillTypeTag: "\u653B\u51FB", elementTag: "\u98CE", rangeTag: "3\u683C", targetCountTag: "\u8F70\u70B8", rangeType: "diamond", statusEffect: "silenced", statusEffectDuration: 4 },
    fu_she_da_ji: { id: "fu_she_da_ji", name: "\u8F90\u5C04\u6253\u51FB", mpCost: 80, type: "attack", power: 150, frequency: 6, range: 4, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001", attribute: "wind", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "1\u4E2A", statusEffect: "poison" },
    huo_yu_liu_xing: { id: "huo_yu_liu_xing", name: "\u706B\u7FBD\u6D41\u661F", mpCost: 80, type: "attack", power: 70, frequency: 6, range: 3, targetCount: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76843\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u621070%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "fire", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "3\u4E2A" },
    tian_ya_qing_qing: { id: "tian_ya_qing_qing", name: "\u5929\u96C5\u503E\u60C5", mpCost: 60, type: "heal", power: 10, frequency: 8, range: 4, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76841\u4E2A\u53CB\u65B9\u76EE\u6807\uFF0C\u6062\u590D\u751F\u547D\u503C\u548C\u6CD5\u529B\u503C\uFF0C\u6062\u590D\u91CF\u4E3A\u81EA\u8EAB10%\u751F\u547D\u503C\u548C\u6CD5\u529B\u503C\u4E0A\u9650\uFF0C\u5E76\u6D88\u9664\u6240\u6709\u4E0D\u826F\u72B6\u6001", attribute: "yang", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "4\u683C", targetCountTag: "1\u4E2A" },
    yu_yin_rao_liang: { id: "yu_yin_rao_liang", name: "\u4F59\u97F3\u7ED5\u6881", mpCost: 60, type: "heal", power: 110, frequency: 8, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u53CB\u65B9\u89D2\u8272\uFF08\u53EF\u4EE5\u9009\u81EA\u5DF1\uFF09\uFF0C\u6062\u590D\u653B\u51FB\u529B110%\u7684\u751F\u547D\u503C\u548C40%\u653B\u51FB\u529B\u7684\u6CD5\u529B\u503C\uFF0C\u5E76\u83B7\u5F97\u3010\u8C03\u606F\u3011\u72B6\u6001", attribute: "wind", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "1\u4E2A" },
    feng_mo_qin_xin: { id: "feng_mo_qin_xin", name: "\u75AF\u9B54\u7434\u5FC3", mpCost: 60, type: "heal", power: 120, frequency: 8, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u53CB\u65B9\u89D2\u8272\uFF08\u53EF\u4EE5\u9009\u81EA\u5DF1\uFF09\uFF0C\u6062\u590D\u653B\u51FB\u529B120%\u7684\u751F\u547D\u503C\uFF0C\u5E76\u83B7\u5F97\u3010\u5F3A\u529B\u3011\u72B6\u6001", attribute: "wind", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "1\u4E2A" },
    shi_xin_shi_sui: { id: "shi_xin_shi_sui", name: "\u566C\u5FC3\u98DF\u9AD3", mpCost: 60, type: "attack", power: 150, frequency: 8, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "poison" },
    tian_luo_di_wang: { id: "tian_luo_di_wang", name: "\u5929\u7F57\u5730\u7F51", mpCost: 60, type: "attack", power: 120, frequency: 8, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7638\u817F\u3011\u72B6\u6001", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffect: "lame" },
    tao_zhi_yao_yao: { id: "tao_zhi_yao_yao", name: "\u6843\u4E4B\u592D\u592D", mpCost: 75, type: "attack", power: 150, frequency: 8, range: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u8FF7\u79BB\u3011\u72B6\u6001", attribute: "wood", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "mili" },
    tao_hua_zhuo_zhuo: { id: "tao_hua_zhuo_zhuo", name: "\u6843\u82B1\u707C\u707C", mpCost: 60, type: "heal", power: 120, frequency: 8, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u53CB\u65B9\u89D2\u8272\uFF0C\u6062\u590D120%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\uFF0C\u5E76\u83B7\u5F97\u3010\u6108\u5408\u3011\u72B6\u6001", attribute: "wood", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "2\u4E2A" },
    tun_jiu_kuang_xiao: { id: "tun_jiu_kuang_xiao", name: "\u541E\u9152\u72C2\u5578", mpCost: 80, type: "attack", power: 150, frequency: 6, range: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A3\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u6124\u6012\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "\u76F4\u7EBF", selfStatusEffects: ["fury"] },
    nu_za_hu_lu: { id: "nu_za_hu_lu", name: "\u6012\u7838\u846B\u82A6", mpCost: 60, type: "attack", power: 150, frequency: 8, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u8106\u76AE\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", selfStatusEffects: ["crumble"] },
    bi_hai_chao_sheng: { id: "bi_hai_chao_sheng", name: "\u78A7\u6D77\u6F6E\u751F", mpCost: 75, type: "heal", power: 120, frequency: 6, range: 0, areaRange: 3, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u53CB\u65B9\u89D2\u8272\uFF0C\u6062\u590D120%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u6108\u5408\u3011\u72B6\u6001", effectType: "water", attribute: "water", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "AOE", selfStatusEffects: ["heal"] },
    shui_man_jin_shan: { id: "shui_man_jin_shan", name: "\u6C34\u6F2B\u91D1\u5C71", mpCost: 75, type: "attack", power: 80, frequency: 8, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621080%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u521A\u6BC5\u3011\u72B6\u6001", effectType: "water", attribute: "water", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond", selfStatusEffects: ["resolute"] },
    mo_yu_he_ling: { id: "mo_yu_he_ling", name: "\u58A8\u7FBD\u9E64\u7FCE", mpCost: 80, type: "attack", power: 130, frequency: 6, range: 3, targetCount: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76843\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u9E70\u773C\u3011\u72B6\u6001", effectType: "shadow", attribute: "wind", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "3\u4E2A", selfStatusEffects: ["eagle_eye"] },
    mo_ying_jian_guang: { id: "mo_ying_jian_guang", name: "\u58A8\u5F71\u5251\u5149", mpCost: 100, type: "attack", power: 150, frequency: 8, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "shadow", attribute: "wind", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    fu_guang_lue_ying: { id: "fu_guang_lue_ying", name: "\u6D6E\u5149\u63A0\u5F71", mpCost: 80, type: "heal", power: 50, frequency: 8, range: 0, areaRange: 2, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u53CB\u65B9\u89D2\u8272\uFF0C\u6062\u590D50%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\u4E0E\u6CD5\u529B\u503C\uFF0C\u5E76\u4E14\u83B7\u5F97\u3010\u8FC5\u6377\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "2\u683C", targetCountTag: "AOE", selfStatusEffects: ["swift"] },
    gao_bie_ming_deng: { id: "gao_bie_ming_deng", name: "\u544A\u522B\u669D\u706F", mpCost: 100, type: "attack", power: 120, frequency: 8, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u8106\u76AE\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffect: "crumble" },
    shen_zhi_yi_shou: { id: "shen_zhi_yi_shou", name: "\u795E\u4E4B\u4E00\u624B", mpCost: 75, type: "attack", power: 200, frequency: 6, range: 3, targetCount: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210200%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u9E70\u773C\u3011\u548C\u3010\u8C03\u606F\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", selfStatusEffects: ["eagle_eye", "tune"] },
    yin_yang_qi_he: { id: "yin_yang_qi_he", name: "\u9634\u9633\u6C14\u5408", mpCost: 75, type: "heal", power: 40, frequency: 8, range: 0, areaRange: 2, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u53CB\u65B9\u89D2\u8272\uFF08\u5305\u62EC\u81EA\u5DF1\uFF09\uFF0C\u6062\u590D40%\u653B\u51FB\u529B\u7684\u6CD5\u529B\uFF0C\u5E76\u83B7\u5F97\u3010\u8C03\u606F\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "2\u683C", targetCountTag: "AOE", selfStatusEffects: ["tune"] },
    cang_jian_yi_ye: { id: "cang_jian_yi_ye", name: "\u85CF\u5251\u4E00\u53F6", mpCost: 80, type: "attack", power: 200, frequency: 6, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210200%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u8FF7\u79BB\u3011\u72B6\u6001", effectType: "wood", attribute: "wood", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", statusEffect: "mili" },
    mu_feng_wei_shang: { id: "mu_feng_wei_shang", name: "\u6C90\u98CE\u4E3A\u88F3", mpCost: 90, type: "heal", power: 50, frequency: 8, range: 3, targetCount: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u53CB\u65B9\u76EE\u6807\uFF0C\u6062\u590D\u81EA\u8EAB\u548C\u8BE5\u76EE\u680750%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\u548C60%\u653B\u51FB\u529B\u7684\u6CD5\u529B\u503C\uFF0C\u9A71\u6563\u6240\u6709\u4E0D\u826F\u72B6\u6001", effectType: "wind", attribute: "wood", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "1\u4E2A" },
    huo_yan_pen_she: { id: "huo_yan_pen_she", name: "\u706B\u7130\u55B7\u5C04", mpCost: 60, type: "attack", power: 150, frequency: 6, range: 1, sweepLength: 1, sweepWidth: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F1\u5BBD3\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B150%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u71C3\u70E7\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1x3", statusEffect: "burning" },
    zhao_huan_wawa: { id: "zhao_huan_wawa", name: "\u53EC\u5524\u5A03\u5A03", mpCost: 80, type: "support", power: 0, frequency: 6, range: 2, targetCount: 2, description: "\u9009\u62E92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76842\u4E2A\u7A7A\u5730\uFF0C\u53EC\u5524\u51FA2\u4E2A\u3010\u5080\u5121\u5A03\u5A03\u3011\uFF0C\u7EE7\u627F\u65BD\u6CD5\u8005\u9635\u8425", attribute: "dark", category: "summon", skillTypeTag: "\u53EC\u5524", rangeTag: "2\u683C", targetCountTag: "2\u4E2A", summonCharacter: "kuilei" },
    xi_rang_zai_sheng: { id: "xi_rang_zai_sheng", name: "\u606F\u58E4\u518D\u751F", mpCost: 70, type: "attack", power: 120, frequency: 6, range: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u6062\u590D\u81EA\u8EAB60%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u521A\u6BC5\u3011\u72B6\u6001", effectType: "earth", attribute: "normal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", lifesteal: 0.5, selfStatusEffects: ["resolute"] },
    zhao_huan_nvhuang: { id: "zhao_huan_nvhuang", name: "\u53EC\u5524\u5973\u7687", mpCost: 125, type: "support", power: 0, frequency: 8, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u7A7A\u5730\uFF0C\u53EC\u5524\u51FA1\u4E2A\u3010\u5080\u5121\u5973\u7687\u3011\uFF0C\u7EE7\u627F\u65BD\u6CD5\u8005\u9635\u8425", attribute: "light", category: "summon", skillTypeTag: "\u53EC\u5524", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", summonCharacter: "kuileinvhuang" },
    feng_wu_liu_huan: { id: "feng_wu_liu_huan", name: "\u51E4\u821E\u516D\u5E7B", mpCost: 100, type: "support", power: 0, frequency: 10, range: 3, targetCount: 2, description: "\u6D88\u8017\u81EA\u8EAB30%\u7684\u751F\u547D\u503C\uFF0C\u9009\u62E93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76842\u4E2A\u7A7A\u683C\uFF0C\u53EC\u5524\u51FA2\u4E2A\u3010\u767D\u51E4\u3011\uFF0C\u53EC\u5524\u51FA\u7684\u89D2\u8272\u4EC5\u6709\u751F\u547D\u503C\u4E0A\u9650\u768430%\u8840\u91CF\uFF0C\u7EE7\u627F\u65BD\u6CD5\u8005\u9635\u8425\uFF0C\u767D\u51E4\u53EA\u6709\u5728\u8840\u91CF>=50%\u751F\u547D\u503C\u4E0A\u9650\u65F6\u53EF\u4EE5\u4F7F\u7528\u8BE5\u6280\u80FD", effectType: "wind", attribute: "wind", category: "summon", skillTypeTag: "\u53EC\u5524", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", summonCharacter: "baifeng", selfHpCost: 0.3, selfHpCostType: "current", summonHpPct: 0.3, selfHpThreshold: 0.5, requireHpGtAtk: true },
    an_ye_jin_sheng: { id: "an_ye_jin_sheng", name: "\u6697\u591C\u5664\u58F0", mpCost: 50, type: "attack", power: 70, frequency: 8, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u5206\u522B\u9020\u621070%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6C89\u9ED8\u3011\u72B6\u6001\uFF0C\u6301\u7EED6\u79D2", effectType: "shadow", attribute: "dark", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffect: "silenced" },
    po_jing_chong_yuan: { id: "po_jing_chong_yuan", name: "\u7834\u955C\u91CD\u5706", mpCost: 50, type: "attack", power: 150, frequency: 4, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u82E5\u76EE\u6807\u6709\u589E\u76CA\u72B6\u6001\u5219\u81EA\u8EAB\u83B7\u5F97\u76F8\u540C\u589E\u76CA", effectType: "metal", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A" },
    yue_zhi_yin_li: { id: "yue_zhi_yin_li", name: "\u6708\u4E4B\u5F15\u529B", mpCost: 80, type: "support", power: 0, frequency: 10, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u540C\u9635\u8425\u76EE\u6807\uFF0C\u81EA\u8EAB\u548C\u8BE5\u76EE\u6807\u83B7\u5F97\u3010\u6108\u5408\u3011\u548C\u3010\u8C03\u606F\u3011\u72B6\u6001", effectType: "water", attribute: "water", category: "support", skillTypeTag: "\u8F85\u52A9", rangeTag: "2\u683C", targetCountTag: "1\u4E2A" },
    tian_tu_zhan_fang: { id: "tian_tu_zhan_fang", name: "\u5929\u5154\u7EFD\u653E", mpCost: 60, type: "attack", power: 150, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "water", attribute: "water", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    fei_xue_meng_ji: { id: "fei_xue_meng_ji", name: "\u6CB8\u8840\u731B\u51FB", mpCost: 80, type: "attack", power: 210, frequency: 6, range: 1, targetCount: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210210%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u635F\u593110%\u6700\u5927\u751F\u547D\u503C\u5E76\u83B7\u5F97\u3010\u6124\u6012\u3011\u72B6\u6001", effectType: "earth", attribute: "earth", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", selfHpCost: 0.1, selfStatusEffects: ["fury"] },
    wu_di_niu_niu: { id: "wu_di_niu_niu", name: "\u65E0\u654C\u725B\u725B", mpCost: 100, type: "heal", power: 100, frequency: 10, range: 0, targetCount: 1, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u76EE\u6807\uFF0C\u6062\u590D\u81EA\u8EAB100%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\uFF0C\u9A71\u6563\u6240\u6709\u4E0D\u826F\u72B6\u6001\uFF0C\u5E76\u4E14\u81EA\u8EAB\u83B7\u5F97\u3010\u6108\u5408\u3011\u72B6\u6001", effectType: "earth", attribute: "earth", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", selfStatusEffects: ["heal"] },
    jian_yu: { id: "jian_yu", name: "\u7BAD\u96E8", mpCost: 80, type: "attack", power: 80, frequency: 6, range: 4, areaRange: 2, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76841\u4E2A\u683C\u5B50\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76842\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621080%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "wind", attribute: "wind", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u8F70\u70B8", rangeType: "diamond" },
    sui_xing: { id: "sui_xing", name: "\u788E\u661F", mpCost: 80, type: "attack", power: 200, frequency: 8, range: 4, targetCount: 1, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210200%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001", effectType: "wind", attribute: "wind", category: "\u6307\u5B9A", statusEffect: "bleeding", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "1\u4E2A" },
    miao_shou: { id: "miao_shou", name: "\u5999\u624B", mpCost: 80, type: "heal", power: 100, frequency: 8, range: 3, targetCount: 1, description: "\u9009\u62E93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76841\u4E2A\u53CB\u65B9\u5355\u4F4D\uFF08\u53EF\u4EE5\u9009\u62E9\u81EA\u8EAB\uFF09\uFF0C\u6062\u590D100%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\uFF0C\u4F7F\u76EE\u6807\u83B7\u5F97\u3010\u6108\u5408\u3011\u72B6\u6001\uFF0C\u5E76\u9A71\u6563\u76EE\u6807\u6240\u6709\u4E0D\u826F\u72B6\u6001", effectType: "water", attribute: "water", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "1\u4E2A" },
    cuo_gu: { id: "cuo_gu", name: "\u9519\u9AA8", mpCost: 80, type: "attack", power: 50, frequency: 8, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u621050%\u653B\u51FB\u529B+20%\u5F53\u524D\u751F\u547D\u503C\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7D0A\u4E71\u3011\u72B6\u6001", effectType: "water", attribute: "water", category: "\u6307\u5B9A", damageFormula: "atk_plus_hp_pct", hpPct: 0.2, statusEffect: "disorder", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A" },
    you_ju_xi_tian: { id: "you_ju_xi_tian", name: "\u5E7D\u9A79\u88AD\u5929", mpCost: 50, type: "attack", power: 100, frequency: 6, range: 0, areaRange: 1, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF91\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210100%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "shadow", attribute: "dark", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    zhao_huan_you_ju: { id: "zhao_huan_you_ju", name: "\u53EC\u5524\u5E7D\u9A79", mpCost: 125, type: "support", power: 0, frequency: 12, range: 2, targetCount: 1, description: "\u9009\u62E9\u81EA\u8EAB2\u683C\u8303\u56F4\u5185\u76841\u4E2A\u7A7A\u683C\uFF0C\u53EC\u5524\u89D2\u8272\u3010\u5E7D\u9A79\u3011", effectType: "shadow", attribute: "dark", category: "summon", skillTypeTag: "\u53EC\u5524", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", summonCharacter: "youju" },
    ba_wang_qiang: { id: "ba_wang_qiang", name: "\u9738\u738B\u67AA", mpCost: 65, type: "attack", power: 150, frequency: 6, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u4F7F\u5BF9\u65B9\u9677\u5165\u3010\u71C3\u70E7\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", statusEffect: "burning" },
    zhen_long_sha: { id: "zhen_long_sha", name: "\u9547\u9F99\u6740", mpCost: 80, type: "attack", power: 120, frequency: 8, range: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A3\u683C\u8303\u56F4\u4EE5\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "thunder", attribute: "metal", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "\u76F4\u7EBF" },
    ji_gu_tu: { id: "ji_gu_tu", name: "\u621F\u9AA8\u7A81", mpCost: 75, type: "attack", power: 120, frequency: 8, range: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A3\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001", effectType: "shadow", attribute: "dark", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "\u76F4\u7EBF", statusEffect: "poison" },
    duan_yan_sui_feng_bo: { id: "duan_yan_sui_feng_bo", name: "\u65AD\u5CA9\u788E\u98CE\u6CE2", mpCost: 75, type: "attack", power: 100, frequency: 6, range: 1, sweepLength: 1, sweepWidth: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F1\u5BBD3\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B100%\u7684\u4F24\u5BB3", effectType: "earth", attribute: "earth", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1x3" },
    yun_he_xiang_wu: { id: "yun_he_xiang_wu", name: "\u4E91\u9E64\u7FD4\u821E", mpCost: 60, type: "attack", power: 60, frequency: 6, range: 4, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A4\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u621060%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "wind", attribute: "wind", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u76F4\u7EBF" },
    long_zhan_yu_ye: { id: "long_zhan_yu_ye", name: "\u9F99\u6218\u4E8E\u91CE", mpCost: 70, type: "attack", power: 110, frequency: 6, range: 4, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A4\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u6210110%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u71C3\u70E7\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u76F4\u7EBF", statusEffect: "burning" },
    you_long_bai_wei: { id: "you_long_bai_wei", name: "\u6E38\u9F99\u6446\u5C3E", mpCost: 90, type: "attack", power: 150, frequency: 8, range: 2, sweepLength: 2, sweepWidth: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F2\u5BBD3\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u71C3\u70E7\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "2x3", statusEffect: "burning" },
    cang_hai_long_yin: { id: "cang_hai_long_yin", name: "\u6CA7\u6D77\u9F99\u541F", mpCost: 70, type: "attack", power: 50, frequency: 6, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621050%\u7684\u4F24\u5BB3", effectType: "fire", attribute: "fire", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    kongshan_niaoyu: { id: "kongshan_niaoyu", name: "\u7A7A\u5C71\u9E1F\u8BED", mpCost: 80, type: "heal", power: 50, frequency: 8, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u53CB\u65B9\u76EE\u6807\uFF0C\u6062\u590D50%\u653B\u51FB\u529B\u7684\u751F\u547D\u503C\u548C20%\u653B\u51FB\u529B\u7684\u6CD5\u529B\u503C", effectType: "wind", attribute: "wind", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    bainiao_zhaofeng: { id: "bainiao_zhaofeng", name: "\u767E\u9E1F\u671D\u51E4", mpCost: 80, type: "attack", power: 60, frequency: 6, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B60%\u7684\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u6108\u5408\u3011\u548C\u3010\u8C03\u606F\u3011\u72B6\u6001", effectType: "wind", attribute: "wind", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond", selfStatusEffects: ["heal", "tune"] },
    lie_di_zhan: { id: "lie_di_zhan", name: "\u88C2\u5730\u65A9", mpCost: 80, type: "attack", power: 50, frequency: 6, range: 0, areaRange: 1, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF91\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u621050%\u653B\u51FB\u529B+\u635F\u5931\u751F\u547D\u767E\u5206\u6BD4*\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "earth", attribute: "fire", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "AOE", rangeType: "diamond", damageFormula: "hp_lost_pct" },
    shan_he_zhen: { id: "shan_he_zhen", name: "\u5C71\u6CB3\u9707", mpCost: 70, type: "attack", power: 110, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B110%\u7684\u4F24\u5BB3", effectType: "earth", attribute: "earth", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    wenyi_chuanbo: { id: "wenyi_chuanbo", name: "\u761F\u75AB\u4F20\u64AD", mpCost: 70, type: "attack", power: 110, frequency: 6, range: 0, areaRange: 1, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF91\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210110%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001", effectType: "water", attribute: "water", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "AOE", rangeType: "diamond", statusEffect: "poison" },
    shushu_dadao: { id: "shushu_dadao", name: "\u9F20\u9F20\u5927\u76D7", mpCost: 70, type: "attack", power: 160, frequency: 6, range: 2, targetCount: 1, description: "\u9009\u62E92\u683C\u8303\u56F4\u5185\u76841\u4E2A\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B160%\u7684\u4F24\u5BB3\uFF0C\u9A71\u6563\u76EE\u6807\u7684\u968F\u673A\u4E00\u4E2A\u589E\u76CA\u72B6\u6001\uFF0C\u5E76\u4E14\u81EA\u8EAB\u83B7\u5F97\u8BE5\u589E\u76CA\u72B6\u6001", effectType: "water", attribute: "water", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1\u4E2A", stealBuff: true },
    kubi_zhou: { id: "kubi_zhou", name: "\u67AF\u7B14\u5492", mpCost: 60, type: "attack", power: 120, frequency: 6, range: 3, targetCount: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B120%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7D0A\u4E71\u3011\u72B6\u6001", effectType: "wood", attribute: "wood", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "disorder" },
    jiujie_fengling: { id: "jiujie_fengling", name: "\u65E7\u7C4D\u5C01\u7075", mpCost: 60, type: "attack", power: 60, frequency: 6, range: 3, targetCount: 3, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76843\u4E2A\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B60%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7981\u9522\u3011\u72B6\u6001\uFF08\u6301\u7EED4\u79D2\uFF09", effectType: "wood", attribute: "wood", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "3\u4E2A", statusEffect: "imprison", statusEffectDuration: 4 },
    ming_chui_sao_yu: { id: "ming_chui_sao_yu", name: "\u51A5\u9524\u626B\u72F1", mpCost: 75, type: "attack", power: 170, frequency: 6, range: 2, sweepLength: 2, sweepWidth: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u4E2A\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F2\u5BBD3\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u6210\u653B\u51FB\u529B170%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u4F7F\u76EE\u6807\u9677\u5165\u3010\u8106\u5F31\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "2x3", statusEffect: "fragile" },
    yu_men_chong_zhen: { id: "yu_men_chong_zhen", name: "\u72F1\u95E8\u91CD\u9707", mpCost: 75, type: "attack", power: 130, frequency: 8, range: 2, targetCount: 2, description: "\u9009\u62E92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76842\u4E2A\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B130%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u4F7F\u76EE\u6807\u9677\u5165\u3010\u865A\u5F31\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "2\u4E2A", statusEffect: "weak", rangeType: "diamond" },
    suo_hun: { id: "suo_hun", name: "\u9501\u9B42", mpCost: 50, type: "attack", power: 150, frequency: 4, range: 3, targetCount: 1, description: "\u9009\u62E93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u4E00\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B150%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7981\u9522\u3011\u72B6\u6001\uFF0C\u6301\u7EED6\u79D2", effectType: "metal", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "imprison", statusEffectDuration: 6, rangeType: "diamond" },
    qiu_ling: { id: "qiu_ling", name: "\u56DA\u7075", mpCost: 100, type: "attack", power: 130, frequency: 8, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76842\u4E2A\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B130%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7981\u9522\u3011\u548C\u3010\u7D0A\u4E71\u3011\u72B6\u6001\uFF0C\u6301\u7EED6\u79D2", effectType: "metal", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", statusEffects: ["imprison", "disorder"], statusEffectsDurations: [6, 6], rangeType: "diamond" },
    fu_she_an_ji: { id: "fu_she_an_ji", name: "\u8F90\u5C04\u6697\u8BB0", mpCost: 80, type: "attack", power: 80, frequency: 8, range: 3, targetCount: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u621080%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001", effectType: "dark", attribute: "dark", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "1\u4E2A", statusEffect: "poison" },
    tian_di_sui: { id: "tian_di_sui", name: "\u5929\u5730\u788E\u88C2", mpCost: 75, type: "attack", power: 150, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210150%\u7684\u4F24\u5BB3", effectType: "light", attribute: "light", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    tian_ming_huang_quan: { id: "tian_ming_huang_quan", name: "\u5929\u547D\u7687\u6743", mpCost: 100, type: "summon", power: 0, frequency: 10, range: 3, targetCount: 4, description: "\u9009\u62E93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76844\u4E2A\u7A7A\u5730\uFF0C\u53EC\u5524\u51FA4\u4E2A\u3010\u52A8\u5458\u5175\u3011\uFF0C\u5E76\u4F7F\u81EA\u8EAB\u83B7\u5F97\u3010\u521A\u6BC5\u3011\u548C\u3010\u6108\u5408\u3011\u72B6\u6001\uFF0C\u6301\u7EED6\u79D2", effectType: "light", attribute: "light", category: "summon", skillTypeTag: "\u53EC\u5524", rangeTag: "3\u683C", targetCountTag: "4\u4E2A", summonCharacter: "dongyuan_bing", selfStatusEffects: ["resolute", "heal"], selfStatusEffectsDurations: [3, 3], reikiCost: 30, rangeType: "diamond" },
    man_zhu_sha_hua: { id: "man_zhu_sha_hua", name: "\u66FC\u73E0\u6C99\u534E", mpCost: 100, type: "attack", power: 50, frequency: 10, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621050%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001\uFF0C\u5E76\u6062\u590D\u81EA\u8EAB15%\u7684\u751F\u547D\u503C", effectType: "dark", attribute: "dark", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond", statusEffect: "poison", selfHealPct: 0.15, shaQiCost: 60 },
    xi: { id: "xi", name: "\u56CD", mpCost: 100, type: "attack", power: 66, frequency: 8, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621066%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u865A\u5F31\u3011\u72B6\u6001\uFF0C\u6301\u7EED\u65F6\u95F44\u79D2", effectType: "dark", attribute: "yin", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond", statusEffect: "weak", statusEffectDuration: 4, shaQiCost: 60 },
    ji_shu_huo_jian: { id: "ji_shu_huo_jian", name: "\u96C6\u675F\u706B\u7BAD", mpCost: 100, type: "attack", power: 140, frequency: 8, range: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u4E2D\u7684\u4E00\u4E2A\u65B9\u5411\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A3\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u6210140%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u71C3\u70E7\u3011\u72B6\u6001", effectType: "fire", attribute: "fire", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "\u76F4\u7EBF", statusEffect: "burning" },
    ji_qiang_sao_she: { id: "ji_qiang_sao_she", name: "\u673A\u67AA\u626B\u5C04", mpCost: 80, type: "attack", power: 120, frequency: 6, range: 4, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u4E2D\u7684\u4E00\u4E2A\u65B9\u5411\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A4\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "fire", attribute: "fire", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u76F4\u7EBF" },
    feng_ren_san: { id: "feng_ren_san", name: "\u98CE\u5203\u6563", mpCost: 70, type: "attack", power: 40, frequency: 6, range: 3, sweepLength: 3, sweepWidth: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F3\u5BBD3\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u621040%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "wind", attribute: "wind", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "3x3" },
    shui_huan_xing: { id: "shui_huan_xing", name: "\u6C34\u7F13\u884C", mpCost: 90, type: "attack", power: 70, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621070%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7638\u817F\u3011\u72B6\u6001\uFF0C\u6301\u7EED8\u79D2", effectType: "water", attribute: "water", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond", statusEffect: "lame", statusEffectDuration: 8 },
    huo_yan_niao: { id: "huo_yan_niao", name: "\u706B\u708E\u9E1F", mpCost: 70, type: "attack", power: 90, frequency: 6, range: 4, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u4E2D\u7684\u4E00\u4E2A\u65B9\u5411\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A4\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u621090%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "fire", attribute: "fire", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u76F4\u7EBF" },
    ning_xin_jue: { id: "ning_xin_jue", name: "\u51DD\u5FC3\u8BC0", mpCost: 60, type: "heal", power: 0, frequency: 6, range: 1, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u76EE\u6807\uFF0C\u6062\u590D\u81EA\u8EAB10%\u7684\u751F\u547D\u503C\uFF0C\u5E76\u968F\u673A\u9A71\u6563\u4E24\u4E2A\u8D1F\u9762\u72B6\u6001", attribute: "yang", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", selfHealPct: 0.1, dispelRandomDebuffs: 2 },
    // 玄武技能
    zhen_di_gui_ming: { id: "zhen_di_gui_ming", name: "\u9707\u5730\u9F9F\u9E23", mpCost: 90, type: "attack", power: 55, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621055%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6C89\u9ED8\u3011\u72B6\u6001\uFF0C\u6301\u7EED\u65F6\u95F42\u79D2", effectType: "water", attribute: "water", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond", statusEffect: "silenced", statusEffectDuration: 2 },
    di_shui_chuan_shi: { id: "di_shui_chuan_shi", name: "\u6EF4\u6C34\u7A7F\u77F3", mpCost: 50, type: "attack", power: 90, frequency: 4, range: 4, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u4E2D\u7684\u4E00\u4E2A\u65B9\u5411\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A4\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u621090%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "water", attribute: "water", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u76F4\u7EBF" },
    di_mai_xuan_dun: { id: "di_mai_xuan_dun", name: "\u5730\u8109\u7384\u76FE", mpCost: 70, type: "heal", power: 0, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u53CB\u65B9\u76EE\u6807\uFF08\u5305\u62EC\u81EA\u5DF1\uFF09\uFF0C\u6062\u590D\u751F\u547D\uFF0C\u6062\u590D\u91CF\u4E3A\u7384\u6B66\u751F\u547D\u503C\u4E0A\u9650\u76849%\uFF0C\u5E76\u4E14\u7384\u6B66\u83B7\u5F97\u3010\u521A\u6BC5\u3011\u72B6\u6001\uFF0C\u6301\u7EED\u65F6\u95F44\u79D2", effectType: "water", attribute: "water", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond", selfHealMaxHpPct: 0.09, selfStatusEffects: ["resolute"], statusEffectDuration: 4 },
    wan_gu_jie_jie: { id: "wan_gu_jie_jie", name: "\u4E07\u53E4\u7ED3\u754C", mpCost: 80, type: "heal", power: 0, frequency: 10, range: 1, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u76EE\u6807\uFF0C\u6062\u590D\u81EA\u8EAB15%\u7684\u751F\u547D\u503C\uFF0C\u9A71\u6563\u6240\u6709\u8D1F\u9762\u72B6\u6001\uFF0C\u5E76\u4E14\u83B7\u5F97\u3010\u4E0D\u706D\u3011\u72B6\u6001\uFF0C\u6301\u7EED\u65F6\u95F44\u79D2", effectType: "water", attribute: "water", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", reikiCost: 30, selfHealPct: 0.15, dispelAllDebuffs: true, selfStatusEffects: ["undying"], statusEffectDuration: 4 },
    // 红鸾技能
    ling_luo_shi_hun: { id: "ling_luo_shi_hun", name: "\u7EEB\u7F57\u566C\u9B42", mpCost: 80, type: "attack", power: 80, frequency: 6, range: 4, targetCount: 2, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76842\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u621080%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7D0A\u4E71\u3011\u72B6\u6001", attribute: "yin", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "2\u4E2A", statusEffect: "disorder" },
    shi_li_hong_xiao: { id: "shi_li_hong_xiao", name: "\u5341\u91CC\u7EA2\u7EE1", mpCost: 80, type: "attack", power: 60, frequency: 6, range: 5, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u4E2D\u7684\u4E00\u4E2A\u65B9\u5411\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A5\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u621060%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u7981\u9522\u3011\u72B6\u6001", attribute: "yin", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "5\u683C", targetCountTag: "\u76F4\u7EBF", statusEffect: "imprison" },
    hong_gai_mi_zong: { id: "hong_gai_mi_zong", name: "\u7EA2\u76D6\u8FF7\u8E2A", mpCost: 40, type: "heal", power: 0, frequency: 8, range: 1, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u76EE\u6807\uFF0C\u6062\u590D\u81EA\u8EAB10%\u751F\u547D\u503C\u548C10%\u6CD5\u529B\u503C\uFF0C\u9A71\u6563\u968F\u673A1\u4E2A\u8D1F\u9762\u72B6\u6001", attribute: "yin", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", selfHealPct: 0.1, selfMpHealPct: 0.1, dispelRandomDebuffs: 1 },
    // 杀生樱技能
    luo_lei: { id: "luo_lei", name: "\u843D\u96F7", mpCost: 60, type: "attack", power: 150, frequency: 2, range: 4, targetCount: 1, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76841\u4E2A\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u81EA\u8EAB\u9677\u5165\u3010\u6D88\u6563\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "1\u4E2A", selfStatusEffects: ["dissipate"] },
    lei_bao: { id: "lei_bao", name: "\u96F7\u66B4", mpCost: 60, type: "attack", power: 65, frequency: 2, range: 3, areaRange: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u683C\u5B50\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76841\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621065%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u81EA\u8EAB\u9677\u5165\u3010\u6D88\u6563\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "\u8F70\u70B8", rangeType: "diamond", selfStatusEffects: ["dissipate"] },
    da_lei_bao: { id: "da_lei_bao", name: "\u5927\u96F7\u66B4", mpCost: 80, type: "attack", power: 120, frequency: 6, range: 3, areaRange: 1, description: "\u9009\u62E93\u683C\u8303\u56F4\u5185\u76841\u4E2A\u683C\u5B50\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76841\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u6210120%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "metal", attribute: "metal", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "\u8F70\u70B8", rangeType: "diamond" },
    // 八重神子技能
    sha_sheng_ying_zhou: { id: "sha_sheng_ying_zhou", name: "\u6740\u751F\u6A31\u5492", mpCost: 40, type: "support", power: 0, frequency: 2, range: 4, targetCount: 1, description: "\u9009\u62E94\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76841\u4E2A\u7A7A\u683C\uFF0C\u53EC\u5524\u51FA\u4E00\u4E2A\u3010\u6740\u751F\u6A31\u3011\uFF0C\u7EE7\u627F\u65BD\u6CD5\u8005\u9635\u8425\uFF0C\u53EC\u5524\u51FA\u7684\u6740\u751F\u6A31\u5904\u4E8E\u3010\u6D88\u6563\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "summon", skillTypeTag: "\u53EC\u5524", rangeTag: "4\u683C", targetCountTag: "1\u4E2A", summonCharacter: "shashengying", summonStatusEffects: ["dissipate"], summonMaxCount: 3, summonCountId: "shashengying", maxUsesPerBattle: 5 },
    tian_hu_xian_zhen: { id: "tian_hu_xian_zhen", name: "\u5929\u72D0\u663E\u771F", mpCost: 100, type: "attack", power: 50, frequency: 8, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621050%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u9677\u5165\u3010\u7981\u9522\u3011\u72B6\u6001\uFF0C\u6301\u7EED6\u79D2\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u5F3A\u529B\u3011\u72B6\u6001", effectType: "metal", attribute: "metal", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond", statusEffect: "imprison", statusEffectDuration: 6, selfStatusEffects: ["strong"], shaQiCost: 30 },
    // 千手技能
    qian_ren_fan_zhan: { id: "qian_ren_fan_zhan", name: "\u5343\u5203\u68B5\u65A9", mpCost: 100, type: "attack", power: 110, frequency: 8, range: 2, sweepLength: 2, sweepWidth: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F2\u5BBD3\u7684\u533A\u57DF\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210110%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001", effectType: "shadow", attribute: "dark", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "2x3", statusEffect: "bleeding" },
    fan_guang_jin_hua: { id: "fan_guang_jin_hua", name: "\u68B5\u5149\u70EC\u5316", mpCost: 60, type: "attack", power: 150, frequency: 6, range: 3, targetCount: 2, description: "\u9009\u62E93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u76842\u4E2A\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B150%\u7684\u4F24\u5BB3", effectType: "shadow", attribute: "dark", category: "\u6307\u5B9A", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "2\u4E2A", rangeType: "diamond" },
    fa_xiang_chong_yuan: { id: "fa_xiang_chong_yuan", name: "\u6CD5\u76F8\u91CD\u5706", mpCost: 100, type: "heal", power: 0, frequency: 8, range: 1, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u76EE\u6807\uFF0C\u6062\u590D\u81EA\u8EAB50%\u7684\u751F\u547D\u503C\uFF0C\u5E76\u4E14\u9A71\u6563\u968F\u673A2\u4E2A\u4E0D\u826F\u72B6\u6001\uFF08\u5982\u679C\u6709\u4E0D\u826F\u72B6\u6001\u7684\u8BDD\uFF09", effectType: "shadow", attribute: "dark", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", selfHealPct: 0.5, dispelRandomDebuffs: 2 },
    jing_ping_fu_ye: { id: "jing_ping_fu_ye", name: "\u51C0\u74F6\u8150\u4E1A", mpCost: 100, type: "attack", power: 200, frequency: 8, range: 1, sweepLength: 1, sweepWidth: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F1\u5BBD3\u7684\u533A\u57DF\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210200%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u548C\u3010\u8106\u5F31\u3011\u72B6\u6001", effectType: "shadow", attribute: "dark", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1x3", statusEffects: ["bleeding", "fragile"], shaQiCost: 40 },
    // 伊邪那美技能
    huang_quan_chui_ji: { id: "huang_quan_chui_ji", name: "\u9EC4\u6CC9\u5782\u5BC2", mpCost: 100, type: "attack", power: 150, frequency: 8, range: 1, sweepLength: 1, sweepWidth: 3, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F1\u5BBD3\u7684\u533A\u57DF\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u8150\u673D\u3011\u72B6\u6001", effectType: "shadow", attribute: "yin", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "1\u683C", targetCountTag: "1x3", statusEffect: "decay" },
    si_sheng_duan_lv: { id: "si_sheng_duan_lv", name: "\u6B7B\u751F\u65AD\u5F8B", mpCost: 100, type: "attack", power: 130, frequency: 8, range: 4, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A4\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6C89\u9ED8\u3011\u72B6\u6001", effectType: "shadow", attribute: "yin", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u76F4\u7EBF", statusEffect: "silenced" },
    ming_qu_gui_zhen: { id: "ming_qu_gui_zhen", name: "\u51A5\u8EAF\u5F52\u771F", mpCost: 100, type: "heal", power: 0, frequency: 8, range: 1, description: "\u9009\u62E9\u81EA\u8EAB\u4E3A\u76EE\u6807\uFF0C\u6062\u590D\u81EA\u8EAB30%\u7684\u751F\u547D\u503C\u548C10%\u7684\u6CD5\u529B\u503C", effectType: "shadow", attribute: "yin", category: "heal", skillTypeTag: "\u6CBB\u7597", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", selfHealPct: 0.3, selfMpHealPct: 0.1 },
    jing_hua_huang_quan: { id: "jing_hua_huang_quan", name: "\u955C\u82B1\u9EC4\u6CC9", mpCost: 100, type: "support", power: 0, frequency: 10, range: 1, targetCount: 1, description: "\u9009\u62E91\u683C\u8303\u56F4\u5185\u76841\u4E2A\u7A7A\u5730\uFF0C\u53EC\u5524\u51FA\u4E00\u4E2A\u3010\u4F0A\u90AA\u90A3\u7F8E\u865A\u5F71\u3011\uFF0C\u7EE7\u627F\u65BD\u6CD5\u8005\u9635\u8425\uFF0C\u53EC\u5524\u51FA\u7684\u865A\u5F71\u5904\u4E8E\u3010\u6D88\u6563\u3011\u72B6\u6001", effectType: "shadow", attribute: "yin", category: "summon", skillTypeTag: "\u53EC\u5524", rangeTag: "1\u683C", targetCountTag: "1\u4E2A", summonCharacter: "yixienamei_virtual", summonStatusEffects: ["dissipate"], summonMpOverride: 100, shaQiCost: 60 },
    // 刻晴技能
    yun_lai_jian_fa: { id: "yun_lai_jian_fa", name: "\u4E91\u6765\u5251\u6CD5", mpCost: 80, type: "attack", power: 130, frequency: 6, range: 2, sweepLength: 1, sweepWidth: 5, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A\u957F1\u5BBD5\u7684\u533A\u57DF\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210130%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "metal", attribute: "metal", category: "\u6A2A\u626B", skillTypeTag: "\u653B\u51FB", rangeTag: "2\u683C", targetCountTag: "1x5" },
    jian_ying_ru_guang: { id: "jian_ying_ru_guang", name: "\u5251\u5F71\u5982\u5149", mpCost: 80, type: "attack", power: 50, frequency: 6, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621050%\u7684\u4F24\u5BB3", effectType: "metal", attribute: "metal", category: "aoe", skillTypeTag: "\u653B\u51FB", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond" },
    tian_jie_xun_you: { id: "tian_jie_xun_you", name: "\u5929\u8857\u5DE1\u6E38", mpCost: 80, type: "attack", power: 150, frequency: 6, range: 4, areaRange: 2, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u7684\u4E00\u4E2A\u7A7A\u683C\u5B50\u4F5C\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76842\u683C\u8303\u56F4\u5185\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210150%\u653B\u51FB\u529B\u7684\u8303\u56F4\u4F24\u5BB3", effectType: "metal", attribute: "metal", category: "\u9677\u9635", skillTypeTag: "\u653B\u51FB", rangeTag: "4\u683C", targetCountTag: "\u9677\u9635", rangeType: "diamond", reikiCost: 15 },
    // 雪月技能
    sui_bing_liu: { id: "sui_bing_liu", name: "\u788E\u51B0\u6D41", mpCost: 80, type: "attack", power: 90, frequency: 6, range: 4, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u4E2D\u7684\u4E00\u4E2A\u65B9\u5411\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A4\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u5355\u4F4D\uFF0C\u9020\u621090%\u653B\u51FB\u529B\u7684\u4F24\u5BB3", effectType: "ice", attribute: "ice", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", elementTag: "\u51B0", rangeTag: "4\u683C", targetCountTag: "\u76F4\u7EBF" },
    lin_dong_jie_jie: { id: "lin_dong_jie_jie", name: "\u51DB\u51AC\u7ED3\u754C", mpCost: 80, type: "attack", power: 90, frequency: 6, range: 0, areaRange: 2, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF92\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621090%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4E14\u9677\u5165\u3010\u5BD2\u51B7\u3011\u72B6\u6001\uFF0C\u6301\u7EED4\u79D2", effectType: "ice", attribute: "ice", category: "aoe", skillTypeTag: "\u653B\u51FB", elementTag: "\u51B0", rangeTag: "2\u683C", targetCountTag: "AOE", rangeType: "diamond", statusEffect: "cold", statusEffectDuration: 4 },
    wan_jing_qiu_lao: { id: "wan_jing_qiu_lao", name: "\u4E07\u6676\u56DA\u7262", mpCost: 100, type: "attack", power: 95, frequency: 8, range: 4, areaRange: 2, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u76841\u4E2A\u683C\u5B50\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76842\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210\u653B\u51FB\u529B95%\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u5BD2\u51B7\u3011\u72B6\u6001\uFF0C\u6301\u7EED4\u79D2", effectType: "ice", attribute: "ice", category: "aoe", skillTypeTag: "\u653B\u51FB", elementTag: "\u51B0", rangeTag: "4\u683C", targetCountTag: "\u8F70\u70B8", rangeType: "diamond", statusEffect: "cold", statusEffectDuration: 4 },
    // 天蛇技能
    shi_gu_she_chao: { id: "shi_gu_she_chao", name: "\u8680\u9AA8\u86C7\u5DE2", mpCost: 100, type: "attack", power: 130, frequency: 8, range: 4, areaRange: 1, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u7684\u4E00\u4E2A\u7A7A\u683C\u5B50\u4F5C\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76841\u683C\u8303\u56F4\u5185\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u6210130%\u653B\u51FB\u529B\u7684\u8303\u56F4\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001\uFF0C\u6301\u7EED\u65F6\u95F46\u79D2", effectType: "shadow", attribute: "yin", category: "\u9677\u9635", skillTypeTag: "\u653B\u51FB", elementTag: "\u9634", rangeTag: "4\u683C", targetCountTag: "\u9677\u9635", statusEffect: "poison", statusEffectDuration: 6 },
    she_ying_qiu_long: { id: "she_ying_qiu_long", name: "\u86C7\u5F71\u56DA\u7B3C", mpCost: 100, type: "attack", power: 90, frequency: 8, range: 4, areaRange: 2, description: "\u9009\u62E94\u683C\u8303\u56F4\u5185\u7684\u4E00\u4E2A\u7A7A\u683C\u5B50\u4F5C\u4E3A\u76EE\u6807\uFF0C\u5BF9\u4EE5\u8BE5\u683C\u5B50\u4E3A\u4E2D\u5FC3\u76842\u683C\u8303\u56F4\u5185\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u621090%\u653B\u51FB\u529B\u7684\u8303\u56F4\u4F24\u5BB3\uFF0C\u65BD\u52A0\u3010\u7981\u9522\u3011\u72B6\u6001\uFF0C\u6301\u7EED4\u79D2", effectType: "shadow", attribute: "yin", category: "\u9677\u9635", skillTypeTag: "\u653B\u51FB", elementTag: "\u9634", rangeTag: "4\u683C", targetCountTag: "\u9677\u9635", statusEffect: "imprison", statusEffectDuration: 4 },
    du_ya_chuan_xi: { id: "du_ya_chuan_xi", name: "\u6BD2\u7259\u7A7F\u9699", mpCost: 100, type: "attack", power: 90, frequency: 6, range: 4, description: "\u9009\u62E9\u4E0A\u4E0B\u5DE6\u53F3\u67D0\u4E00\u65B9\u5411\u4E3A\u76EE\u6807\uFF0C\u5BF9\u8BE5\u65B9\u5411\u4E0A4\u683C\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\uFF0C\u9020\u621090%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001", effectType: "shadow", attribute: "yin", category: "\u76F4\u7EBF", skillTypeTag: "\u653B\u51FB", elementTag: "\u9634", rangeTag: "4\u683C", targetCountTag: "\u76F4\u7EBF", statusEffect: "poison" },
    wan_she_shi_xin: { id: "wan_she_shi_xin", name: "\u4E07\u86C7\u566C\u5FC3", mpCost: 120, type: "attack", power: 90, frequency: 6, range: 0, areaRange: 3, description: "\u4EE5\u81EA\u8EAB\u4E3A\u4E2D\u5FC3\uFF0C\u5BF93\u683C\u83F1\u5F62\u8303\u56F4\u5185\u7684\u6240\u6709\u654C\u65B9\u76EE\u6807\u9020\u621090%\u653B\u51FB\u529B\u7684\u4F24\u5BB3\uFF0C\u5E76\u4F7F\u76EE\u6807\u9677\u5165\u3010\u6050\u60E7\u3011\u72B6\u6001\uFF0C\u6301\u7EED2\u79D2", effectType: "shadow", attribute: "yin", category: "aoe", skillTypeTag: "\u653B\u51FB", elementTag: "\u9634", rangeTag: "3\u683C", targetCountTag: "AOE", rangeType: "diamond", statusEffect: "fear", statusEffectDuration: 2, shaQiCost: 60 }
  };
  function buildSkillsForCharacterId(characterId) {
    return [];
  }
  function buildFullSkillsForCharacter(characterId, equipment) {
    const baseSkills = buildSkillsForCharacterId(characterId);
    if (!equipment)
      return baseSkills;
    const equipEffects = processEquipmentEffects(equipment);
    return [...baseSkills, ...equipEffects.grantedSkills];
  }
  function getCharacterBaseTemplate(characterId) {
    const initial = INITIAL_CHARACTERS.find((c) => c.id === characterId);
    if (initial)
      return initial;
    const hireable = HIREABLE_CHARACTERS.find((c) => c.id === characterId);
    return hireable;
  }
  function getExpRequired(level) {
    if (level < 1)
      return 0;
    return 80 + (level - 1) * 40;
  }
  var INITIAL_CHARACTERS = [
    {
      id: "xiongxiong",
      name: "\u718A\u718A",
      job: "destiny",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 200,
      maxHp: 200,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 50,
      attack: 50,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("xiongxiong"),
      attribute: "normal"
    },
    {
      id: "tutu",
      name: "\u5154\u5154",
      job: "destiny",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 220,
      maxHp: 220,
      baseMaxMp: 250,
      maxMp: 250,
      baseAttack: 70,
      attack: 70,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tutu"),
      attribute: "ice"
    },
    {
      id: "daheixiong",
      name: "\u5927\u9ED1\u718A",
      job: "destiny",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 250,
      maxMp: 250,
      baseAttack: 50,
      attack: 50,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("daheixiong"),
      attribute: "water"
    }
  ];
  var HIREABLE_CHARACTERS = [
    {
      id: "eba",
      name: "\u6076\u9738",
      job: "\u58EB\u5175",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 225,
      maxHp: 225,
      baseMaxMp: 50,
      maxMp: 50,
      baseAttack: 55,
      attack: 55,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("eba"),
      attribute: "normal"
    },
    {
      id: "qianfuzhe",
      name: "\u6F5C\u4F0F\u8005",
      job: "\u58EB\u5175",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 200,
      maxHp: 200,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 65,
      attack: 65,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("qianfuzhe"),
      attribute: "normal"
    },
    {
      id: "yiliaobing",
      name: "\u533B\u7597\u5175",
      job: "\u58EB\u5175",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 240,
      maxHp: 240,
      baseMaxMp: 125,
      maxMp: 125,
      baseAttack: 40,
      attack: 40,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("yiliaobing"),
      attribute: "normal"
    },
    {
      id: "kejiqiu",
      name: "\u79D1\u6280\u7403",
      job: "\u9AD8\u79D1\u6280",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 480,
      maxHp: 480,
      baseMaxMp: 280,
      maxMp: 280,
      baseAttack: 60,
      attack: 60,
      baseDefense: 35,
      defense: 35,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("kejiqiu"),
      attribute: "wind"
    },
    {
      id: "baifeng",
      name: "\u767D\u51E4",
      job: "\u6D41\u6C99",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 260,
      maxHp: 260,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 75,
      attack: 75,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("baifeng"),
      attribute: "wind"
    },
    {
      id: "zhuyao",
      name: "\u732A\u5996",
      job: "\u5996\u602A",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 55,
      maxHp: 55,
      baseMaxMp: 10,
      maxMp: 10,
      baseAttack: 15,
      attack: 15,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("zhuyao"),
      attribute: "normal"
    },
    {
      id: "yaoqinshi",
      name: "\u5996\u7434\u5E08",
      job: "\u9B54\u5C06",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 60,
      maxHp: 60,
      baseMaxMp: 15,
      maxMp: 15,
      baseAttack: 15,
      attack: 15,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("yaoqinshi"),
      attribute: "wind"
    },
    {
      id: "luoxinfu",
      name: "\u7EDC\u65B0\u5987",
      job: "\u5996\u602A",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 75,
      maxHp: 75,
      baseMaxMp: 15,
      maxMp: 15,
      baseAttack: 20,
      attack: 20,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("luoxinfu"),
      attribute: "earth"
    },
    {
      id: "taohuayao",
      name: "\u6843\u82B1\u5996",
      job: "\u5996\u602A",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 280,
      maxHp: 280,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 65,
      attack: 65,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("taohuayao"),
      attribute: "wood"
    },
    {
      id: "tunjiuyao",
      name: "\u541E\u9152\u5996",
      job: "\u5996\u602A",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 280,
      maxHp: 280,
      baseMaxMp: 140,
      maxMp: 140,
      baseAttack: 75,
      attack: 75,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tunjiuyao"),
      attribute: "fire"
    },
    {
      id: "jingyao",
      name: "\u955C\u5996",
      job: "\u795E\u517D",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 80,
      maxHp: 80,
      baseMaxMp: 20,
      maxMp: 20,
      baseAttack: 15,
      attack: 15,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("jingyao"),
      attribute: "water"
    },
    {
      id: "guhuoniao",
      name: "\u59D1\u83B7\u9E1F",
      job: "\u5927\u5996",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 95,
      attack: 95,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("guhuoniao"),
      attribute: "wind"
    },
    {
      id: "qingxingdeng",
      name: "\u9752\u884C\u706F",
      job: "\u5927\u5996",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 90,
      attack: 90,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("qingxingdeng"),
      attribute: "fire"
    },
    {
      id: "qiyao",
      name: "\u68CB\u5996",
      job: "\u5996\u602A",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 260,
      maxHp: 260,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 65,
      attack: 65,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("qiyao"),
      attribute: "metal"
    },
    {
      id: "jujishou",
      name: "\u72D9\u51FB\u624B",
      job: "\u58EB\u5175",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 220,
      maxHp: 220,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 80,
      attack: 80,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 5,
      attackRange: 5,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("jujishou"),
      attribute: "normal"
    },
    {
      id: "tezhongbing",
      name: "\u7279\u79CD\u5175",
      job: "\u58EB\u5175",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 70,
      attack: 70,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tezhongbing"),
      attribute: "normal"
    },
    {
      id: "penhuobing",
      name: "\u55B7\u706B\u5175",
      job: "\u58EB\u5175",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 260,
      maxHp: 260,
      baseMaxMp: 120,
      maxMp: 120,
      baseAttack: 65,
      attack: 65,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("penhuobing"),
      attribute: "fire"
    },
    {
      id: "kuangren",
      name: "\u72C2\u4EBA",
      job: "\u58EB\u5175",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 200,
      maxHp: 200,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 55,
      attack: 55,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("kuangren"),
      attribute: "fire"
    },
    {
      id: "geliya",
      name: "\u6B4C\u8389\u5A05",
      job: "\u673A\u7532",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 350,
      maxHp: 350,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 90,
      attack: 90,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("geliya"),
      attribute: "metal"
    },
    {
      id: "tanke",
      name: "\u5766\u514B",
      job: "\u673A\u7532",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 400,
      maxHp: 400,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 95,
      attack: 95,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tanke"),
      attribute: "fire"
    },
    {
      id: "shouren",
      name: "\u517D\u4EBA",
      job: "\u9B54\u517D",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 230,
      maxHp: 230,
      baseMaxMp: 80,
      maxMp: 80,
      baseAttack: 60,
      attack: 60,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("shouren"),
      attribute: "normal"
    },
    {
      id: "xueshou",
      name: "\u8840\u624B",
      job: "\u9B54\u65CF",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 230,
      maxHp: 230,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 70,
      attack: 70,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("xueshou"),
      attribute: "earth"
    },
    {
      id: "duying",
      name: "\u6BD2\u5F71",
      job: "\u6BD2\u5C06",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 50,
      maxHp: 50,
      baseMaxMp: 15,
      maxMp: 15,
      baseAttack: 20,
      attack: 20,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("duying"),
      attribute: "wood"
    },
    {
      id: "fuzhong_zombie",
      name: "\u6D6E\u80BF\u4E27\u5C38",
      job: "\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 30,
      maxHp: 30,
      baseMaxMp: 10,
      maxMp: 10,
      baseAttack: 5,
      attack: 5,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("fuzhong_zombie"),
      attribute: "wood"
    },
    {
      id: "ordinary_zombie",
      name: "\u666E\u901A\u4E27\u5C38",
      job: "\u666E\u901A\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 200,
      maxHp: 200,
      baseMaxMp: 50,
      maxMp: 50,
      baseAttack: 50,
      attack: 50,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("ordinary_zombie"),
      attribute: "normal"
    },
    {
      id: "fat_zombie",
      name: "\u80A5\u80D6\u4E27\u5C38",
      job: "\u53D8\u5F02\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 280,
      maxHp: 280,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 40,
      attack: 40,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("fat_zombie"),
      attribute: "earth"
    },
    {
      id: "swift_zombie",
      name: "\u8FC5\u731B\u4E27\u5C38",
      job: "\u53D8\u5F02\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 50,
      maxMp: 50,
      baseAttack: 70,
      attack: 70,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("swift_zombie"),
      attribute: "normal"
    },
    {
      id: "paxing_zombie",
      name: "\u722C\u884C\u4E27\u5C38",
      job: "\u53D8\u5F02\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 100,
      attack: 100,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.5,
      moveSpeed: 0.5,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("paxing_zombie"),
      attribute: "normal"
    },
    {
      id: "long_tongue_zombie",
      name: "\u957F\u820C\u4E27\u5C38",
      job: "\u53D8\u5F02\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 50,
      maxMp: 50,
      baseAttack: 60,
      attack: 60,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("long_tongue_zombie"),
      attribute: "wood"
    },
    {
      id: "little_zombie",
      name: "\u5C0F\u9B3C\u4E27\u5C38",
      job: "\u666E\u901A\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 100,
      maxHp: 100,
      baseMaxMp: 50,
      maxMp: 50,
      baseAttack: 60,
      attack: 60,
      baseDefense: 0,
      defense: 0,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("little_zombie"),
      attribute: "normal"
    },
    {
      id: "pharaoh_zombie",
      name: "\u6CD5\u8001\u4E27\u5C38",
      job: "\u53D8\u5F02\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 50,
      attack: 50,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("pharaoh_zombie"),
      attribute: "metal"
    },
    {
      id: "eseng",
      name: "\u6076\u50E7",
      job: "\u5389\u9B3C",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 90,
      attack: 90,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("eseng"),
      attribute: "earth"
    },
    {
      id: "dongyuan_bing",
      name: "\u52A8\u5458\u5175",
      job: "\u58EB\u5175",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 200,
      maxHp: 200,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 50,
      attack: 50,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("dongyuan_bing"),
      attribute: "normal"
    },
    {
      id: "nvyao",
      name: "\u5973\u5996",
      job: "\u673A\u7532",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 320,
      maxHp: 320,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 90,
      attack: 90,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("nvyao"),
      attribute: "fire"
    },
    {
      id: "jianjiao_zombie",
      name: "\u5C16\u53EB\u4E27\u5C38",
      job: "\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 30,
      maxHp: 30,
      baseMaxMp: 15,
      maxMp: 15,
      baseAttack: 15,
      attack: 15,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("jianjiao_zombie"),
      attribute: "dark"
    },
    {
      id: "niutou",
      name: "\u725B\u5934",
      job: "\u5389\u9B3C",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 95,
      attack: 95,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("niutou"),
      attribute: "earth"
    },
    {
      id: "mamian",
      name: "\u9A6C\u9762",
      job: "\u5389\u9B3C",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 320,
      maxHp: 320,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 85,
      attack: 85,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("mamian"),
      attribute: "fire"
    },
    {
      id: "dasiming",
      name: "\u5927\u53F8\u547D",
      job: "\u9B54\u5C06",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 340,
      maxHp: 340,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 90,
      attack: 90,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("dasiming"),
      attribute: "fire"
    },
    {
      id: "youju",
      name: "\u5E7D\u9A79",
      job: "\u9B54\u517D",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 180,
      maxHp: 180,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 65,
      attack: 65,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("youju"),
      attribute: "dark"
    },
    {
      id: "longming",
      name: "\u9F99\u6E9F",
      job: "\u795E\u9F99",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 95,
      maxHp: 95,
      baseMaxMp: 30,
      maxMp: 30,
      baseAttack: 30,
      attack: 30,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("longming"),
      attribute: "dark"
    },
    {
      id: "longyou",
      name: "\u9F99\u6E38",
      job: "\u795E\u9F99",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 90,
      maxHp: 90,
      baseMaxMp: 25,
      maxMp: 25,
      baseAttack: 30,
      attack: 30,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("longyou"),
      attribute: "dark"
    },
    {
      id: "nanxiushi",
      name: "\u7537\u4FEE\u58EB",
      job: "\u70BC\u6C14\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 225,
      maxHp: 225,
      baseMaxMp: 110,
      maxMp: 110,
      baseAttack: 55,
      attack: 55,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("nanxiushi"),
      attribute: "normal"
    },
    {
      id: "nvxiushi",
      name: "\u5973\u4FEE\u58EB",
      job: "\u70BC\u6C14\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 210,
      maxHp: 210,
      baseMaxMp: 110,
      maxMp: 110,
      baseAttack: 55,
      attack: 55,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.5,
      moveSpeed: 0.5,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("nvxiushi"),
      attribute: "normal"
    },
    {
      id: "jinxiushi",
      name: "\u91D1\u7CFB\u4FEE\u58EB",
      job: "\u7B51\u57FA\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 260,
      maxHp: 260,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 70,
      attack: 70,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("jinxiushi"),
      attribute: "metal"
    },
    {
      id: "muxiushi",
      name: "\u6728\u7CFB\u4FEE\u58EB",
      job: "\u7B51\u57FA\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 300,
      maxHp: 300,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 60,
      attack: 60,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("muxiushi"),
      attribute: "wood"
    },
    {
      id: "shuixiushi",
      name: "\u6C34\u7CFB\u4FEE\u58EB",
      job: "\u7B51\u57FA\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 280,
      maxHp: 280,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 60,
      attack: 60,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("shuixiushi"),
      attribute: "water"
    },
    {
      id: "tuxiushi",
      name: "\u571F\u7CFB\u4FEE\u58EB",
      job: "\u7B51\u57FA\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 270,
      maxHp: 270,
      baseMaxMp: 120,
      maxMp: 120,
      baseAttack: 90,
      attack: 90,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tuxiushi"),
      attribute: "earth"
    },
    {
      id: "huoxiushi",
      name: "\u706B\u7CFB\u4FEE\u58EB",
      job: "\u7B51\u57FA\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 70,
      attack: 70,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("huoxiushi"),
      attribute: "fire"
    },
    {
      id: "baihu",
      name: "\u767D\u72D0",
      job: "\u795E\u517D",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 55,
      maxHp: 55,
      baseMaxMp: 10,
      maxMp: 10,
      baseAttack: 20,
      attack: 20,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("baihu"),
      attribute: "water"
    },
    {
      id: "songyu",
      name: "\u5B8B\u7389",
      job: "\u91D1\u4E39\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 85,
      attack: 85,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("songyu"),
      attribute: "water"
    },
    {
      id: "tianxiang",
      name: "\u5929\u9999",
      job: "\u91D1\u4E39\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 340,
      maxHp: 340,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 85,
      attack: 85,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tianxiang"),
      attribute: "wood"
    },
    {
      id: "yijian",
      name: "\u5955\u5251",
      job: "\u91D1\u4E39\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 350,
      maxHp: 350,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 95,
      attack: 95,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("yijian"),
      attribute: "metal",
      avatar: "/static/avatars/immortal/yijian.png"
    },
    {
      id: "xinghun",
      name: "\u661F\u9B42",
      job: "\u9B54\u5C06",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 95,
      attack: 95,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("xinghun"),
      attribute: "metal"
    },
    {
      id: "huyao",
      name: "\u864E\u5996",
      job: "\u5996\u602A",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 280,
      maxHp: 280,
      baseMaxMp: 120,
      maxMp: 120,
      baseAttack: 75,
      attack: 75,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("huyao"),
      attribute: "earth"
    },
    {
      id: "shaosiming",
      name: "\u5C11\u53F8\u547D",
      job: "\u9B54\u5C06",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 320,
      maxHp: 320,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 70,
      attack: 70,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 1.25,
      moveSpeed: 1.25,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("shaosiming"),
      attribute: "wind"
    },
    {
      id: "xixuegui",
      name: "\u5438\u8840\u9B3C",
      job: "\u9B54\u65CF",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 210,
      maxHp: 210,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 60,
      attack: 60,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("xixuegui"),
      attribute: "dark"
    },
    {
      id: "saman",
      name: "\u8428\u6EE1",
      job: "\u9B54\u65CF",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 175,
      maxHp: 175,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 40,
      attack: 40,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("saman"),
      attribute: "dark"
    },
    {
      id: "meimo",
      name: "\u9B45\u9B54",
      job: "\u9B54\u65CF",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 200,
      maxHp: 200,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 50,
      attack: 50,
      baseDefense: 10,
      defense: 10,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("meimo"),
      attribute: "water"
    },
    {
      id: "chilian",
      name: "\u8D64\u70BC",
      job: "\u6D41\u6C99",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 240,
      maxHp: 240,
      baseMaxMp: 160,
      maxMp: 160,
      baseAttack: 70,
      attack: 70,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("chilian"),
      attribute: "fire"
    },
    {
      id: "kuilei",
      name: "\u5080\u5121\u5A03\u5A03",
      job: "\u5080\u5121",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 100,
      maxHp: 100,
      baseMaxMp: 50,
      maxMp: 50,
      baseAttack: 55,
      attack: 55,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("kuilei"),
      attribute: "dark"
    },
    {
      id: "kuileinvhuang",
      name: "\u5080\u5121\u5973\u7687",
      job: "\u5080\u5121",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 200,
      maxHp: 200,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 65,
      attack: 65,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("kuileinvhuang"),
      attribute: "light"
    },
    {
      id: "jixiesangshi",
      name: "\u673A\u68B0\u4E27\u5C38",
      job: "\u4EBA\u9020\u4E27\u5C38",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 100,
      maxMp: 100,
      baseAttack: 60,
      attack: 60,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("jixiesangshi"),
      attribute: "normal"
    },
    {
      id: "muoushi",
      name: "\u6728\u5076\u5E08",
      job: "\u9B54\u5C06",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 320,
      maxHp: 320,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 70,
      attack: 70,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("muoushi"),
      attribute: "dark"
    },
    {
      id: "jingziyao",
      name: "\u955C\u5996",
      job: "\u5996\u602A",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 250,
      maxHp: 250,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 60,
      attack: 60,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.5,
      moveSpeed: 0.5,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("jingziyao"),
      attribute: "metal"
    },
    {
      id: "tiantu",
      name: "\u5929\u5154",
      job: "\u751F\u8096",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 70,
      attack: 70,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tiantu"),
      attribute: "water"
    },
    {
      id: "tianniu",
      name: "\u5929\u725B",
      job: "\u751F\u8096",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 460,
      maxHp: 460,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 95,
      attack: 95,
      baseDefense: 30,
      defense: 30,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tianniu"),
      attribute: "earth"
    },
    {
      id: "lingyu",
      name: "\u7FCE\u7FBD",
      job: "\u795E\u5C06",
      faction: "god",
      level: 1,
      exp: 0,
      baseMaxHp: 320,
      maxHp: 320,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 90,
      attack: 90,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.5,
      moveSpeed: 0.5,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("lingyu"),
      attribute: "wind"
    },
    {
      id: "bingxin",
      name: "\u51B0\u5FC3",
      job: "\u91D1\u4E39\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 70,
      attack: 70,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("bingxin"),
      attribute: "water",
      avatar: "/static/avatars/immortal/bingxin.png"
    },
    {
      id: "huanghuo",
      name: "\u8352\u706B",
      job: "\u795E\u5C06",
      faction: "god",
      level: 1,
      exp: 0,
      baseMaxHp: 400,
      maxHp: 400,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 95,
      attack: 95,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("huanghuo"),
      attribute: "fire",
      avatar: "/static/avatars/god/huanghuo.png"
    },
    {
      id: "yunlu",
      name: "\u4E91\u9E93",
      job: "\u795E\u88D4",
      faction: "god",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 290,
      maxMp: 290,
      baseAttack: 105,
      attack: 105,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("yunlu"),
      attribute: "yang",
      avatar: "/static/avatars/god/yunlu.png"
    },
    {
      id: "xuanwu",
      name: "\u7384\u6B66",
      job: "\u795E\u517D",
      faction: "god",
      level: 1,
      exp: 0,
      baseMaxHp: 600,
      maxHp: 600,
      baseMaxMp: 320,
      maxMp: 320,
      baseAttack: 65,
      attack: 65,
      baseDefense: 75,
      defense: 75,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("xuanwu"),
      attribute: "water",
      avatar: "/static/avatars/god/xuanwu.png"
    },
    {
      id: "nongyu",
      name: "\u5F04\u7389",
      job: "\u91D1\u4E39\u4FEE\u58EB",
      faction: "immortal",
      level: 1,
      exp: 0,
      baseMaxHp: 320,
      maxHp: 320,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 70,
      attack: 70,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.5,
      moveSpeed: 0.5,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("nongyu"),
      attribute: "wind",
      avatar: "/static/avatars/immortal/nongyu.png"
    },
    {
      id: "tianshu",
      name: "\u5929\u9F20",
      job: "\u751F\u8096",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 210,
      maxMp: 210,
      baseAttack: 70,
      attack: 70,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.5,
      moveSpeed: 0.5,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tianshu"),
      attribute: "water",
      avatar: "/static/avatars/beast/tianshu.png"
    },
    {
      id: "canjuanhun",
      name: "\u6B8B\u5377\u9B42",
      job: "\u9B3C\u9B42",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 320,
      maxHp: 320,
      baseMaxMp: 180,
      maxMp: 180,
      baseAttack: 75,
      attack: 75,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("canjuanhun"),
      attribute: "wood",
      avatar: "/static/avatars/ghost/canjuanhun.png"
    },
    {
      id: "tiegao",
      name: "\u94C1\u9506",
      job: "\u9B3C\u9B42",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 360,
      maxHp: 360,
      baseMaxMp: 150,
      maxMp: 150,
      baseAttack: 85,
      attack: 85,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tiegao"),
      attribute: "metal",
      avatar: "/static/avatars/ghost/tiegao.png"
    },
    {
      id: "zhengjia",
      name: "\u9707\u67B7",
      job: "\u9B3C\u9B42",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 340,
      maxHp: 340,
      baseMaxMp: 200,
      maxMp: 200,
      baseAttack: 75,
      attack: 75,
      baseDefense: 20,
      defense: 20,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("zhengjia"),
      attribute: "metal",
      avatar: "/static/avatars/ghost/zhenjia.png"
    },
    {
      id: "mengsike",
      name: "\u8499\u65AF\u514B",
      job: "\u4EBA\u7687",
      faction: "human",
      level: 1,
      exp: 0,
      baseMaxHp: 600,
      maxHp: 600,
      baseMaxMp: 260,
      maxMp: 260,
      baseAttack: 100,
      attack: 100,
      baseDefense: 35,
      defense: 35,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("mengsike"),
      attribute: "light",
      avatar: "/static/avatars/human/mengsike.png"
    },
    {
      id: "longwu",
      name: "\u9F99\u5DEB",
      job: "\u9B54\u795E",
      faction: "demon",
      level: 1,
      exp: 0,
      baseMaxHp: 450,
      maxHp: 450,
      baseMaxMp: 300,
      maxMp: 300,
      baseAttack: 130,
      attack: 130,
      baseDefense: 30,
      defense: 30,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("longwu"),
      attribute: "fire",
      avatar: "/static/avatars/demon/longwu.png"
    },
    {
      id: "hongluan",
      name: "\u7EA2\u9E3E",
      job: "\u8840\u8272\u5AC1\u8863",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 520,
      maxHp: 520,
      baseMaxMp: 320,
      maxMp: 320,
      baseAttack: 115,
      attack: 115,
      baseDefense: 30,
      defense: 30,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("hongluan"),
      attribute: "yin",
      avatar: "/static/avatars/ghost/hongluan.png"
    },
    {
      id: "shashengying",
      name: "\u6740\u751F\u6A31",
      job: "\u865A\u5F71",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 40,
      maxHp: 40,
      baseMaxMp: 30,
      maxMp: 30,
      baseAttack: 35,
      attack: 35,
      baseDefense: 5,
      defense: 5,
      baseMoveSpeed: 0.0101,
      moveSpeed: 0.0101,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("shashengying"),
      attribute: "metal",
      avatar: "/static/avatars/beast/shashengying.png"
    },
    {
      id: "bachongshenzi",
      name: "\u516B\u91CD\u795E\u5B50",
      job: "\u5929\u72D0\u53F8\u547D",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 130,
      maxHp: 130,
      baseMaxMp: 50,
      maxMp: 50,
      baseAttack: 50,
      attack: 50,
      baseDefense: 15,
      defense: 15,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("bachongshenzi"),
      attribute: "metal",
      avatar: "/static/avatars/beast/bachongshenzi.png"
    },
    {
      id: "qianshou",
      name: "\u5343\u624B",
      job: "\u9B3C\u795E",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 560,
      maxHp: 560,
      baseMaxMp: 320,
      maxMp: 320,
      baseAttack: 110,
      attack: 110,
      baseDefense: 40,
      defense: 40,
      baseMoveSpeed: 0.6667,
      moveSpeed: 0.6667,
      baseAttackRange: 3,
      attackRange: 3,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("qianshou"),
      attribute: "dark",
      avatar: "/static/avatars/ghost/qianshou.png"
    },
    {
      id: "yixienamei",
      name: "\u4F0A\u90AA\u90A3\u7F8E",
      job: "\u9EC4\u6CC9\u51A5\u795E",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 130,
      maxHp: 130,
      baseMaxMp: 50,
      maxMp: 50,
      baseAttack: 40,
      attack: 40,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("yixienamei"),
      attribute: "yin",
      avatar: "/static/avatars/ghost/yixienamei.png"
    },
    {
      id: "yixienamei_virtual",
      name: "\u4F0A\u90AA\u90A3\u7F8E\u865A\u5F71",
      job: "\u865A\u5F71",
      faction: "ghost",
      level: 1,
      exp: 0,
      baseMaxHp: 130,
      maxHp: 130,
      baseMaxMp: 0,
      maxMp: 0,
      baseAttack: 40,
      attack: 40,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("yixienamei_virtual"),
      attribute: "yin",
      avatar: "/static/avatars/ghost/yixienamei.png"
    },
    {
      id: "keqing",
      name: "\u523B\u6674",
      job: "\u7389\u8861",
      faction: "god",
      level: 1,
      exp: 0,
      baseMaxHp: 520,
      maxHp: 520,
      baseMaxMp: 320,
      maxMp: 320,
      baseAttack: 125,
      attack: 125,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 2,
      attackRange: 2,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("keqing"),
      attribute: "metal",
      avatar: "/static/avatars/god/keqing.png"
    },
    {
      id: "xueyue",
      name: "\u96EA\u6708",
      job: "\u51B0\u96EA\u5973\u795E",
      faction: "god",
      level: 1,
      exp: 0,
      baseMaxHp: 520,
      maxHp: 520,
      baseMaxMp: 350,
      maxMp: 350,
      baseAttack: 110,
      attack: 110,
      baseDefense: 30,
      defense: 30,
      baseMoveSpeed: 0.8333,
      moveSpeed: 0.8333,
      baseAttackRange: 4,
      attackRange: 4,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("xueyue"),
      attribute: "ice",
      avatar: "/static/avatars/god/xueyue.jpg"
    },
    {
      id: "tianshe",
      name: "\u5929\u86C7",
      job: "\u86C7\u59EC",
      faction: "beast",
      level: 1,
      exp: 0,
      baseMaxHp: 520,
      maxHp: 520,
      baseMaxMp: 340,
      maxMp: 340,
      baseAttack: 125,
      attack: 125,
      baseDefense: 25,
      defense: 25,
      baseMoveSpeed: 1,
      moveSpeed: 1,
      baseAttackRange: 1,
      attackRange: 1,
      baseAttackSpeed: 0.5,
      attackSpeed: 0.5,
      skills: buildSkillsForCharacterId("tianshe"),
      attribute: "yin",
      avatar: "/static/avatars/beast/tianshe.jpg"
    }
  ];
  var EQUIPMENT_TEMPLATES = {
    weapons: [
      { name: "\u6559\u5B66\u5251", icon: "/static/avatars/items/jiaoxue_jian.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 5 }, description: "\u6559\u5B66\u5251\uFF0C\u653B\u51FB+5", quality: "\u51E1\u7269" },
      { name: "\u7834\u635F\u7684\u5251", icon: "/static/avatars/items/posun_de_jian.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 10 }, description: "\u7834\u635F\u4F46\u4ECD\u53EF\u4F7F\u7528\u7684\u5251", quality: "\u51E1\u7269" },
      { name: "\u9910\u5200", icon: "/static/avatars/items/caidao.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 8 }, description: "\u9910\u5200\uFF0C\u653B\u51FB+8", quality: "\u51E1\u7269" },
      { name: "\u957F\u77DB", icon: "/static/avatars/items/changmao.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 15 }, description: "\u957F\u77DB\uFF0C\u653B\u51FB+15", quality: "\u51E1\u7269" },
      { name: "\u957F\u6208", icon: "/static/avatars/items/changge.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 12 }, description: "\u957F\u6208\uFF0C\u653B\u51FB+12", quality: "\u51E1\u7269" },
      { name: "\u767D\u94F6\u72FC\u7259\u68D2", icon: "/static/avatars/items/baiyin_langyabang.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 25 }, description: "\u767D\u94F6\u72FC\u7259\u68D2", quality: "\u51E1\u7269" },
      { name: "\u94C1\u5251", icon: "/static/avatars/items/tiejian.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 20 }, description: "\u94C1\u5251\uFF0C\u653B\u51FB+20", quality: "\u51E1\u7269" },
      { name: "\u722A\u5B50\u5200", icon: "/static/avatars/items/zhuazidao.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 10 }, description: "\u722A\u5B50\u5200\uFF0C\u653B\u51FB+10", quality: "\u51E1\u7269" },
      { name: "\u706B\u7FBD", icon: "/static/avatars/items/huoyu.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { mp: 80, attack: 50, attackRange: 1 }, description: "\u6CD5\u529B\u503C+80\uFF0C\u653B\u51FB\u529B+50\uFF0C\u653B\u51FB\u8303\u56F4+1\uFF0C\u88C5\u5907\u540E\u83B7\u5F97\u4E13\u5C5E\u6280\u80FD\u3010\u706B\u7FBD\u6D41\u661F\u3011", grantedSkillId: "huo_yu_liu_xing", quality: "\u4ED9\u5668" },
      { name: "\u5929\u96C5", icon: "/static/avatars/items/tianya.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { mp: 80, attack: 40, attackRange: 1 }, description: "\u6CD5\u529B\u503C+80\uFF0C\u653B\u51FB\u529B+40\uFF0C\u653B\u51FB\u8303\u56F4+1\uFF0C\u88C5\u5907\u540E\u83B7\u5F97\u4E13\u5C5E\u6280\u80FD\u3010\u5929\u96C5\u503E\u60C5\u3011", grantedSkillId: "tian_ya_qing_qing", quality: "\u4ED9\u5668" },
      { name: "\u9752\u4E91\u767D\u9E64\u5F13", icon: "/static/avatars/items/qingyunbaihegong.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 50, mp: 60, attackRange: 1 }, description: "\u653B\u51FB\u529B+50\uFF0C\u6CD5\u529B\u503C+60\uFF0C\u653B\u51FB\u8303\u56F4+1\uFF0C\u88C5\u5907\u540E\u83B7\u5F97\u4E13\u5C5E\u6280\u80FD\u3010\u4E91\u9E64\u7FD4\u821E\u3011", grantedSkillId: "yun_he_xiang_wu", quality: "\u4ED9\u5668" },
      { name: "\u7CBE\u7075\u6CD5\u6756", icon: "/static/avatars/items/jinglingfazhang.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 10, mp: 40 }, description: "\u7CBE\u7075\u6CD5\u6756\uFF0C\u653B\u51FB+10\uFF0C\u6CD5\u529B+40", setTag: "\u7CBE\u7075", quality: "\u7075\u5668" },
      { name: "\u5DE8\u517D\u5C16\u7259", icon: "/static/avatars/items/jushoujianya.png", type: "equipment", level: 1, subtype: "weapon", baseStats: { attack: 25, defense: 5 }, description: "\u5DE8\u517D\u5C16\u7259\uFF0C\u653B\u51FB+25\uFF0C\u9632\u5FA1+5", setTag: "\u5DE8\u517D", quality: "\u7075\u5668" }
    ],
    armors: [
      { name: "\u9A91\u58EB\u7532\u80C4", icon: "/static/avatars/items/qishi_jiazhou.png", type: "equipment", level: 1, subtype: "armor", baseStats: { defense: 20, hp: 50 }, description: "\u9632\u5177\uFF0C\u751F\u547D+50\uFF0C\u9632\u5FA1+20", quality: "\u51E1\u7269" },
      { name: "\u68C9\u8863", icon: "/static/avatars/items/mianyi.png", type: "equipment", level: 1, subtype: "armor", baseStats: { hp: 20, defense: 5 }, description: "\u68C9\u8863\uFF0C\u751F\u547D+20\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
      { name: "\u5192\u9669\u8005\u670D\u88C5", icon: "/static/avatars/items/maoxianjiayifu.png", type: "equipment", level: 1, subtype: "armor", baseStats: { hp: 25, defense: 10 }, description: "\u5192\u9669\u8005\u670D\u88C5\uFF0C\u751F\u547D+25\uFF0C\u9632\u5FA1+10", quality: "\u51E1\u7269" },
      { name: "\u79C0\u624D\u670D", icon: "/static/avatars/items/xiucaifu.png", type: "equipment", level: 1, subtype: "armor", baseStats: { hp: 10, mp: 20, defense: 5 }, description: "\u79C0\u624D\u670D\uFF0C\u751F\u547D+10\uFF0C\u6CD5\u529B+20\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" }
    ],
    helmets: [
      { name: "\u7CBE\u7075\u5E3D", icon: "/static/avatars/items/jinglingmao.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 10, mp: 30 }, description: "\u7CBE\u7075\u5E3D\uFF0C\u751F\u547D+10\uFF0C\u6CD5\u529B+30", setTag: "\u7CBE\u7075", quality: "\u7075\u5668" },
      { name: "\u767D\u94F6\u8D5B\u8F66\u5934\u76D4", icon: "/static/avatars/items/baiyin_saiche_toukui.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { defense: 20, hp: 40 }, description: "\u767D\u94F6\u8D5B\u8F66\u5934\u76D4\uFF0C\u751F\u547D+40\uFF0C\u9632\u5FA1+20", quality: "\u51E1\u7269" },
      { name: "\u9A91\u58EB\u5934\u76D4", icon: "/static/avatars/items/qishi_toukui.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { defense: 20, hp: 30 }, description: "\u5934\u76D4\uFF0C\u751F\u547D+30\uFF0C\u9632\u5FA1+20", quality: "\u51E1\u7269" },
      { name: "\u6218\u672F\u5934\u76D4", icon: "/static/avatars/items/zhanshutoukui.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 40, defense: 20 }, description: "\u6218\u672F\u5934\u76D4\uFF0C\u751F\u547D+40\uFF0C\u9632\u5FA1+20", quality: "\u51E1\u7269" },
      { name: "\u5192\u9669\u5BB6\u5E3D\u5B50", icon: "/static/avatars/items/maoxianjiamaozi.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 25, defense: 10 }, description: "\u5192\u9669\u5BB6\u5E3D\u5B50\uFF0C\u751F\u547D+25\uFF0C\u9632\u5FA1+10", quality: "\u51E1\u7269" },
      { name: "\u9B54\u672F\u5E3D", icon: "/static/avatars/items/moshumao.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 10, mp: 20, defense: 5 }, description: "\u9B54\u672F\u5E3D\uFF0C\u751F\u547D+10\uFF0C\u6CD5\u529B+20\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
      { name: "\u7D2B\u53D1\u7C2A", icon: "/static/avatars/items/zifazan.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { mp: 25 }, description: "\u7D2B\u53D1\u7C2A\uFF0C\u6CD5\u529B+25", quality: "\u51E1\u7269" },
      { name: "\u81E3\u76F8\u5E3D", icon: "/static/avatars/items/chenxiangmao.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 40, mp: 40, defense: 10 }, description: "\u81E3\u76F8\u5E3D\uFF0C\u751F\u547D+40\uFF0C\u6CD5\u529B+40\uFF0C\u9632\u5FA1+10", quality: "\u51E1\u7269" },
      { name: "\u5DE8\u517D\u5934\u76D4", icon: "/static/avatars/items/jushoutoukui.png", type: "equipment", level: 1, subtype: "helmet", baseStats: { hp: 40, defense: 15 }, description: "\u5DE8\u517D\u5934\u76D4\uFF0C\u751F\u547D+40\uFF0C\u9632\u5FA1+15", setTag: "\u5DE8\u517D", quality: "\u7075\u5668" }
    ],
    shoes: [
      { name: "\u7CBE\u7075\u9774", icon: "/static/avatars/items/jinglingxue.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 10, mp: 25 }, description: "\u7CBE\u7075\u9774\uFF0C\u751F\u547D+10\uFF0C\u6CD5\u529B+25", setTag: "\u7CBE\u7075", quality: "\u7075\u5668" },
      { name: "\u9A91\u58EB\u9774", icon: "/static/avatars/items/qishi_xue.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 20, defense: 15 }, description: "\u9A91\u58EB\u9774\uFF0C\u751F\u547D+20\uFF0C\u9632\u5FA1+15", quality: "\u51E1\u7269" },
      { name: "\u5E03\u978B", icon: "/static/avatars/items/buxie.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 5, defense: 3 }, description: "\u5E03\u978B\uFF0C\u751F\u547D+5\uFF0C\u9632\u5FA1+3", quality: "\u51E1\u7269" },
      { name: "\u6697\u9ED1\u73AB\u7470", icon: "/static/avatars/items/anheimeigui.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 15, mp: 25, defense: 5 }, description: "\u6697\u9ED1\u73AB\u7470\uFF0C\u751F\u547D+15\uFF0C\u6CD5\u529B+25\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
      { name: "\u5DE8\u517D\u978B\u5B50", icon: "/static/avatars/items/jushouxiezi.png", type: "equipment", level: 1, subtype: "shoes", baseStats: { hp: 30, defense: 10 }, description: "\u5DE8\u517D\u978B\u5B50\uFF0C\u751F\u547D+30\uFF0C\u9632\u5FA1+10", setTag: "\u5DE8\u517D", quality: "\u7075\u5668" }
    ],
    accessories: [
      { name: "\u9A91\u58EB\u6212\u6307", icon: "/static/avatars/items/qishi_jiezhi.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { attack: 15, defense: 15 }, description: "\u9970\u54C1\uFF0C\u653B\u51FB+15\uFF0C\u9632\u5FA1+15", quality: "\u51E1\u7269" },
      { name: "\u6559\u4F1A\u6212\u6307", icon: "/static/avatars/items/jiaohui_jiezhi.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { defense: 5, hp: 20 }, description: "\u6559\u4F1A\u6212\u6307\uFF0C\u751F\u547D+20\uFF0C\u9632\u5FA1+5", quality: "\u51E1\u7269" },
      { name: "\u8033\u73AF", icon: "/static/avatars/items/erhuan.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { mp: 20 }, description: "\u7CBE\u7F8E\u8033\u73AF", quality: "\u51E1\u7269" },
      { name: "\u91D1\u5FBD\u7AE0", icon: "/static/avatars/items/jinhuizhang.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 90, attack: 30, defense: 15 }, description: "\u9970\u54C1\uFF0C\u751F\u547D+90\uFF0C\u653B\u51FB+30\uFF0C\u9632\u5FA1+15", quality: "\u6CD5\u5668" },
      { name: "\u94F6\u5FBD\u7AE0", icon: "/static/avatars/items/yinhuizhang.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 60, attack: 20, defense: 10 }, description: "\u9970\u54C1\uFF0C\u751F\u547D+60\uFF0C\u653B\u51FB+20\uFF0C\u9632\u5FA1+10", quality: "\u6CD5\u5668" },
      { name: "\u94DC\u5FBD\u7AE0", icon: "/static/avatars/items/tonghuizhang.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 30, attack: 10, defense: 5 }, description: "\u9970\u54C1\uFF0C\u751F\u547D+30\uFF0C\u653B\u51FB+10\uFF0C\u9632\u5FA1+5", quality: "\u6CD5\u5668" },
      { name: "\u7CBE\u7075\u5FBD\u7AE0", icon: "/static/avatars/items/jinglinghuizhang.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 30, mp: 50 }, description: "\u7CBE\u7075\u5FBD\u7AE0\uFF0C\u751F\u547D+30\uFF0C\u6CD5\u529B+50", setTag: "\u7CBE\u7075", quality: "\u7075\u5668" },
      { name: "\u5DE8\u517D\u62A4\u76FE", icon: "/static/avatars/items/jushouhudun.png", type: "equipment", level: 1, subtype: "accessory", baseStats: { hp: 50, defense: 20 }, description: "\u5DE8\u517D\u62A4\u76FE\uFF0C\u751F\u547D+50\uFF0C\u9632\u5FA1+20", setTag: "\u5DE8\u517D", quality: "\u7075\u5668" }
    ],
    books: [
      { name: "\u5251\u6CD5", icon: "/static/avatars/items/jianfa.png", type: "equipment", level: 1, subtype: "book", baseStats: { attack: 20 }, description: "\u5251\u6CD5\u79D8\u7C4D\uFF0C\u653B\u51FB\u529B+20", quality: "\u6CD5\u5668" },
      { name: "\u5200\u6CD5", icon: "/static/avatars/items/daofa.png", type: "equipment", level: 1, subtype: "book", baseStats: { attack: 15, hp: 20 }, description: "\u5200\u6CD5\u79D8\u7C4D\uFF0C\u653B\u51FB\u529B+15\uFF0C\u751F\u547D\u503C+20", quality: "\u6CD5\u5668" }
    ]
  };
  var CONSUMABLE_TEMPLATES = [
    { name: "\u7075\u8349", icon: "/static/avatars/items/lingcao.png", type: "consumable", rarity: "common", level: 1, subtype: "consumable", description: "\u6062\u590D10%\u6700\u5927\u751F\u547D\u548C10%\u6700\u5927\u6CD5\u529B" },
    { name: "\u7075\u836F", icon: "/static/avatars/items/danyao.png", type: "consumable", rarity: "rare", level: 1, subtype: "consumable", description: "\u6062\u590D30%\u6700\u5927\u751F\u547D\u548C30%\u6700\u5927\u6CD5\u529B" },
    { ...CHEST_CONFIG.wanwu, type: "consumable", level: 1, subtype: "consumable" },
    { ...CHEST_CONFIG.faqi, type: "consumable", level: 1, subtype: "consumable" },
    { name: "\u836F\u7BB1", icon: "/static/avatars/items/yaoxiang.png", type: "consumable", rarity: "exceptional", level: 1, subtype: "consumable", description: "\u6062\u590D\u5168\u90E8\u751F\u547D\u503C" }
  ];
  var SOUL_CONFIG = {
    universal: {
      name: "\u4E07\u80FD\u9B42\u9B44",
      icon: "/static/avatars/items/hunpo.png",
      description: "\u53EF\u63D0\u5347\u4EFB\u610F\u89D2\u8272\u7684\u7B49\u7EA7\u4E0A\u9650"
    }
  };
  function getSoulConfigByCharacter(characterId, characterName, faction) {
    const avatarPath = getAvatarPath(characterId, faction || "human");
    return {
      name: `${characterName}\u9B42\u9B44`,
      icon: avatarPath,
      description: `\u53EF\u63D0\u5347\u3010${characterName}\u3011\u7684\u7B49\u7EA7\u4E0A\u9650`
    };
  }
  function createSoulItem(targetId, targetName, targetFaction) {
    if (targetId === "universal") {
      const config = SOUL_CONFIG.universal;
      return {
        name: config.name,
        icon: config.icon,
        type: "consumable",
        rarity: "rare",
        level: 1,
        subtype: "soul",
        description: config.description,
        soulTargetId: "universal"
      };
    } else {
      const name = targetName || targetId;
      const config = getSoulConfigByCharacter(targetId, name, targetFaction);
      return {
        name: config.name,
        icon: config.icon,
        type: "consumable",
        rarity: "common",
        level: 1,
        subtype: "soul",
        description: config.description,
        soulTargetId: targetId
      };
    }
  }
  var TERRAIN_CONFIG = {
    river: { icon: "\u{1F30A}", passable: false, destructible: false },
    obstacle: { icon: "\u26F0\uFE0F", passable: false, destructible: true, hp: 100 },
    empty: { icon: "", passable: true, destructible: false },
    snow: { icon: "\u2744\uFE0F", passable: true, destructible: false }
  };
  var BATTLE_CONFIG = {
    offensive: { width: 11, height: 13, playerRows: 2, enemyRows: 2 },
    defensive: { width: 19, height: 19, playerRows: 9, enemyRows: 10 },
    zombie: { width: 19, height: 19, playerRows: 9, enemyRows: 10 }
  };
  var TERRAIN_PROBABILITIES = {
    river: { river: 0.11, obstacle: 0.07 },
    plain: { river: 0.05, obstacle: 0.13 },
    mountain: { river: 0.01, obstacle: 0.17 }
  };
  var DIFFICULTY_CONFIG = {
    easy: { name: "\u7B80\u5355", multiplier: 0.5 },
    normal: { name: "\u6B63\u5E38", multiplier: 1 },
    hard: { name: "\u56F0\u96BE", multiplier: 1.25 },
    nightmare: { name: "\u5669\u68A6", multiplier: 1.5 },
    deadly: { name: "\u7EDD\u547D", multiplier: 2 }
  };
  function createEmptyEquipment() {
    return {
      weapon: null,
      armor: null,
      helmet: null,
      shoes: null,
      accessory: null,
      book: null
    };
  }
  function createInitialHomeGrid() {
    const grid = [];
    for (let row = 0; row < 9; row++) {
      grid[row] = [];
      for (let col = 0; col < 9; col++) {
        grid[row][col] = {
          row,
          col,
          terrain: "empty",
          building: null
        };
      }
    }
    return grid;
  }
  function getAvatarPath(charId, faction = "human") {
    const avatarPathMap = {
      "xiongxiong": "/static/avatars/characters/xiongxiong.png",
      "tutu": "/static/avatars/characters/tutu.png",
      "daheixiong": "/static/avatars/characters/daheixiong.png",
      "ranbing": "/static/avatars/characters/ranbing.png",
      "maiduo": "/static/avatars/characters/maiduo.png",
      "ordinary_zombie": "/static/avatars/ghost/putong_zombie.png",
      "fat_zombie": "/static/avatars/ghost/feipang_zombie.png",
      "swift_zombie": "/static/avatars/ghost/xunmeng_zombie.png",
      "long_tongue_zombie": "/static/avatars/ghost/changshetou_zombie.png",
      "little_zombie": "/static/avatars/ghost/xiaogui_zombie.png",
      "pharaoh_zombie": "/static/avatars/ghost/falao_zombie.png",
      "eseng": "/static/avatars/ghost/eseng.png",
      "jianjiao_zombie": "/static/avatars/ghost/jianjiao_zombie.png",
      "paxing_zombie": "/static/avatars/ghost/paxing_zombie.png",
      "jixiesangshi": "/static/avatars/ghost/jixiesangshi.png",
      "niutou": "/static/avatars/ghost/niutou.png",
      "mamian": "/static/avatars/ghost/mamian.png",
      "nanxiushi": "/static/avatars/immortal/nanxiushi.png",
      "nvxiushi": "/static/avatars/immortal/nvxiushi.png",
      "jinxiushi": "/static/avatars/immortal/jinxiushi.png",
      "muxiushi": "/static/avatars/immortal/muxiushi.png",
      "shuixiushi": "/static/avatars/immortal/shuixiushi.png",
      "tuxiushi": "/static/avatars/immortal/tuxiushi.png",
      "huoxiushi": "/static/avatars/immortal/huoxiushi.png",
      "baihu": "/static/avatars/immortal/baihuli.png",
      "songyu": "/static/avatars/immortal/songyu.png",
      "tianxiang": "/static/avatars/immortal/tianxiang.jpg",
      "penhuobing": "/static/avatars/human/penhuobing.png",
      "eba": "/static/avatars/human/eba.png",
      "qianfuzhe": "/static/avatars/human/qianfuzhe.png",
      "yiliaobing": "/static/avatars/human/yiliaobing.png",
      "kejiqiu": "/static/avatars/human/kejiqiu.png",
      "baifeng": "/static/avatars/human/baifeng.png",
      "jujishou": "/static/avatars/human/jujishou.png",
      "tezhongbing": "/static/avatars/human/tezhongbing.png",
      "kuangren": "/static/avatars/human/kuangren.png",
      "dongyuan_bing": "/static/avatars/human/dongyuan_bing.png",
      "geliya": "/static/avatars/human/geliya.png",
      "tanke": "/static/avatars/human/tanke.png",
      "nvyao": "/static/avatars/human/nvyao.png",
      "shouren": "/static/avatars/demon/shouren.png",
      "xueshou": "/static/avatars/demon/xueshou.png",
      "duying": "/static/avatars/demon/duying.png",
      "kuilei": "/static/avatars/demon/kuileiwawa.png",
      "kuileinvhuang": "/static/avatars/demon/kuileinvhuang.png",
      "muoushi": "/static/avatars/demon/muoushi.png",
      "shaosiming": "/static/avatars/demon/shaosiming.png",
      "dasiming": "/static/avatars/demon/dasiming.png",
      "xixuegui": "/static/avatars/demon/xixuegui.png",
      "saman": "/static/avatars/demon/saman.png",
      "meimo": "/static/avatars/demon/meimo.png",
      "chilian": "/static/avatars/human/chilian.png",
      "youju": "/static/avatars/demon/youju.png",
      "longming": "/static/avatars/demon/longming.png",
      "longyou": "/static/avatars/demon/longyou.png",
      "fuzhong_zombie": "/static/avatars/ghost/fuzhong_zombie.png",
      "zhuyao": "/static/avatars/beast/zhuyao.png",
      "yaoqinshi": "/static/avatars/beast/yaoqinshi.png",
      "luoxinfu": "/static/avatars/beast/luoxinfu.png",
      "taohuayao": "/static/avatars/beast/taohuayao.png",
      "tunjiuyao": "/static/avatars/beast/tunjiuyao.png",
      "jingyao": "/static/avatars/beast/jingyao.png",
      "guhuoniao": "/static/avatars/beast/guhuoniao.png",
      "qingxingdeng": "/static/avatars/beast/qingxingdeng.png",
      "qiyao": "/static/avatars/beast/qiyao.png",
      "yijian": "/static/avatars/immortal/yijian.png",
      "xinghun": "/static/avatars/demon/xinghun.png",
      "huyao": "/static/avatars/beast/huyao.png",
      "jingziyao": "/static/avatars/beast/jingziyao.png",
      "tiantu": "/static/avatars/beast/tiantu.png",
      "tianniu": "/static/avatars/beast/tianniu.png",
      "lingyu": "/static/avatars/god/lingyu.png",
      "bingxin": "/static/avatars/immortal/bingxin.png",
      "huanghuo": "/static/avatars/god/huanghuo.png",
      "yunlu": "/static/avatars/god/yunlu.png",
      "xuanwu": "/static/avatars/god/xuanwu.png",
      "nongyu": "/static/avatars/immortal/nongyu.png",
      "tianshu": "/static/avatars/beast/tianshu.png",
      "canjuanhun": "/static/avatars/ghost/canjuanhun.png",
      "tiegao": "/static/avatars/ghost/tiegao.png",
      "zhengjia": "/static/avatars/ghost/zhenjia.png",
      "mengsike": "/static/avatars/human/mengsike.png",
      "longwu": "/static/avatars/demon/longwu.png",
      "hongluan": "/static/avatars/ghost/hongluan.png",
      "shashengying": "/static/avatars/beast/shashengying.png",
      "bachongshenzi": "/static/avatars/beast/bachongshenzi.png",
      "qianshou": "/static/avatars/ghost/qianshou.png",
      "yixienamei": "/static/avatars/ghost/yixienamei.png",
      "yixienamei_virtual": "/static/avatars/ghost/yixienamei.png",
      "keqing": "/static/avatars/god/keqing.png",
      "xueyue": "/static/avatars/god/xueyue.jpg",
      "tianshe": "/static/avatars/beast/tianshe.jpg"
    };
    return avatarPathMap[charId] || FACTION_CONFIG[faction].icon;
  }
  function createCharacterFromTemplate(template) {
    return {
      ...template,
      maxLevel: 5,
      // 初始等级上限为5级
      equipment: createEmptyEquipment(),
      avatar: getAvatarPath(template.id, template.faction),
      isPlayerOwned: true,
      hp: template.maxHp,
      mp: template.maxMp
    };
  }

  // src/utils/storageUtils.ts
  async function requestStoragePermission() {
    return new Promise((resolve) => {
      resolve({ success: true, message: "\u65E0\u9700\u7279\u6B8A\u6743\u9650" });
    });
  }
  async function saveToExternalStorage(filename, content) {
    return new Promise((resolve) => {
      try {
        if (uni.getSystemInfoSync().platform !== "android") {
          resolve({ success: false, message: "\u4EC5\u652F\u6301Android\u5E73\u53F0" });
          return;
        }
        plus.io.requestFileSystem(
          plus.io.PRIVATE_DOC,
          (fs) => {
            fs.root.getDirectory(
              "SangshiGame",
              { create: true },
              (dirEntry) => {
                dirEntry.getFile(
                  filename,
                  { create: true },
                  (fileEntry) => {
                    fileEntry.createWriter(
                      (writer) => {
                        writer.onwriteend = () => {
                          let fullPath = "";
                          try {
                            fullPath = plus.android.invoke(fileEntry, "getAbsolutePath") || fileEntry.fullPath;
                          } catch (e) {
                            fullPath = fileEntry.fullPath;
                          }
                          console.log("\u6587\u4EF6\u4FDD\u5B58\u6210\u529F:", fullPath);
                          resolve({
                            success: true,
                            message: "\u4FDD\u5B58\u6210\u529F",
                            filePath: fullPath
                          });
                        };
                        writer.onerror = (e) => {
                          console.error("\u5199\u5165\u5931\u8D25:", e);
                          resolve({ success: false, message: "\u5199\u5165\u5931\u8D25" });
                        };
                        writer.write(content);
                      },
                      () => resolve({ success: false, message: "\u521B\u5EFA\u6587\u4EF6\u5931\u8D25" })
                    );
                  },
                  () => resolve({ success: false, message: "\u521B\u5EFA\u76EE\u5F55\u5931\u8D25" })
                );
              },
              () => resolve({ success: false, message: "\u65E0\u6CD5\u8BBF\u95EE\u5B58\u50A8" })
            );
          },
          () => resolve({ success: false, message: "\u8BF7\u6C42\u6587\u4EF6\u7CFB\u7EDF\u5931\u8D25" })
        );
      } catch (e) {
        console.error("\u4FDD\u5B58\u6587\u4EF6\u5931\u8D25:", e);
        resolve({ success: false, message: "\u4FDD\u5B58\u5931\u8D25: " + e.message });
      }
    });
  }
  async function loadFromExternalStorage(filename) {
    return new Promise((resolve) => {
      try {
        if (uni.getSystemInfoSync().platform !== "android") {
          resolve({ success: false, message: "\u4EC5\u652F\u6301Android\u5E73\u53F0" });
          return;
        }
        plus.io.resolveLocalFileSystemURL(
          "_doc/SangshiGame/" + filename,
          (fileEntry) => {
            fileEntry.file(
              (fileObj) => {
                const reader = new plus.io.FileReader();
                reader.onloadend = (e) => {
                  if (e.target && e.target.result) {
                    resolve({ success: true, message: "\u8BFB\u53D6\u6210\u529F", content: e.target.result });
                  } else {
                    resolve({ success: false, message: "\u8BFB\u53D6\u5185\u5BB9\u4E3A\u7A7A" });
                  }
                };
                reader.onerror = () => resolve({ success: false, message: "\u8BFB\u53D6\u5931\u8D25" });
                reader.readAsText(fileObj);
              },
              () => resolve({ success: false, message: "\u6587\u4EF6\u4E0D\u5B58\u5728" })
            );
          },
          () => {
            resolve({ success: false, message: "\u6587\u4EF6\u4E0D\u5B58\u5728" });
          }
        );
      } catch (e) {
        console.error("\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25:", e);
        resolve({ success: false, message: "\u8BFB\u53D6\u5931\u8D25: " + e.message });
      }
    });
  }
  async function saveGameToExternalStorage(saveKey, data) {
    const result = await requestStoragePermission();
    if (!result.success) {
      console.log("\u5916\u90E8\u5B58\u50A8\u6743\u9650\u672A\u6388\u4E88\uFF0C\u65E0\u6CD5\u4FDD\u5B58:", result.message);
      return result;
    }
    const filename = `${saveKey}.json`;
    const content = JSON.stringify(data, null, 2);
    const saveResult = await saveToExternalStorage(filename, content);
    console.log("\u5916\u90E8\u5B58\u50A8\u4FDD\u5B58\u7ED3\u679C:", saveResult);
    return saveResult;
  }
  async function loadGameFromExternalStorage(saveKey) {
    const result = await requestStoragePermission();
    if (!result.success) {
      console.log("\u5916\u90E8\u5B58\u50A8\u6743\u9650\u672A\u6388\u4E88\uFF0C\u65E0\u6CD5\u8BFB\u53D6:", result.message);
      return result;
    }
    const filename = `${saveKey}.json`;
    const loadResult = await loadFromExternalStorage(filename);
    console.log("\u5916\u90E8\u5B58\u50A8\u8BFB\u53D6\u7ED3\u679C:", loadResult);
    return loadResult;
  }

  // src/utils/realTimeBattle.ts
  function manhattan(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }
  function key(row, col) {
    return `${row},${col}`;
  }
  function isTerrainPassable(terrain) {
    return terrain === "empty" || terrain === "snow";
  }
  function get4Neighbors(row, col, height, width) {
    const result = [];
    if (row > 0)
      result.push({ row: row - 1, col });
    if (row < height - 1)
      result.push({ row: row + 1, col });
    if (col > 0)
      result.push({ row, col: col - 1 });
    if (col < width - 1)
      result.push({ row, col: col + 1 });
    return result;
  }
  function bfsPath(start, goal, terrain, blockedCells, height, width) {
    if (start.row === goal.row && start.col === goal.col)
      return [];
    const visited = /* @__PURE__ */ new Set([key(start.row, start.col)]);
    const parent = /* @__PURE__ */ new Map();
    parent.set(key(start.row, start.col), null);
    const queue = [start];
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.row === goal.row && current.col === goal.col) {
        const path = [];
        let node = current;
        while (node) {
          if (!(node.row === start.row && node.col === start.col)) {
            path.unshift({ row: node.row, col: node.col });
          }
          node = parent.get(key(node.row, node.col)) ?? null;
        }
        return path;
      }
      for (const next of get4Neighbors(current.row, current.col, height, width)) {
        const k = key(next.row, next.col);
        if (visited.has(k))
          continue;
        if (!isTerrainPassable(terrain[next.row][next.col]))
          continue;
        if (blockedCells.has(k))
          continue;
        visited.add(k);
        parent.set(k, current);
        queue.push(next);
      }
    }
    return null;
  }
  function findNearestEnemy(char2, enemies) {
    let best = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (e.id === char2.id || e.dead)
        continue;
      const d = manhattan(char2, e);
      if (d < bestDist) {
        bestDist = d;
        best = e;
      }
    }
    return best;
  }
  function findInRangeEnemyByDefense(char2, enemies) {
    let best = null;
    let bestScore = Infinity;
    for (const e of enemies) {
      if (e.id === char2.id || e.dead)
        continue;
      if (manhattan(char2, e) > char2.attackRange)
        continue;
      const score = e.defense * 1e3 + manhattan(char2, e);
      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    }
    return best;
  }
  function findInRangeEnemyByHp(char2, enemies) {
    let best = null;
    let bestScore = Infinity;
    for (const e of enemies) {
      if (e.id === char2.id || e.dead)
        continue;
      if (manhattan(char2, e) > char2.attackRange)
        continue;
      const hpPct = e.maxHp > 0 ? e.hp / e.maxHp : 1;
      const score = hpPct * 1e4 + manhattan(char2, e);
      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    }
    return best;
  }
  function findRangedApproachPoint(char2, target, terrain, blockedCells, height, width) {
    if (manhattan(char2, target) <= char2.attackRange) {
      return { row: char2.row, col: char2.col };
    }
    const range = char2.attackRange;
    let best = null;
    let bestDist = Infinity;
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const d = Math.abs(r - target.row) + Math.abs(c - target.col);
        if (d !== range)
          continue;
        if (!isTerrainPassable(terrain[r][c]))
          continue;
        if (blockedCells.has(key(r, c)))
          continue;
        if (r === target.row && c === target.col)
          continue;
        const myDist = manhattan(char2, { row: r, col: c });
        if (myDist < bestDist) {
          bestDist = myDist;
          best = { row: r, col: c };
        }
      }
    }
    if (!best) {
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          if (!isTerrainPassable(terrain[r][c]))
            continue;
          if (blockedCells.has(key(r, c)))
            continue;
          if (r === char2.row && c === char2.col)
            continue;
          const targetDist = Math.abs(r - target.row) + Math.abs(c - target.col);
          if (targetDist < bestDist) {
            bestDist = targetDist;
            best = { row: r, col: c };
          }
        }
      }
    }
    return best ?? { row: target.row, col: target.col };
  }
  function computeAutoDamage(attacker, target) {
    let damage = attacker.attack - target.defense * 0.5;
    damage = Math.max(1, Math.floor(damage));
    if (Math.random() < 0.1) {
      damage = Math.floor(damage * 1.5);
    }
    return damage;
  }
  function getHpPct(char2) {
    return char2.maxHp > 0 ? char2.hp / char2.maxHp : 0;
  }
  function getSkillCooldownMs(skill) {
    return (skill.frequency ?? 6) * 1e3;
  }
  function canCastSkill(char2, skill, now) {
    if (skill.type === "passive")
      return false;
    const lastUsed = char2.skillLastUsedTime?.[skill.id] ?? 0;
    const cdMs = getSkillCooldownMs(skill);
    if (now - lastUsed < cdMs)
      return false;
    if (char2.mp < skill.mpCost)
      return false;
    if (isSilenced(char2))
      return false;
    if (skill.selfHpThreshold !== void 0 && getHpPct(char2) < skill.selfHpThreshold)
      return false;
    if (skill.requireHpGtAtk && char2.hp <= char2.attack)
      return false;
    return true;
  }
  function scoreSkill(char2, skill, state) {
    let score = 0;
    const hpPct = getHpPct(char2);
    const allies = char2.isPlayer ? state.playerChars : state.enemyChars;
    const enemies = char2.isPlayer ? state.enemyChars : state.playerChars;
    const aliveAllies = allies.filter((a) => !a.dead);
    const aliveEnemies = enemies.filter((e) => !e.dead);
    if (skill.type === "heal") {
      const lowestHpAlly = aliveAllies.reduce((lowest, a) => getHpPct(a) < getHpPct(lowest) ? a : lowest, aliveAllies[0]);
      const lowestPct = lowestHpAlly ? getHpPct(lowestHpAlly) : 1;
      score += (1 - lowestPct) * 100;
      if (lowestHpAlly?.id === char2.id)
        score += 30;
      return score;
    }
    if (skill.type === "attack") {
      if (skill.category === "aoe" || skill.areaRange) {
        const range = skill.range ?? char2.attackRange;
        let targetsInRange = 0;
        for (const e of aliveEnemies) {
          if (manhattan(char2, e) <= range + (skill.areaRange ?? 0)) {
            targetsInRange++;
          }
        }
        score += targetsInRange * 25;
        if (targetsInRange >= 2)
          score += 40;
      }
      if (skill.category === "\u76F4\u7EBF" || skill.category === "\u6A2A\u626B") {
        score += 20;
      }
      if (skill.statusEffect || skill.statusEffects?.length)
        score += 20;
      if (skill.lifesteal && hpPct < 0.3)
        score += 30;
      return score;
    }
    if (skill.type === "support") {
      if (hpPct < 0.5)
        score += 15;
      if (skill.category === "summon") {
        score += Math.min(aliveEnemies.length * 5, 30);
      }
      return score;
    }
    return score;
  }
  function pickBestSkill(char2, state, now) {
    if (!char2.skills || char2.skills.length === 0)
      return null;
    if (isSilenced(char2))
      return null;
    let bestSkill = null;
    let bestScore = -1;
    for (const skill of char2.skills) {
      if (skill.type === "passive")
        continue;
      if (!canCastSkill(char2, skill, now))
        continue;
      const s = scoreSkill(char2, skill, state);
      if (s > bestScore) {
        bestScore = s;
        bestSkill = skill;
      }
    }
    return bestSkill;
  }
  function getSkillTargetCells(char2, skill, state) {
    const range = skill.range ?? char2.attackRange;
    const allies = char2.isPlayer ? state.playerChars : state.enemyChars;
    const enemies = char2.isPlayer ? state.enemyChars : state.playerChars;
    if (skill.type === "heal" || skill.type === "support" && skill.category === "heal") {
      const woundedAllies = allies.filter((a) => !a.dead && a.id !== char2.id && getHpPct(a) < 0.95).sort((a, b) => getHpPct(a) - getHpPct(b));
      if (woundedAllies.length > 0) {
        const target = woundedAllies[0];
        return [{ row: target.row, col: target.col }];
      }
      return [{ row: char2.row, col: char2.col }];
    }
    if (skill.type === "attack" || skill.category === "summon") {
      if (skill.areaRange || skill.category === "aoe") {
        const nearestInRange = enemies.filter((e) => !e.dead && manhattan(char2, e) <= range).sort((a, b) => manhattan(char2, a) - manhattan(char2, b));
        if (nearestInRange.length > 0) {
          const target = nearestInRange[0];
          return [{ row: target.row, col: target.col }];
        }
      }
      if (skill.category === "\u76F4\u7EBF") {
        const nearest2 = enemies.filter((e) => !e.dead).sort((a, b) => manhattan(char2, a) - manhattan(char2, b))[0];
        if (nearest2) {
          const line = [];
          const dr = Math.sign(nearest2.row - char2.row);
          const dc = Math.sign(nearest2.col - char2.col);
          const len = skill.lineWidth ?? 3;
          for (let i = 1; i <= len; i++) {
            const r = char2.row + dr * i;
            const c = char2.col + dc * i;
            if (r >= 0 && r < state.mapHeight && c >= 0 && c < state.mapWidth) {
              line.push({ row: r, col: c });
            }
          }
          return line;
        }
      }
      if (skill.category === "\u6A2A\u626B") {
        const nearest2 = enemies.filter((e) => !e.dead).sort((a, b) => manhattan(char2, a) - manhattan(char2, b))[0];
        if (nearest2) {
          const sweepLen = skill.sweepLength ?? 3;
          const sweepWid = skill.sweepWidth ?? 1;
          const cells = [];
          const dr = Math.sign(nearest2.row - char2.row);
          const dc = Math.sign(nearest2.col - char2.col);
          for (let i = 1; i <= sweepLen; i++) {
            cells.push({ row: char2.row + dr * i, col: char2.col + dc * i });
            if (sweepWid > 1) {
              cells.push({ row: char2.row + dr * i + dc, col: char2.col + dc * i + dr });
            }
          }
          return cells;
        }
      }
      const nearest = enemies.filter((e) => !e.dead && manhattan(char2, e) <= range).sort((a, b) => manhattan(char2, a) - manhattan(char2, b));
      if (nearest.length > 0) {
        return [{ row: nearest[0].row, col: nearest[0].col }];
      }
      return [];
    }
    return [{ row: char2.row, col: char2.col }];
  }
  function getCharactersInArea(centerRow, centerCol, areaRange, state, allySide, char2) {
    const pool = allySide === "player" ? state.playerChars : state.enemyChars;
    return pool.filter(
      (c) => !c.dead && (char2 ? c.id !== char2.id : true) && manhattan({ row: centerRow, col: centerCol }, c) <= areaRange
    );
  }
  function computeSkillDamage(attacker, target, skill) {
    let base = attacker.attack;
    switch (skill.damageFormula) {
      case "power":
        base = skill.power + attacker.attack * 0.5;
        break;
      case "atk_plus_hp_pct":
        base = attacker.attack + attacker.maxHp * (skill.hpPct ?? 0.1);
        break;
      case "move_based":
        base = attacker.moveSpeed * skill.power;
        break;
      default:
        base = skill.power + attacker.attack * 0.5;
    }
    let damage = base - target.defense * 0.3;
    damage = Math.max(1, Math.floor(damage));
    return damage;
  }
  function applyStatusEffect(target, statusType, duration, events) {
    const dur = duration ?? 0;
    const existing = target.statuses.find((s) => s.type === statusType);
    if (existing) {
      existing.duration = Math.max(existing.duration, dur);
    } else {
      target.statuses.push({
        type: statusType,
        duration: dur,
        source: "skill"
      });
    }
    events.push({ type: "status", targetId: target.id, statusType, duration: dur });
  }
  function castSkillEffect(char2, skill, state, events, targetRow, targetCol) {
    let targetCells;
    if (targetRow !== void 0 && targetCol !== void 0) {
      targetCells = [{ row: targetRow, col: targetCol }];
    } else {
      targetCells = getSkillTargetCells(char2, skill, state);
    }
    if (targetCells.length === 0)
      return false;
    char2.mp = Math.max(0, char2.mp - skill.mpCost);
    if (skill.selfHpCost) {
      const hpLoss = skill.selfHpCostType === "current" ? char2.hp * skill.selfHpCost : char2.maxHp * skill.selfHpCost;
      char2.hp = Math.max(1, char2.hp - hpLoss);
    }
    if (skill.selfHealPct) {
      char2.hp = Math.min(char2.maxHp, char2.hp + char2.maxHp * skill.selfHealPct);
    }
    if (skill.selfMpHealPct) {
      char2.mp = Math.min(char2.maxMp, char2.mp + char2.maxMp * skill.selfMpHealPct);
    }
    const allySide = char2.isPlayer ? "player" : "enemy";
    const enemySide = char2.isPlayer ? "enemy" : "player";
    const allies = char2.isPlayer ? state.playerChars : state.enemyChars;
    const enemies = char2.isPlayer ? state.enemyChars : state.playerChars;
    for (const tCell of targetCells) {
      const areaRange = skill.areaRange ?? 0;
      if (skill.type === "heal") {
        const healTargets = areaRange > 0 ? getCharactersInArea(tCell.row, tCell.col, areaRange, state, allySide) : [allies.find((a) => a.row === tCell.row && a.col === tCell.col && !a.dead)].filter(Boolean);
        for (const t of healTargets) {
          const baseHeal = skill.selfHealMaxHpPct ? char2.maxHp * skill.selfHealMaxHpPct : skill.power + char2.attack * 0.3;
          const healAmount = Math.floor(baseHeal);
          t.hp = Math.min(t.maxHp, t.hp + healAmount);
          events.push({ type: "attack", attackerId: char2.id, targetId: t.id, damage: -healAmount });
        }
      } else if (skill.type === "attack" || skill.category === "aoe" || skill.category === "\u76F4\u7EBF" || skill.category === "\u6A2A\u626B") {
        const attackTargets = areaRange > 0 ? getCharactersInArea(tCell.row, tCell.col, areaRange, state, enemySide) : [enemies.find((e) => e.row === tCell.row && e.col === tCell.col && !e.dead)].filter(Boolean);
        for (const t of attackTargets) {
          const dmg = computeSkillDamage(char2, t, skill);
          t.hp -= dmg;
          events.push({ type: "attack", attackerId: char2.id, targetId: t.id, damage: dmg });
          if (skill.lifesteal) {
            const healed = Math.floor(dmg * skill.lifesteal);
            char2.hp = Math.min(char2.maxHp, char2.hp + healed);
          }
          if (skill.statusEffect) {
            applyStatusEffect(t, skill.statusEffect, skill.statusEffectDuration, events);
          }
          if (skill.statusEffects && skill.statusEffects.length > 0) {
            const durs = skill.statusEffectsDurations || skill.statusEffects.map(() => void 0);
            for (let i = 0; i < skill.statusEffects.length; i++) {
              applyStatusEffect(t, skill.statusEffects[i], durs[i], events);
            }
          }
          if (t.hp <= 0 && !t.dead) {
            t.hp = 0;
            t.dead = true;
            state.destroyedCharacters.push({ id: t.id, char: t });
            events.push({ type: "death", charId: t.id });
          }
        }
      } else if (skill.type === "support") {
        const supportTargets = areaRange > 0 ? getCharactersInArea(tCell.row, tCell.col, areaRange, state, allySide) : [allies.find((a) => a.row === tCell.row && a.col === tCell.col && !a.dead)].filter(Boolean);
        for (const t of supportTargets) {
          if (skill.statusEffect) {
            applyStatusEffect(t, skill.statusEffect, skill.statusEffectDuration, events);
          }
          if (skill.statusEffects && skill.statusEffects.length > 0) {
            const durs = skill.statusEffectsDurations || skill.statusEffects.map(() => void 0);
            for (let i = 0; i < skill.statusEffects.length; i++) {
              applyStatusEffect(t, skill.statusEffects[i], durs[i], events);
            }
          }
        }
      }
    }
    if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
      for (const st of skill.selfStatusEffects) {
        applyStatusEffect(char2, st, 0, events);
      }
    }
    if (skill.summonCharacter) {
    }
    return true;
  }
  function tryAutoSkill(char2, state, now, events) {
    const skill = pickBestSkill(char2, state, now);
    if (!skill)
      return false;
    const ok = castSkillEffect(char2, skill, state, events);
    if (ok) {
      if (!char2.skillLastUsedTime)
        char2.skillLastUsedTime = {};
      char2.skillLastUsedTime[skill.id] = now;
      events.push({ type: "skill", casterId: char2.id, skillId: skill.id, targetIds: [] });
    }
    return ok;
  }
  function applyStatusTick(char2, dtSec, events) {
    for (let i = char2.statuses.length - 1; i >= 0; i--) {
      const st = char2.statuses[i];
      st.duration -= dtSec;
      char2.statusAccumulators[st.type] = (char2.statusAccumulators[st.type] || 0) + dtSec;
      switch (st.type) {
        case "burning":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            const hpDmg = Math.floor(char2.maxHp * 0.05 * tickCount);
            const mpDmg = Math.floor(char2.maxMp * 0.05 * tickCount);
            char2.hp -= hpDmg;
            char2.mp -= mpDmg;
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
        case "bleeding":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            const dmg = Math.floor(char2.maxHp * 0.06 * tickCount);
            char2.hp -= dmg;
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
        case "dissipate":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            const dmg = Math.floor(char2.maxHp * 0.125 * tickCount);
            char2.hp -= dmg;
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
        case "poison":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            const dmg = Math.floor(char2.maxHp * 0.03 * tickCount);
            char2.hp -= dmg;
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
        case "disorder":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            char2.mp -= Math.floor(char2.maxMp * 0.05 * tickCount);
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
        case "regen":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            const heal = Math.floor(char2.maxHp * 0.05 * tickCount);
            char2.hp = Math.min(char2.maxHp, char2.hp + heal);
            char2.totalHeal += heal;
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
        case "heal":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            const heal = Math.floor(char2.maxHp * 0.025 * tickCount);
            char2.hp = Math.min(char2.maxHp, char2.hp + heal);
            char2.totalHeal += heal;
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
        case "meditate":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            char2.mp = Math.min(char2.maxMp, char2.mp + Math.floor(char2.maxMp * 0.05 * tickCount));
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
        case "tune":
          if (char2.statusAccumulators[st.type] >= 1) {
            const tickCount = Math.floor(char2.statusAccumulators[st.type]);
            char2.mp = Math.min(char2.maxMp, char2.mp + Math.floor(char2.maxMp * 0.025 * tickCount));
            char2.statusAccumulators[st.type] -= tickCount;
          }
          break;
      }
      if (st.duration <= 0) {
        char2.statuses.splice(i, 1);
      }
    }
    char2.hp = Math.max(0, Math.min(char2.maxHp, char2.hp));
    char2.mp = Math.max(0, Math.min(char2.maxMp, char2.mp));
  }
  function isFrozen(char2) {
    return char2.statuses.some((s) => s.type === "imprison" || s.type === "stun" || s.type === "cold");
  }
  function isSilenced(char2) {
    return char2.statuses.some((s) => s.type === "silenced");
  }
  function applyStatusModifiers(char2) {
    let moveSpeed = char2.moveSpeed;
    let attackSpeed = char2.attackSpeed;
    for (const st of char2.statuses) {
      const cfg = STATUS_CONFIG[st.type];
      if (cfg.effects?.moveSpeedMod)
        moveSpeed += cfg.effects.moveSpeedMod;
      if (cfg.effects?.attackSpeedMod)
        attackSpeed += cfg.effects.attackSpeedMod;
    }
    return { moveSpeed: Math.max(0, moveSpeed), attackSpeed: Math.max(0, attackSpeed) };
  }
  function tickCharacter(char2, state, dtMs, now, events) {
    if (char2.dead)
      return;
    if (isFrozen(char2))
      return;
    const dtSec = dtMs / 1e3;
    const { moveSpeed: effMoveSpeed, attackSpeed: effAttackSpeed } = applyStatusModifiers(char2);
    const blockedCells = /* @__PURE__ */ new Set();
    for (const c of state.chars) {
      if (c.id !== char2.id && !c.dead) {
        blockedCells.add(key(c.row, c.col));
      }
    }
    for (const k of state.cellReservations) {
      blockedCells.add(k);
    }
    const enemies = char2.isPlayer ? state.enemyChars : state.playerChars;
    let attackTarget = null;
    if (char2.aiType === "skirmisher" && char2.attackRange <= 1) {
      attackTarget = findInRangeEnemyByDefense(char2, enemies);
    } else if (char2.aiType === "skirmisher") {
      attackTarget = findInRangeEnemyByDefense(char2, enemies);
    } else if (char2.aiType === "sniper") {
      attackTarget = findInRangeEnemyByHp(char2, enemies);
    } else {
      attackTarget = findInRangeEnemyByDefense(char2, enemies);
    }
    if (attackTarget) {
      const interval = 1e3 / Math.max(0.1, effAttackSpeed);
      if (now - char2.lastAttackTime >= interval) {
        char2.lastAttackTime = now;
        const damage = computeAutoDamage(char2, attackTarget);
        attackTarget.hp -= damage;
        char2.totalDamage += damage;
        events.push({ type: "attack", attackerId: char2.id, targetId: attackTarget.id, damage });
        if (attackTarget.hp <= 0) {
          attackTarget.hp = 0;
          attackTarget.dead = true;
          events.push({ type: "death", charId: attackTarget.id });
        }
      }
      if (char2.aiType !== "skirmisher") {
        return;
      }
    }
    if (!isSilenced(char2)) {
      const casted = tryAutoSkill(char2, state, now, events);
      if (casted) {
        return;
      }
    }
    let target = null;
    if (char2.targetCharacterId) {
      target = state.chars.find((c) => c.id === char2.targetCharacterId && !c.dead) ?? null;
    }
    if (!target) {
      target = findNearestEnemy(char2, enemies);
      char2.targetCharacterId = target?.id;
      char2.path = [];
      char2.stuckCounter = 0;
    }
    if (!target)
      return;
    if (char2.aiType !== "skirmisher" && char2.attackRange > 1 && manhattan(char2, target) <= char2.attackRange) {
      return;
    }
    let goal;
    if (char2.aiType === "skirmisher") {
      goal = { row: target.row, col: target.col };
    } else if (char2.attackRange > 1) {
      goal = findRangedApproachPoint(
        char2,
        target,
        state.terrain,
        blockedCells,
        state.mapHeight,
        state.mapWidth
      );
    } else {
      goal = { row: target.row, col: target.col };
    }
    const needNewPath = !char2.path || char2.path.length === 0 || char2.stuckCounter >= 5 || // 目标超出当前路径终点（目标移动了）
    char2.path.length > 0 && (char2.path[char2.path.length - 1].row !== goal.row || char2.path[char2.path.length - 1].col !== goal.col);
    if (needNewPath) {
      const blockedForPath = new Set(blockedCells);
      blockedForPath.delete(key(goal.row, goal.col));
      char2.path = bfsPath(
        { row: char2.row, col: char2.col },
        goal,
        state.terrain,
        blockedForPath,
        state.mapHeight,
        state.mapWidth
      ) ?? [];
      char2.stuckCounter = 0;
    }
    if (char2.path && char2.path.length > 0) {
      char2.moveAccumulator += effMoveSpeed * dtSec;
      while (char2.moveAccumulator >= 1 && char2.path.length > 0) {
        const nextStep = char2.path[0];
        const k = key(nextStep.row, nextStep.col);
        const entityBlocked = blockedCells.has(k);
        const reserved = state.cellReservations.has(k);
        if (entityBlocked || reserved) {
          char2.stuckCounter++;
          char2.moveAccumulator = 0;
          break;
        }
        state.cellReservations.add(k);
        const fromRow = char2.row;
        const fromCol = char2.col;
        char2.row = nextStep.row;
        char2.col = nextStep.col;
        char2.path.shift();
        char2.moveAccumulator -= 1;
        char2.stuckCounter = 0;
      }
    }
  }
  var BattleManager = class {
    state;
    tickInterval = null;
    syncInterval = null;
    lastTickTime = 0;
    tickCount = 0;
    // 天气区域 getter（由 gameStore 构造时传入，因为 updateWeather 会重新赋值新数组）
    getFireAreas;
    getSnowAreas;
    getFogAreas;
    onSyncCallback;
    onEndCallback;
    /**
     * @param initialMap BattleMap（秒制的初始状态，我们只提取初始位置/地形）
     * @param players 玩家角色列表（BattleCharacter）
     * @param enemies 敌方角色列表（BattleCharacter）
     */
    constructor(initialMap, players, enemies, getFireAreas, getSnowAreas, getFogAreas) {
      this.getFireAreas = getFireAreas;
      this.getSnowAreas = getSnowAreas;
      this.getFogAreas = getFogAreas;
      this.state = this.buildInitialState(initialMap, players, enemies);
    }
    // ========== 初始化 ==========
    /** 从 BattleMap + BattleCharacter[] 构建 SimBattleState */
    buildInitialState(map, players, enemies) {
      const terrain = [];
      for (let r = 0; r < map.height; r++) {
        terrain[r] = [];
        for (let c = 0; c < map.width; c++) {
          terrain[r][c] = map.tiles[r][c].terrain;
        }
      }
      const playerChars = players.map((bc) => this.toSimChar(bc, true));
      const enemyChars = enemies.map((bc) => this.toSimChar(bc, false));
      return {
        mapWidth: map.width,
        mapHeight: map.height,
        terrain,
        chars: [...playerChars, ...enemyChars],
        playerChars,
        enemyChars,
        paused: false,
        speedMultiplier: 1,
        battleStartTime: Date.now(),
        battleEnded: false,
        events: [],
        cellReservations: /* @__PURE__ */ new Set(),
        destroyedCharacters: [],
        weatherLastTickTime: Date.now()
      };
    }
    /** BattleCharacter → SimChar */
    toSimChar(bc, isPlayer) {
      let aiType;
      if (bc.aiType) {
        aiType = bc.aiType;
      } else if (bc.attackRange <= 2) {
        aiType = "skirmisher";
      } else if (bc.attackRange === 3) {
        aiType = "ranged";
      } else {
        aiType = "sniper";
      }
      return {
        id: bc.id,
        characterId: bc.characterId,
        row: bc.row,
        col: bc.col,
        hp: bc.hp,
        maxHp: bc.maxHp,
        mp: bc.mp,
        maxMp: bc.maxMp,
        attack: bc.attack,
        defense: bc.defense,
        moveSpeed: bc.moveSpeed,
        attackRange: bc.attackRange,
        attackSpeed: bc.attackSpeed || 1,
        // 默认每秒 1 次
        isPlayer,
        job: bc.job,
        faction: bc.faction,
        aiType,
        skills: bc.skills ?? [],
        statuses: bc.statuses || [],
        lastAttackTime: 0,
        path: [],
        stuckCounter: 0,
        moveAccumulator: 0,
        lastStatusTickTime: Date.now(),
        statusAccumulators: {},
        dead: false,
        totalDamage: 0,
        totalHeal: 0
      };
    }
    // ========== 控制接口 ==========
    /** 开始战斗 */
    start() {
      if (this.tickInterval)
        return;
      this.lastTickTime = Date.now();
      this.tickInterval = setInterval(() => this.tick(), 50);
      this.syncInterval = setInterval(() => this.sync(), 200);
    }
    /** 暂停战斗 */
    pause() {
      this.state.paused = true;
    }
    /** 恢复战斗 */
    resume() {
      if (!this.state.paused)
        return;
      this.state.paused = false;
      this.lastTickTime = Date.now();
    }
    /** 切换暂停状态 */
    togglePause() {
      if (this.state.paused)
        this.resume();
      else
        this.pause();
    }
    /** 设置速度倍率（1x / 2x / 3x） */
    setSpeedMultiplier(multiplier) {
      this.state.speedMultiplier = multiplier;
    }
    /** 停止战斗并清理 */
    stop() {
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
        this.tickInterval = null;
      }
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
    }
    /** 设置同步回调（UI 层用来更新渲染） */
    onSync(callback) {
      this.onSyncCallback = callback;
    }
    /** 设置战斗结束回调 */
    onEnd(callback) {
      this.onEndCallback = callback;
    }
    /** 获取当前状态（只读快照，供 UI 查询） */
    getState() {
      return this.state;
    }
    /** 便捷：当前是否暂停 */
    isPaused() {
      return this.state.paused;
    }
    /** 便捷：当前速度倍率 */
    getSpeedMultiplier() {
      return this.state.speedMultiplier;
    }
    /** 便捷：战斗是否已结束 */
    isEnded() {
      return this.state.battleEnded;
    }
    /** 便捷：获取胜者（战斗未结束时 undefined） */
    getWinner() {
      return this.state.winner;
    }
    /**
     * 暂停指挥：玩家手动释放技能
     * @param charId 角色 ID
     * @param skillId 技能 ID
     * @param targetRow 目标行（可选，AOE/指定技能需要）
     * @param targetCol 目标列（可选）
     * @returns 是否成功释放
     */
    castSkillByPlayer(charId, skillId, targetRow, targetCol) {
      const char2 = this.state.chars.find((c) => c.id === charId);
      if (!char2 || char2.dead)
        return false;
      const skill = char2.skills.find((s) => s.id === skillId);
      if (!skill)
        return false;
      const now = Date.now();
      if (!canCastSkill(char2, skill, now))
        return false;
      if (targetRow !== void 0 && targetCol !== void 0) {
        const range = skill.range ?? char2.attackRange;
        if (manhattan(char2, { row: targetRow, col: targetCol }) > range)
          return false;
      }
      const ok = castSkillEffect(char2, skill, this.state, this.state.events, targetRow, targetCol);
      if (ok) {
        if (!char2.skillLastUsedTime)
          char2.skillLastUsedTime = {};
        char2.skillLastUsedTime[skillId] = now;
        this.state.events.push({
          type: "skill",
          casterId: charId,
          skillId,
          targetIds: targetRow !== void 0 ? [`${targetRow},${targetCol}`] : []
        });
        this.checkBattleEnd();
        return true;
      }
      return false;
    }
    /** 查询角色技能剩余冷却（毫秒），-1 表示不存在 */
    getSkillCooldownFor(charId, skillId) {
      const char2 = this.state.chars.find((c) => c.id === charId);
      if (!char2)
        return -1;
      const skill = char2.skills.find((s) => s.id === skillId);
      if (!skill)
        return -1;
      const lastUsed = char2.skillLastUsedTime?.[skillId] ?? 0;
      const cdMs = (skill.frequency ?? 6) * 1e3;
      return Math.max(0, lastUsed + cdMs - Date.now());
    }
    /** 角色是否是己方玩家角色（暂停指挥时 UI 用来判断） */
    isPlayerChar(charId) {
      const char2 = this.state.chars.find((c) => c.id === charId);
      return !!char2?.isPlayer && !char2.dead;
    }
    // ========== 核心 tick ==========
    /** 固定 50ms 驱动的逻辑循环 */
    tick() {
      if (this.state.paused || this.state.battleEnded) {
        this.lastTickTime = Date.now();
        return;
      }
      const now = Date.now();
      const dtMs = (now - this.lastTickTime) * this.state.speedMultiplier;
      this.lastTickTime = now;
      this.tickCount++;
      this.state.cellReservations.clear();
      const fireAreas = this.getFireAreas();
      const snowAreas = this.getSnowAreas();
      const fogAreas = this.getFogAreas();
      for (const char2 of this.state.chars) {
        if (char2.dead)
          continue;
        const origMoveSpeed = char2.moveSpeed;
        if (this.isInArea(snowAreas, char2.row, char2.col)) {
          char2.moveSpeed = origMoveSpeed * 0.7;
        }
        const origAtkRange = char2.attackRange;
        if (this.isInArea(fogAreas, char2.row, char2.col)) {
          char2.attackRange = Math.max(1, origAtkRange - 2);
        }
        tickCharacter(char2, this.state, dtMs, now, this.state.events);
        char2.moveSpeed = origMoveSpeed;
        char2.attackRange = origAtkRange;
        applyStatusTick(char2, dtMs / 1e3, this.state.events);
        if (char2.hp <= 0 && !char2.dead) {
          char2.dead = true;
          this.state.destroyedCharacters.push({ id: char2.id, char: char2 });
          this.state.events.push({ type: "death", charId: char2.id });
        }
      }
      const elapsedWeather = (now - this.state.weatherLastTickTime) / 1e3;
      if (elapsedWeather >= 1) {
        this.state.weatherLastTickTime = now;
        for (const char2 of this.state.chars) {
          if (char2.dead)
            continue;
          if (this.isInArea(fireAreas, char2.row, char2.col)) {
            const hpDmg = Math.max(1, Math.floor(char2.maxHp * 0.05));
            const mpDmg = Math.max(1, Math.floor(char2.maxMp * 0.05));
            char2.hp = Math.max(0, char2.hp - hpDmg);
            char2.mp = Math.max(0, char2.mp - mpDmg);
            this.state.events.push({
              type: "weather_damage",
              row: char2.row,
              col: char2.col,
              hpDamage: hpDmg,
              mpDamage: mpDmg,
              source: "fire"
            });
            if (char2.hp <= 0 && !char2.dead) {
              char2.dead = true;
              this.state.destroyedCharacters.push({ id: char2.id, char: char2 });
              this.state.events.push({ type: "death", charId: char2.id });
            }
          }
        }
      }
      if (this.tickCount % 20 === 0) {
        for (const c of this.state.chars) {
          if (c.dead)
            continue;
          const blocked = isFrozen(c) ? "FROZEN" : "";
          const target = c.targetCharacterId ? `\u2192${c.targetCharacterId.slice(-4)}` : "\u65E0\u76EE\u6807";
          const pathLen = c.path?.length ?? 0;
          const dmg = c.lastAttackTime > 0 ? `${Math.floor((now - c.lastAttackTime) / 100) / 10}s\u524D\u653B\u51FB` : "\u672A\u653B\u51FB";
          console.log(`[BT] ${c.id}(${c.isPlayer ? "P" : "E"}) (${c.row},${c.col}) mvSpeed=${c.moveSpeed} atkRange=${c.attackRange} atkSpeed=${c.attackSpeed} ${target} path=${pathLen} stuck=${c.stuckCounter} ${dmg} ${blocked}`);
        }
      }
      this.checkBattleEnd();
    }
    // ========== 天气区域辅助 ==========
    /** 判断 (row,col) 是否在某个天气区域里 */
    isInArea(areas, row, col) {
      for (const a of areas) {
        if (a.row === row && a.col === col)
          return true;
      }
      return false;
    }
    /** 检查是否有一方角色全部阵亡 */
    checkBattleEnd() {
      if (this.state.battleEnded)
        return;
      const playerAlive = this.state.playerChars.some((c) => !c.dead);
      const enemyAlive = this.state.enemyChars.some((c) => !c.dead);
      if (!playerAlive || !enemyAlive) {
        this.state.battleEnded = true;
        this.state.winner = playerAlive ? "player" : "enemy";
        this.stop();
        this.onEndCallback?.(this.state.winner);
      }
    }
    // ========== 同步渲染 ==========
    /** 每 200ms 把非响应式状态同步给 Vue 渲染层（目前由 gameStore 自己消费 events 所以这里只做回调） */
    sync() {
      this.onSyncCallback?.(this.state);
    }
  };

  // src/stores/gameStore.ts
  var useGameStore = (0, import_pinia.defineStore)("game", () => {
    const player = (0, import_vue.ref)(null);
    const currentCharacter = (0, import_vue.ref)(null);
    const battleMap = (0, import_vue.ref)(null);
    const isInBattle = (0, import_vue.ref)(false);
    const isLoading = (0, import_vue.ref)(false);
    const battleLog = (0, import_vue.ref)([]);
    const gameSpeed = (0, import_vue.ref)(1);
    const currentAiCharacter = (0, import_vue.ref)(null);
    let battleManager = null;
    let battleSyncTimer = null;
    const shakingTargets = (0, import_vue.ref)([]);
    function triggerShake(row, col, type) {
      const existingIndex = shakingTargets.value.findIndex((t) => t.row === row && t.col === col && t.type === type);
      if (existingIndex !== -1) {
        shakingTargets.value.splice(existingIndex, 1);
      }
      const target = { row, col, type };
      shakingTargets.value.push(target);
      setTimeout(() => {
        const idx = shakingTargets.value.findIndex((t) => t.row === row && t.col === col && t.type === type);
        if (idx !== -1) {
          shakingTargets.value.splice(idx, 1);
        }
      }, 300);
    }
    const mapShakeTick = (0, import_vue.ref)(0);
    const mapShakeIntensity = (0, import_vue.ref)("light");
    let mapShakeResetTimer = null;
    function triggerMapShake(intensity = "light") {
      mapShakeIntensity.value = intensity;
      mapShakeTick.value++;
      if (mapShakeResetTimer)
        clearTimeout(mapShakeResetTimer);
      mapShakeResetTimer = setTimeout(() => {
        mapShakeTick.value = 0;
        mapShakeResetTimer = null;
      }, 500);
    }
    const skillEffects = (0, import_vue.ref)([]);
    const trailParticles = (0, import_vue.ref)([]);
    const chargeEffects = (0, import_vue.ref)([]);
    const terrainMarks = (0, import_vue.ref)([]);
    const deathEffects = (0, import_vue.ref)([]);
    const EFFECT_COUNT_WARN = 40;
    const EFFECT_COUNT_LIMIT = 70;
    const EFFECT_MAX_QUEUE = 160;
    let effectCleanupTimer = null;
    function totalActiveEffectCount() {
      return skillEffects.value.length + trailParticles.value.length + hitSparkEffects.value.length + deathEffects.value.length + projectiles.value.length + statusApplyEffects.value.length + summonEffects.value.length + floatingTexts.value.length + chargeEffects.value.length + moveTrailEffects.value.length + terrainMarks.value.length;
    }
    function effectLoadLevel() {
      const total = totalActiveEffectCount();
      if (total >= EFFECT_COUNT_LIMIT)
        return 2;
      if (total >= EFFECT_COUNT_WARN)
        return 1;
      return 0;
    }
    function trimSkillEffects() {
      if (skillEffects.value.length > EFFECT_MAX_QUEUE) {
        skillEffects.value.splice(0, skillEffects.value.length - EFFECT_MAX_QUEUE);
      }
    }
    function sweepByTimestamp(list, lifetime, now) {
      const len = list.value.length;
      if (len === 0)
        return;
      const oldest = list.value[0];
      if (now - oldest.timestamp < lifetime)
        return;
      const remaining = list.value.filter((e) => now - e.timestamp < lifetime);
      if (remaining.length !== len)
        list.value = remaining;
    }
    function cleanupExpiredEffects() {
      const now = Date.now();
      sweepByTimestamp(skillEffects, 1e3, now);
      sweepByTimestamp(trailParticles, 1200, now);
      sweepByTimestamp(chargeEffects, 600, now);
      sweepByTimestamp(deathEffects, 1500, now);
      sweepByTimestamp(statusApplyEffects, 800, now);
      sweepByTimestamp(summonEffects, 1200, now);
      sweepByTimestamp(hitSparkEffects, 400, now);
      sweepByTimestamp(hitFlashTargets, 300, now);
      sweepByTimestamp(defeatRecords, 1200, now);
      sweepByTimestamp(floatingTexts, 900, now);
      sweepByTimestamp(moveTrailEffects, 500, now);
      {
        const remaining = projectiles.value.filter((p) => now - p.timestamp < (p.duration || 300) + 200);
        if (remaining.length !== projectiles.value.length)
          projectiles.value = remaining;
      }
      if (totalActiveEffectCount() === 0 && hitFlashTargets.value.length === 0 && defeatRecords.value.length === 0 && terrainMarks.value.length === 0 && shakingTargets.value.length === 0 && effectCleanupTimer) {
        clearInterval(effectCleanupTimer);
        effectCleanupTimer = null;
      }
    }
    function ensureEffectCleanupTimer() {
      if (!effectCleanupTimer) {
        effectCleanupTimer = setInterval(cleanupExpiredEffects, 300);
      }
    }
    function stopEffectCleanupTimer() {
      if (effectCleanupTimer) {
        clearInterval(effectCleanupTimer);
        effectCleanupTimer = null;
      }
    }
    function triggerSkillEffect(row, col, attribute2, size = "medium", skillType = "attack", category, fromRow, fromCol) {
      cleanupExpiredEffects();
      const color = ATTRIBUTE_CONFIG[attribute2]?.color || ATTRIBUTE_CONFIG.normal.color;
      const effectId = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const particles = generateParticles(attribute2, skillType);
      trimSkillEffects();
      skillEffects.value.push({
        id: effectId,
        row,
        col,
        color,
        size,
        timestamp: Date.now(),
        attribute: attribute2,
        skillType,
        particles,
        category,
        fromRow,
        fromCol
      });
      ensureEffectCleanupTimer();
    }
    function generateParticles(attribute2, skillType, reduced = false, aoeRange) {
      const load = effectLoadLevel();
      if (load === 2)
        return [];
      if (load === 1)
        reduced = true;
      let baseCount;
      if (aoeRange && aoeRange >= 3) {
        baseCount = 1;
      } else if (aoeRange && aoeRange >= 2) {
        baseCount = 1;
      } else if (skillType === "attack") {
        baseCount = 4;
      } else if (skillType === "heal") {
        baseCount = 3;
      } else {
        baseCount = 2;
      }
      const particleCount = reduced ? Math.min(baseCount, 2) : baseCount;
      if (particleCount <= 0)
        return [];
      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = i / particleCount * Math.PI * 2;
        const speed = 30 + Math.random() * 40;
        particles.push({
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          delay: Math.random() * 0.2
        });
      }
      return particles;
    }
    function triggerAOEEffects(centerRow, centerCol, areaRange, attribute2, rangeType = "diamond", skillType = "attack", category) {
      if (!battleMap.value)
        return;
      cleanupExpiredEffects();
      const timestamp = Date.now();
      const isLargeAOE = areaRange >= 3;
      const isMediumAOE = areaRange >= 2;
      const load = effectLoadLevel();
      const color = ATTRIBUTE_CONFIG[attribute2]?.color || ATTRIBUTE_CONFIG.normal.color;
      const isBombing = category === "\u8F70\u70B8";
      const isXianZhen = category === "\u9677\u9635";
      const batch = [];
      const addedPositions = /* @__PURE__ */ new Set();
      const addEffect = (r, c, opts) => {
        if (r < 0 || r >= battleMap.value.height || c < 0 || c >= battleMap.value.width)
          return;
        const key2 = `${r}_${c}`;
        if (addedPositions.has(key2))
          return;
        addedPositions.add(key2);
        const effectId = `skill_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        const finalParticles = opts.isMinimal ? [] : opts.particles || [];
        batch.push({
          id: effectId,
          row: r,
          col: c,
          color,
          size: isBombing || isXianZhen ? "small" : "medium",
          timestamp,
          attribute: attribute2,
          skillType,
          particles: finalParticles,
          category,
          fromRow: centerRow,
          fromCol: centerCol,
          isCenter: !!opts.isCenter,
          shockwaveScale: isLargeAOE ? "large" : "normal",
          isMinimal: !!opts.isMinimal
        });
      };
      addEffect(centerRow, centerCol, {
        isCenter: true,
        isMinimal: false,
        particles: generateParticles(attribute2, skillType, true, areaRange)
      });
      if (isLargeAOE || isMediumAOE) {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
          addEffect(centerRow + dr, centerCol + dc, { isMinimal: true });
        }
      } else {
        for (let dr = -areaRange; dr <= areaRange; dr++) {
          for (let dc = -areaRange; dc <= areaRange; dc++) {
            const r = centerRow + dr;
            const c = centerCol + dc;
            if (r < 0 || r >= battleMap.value.height || c < 0 || c >= battleMap.value.width)
              continue;
            const isValid = rangeType === "diamond" ? Math.abs(dr) + Math.abs(dc) <= areaRange : Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange;
            if (!isValid)
              continue;
            const isCenter = r === centerRow && c === centerCol;
            if (isCenter)
              continue;
            addEffect(r, c, {
              isMinimal: false,
              particles: generateParticles(attribute2, skillType, true, areaRange)
            });
          }
        }
      }
      if (batch.length > 0) {
        trimSkillEffects();
        skillEffects.value = [...skillEffects.value, ...batch];
      }
      if (skillType === "attack" || category === "\u8F70\u70B8" || category === "\u9677\u9635") {
        triggerMapShake(isLargeAOE ? "heavy" : "light");
      }
      ensureEffectCleanupTimer();
    }
    function triggerAreaEffects(positions, attribute2, skillType = "attack", category, direction, fromRow, fromCol) {
      if (!battleMap.value)
        return;
      cleanupExpiredEffects();
      const timestamp = Date.now();
      const color = ATTRIBUTE_CONFIG[attribute2]?.color || ATTRIBUTE_CONFIG.normal.color;
      const batch = [];
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const effectId = `skill_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        const particles = generateParticles(attribute2, skillType);
        batch.push({
          id: effectId,
          row: pos.row,
          col: pos.col,
          color,
          size: "medium",
          timestamp,
          attribute: attribute2,
          skillType,
          particles,
          category,
          direction,
          fromRow,
          fromCol
        });
      }
      if (batch.length > 0) {
        skillEffects.value = [...skillEffects.value, ...batch];
      }
      ensureEffectCleanupTimer();
    }
    function processAOEAttackSkill(attacker, skill, centerRow, centerCol, charTemplate, forceCategory) {
      if (!battleMap.value)
        return;
      const areaRange = skill.areaRange || 1;
      const rangeType = skill.rangeType || "diamond";
      const attribute2 = skill.attribute || "normal";
      const skillType = skill.type || "attack";
      const isBombing = skill.targetCountTag === "\u8F70\u70B8";
      const aoeCategory = forceCategory || (isBombing ? "\u8F70\u70B8" : "aoe");
      triggerAOEEffects(centerRow, centerCol, areaRange, attribute2, rangeType, skillType, aoeCategory);
      if (isBombing) {
        const projType = getProjectileTypeForSkill(skill);
        if (projType) {
          triggerProjectile(attacker.row, attacker.col, centerRow, centerCol, projType, attribute2);
        }
      }
      const attackPower2 = computeAttackPower(attacker);
      let totalDamage = 0;
      const damageResults = [];
      const defeatedNames = [];
      const destroyedBuildings = [];
      let splashTargets = [];
      let splashBuildings = [];
      const enemyTargets = attacker.isPlayer ? battleMap.value.enemies.filter((enemy) => {
        const dr = enemy.row - centerRow;
        const dc = enemy.col - centerCol;
        const inRange = rangeType === "diamond" ? Math.abs(dr) + Math.abs(dc) <= areaRange : Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange;
        return inRange && isCellVisibleToActor(attacker, enemy.row, enemy.col);
      }) : battleMap.value.players.filter((playerChar) => {
        const dr = playerChar.row - centerRow;
        const dc = playerChar.col - centerCol;
        const inRange = rangeType === "diamond" ? Math.abs(dr) + Math.abs(dc) <= areaRange : Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange;
        return inRange && isCellVisibleToActor(attacker, playerChar.row, playerChar.col);
      });
      const enemyBuildings = battleMap.value.buildings.filter((building) => {
        const dr = building.row - centerRow;
        const dc = building.col - centerCol;
        let inRange = false;
        if (rangeType === "diamond") {
          inRange = Math.abs(dr) + Math.abs(dc) <= areaRange;
        } else {
          inRange = Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange;
        }
        return inRange && building.isPlayer !== attacker.isPlayer && isCellVisibleToActor(attacker, building.row, building.col);
      });
      const obstaclePositions = [];
      for (let dr = -areaRange; dr <= areaRange; dr++) {
        for (let dc = -areaRange; dc <= areaRange; dc++) {
          const r = centerRow + dr;
          const c = centerCol + dc;
          if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
            const isValid = rangeType === "diamond" ? Math.abs(dr) + Math.abs(dc) <= areaRange : Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange;
            if (isValid && battleMap.value.tiles[r][c].terrain === "obstacle") {
              obstaclePositions.push({ row: r, col: c });
            }
          }
        }
      }
      const batchTimestamp = Date.now();
      const batchHitFlashes = [];
      const batchFloatingTexts = [];
      const batchStatusEffects = [];
      const batchDefeats = [];
      const batchDeaths = [];
      const batchShakes = [];
      enemyTargets.forEach((target) => {
        const targetTemplate = findCharacterTemplateInStore(target.characterId);
        const defense = computeDefensePower(target);
        let damage = 0;
        if (skill.damageFormula === "move_based") {
          const movedDistance = attacker.movedDistance || 0;
          const moveBonus = 1 + 0.3 * movedDistance;
          damage = Math.max(1, Math.floor(moveBonus * attackPower2 - defense));
        } else if (skill.damageFormula === "hp_lost_pct") {
          const maxHp = attacker.maxHp || 100;
          const hpLost = maxHp - (attacker.hp || 0);
          const hpLostPercent = hpLost / maxHp;
          const totalPower = skill.power / 100 + hpLostPercent;
          damage = Math.max(1, Math.floor(totalPower * attackPower2 - defense));
        } else {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
        }
        target.hp -= damage;
        if (attacker.totalDamage === void 0)
          attacker.totalDamage = 0;
        attacker.totalDamage += damage;
        totalDamage += damage;
        batchShakes.push({ row: target.row, col: target.col, type: "character" });
        batchHitFlashes.push({
          id: `hitflash_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
          row: target.row,
          col: target.col,
          timestamp: batchTimestamp
        });
        batchFloatingTexts.push({
          id: `float_${batchTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
          row: target.row,
          col: target.col,
          value: damage,
          type: "damage",
          attribute: attribute2,
          isShaking: true,
          sign: "-",
          timestamp: batchTimestamp
        });
        damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
        if (skill.statusEffect) {
          addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0);
          batchStatusEffects.push({
            id: `status_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            statusType: skill.statusEffect,
            isPositive: POSITIVE_STATUSES.includes(skill.statusEffect),
            timestamp: batchTimestamp
          });
          damageResults.push(`\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}\u3011\u72B6\u6001`);
        }
        if (skill.statusEffects && skill.statusEffects.length > 0) {
          skill.statusEffects.forEach((status, index) => {
            const duration = skill.statusEffectsDurations?.[index] || 0;
            addStatusToCharacter(target, status, true, duration);
            batchStatusEffects.push({
              id: `status_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
              row: target.row,
              col: target.col,
              statusType: status,
              isPositive: POSITIVE_STATUSES.includes(status),
              timestamp: batchTimestamp
            });
            damageResults.push(`\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
          });
        }
        if (target.hp <= 0) {
          batchDefeats.push({
            id: `defeat_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            defeatType: "kill",
            timestamp: batchTimestamp
          });
          const deathColor = ATTRIBUTE_CONFIG[attribute2]?.color || "#ffd86b";
          batchDeaths.push({
            id: `death_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            color: deathColor,
            attribute: attribute2,
            timestamp: batchTimestamp
          });
          removeCharacterFromBattle(target.id, target.isPlayer);
          defeatedNames.push(targetTemplate?.name || target.characterId);
        }
      });
      enemyBuildings.forEach((building) => {
        let damage = 0;
        if (skill.damageFormula === "move_based") {
          damage = Math.max(1, Math.floor(attackPower2));
        } else {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
        }
        building.hp -= damage;
        if (attacker.totalDamage === void 0)
          attacker.totalDamage = 0;
        attacker.totalDamage += damage;
        totalDamage += damage;
        batchShakes.push({ row: building.row, col: building.col, type: "building" });
        batchHitFlashes.push({
          id: `hitflash_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
          row: building.row,
          col: building.col,
          timestamp: batchTimestamp
        });
        batchFloatingTexts.push({
          id: `float_${batchTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
          row: building.row,
          col: building.col,
          value: damage,
          type: "damage",
          attribute: void 0,
          isShaking: false,
          sign: "-",
          timestamp: batchTimestamp
        });
        damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
        trySpawnZombieFromHeart(building);
        if (building.hp <= 0) {
          removeBuildingFromBattle(building.id);
          batchDefeats.push({
            id: `defeat_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: building.row,
            col: building.col,
            defeatType: "kill",
            timestamp: batchTimestamp
          });
          battleMap.value.tiles[building.row][building.col].building = null;
          destroyedBuildings.push(building.name);
        }
      });
      if (batchHitFlashes.length > 0) {
        hitFlashTargets.value = [...hitFlashTargets.value, ...batchHitFlashes];
      }
      if (batchFloatingTexts.length > 0) {
        floatingTexts.value = [...floatingTexts.value, ...batchFloatingTexts];
      }
      if (batchStatusEffects.length > 0) {
        statusApplyEffects.value = [...statusApplyEffects.value, ...batchStatusEffects];
      }
      if (batchDefeats.length > 0) {
        defeatRecords.value = [...defeatRecords.value, ...batchDefeats];
      }
      if (batchDeaths.length > 0) {
        deathEffects.value = [...deathEffects.value, ...batchDeaths];
        triggerMapShake("light");
      }
      if (batchShakes.length > 0) {
        const seen = /* @__PURE__ */ new Set();
        const uniqueShakes = [];
        for (let i = batchShakes.length - 1; i >= 0; i--) {
          const key2 = `${batchShakes[i].row}_${batchShakes[i].col}_${batchShakes[i].type}`;
          if (!seen.has(key2)) {
            seen.add(key2);
            uniqueShakes.unshift(batchShakes[i]);
          }
        }
        shakingTargets.value = [...shakingTargets.value.filter(
          (t) => !uniqueShakes.some((u) => u.row === t.row && u.col === t.col && u.type === t.type)
        ), ...uniqueShakes];
        uniqueShakes.forEach((s) => {
          setTimeout(() => {
            const idx = shakingTargets.value.findIndex((t) => t.row === s.row && t.col === s.col && t.type === s.type);
            if (idx !== -1)
              shakingTargets.value.splice(idx, 1);
          }, 300);
        });
      }
      ensureEffectCleanupTimer();
      obstaclePositions.forEach((pos) => {
        battleMap.value.tiles[pos.row][pos.col].terrain = "empty";
      });
      if (obstaclePositions.length > 0) {
        damageResults.push(`\u6E05\u9664${obstaclePositions.length}\u4E2A\u969C\u788D\u7269`);
      }
      if (isBombing) {
        const splashRange = areaRange + 1;
        splashTargets = attacker.isPlayer ? battleMap.value.enemies.filter((enemy) => {
          const dr = enemy.row - centerRow;
          const dc = enemy.col - centerCol;
          const dist = Math.abs(dr) + Math.abs(dc);
          return dist > areaRange && dist <= splashRange && isCellVisibleToActor(attacker, enemy.row, enemy.col);
        }) : battleMap.value.players.filter((playerChar) => {
          const dr = playerChar.row - centerRow;
          const dc = playerChar.col - centerCol;
          const dist = Math.abs(dr) + Math.abs(dc);
          return dist > areaRange && dist <= splashRange && isCellVisibleToActor(attacker, playerChar.row, playerChar.col);
        });
        splashBuildings = battleMap.value.buildings.filter((building) => {
          const dr = building.row - centerRow;
          const dc = building.col - centerCol;
          const dist = Math.abs(dr) + Math.abs(dc);
          return dist > areaRange && dist <= splashRange && building.isPlayer !== attacker.isPlayer && isCellVisibleToActor(attacker, building.row, building.col);
        });
        if (splashTargets.length > 0 || splashBuildings.length > 0) {
          const splashBatch = [];
          const splashTimestamp = Date.now();
          for (let dr = -splashRange; dr <= splashRange; dr++) {
            for (let dc = -splashRange; dc <= splashRange; dc++) {
              const dist = Math.abs(dr) + Math.abs(dc);
              if (dist > areaRange && dist <= splashRange) {
                const r = centerRow + dr;
                const c = centerCol + dc;
                if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
                  const splashColor = ATTRIBUTE_CONFIG[attribute2]?.color || "#ff6b35";
                  const splashEffectId = `splash_${splashTimestamp}_${Math.random().toString(36).substr(2, 9)}`;
                  splashBatch.push({
                    id: splashEffectId,
                    row: r,
                    col: c,
                    color: splashColor,
                    size: "medium",
                    timestamp: splashTimestamp,
                    attribute: attribute2,
                    type: "explosion"
                  });
                }
              }
            }
          }
          if (splashBatch.length > 0) {
            trimSkillEffects();
            skillEffects.value = [...skillEffects.value, ...splashBatch];
            ensureEffectCleanupTimer();
          }
        }
        const splashBatchTimestamp = Date.now();
        const splashHitFlashes = [];
        const splashFloatingTexts = [];
        const splashStatusEffects = [];
        const splashDefeats = [];
        const splashShakes = [];
        splashTargets.forEach((target) => {
          const targetTemplate = findCharacterTemplateInStore(target.characterId);
          const defense = computeDefensePower(target);
          let baseDamage = 0;
          if (skill.damageFormula === "move_based") {
            const movedDistance = attacker.movedDistance || 0;
            const moveBonus = 1 + 0.3 * movedDistance;
            baseDamage = Math.max(1, Math.floor(moveBonus * attackPower2 - defense));
          } else {
            baseDamage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
          }
          const splashDamage = Math.max(1, Math.floor(baseDamage * 0.5));
          target.hp -= splashDamage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += splashDamage;
          totalDamage += splashDamage;
          splashShakes.push({ row: target.row, col: target.col, type: "character" });
          splashHitFlashes.push({
            id: `hitflash_${splashBatchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            timestamp: splashBatchTimestamp
          });
          splashFloatingTexts.push({
            id: `float_${splashBatchTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
            row: target.row,
            col: target.col,
            value: splashDamage,
            type: "damage",
            attribute: attribute2,
            isShaking: true,
            sign: "-",
            timestamp: splashBatchTimestamp
          });
          damageResults.push(`\u6E85\u5C04\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${splashDamage}\u70B9\u4F24\u5BB3`);
          if (skill.statusEffect) {
            addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0);
            splashStatusEffects.push({
              id: `status_${splashBatchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
              row: target.row,
              col: target.col,
              statusType: skill.statusEffect,
              isPositive: POSITIVE_STATUSES.includes(skill.statusEffect),
              timestamp: splashBatchTimestamp
            });
            damageResults.push(`\u6E85\u5C04\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}\u3011\u72B6\u6001`);
          }
          if (skill.statusEffects && skill.statusEffects.length > 0) {
            skill.statusEffects.forEach((status, index) => {
              const duration = skill.statusEffectsDurations?.[index] || 0;
              addStatusToCharacter(target, status, true, duration);
              splashStatusEffects.push({
                id: `status_${splashBatchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
                row: target.row,
                col: target.col,
                statusType: status,
                isPositive: POSITIVE_STATUSES.includes(status),
                timestamp: splashBatchTimestamp
              });
              damageResults.push(`\u6E85\u5C04\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
            });
          }
          if (target.hp <= 0) {
            splashDefeats.push({
              id: `defeat_${splashBatchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
              row: target.row,
              col: target.col,
              defeatType: "kill",
              timestamp: splashBatchTimestamp
            });
            removeCharacterFromBattle(target.id, target.isPlayer);
            defeatedNames.push(targetTemplate?.name || target.characterId);
          }
        });
        splashBuildings.forEach((building) => {
          let baseDamage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
          const splashDamage = Math.max(1, Math.floor(baseDamage * 0.5));
          building.hp -= splashDamage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += splashDamage;
          totalDamage += splashDamage;
          splashShakes.push({ row: building.row, col: building.col, type: "building" });
          splashFloatingTexts.push({
            id: `float_${splashBatchTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
            row: building.row,
            col: building.col,
            value: splashDamage,
            type: "damage",
            attribute: void 0,
            isShaking: false,
            sign: "-",
            timestamp: splashBatchTimestamp
          });
          damageResults.push(`\u6E85\u5C04\u5BF9${building.name}\u3011\u9020\u6210${splashDamage}\u70B9\u4F24\u5BB3`);
          if (building.hp <= 0) {
            removeBuildingFromBattle(building.id);
            splashDefeats.push({
              id: `defeat_${splashBatchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
              row: building.row,
              col: building.col,
              defeatType: "kill",
              timestamp: splashBatchTimestamp
            });
            battleMap.value.tiles[building.row][building.col].building = null;
            destroyedBuildings.push(building.name);
          }
        });
        if (splashHitFlashes.length > 0) {
          hitFlashTargets.value = [...hitFlashTargets.value, ...splashHitFlashes];
        }
        if (splashFloatingTexts.length > 0) {
          floatingTexts.value = [...floatingTexts.value, ...splashFloatingTexts];
        }
        if (splashStatusEffects.length > 0) {
          statusApplyEffects.value = [...statusApplyEffects.value, ...splashStatusEffects];
        }
        if (splashDefeats.length > 0) {
          defeatRecords.value = [...defeatRecords.value, ...splashDefeats];
        }
        if (splashShakes.length > 0) {
          const seen = /* @__PURE__ */ new Set();
          const uniqueShakes = [];
          for (let i = splashShakes.length - 1; i >= 0; i--) {
            const key2 = `${splashShakes[i].row}_${splashShakes[i].col}_${splashShakes[i].type}`;
            if (!seen.has(key2)) {
              seen.add(key2);
              uniqueShakes.unshift(splashShakes[i]);
            }
          }
          shakingTargets.value = [...shakingTargets.value.filter(
            (t) => !uniqueShakes.some((u) => u.row === t.row && u.col === t.col && u.type === t.type)
          ), ...uniqueShakes];
          uniqueShakes.forEach((s) => {
            setTimeout(() => {
              const idx = shakingTargets.value.findIndex((t) => t.row === s.row && t.col === s.col && t.type === s.type);
              if (idx !== -1)
                shakingTargets.value.splice(idx, 1);
            }, 300);
          });
        }
      }
      if (skill.lifesteal && totalDamage > 0) {
        const healAmount = Math.floor(totalDamage * skill.lifesteal);
        attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp);
        damageResults.push(`\u6062\u590D${healAmount}\u70B9\u751F\u547D\u503C`);
      }
      if (skill.selfHpCost) {
        const hpBase = skill.selfHpCostType === "current" ? attacker.hp || 1 : attacker.maxHp || 100;
        const hpCost = Math.floor(hpBase * skill.selfHpCost);
        attacker.hp = Math.max(1, attacker.hp - hpCost);
        damageResults.push(`\u6D88\u8017\u4E86${hpCost}\u70B9\u751F\u547D\u503C`);
      }
      if (skill.selfStatusEffects) {
        skill.selfStatusEffects.forEach((effect, index) => {
          const duration = getSelfStatusDuration(skill, index);
          addStatusToCharacter(attacker, effect, true, duration);
          triggerStatusApplyEffect(attacker.row, attacker.col, effect);
          damageResults.push(`\u81EA\u8EAB\u83B7\u5F97\u3010${STATUS_CONFIG[effect]?.name || effect}\u3011\u72B6\u6001${duration > 0 ? `\uFF0C\u6301\u7EED${duration}\u79D2` : ""}`);
        });
      }
      if (skill.selfMaxHpBuff) {
        const hpBuff = Math.floor(attackPower2 * skill.selfMaxHpBuff);
        attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff;
        attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += hpBuff;
        damageResults.push(`\u751F\u547D\u503C\u4E0A?${hpBuff}\u5E76\u6062${hpBuff}\u751F\u547D`);
      }
      if (skill.selfHealPct && attacker.maxHp) {
        const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct);
        attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += healAmount;
        damageResults.push(`\u6062\u590D${healAmount}\u70B9\u751F\u547D\u503C`);
        showFloatingText(attacker.row, attacker.col, healAmount, "heal");
      }
      if (skill.selfMpHealPct && attacker.maxMp) {
        const mpHealAmount = Math.floor(attacker.maxMp * skill.selfMpHealPct);
        attacker.mp = Math.min(attacker.mp + mpHealAmount, attacker.maxMp);
        damageResults.push(`\u6062\u590D${mpHealAmount}\u70B9\u6CD5\u529B\u503C`);
        showFloatingText(attacker.row, attacker.col, mpHealAmount, "mp");
      }
      if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
        const negStatuses = NEGATIVE_STATUSES.filter((status) => hasStatus(attacker, status));
        if (negStatuses.length > 0) {
          const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs);
          toDispel.forEach((status) => {
            removeStatusFromCharacter(attacker, status);
            damageResults.push(`\u9A71\u6563${STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
          });
        }
      }
      const totalHits = enemyTargets.length + enemyBuildings.length + obstaclePositions.length + (isBombing ? splashTargets.length + splashBuildings.length : 0);
      if (totalHits > 0) {
        const summary = damageResults.join("\uFF0C");
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\u547D${totalHits} \u4E2A\u76EE\u6807\uFF1A${summary}`);
      } else {
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u8303\u56F4\u5185\u6CA1\u6709\u53EF\u653B\u51FB\u76EE\u6807`);
      }
    }
    function processLineAttackSkill(attacker, skill, direction, charTemplate) {
      if (!battleMap.value)
        return;
      const lineRange = skill.range || 1;
      const lineWidth = skill.lineWidth || 1;
      const attribute2 = skill.attribute || "normal";
      const skillType = skill.type || "attack";
      const attackPower2 = computeAttackPower(attacker);
      triggerSkillEffect(attacker.row, attacker.col, attribute2, "large", skillType);
      let totalDamage = 0;
      const damageResults = [];
      const defeatedNames = [];
      const destroyedBuildings = [];
      const linePositions = [];
      const row = attacker.row;
      const col = attacker.col;
      const halfWidth = Math.floor(lineWidth / 2);
      const widthOffsets = lineWidth === 1 ? [0] : Array.from({ length: lineWidth }, (_, i) => i - halfWidth);
      switch (direction) {
        case "up":
          for (let i = 1; i <= lineRange; i++) {
            const r = row - i;
            if (r >= 0 && r < battleMap.value.height) {
              for (const wOff of widthOffsets) {
                const c = col + wOff;
                if (c >= 0 && c < battleMap.value.width) {
                  linePositions.push({ row: r, col: c });
                }
              }
            }
          }
          break;
        case "down":
          for (let i = 1; i <= lineRange; i++) {
            const r = row + i;
            if (r >= 0 && r < battleMap.value.height) {
              for (const wOff of widthOffsets) {
                const c = col + wOff;
                if (c >= 0 && c < battleMap.value.width) {
                  linePositions.push({ row: r, col: c });
                }
              }
            }
          }
          break;
        case "left":
          for (let i = 1; i <= lineRange; i++) {
            const c = col - i;
            if (c >= 0 && c < battleMap.value.width) {
              for (const wOff of widthOffsets) {
                const r = row + wOff;
                if (r >= 0 && r < battleMap.value.height) {
                  linePositions.push({ row: r, col: c });
                }
              }
            }
          }
          break;
        case "right":
          for (let i = 1; i <= lineRange; i++) {
            const c = col + i;
            if (c >= 0 && c < battleMap.value.width) {
              for (const wOff of widthOffsets) {
                const r = row + wOff;
                if (r >= 0 && r < battleMap.value.height) {
                  linePositions.push({ row: r, col: c });
                }
              }
            }
          }
          break;
      }
      triggerAreaEffects(linePositions, attribute2, skillType, "\u76F4\u7EBF", direction, attacker.row, attacker.col);
      triggerTrailEffect(linePositions, attribute2, "medium");
      const enemyTargets = attacker.isPlayer ? battleMap.value.enemies.filter(
        (enemy) => linePositions.some((pos) => pos.row === enemy.row && pos.col === enemy.col) && isCellVisibleToActor(attacker, enemy.row, enemy.col)
      ) : battleMap.value.players.filter(
        (playerChar) => linePositions.some((pos) => pos.row === playerChar.row && pos.col === playerChar.col) && isCellVisibleToActor(attacker, playerChar.row, playerChar.col)
      );
      const enemyBuildings = battleMap.value.buildings.filter(
        (building) => linePositions.some((pos) => pos.row === building.row && pos.col === building.col) && building.isPlayer !== attacker.isPlayer && isCellVisibleToActor(attacker, building.row, building.col)
      );
      const obstaclePositions = linePositions.filter(
        (pos) => battleMap.value.tiles[pos.row]?.[pos.col]?.terrain === "obstacle"
      );
      const batchTimestamp = Date.now();
      const batchHitFlashes = [];
      const batchFloatingTexts = [];
      const batchStatusEffects = [];
      const batchDefeats = [];
      const batchDeaths = [];
      const batchShakes = [];
      enemyTargets.forEach((target) => {
        const targetTemplate = findCharacterTemplateInStore(target.characterId);
        const defense = computeDefensePower(target);
        let damage = 0;
        if (skill.damageFormula === "move_based") {
          const movedDistance = attacker.movedDistance || 0;
          const moveBonus = 1 + 0.3 * movedDistance;
          damage = Math.max(1, Math.floor(moveBonus * attackPower2 - defense));
        } else if (skill.damageFormula === "atk_plus_hp_pct" && skill.hpPct) {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 + skill.hpPct * (target.hp || 1) - defense));
        } else {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
        }
        target.hp -= damage;
        if (attacker.totalDamage === void 0)
          attacker.totalDamage = 0;
        attacker.totalDamage += damage;
        totalDamage += damage;
        batchShakes.push({ row: target.row, col: target.col, type: "character" });
        batchHitFlashes.push({
          id: `hitflash_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
          row: target.row,
          col: target.col,
          timestamp: batchTimestamp
        });
        batchFloatingTexts.push({
          id: `float_${batchTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
          row: target.row,
          col: target.col,
          value: damage,
          type: "damage",
          attribute: attribute2,
          isShaking: true,
          sign: "-",
          timestamp: batchTimestamp
        });
        damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
        if (skill.statusEffect) {
          addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0);
          batchStatusEffects.push({
            id: `status_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            statusType: skill.statusEffect,
            isPositive: POSITIVE_STATUSES.includes(skill.statusEffect),
            timestamp: batchTimestamp
          });
          damageResults.push(`\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}\u3011\u72B6\u6001`);
        }
        if (skill.statusEffects) {
          skill.statusEffects.forEach((effect, index) => {
            const duration = skill.statusEffectsDurations?.[index] || 0;
            addStatusToCharacter(target, effect, true, duration);
            batchStatusEffects.push({
              id: `status_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
              row: target.row,
              col: target.col,
              statusType: effect,
              isPositive: POSITIVE_STATUSES.includes(effect),
              timestamp: batchTimestamp
            });
            damageResults.push(`\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[effect]?.name || effect}\u3011\u72B6\u6001`);
          });
        }
        if (skill.clearPositiveStatus) {
          POSITIVE_STATUSES.forEach((status) => {
            if (hasStatus(target, status)) {
              removeStatusFromCharacter(target, status);
              damageResults.push(`\u9A71\u6563${targetTemplate?.name || target.characterId}\u3011\u7684{STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
            }
          });
        }
        if (target.hp <= 0) {
          batchDefeats.push({
            id: `defeat_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            defeatType: "kill",
            timestamp: batchTimestamp
          });
          const deathColor = ATTRIBUTE_CONFIG[attribute2]?.color || "#ffd86b";
          batchDeaths.push({
            id: `death_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            color: deathColor,
            attribute: attribute2,
            timestamp: batchTimestamp
          });
          removeCharacterFromBattle(target.id, target.isPlayer);
          defeatedNames.push(targetTemplate?.name || target.characterId);
        }
      });
      enemyBuildings.forEach((building) => {
        let damage = 0;
        if (skill.damageFormula === "move_based") {
          damage = Math.max(1, Math.floor(attackPower2));
        } else if (skill.damageFormula === "atk_plus_hp_pct" && skill.hpPct) {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
        } else {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
        }
        building.hp -= damage;
        if (attacker.totalDamage === void 0)
          attacker.totalDamage = 0;
        attacker.totalDamage += damage;
        totalDamage += damage;
        batchShakes.push({ row: building.row, col: building.col, type: "building" });
        batchFloatingTexts.push({
          id: `float_${batchTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
          row: building.row,
          col: building.col,
          value: damage,
          type: "damage",
          attribute: void 0,
          isShaking: false,
          sign: "-",
          timestamp: batchTimestamp
        });
        damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
        trySpawnZombieFromHeart(building);
        if (building.hp <= 0) {
          removeBuildingFromBattle(building.id);
          batchDefeats.push({
            id: `defeat_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: building.row,
            col: building.col,
            defeatType: "kill",
            timestamp: batchTimestamp
          });
          battleMap.value.tiles[building.row][building.col].building = null;
          destroyedBuildings.push(building.name);
        }
      });
      obstaclePositions.forEach((pos) => {
        battleMap.value.tiles[pos.row][pos.col].terrain = "empty";
        batchShakes.push({ row: pos.row, col: pos.col, type: "character" });
      });
      if (obstaclePositions.length > 0) {
        damageResults.push(`\u6E05\u9664${obstaclePositions.length}\u4E2A\u969C\u788D\u7269`);
      }
      if (batchHitFlashes.length > 0) {
        hitFlashTargets.value = [...hitFlashTargets.value, ...batchHitFlashes];
      }
      if (batchFloatingTexts.length > 0) {
        floatingTexts.value = [...floatingTexts.value, ...batchFloatingTexts];
      }
      if (batchStatusEffects.length > 0) {
        statusApplyEffects.value = [...statusApplyEffects.value, ...batchStatusEffects];
      }
      if (batchDefeats.length > 0) {
        defeatRecords.value = [...defeatRecords.value, ...batchDefeats];
      }
      if (batchDeaths.length > 0) {
        deathEffects.value = [...deathEffects.value, ...batchDeaths];
        triggerMapShake("light");
      }
      if (batchShakes.length > 0) {
        const seen = /* @__PURE__ */ new Set();
        const uniqueShakes = [];
        for (let i = batchShakes.length - 1; i >= 0; i--) {
          const key2 = `${batchShakes[i].row}_${batchShakes[i].col}_${batchShakes[i].type}`;
          if (!seen.has(key2)) {
            seen.add(key2);
            uniqueShakes.unshift(batchShakes[i]);
          }
        }
        shakingTargets.value = [...shakingTargets.value.filter(
          (t) => !uniqueShakes.some((u) => u.row === t.row && u.col === t.col && u.type === t.type)
        ), ...uniqueShakes];
        uniqueShakes.forEach((s) => {
          setTimeout(() => {
            const idx = shakingTargets.value.findIndex((t) => t.row === s.row && t.col === s.col && t.type === s.type);
            if (idx !== -1)
              shakingTargets.value.splice(idx, 1);
          }, 300);
        });
      }
      ensureEffectCleanupTimer();
      if (skill.lifesteal && totalDamage > 0) {
        const healAmount = Math.floor(totalDamage * skill.lifesteal);
        attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp);
        damageResults.push(`\u6062\u590D${healAmount}\u70B9\u751F\u547D\u503C`);
      }
      if (skill.selfHpCost) {
        const hpBase = skill.selfHpCostType === "current" ? attacker.hp || 1 : attacker.maxHp || 100;
        const hpCost = Math.floor(hpBase * skill.selfHpCost);
        attacker.hp = Math.max(1, attacker.hp - hpCost);
        damageResults.push(`\u6D88\u8017\u4E86${hpCost}\u70B9\u751F\u547D\u503C`);
      }
      if (skill.selfStatusEffects) {
        skill.selfStatusEffects.forEach((effect, index) => {
          const duration = skill.selfStatusEffectsDurations?.[index] || 0;
          addStatusToCharacter(attacker, effect, true, duration);
          damageResults.push(`\u81EA\u8EAB\u83B7\u5F97\u3010${STATUS_CONFIG[effect]?.name || effect}\u3011\u72B6\u6001${duration > 0 ? `\uFF0C\u6301\u7EED${duration}\u79D2` : ""}`);
        });
      }
      if (skill.selfMaxHpBuff) {
        const hpBuff = Math.floor(attackPower2 * skill.selfMaxHpBuff);
        attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff;
        attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += hpBuff;
        damageResults.push(`\u751F\u547D\u503C\u4E0A?${hpBuff}\u5E76\u6062${hpBuff}\u751F\u547D`);
      }
      if (skill.selfHealPct && attacker.maxHp) {
        const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct);
        attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += healAmount;
        damageResults.push(`\u6062\u590D${healAmount}\u70B9\u751F\u547D\u503C`);
        showFloatingText(attacker.row, attacker.col, healAmount, "heal");
      }
      if (skill.selfMpHealPct && attacker.maxMp) {
        const mpHealAmount = Math.floor(attacker.maxMp * skill.selfMpHealPct);
        attacker.mp = Math.min(attacker.mp + mpHealAmount, attacker.maxMp);
        damageResults.push(`\u6062\u590D${mpHealAmount}\u70B9\u6CD5\u529B\u503C`);
        showFloatingText(attacker.row, attacker.col, mpHealAmount, "mp");
      }
      if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
        const negStatuses = NEGATIVE_STATUSES.filter((status) => hasStatus(attacker, status));
        if (negStatuses.length > 0) {
          const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs);
          toDispel.forEach((status) => {
            removeStatusFromCharacter(attacker, status);
            damageResults.push(`\u9A71\u6563${STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
          });
        }
      }
      const totalHits = enemyTargets.length + enemyBuildings.length + obstaclePositions.length;
      if (totalHits > 0) {
        const summary = damageResults.join("\uFF0C");
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\u547D${totalHits} \u4E2A\u76EE\u6807\uFF1A${summary}`);
      } else {
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u8303\u56F4\u5185\u6CA1\u6709\u53EF\u653B\u51FB\u76EE\u6807`);
      }
    }
    function processSweepAttackSkill(attacker, skill, direction, charTemplate) {
      if (!battleMap.value)
        return;
      const sweepLength = skill.sweepLength || 3;
      const sweepWidth = skill.sweepWidth || 2;
      const attribute2 = skill.attribute || "normal";
      const skillType = skill.type;
      const attackPower2 = computeAttackPower(attacker);
      triggerSkillEffect(attacker.row, attacker.col, attribute2, "large", skillType);
      let totalDamage = 0;
      const damageResults = [];
      const defeatedNames = [];
      const destroyedBuildings = [];
      const sweepPositions = [];
      const row = attacker.row;
      const col = attacker.col;
      const startJ = sweepWidth % 2 === 0 ? -(sweepWidth / 2 - 1) : -Math.floor(sweepWidth / 2);
      const endJ = sweepWidth % 2 === 0 ? sweepWidth / 2 : Math.floor(sweepWidth / 2);
      for (let i = 1; i <= sweepLength; i++) {
        for (let j = startJ; j <= endJ; j++) {
          let r = row;
          let c = col;
          switch (direction) {
            case "up":
              r = row - i;
              c = col + j;
              break;
            case "down":
              r = row + i;
              c = col + j;
              break;
            case "left":
              r = row + j;
              c = col - i;
              break;
            case "right":
              r = row + j;
              c = col + i;
              break;
          }
          if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
            sweepPositions.push({ row: r, col: c });
          }
        }
      }
      triggerAreaEffects(sweepPositions, attribute2, skillType, "\u6A2A\u626B", direction, attacker.row, attacker.col);
      triggerTrailEffect(sweepPositions, attribute2, "small");
      const enemyTargets = attacker.isPlayer ? battleMap.value.enemies.filter(
        (enemy) => sweepPositions.some((pos) => pos.row === enemy.row && pos.col === enemy.col) && isCellVisibleToActor(attacker, enemy.row, enemy.col)
      ) : battleMap.value.players.filter(
        (playerChar) => sweepPositions.some((pos) => pos.row === playerChar.row && pos.col === playerChar.col) && isCellVisibleToActor(attacker, playerChar.row, playerChar.col)
      );
      const enemyBuildings = battleMap.value.buildings.filter(
        (building) => sweepPositions.some((pos) => pos.row === building.row && pos.col === building.col) && building.isPlayer !== attacker.isPlayer && isCellVisibleToActor(attacker, building.row, building.col)
      );
      const obstaclePositions = sweepPositions.filter(
        (pos) => battleMap.value.tiles[pos.row]?.[pos.col]?.terrain === "obstacle"
      );
      const batchTimestamp = Date.now();
      const batchHitFlashes = [];
      const batchFloatingTexts = [];
      const batchStatusEffects = [];
      const batchDefeats = [];
      const batchDeaths = [];
      const batchShakes = [];
      enemyTargets.forEach((target) => {
        const targetTemplate = findCharacterTemplateInStore(target.characterId);
        const defense = computeDefensePower(target);
        let damage = 0;
        if (skill.damageFormula === "move_based") {
          const movedDistance = attacker.movedDistance || 0;
          const moveBonus = 1 + 0.3 * movedDistance;
          damage = Math.max(1, Math.floor(moveBonus * attackPower2 - defense));
        } else if (skill.damageFormula === "atk_plus_hp_pct" && skill.hpPct) {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 + skill.hpPct * (target.hp || 1) - defense));
        } else {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
        }
        target.hp -= damage;
        if (attacker.totalDamage === void 0)
          attacker.totalDamage = 0;
        attacker.totalDamage += damage;
        totalDamage += damage;
        batchShakes.push({ row: target.row, col: target.col, type: "character" });
        batchHitFlashes.push({
          id: `hitflash_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
          row: target.row,
          col: target.col,
          timestamp: batchTimestamp
        });
        batchFloatingTexts.push({
          id: `float_${batchTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
          row: target.row,
          col: target.col,
          value: damage,
          type: "damage",
          attribute: attribute2,
          isShaking: true,
          sign: "-",
          timestamp: batchTimestamp
        });
        damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
        if (skill.statusEffect) {
          addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0);
          batchStatusEffects.push({
            id: `status_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            statusType: skill.statusEffect,
            isPositive: POSITIVE_STATUSES.includes(skill.statusEffect),
            timestamp: batchTimestamp
          });
          damageResults.push(`\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}\u3011\u72B6\u6001`);
        }
        if (skill.statusEffects) {
          skill.statusEffects.forEach((effect, index) => {
            const duration = skill.statusEffectsDurations?.[index] || 0;
            addStatusToCharacter(target, effect, true, duration);
            batchStatusEffects.push({
              id: `status_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
              row: target.row,
              col: target.col,
              statusType: effect,
              isPositive: POSITIVE_STATUSES.includes(effect),
              timestamp: batchTimestamp
            });
            damageResults.push(`\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[effect]?.name || effect}\u3011\u72B6\u6001`);
          });
        }
        if (skill.clearPositiveStatus) {
          POSITIVE_STATUSES.forEach((status) => {
            if (hasStatus(target, status)) {
              removeStatusFromCharacter(target, status);
              damageResults.push(`\u9A71\u6563${targetTemplate?.name || target.characterId}\u3011\u7684{STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
            }
          });
        }
        if (target.hp <= 0) {
          batchDefeats.push({
            id: `defeat_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            defeatType: "kill",
            timestamp: batchTimestamp
          });
          const deathColor = ATTRIBUTE_CONFIG[attribute2]?.color || "#ffd86b";
          batchDeaths.push({
            id: `death_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: target.row,
            col: target.col,
            color: deathColor,
            attribute: attribute2,
            timestamp: batchTimestamp
          });
          removeCharacterFromBattle(target.id, target.isPlayer);
          defeatedNames.push(targetTemplate?.name || target.characterId);
        }
      });
      enemyBuildings.forEach((building) => {
        let damage = 0;
        if (skill.damageFormula === "move_based") {
          damage = Math.max(1, Math.floor(attackPower2));
        } else if (skill.damageFormula === "atk_plus_hp_pct" && skill.hpPct) {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
        } else {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
        }
        building.hp -= damage;
        if (attacker.totalDamage === void 0)
          attacker.totalDamage = 0;
        attacker.totalDamage += damage;
        totalDamage += damage;
        batchShakes.push({ row: building.row, col: building.col, type: "building" });
        batchFloatingTexts.push({
          id: `float_${batchTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
          row: building.row,
          col: building.col,
          value: damage,
          type: "damage",
          attribute: void 0,
          isShaking: false,
          sign: "-",
          timestamp: batchTimestamp
        });
        damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
        trySpawnZombieFromHeart(building);
        if (building.hp <= 0) {
          removeBuildingFromBattle(building.id);
          batchDefeats.push({
            id: `defeat_${batchTimestamp}_${Math.random().toString(36).substr(2, 6)}`,
            row: building.row,
            col: building.col,
            defeatType: "kill",
            timestamp: batchTimestamp
          });
          battleMap.value.tiles[building.row][building.col].building = null;
          destroyedBuildings.push(building.name);
        }
      });
      obstaclePositions.forEach((pos) => {
        battleMap.value.tiles[pos.row][pos.col].terrain = "empty";
        batchShakes.push({ row: pos.row, col: pos.col, type: "character" });
      });
      if (obstaclePositions.length > 0) {
        damageResults.push(`\u6E05\u9664${obstaclePositions.length}\u4E2A\u969C\u788D\u7269`);
      }
      if (batchHitFlashes.length > 0) {
        hitFlashTargets.value = [...hitFlashTargets.value, ...batchHitFlashes];
      }
      if (batchFloatingTexts.length > 0) {
        floatingTexts.value = [...floatingTexts.value, ...batchFloatingTexts];
      }
      if (batchStatusEffects.length > 0) {
        statusApplyEffects.value = [...statusApplyEffects.value, ...batchStatusEffects];
      }
      if (batchDefeats.length > 0) {
        defeatRecords.value = [...defeatRecords.value, ...batchDefeats];
      }
      if (batchDeaths.length > 0) {
        deathEffects.value = [...deathEffects.value, ...batchDeaths];
        triggerMapShake("light");
      }
      if (batchShakes.length > 0) {
        const seen = /* @__PURE__ */ new Set();
        const uniqueShakes = [];
        for (let i = batchShakes.length - 1; i >= 0; i--) {
          const key2 = `${batchShakes[i].row}_${batchShakes[i].col}_${batchShakes[i].type}`;
          if (!seen.has(key2)) {
            seen.add(key2);
            uniqueShakes.unshift(batchShakes[i]);
          }
        }
        shakingTargets.value = [...shakingTargets.value.filter(
          (t) => !uniqueShakes.some((u) => u.row === t.row && u.col === t.col && u.type === t.type)
        ), ...uniqueShakes];
        uniqueShakes.forEach((s) => {
          setTimeout(() => {
            const idx = shakingTargets.value.findIndex((t) => t.row === s.row && t.col === s.col && t.type === s.type);
            if (idx !== -1)
              shakingTargets.value.splice(idx, 1);
          }, 300);
        });
      }
      ensureEffectCleanupTimer();
      if (skill.lifesteal && totalDamage > 0) {
        const healAmount = Math.floor(totalDamage * skill.lifesteal);
        attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp);
        damageResults.push(`\u6062\u590D${healAmount}\u70B9\u751F\u547D\u503C`);
      }
      if (skill.selfHpCost) {
        const hpBase = skill.selfHpCostType === "current" ? attacker.hp || 1 : attacker.maxHp || 100;
        const hpCost = Math.floor(hpBase * skill.selfHpCost);
        attacker.hp = Math.max(1, attacker.hp - hpCost);
        damageResults.push(`\u6D88\u8017\u4E86${hpCost}\u70B9\u751F\u547D\u503C`);
      }
      if (skill.selfStatusEffects) {
        skill.selfStatusEffects.forEach((effect, index) => {
          const duration = skill.selfStatusEffectsDurations?.[index] || 0;
          addStatusToCharacter(attacker, effect, true, duration);
          damageResults.push(`\u81EA\u8EAB\u83B7\u5F97\u3010${STATUS_CONFIG[effect]?.name || effect}\u3011\u72B6\u6001${duration > 0 ? `\uFF0C\u6301\u7EED${duration}\u79D2` : ""}`);
        });
      }
      if (skill.selfMaxHpBuff) {
        const hpBuff = Math.floor(attackPower2 * skill.selfMaxHpBuff);
        attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff;
        attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += hpBuff;
        damageResults.push(`\u751F\u547D\u503C\u4E0A?${hpBuff}\u5E76\u6062${hpBuff}\u751F\u547D`);
      }
      if (skill.selfHealPct && attacker.maxHp) {
        const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct);
        attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += healAmount;
        damageResults.push(`\u6062\u590D${healAmount}\u70B9\u751F\u547D\u503C`);
        showFloatingText(attacker.row, attacker.col, healAmount, "heal");
      }
      if (skill.selfMpHealPct && attacker.maxMp) {
        const mpHealAmount = Math.floor(attacker.maxMp * skill.selfMpHealPct);
        attacker.mp = Math.min(attacker.mp + mpHealAmount, attacker.maxMp);
        damageResults.push(`\u6062\u590D${mpHealAmount}\u70B9\u6CD5\u529B\u503C`);
        showFloatingText(attacker.row, attacker.col, mpHealAmount, "mp");
      }
      if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
        const negStatuses = NEGATIVE_STATUSES.filter((status) => hasStatus(attacker, status));
        if (negStatuses.length > 0) {
          const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs);
          toDispel.forEach((status) => {
            removeStatusFromCharacter(attacker, status);
            damageResults.push(`\u9A71\u6563${STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
          });
        }
      }
      const totalHits = enemyTargets.length + enemyBuildings.length + obstaclePositions.length;
      if (totalHits > 0) {
        const summary = damageResults.join("\uFF0C");
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\u547D${totalHits} \u4E2A\u76EE\u6807\uFF1A${summary}`);
      } else {
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u8303\u56F4\u5185\u6CA1\u6709\u53EF\u653B\u51FB\u76EE\u6807`);
      }
    }
    function processSummonSkill(attacker, skill, targetIds, charTemplate) {
      const map = battleMap.value;
      if (!map)
        return;
      if (skill.selfHpThreshold !== void 0) {
        const hpRatio = attacker.hp / (attacker.maxHp || 1);
        if (hpRatio < skill.selfHpThreshold) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u3010${skill.name}\u3011\u5931\u8D25\uFF1A\u751F\u547D\u503C\u4E0D\u8DB3\uFF01`);
          return;
        }
      }
      if (skill.requireHpGtAtk) {
        if (attacker.hp <= attacker.attack) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u3010${skill.name}\u3011\u5931\u8D25\uFF1A\u5F53\u524D\u751F\u547D\u503C\u5FC5\u987B\u5927\u4E8E\u653B\u51FB\u529B\uFF01`);
          return;
        }
      }
      const casterHpBeforeCost = attacker.hp;
      if (skill.selfHpCost) {
        const hpBase = skill.selfHpCostType === "current" ? attacker.hp || 1 : attacker.maxHp || 100;
        const hpCost = Math.floor(hpBase * skill.selfHpCost);
        attacker.hp = Math.max(1, attacker.hp - hpCost);
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u6D88\u8017\u4E86${hpCost}\u70B9\u751F\u547D\u503C`);
      }
      if (skill.selfStatusEffects) {
        skill.selfStatusEffects.forEach((effect, index) => {
          const duration = getSelfStatusDuration(skill, index);
          addStatusToCharacter(attacker, effect, true, duration);
          triggerStatusApplyEffect(attacker.row, attacker.col, effect);
          battleLog.value.push(`\u81EA\u8EAB\u83B7\u5F97\u3010${STATUS_CONFIG[effect]?.name || effect}\u3011\u72B6\u6001${duration > 0 ? `\uFF0C\u6301\u7EED${duration}\u79D2` : ""}`);
        });
      }
      const posIds = Array.isArray(targetIds) ? targetIds : [targetIds];
      const summonPositions = [];
      for (const posId of posIds) {
        if (posId && posId.startsWith("pos_")) {
          const parts = posId.split("_");
          if (parts.length === 3) {
            const row = parseInt(parts[1]);
            const col = parseInt(parts[2]);
            if (!isNaN(row) && !isNaN(col)) {
              const hasChar = [...map.players, ...map.enemies].some((x) => x.row === row && x.col === col);
              const hasBuilding = map.buildings.some((b) => b.row === row && b.col === col);
              const tile = map.tiles[row]?.[col];
              if (!hasChar && !hasBuilding && tile && tile.terrain === "empty") {
                summonPositions.push({ row, col });
              }
            }
          }
        }
      }
      let summonTemplates = [];
      if (skill.summonCharacter) {
        const template = HIREABLE_CHARACTERS.find((c) => c.id === skill.summonCharacter);
        if (template) {
          if (skill.summonMaxCount && skill.summonCountId) {
            const currentSide = attacker.isPlayer ? map.players : map.enemies;
            const existingCount = currentSide.filter((c) => c.characterId === skill.summonCountId).length;
            const availableSlots = Math.max(0, skill.summonMaxCount - existingCount);
            if (availableSlots <= 0) {
              battleLog.value.push(`\u3010${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u3010${skill.name}\u3011\u5931\u8D25\uFF1A\u540C\u9635\u8425\u6740\u751F\u6A31\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650${skill.summonMaxCount}\u4E2A\uFF01`);
              return;
            }
            const maxSummonCount = Math.min(summonPositions.length, availableSlots);
            summonTemplates = Array(maxSummonCount).fill(template);
          } else {
            summonTemplates = Array(summonPositions.length).fill(template);
          }
        }
      } else if (skill.summonJob) {
        const jobTemplates = HIREABLE_CHARACTERS.filter((c) => c.job === skill.summonJob);
        if (jobTemplates.length > 0) {
          for (let i = 0; i < summonPositions.length; i++) {
            summonTemplates.push(jobTemplates[Math.floor(Math.random() * jobTemplates.length)]);
          }
        }
      }
      if (summonTemplates.length > 0) {
        const spawnLevel = attacker.level || 1;
        const summonedNames = [];
        for (let i = 0; i < summonPositions.length && i < summonTemplates.length; i++) {
          const pos = summonPositions[i];
          const template = summonTemplates[i];
          const newChar = createBattleCharacter(template, spawnLevel, pos.row, pos.col, attacker.isPlayer, true, true);
          if (newChar.skillCooldowns) {
            for (const skillId of Object.keys(newChar.skillCooldowns)) {
              const sk = SKILL_TEMPLATES[skillId];
              if (sk && sk.category === "summon") {
                delete newChar.skillCooldowns[skillId];
              }
            }
          }
          if (newChar.skills) {
            newChar.skills = newChar.skills.filter((s) => s.category !== "summon");
          }
          if (skill.summonHpPct !== void 0) {
            const summonHp = Math.max(1, Math.floor(casterHpBeforeCost * skill.summonHpPct));
            newChar.maxHp = summonHp;
            newChar.hp = summonHp;
          }
          if (skill.summonMpOverride !== void 0) {
            newChar.maxMp = skill.summonMpOverride;
            newChar.mp = skill.summonMpOverride;
          }
          if (skill.summonStatusEffects) {
            skill.summonStatusEffects.forEach((effect) => {
              addStatusToCharacter(newChar, effect, true);
              triggerStatusApplyEffect(pos.row, pos.col, effect);
            });
          }
          if (attacker.isPlayer) {
            map.players.push(newChar);
          } else {
            map.enemies.push(newChar);
          }
          map.tiles[pos.row][pos.col].character = newChar;
          triggerSummonEffect(pos.row, pos.col, skill.attribute || "light");
          const collectibleAtPos = map.collectibles.find((c) => c.row === pos.row && c.col === pos.col);
          if (collectibleAtPos) {
            useCollectible(collectibleAtPos.id, newChar.id);
          }
          summonedNames.push(template.name);
        }
        if (summonedNames.length > 0) {
          const uniqueNames = [...new Set(summonedNames)];
          const nameStr = uniqueNames.length === 1 ? uniqueNames[0] : `${uniqueNames.slice(0, -1).join("\u3001")}\u548C${uniqueNames[uniqueNames.length - 1]}`;
          battleLog.value.push(`\u3010${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u3010${skill.name}\u3011\uFF0C\u53EC\u5524\u4E86${summonedNames.length}\u4E2A${nameStr}\uFF01`);
        }
      }
    }
    function processAttackSkill(attacker, skill, targetIds, charTemplate, maxTargets = 1) {
      const damageResults = [];
      let totalDamage = 0;
      const skillAttribute = skill.attribute || "normal";
      const skillType = skill.type || "attack";
      const actualTargets = targetIds.slice(0, maxTargets);
      for (const targetId of actualTargets) {
        let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
        let buildingTargets = battleMap.value.buildings.filter((b) => b.id === targetId && b.isPlayer !== attacker.isPlayer);
        const obstacleMatch = targetId.match(/^obstacle_(\d+)_(\d+)$/);
        if (obstacleMatch) {
          const row = parseInt(obstacleMatch[1]);
          const col = parseInt(obstacleMatch[2]);
          if (battleMap.value.tiles[row]?.[col]?.terrain === "obstacle") {
            battleMap.value.tiles[row][col].terrain = "empty";
            triggerShake(row, col, "character");
            triggerSkillEffect(row, col, skillAttribute, "medium", skillType);
            damageResults.push("\u6E05\u9664\u4E86\u4E00\u4E2A\u969C\u788D\u7269");
          }
        } else if (charTargets.length > 0) {
          const target = charTargets[0];
          const targetTemplate = findCharacterTemplateInStore(target.characterId);
          const defense = computeDefensePower(target);
          let damage = 0;
          if (skill.damageFormula === "atk_plus_hp_pct") {
            const hpPct = skill.hpPct || 0;
            damage = Math.max(1, Math.floor(skill.power / 100 * attackPower + target.hp * hpPct - defense));
          } else if (skill.damageFormula === "move_based") {
            const distance = Math.abs(attacker.row - target.row) + Math.abs(attacker.col - target.col);
            const powerWithDistance = skill.power + distance * 20;
            damage = Math.max(1, Math.floor(powerWithDistance / 100 * attackPower - defense));
          } else {
            damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense));
          }
          target.hp -= damage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += damage;
          totalDamage += damage;
          triggerShake(target.row, target.col, "character");
          triggerHitFlash(target.row, target.col, skillAttribute);
          showFloatingText(target.row, target.col, damage, "damage", skillAttribute, true);
          triggerSkillEffect(target.row, target.col, skillAttribute, "medium", skillType, "\u6307\u5B9A", attacker.row, attacker.col);
          const projType = getProjectileTypeForSkill(skill);
          if (projType) {
            triggerProjectile(attacker.row, attacker.col, target.row, target.col, projType, skillAttribute);
          }
          damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
          if (skill.statusEffect) {
            addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0);
            triggerStatusApplyEffect(target.row, target.col, skill.statusEffect);
            damageResults.push(`\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}\u3011\u72B6\u6001`);
          }
          if (skill.statusEffects && skill.statusEffects.length > 0) {
            skill.statusEffects.forEach((status, index) => {
              const duration = skill.statusEffectsDurations?.[index] || 0;
              addStatusToCharacter(target, status, true, duration);
              triggerStatusApplyEffect(target.row, target.col, status);
              damageResults.push(`\u4F7F${targetTemplate?.name || target.characterId}\u3011\u9677\u5165{STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
            });
          }
          if (skill.stealBuff) {
            const targetPositiveStatuses = target.statuses.filter((s) => STATUS_CONFIG[s.type]?.tag === "positive");
            if (targetPositiveStatuses.length > 0) {
              const randomIndex = Math.floor(Math.random() * targetPositiveStatuses.length);
              const stolenStatus = targetPositiveStatuses[randomIndex];
              const statusIdx = target.statuses.findIndex((s) => s.type === stolenStatus.type);
              if (statusIdx !== -1) {
                target.statuses.splice(statusIdx, 1);
                addStatusToCharacter(attacker, stolenStatus.type, true, stolenStatus.duration);
                damageResults.push(`\u5077\u53D6\u4E86${targetTemplate?.name || target.characterId}\u3011\u7684{STATUS_CONFIG[stolenStatus.type]?.name || stolenStatus.type}\u3011\u72B6\u6001`);
              }
            }
          }
          if (target.hp <= 0) {
            triggerDefeatAnimation(target.row, target.col, "kill");
            removeCharacterFromBattle(target.id, target.isPlayer);
            damageResults.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25`);
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding2 = buildingTargets[0];
          let damage = 0;
          if (skill.damageFormula === "atk_plus_hp_pct") {
            damage = Math.max(1, Math.floor(skill.power / 100 * attackPower));
          } else {
            damage = Math.max(1, Math.floor(skill.power / 100 * attackPower));
          }
          targetBuilding2.hp -= damage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += damage;
          totalDamage += damage;
          triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
          showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
          triggerSkillEffect(targetBuilding2.row, targetBuilding2.col, skillAttribute, "medium", skillType);
          damageResults.push(`\u5BF9${targetBuilding2.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
          trySpawnZombieFromHeart(targetBuilding2);
          if (targetBuilding2.hp <= 0) {
            removeBuildingFromBattle(targetBuilding2.id);
            battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
            damageResults.push(`${targetBuilding2.name}\u3011\u88AB\u6467\u6BC1`);
          }
        }
      }
      if (skill.lifesteal && totalDamage > 0) {
        const healAmount = Math.floor(totalDamage * skill.lifesteal);
        attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp);
        damageResults.push(`\u6062\u590D${healAmount}\u70B9\u751F\u547D\u503C`);
      }
      if (actualTargets.length > 0 && damageResults.length > 0) {
        const summary = damageResults.join("\uFF0C");
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${summary}\uFF01`);
      } else if (actualTargets.length > 0) {
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u6CA1\u6709\u547D\u4E2D\u6709\u6548\u76EE\u6807`);
      }
      if (skill.summonZombie) {
        const spawnRange = 2;
        const spawnPositions = [];
        for (let r = -spawnRange; r <= spawnRange; r++) {
          for (let c = -spawnRange; c <= spawnRange; c++) {
            const nr = attacker.row + r;
            const nc = attacker.col + c;
            if (nr >= 0 && nr < battleMap.value.height && nc >= 0 && nc < battleMap.value.width) {
              if (r !== 0 || c !== 0) {
                if (Math.abs(r) + Math.abs(c) <= spawnRange) {
                  const tile = battleMap.value.tiles[nr][nc];
                  const hasCharacter = [...battleMap.value.players, ...battleMap.value.enemies].some((ch) => ch.row === nr && ch.col === nc);
                  const hasBuilding = battleMap.value.buildings.some((b) => b.row === nr && b.col === nc);
                  if (tile.terrain === "empty" && !hasCharacter && !hasBuilding) {
                    spawnPositions.push({ row: nr, col: nc });
                  }
                }
              }
            }
          }
        }
        if (spawnPositions.length > 0) {
          const spawnPos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)];
          const zombieTemplate = HIREABLE_CHARACTERS.find((c) => c.id === "ordinary_zombie");
          if (zombieTemplate) {
            const spawnLevel = attacker.level || 1;
            const newZombie = createBattleCharacter(zombieTemplate, spawnLevel, spawnPos.row, spawnPos.col, attacker.isPlayer, true, true);
            if (attacker.isPlayer) {
              battleMap.value.players.push(newZombie);
            } else {
              battleMap.value.enemies.push(newZombie);
            }
            battleMap.value.tiles[spawnPos.row][spawnPos.col].character = newZombie;
            const collectibleAtZombiePos = battleMap.value.collectibles.find((c) => c.row === spawnPos.row && c.col === spawnPos.col);
            if (collectibleAtZombiePos) {
              useCollectible(collectibleAtZombiePos.id, newZombie.id);
            }
            battleLog.value.push(`\u3010${charTemplate?.name || attacker.characterId}\u3011\u53EC\u5524\u4E86\u4E00\u53EA\u666E\u901A\u4E27\u5C38\uFF01`);
          }
        }
      }
      if (skill.selfDefeat) {
        triggerDefeatAnimation(attacker.row, attacker.col, "self");
        triggerDeathEffect(attacker.row, attacker.col, attribute);
        attacker.hp = 0;
        removeCharacterFromBattle(attacker.id, attacker.isPlayer);
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u540E\u6218\u8D25\u9000\u573A\uFF01`);
      }
      if (skill.selfHpCost && attacker.maxHp) {
        const hpBase = skill.selfHpCostType === "current" ? attacker.hp || 1 : attacker.maxHp || 100;
        const hpCost = Math.floor(hpBase * skill.selfHpCost);
        attacker.hp = Math.max(1, attacker.hp - hpCost);
        damageResults.push(`\u6D88\u8017\u4E86${hpCost}\u70B9\u751F\u547D\u503C`);
      }
      if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
        skill.selfStatusEffects.forEach((status, index) => {
          const duration = getSelfStatusDuration(skill, index);
          addStatusToCharacter(attacker, status, true, duration);
          triggerStatusApplyEffect(attacker.row, attacker.col, status);
          damageResults.push(`\u81EA\u8EAB\u83B7\u5F97\u3010${STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001${duration > 0 ? `\uFF0C\u6301\u7EED${duration}\u79D2` : ""}`);
        });
        const summary = damageResults.join("\uFF0C");
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${summary}\uFF01`);
      }
      if (skill.clearPositiveStatus && actualTargets.length > 0 && battleMap.value) {
        const map = battleMap.value;
        actualTargets.forEach((tid) => {
          const allChars = [...map.players, ...map.enemies];
          const targetChar = allChars.find((c) => c.id === tid);
          if (targetChar) {
            const dispelled = [];
            POSITIVE_STATUSES.forEach((status) => {
              if (hasStatus(targetChar, status)) {
                removeStatusFromCharacter(targetChar, status);
                dispelled.push(STATUS_CONFIG[status]?.name || status);
              }
            });
            if (dispelled.length > 0) {
              battleLog.value.push(`\u9A71\u6563\u4E86${targetChar.characterId}\u3011\u7684{dispelled.join('\uFF0C')}\u3011\u72B6\u6001`);
            }
          }
        });
      }
      if (skill.createSnowTerrain && actualTargets.length > 0 && battleMap.value) {
        const map = battleMap.value;
        actualTargets.forEach((tid) => {
          const allChars = [...map.players, ...map.enemies];
          const targetChar = allChars.find((c) => c.id === tid);
          if (targetChar) {
            map.tiles[targetChar.row][targetChar.col].terrain = "snow";
            damageResults.push(`\u5728${targetChar.characterId}\u3011\u811A\u4E0B\u4EA7\u751F\u4E86\u96EA\u5730`);
          }
        });
      }
      if (skill.selfMaxHpBuff && attacker.maxHp) {
        const hpBuff = Math.floor(computeAttackPower(attacker) * skill.selfMaxHpBuff);
        attacker.maxHp += hpBuff;
        attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += hpBuff;
        damageResults.push(`\u751F\u547D\u503C\u4E0A?${hpBuff}\u5E76\u6062${hpBuff}\u751F\u547D`);
      }
      if (skill.selfHealPct && attacker.maxHp) {
        const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct);
        attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += healAmount;
        damageResults.push(`\u6062\u590D${healAmount}\u70B9\u751F\u547D\u503C`);
        showFloatingText(attacker.row, attacker.col, healAmount, "heal");
      }
      if (skill.selfMpHealPct && attacker.maxMp) {
        const mpHealAmount = Math.floor(attacker.maxMp * skill.selfMpHealPct);
        attacker.mp = Math.min(attacker.mp + mpHealAmount, attacker.maxMp);
        damageResults.push(`\u6062\u590D${mpHealAmount}\u70B9\u6CD5\u529B\u503C`);
        showFloatingText(attacker.row, attacker.col, mpHealAmount, "mp");
      }
      if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
        const negStatuses = NEGATIVE_STATUSES.filter((status) => hasStatus(attacker, status));
        if (negStatuses.length > 0) {
          const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs);
          toDispel.forEach((status) => {
            removeStatusFromCharacter(attacker, status);
            damageResults.push(`\u9A71\u6563${STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
          });
        }
      }
    }
    function processXianZhenSkill(attacker, skill, targetId, charTemplate) {
      if (!battleMap.value)
        return false;
      let centerRow = attacker.row;
      let centerCol = attacker.col;
      const skillRange = skill.range || 4;
      const areaRange = skill.areaRange || 1;
      const rangeType = skill.rangeType || "diamond";
      const skillAttr = skill.attribute || "normal";
      const skillType = skill.type;
      const attackerName = charTemplate?.name || attacker.characterId;
      if (targetId && targetId.startsWith("pos_")) {
        const [, rowStr, colStr] = targetId.split("_");
        centerRow = parseInt(rowStr);
        centerCol = parseInt(colStr);
      } else {
        battleLog.value.push(`${attackerName}\u3011\u7684{skill.name}\u3011\u9700\u8981\u9009\u62E9\u4E00\u4E2A\u76EE\u6807\u683C\u5B50\uFF01`);
        attacker.mp += skill.mpCost;
        return false;
      }
      const targetTile = battleMap.value.tiles[centerRow]?.[centerCol];
      if (!targetTile || targetTile.terrain !== "empty") {
        battleLog.value.push(`${attackerName}\u3011\u7684{skill.name}\u3011\u9700\u8981\u9009\u62E9\u4E00\u4E2A\u7A7A\u683C\u5B50\uFF01`);
        attacker.mp += skill.mpCost;
        return false;
      }
      const occupiedByPlayer = battleMap.value.players.some((p) => p.row === centerRow && p.col === centerCol);
      const occupiedByEnemy = battleMap.value.enemies.some((e) => e.row === centerRow && e.col === centerCol);
      const occupiedByBuilding = battleMap.value.buildings.some((b) => b.row === centerRow && b.col === centerCol);
      if (occupiedByPlayer || occupiedByEnemy || occupiedByBuilding) {
        battleLog.value.push(`${attackerName}\u3011\u7684{skill.name}\u3011\u9700\u8981\u9009\u62E9\u4E00\u4E2A\u6CA1\u6709\u5176\u4ED6\u5355\u4F4D\u7684\u7A7A\u683C\u5B50\uFF01`);
        attacker.mp += skill.mpCost;
        return false;
      }
      setTimeout(() => {
        if (!battleMap.value)
          return;
        triggerSkillEffect(attacker.row, attacker.col, skillAttr, "medium", skillType, "\u9677\u9635");
        attacker.row = centerRow;
        attacker.col = centerCol;
        triggerSkillEffect(centerRow, centerCol, skillAttr, "large", skillType, "\u9677\u9635");
        battleLog.value.push(`${attackerName}\u3011\u4F7F\u7528\u3010${skill.name}\u3011\u77AC\u79FB\u81F3(${centerRow},${centerCol})\uFF01`);
      }, 300);
      attacker.hasActed = true;
      if (attacker.isPlayer) {
        const attackerChar = player.value.characters.find((c) => c.id === attacker.characterId);
        if (attackerChar) {
          const playerSkill = attackerChar.skills.find((s) => s.id === skill.id);
          if (playerSkill)
            playerSkill.currentCooldown = skill.frequency || 1;
        }
      } else {
        if (!attacker.skillCooldowns)
          attacker.skillCooldowns = {};
        attacker.skillCooldowns[skill.id] = skill.frequency || 1;
      }
      triggerStatusOnAction(attacker);
      return true;
    }
    const floatingTexts = (0, import_vue.ref)([]);
    function showFloatingText(row, col, value, type, attribute2, isShaking, sign) {
      const textId = `float_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const shouldShake = type === "damage" ? isShaking !== false : false;
      const finalSign = sign || (type === "damage" ? "-" : "+");
      floatingTexts.value.push({
        id: textId,
        row,
        col,
        value,
        type,
        attribute: attribute2,
        isShaking: shouldShake,
        sign: finalSign,
        timestamp: Date.now()
      });
      ensureEffectCleanupTimer();
    }
    const hitFlashTargets = (0, import_vue.ref)([]);
    function triggerHitFlash(row, col, attribute2 = "normal", skipSpark = false) {
      const id = `hitflash_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      hitFlashTargets.value.push({ id, row, col, timestamp: Date.now() });
      if (!skipSpark) {
        triggerHitSpark(row, col, attribute2);
      }
      ensureEffectCleanupTimer();
    }
    const defeatRecords = (0, import_vue.ref)([]);
    function triggerDefeatAnimation(row, col, defeatType) {
      const id = `defeat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      defeatRecords.value.push({ id, row, col, defeatType, timestamp: Date.now() });
      ensureEffectCleanupTimer();
    }
    function triggerTrailEffect(positions, attribute2, size = "medium") {
      const color = ATTRIBUTE_CONFIG[attribute2]?.color || "#fff";
      const timestamp = Date.now();
      const newParticles = positions.map((pos, i) => ({
        id: `trail_${timestamp}_${i}_${Math.random().toString(36).substr(2, 5)}`,
        row: pos.row,
        col: pos.col,
        color,
        timestamp: timestamp + i * 60,
        attribute: attribute2,
        size
      }));
      trailParticles.value.push(...newParticles);
      cleanupExpiredEffects();
      ensureEffectCleanupTimer();
    }
    function triggerChargeEffect(row, col, attribute2) {
      const color = ATTRIBUTE_CONFIG[attribute2]?.color || "#fff";
      const id = `charge_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      chargeEffects.value.push({
        id,
        row,
        col,
        color,
        timestamp: Date.now(),
        attribute: attribute2
      });
      ensureEffectCleanupTimer();
    }
    function clearChargeEffects() {
      chargeEffects.value = [];
    }
    function triggerTerrainMark(row, col, type, durationMs = 6e3) {
      if (!battleMap.value)
        return;
      const existing = terrainMarks.value.findIndex((m) => m.row === row && m.col === col && m.type === type);
      if (existing !== -1) {
        const old = terrainMarks.value[existing];
        const idx = terrainMarks.value.findIndex((m) => m.id === old.id);
        if (idx !== -1)
          terrainMarks.value.splice(idx, 1);
      }
      const id = `mark_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      terrainMarks.value.push({ id, row, col, type, timestamp: Date.now() });
      setTimeout(() => {
        const idx = terrainMarks.value.findIndex((m) => m.id === id);
        if (idx !== -1)
          terrainMarks.value.splice(idx, 1);
      }, durationMs);
    }
    function triggerDeathEffect(row, col, attribute2 = "normal") {
      const color = ATTRIBUTE_CONFIG[attribute2]?.color || "#ffd86b";
      const id = `death_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      deathEffects.value.push({ id, row, col, color, attribute: attribute2, timestamp: Date.now() });
      ensureEffectCleanupTimer();
    }
    function applyTerrainMarkByAttribute(row, col, attribute2) {
      if (attribute2 === "fire") {
        triggerTerrainMark(row, col, "scorch");
      } else if (attribute2 === "ice") {
        triggerTerrainMark(row, col, "frost");
      } else if (attribute2 === "yin" || attribute2 === "dark") {
        triggerTerrainMark(row, col, "poison");
      }
    }
    function handleTargetDefeated(row, col, attribute2, defeatType) {
      triggerDefeatAnimation(row, col, defeatType);
      triggerDeathEffect(row, col, attribute2);
      if (defeatType === "kill")
        triggerMapShake("heavy");
    }
    const projectiles = (0, import_vue.ref)([]);
    function triggerProjectile(fromRow, fromCol, toRow, toCol, type, attribute2 = "normal") {
      const color = ATTRIBUTE_CONFIG[attribute2]?.color || "#eaeaea";
      const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      projectiles.value.push({
        id,
        fromRow,
        fromCol,
        toRow,
        toCol,
        type,
        color,
        duration: Math.max(200, Math.abs(toRow - fromRow) * 80 + Math.abs(toCol - fromCol) * 80),
        timestamp: Date.now()
      });
      ensureEffectCleanupTimer();
    }
    const statusApplyEffects = (0, import_vue.ref)([]);
    function triggerStatusApplyEffect(row, col, statusType) {
      const isPositive = POSITIVE_STATUSES.includes(statusType);
      const id = `status_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      statusApplyEffects.value.push({ id, row, col, statusType, isPositive, timestamp: Date.now() });
      ensureEffectCleanupTimer();
    }
    const summonEffects = (0, import_vue.ref)([]);
    function triggerSummonEffect(row, col, attribute2 = "light") {
      const id = `summon_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      summonEffects.value.push({ id, row, col, attribute: attribute2, timestamp: Date.now() });
      ensureEffectCleanupTimer();
    }
    const moveTrailEffects = (0, import_vue.ref)([]);
    function triggerMoveTrail(fromRow, fromCol, toRow, toCol, isPlayer) {
      const distance = Math.abs(toRow - fromRow) + Math.abs(toCol - fromCol);
      if (distance === 0)
        return;
      const particleCount = Math.min(distance * 2, 8);
      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        const t = i / (particleCount - 1);
        const row = fromRow + (toRow - fromRow) * t;
        const col = fromCol + (toCol - fromCol) * t;
        particles.push({
          row,
          col,
          delay: i / (particleCount - 1) * 0.15
        });
      }
      const id = `movetrail_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      moveTrailEffects.value.push({ id, particles, isPlayer, timestamp: Date.now() });
      ensureEffectCleanupTimer();
    }
    const hitSparkEffects = (0, import_vue.ref)([]);
    function triggerHitSpark(row, col, attribute2 = "normal") {
      const load = effectLoadLevel();
      const particleCount = load === 2 ? 3 : load === 1 ? 4 : 8;
      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = i / particleCount * Math.PI * 2 + Math.random() * 0.5;
        const distance = 15 + Math.random() * 20;
        particles.push({
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          size: 4 + Math.random() * 6,
          delay: Math.random() * 0.1
        });
      }
      const id = `hitspark_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      hitSparkEffects.value.push({ id, row, col, attribute: attribute2, particles, timestamp: Date.now() });
      ensureEffectCleanupTimer();
    }
    function getProjectileTypeForSkill(skill) {
      if (!skill)
        return null;
      if (skill.category !== "\u6307\u5B9A" && skill.category !== "aoe")
        return null;
      if (skill.type !== "attack")
        return null;
      const attr = skill.attribute || "normal";
      const effectType = skill.effectType;
      if (effectType === "fire" || attr === "fire")
        return "fireball";
      if (effectType === "ice" || attr === "ice" || attr === "water")
        return "ice-spike";
      if (effectType === "thunder")
        return "metal-blade";
      if (effectType === "wind" || attr === "wind")
        return "arrow";
      if (effectType === "shadow" || attr === "dark")
        return "dark-bolt";
      if (attr === "metal")
        return "metal-blade";
      if (attr === "wood")
        return "arrow";
      if (attr === "earth")
        return "fist";
      return "arrow";
    }
    function findBestBombingCenter(attacker, skill) {
      if (!battleMap.value)
        return null;
      const range = skill.range || 4;
      const areaRange = skill.areaRange || 1;
      const enemies = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
      const buildings = battleMap.value.buildings;
      let maxAreaDamage = 0;
      let bestCenterPos = null;
      for (let dr = -range; dr <= range; dr++) {
        for (let dc = -range; dc <= range; dc++) {
          const dist = Math.abs(dr) + Math.abs(dc);
          if (dist > 0 && dist <= range) {
            const centerRow = attacker.row + dr;
            const centerCol = attacker.col + dc;
            if (centerRow >= 0 && centerRow < battleMap.value.height && centerCol >= 0 && centerCol < battleMap.value.width) {
              let areaDamage = 0;
              for (const enemy of enemies) {
                const enemyDist = Math.abs(enemy.row - centerRow) + Math.abs(enemy.col - centerCol);
                if (enemyDist <= areaRange) {
                  const defense = computeDefensePower(enemy);
                  const attackPower2 = computeAttackPower(attacker);
                  const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
                  areaDamage += damage;
                }
              }
              for (const building of buildings) {
                const buildingDist = Math.abs(building.row - centerRow) + Math.abs(building.col - centerCol);
                if (buildingDist <= areaRange && building.isPlayer !== attacker.isPlayer) {
                  const attackPower2 = computeAttackPower(attacker);
                  const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
                  areaDamage += damage;
                }
              }
              if (areaDamage > maxAreaDamage) {
                maxAreaDamage = areaDamage;
                bestCenterPos = { row: centerRow, col: centerCol };
              }
            }
          }
        }
      }
      return bestCenterPos;
    }
    function getProjectileTypeForNormalAttack(attribute2) {
      if (attribute2 === "fire")
        return "fireball";
      if (attribute2 === "ice" || attribute2 === "water")
        return "ice-spike";
      if (attribute2 === "dark")
        return "dark-bolt";
      if (attribute2 === "metal")
        return "metal-blade";
      return "fist";
    }
    const factionCommand = (0, import_vue.ref)("attack");
    const gatheringPoints = (0, import_vue.ref)([]);
    const isSelectingGatherPoints = (0, import_vue.ref)(false);
    function setFactionCommand(command) {
      factionCommand.value = command;
      if (command === "gather") {
        isSelectingGatherPoints.value = true;
        gatheringPoints.value = [];
        battleLog.value.push("\u8BF7\u9009\u62E91-4\u4E2A\u683C\u5B50\u4F5C\u4E3A\u96C6\u7ED3\u70B9");
      } else {
        isSelectingGatherPoints.value = false;
        battleLog.value.push("\u5168\u519B\u51FA\u51FB\u6307\u4EE4\u5DF2\u4E0B\u8FBE\uFF01");
      }
    }
    function toggleGatherPointSelection(active) {
      isSelectingGatherPoints.value = active;
    }
    function addGatheringPoint(row, col) {
      if (gatheringPoints.value.length >= 4) {
        battleLog.value.push("\u6700\u591A\u53EA\u80FD\u9009\u62E94\u4E2A\u96C6\u7ED3\u70B9");
        return false;
      }
      if (gatheringPoints.value.some((p) => p.row === row && p.col === col)) {
        battleLog.value.push("\u8BE5\u4F4D\u7F6E\u5DF2\u88AB\u9009\u4E2D");
        return false;
      }
      gatheringPoints.value.push({ row, col });
      battleLog.value.push(`\u96C6\u7ED3(${row}, ${col}) \u5DF2\u6DFB(${gatheringPoints.value.length}/4)`);
      return true;
    }
    function removeGatheringPoint(row, col) {
      gatheringPoints.value = gatheringPoints.value.filter((p) => !(p.row === row && p.col === col));
    }
    function confirmGatheringPoints() {
      if (gatheringPoints.value.length === 0) {
        battleLog.value.push("\u8BF7\u81F3\u5C11\u9009\u62E91\u4E2A\u96C6\u7ED3\u70B9");
        return false;
      }
      isSelectingGatherPoints.value = false;
      battleLog.value.push("\u5168\u519B\u96C6\u7ED3\u6307\u4EE4\u5DF2\u4E0B\u8FBE\uFF0C\u5C06\u5411\u6307\u5B9A\u4F4D\u7F6E\u96C6\u7ED3");
      return true;
    }
    const aliveCharacters = (0, import_vue.computed)(() => {
      if (!player.value)
        return [];
      return player.value.characters.filter((c) => c.hp > 0);
    });
    const totalAttack = (0, import_vue.computed)(() => currentCharacter.value?.attack || 0);
    const totalDefense = (0, import_vue.computed)(() => currentCharacter.value?.defense || 0);
    const totalMaxHp = (0, import_vue.computed)(() => currentCharacter.value?.maxHp || 0);
    const totalMaxMp = (0, import_vue.computed)(() => currentCharacter.value?.maxMp || 0);
    const totalMoveRange = (0, import_vue.computed)(() => currentCharacter.value?.moveSpeed || 0);
    const totalAttackRange = (0, import_vue.computed)(() => currentCharacter.value?.attackRange || 0);
    async function initGame() {
      const characters = INITIAL_CHARACTERS.map(createCharacterFromTemplate);
      const inventory = [
        { ...EQUIPMENT_TEMPLATES.weapons[0], id: "eq_1", count: 1, rarity: getRandomRarity() },
        { ...EQUIPMENT_TEMPLATES.armors[0], id: "eq_2", count: 1, rarity: getRandomRarity() },
        { ...CHEST_CONFIG.wanwu, id: "chest_1", count: 1, subtype: "chest", type: "consumable" },
        { ...CONSUMABLE_TEMPLATES[0], id: "cons_1", count: 5 },
        { ...CONSUMABLE_TEMPLATES[1], id: "cons_2", count: 3 },
        { ...createSoulItem("universal"), id: "soul_universal_init", count: 3 }
      ];
      player.value = {
        id: "player_1",
        name: "\u73A9\u5BB6",
        gold: 6e3,
        day: 1,
        phase: "day",
        characters,
        inventory,
        homeGrid: createInitialHomeGrid(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await saveGame();
    }
    async function loadGame(tryExternal = true) {
      let saveData = uni.getStorageSync("sangshi_save");
      if (tryExternal && uni.getSystemInfoSync().platform === "android") {
        try {
          const result = await loadGameFromExternalStorage("sangshi_save");
          if (result.success && result.content) {
            saveData = result.content;
            console.log("\u4ECE\u5916\u90E8\u5B58\u50A8\u6062\u590D\u5B58\u6863");
          }
        } catch (e) {
          console.error("\u4ECE\u5916\u90E8\u5B58\u50A8\u6062\u590D\u5B58\u6863\u5931", e);
          return { success: false, error: "\u5916\u90E8\u5B58\u50A8\u8BFB\u53D6\u5931\u8D25: " + e.message?.substring(0, 100) };
        }
      }
      if (saveData) {
        try {
          const parsed = typeof saveData === "string" ? JSON.parse(saveData) : saveData;
          console.log("\u52A0\u8F7D\u5B58\u6863:", parsed);
          if (!parsed.player) {
            console.error("\u5B58\u6863\u4E2D\u6CA1player \u6570\u636E");
            return { success: false, error: "\u5B58\u6863\u7F3A\u5C11 player \u6570\u636E" };
          }
          if (!parsed.player.characters) {
            parsed.player.characters = [];
          }
          if (parsed.player.homeGrid) {
            if (Array.isArray(parsed.player.homeGrid[0])) {
              parsed.player.characters = parsed.player.characters.map((char2) => {
                const tpl = INITIAL_CHARACTERS.find((c) => c.id === char2.id) || HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                if (!char2.baseMaxHp)
                  char2.baseMaxHp = char2.maxHp;
                if (!char2.baseMaxMp)
                  char2.baseMaxMp = char2.maxMp;
                if (!char2.baseAttack)
                  char2.baseAttack = char2.attack;
                if (!char2.baseDefense)
                  char2.baseDefense = char2.defense;
                if (!char2.moveSpeed && tpl)
                  char2.moveSpeed = tpl.moveSpeed;
                if (!char2.baseMoveSpeed)
                  char2.baseMoveSpeed = char2.moveSpeed || tpl?.baseMoveSpeed;
                if (!char2.attackRange && tpl)
                  char2.attackRange = tpl.attackRange;
                if (!char2.baseAttackRange)
                  char2.baseAttackRange = char2.attackRange || tpl?.baseAttackRange;
                if (!char2.attackSpeed && tpl)
                  char2.attackSpeed = tpl.attackSpeed;
                if (!char2.baseAttackSpeed)
                  char2.baseAttackSpeed = char2.attackSpeed || tpl?.baseAttackSpeed;
                char2.hp = char2.maxHp;
                char2.mp = char2.maxMp;
                if (!char2.avatar)
                  char2.avatar = getAvatarPath(char2.id, char2.faction);
                char2.isPlayerOwned = true;
                if (!char2.faction || !char2.job) {
                  const initialChar = INITIAL_CHARACTERS.find((c) => c.id === char2.id);
                  const hireableChar = HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                  const templateChar = initialChar || hireableChar;
                  if (templateChar) {
                    char2.faction = templateChar.faction;
                    char2.job = templateChar.job;
                  }
                }
                if (char2.skills) {
                  char2.skills = char2.skills.map((skill) => {
                    const { icon, ...cleanSkill } = skill;
                    return cleanSkill;
                  });
                }
                return char2;
              });
            } else {
              const fullHomeGrid = createInitialHomeGrid();
              parsed.player.homeGrid.forEach((cell) => {
                if (cell.row >= 0 && cell.row < 9 && cell.col >= 0 && cell.col < 9) {
                  fullHomeGrid[cell.row][cell.col].building = cell.building;
                }
              });
              parsed.player.homeGrid = fullHomeGrid;
              parsed.player.characters = parsed.player.characters.map((char2) => {
                const tpl = INITIAL_CHARACTERS.find((c) => c.id === char2.id) || HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                if (!char2.baseMaxHp)
                  char2.baseMaxHp = char2.maxHp;
                if (!char2.baseMaxMp)
                  char2.baseMaxMp = char2.maxMp;
                if (!char2.baseAttack)
                  char2.baseAttack = char2.attack;
                if (!char2.baseDefense)
                  char2.baseDefense = char2.defense;
                if (!char2.moveSpeed && tpl)
                  char2.moveSpeed = tpl.moveSpeed;
                if (!char2.baseMoveSpeed)
                  char2.baseMoveSpeed = char2.moveSpeed || tpl?.baseMoveSpeed;
                if (!char2.attackRange && tpl)
                  char2.attackRange = tpl.attackRange;
                if (!char2.baseAttackRange)
                  char2.baseAttackRange = char2.attackRange || tpl?.baseAttackRange;
                if (!char2.attackSpeed && tpl)
                  char2.attackSpeed = tpl.attackSpeed;
                if (!char2.baseAttackSpeed)
                  char2.baseAttackSpeed = char2.attackSpeed || tpl?.baseAttackSpeed;
                if (char2.maxLevel === void 0 || char2.maxLevel === null)
                  char2.maxLevel = 5;
                char2.hp = char2.maxHp;
                char2.mp = char2.maxMp;
                if (!char2.avatar)
                  char2.avatar = getAvatarPath(char2.id, char2.faction);
                char2.isPlayerOwned = true;
                if (!char2.attribute) {
                  const initialChar = INITIAL_CHARACTERS.find((c) => c.id === char2.id);
                  const hireableChar = HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                  const templateChar = initialChar || hireableChar;
                  char2.attribute = templateChar?.attribute || "normal";
                }
                if (!char2.faction || !char2.job) {
                  const initialChar = INITIAL_CHARACTERS.find((c) => c.id === char2.id);
                  const hireableChar = HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                  const templateChar = initialChar || hireableChar;
                  if (templateChar) {
                    char2.faction = templateChar.faction;
                    char2.job = templateChar.job;
                  }
                }
                char2.skills = buildFullSkillsForCharacter(char2.id, char2.equipment);
                return char2;
              });
            }
          } else {
            parsed.player.homeGrid = createInitialHomeGrid();
            parsed.player.characters = parsed.player.characters.map((char2) => {
              if (!char2.attribute) {
                const initialChar = INITIAL_CHARACTERS.find((c) => c.id === char2.id);
                const hireableChar = HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                const templateChar = initialChar || hireableChar;
                char2.attribute = templateChar?.attribute || "normal";
              }
              char2.skills = buildFullSkillsForCharacter(char2.id, char2.equipment);
              return char2;
            });
          }
          return { success: true };
        } catch (e) {
          console.error("\u52A0\u8F7D\u5B58\u6863\u5931\u8D25:", e);
          return { success: false, error: e.message?.substring(0, 100) || "\u52A0\u8F7D\u5B58\u6863\u65F6\u53D1\u751F\u672A\u77E5\u9519\u8BEF" };
        }
      }
      return { success: false, error: "\u672A\u627E\u5230\u5B58\u6863\u6570\u636E" };
    }
    async function saveGame() {
      if (player.value) {
        player.value.characters.forEach((char2) => {
          char2.skills.forEach((skill) => {
            skill.frequency = 0;
          });
        });
        player.value.updatedAt = Date.now();
        const simplifiedPlayer = JSON.parse(JSON.stringify(player.value));
        simplifiedPlayer.homeGrid = simplifiedPlayer.homeGrid.flatMap(
          (row, rowIndex) => row.filter((cell) => cell.building !== null).map((cell) => ({ row: cell.row, col: cell.col, building: cell.building }))
        );
        simplifiedPlayer.characters.forEach((char2) => {
          char2.hp = char2.maxHp;
          char2.mp = char2.maxMp;
          delete char2.avatar;
          delete char2.isPlayerOwned;
          delete char2.skills;
        });
        const saveData = {
          version: "3.0",
          savedAt: Date.now(),
          player: simplifiedPlayer
        };
        uni.setStorageSync("sangshi_save", JSON.stringify(saveData));
        if (uni.getSystemInfoSync().platform === "android") {
          try {
            const result = await saveGameToExternalStorage("sangshi_save", saveData);
            console.log("\u5916\u90E8\u5B58\u50A8\u5907\u4EFD:", result);
          } catch (e) {
            console.error("\u5916\u90E8\u5B58\u50A8\u5907\u4EFD\u5931\u8D25:", e);
          }
        }
      }
    }
    function hasSaveData() {
      return !!uni.getStorageSync("sangshi_save");
    }
    async function getSaveSlots() {
      const slots = [];
      for (let i = 1; i <= 3; i++) {
        const key2 = `sangshi_save_${i}`;
        let saveData = uni.getStorageSync(key2);
        if (!saveData && uni.getSystemInfoSync().platform === "android") {
          try {
            const result = await loadGameFromExternalStorage(key2);
            if (result.success && result.content) {
              saveData = result.content;
              console.log("\u4ECE\u5916\u90E8\u5B58\u50A8\u8BFB\u53D6\u5B58\u6863\u69FD:", i);
            }
          } catch (e) {
            console.error("\u4ECE\u5916\u90E8\u5B58\u50A8\u8BFB\u53D6\u5B58\u6863\u69FD\u5931\u8D25:", e);
          }
        }
        if (saveData) {
          try {
            const parsed = JSON.parse(saveData);
            slots.push({
              id: i,
              name: parsed.name || `\u5B58\u6863 ${i}`,
              savedAt: parsed.savedAt,
              version: parsed.version || "1.0",
              player: parsed.player
            });
          } catch (e) {
            console.error(`\u8BFB\u53D6\u5B58\u6863 ${i} \u5931\u8D25:`, e);
            slots.push({ id: i, name: "", savedAt: 0, version: "1.0", player: null });
          }
        } else {
          slots.push({ id: i, name: "", savedAt: 0, version: "1.0", player: null });
        }
      }
      return slots;
    }
    async function saveToSlot(slotId, name) {
      if (!player.value || slotId < 1 || slotId > 3)
        return false;
      player.value.characters.forEach((char2) => {
        char2.skills.forEach((skill) => {
          skill.frequency = 0;
        });
      });
      player.value.updatedAt = Date.now();
      const simplifiedPlayer = JSON.parse(JSON.stringify(player.value));
      simplifiedPlayer.homeGrid = simplifiedPlayer.homeGrid.flatMap(
        (row, rowIndex) => row.filter((cell) => cell.building !== null).map((cell) => ({ row: cell.row, col: cell.col, building: cell.building }))
      );
      simplifiedPlayer.characters.forEach((char2) => {
        char2.hp = char2.maxHp;
        char2.mp = char2.maxMp;
        delete char2.avatar;
        delete char2.isPlayerOwned;
        delete char2.skills;
      });
      const saveData = {
        name: name || `\u5B58\u6863 ${slotId}`,
        version: "3.0",
        savedAt: Date.now(),
        player: simplifiedPlayer
      };
      uni.setStorageSync(`sangshi_save_${slotId}`, JSON.stringify(saveData));
      if (uni.getSystemInfoSync().platform === "android") {
        try {
          await saveGameToExternalStorage(`sangshi_save_${slotId}`, saveData);
        } catch (e) {
          console.error("\u5916\u90E8\u5B58\u50A8\u5907\u4EFD\u5B58\u6863\u69FD\u5931", e);
        }
      }
      return true;
    }
    async function loadFromSlot(slotId) {
      if (slotId < 1 || slotId > 3)
        return { success: false, error: "\u65E0\u6548\u7684\u5B58\u6863\u69FD\u4F4D" };
      let saveData = uni.getStorageSync(`sangshi_save_${slotId}`);
      if (uni.getSystemInfoSync().platform === "android") {
        try {
          const result = await loadGameFromExternalStorage(`sangshi_save_${slotId}`);
          if (result.success && result.content) {
            saveData = result.content;
            console.log("\u4ECE\u5916\u90E8\u5B58\u50A8\u6062\u590D\u5B58\u6863\u69FD:", slotId);
          }
        } catch (e) {
          console.error("\u4ECE\u5916\u90E8\u5B58\u50A8\u6062\u590D\u5B58\u6863\u69FD\u5931\u8D25\uFF0C\u5C1D\u8BD5\u672C\u5730\u5B58", e);
        }
      }
      if (saveData) {
        try {
          const parsed = typeof saveData === "string" ? JSON.parse(saveData) : saveData;
          console.log("\u52A0\u8F7D\u5B58\u6863:", parsed);
          if (!parsed.player) {
            console.error("\u5B58\u6863\u4E2D\u6CA1player \u6570\u636E");
            return { success: false, error: "\u5B58\u6863\u7F3A\u5C11 player \u6570\u636E" };
          }
          if (!parsed.player.characters) {
            parsed.player.characters = [];
          }
          if (parsed.player.homeGrid) {
            if (Array.isArray(parsed.player.homeGrid[0])) {
              parsed.player.characters = parsed.player.characters.map((char2) => {
                const tpl = INITIAL_CHARACTERS.find((c) => c.id === char2.id) || HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                if (!char2.baseMaxHp)
                  char2.baseMaxHp = char2.maxHp;
                if (!char2.baseMaxMp)
                  char2.baseMaxMp = char2.maxMp;
                if (!char2.baseAttack)
                  char2.baseAttack = char2.attack;
                if (!char2.baseDefense)
                  char2.baseDefense = char2.defense;
                if (!char2.moveSpeed && tpl)
                  char2.moveSpeed = tpl.moveSpeed;
                if (!char2.baseMoveSpeed)
                  char2.baseMoveSpeed = char2.moveSpeed || tpl?.baseMoveSpeed;
                if (!char2.attackRange && tpl)
                  char2.attackRange = tpl.attackRange;
                if (!char2.baseAttackRange)
                  char2.baseAttackRange = char2.attackRange || tpl?.baseAttackRange;
                if (!char2.attackSpeed && tpl)
                  char2.attackSpeed = tpl.attackSpeed;
                if (!char2.baseAttackSpeed)
                  char2.baseAttackSpeed = char2.attackSpeed || tpl?.baseAttackSpeed;
                char2.mp = char2.maxMp;
                if (!char2.avatar) {
                  char2.avatar = getAvatarPath(char2.id, char2.faction);
                }
                if (!char2.faction || !char2.job) {
                  const initialChar = INITIAL_CHARACTERS.find((c) => c.id === char2.id);
                  const hireableChar = HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                  const templateChar = initialChar || hireableChar;
                  if (templateChar) {
                    char2.faction = templateChar.faction;
                    char2.job = templateChar.job;
                  }
                }
                if (char2.skills) {
                  char2.skills = char2.skills.map((skill) => {
                    const { icon, ...cleanSkill } = skill;
                    return cleanSkill;
                  });
                }
                return char2;
              });
            } else {
              const fullHomeGrid = createInitialHomeGrid();
              parsed.player.homeGrid.forEach((cell) => {
                if (cell.row >= 0 && cell.row < 9 && cell.col >= 0 && cell.col < 9) {
                  fullHomeGrid[cell.row][cell.col].building = cell.building;
                }
              });
              parsed.player.homeGrid = fullHomeGrid;
              parsed.player.characters = parsed.player.characters.map((char2) => {
                const tpl = INITIAL_CHARACTERS.find((c) => c.id === char2.id) || HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                if (!char2.baseMaxHp)
                  char2.baseMaxHp = char2.maxHp;
                if (!char2.baseMaxMp)
                  char2.baseMaxMp = char2.maxMp;
                if (!char2.baseAttack)
                  char2.baseAttack = char2.attack;
                if (!char2.baseDefense)
                  char2.baseDefense = char2.defense;
                if (!char2.moveSpeed && tpl)
                  char2.moveSpeed = tpl.moveSpeed;
                if (!char2.baseMoveSpeed)
                  char2.baseMoveSpeed = char2.moveSpeed || tpl?.baseMoveSpeed;
                if (!char2.attackRange && tpl)
                  char2.attackRange = tpl.attackRange;
                if (!char2.baseAttackRange)
                  char2.baseAttackRange = char2.attackRange || tpl?.baseAttackRange;
                if (!char2.attackSpeed && tpl)
                  char2.attackSpeed = tpl.attackSpeed;
                if (!char2.baseAttackSpeed)
                  char2.baseAttackSpeed = char2.attackSpeed || tpl?.baseAttackSpeed;
                char2.mp = char2.maxMp;
                if (!char2.avatar) {
                  char2.avatar = getAvatarPath(char2.id, char2.faction);
                }
                if (!char2.attribute) {
                  const initialChar = INITIAL_CHARACTERS.find((c) => c.id === char2.id);
                  const hireableChar = HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                  const templateChar = initialChar || hireableChar;
                  char2.attribute = templateChar?.attribute || "normal";
                }
                char2.skills = buildFullSkillsForCharacter(char2.id, char2.equipment);
                return char2;
              });
            }
          } else {
            parsed.player.homeGrid = createInitialHomeGrid();
            parsed.player.characters = parsed.player.characters.map((char2) => {
              if (!char2.attribute) {
                const initialChar = INITIAL_CHARACTERS.find((c) => c.id === char2.id);
                const hireableChar = HIREABLE_CHARACTERS.find((c) => c.id === char2.id);
                const templateChar = initialChar || hireableChar;
                char2.attribute = templateChar?.attribute || "normal";
              }
              char2.skills = buildFullSkillsForCharacter(char2.id, char2.equipment);
              return char2;
            });
          }
          console.log("\u5904\u7406\u540E\u7684 player:", parsed.player);
          player.value = parsed.player;
          const ALL_TEMPLATES = [...INITIAL_CHARACTERS, ...HIREABLE_CHARACTERS];
          for (const char2 of player.value.characters) {
            const template = ALL_TEMPLATES.find((t) => t.id === char2.id);
            if (template && typeof template.baseMoveSpeed === "number") {
              char2.baseMoveSpeed = template.baseMoveSpeed;
              const equipEffects = processEquipmentEffects(char2.equipment);
              char2.moveSpeed = template.baseMoveSpeed + (equipEffects.moveSpeed || 0);
            }
          }
          return { success: true };
        } catch (e) {
          console.error("\u52A0\u8F7D\u5B58\u6863\u5931\u8D25:", e);
          return { success: false, error: e.message?.substring(0, 100) || "\u52A0\u8F7D\u5B58\u6863\u65F6\u53D1\u751F\u672A\u77E5\u9519\u8BEF" };
        }
      }
      return { success: false, error: "\u672A\u627E\u5230\u5B58\u6863\u6570\u636E" };
    }
    async function hireCharacter(characterTemplate) {
      if (!player.value)
        return false;
      const hasCharacter = player.value.characters.some((c) => c.id === characterTemplate.id);
      if (hasCharacter)
        return false;
      const cost = Math.ceil(characterTemplate.maxHp + characterTemplate.maxMp + 5 * characterTemplate.attack + 5 * characterTemplate.defense + 200 * characterTemplate.moveSpeed + 100 * characterTemplate.attackRange + 300 * characterTemplate.attackSpeed);
      if (player.value.gold < cost)
        return false;
      player.value.gold -= cost;
      const newCharacter = createCharacterFromTemplate(characterTemplate);
      player.value.characters.push(newCharacter);
      await saveGame();
      return true;
    }
    async function equipItem(characterId, itemId) {
      if (!player.value)
        return false;
      const character = player.value.characters.find((c) => c.id === characterId);
      const item = player.value.inventory.find((i) => i.id === itemId);
      if (!character || !item || item.type !== "equipment" || !item.subtype)
        return false;
      const slot = item.subtype;
      const oldEquipment = character.equipment[slot];
      character.equipment[slot] = { ...item, count: 1 };
      item.count--;
      if (item.count <= 0) {
        player.value.inventory = player.value.inventory.filter((i) => i.id !== itemId);
      }
      if (oldEquipment) {
        const existingItem = player.value.inventory.find((i) => i.id === oldEquipment.id);
        if (existingItem) {
          existingItem.count++;
        } else {
          player.value.inventory.push({ ...oldEquipment, count: 1 });
        }
      }
      updateCharacterStats(character);
      character.skills = buildFullSkillsForCharacter(character.id, character.equipment);
      await saveGame();
      return true;
    }
    async function unequipItem(characterId, slot) {
      if (!player.value)
        return false;
      const character = player.value.characters.find((c) => c.id === characterId);
      if (!character)
        return false;
      const equipment = character.equipment[slot];
      if (!equipment)
        return false;
      character.equipment[slot] = null;
      const existingItem = player.value.inventory.find((i) => i.id === equipment.id);
      if (existingItem) {
        existingItem.count++;
      } else {
        player.value.inventory.push({ ...equipment, count: 1 });
      }
      updateCharacterStats(character);
      character.skills = buildFullSkillsForCharacter(character.id, character.equipment);
      await saveGame();
      return true;
    }
    function updateCharacterStats(character) {
      const equipEffects = processEquipmentEffects(character.equipment);
      character.maxHp = Math.ceil(character.baseMaxHp * (1 + equipEffects.hpPercent / 100)) + equipEffects.hp;
      character.maxMp = Math.ceil(character.baseMaxMp * (1 + equipEffects.mpPercent / 100)) + equipEffects.mp;
      character.attack = Math.ceil(character.baseAttack * (1 + equipEffects.attackPercent / 100)) + equipEffects.attack;
      character.defense = Math.ceil(character.baseDefense * (1 + equipEffects.defensePercent / 100)) + equipEffects.defense;
      character.moveSpeed = character.baseMoveSpeed + equipEffects.moveSpeed;
      character.attackRange = character.baseAttackRange + equipEffects.attackRange;
      if (character.hp > character.maxHp)
        character.hp = character.maxHp;
      if (character.mp > character.maxMp)
        character.mp = character.maxMp;
    }
    function addExpToCharacter(characterId, exp) {
      if (!player.value)
        return false;
      const character = player.value.characters.find((c) => c.id === characterId);
      if (!character)
        return false;
      character.exp += exp;
      checkAndUpgrade(character);
      return true;
    }
    function checkAndUpgrade(character) {
      if (character.level >= character.maxLevel) {
        return;
      }
      const expRequired = getExpRequired(character.level);
      if (character.exp >= expRequired) {
        character.exp -= expRequired;
        character.level++;
        const tpl = getCharacterBaseTemplate(character.id);
        if (tpl) {
          const growthHp = Math.ceil(tpl.baseMaxHp * 0.2);
          const growthMp = Math.ceil(tpl.baseMaxMp * 0.2);
          const growthAtk = Math.ceil(tpl.baseAttack * 0.2);
          const growthDef = Math.ceil(tpl.baseDefense * 0.2);
          character.baseMaxHp += growthHp;
          character.baseMaxMp += growthMp;
          character.baseAttack += growthAtk;
          character.baseDefense += growthDef;
          character.hp += growthHp;
          character.mp += growthMp;
          battleLog.value.push(`\u3010${character.name}\u3011\u5347\u7EA7\u5230${character.level}\u7EA7\uFF01\u751F\u547D+${growthHp} \u6CD5\u529B+${growthMp} \u653B\u51FB+${growthAtk} \u9632\u5FA1+${growthDef}`);
        } else {
          battleLog.value.push(`\u3010${character.name}\u3011\u5347\u7EA7\u5230${character.level}\u7EA7\uFF01`);
        }
        updateCharacterStats(character);
        if (character.exp >= getExpRequired(character.level) && character.level < character.maxLevel) {
          checkAndUpgrade(character);
        }
      }
    }
    async function useConsumable(itemId, targetCharacterId) {
      if (!player.value)
        return false;
      const item = player.value.inventory.find((i) => i.id === itemId);
      if (!item || item.type !== "consumable")
        return false;
      if (item.subtype === "soul") {
        return useSoul(itemId, targetCharacterId);
      }
      let target = null;
      if (targetCharacterId) {
        target = player.value.characters.find((c) => c.id === targetCharacterId);
      } else {
        target = player.value.characters[0];
      }
      if (!target)
        return false;
      let openedItem = null;
      if (isChestItem(item)) {
        const chestConfig = getChestConfigByName(item.name);
        const chestId = chestConfig?.id;
        openedItem = openChest(chestId);
        player.value.inventory.push(openedItem);
      } else if (item.name.includes("\u7075\u8349")) {
        const healAmount = Math.floor(target.maxHp * 0.1);
        const mpRestore = Math.floor(target.maxMp * 0.1);
        target.hp = Math.min(target.hp + healAmount, target.maxHp);
        target.mp = Math.min(target.mp + mpRestore, target.maxMp);
      } else if (item.name.includes("\u7075\u836F")) {
        const healAmount = Math.floor(target.maxHp * 0.3);
        const mpRestore = Math.floor(target.maxMp * 0.3);
        target.hp = Math.min(target.hp + healAmount, target.maxHp);
        target.mp = Math.min(target.mp + mpRestore, target.maxMp);
      } else if (item.name.includes("\u836F\u7BB1")) {
        target.hp = target.maxHp;
      } else {
        return false;
      }
      item.count--;
      if (item.count <= 0) {
        player.value.inventory = player.value.inventory.filter((i) => i.id !== itemId);
      }
      await saveGame();
      return openedItem !== null ? openedItem : true;
    }
    async function useSoul(itemId, targetCharacterId) {
      if (!player.value)
        return false;
      const item = player.value.inventory.find((i) => i.id === itemId);
      if (!item || item.subtype !== "soul")
        return false;
      const soulTargetId = item.soulTargetId;
      let target = null;
      if (soulTargetId === "universal") {
        if (targetCharacterId) {
          target = player.value.characters.find((c) => c.id === targetCharacterId);
        } else {
          return false;
        }
      } else {
        if (soulTargetId === targetCharacterId) {
          target = player.value.characters.find((c) => c.id === targetCharacterId);
        } else {
          if (!target) {
            battleLog.value.push(`\u6CA1\u6709\u53EF\u4EE5\u4F7F\u7528${item.name}\u3011\u7684\u89D2\u8272\uFF01`);
            return false;
          }
        }
      }
      if (!target)
        return false;
      if (target.maxLevel >= 20) {
        battleLog.value.push(`${target.name}\u3011\u7684\u7B49\u7EA7\u4E0A\u9650\u5DF2\u8FBE\u6700\u9AD8\uFF0820\u7EA7\uFF09\uFF01`);
        return false;
      }
      target.maxLevel++;
      battleLog.value.push(`\u4F7F\u7528${item.name}\u3011\uFF0C{target.name}\u3011\u7B49\u7EA7\u4E0A\u9650\u63D0\u5347\u81F3${target.maxLevel}\u7EA7\uFF01`);
      item.count--;
      if (item.count <= 0) {
        player.value.inventory = player.value.inventory.filter((i) => i.id !== itemId);
      }
      await saveGame();
      return true;
    }
    async function updateHomeGrid(row, col, terrain, buildingType) {
      if (!player.value)
        return;
      if (row < 0 || row >= 9 || col < 0 || col >= 9)
        return;
      const cell = player.value.homeGrid[row][col];
      cell.terrain = terrain;
      if (buildingType === "none") {
        cell.building = null;
      } else {
        let buildingConfig;
        switch (buildingType) {
          case "spiritField":
            buildingConfig = { type: "spiritField", name: "\u7075\u7530", icon: "\u{1F33E}", maxHp: 500, level: 1 };
            break;
          case "elixirRoom":
            buildingConfig = { type: "elixirRoom", name: "\u4E39\u623F", icon: "\u{1F3EF}", maxHp: 1e3, level: 1 };
            break;
          case "archerTower":
            buildingConfig = { type: "archerTower", name: "\u7BAD\u5854", icon: "/static/avatars/human/jianta.png", maxHp: 200, level: 1 };
            break;
          case "energyTower":
            buildingConfig = { type: "energyTower", name: "\u7075\u80FD\u5854", icon: "/static/avatars/human/lingnengta.png", maxHp: 300, level: 1 };
            break;
          default:
            buildingConfig = { type: "spiritField", name: "\u7075\u7530", icon: "\u{1F33E}", maxHp: 500, level: 1 };
        }
        cell.building = {
          id: `building_${row}_${col}`,
          ...buildingConfig,
          hp: buildingConfig.maxHp
        };
      }
      await saveGame();
    }
    async function nextPhase() {
      if (!player.value)
        return;
      if (player.value.phase === "day") {
        player.value.phase = "night";
      } else {
        player.value.phase = "day";
        player.value.day++;
      }
      restoreResources(20);
      await saveGame();
    }
    function restoreResources(percent) {
      if (!player.value)
        return;
      player.value.characters.forEach((char2) => {
        const hpRestore = Math.floor(char2.maxHp * percent / 100);
        const mpRestore = Math.floor(char2.maxMp * percent / 100);
        char2.hp = Math.min(char2.hp + hpRestore, char2.maxHp);
        char2.mp = Math.min(char2.mp + mpRestore, char2.maxMp);
      });
    }
    function handleSimBattleEvent(ev, state) {
      switch (ev.type) {
        case "attack": {
          const attacker = state.chars.find((c) => c.id === ev.attackerId);
          const target = state.chars.find((c) => c.id === ev.targetId);
          if (!target)
            break;
          const attr = attacker?.job || "normal";
          const isHeal = ev.damage < 0;
          const row = target.row;
          const col = target.col;
          const absVal = Math.abs(ev.damage);
          showFloatingText(row, col, absVal, isHeal ? "heal" : "damage", attr);
          if (!isHeal)
            triggerHitFlash(row, col, attr);
          if (attacker && attacker.attackRange > 1 && !isHeal) {
            triggerProjectile(attacker.row, attacker.col, row, col, "arrow", attr);
          }
          const getCharName = (c) => {
            const tpl = c ? findCharacterTemplateInStore(c.characterId) : null;
            return tpl?.name || c?.characterId || "??";
          };
          if (attacker) {
            if (isHeal) {
              battleLog.value.push(`\u3010${getCharName(attacker)}\u3011\u6062\u590D\u3010${getCharName(target)}\u3011${absVal}\u70B9\u751F\u547D\u503C`);
            } else {
              battleLog.value.push(`\u3010${getCharName(attacker)}\u3011\u5BF9\u3010${getCharName(target)}\u3011\u9020\u6210${absVal}\u70B9\u4F24\u5BB3`);
            }
          }
          break;
        }
        case "skill": {
          const caster = state.chars.find((c) => c.id === ev.casterId);
          const attr = caster?.job || "normal";
          if (caster)
            triggerChargeEffect(caster.row, caster.col, attr);
          break;
        }
        case "status": {
          const target = state.chars.find((c) => c.id === ev.targetId);
          if (!target)
            break;
          triggerStatusApplyEffect(target.row, target.col, ev.statusType);
          break;
        }
        case "death": {
          const dead = state.chars.find((c) => c.id === ev.charId);
          if (!dead)
            break;
          triggerDefeatAnimation(dead.row, dead.col, "kill");
          const deadTpl = findCharacterTemplateInStore(dead.characterId);
          triggerDeathEffect(dead.row, dead.col, deadTpl?.attribute || "normal");
          triggerMapShake("heavy");
          const name = deadTpl?.name || dead.characterId;
          battleLog.value.push(`\u3010${name}\u3011\u88AB\u51FB\u8D25`);
          break;
        }
        case "weather_damage": {
          showFloatingText(ev.row, ev.col, ev.hpDamage, "damage");
          if (ev.mpDamage > 0) {
            showFloatingText(ev.row, ev.col, ev.mpDamage, "mp", void 0, false, "-");
          }
          triggerShake(ev.row, ev.col, "character");
          break;
        }
        case "weather_heal": {
          showFloatingText(ev.row, ev.col, ev.hpHeal, "heal");
          break;
        }
        case "move": {
          break;
        }
      }
    }
    function startBattle(mode, terrain, difficulty = "normal", selectedCharacterIds, selectedFactions) {
      if (!player.value)
        return;
      battleResult.value = null;
      const config = BATTLE_CONFIG[mode];
      const difficultyConfig = DIFFICULTY_CONFIG[difficulty];
      const tiles = [];
      const buildings = [];
      const collectibles = [];
      console.log("=== \u5F00\u59CB\u6218===");
      console.log("\u6A21\u5F0F:", mode);
      console.log("\u5730\u5F62\u7C7B\u578B:", terrain);
      console.log("\u96BE\u5EA6:", difficulty);
      console.log("\u5730\u56FE\u914D\u7F6E:", config);
      console.log("\u654C\u65B9\u9635\u8425:", selectedFactions);
      for (let row = 0; row < config.height; row++) {
        tiles[row] = [];
        for (let col = 0; col < config.width; col++) {
          let tileTerrain = "empty";
          let tileBuilding = null;
          const probabilities = TERRAIN_PROBABILITIES[terrain] || TERRAIN_PROBABILITIES.plain;
          const rand = Math.random();
          if (rand < probabilities.river) {
            tileTerrain = "river";
          } else if (rand < probabilities.river + probabilities.obstacle) {
            tileTerrain = "obstacle";
          }
          tiles[row][col] = {
            row,
            col,
            terrain: tileTerrain,
            character: null,
            building: tileBuilding
          };
        }
      }
      let playerCharsForLevel;
      if (selectedCharacterIds && selectedCharacterIds.length > 0) {
        playerCharsForLevel = player.value.characters.filter((c) => selectedCharacterIds.includes(c.id) && c.hp > 0);
      } else {
        playerCharsForLevel = player.value.characters.filter((c) => c.hp > 0).slice(0, 5);
      }
      const buildingLevel = Math.floor(playerCharsForLevel.reduce((sum, char2) => sum + char2.level, 0) / playerCharsForLevel.length) || 1;
      const getBuildingHp = (baseHp) => Math.floor(baseHp * (1 + 0.1 * (buildingLevel - 1)));
      console.log("\u5EFA\u7B51\u7B49\u7EA7:", buildingLevel);
      if (mode === "defensive" || mode === "zombie") {
        const homeOffsetRow = Math.floor((config.height - 9) / 2);
        const homeOffsetCol = Math.floor((config.width - 9) / 2);
        console.log("\u5BB6\u56ED\u5730\u56FE\u6570\u636E:", player.value.homeGrid);
        for (let homeRow = 0; homeRow < 9; homeRow++) {
          for (let homeCol = 0; homeCol < 9; homeCol++) {
            const battleRow = homeOffsetRow + homeRow;
            const battleCol = homeOffsetCol + homeCol;
            const homeCell = player.value.homeGrid[homeRow][homeCol];
            console.log(`\u5BB6\u56ED\u683C\u5B50 [${homeRow},${homeCol}] -> \u6218\u573A [${battleRow},${battleCol}]:`, homeCell);
            if (false) {
              const buildingConfig = null;
              const calculatedMaxHp = getBuildingHp(buildingConfig.maxHp);
              const buildingLevel2 = homeCell.building.level || 1;
              const hpGrowth = buildingConfig.hpGrowth || 0;
              const attackGrowth = buildingConfig.attackGrowth || 0;
              const defenseGrowth = buildingConfig.defenseGrowth || 0;
              const calculatedAttack = (buildingConfig.attack || 0) + attackGrowth * (buildingLevel2 - 1);
              const calculatedDefense = (buildingConfig.defense || 0) + defenseGrowth * (buildingLevel2 - 1);
              const newBuilding = {
                id: `building_${homeRow}_${homeCol}`,
                type: homeCell.building.type,
                name: buildingConfig.name,
                icon: buildingConfig.icon,
                maxHp: calculatedMaxHp + hpGrowth * (buildingLevel2 - 1),
                hp: calculatedMaxHp + hpGrowth * (buildingLevel2 - 1),
                row: battleRow,
                col: battleCol,
                isPlayer: true,
                spawnRound: buildingConfig.spawnRound || 0,
                hasSpawnedBonus: false,
                attack: calculatedAttack,
                defense: calculatedDefense,
                attackRange: buildingConfig.attackRange || 0,
                level: buildingLevel2
              };
              buildings.push(newBuilding);
              tiles[battleRow][battleCol].building = newBuilding;
            } else if (homeCell.terrain !== "empty") {
            }
          }
        }
      } else {
        const spawnStartRow = config.height - 3;
        for (let r = spawnStartRow; r < config.height; r++) {
          for (let c = 0; c < config.width; c++) {
            if (tiles[r][c].terrain !== "empty") {
              tiles[r][c].terrain = "empty";
            }
          }
        }
      }
      console.log("\u751F\u6210\u7684\u5730", tiles);
      console.log("\u751F\u6210\u7684\u5EFA\u7B51\u7269:", buildings);
      let playerChars;
      if (selectedCharacterIds && selectedCharacterIds.length > 0) {
        playerChars = player.value.characters.filter((c) => selectedCharacterIds.includes(c.id) && c.hp > 0);
        console.log("\u4F7F\u7528\u9009\u4E2D\u89D2\u8272:", selectedCharacterIds, "\u7B5B\u9009\u51FA:", playerChars);
      } else {
        playerChars = player.value.characters.filter((c) => c.hp > 0).slice(0, 5);
        console.log("\u4F7F\u7528\u9ED8\u8BA4\u89D2\u8272:", playerChars);
      }
      const players = [];
      const enemies = [];
      const enemyLevel = Math.floor(playerChars.reduce((sum, char2) => sum + char2.level, 0) / playerChars.length) || 1;
      console.log("\u654C\u4EBA\u7B49\u7EA7:", enemyLevel);
      let validPositions = [];
      if (mode === "defensive" || mode === "zombie") {
        const homeOffsetRow = Math.floor((config.height - 9) / 2);
        const homeOffsetCol = Math.floor((config.width - 9) / 2);
        for (let r = homeOffsetRow; r < homeOffsetRow + 9 && r < config.height; r++) {
          for (let c = homeOffsetCol; c < homeOffsetCol + 9 && c < config.width; c++) {
            const tile = tiles[r]?.[c];
            const hasBuilding = buildings.some((b) => b.row === r && b.col === c);
            if (tile && tile.terrain === "empty" && !hasBuilding) {
              validPositions.push({ row: r, col: c });
            }
          }
        }
      } else {
        const startRow = config.height - 3;
        for (let r = startRow; r < config.height; r++) {
          for (let c = 0; c < config.width; c++) {
            const tile = tiles[r]?.[c];
            const hasBuilding = buildings.some((b) => b.row === r && b.col === c);
            if (tile && tile.terrain === "empty" && !hasBuilding) {
              validPositions.push({ row: r, col: c });
            }
          }
        }
      }
      function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      shuffleArray(validPositions);
      playerChars.forEach((char2, index) => {
        if (index < validPositions.length) {
          const pos = validPositions[index];
          const newPlayer = {
            id: `battle_${char2.id}`,
            characterId: char2.id,
            row: pos.row,
            col: pos.col,
            hp: char2.hp,
            mp: char2.mp,
            maxHp: char2.maxHp,
            maxMp: char2.maxMp,
            isPlayer: true,
            level: char2.level,
            skillLastUsedTime: {},
            totalDamage: 0,
            totalHeal: 0,
            defense: char2.defense,
            attack: char2.attack,
            moveSpeed: char2.moveSpeed,
            attackRange: char2.attackRange,
            attackSpeed: char2.attackSpeed,
            statuses: [],
            faction: char2.faction,
            job: char2.job
          };
          players.push(newPlayer);
          tiles[pos.row][pos.col].character = newPlayer;
          console.log("\u6DFB\u52A0\u73A9\u5BB6\u89D2\u8272\u5230\u6218", char2.id, char2.name, char2.avatar, "\u4F4D\u7F6E:", pos.row, pos.col, "\u9632\u5FA1", char2.defense, "\u653B\u51FB", char2.attack);
        } else {
          console.error("\u6CA1\u6709\u8DB3\u591F\u7684\u7A7A\u4F4D\u653E\u7F6E\u89D2", char2.name);
        }
      });
      const baseEnemyCount = playerChars.length;
      let enemyCount = Math.max(1, Math.ceil(baseEnemyCount * difficultyConfig.multiplier));
      if (difficulty === "easy") {
        enemyCount = 1;
      }
      const enabledFactions = selectedFactions && selectedFactions.length > 0 ? selectedFactions : ["ghost"];
      const availableEnemyTemplates = HIREABLE_CHARACTERS.filter((char2) => enabledFactions.includes(char2.faction) && char2.job !== "\u865A\u5F71");
      const finalEnemyFactions = availableEnemyTemplates.length > 0 ? enabledFactions : ["ghost"];
      const enemyTemplates = HIREABLE_CHARACTERS.filter((char2) => finalEnemyFactions.includes(char2.faction) && char2.job !== "\u865A\u5F71");
      console.log("\u9009\u4E2D\u7684\u654C\u65B9\u9635", enabledFactions);
      console.log("\u53EF\u7528\u654C\u4EBA\u6A21\u677F\u6570\u91CF:", enemyTemplates.length);
      console.log("\u57FA\u7840\u654C\u4EBA\u6570\u91CF:", baseEnemyCount, "\u96BE\u5EA6\u500D\u6570:", difficultyConfig.multiplier, "\u6700\u7EC8\u654C\u4EBA\u6570", enemyCount);
      for (let index = 0; index < enemyCount; index++) {
        let placed = false;
        let attempts = 0;
        const randomTemplate = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)];
        while (!placed && attempts < 100) {
          let row, col;
          if (mode === "defensive" || mode === "zombie") {
            const edge = Math.floor(Math.random() * 4);
            switch (edge) {
              case 0:
                row = 0;
                col = Math.floor(Math.random() * config.width);
                break;
              case 1:
                row = Math.floor(Math.random() * config.height);
                col = config.width - 1;
                break;
              case 2:
                row = config.height - 1;
                col = Math.floor(Math.random() * config.width);
                break;
              case 3:
                row = Math.floor(Math.random() * config.height);
                col = 0;
                break;
            }
          } else {
            row = Math.floor(Math.random() * 4);
            col = Math.floor(Math.random() * config.width);
          }
          const tile = tiles[row]?.[col];
          const hasBuilding = buildings.some((b) => b.row === row && b.col === col);
          const hasCharacter = [...players, ...enemies].some((c) => c.row === row && c.col === col);
          if (tile && tile.terrain === "empty" && !hasBuilding && !hasCharacter) {
            const newEnemy = createBattleCharacter(randomTemplate, enemyLevel, row, col, false);
            newEnemy.id = `enemy_${index}`;
            enemies.push(newEnemy);
            tiles[row][col].character = newEnemy;
            placed = true;
            console.log("\u6DFB\u52A0\u654C\u4EBA\u5230\u6218", randomTemplate.name, "\u7B49\u7EA7:", enemyLevel, "\u653B\u51FB:", newEnemy.attack, "\u9632\u5FA1:", newEnemy.defense, "\u4F4D\u7F6E:", row, col);
          }
          attempts++;
        }
      }
      const shouldPlaceHeart = enabledFactions.includes("ghost");
      const shouldPlaceBarracks = enabledFactions.includes("human");
      const shouldPlaceTianqiPao = enabledFactions.includes("human");
      const possibleBuildings = [];
      if (shouldPlaceHeart)
        possibleBuildings.push({ type: "heart", configKey: "heart", id: "enemy_heart" });
      if (shouldPlaceBarracks)
        possibleBuildings.push({ type: "barracks", configKey: "barracks", id: "enemy_barracks" });
      if (shouldPlaceTianqiPao)
        possibleBuildings.push({ type: "tianqiPao", configKey: "tianqiPao", id: "enemy_tianqipao" });
      let buildingsToSpawn = possibleBuildings;
      if (difficulty === "easy" || difficulty === "normal") {
        if (possibleBuildings.length > 0) {
          const randomIndex = Math.floor(Math.random() * possibleBuildings.length);
          buildingsToSpawn = [possibleBuildings[randomIndex]];
        }
      }
      for (const buildingInfo of buildingsToSpawn) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
          let row, col;
          if (mode === "defensive") {
            const edge = Math.floor(Math.random() * 4);
            switch (edge) {
              case 0:
                row = 0;
                col = Math.floor(Math.random() * config.width);
                break;
              case 1:
                row = Math.floor(Math.random() * config.height);
                col = config.width - 1;
                break;
              case 2:
                row = config.height - 1;
                col = Math.floor(Math.random() * config.width);
                break;
              case 3:
                row = Math.floor(Math.random() * config.height);
                col = 0;
                break;
            }
          } else {
            row = Math.floor(Math.random() * 4);
            col = Math.floor(Math.random() * config.width);
          }
          const tile = tiles[row]?.[col];
          const hasBuilding = buildings.some((b) => b.row === row && b.col === col);
          const hasCharacter = [...players, ...enemies].some((c) => c.row === row && c.col === col);
          if (false) {
            const buildingConfig = null;
            const calculatedMaxHp = getBuildingHp(buildingConfig.maxHp);
            const newBuilding = {
              id: buildingInfo.id,
              type: buildingInfo.type,
              name: buildingConfig.name,
              icon: buildingConfig.icon,
              maxHp: calculatedMaxHp,
              hp: calculatedMaxHp,
              row,
              col,
              isPlayer: false,
              spawnRound: buildingConfig.spawnRound || 0,
              hasSpawnedBonus: false,
              ...buildingInfo.type === "tianqiPao" ? { targetPositions: [] } : {}
            };
            buildings.push(newBuilding);
            tiles[row][col].building = newBuilding;
            placed = true;
            console.log(`\u6DFB\u52A0${buildingConfig.name}\u5EFA\u7B51\u5230\u6218?(\u7B49\u7EA7${buildingLevel}, \u8840${calculatedMaxHp}):`, row, col);
          }
          attempts++;
        }
      }
      if (false) {
        const collectibleCount = 3;
        for (let i = 0; i < collectibleCount; i++) {
          let placed = false;
          let attempts = 0;
          while (!placed && attempts < 50) {
            const row = Math.floor(Math.random() * config.height);
            const col = Math.floor(Math.random() * config.width);
            const tile = tiles[row][col];
            const hasBuilding = buildings.some((b) => b.row === row && b.col === col);
            const hasCharacter = [...players, ...enemies].some((c) => c.row === row && c.col === col);
            const hasCollectible = collectibles.some((c) => c.row === row && c.col === col);
            if (tile && tile.terrain === "empty" && !hasBuilding && !hasCharacter && !hasCollectible) {
              const collectibleConfig = null;
              collectibles.push({
                id: `collect_${i}`,
                type: "spirit_grass",
                name: collectibleConfig.name,
                icon: collectibleConfig.icon,
                description: collectibleConfig.description,
                hpRestore: collectibleConfig.hpRestore,
                mpRestore: collectibleConfig.mpRestore,
                row,
                col
              });
              placed = true;
            }
            attempts++;
          }
        }
      }
      battleMap.value = {
        id: `battle_${Date.now()}`,
        width: config.width,
        height: config.height,
        mode,
        terrainType: terrain,
        tiles,
        players,
        enemies,
        loot: [],
        weather: "normal",
        snowAreas: [],
        fireAreas: [],
        fogAreas: [],
        visibilityEnabled: mode === "zombie",
        visibilityGrid: Array.from({ length: config.height }, () => Array(config.width).fill(mode !== "zombie")),
        enemyLevel,
        initialEnemyCount: enemies.length,
        defeatedCharacters: [],
        playerReiki: 0,
        playerShaQi: 0,
        enemyReiki: 0,
        enemyShaQi: 0,
        battleEnded: false,
        // 实时战斗运行时字      paused: false,
        speedMultiplier: 1,
        battleStartTime: Date.now()
      };
      endBattleScheduled = false;
      updateWeather();
      if (mode === "zombie") {
        calculateVisibility();
      }
      console.log("\u6218\u573A\u73A9\u5BB6\u89D2\u8272:", players);
      isInBattle.value = true;
      battleLog.value = ["\u6218\u6597\u5F00\u59CB\uFF01"];
      gatheringPoints.value = [];
      isSelectingGatherPoints.value = false;
      battleManager = new BattleManager(
        battleMap.value,
        players,
        enemies,
        () => battleMap.value.fireAreas,
        () => battleMap.value.snowAreas,
        () => battleMap.value.fogAreas
      );
      battleManager.onEnd((winner) => {
        if (battleMap.value && !battleMap.value.battleEnded) {
          endBattle(winner === "player");
        }
      });
      let lastWeatherTime = Date.now();
      battleSyncTimer = setInterval(() => {
        if (!battleManager || !battleMap.value)
          return;
        const state = battleManager.getState();
        const now = Date.now();
        if (now - lastWeatherTime >= 6e3) {
          lastWeatherTime = now;
          updateWeather();
        }
        if (state.events.length > 0) {
          for (const ev of state.events) {
            handleSimBattleEvent(ev, state);
          }
          state.events = [];
        }
        for (const simChar of state.chars) {
          const arr = simChar.isPlayer ? battleMap.value.players : battleMap.value.enemies;
          const target = arr.find((c) => c.id === simChar.id);
          if (target) {
            target.hp = simChar.hp;
            target.mp = simChar.mp;
            target.row = simChar.row;
            target.col = simChar.col;
            target.statuses = [...simChar.statuses];
            target.totalDamage = simChar.totalDamage;
            target.totalHeal = simChar.totalHeal;
            if (simChar.dead && target.hp > 0) {
            }
            if (simChar.dead) {
              const alreadyMoved = battleMap.value.defeatedCharacters.some((c) => c.id === target.id);
              if (!alreadyMoved) {
                const idx = arr.findIndex((c) => c.id === target.id);
                if (idx >= 0)
                  arr.splice(idx, 1);
                battleMap.value.defeatedCharacters.push(target);
                triggerDefeatAnimation(target.row, target.col, "kill");
              }
            }
          }
        }
        const { width, height } = battleMap.value;
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            battleMap.value.tiles[r][c].character = void 0;
          }
        }
        for (const p of battleMap.value.players) {
          if (p.hp > 0) {
            battleMap.value.tiles[p.row][p.col].character = p;
          }
        }
        for (const e of battleMap.value.enemies) {
          if (e.hp > 0) {
            battleMap.value.tiles[e.row][e.col].character = e;
          }
        }
        battleMap.value.speedMultiplier = battleManager.getSpeedMultiplier();
        if (battleManager.isEnded()) {
          if (battleSyncTimer) {
            clearInterval(battleSyncTimer);
            battleSyncTimer = null;
          }
          const winner = battleManager.getWinner();
          battleLog.value.push(winner === "player" ? "\u6218\u6597\u80DC\u5229\uFF01" : "\u6218\u6597\u5931\u8D25...");
          endBattle(winner === "player");
        }
      }, 100);
      battleManager.start();
    }
    const battleResult = (0, import_vue.ref)(null);
    async function endBattle(victory, isEscape = false) {
      console.log("[END] endBattle called, victory:", victory, "isEscape:", isEscape);
      if (!player.value || !battleMap.value) {
        console.log("[END] early return: missing state");
        return;
      }
      if (battleMap.value.battleEnded && !isEscape) {
        console.log("[END] early return: already ended");
        return;
      }
      battleMap.value.battleEnded = true;
      if (battleManager) {
        const finalSimState = battleManager.getState();
        for (const simChar of finalSimState.chars) {
          const arr = simChar.isPlayer ? battleMap.value.players : battleMap.value.enemies;
          let target = arr.find((c) => c.id === simChar.id);
          if (!target) {
            target = battleMap.value.defeatedCharacters.find((c) => c.id === simChar.id);
          }
          if (target) {
            target.totalDamage = simChar.totalDamage;
            target.totalHeal = simChar.totalHeal;
          }
        }
      }
      if (battleManager) {
        battleManager.stop();
        battleManager = null;
      }
      if (battleSyncTimer) {
        clearInterval(battleSyncTimer);
        battleSyncTimer = null;
      }
      const finalResultType = victory ? "victory" : isEscape ? "escape" : "defeat";
      let resultData = {
        type: finalResultType,
        defeatedEnemyCount: 0,
        destroyedBuildingCount: 0,
        enemyLevel: 1,
        goldGained: 0,
        loot: [],
        characterExp: [],
        battleStats: { playerDamage: 0, playerHeal: 0, enemyDamage: 0, enemyHeal: 0, characters: [] }
      };
      try {
        const enemyCount = battleMap.value.initialEnemyCount;
        const enemyLevel = battleMap.value.enemyLevel;
        const defeatedEnemyCount = (battleMap.value.defeatedCharacters || []).filter((c) => !c.isPlayer).length;
        const destroyedBuildingCount = 0;
        let goldGained = 0;
        const loot = [];
        const characterExp = [];
        const allPlayerChars = [...battleMap.value.players, ...battleMap.value.defeatedCharacters || []].filter((c) => c.isPlayer);
        if (victory) {
          const wanwuChestConfig = CHEST_CONFIG.wanwu;
          const wanwuIndex = player.value.inventory.findIndex(
            (item) => item.name === wanwuChestConfig.name && item.type === "consumable"
          );
          if (wanwuIndex >= 0) {
            player.value.inventory[wanwuIndex].count += 1;
          } else {
            player.value.inventory.push({
              ...wanwuChestConfig,
              id: `item_${Date.now()}_${Math.random()}`,
              count: 1,
              type: "consumable",
              subtype: "chest"
            });
          }
          loot.push({ name: wanwuChestConfig.name, count: 1 });
          battleLog.value.push(`\u83B7\u5F97 1 \u4E2A${wanwuChestConfig.name}\uFF01`);
          const faqiChestConfig = CHEST_CONFIG.faqi;
          const faqiIndex = player.value.inventory.findIndex(
            (item) => item.name === faqiChestConfig.name && item.type === "consumable"
          );
          if (faqiIndex >= 0) {
            player.value.inventory[faqiIndex].count += enemyCount;
          } else {
            player.value.inventory.push({
              ...faqiChestConfig,
              id: `item_${Date.now()}_${Math.random()}`,
              count: enemyCount,
              type: "consumable",
              subtype: "chest"
            });
          }
          loot.push({ name: faqiChestConfig.name, count: enemyCount });
          battleLog.value.push(`\u83B7\u5F97 ${enemyCount} \u4E2A${faqiChestConfig.name}\uFF01`);
          goldGained = 150 + enemyCount * 30 * enemyLevel;
          player.value.gold += goldGained;
          battleLog.value.push(`\u6218\u6597\u80DC\u5229\uFF01\u83B7\u5F97 ${goldGained} \u91D1\u5E01`);
          const defeatedEnemySouls = {};
          if (battleMap.value.defeatedCharacters) {
            battleMap.value.defeatedCharacters.forEach((char2) => {
              if (!char2.isPlayer && char2.hp <= 0) {
                const charId = char2.characterId;
                const template = findCharacterTemplateInStore(charId);
                const charName = template?.name || char2.name || charId;
                if (!defeatedEnemySouls[charId]) {
                  defeatedEnemySouls[charId] = { id: charId, name: charName, count: 0 };
                }
                defeatedEnemySouls[charId].count++;
              }
            });
          }
          Object.values(defeatedEnemySouls).forEach((soul) => {
            const soulConfig = createSoulItem(soul.id, soul.name);
            const existingIndex = player.value.inventory.findIndex(
              (i) => i.subtype === "soul" && i.soulTargetId === soul.id
            );
            if (existingIndex >= 0) {
              player.value.inventory[existingIndex].count += soul.count;
            } else {
              player.value.inventory.push({
                ...soulConfig,
                id: `soul_${Date.now()}_${Math.random()}`,
                count: soul.count
              });
            }
            loot.push({ name: soulConfig.name, count: soul.count });
            battleLog.value.push(`\u83B7\u5F97${soul.count}\u4E2A${soul.name}\u9B42\u9B44\uFF01`);
          });
          const universalSoulConfig = createSoulItem("universal");
          const universalIndex = player.value.inventory.findIndex(
            (i) => i.subtype === "soul" && i.soulTargetId === "universal"
          );
          if (universalIndex >= 0) {
            player.value.inventory[universalIndex].count += 1;
          } else {
            player.value.inventory.push({
              ...universalSoulConfig,
              id: `soul_universal_${Date.now()}_${Math.random()}`,
              count: 1
            });
          }
          loot.push({ name: universalSoulConfig.name, count: 1 });
          battleLog.value.push(`\u83B7\u5F97 1 \u4E2A\u4E07\u80FD\u9B42\u9B44\uFF01`);
          const baseExp = enemyCount * 10 * enemyLevel + destroyedBuildingCount * 30 * enemyLevel;
          allPlayerChars.forEach((battleChar) => {
            const originalChar = player.value.characters.find((c) => c.id === battleChar.characterId);
            if (!originalChar)
              return;
            const isDefeated = battleChar.hp <= 0;
            const expGained = isDefeated ? Math.floor(baseExp / 2) : baseExp;
            if (addExpToCharacter(battleChar.characterId, expGained)) {
              characterExp.push({ name: originalChar.name, exp: expGained, isDefeated });
              if (isDefeated) {
                battleLog.value.push(`${originalChar.name} \u6218\u8D25\uFF0C\u83B7\u5F97 ${expGained} \u7ECF\u9A8C\u503C\uFF01`);
              } else {
                battleLog.value.push(`${originalChar.name} \u83B7\u5F97 ${expGained} \u7ECF\u9A8C\u503C\uFF01`);
              }
            }
          });
          battleLog.value.push("\u6218\u6597\u80DC\u5229\uFF01");
        } else {
          const expPerCharacter = enemyLevel * (defeatedEnemyCount * 5 + destroyedBuildingCount * 15);
          allPlayerChars.forEach((battleChar) => {
            const originalChar = player.value.characters.find((c) => c.id === battleChar.characterId);
            if (!originalChar)
              return;
            const isDefeated = battleChar.hp <= 0;
            if (addExpToCharacter(battleChar.characterId, expPerCharacter)) {
              characterExp.push({ name: originalChar.name, exp: expPerCharacter, isDefeated });
              battleLog.value.push(`${originalChar.name} \u83B7\u5F97 ${expPerCharacter} \u7ECF\u9A8C\u503C\uFF01`);
            }
          });
          if (isEscape) {
            battleLog.value.push("\u9003\u79BB\u6218\u6597\uFF01");
          } else {
            battleLog.value.push("\u6218\u6597\u5931\u8D25\uFF01");
          }
        }
        const allBattleChars = [
          ...battleMap.value.players,
          ...battleMap.value.enemies,
          ...battleMap.value.defeatedCharacters || []
        ];
        const charStatsMap = {};
        allBattleChars.forEach((char2) => {
          if (!char2.characterId)
            return;
          const template = findCharacterTemplateInStore(char2.characterId);
          const name = template?.name || char2.name || char2.characterId;
          const side = char2.isPlayer ? "player" : "enemy";
          const damage = char2.totalDamage || 0;
          const heal = char2.totalHeal || 0;
          if (charStatsMap[char2.characterId]) {
            charStatsMap[char2.characterId].damage += damage;
            charStatsMap[char2.characterId].heal += heal;
          } else {
            charStatsMap[char2.characterId] = { name, side, damage, heal };
          }
        });
        const characters = Object.values(charStatsMap);
        const playerDamage = characters.filter((c) => c.side === "player").reduce((sum, c) => sum + c.damage, 0);
        const playerHeal = characters.filter((c) => c.side === "player").reduce((sum, c) => sum + c.heal, 0);
        const enemyDamage = characters.filter((c) => c.side === "enemy").reduce((sum, c) => sum + c.damage, 0);
        const enemyHeal = characters.filter((c) => c.side === "enemy").reduce((sum, c) => sum + c.heal, 0);
        resultData.defeatedEnemyCount = defeatedEnemyCount;
        resultData.destroyedBuildingCount = destroyedBuildingCount;
        resultData.enemyLevel = enemyLevel;
        resultData.goldGained = goldGained;
        resultData.loot = loot;
        resultData.characterExp = characterExp;
        resultData.battleStats = {
          playerDamage,
          playerHeal,
          enemyDamage,
          enemyHeal,
          characters
        };
        console.log("[END] resultData:", JSON.stringify(resultData).substring(0, 500));
      } catch (e) {
        console.error("[END] Error in endBattle:", e);
      }
      if (battleMap.value) {
        const survivors = [...battleMap.value.players, ...battleMap.value.defeatedCharacters || []];
        survivors.forEach((battleChar) => {
          if (!battleChar.isPlayer)
            return;
          const playerChar = player.value.characters.find((c) => c.id === battleChar.characterId);
          if (playerChar) {
            if (battleChar.hp > 0) {
              playerChar.hp = playerChar.maxHp;
              playerChar.mp = playerChar.maxMp;
            }
          }
        });
      }
      if (victory) {
        if (player.value.phase === "day") {
          player.value.phase = "night";
        } else {
          player.value.phase = "day";
          player.value.day++;
        }
      } else {
      }
      restoreResources(30);
      isInBattle.value = false;
      battleResult.value = resultData;
      setTimeout(() => {
        battleMap.value = null;
      }, 100);
      await saveGame();
    }
    async function upgradeEquipment(itemId) {
      if (!player.value)
        return false;
      const item = player.value.inventory.find((i) => i.id === itemId);
      if (!item || item.type !== "equipment" || !item.baseStats)
        return false;
      if (item.level >= 11) {
        return false;
      }
      const cost = getEquipmentUpgradeCost(item);
      if (player.value.gold < cost) {
        return false;
      }
      player.value.gold -= cost;
      item.level += 1;
      for (const char2 of player.value.characters) {
        const eq = char2.equipment;
        const slots = ["weapon", "armor", "helmet", "shoes", "accessory"];
        for (const slot of slots) {
          if (eq[slot]?.id === itemId) {
            eq[slot].level = item.level;
          }
        }
      }
      await saveGame();
      return true;
    }
    function openChestStore() {
      return null;
    }
    async function buyShopEquipment(template) {
      if (!player.value || !template)
        return false;
      if (!template.baseStats)
        return false;
      const total = (template.baseStats.attack || 0) + (template.baseStats.defense || 0) + (template.baseStats.hp || 0) + (template.baseStats.mp || 0) + (template.baseStats.moveSpeed || 0) + (template.baseStats.attackRange || 0);
      let rarity = "common";
      if (total >= 150)
        rarity = "peerless";
      else if (total >= 100)
        rarity = "celestial";
      else if (total >= 70)
        rarity = "treasure";
      else if (total >= 40)
        rarity = "exceptional";
      else if (total >= 20)
        rarity = "rare";
      const finalRarity = template.rarity || rarity;
      const rarityBonus = RARITY_CONFIG[finalRarity].bonus;
      const cost = Math.floor(total * 25 * (1 + rarityBonus));
      if (player.value.gold < cost) {
        return false;
      }
      const newItem = {
        ...template,
        id: "item_" + Date.now() + "_" + Math.floor(Math.random() * 1e3),
        rarity: template.rarity || rarity,
        level: 1,
        count: 1
      };
      player.value.gold -= cost;
      const existing = player.value.inventory.find((i) => i.name === newItem.name && i.type === "equipment");
      if (existing) {
        existing.count++;
      } else {
        player.value.inventory.push(newItem);
      }
      await saveGame();
      return true;
    }
    async function sellEquipment(itemId, price) {
      if (!player.value)
        return false;
      const itemIndex = player.value.inventory.findIndex((i) => i.id === itemId);
      if (itemIndex === -1)
        return false;
      const item = player.value.inventory[itemIndex];
      if (item.count > 1) {
        item.count--;
      } else {
        player.value.inventory.splice(itemIndex, 1);
      }
      player.value.gold += price;
      await saveGame();
      return true;
    }
    async function buyShopConsumable(template, price) {
      if (!player.value || !template)
        return false;
      if (player.value.gold < price) {
        return false;
      }
      const newItem = {
        id: "item_" + Date.now() + "_" + Math.floor(Math.random() * 1e3),
        name: template.name,
        icon: template.icon,
        type: "consumable",
        rarity: template.rarity || "common",
        level: 1,
        count: 1,
        description: template.description
      };
      player.value.gold -= price;
      const existing = player.value.inventory.find((i) => i.name === newItem.name && i.type === "consumable");
      if (existing) {
        existing.count++;
      } else {
        player.value.inventory.push(newItem);
      }
      await saveGame();
      return true;
    }
    function updateWeather() {
      if (!battleMap.value)
        return;
      const rand = Math.random();
      let newWeather = "normal";
      if (rand < 0.1) {
        newWeather = "light_snow";
      } else if (rand < 0.2) {
        newWeather = "medium_snow";
      } else if (rand < 0.3) {
        newWeather = "heavy_snow";
      } else if (rand < 0.4) {
        newWeather = "mountain_fire";
      } else if (rand < 0.5) {
        newWeather = "sky_fire";
      } else if (rand < 0.6) {
        newWeather = "fog";
      } else if (rand < 0.7) {
        newWeather = "ghost_fog";
      }
      battleMap.value.weather = newWeather;
      generateSnowAreas();
      generateFireAreas();
      generateFogAreas();
      const weatherNames = {
        normal: "\u6674\u6717",
        light_snow: "\u5C0F\u96EA",
        medium_snow: "\u4E2D\u96EA",
        heavy_snow: "\u5927\u96EA",
        mountain_fire: "\u5C71\u706B",
        sky_fire: "\u5929\u706B",
        fog: "\u8FF7\u96FE",
        ghost_fog: "\u9B3C\u96FE"
      };
      battleLog.value.push(`\u5929\u6C14\u53D8\u4E3A${weatherNames[newWeather]}`);
    }
    function generateSnowAreas() {
      if (!battleMap.value)
        return;
      const { width, height, weather } = battleMap.value;
      const skillSnowAreas = battleMap.value.snowAreas.filter((s) => s.source === "skill");
      battleMap.value.snowAreas = skillSnowAreas;
      if (weather === "normal")
        return;
      const snowAreas = [];
      const usedPositions = /* @__PURE__ */ new Set();
      let config;
      switch (weather) {
        case "light_snow":
          config = { areaCount: 4, areaSize: 2 };
          break;
        case "medium_snow":
          config = { areaCount: 3, areaSize: 3 };
          break;
        case "heavy_snow":
          config = { areaCount: 4, areaSize: 3 };
          break;
        default:
          return;
      }
      for (let i = 0; i < config.areaCount; i++) {
        let attempts = 0;
        while (attempts < 50) {
          const startRow = Math.floor(Math.random() * (height - config.areaSize + 1));
          const startCol = Math.floor(Math.random() * (width - config.areaSize + 1));
          let valid = true;
          for (let r = 0; r < config.areaSize; r++) {
            for (let c = 0; c < config.areaSize; c++) {
              const key2 = `${startRow + r},${startCol + c}`;
              if (usedPositions.has(key2)) {
                valid = false;
                break;
              }
            }
            if (!valid)
              break;
          }
          if (valid) {
            for (let r = 0; r < config.areaSize; r++) {
              for (let c = 0; c < config.areaSize; c++) {
                const row = startRow + r;
                const col = startCol + c;
                const key2 = `${row},${col}`;
                usedPositions.add(key2);
                snowAreas.push({ row, col, source: "weather" });
              }
            }
            break;
          }
          attempts++;
        }
      }
      battleMap.value.snowAreas = [...skillSnowAreas, ...snowAreas];
    }
    function generateFireAreas() {
      if (!battleMap.value)
        return;
      const { width, height, weather } = battleMap.value;
      const skillFireAreas = battleMap.value.fireAreas.filter((f) => f.source === "skill");
      battleMap.value.fireAreas = skillFireAreas;
      if (weather !== "mountain_fire" && weather !== "sky_fire")
        return;
      const fireAreas = [];
      const usedPositions = /* @__PURE__ */ new Set();
      const areaCount = 2;
      const areaSize = weather === "sky_fire" ? 3 : 2;
      for (let i = 0; i < areaCount; i++) {
        let attempts = 0;
        while (attempts < 50) {
          const startRow = Math.floor(Math.random() * (height - areaSize + 1));
          const startCol = Math.floor(Math.random() * (width - areaSize + 1));
          let valid = true;
          for (let r = 0; r < areaSize; r++) {
            for (let c = 0; c < areaSize; c++) {
              const key2 = `${startRow + r},${startCol + c}`;
              if (usedPositions.has(key2)) {
                valid = false;
                break;
              }
            }
            if (!valid)
              break;
          }
          if (valid) {
            for (let r = 0; r < areaSize; r++) {
              for (let c = 0; c < areaSize; c++) {
                const row = startRow + r;
                const col = startCol + c;
                const key2 = `${row},${col}`;
                usedPositions.add(key2);
                fireAreas.push({ row, col, source: "weather" });
              }
            }
            break;
          }
          attempts++;
        }
      }
      battleMap.value.fireAreas = [...skillFireAreas, ...fireAreas];
    }
    function isFireArea(row, col) {
      if (!battleMap.value)
        return false;
      return battleMap.value.fireAreas.some((f) => f.row === row && f.col === col);
    }
    function isCharacterInFire(char2) {
      return isFireArea(char2.row, char2.col);
    }
    function cleanupExpiredSnowAreas(phase) {
      if (!battleMap.value)
        return;
      battleMap.value.snowAreas = battleMap.value.snowAreas.filter(
        (s) => !(s.source === "skill" && s.expiresAfterPhase === phase)
      );
    }
    function isSnowArea(row, col) {
      if (!battleMap.value)
        return false;
      return battleMap.value.snowAreas.some((s) => s.row === row && s.col === col);
    }
    function isCharacterInSnow(char2) {
      return isSnowArea(char2.row, char2.col);
    }
    function calculateVisibility() {
      if (!battleMap.value || !battleMap.value.visibilityEnabled)
        return;
      const map = battleMap.value;
      const { width, height } = map;
      const grid = Array.from({ length: height }, () => Array(width).fill(false));
      const markVisible = (row, col, range) => {
        for (let r = Math.max(0, row - range); r <= Math.min(height - 1, row + range); r++) {
          for (let c = Math.max(0, col - range); c <= Math.min(width - 1, col + range); c++) {
            const dist = Math.abs(r - row) + Math.abs(c - col);
            if (dist <= range) {
              grid[r][c] = true;
            }
          }
        }
      };
      for (const char2 of map.players) {
        if (char2.hp > 0) {
          const visionRange = Math.max(char2.attackRange || 1, char2.moveSpeed || 1) + 1;
          markVisible(char2.row, char2.col, visionRange);
        }
      }
      for (const b of map.buildings) {
        if (b.hp > 0 && b.isPlayer) {
          markVisible(b.row, b.col, 4);
        }
      }
      map.visibilityGrid = grid;
    }
    function getCellVisibility(row, col) {
      if (!battleMap.value)
        return true;
      if (!battleMap.value.visibilityEnabled)
        return true;
      if (row < 0 || row >= battleMap.value.height || col < 0 || col >= battleMap.value.width)
        return false;
      return battleMap.value.visibilityGrid[row][col];
    }
    function isCellVisibleToActor(actor, row, col) {
      if (!battleMap.value || !battleMap.value.visibilityEnabled)
        return true;
      const visionRange = "moveRange" in actor ? Math.max(actor.attackRange || 1, actor.moveSpeed || 1) + 1 : 4;
      const dist = Math.abs(actor.row - row) + Math.abs(actor.col - col);
      return dist <= visionRange;
    }
    function filterVisibleTargets(actor, targets) {
      if (!battleMap.value || !battleMap.value.visibilityEnabled)
        return targets;
      return targets.filter((t) => isCellVisibleToActor(actor, t.row, t.col));
    }
    function generateFogAreas() {
      if (!battleMap.value)
        return;
      const { width, height, weather } = battleMap.value;
      battleMap.value.fogAreas = [];
      if (weather !== "fog" && weather !== "ghost_fog")
        return;
      const fogAreas = [];
      const usedPositions = /* @__PURE__ */ new Set();
      let config;
      if (weather === "ghost_fog") {
        config = { areaCount: 2, areaSize: 3 };
      } else {
        config = { areaCount: 3, areaSize: 2 };
      }
      for (let i = 0; i < config.areaCount; i++) {
        let attempts = 0;
        while (attempts < 50) {
          const startRow = Math.floor(Math.random() * (height - config.areaSize + 1));
          const startCol = Math.floor(Math.random() * (width - config.areaSize + 1));
          let valid = true;
          for (let r = 0; r < config.areaSize; r++) {
            for (let c = 0; c < config.areaSize; c++) {
              const key2 = `${startRow + r},${startCol + c}`;
              if (usedPositions.has(key2)) {
                valid = false;
                break;
              }
            }
            if (!valid)
              break;
          }
          if (valid) {
            for (let r = 0; r < config.areaSize; r++) {
              for (let c = 0; c < config.areaSize; c++) {
                const row = startRow + r;
                const col = startCol + c;
                const key2 = `${row},${col}`;
                usedPositions.add(key2);
                fogAreas.push({ row, col, source: "weather" });
              }
            }
            break;
          }
          attempts++;
        }
      }
      battleMap.value.fogAreas = fogAreas;
    }
    function isFogArea(row, col) {
      if (!battleMap.value)
        return false;
      return battleMap.value.fogAreas.some((f) => f.row === row && f.col === col);
    }
    function isCharacterInFog(char2) {
      return isFogArea(char2.row, char2.col);
    }
    function useCollectible(collectibleId, charId) {
      if (!battleMap.value)
        return false;
      const collectible = battleMap.value.collectibles.find((c) => c.id === collectibleId);
      if (!collectible)
        return false;
      const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
      const char2 = allChars.find((c) => c.id === charId);
      if (!char2)
        return false;
      const charTemplate = findCharacterTemplateInStore(char2.characterId);
      if (!charTemplate)
        return false;
      if (collectible.hpRestore) {
        const restoreAmount = Math.floor(charTemplate.maxHp * collectible.hpRestore / 100);
        char2.hp = Math.min(char2.hp + restoreAmount, charTemplate.maxHp);
      }
      if (collectible.mpRestore) {
        const restoreAmount = Math.floor(charTemplate.maxMp * collectible.mpRestore / 100);
        char2.mp = Math.min(char2.mp + restoreAmount, charTemplate.maxMp);
      }
      const idx = battleMap.value.collectibles.findIndex((c) => c.id === collectibleId);
      if (idx !== -1)
        battleMap.value.collectibles.splice(idx, 1);
      battleLog.value.push(`${charTemplate.name}\u3011\u4F7F{collectible.name}\uFF01`);
      return true;
    }
    function collectCollectible(collectibleId) {
      if (!battleMap.value)
        return false;
      const collectible = battleMap.value.collectibles.find((c) => c.id === collectibleId);
      if (!collectible)
        return false;
      const template = CONSUMABLE_TEMPLATES.find((t) => t.name === collectible.name);
      if (template) {
        battleMap.value.loot.push({ ...template, id: `loot_${Date.now()}`, count: 1 });
      }
      const idx = battleMap.value.collectibles.findIndex((c) => c.id === collectibleId);
      if (idx !== -1)
        battleMap.value.collectibles.splice(idx, 1);
      battleLog.value.push(`\u62FE\u53D6${collectible.name}\uFF01`);
      return true;
    }
    function createBattleCharacter(template, level, row, col, isPlayer) {
      const levelBonus = level - 1;
      const maxHp = Math.ceil(template.baseMaxHp * (1 + 0.2 * levelBonus));
      const maxMp = Math.ceil(template.baseMaxMp * (1 + 0.2 * levelBonus));
      const attack2 = Math.ceil(template.baseAttack * (1 + 0.2 * levelBonus));
      const defense = Math.ceil(template.baseDefense * (1 + 0.2 * levelBonus));
      const moveSpeed = template.moveSpeed !== void 0 ? template.moveSpeed : 2;
      const attackRange = template.attackRange !== void 0 ? template.attackRange : 1;
      const attackSpeed = template.attackSpeed !== void 0 ? template.attackSpeed : 1;
      const skillLastUsedTime = {};
      return {
        id: `${template.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        characterId: template.id,
        row,
        col,
        hp: maxHp,
        mp: maxMp,
        maxHp,
        maxMp,
        attack: attack2,
        defense,
        moveSpeed,
        attackRange,
        attackSpeed,
        isPlayer,
        faction: template.faction,
        job: template.job,
        level,
        statuses: [],
        skillLastUsedTime,
        totalDamage: 0,
        totalHeal: 0
      };
    }
    function autoUseCollectibleAtPosition(char2) {
      if (!battleMap.value)
        return false;
      const collectible = battleMap.value.collectibles.find(
        (c) => c.row === char2.row && c.col === char2.col
      );
      if (collectible) {
        const template = CONSUMABLE_TEMPLATES.find((t) => t.name === collectible.name);
        if (template) {
          battleMap.value.loot.push({ ...template, id: `loot_${Date.now()}`, count: 1 });
        }
        return useCollectible(collectible.id, char2.id);
      }
      return false;
    }
    function hasStatus(char2, status) {
      return char2.statuses?.some((s) => s.type === status) ?? false;
    }
    function getStatusStacks(char2, status) {
      if (!char2.statuses)
        return 0;
      return char2.statuses.filter((s) => s.type === status).length;
    }
    function getStatusAttackPercent(char2) {
      if (!char2.statuses || char2.statuses.length === 0)
        return 0;
      let total = 0;
      for (const s of char2.statuses) {
        const key2 = typeof s === "object" && s.type ? s.type : s;
        const cfg = STATUS_CONFIG[key2];
        if (cfg?.effects?.attackPercent)
          total += cfg.effects.attackPercent;
      }
      return total;
    }
    function getStatusDefensePercent(char2) {
      if (!char2.statuses || char2.statuses.length === 0)
        return 0;
      let total = 0;
      for (const s of char2.statuses) {
        const key2 = typeof s === "object" && s.type ? s.type : s;
        const cfg = STATUS_CONFIG[key2];
        if (cfg?.effects?.defensePercent)
          total += cfg.effects.defensePercent;
      }
      return total;
    }
    function getStatusMoveRange(char2) {
      if (!char2.statuses || char2.statuses.length === 0)
        return 0;
      let total = 0;
      for (const s of char2.statuses) {
        const key2 = typeof s === "object" && s.type ? s.type : s;
        const cfg = STATUS_CONFIG[key2];
        if (cfg?.effects?.moveSpeed)
          total += cfg.effects.moveSpeed;
      }
      return total;
    }
    function getStatusAttackRange(char2) {
      if (!char2.statuses || char2.statuses.length === 0)
        return 0;
      let total = 0;
      for (const s of char2.statuses) {
        const key2 = typeof s === "object" && s.type ? s.type : s;
        const cfg = STATUS_CONFIG[key2];
        if (cfg?.effects?.attackRange)
          total += cfg.effects.attackRange;
      }
      return total;
    }
    function getFactionAttackBonus(char2) {
      if (!battleMap.value)
        return 0;
      const shaQi = char2.isPlayer ? battleMap.value.playerShaQi : battleMap.value.enemyShaQi;
      if (shaQi >= 100)
        return 10;
      if (shaQi >= 60)
        return 5;
      return 0;
    }
    function getFactionDefenseBonus(char2) {
      if (!battleMap.value)
        return 0;
      const reiki = char2.isPlayer ? battleMap.value.playerReiki : battleMap.value.enemyReiki;
      if (reiki >= 100)
        return 40;
      if (reiki >= 60)
        return 20;
      return 0;
    }
    function computeAttackPower(attacker) {
      let attackPower2 = attacker.attack || 20;
      const statusAttack = getStatusAttackPercent(attacker);
      if (statusAttack !== 0)
        attackPower2 = Math.floor(attackPower2 * (1 + statusAttack / 100));
      if (attacker.attackBoost)
        attackPower2 = Math.floor(attackPower2 * (1 + attacker.attackBoost / 100));
      const factionAttackBonus = getFactionAttackBonus(attacker);
      if (factionAttackBonus !== 0)
        attackPower2 = Math.floor(attackPower2 * (1 + factionAttackBonus / 100));
      return Math.max(0, attackPower2);
    }
    function computeDefensePower(target) {
      let defense = target.defense || 5;
      const statusDefense = getStatusDefensePercent(target);
      if (statusDefense !== 0)
        defense = Math.floor(defense * (1 + statusDefense / 100));
      if (target.isDefending)
        defense = Math.floor(defense * 1.2);
      if (target.defenseReduction)
        defense = Math.floor(defense * (1 - target.defenseReduction / 100));
      if (target.defenseReductionPermanent)
        defense = Math.floor(defense * (1 - target.defenseReductionPermanent / 100));
      const factionDefenseBonus = getFactionDefenseBonus(target);
      if (factionDefenseBonus !== 0)
        defense = Math.floor(defense * (1 + factionDefenseBonus / 100));
      return Math.max(0, defense);
    }
    function getSelfStatusDuration(skill, index) {
      if (skill.selfStatusEffectsDurations?.[index] !== void 0) {
        return skill.selfStatusEffectsDurations[index];
      }
      if (skill.statusEffectDuration !== void 0) {
        return skill.statusEffectDuration;
      }
      return 0;
    }
    function addStatusToCharacter(char2, status, silent = false, duration = 0) {
      if (!char2.statuses)
        char2.statuses = [];
      const existingStatus = char2.statuses.find((s) => s.type === status);
      if (existingStatus) {
        if (duration > 0 && existingStatus.duration !== 0 && duration > existingStatus.duration) {
          existingStatus.duration = duration;
        }
        return;
      }
      char2.statuses.push({ type: status, duration });
      const statusConfig = STATUS_CONFIG[status];
      if (statusConfig?.effects?.maxHpPercent) {
        const origMaxHp = char2.maxHp;
        if (!char2.maxHpReductionHistory)
          char2.maxHpReductionHistory = {};
        char2.maxHpReductionHistory[status] = origMaxHp;
        char2.maxHp = Math.floor(origMaxHp * (1 + statusConfig.effects.maxHpPercent / 100));
        char2.hp = Math.min(char2.hp, char2.maxHp);
      }
      if (!silent && battleMap.value) {
        triggerStatusApplyEffect(char2.row, char2.col, status);
      }
      if (!silent) {
        const template = findCharacterTemplateInStore(char2.characterId);
        battleLog.value.push(`${template?.name || char2.characterId}\u3011\u8FDB\u5165{STATUS_CONFIG[status].name}\u3011\u72B6\u6001`);
      }
    }
    function removeStatusFromCharacter(char2, status) {
      if (!char2.statuses)
        return;
      const idx = char2.statuses.findIndex((s) => s.type === status);
      if (idx >= 0) {
        char2.statuses.splice(idx, 1);
        if (char2.maxHpReductionHistory && char2.maxHpReductionHistory[status]) {
          char2.maxHp = char2.maxHpReductionHistory[status];
          delete char2.maxHpReductionHistory[status];
        }
        const template = findCharacterTemplateInStore(char2.characterId);
        battleLog.value.push(`${template?.name || char2.characterId}\u3011\u89E3\u9664\u4E86{STATUS_CONFIG[status].name}\u3011\u72B6\u6001`);
      }
    }
    function triggerStatusOnAction(char2) {
      if (!char2)
        return;
      const template = findCharacterTemplateInStore(char2.characterId);
      if (hasStatus(char2, "poison")) {
        const damage = Math.max(1, Math.floor(char2.maxHp * 0.06));
        char2.hp -= damage;
        battleLog.value.push(`${template?.name || char2.characterId}\u3011\u56E0\u3010\u4E2D\u6BD2\u3011\u635F{damage}\u70B9\u751F\u547D\u503C`);
        if (char2.hp <= 0) {
          triggerDefeatAnimation(char2.row, char2.col, "self");
          triggerDeathEffect(char2.row, char2.col, template?.attribute || "normal");
          removeCharacterFromBattle(char2.id, char2.isPlayer);
          if (battleMap.value?.tiles[char2.row]?.[char2.col]) {
            battleMap.value.tiles[char2.row][char2.col].character = null;
          }
          battleLog.value.push(`${template?.name || char2.characterId}\u3011\u56E0\u3010\u4E2D\u6BD2\u3011\u8EAB\u4EA1\uFF01`);
          checkBattleEnd();
        }
      }
    }
    function triggerStatusOnTurnEnd(chars) {
      return;
    }
    function moveCharacter(battleCharId, row, col) {
      if (!battleMap.value)
        return false;
      const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
      const char2 = allChars.find((c) => c.id === battleCharId);
      if (!char2 || char2.hasMoved)
        return false;
      if (hasStatus(char2, "cold"))
        return false;
      const tile = battleMap.value.tiles[row]?.[col];
      if (!tile || !TERRAIN_CONFIG[tile.terrain]?.passable)
        return false;
      const occupied = allChars.find((c) => c.row === row && c.col === col && c.id !== battleCharId);
      if (occupied)
        return false;
      const building = battleMap.value.buildings.find((b) => b.row === row && b.col === col);
      if (building)
        return false;
      const moveRange = getCharacterMoveRange(char2);
      if (!moveRange.some((r) => r.row === row && r.col === col))
        return false;
      const distance = Math.abs(row - char2.row) + Math.abs(col - char2.col);
      char2.movedDistance = (char2.movedDistance || 0) + distance;
      const oldRow = char2.row;
      const oldCol = char2.col;
      char2.row = row;
      char2.col = col;
      char2.hasMoved = true;
      const charTemplate = findCharacterTemplateInStore(char2.characterId);
      const charName = charTemplate?.name || char2.characterId;
      battleLog.value.push(`${charName}\u3011\u4ECE(${oldRow},${oldCol})\u79FB\u52A8\u5230(${row},${col})`);
      triggerMoveTrail(oldRow, oldCol, row, col, char2.isPlayer);
      triggerStatusOnAction(char2);
      calculateVisibility();
      return true;
    }
    function getCharacterMoveRange(char2) {
      if (!battleMap.value)
        return [];
      if (isCharacterInSnow(char2)) {
        return [];
      }
      const range = [];
      const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
      const baseMove = char2.moveSpeed !== void 0 ? char2.moveSpeed : 3;
      let moveDist = Math.max(0, baseMove + getStatusMoveRange(char2));
      if (isCharacterInFog(char2)) {
        moveDist = Math.min(moveDist, 1);
      }
      const visited = Array(battleMap.value.height).fill(null).map(() => Array(battleMap.value.width).fill(false));
      const queue = [
        { row: char2.row, col: char2.col, distance: 0 }
      ];
      visited[char2.row][char2.col] = true;
      const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
      ];
      while (queue.length > 0) {
        const current = queue.shift();
        if (current.distance > 0) {
          range.push({ row: current.row, col: current.col });
        }
        if (current.distance >= moveDist) {
          continue;
        }
        for (const dir of directions) {
          const newRow = current.row + dir.row;
          const newCol = current.col + dir.col;
          if (newRow < 0 || newRow >= battleMap.value.height || newCol < 0 || newCol >= battleMap.value.width) {
            continue;
          }
          if (visited[newRow][newCol]) {
            continue;
          }
          const tile = battleMap.value.tiles[newRow]?.[newCol];
          if (!tile || !TERRAIN_CONFIG[tile.terrain]?.passable) {
            continue;
          }
          const occupied = allChars.find((ch) => ch.row === newRow && ch.col === newCol && ch.id !== char2.id);
          if (occupied) {
            continue;
          }
          const building = battleMap.value.buildings.find((b) => b.row === newRow && b.col === newCol);
          if (building) {
            continue;
          }
          visited[newRow][newCol] = true;
          queue.push({ row: newRow, col: newCol, distance: current.distance + 1 });
        }
      }
      return range;
    }
    function getAttackableTargets(char2) {
      if (!battleMap.value)
        return [];
      const targets = [];
      const baseAttackRange = char2.attackRange || 1;
      let attackRange = Math.max(0, baseAttackRange + getStatusAttackRange(char2));
      if (isCharacterInFog(char2)) {
        attackRange = Math.min(attackRange, 1);
      }
      if (char2.isPlayer) {
        battleMap.value.enemies.forEach((enemy) => {
          const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
          if (dist <= attackRange && isCellVisibleToActor(char2, enemy.row, enemy.col)) {
            targets.push(enemy);
          }
        });
        battleMap.value.buildings.forEach((building) => {
          if (!building.isPlayer) {
            const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
            if (dist <= attackRange && isCellVisibleToActor(char2, building.row, building.col)) {
              targets.push(building);
            }
          }
        });
      } else {
        battleMap.value.players.forEach((player2) => {
          const dist = Math.abs(player2.row - char2.row) + Math.abs(player2.col - char2.col);
          if (dist <= attackRange && isCellVisibleToActor(char2, player2.row, player2.col)) {
            targets.push(player2);
          }
        });
        battleMap.value.buildings.forEach((building) => {
          if (building.isPlayer) {
            const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
            if (dist <= attackRange && isCellVisibleToActor(char2, building.row, building.col)) {
              targets.push(building);
            }
          }
        });
      }
      for (let r = -attackRange; r <= attackRange; r++) {
        for (let c = -attackRange; c <= attackRange; c++) {
          const nr = char2.row + r;
          const nc = char2.col + c;
          if (nr >= 0 && nr < battleMap.value.height && nc >= 0 && nc < battleMap.value.width) {
            if (battleMap.value.tiles[nr]?.[nc]?.terrain === "obstacle") {
              const distance = Math.abs(r) + Math.abs(c);
              if (distance <= attackRange) {
                targets.push({
                  id: `obstacle_${nr}_${nc}`,
                  row: nr,
                  col: nc,
                  isObstacle: true
                });
              }
            }
          }
        }
      }
      return targets;
    }
    function getAttackableEnemies(char2) {
      if (!battleMap.value)
        return [];
      const targets = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
      const charTemplate = findCharacterTemplateInStore(char2.characterId);
      let attackRange = charTemplate?.baseAttackRange || 1;
      if (isCharacterInFog(char2)) {
        attackRange = Math.min(attackRange, 1);
      }
      const attackable = [];
      targets.forEach((target) => {
        const dist = Math.abs(target.row - char2.row) + Math.abs(target.col - char2.col);
        if (dist <= attackRange && isCellVisibleToActor(char2, target.row, target.col)) {
          attackable.push(target);
        }
      });
      return attackable;
    }
    function attack(attackerId, targetId) {
      if (!battleMap.value)
        return false;
      const attacker = [...battleMap.value.players, ...battleMap.value.enemies].find((c) => c.id === attackerId);
      if (!attacker || attacker.hasActed)
        return false;
      if (hasStatus(attacker, "fear"))
        return false;
      if (targetId.startsWith("obstacle_")) {
        const obstacleRow = parseInt(targetId.split("_")[1]);
        const obstacleCol = parseInt(targetId.split("_")[2]);
        if (battleMap.value.tiles[obstacleRow]?.[obstacleCol]?.terrain === "obstacle") {
          battleMap.value.tiles[obstacleRow][obstacleCol].terrain = "empty";
          const attackerTemplate2 = findCharacterTemplateInStore(attacker.characterId);
          battleLog.value.push(`${attackerTemplate2?.name || attacker.characterId}\u3011\u6467\u6BC1\u4E86\u969C\u788D\u7269\uFF01`);
          attacker.hasActed = true;
          triggerStatusOnAction(attacker);
          return true;
        }
        return false;
      }
      const target = [...battleMap.value.players, ...battleMap.value.enemies].find((c) => c.id === targetId);
      if (!target)
        return false;
      const attackerTemplate = findCharacterTemplateInStore(attacker.characterId);
      const targetTemplate = findCharacterTemplateInStore(target.characterId);
      const attackable = getAttackableEnemies(attacker);
      if (!attackable.find((t) => t.id === targetId))
        return false;
      const attackPower2 = computeAttackPower(attacker);
      const defense = computeDefensePower(target);
      const damage = Math.max(1, attackPower2 - defense);
      target.hp -= damage;
      if (attacker.totalDamage === void 0)
        attacker.totalDamage = 0;
      attacker.totalDamage += damage;
      const attackerAttribute = attackerTemplate?.attribute || "normal";
      const normalProjType = getProjectileTypeForNormalAttack(attackerAttribute);
      triggerProjectile(attacker.row, attacker.col, target.row, target.col, normalProjType, attackerAttribute);
      triggerSkillEffect(target.row, target.col, attackerAttribute, "small", "attack");
      battleLog.value.push(`${attackerTemplate?.name || attacker.characterId}\u3011\u653B\u51FB{targetTemplate?.name || target.characterId}\u3011\uFF0C\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
      attacker.hasActed = true;
      if (target.hp <= 0) {
        triggerDeathEffect(target.row, target.col, attackerAttribute);
        removeCharacterFromBattle(target.id, target.isPlayer);
        battleMap.value.tiles[target.row][target.col].character = null;
        const finalTargetTemplate = findCharacterTemplateInStore(target.characterId);
        battleLog.value.push(`${finalTargetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
      }
      if (battleMap.value.tiles[target.row]?.[target.col]?.terrain === "obstacle") {
        battleMap.value.tiles[target.row][target.col].terrain = "empty";
        battleLog.value.push(`${attackerTemplate?.name || attacker.characterId}\u3011\u653B\u51FB\u65F6\u6467\u6BC1\u4E86\u76EE\u6807\u4F4D\u7F6E\u7684\u969C\u788D\u7269\uFF01`);
      }
      triggerStatusOnAction(attacker);
      checkBattleEnd();
      return true;
    }
    function attackBuilding(attackerId, buildingId) {
      if (!battleMap.value)
        return false;
      const attacker = [...battleMap.value.players, ...battleMap.value.enemies].find((c) => c.id === attackerId);
      const building = battleMap.value.buildings.find((b) => b.id === buildingId);
      if (!attacker || !building || attacker.hasActed)
        return false;
      if (hasStatus(attacker, "fear"))
        return false;
      const attackable = getAttackableTargets(attacker);
      if (!attackable.find((t) => "type" in t && t.id === buildingId))
        return false;
      const attackerTemplate = findCharacterTemplateInStore(attacker.characterId);
      let attackPower2 = attackerTemplate?.baseAttack || 20;
      const damage = Math.max(1, attackPower2);
      building.hp -= damage;
      if (attacker.totalDamage === void 0)
        attacker.totalDamage = 0;
      attacker.totalDamage += damage;
      showFloatingText(building.row, building.col, damage, "damage");
      battleLog.value.push(`${attackerTemplate?.name || attacker.characterId}\u3011\u5BF9{building.name}\u3011\u9020\u6210 ${damage} \u70B9\u4F24\u5BB3`);
      if (building.type === "heart" && !building.hasSpawnedBonus) {
        building.hasSpawnedBonus = true;
        spawnVariantZombieFromHeart(building);
      }
      attacker.hasActed = true;
      if (building.hp <= 0) {
        removeBuildingFromBattle(buildingId);
        battleMap.value.tiles[building.row][building.col].building = null;
        battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
      }
      if (battleMap.value.tiles[building.row]?.[building.col]?.terrain === "obstacle") {
        battleMap.value.tiles[building.row][building.col].terrain = "empty";
        battleLog.value.push(`${attackerTemplate?.name || attacker.characterId}\u3011\u653B\u51FB\u5EFA\u7B51\u65F6\u6467\u6BC1\u4E86\u76EE\u6807\u4F4D\u7F6E\u7684\u969C\u788D\u7269\uFF01`);
      }
      triggerStatusOnAction(attacker);
      checkBattleEnd();
      return true;
    }
    function spawnOrdinaryZombieFromHeart(heartBuilding) {
      if (!battleMap.value)
        return;
      const zombieType = "ordinary_zombie";
      const zombieTemplate = HIREABLE_CHARACTERS.find((c) => c.id === zombieType);
      if (!zombieTemplate)
        return;
      const emptyPositions = getBuildingAdjacentEmptyPositions(heartBuilding);
      if (emptyPositions.length === 0)
        return;
      const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      let maxHp = zombieTemplate.maxHp;
      let maxMp = zombieTemplate.maxMp;
      let baseAttack = zombieTemplate.baseAttack ?? zombieTemplate.attack;
      let baseDefense = zombieTemplate.baseDefense ?? zombieTemplate.defense;
      let moveRange = zombieTemplate.moveSpeed || 2;
      let attackRange = zombieTemplate.attackRange || 1;
      const newZombie = {
        id: `zombie_${Date.now()}_${Math.random()}`,
        characterId: zombieType,
        row: pos.row,
        col: pos.col,
        hp: maxHp,
        mp: maxMp,
        maxHp,
        maxMp,
        attack: baseAttack,
        defense: baseDefense,
        baseAttack,
        baseDefense,
        moveRange,
        attackRange,
        hasMoved: false,
        hasActed: false,
        isDefending: false,
        isPlayer: false,
        level: battleMap.value.enemyLevel,
        statuses: [],
        faction: zombieTemplate.faction,
        job: zombieTemplate.job
      };
      battleMap.value.enemies.push(newZombie);
      battleMap.value.tiles[pos.row][pos.col].character = newZombie;
      battleLog.value.push(`\u8840\u5FC3\u751F\u6210\u4E86\u4E00\u53EA${zombieTemplate.name}\u3011\uFF01`);
    }
    function spawnVariantZombieFromHeart(heartBuilding) {
      if (!battleMap.value)
        return;
      const zombieTypes = ["fat_zombie", "swift_zombie", "long_tongue_zombie"];
      const randomType = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
      const zombieTemplate = HIREABLE_CHARACTERS.find((c) => c.id === randomType);
      if (!zombieTemplate)
        return;
      const emptyPositions = getBuildingAdjacentEmptyPositions(heartBuilding);
      if (emptyPositions.length === 0)
        return;
      const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      let maxHp = zombieTemplate.maxHp;
      let maxMp = zombieTemplate.maxMp;
      let baseAttack = zombieTemplate.baseAttack ?? zombieTemplate.attack;
      let baseDefense = zombieTemplate.baseDefense ?? zombieTemplate.defense;
      let moveRange = zombieTemplate.moveSpeed || 2;
      let attackRange = zombieTemplate.attackRange || 1;
      const newZombie = {
        id: `zombie_${Date.now()}_${Math.random()}`,
        characterId: randomType,
        row: pos.row,
        col: pos.col,
        hp: maxHp,
        mp: maxMp,
        maxHp,
        maxMp,
        attack: baseAttack,
        defense: baseDefense,
        baseAttack,
        baseDefense,
        moveRange,
        attackRange,
        hasMoved: false,
        hasActed: false,
        isDefending: false,
        isPlayer: false,
        level: battleMap.value.enemyLevel,
        statuses: [],
        faction: zombieTemplate.faction,
        job: zombieTemplate.job
      };
      battleMap.value.enemies.push(newZombie);
      battleMap.value.tiles[pos.row][pos.col].character = newZombie;
      battleLog.value.push(`\u8840\u5FC3\u53D7\u5230\u653B\u51FB\uFF0C\u989D\u5916\u4EA7\u51FA\u4E86\u4E00\u53EA${zombieTemplate.name}\u3011\uFF01`);
    }
    function trySpawnZombieFromHeart(building) {
      if (building.type === "heart" && !building.hasSpawnedBonus) {
        building.hasSpawnedBonus = true;
        spawnVariantZombieFromHeart(building);
      }
    }
    function spawnSoldierFromBarracks(barracksBuilding) {
      if (!battleMap.value)
        return;
      const soldierTemplates = HIREABLE_CHARACTERS.filter((c) => c.faction === "human" && c.job === "\u58EB\u5175");
      if (soldierTemplates.length === 0)
        return;
      const randomTemplate = soldierTemplates[Math.floor(Math.random() * soldierTemplates.length)];
      const emptyPositions = getBuildingAdjacentEmptyPositions(barracksBuilding);
      if (emptyPositions.length === 0)
        return;
      const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      let maxHp = randomTemplate.maxHp;
      let maxMp = randomTemplate.maxMp;
      const newSoldier = {
        id: `soldier_${Date.now()}_${Math.random()}`,
        characterId: randomTemplate.id,
        row: pos.row,
        col: pos.col,
        hp: maxHp,
        mp: maxMp,
        maxHp,
        maxMp,
        attack: randomTemplate.attack,
        defense: randomTemplate.defense,
        hasMoved: false,
        hasActed: false,
        isDefending: false,
        isPlayer: false,
        level: randomTemplate.level,
        statuses: [],
        faction: randomTemplate.faction,
        job: randomTemplate.job
      };
      battleMap.value.enemies.push(newSoldier);
      battleMap.value.tiles[pos.row][pos.col].character = newSoldier;
      battleLog.value.push(`\u5175\u8425\u751F\u6210\u4E86\u4E00\u540D\u3010\u654C${randomTemplate.name}\u3011\uFF01`);
    }
    function defend(charId) {
      if (!battleMap.value)
        return false;
      const char2 = [...battleMap.value.players, ...battleMap.value.enemies].find((c) => c.id === charId);
      if (!char2 || char2.hasActed)
        return false;
      if (hasStatus(char2, "fear"))
        return false;
      char2.hasMoved = true;
      char2.hasActed = true;
      char2.isDefending = true;
      const charTemplate = findCharacterTemplateInStore(char2.characterId);
      battleLog.value.push(`${charTemplate?.name || char2.characterId}\u3011\u8FDB\u5165\u9632\u5FA1\u59FF\u6001\uFF01`);
      return true;
    }
    function processHealSkill(attacker, skill, targetId) {
      if (!battleMap.value)
        return false;
      const charTemplate = findCharacterTemplateInStore(attacker.characterId);
      if (!charTemplate)
        return false;
      const isMultiTarget = Array.isArray(targetId);
      const targetIds = isMultiTarget ? [...targetId] : targetId ? [targetId] : [];
      const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
      if (skill.areaRange && skill.range === 0) {
        const areaRange = skill.areaRange;
        const aoeTargets = allyPool.filter((ally) => {
          const dist = Math.abs(ally.row - attacker.row) + Math.abs(ally.col - attacker.col);
          return dist <= areaRange;
        });
        let attackPower3 = charTemplate.attack || charTemplate.baseAttack || 20;
        let hpHealAmount2 = skill.power > 0 ? Math.floor(attackPower3 * (skill.power / 100)) : 0;
        let mpHealAmount2 = 0;
        if (skill.id === "fu_guang_lue_ying") {
          mpHealAmount2 = hpHealAmount2;
        } else if (skill.id === "yin_yang_qi_he") {
          hpHealAmount2 = 0;
          mpHealAmount2 = Math.floor(attackPower3 * (skill.power / 100));
        } else if (skill.id === "bi_hai_chao_sheng") {
          hpHealAmount2 = Math.floor(attackPower3 * 1.2);
          mpHealAmount2 = 0;
        } else if (skill.id === "kongshan_niaoyu") {
          hpHealAmount2 = Math.floor(attackPower3 * 0.5);
          mpHealAmount2 = Math.floor(attackPower3 * 0.2);
        } else if (skill.id === "di_mai_xuan_dun") {
          const selfMaxHp2 = charTemplate.maxHp || attacker.maxHp || 100;
          hpHealAmount2 = Math.floor(selfMaxHp2 * (skill.selfHealMaxHpPct || 0.09));
          mpHealAmount2 = 0;
        }
        const healedNames2 = [];
        let totalHealed2 = 0;
        const selfTemplate = findCharacterTemplateInStore(attacker.characterId);
        const selfMaxHp = selfTemplate?.maxHp || attacker.maxHp || 100;
        const selfMaxMp = selfTemplate?.maxMp || attacker.maxMp || 100;
        if (hpHealAmount2 > 0) {
          if (attacker.hp < selfMaxHp) {
            const oldHp = attacker.hp;
            attacker.hp = Math.min(attacker.hp + hpHealAmount2, selfMaxHp);
            const actualHeal = attacker.hp - oldHp;
            if (actualHeal > 0) {
              totalHealed2 += actualHeal;
              showFloatingText(attacker.row, attacker.col, actualHeal, "heal");
              healedNames2.push(selfTemplate?.name || attacker.characterId);
            }
          }
        }
        if (mpHealAmount2 > 0 && attacker.mp < selfMaxMp) {
          const oldMp = attacker.mp;
          attacker.mp = Math.min(attacker.mp + mpHealAmount2, selfMaxMp);
          const actualHeal = attacker.mp - oldMp;
          if (actualHeal > 0) {
            showFloatingText(attacker.row, attacker.col, actualHeal, "mp");
          }
        }
        for (const target of aoeTargets) {
          const targetTemplate = findCharacterTemplateInStore(target.characterId);
          const targetMaxHp = targetTemplate?.maxHp || target.maxHp || 100;
          const targetMaxMp = targetTemplate?.maxMp || target.maxMp || 100;
          if (hpHealAmount2 > 0) {
            const oldHp = target.hp;
            target.hp = Math.min(target.hp + hpHealAmount2, targetMaxHp);
            const actualHeal = target.hp - oldHp;
            if (actualHeal > 0) {
              totalHealed2 += actualHeal;
              showFloatingText(target.row, target.col, actualHeal, "heal");
              healedNames2.push(targetTemplate?.name || target.characterId);
            }
          }
          if (mpHealAmount2 > 0 && target.mp < targetMaxMp) {
            const oldMp = target.mp;
            target.mp = Math.min(target.mp + mpHealAmount2, targetMaxMp);
            const actualHeal = target.mp - oldMp;
            if (actualHeal > 0) {
              showFloatingText(target.row, target.col, actualHeal, "mp");
            }
          }
        }
        if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
          const statusNames = [];
          skill.selfStatusEffects.forEach((effect, index) => {
            const duration = getSelfStatusDuration(skill, index);
            addStatusToCharacter(attacker, effect, true, duration);
            statusNames.push(`${STATUS_CONFIG[effect]?.name || effect}${duration > 0 ? `${duration}\u79D2\uFF09` : ""}`);
          });
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u81EA\u8EAB\u83B7\u5F97{statusNames.join('\uFF0C')}\u3011\u72B6\u6001\uFF01`);
        }
        if (skill.id === "bi_hai_chao_sheng") {
        } else if (skill.id === "fu_guang_lue_ying") {
          for (const target of aoeTargets) {
            addStatusToCharacter(target, "swift", true);
          }
          addStatusToCharacter(attacker, "swift", true);
        } else if (skill.id === "yin_yang_qi_he") {
          for (const target of aoeTargets) {
            addStatusToCharacter(target, "tune", true);
          }
          addStatusToCharacter(attacker, "tune", true);
        }
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += totalHealed2;
        const healText = mpHealAmount2 > 0 && hpHealAmount2 > 0 ? `${hpHealAmount2}\u751F\u547D${mpHealAmount2}\u6CD5\u529B` : hpHealAmount2 > 0 ? `${hpHealAmount2}\u751F\u547D` : `${mpHealAmount2}\u6CD5\u529B`;
        if (healedNames2.length > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{healedNames.join('\uFF0C')}{healText}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u8303\u56F4\u5185\u6CA1\u6709\u9700\u8981\u6CBB\u7597\u7684\u76EE\u6807\uFF01`);
        }
        return true;
      }
      if (targetIds.length === 0 && skill.selfHealPct) {
        const healAmount2 = Math.floor(attacker.maxHp * skill.selfHealPct);
        attacker.hp = Math.min(attacker.hp + healAmount2, attacker.maxHp);
        if (attacker.totalHeal === void 0)
          attacker.totalHeal = 0;
        attacker.totalHeal += healAmount2;
        showFloatingText(attacker.row, attacker.col, healAmount2, "heal");
        battleLog.value.push(`\u81EA\u8EAB\u6062\u590D${healAmount2}\u70B9\u751F\u547D\u503C`);
        if (skill.selfMpHealPct) {
          const mpHealAmount2 = Math.floor(attacker.maxMp * skill.selfMpHealPct);
          attacker.mp = Math.min(attacker.mp + mpHealAmount2, attacker.maxMp);
          showFloatingText(attacker.row, attacker.col, mpHealAmount2, "mp");
          battleLog.value.push(`\u81EA\u8EAB\u6062\u590D${mpHealAmount2}\u70B9\u6CD5\u529B\u503C`);
        }
        if (skill.dispelAllDebuffs) {
          const dispelledStatuses = [];
          NEGATIVE_STATUSES.forEach((status) => {
            if (hasStatus(attacker, status)) {
              removeStatusFromCharacter(attacker, status);
              dispelledStatuses.push(STATUS_CONFIG[status]?.name || status);
            }
          });
          if (dispelledStatuses.length > 0) {
            battleLog.value.push(`\u9A71\u6563\u81EA\u8EAB\u6240\u6709\u8D1F\u9762\u72B6\u6001\uFF1A${dispelledStatuses.join("\uFF0C")}\u3011`);
          }
        } else if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
          const negStatuses = NEGATIVE_STATUSES.filter((status) => hasStatus(attacker, status));
          if (negStatuses.length > 0) {
            const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs);
            toDispel.forEach((status) => {
              removeStatusFromCharacter(attacker, status);
              battleLog.value.push(`\u9A71\u6563\u81EA\u8EAB${STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001`);
            });
          }
        }
        if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
          const duration = skill.statusEffectDuration || 0;
          skill.selfStatusEffects.forEach((status) => {
            addStatusToCharacter(attacker, status, false, duration);
            battleLog.value.push(`\u81EA\u8EAB\u83B7\u5F97\u3010${STATUS_CONFIG[status]?.name || status}\u3011\u72B6\u6001${duration > 0 ? `\uFF08\u6301\u7EED${duration}\u79D2\uFF09` : ""}`);
          });
        }
        return true;
      }
      const maxTargets = skill.targetCount || 1;
      const actualTargetIds = targetIds.slice(0, maxTargets);
      const targets = [];
      for (const tid of actualTargetIds) {
        const target = allyPool.find((p) => p.id === tid);
        if (target)
          targets.push(target);
      }
      if (targets.length === 0)
        return false;
      const attackPower2 = charTemplate.attack || charTemplate.baseAttack || 20;
      const healAmount = skill.power > 0 ? Math.floor(attackPower2 * (skill.power / 100)) : 0;
      let hpHealAmount = healAmount;
      let mpHealAmount = healAmount;
      if (skill.id === "ai_de_bao_bao") {
        const selfMaxHp = charTemplate.maxHp || 100;
        const selfMaxMp = charTemplate.maxMp || 100;
        const firstTarget = targets[0];
        const firstTargetTemplate = findCharacterTemplateInStore(firstTarget.characterId);
        const targetMaxHp = firstTargetTemplate?.maxHp || firstTarget.maxHp || 100;
        const targetMaxMp = firstTargetTemplate?.maxMp || firstTarget.maxMp || 100;
        hpHealAmount = Math.floor(selfMaxHp * 0.05 + targetMaxHp * 0.1);
        mpHealAmount = Math.floor(selfMaxMp * 0.05 + targetMaxMp * 0.1);
      } else if (skill.id === "ai_de_fei_wen") {
        const selfMaxHp = charTemplate.maxHp || 100;
        const firstTarget = targets[0];
        const firstTargetTemplate = findCharacterTemplateInStore(firstTarget.characterId);
        const targetMaxHp = firstTargetTemplate?.maxHp || firstTarget.maxHp || 100;
        hpHealAmount = Math.floor(selfMaxHp * 0.05 + targetMaxHp * 0.1);
        mpHealAmount = 0;
      } else if (skill.id === "ai_de_hui_yi") {
        hpHealAmount = Math.floor((charTemplate.maxHp || 100) * 0.1);
        mpHealAmount = Math.floor((charTemplate.maxMp || 100) * 0.1);
      } else if (skill.id === "miao_shou") {
        mpHealAmount = 0;
      } else if (skill.id === "tian_ya_qing_qing") {
        mpHealAmount = Math.floor((charTemplate.maxMp || 100) * 0.1);
      } else if (skill.id === "yu_yin_rao_liang") {
        hpHealAmount = Math.floor(attackPower2 * 1.1);
        mpHealAmount = Math.floor(attackPower2 * 0.4);
      } else if (skill.id === "feng_mo_qin_xin") {
        hpHealAmount = Math.floor(attackPower2 * 1.2);
        mpHealAmount = 0;
      } else if (skill.id === "mu_feng_wei_shang") {
        hpHealAmount = Math.floor(attackPower2 * 0.5);
        mpHealAmount = Math.floor(attackPower2 * 0.6);
      } else if (skill.id === "bi_hai_chao_sheng") {
        hpHealAmount = Math.floor(attackPower2 * 1.2);
        mpHealAmount = 0;
      } else if (skill.id === "tao_hua_zhuo_zhuo") {
        hpHealAmount = Math.floor(attackPower2 * 1.2);
        mpHealAmount = 0;
      } else if (skill.id === "nature_power") {
        hpHealAmount = Math.floor(attackPower2 * 0.6);
        mpHealAmount = 0;
      } else if (skill.id === "wu_di_niu_niu") {
        hpHealAmount = Math.floor(attackPower2 * 1);
        mpHealAmount = 0;
      }
      const healedNames = [];
      let totalHealed = 0;
      for (const target of targets) {
        const targetTemplate = findCharacterTemplateInStore(target.characterId);
        const targetMaxHp = targetTemplate?.maxHp || target.maxHp || 100;
        const targetMaxMp = targetTemplate?.maxMp || target.maxMp || 100;
        let currentHpHealAmount = hpHealAmount;
        let currentMpHealAmount = mpHealAmount;
        if (currentHpHealAmount > 0) {
          const oldHp = target.hp;
          target.hp = Math.min(target.hp + currentHpHealAmount, targetMaxHp);
          const realHeal = target.hp - oldHp;
          if (realHeal > 0) {
            totalHealed += realHeal;
            showFloatingText(target.row, target.col, realHeal, "heal");
            healedNames.push(targetTemplate?.name || target.characterId);
          }
        }
        if (currentMpHealAmount > 0 && target.mp < targetMaxMp) {
          const oldMp = target.mp;
          target.mp = Math.min(target.mp + currentMpHealAmount, targetMaxMp);
          const actualHeal = target.mp - oldMp;
          if (actualHeal > 0) {
            showFloatingText(target.row, target.col, actualHeal, "mp");
          }
        }
        if (skill.id === "ai_de_bao_bao" || skill.id === "ai_de_fei_wen" || skill.id === "ai_de_hui_yi" || skill.id === "jin_ji_zhi_liao" || skill.id === "zhi_yu_zhi_guang" || skill.id === "mu_feng_wei_shang" || skill.id === "wu_di_niu_niu" || skill.id === "miao_shou") {
          const dispelledStatuses = [];
          NEGATIVE_STATUSES.forEach((status) => {
            if (hasStatus(target, status)) {
              removeStatusFromCharacter(target, status);
              dispelledStatuses.push(STATUS_CONFIG[status]?.name || status);
            }
          });
          if (dispelledStatuses.length > 0) {
            battleLog.value.push(`\u9A71\u6563${targetTemplate?.name || target.characterId}\u3011\u7684{dispelledStatuses.join('\uFF0C')}\u3011\u72B6\u6001\uFF01`);
          }
        }
        if (skill.id === "tao_hua_zhuo_zhuo") {
          addStatusToCharacter(target, "heal", true);
        } else if (skill.id === "feng_mo_qin_xin") {
          addStatusToCharacter(target, "strong", true);
        } else if (skill.id === "yu_yin_rao_liang") {
          addStatusToCharacter(target, "tune", true);
        }
      }
      if (skill.id === "mu_feng_wei_shang") {
        const selfMaxHp = charTemplate.maxHp || 100;
        const selfMaxMp = charTemplate.maxMp || 100;
        attacker.hp = Math.min(attacker.hp + hpHealAmount, selfMaxHp);
        attacker.mp = Math.min(attacker.mp + mpHealAmount, selfMaxMp);
        totalHealed += hpHealAmount + mpHealAmount;
        healedNames.push(charTemplate?.name || attacker.characterId);
        showFloatingText(attacker.row, attacker.col, hpHealAmount, "heal");
      }
      if (skill.selfHealPct && attacker.hp < attacker.maxHp) {
        const selfHealAmount = Math.floor(attacker.maxHp * skill.selfHealPct);
        const oldHp = attacker.hp;
        attacker.hp = Math.min(attacker.hp + selfHealAmount, attacker.maxHp);
        const actualHeal = attacker.hp - oldHp;
        if (actualHeal > 0) {
          totalHealed += actualHeal;
          showFloatingText(attacker.row, attacker.col, actualHeal, "heal");
          if (!healedNames.includes(charTemplate?.name || attacker.characterId)) {
            healedNames.push(charTemplate?.name || attacker.characterId);
          }
        }
      }
      if (skill.selfMpHealPct && attacker.mp < attacker.maxMp) {
        const selfMpHealAmount = Math.floor(attacker.maxMp * skill.selfMpHealPct);
        const oldMp = attacker.mp;
        attacker.mp = Math.min(attacker.mp + selfMpHealAmount, attacker.maxMp);
        const actualMpHeal = attacker.mp - oldMp;
        if (actualMpHeal > 0) {
          showFloatingText(attacker.row, attacker.col, actualMpHeal, "mp");
        }
      }
      if (skill.dispelAllDebuffs) {
        const dispelledStatuses = [];
        NEGATIVE_STATUSES.forEach((status) => {
          if (hasStatus(attacker, status)) {
            removeStatusFromCharacter(attacker, status);
            dispelledStatuses.push(STATUS_CONFIG[status]?.name || status);
          }
        });
        if (dispelledStatuses.length > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u9A71\u6563\u6240\u6709\u8D1F\u9762\u72B6\u6001\uFF1A{dispelledStatuses.join('\uFF0C')}\u3011`);
        }
      }
      if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
        const negStatuses = NEGATIVE_STATUSES.filter((status) => hasStatus(attacker, status));
        if (negStatuses.length > 0) {
          const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs);
          toDispel.forEach((status) => {
            removeStatusFromCharacter(attacker, status);
          });
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u9A71\u6563{toDispel.map(s => STATUS_CONFIG[s]?.name || s).join('\uFF0C')}\u3011\u72B6\u6001`);
        }
      }
      if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
        const statusNames = [];
        skill.selfStatusEffects.forEach((effect, index) => {
          const duration = getSelfStatusDuration(skill, index);
          addStatusToCharacter(attacker, effect, true, duration);
          statusNames.push(`${STATUS_CONFIG[effect]?.name || effect}${duration > 0 ? `${duration}\u79D2\uFF09` : ""}`);
        });
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u83B7\u5F97{statusNames.join('\uFF0C')}\u3011\u72B6\u6001\uFF01`);
      }
      if (attacker.totalHeal === void 0)
        attacker.totalHeal = 0;
      attacker.totalHeal += totalHealed;
      if (healedNames.length > 0) {
        const healText = mpHealAmount > 0 ? `${hpHealAmount}\u751F\u547D${mpHealAmount}\u6CD5\u529B` : `${hpHealAmount}\u751F\u547D`;
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{healedNames.join('\uFF0C')}{healText}\uFF01`);
      } else {
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u6CA1\u6709\u627E\u5230\u6709\u6548\u76EE\u6807`);
      }
      return true;
    }
    function useSkill(skillId, attackerId, targetId) {
      if (!battleMap.value || !player.value)
        return false;
      const attacker = [...battleMap.value.players, ...battleMap.value.enemies].find((c) => c.id === attackerId);
      if (!attacker || attacker.hasActed)
        return false;
      const charTemplate = findCharacterTemplateInStore2(attacker.characterId);
      if (!charTemplate)
        return false;
      const skill = charTemplate.skills.find((s) => s.id === skillId);
      if (!skill)
        return false;
      if (attacker.isPlayer) {
        const attackerChar = player.value.characters.find((c) => c.id === attacker.characterId);
        if (attackerChar) {
          const playerSkill = attackerChar.skills.find((s) => s.id === skillId);
          if (!playerSkill || playerSkill.currentCooldown > 0)
            return false;
        } else {
          if (!attacker.skillCooldowns)
            attacker.skillCooldowns = {};
          if ((attacker.skillCooldowns[skillId] || 0) > 0)
            return false;
        }
      } else {
        if (!attacker.skillCooldowns)
          attacker.skillCooldowns = {};
        if ((attacker.skillCooldowns[skillId] || 0) > 0)
          return false;
      }
      if (attacker.mp < skill.mpCost)
        return false;
      if (skill.reikiCost && battleMap.value) {
        const currentReiki = attacker.isPlayer ? battleMap.value.playerReiki : battleMap.value.enemyReiki;
        if (currentReiki < skill.reikiCost)
          return false;
      }
      if (skill.shaQiCost && battleMap.value) {
        const currentShaQi = attacker.isPlayer ? battleMap.value.playerShaQi : battleMap.value.enemyShaQi;
        if (currentShaQi < skill.shaQiCost)
          return false;
      }
      if (skill.selfHpThreshold !== void 0) {
        const hpRatio = attacker.hp / (attacker.maxHp || 1);
        if (hpRatio < skill.selfHpThreshold)
          return false;
      }
      if (skill.requireHpGtAtk) {
        if (attacker.hp <= attacker.attack)
          return false;
      }
      if (skill.maxUsesPerBattle !== void 0) {
        if (!attacker.skillUseCount)
          attacker.skillUseCount = {};
        const currentUseCount = attacker.skillUseCount[skillId] || 0;
        if (currentUseCount >= skill.maxUsesPerBattle) {
          battleLog.value.push(`${attacker.characterId}\u3011\u7684{skill.name}\u3011\u5DF2\u8FBE\u5230\u672C\u5C40\u6218\u6597\u6700\u5927\u4F7F\u7528\u6B21${skill.maxUsesPerBattle}`);
          return false;
        }
      }
      if (skill.summonMaxCount && skill.summonCountId && battleMap.value) {
        const currentSide = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
        const existingCount = currentSide.filter((c) => c.characterId === skill.summonCountId).length;
        if (existingCount >= skill.summonMaxCount)
          return false;
      }
      if (hasStatus(attacker, "silenced"))
        return false;
      if (hasStatus(attacker, "fear"))
        return false;
      attacker.mp -= skill.mpCost;
      if (skill.reikiCost && battleMap.value) {
        if (attacker.isPlayer) {
          battleMap.value.playerReiki = Math.max(0, battleMap.value.playerReiki - skill.reikiCost);
        } else {
          battleMap.value.enemyReiki = Math.max(0, battleMap.value.enemyReiki - skill.reikiCost);
        }
      }
      if (skill.shaQiCost && battleMap.value) {
        if (attacker.isPlayer) {
          battleMap.value.playerShaQi = Math.max(0, battleMap.value.playerShaQi - skill.shaQiCost);
        } else {
          battleMap.value.enemyShaQi = Math.max(0, battleMap.value.enemyShaQi - skill.shaQiCost);
        }
      }
      if (skill.maxUsesPerBattle !== void 0) {
        if (!attacker.skillUseCount)
          attacker.skillUseCount = {};
        attacker.skillUseCount[skillId] = (attacker.skillUseCount[skillId] || 0) + 1;
      }
      const isMultiTarget = Array.isArray(targetId);
      const targetIds = isMultiTarget ? [...targetId] : targetId ? [targetId] : [];
      const singleTargetId = !isMultiTarget ? targetId : void 0;
      let targetPos = null;
      if (singleTargetId && singleTargetId.startsWith("pos_")) {
        const parts = singleTargetId.split("_");
        if (parts.length === 3) {
          targetPos = {
            row: parseInt(parts[1]),
            col: parseInt(parts[2])
          };
        }
      }
      if (singleTargetId && singleTargetId.startsWith("obstacle_")) {
        const parts = singleTargetId.split("_");
        if (parts.length === 3) {
          const row = parseInt(parts[1]);
          const col = parseInt(parts[2]);
          battleMap.value.tiles[row][col].terrain = "empty";
          const damage = Math.floor(skill.power / 100 * (charTemplate.attack || charTemplate.baseAttack || 20));
          if (skillId === "hong_hua_lv_ye") {
            const attackPower2 = computeAttackPower(attacker);
            const hpBuff = Math.floor(attackPower2 * 0.8);
            attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff;
            attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp);
            if (attacker.totalHeal === void 0)
              attacker.totalHeal = 0;
            attacker.totalHeal += hpBuff;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\u6467\u6BC1\u4E86\u4E00\u4E2A\u969C\u788D\u7269\uFF01\u751F\u547D\u503C\u4E0A${hpBuff}\u5E76\u6062{hpBuff}\u751F\u547D\uFF01`);
          } else if (skillId === "man_jia_chong_ji") {
            addStatusToCharacter(attacker, "resolute", true);
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\u6467\u6BC1\u4E86\u4E00\u4E2A\u969C\u788D\u7269\uFF01\u81EA\u8EAB\u8FDB\u5165\u3010\u521A\u6BC5\u3011\u72B6\u6001\uFF01`);
          } else {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\u6467\u6BC1\u4E86\u4E00\u4E2A\u969C\u788D\u7269\uFF01`);
          }
          attacker.hasActed = true;
          if (attacker.isPlayer) {
            const attackerChar = player.value.characters.find((c) => c.id === attacker.characterId);
            if (attackerChar) {
              const playerSkill = attackerChar.skills.find((s) => s.id === skillId);
              if (playerSkill)
                playerSkill.currentCooldown = skill.frequency || 1;
            }
          } else {
            if (!attacker.skillCooldowns)
              attacker.skillCooldowns = {};
            attacker.skillCooldowns[skillId] = skill.frequency || 1;
          }
          triggerStatusOnAction(attacker);
          return true;
        }
      }
      if (targetIds.length > 0) {
        const obstacleTargets = [];
        const remainingTargetIds = [];
        for (const tid of targetIds) {
          if (tid.startsWith("obstacle_")) {
            const parts = tid.split("_");
            if (parts.length === 3) {
              obstacleTargets.push({ row: parseInt(parts[1]), col: parseInt(parts[2]) });
            }
          } else {
            remainingTargetIds.push(tid);
          }
        }
        if (obstacleTargets.length > 0) {
          const attackPower2 = computeAttackPower(attacker);
          obstacleTargets.forEach((pos) => {
            if (battleMap.value) {
              battleMap.value.tiles[pos.row][pos.col].terrain = "empty";
            }
            triggerShake(pos.row, pos.col, "character");
            triggerSkillEffect(pos.row, pos.col, skill.attribute || "normal", "medium", skill.type);
          });
          const obstacleNames = obstacleTargets.map(() => "\u969C\u788D\u7269");
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6467\u6BC1{obstacleTargets.length}\u4E2A\u969C\u788D\u7269\uFF01`);
          if (remainingTargetIds.length === 0) {
            attacker.hasActed = true;
            if (attacker.isPlayer) {
              const attackerChar = player.value.characters.find((c) => c.id === attacker.characterId);
              if (attackerChar) {
                const playerSkill = attackerChar.skills.find((s) => s.id === skillId);
                if (playerSkill)
                  playerSkill.currentCooldown = skill.frequency || 1;
              }
            } else {
              if (!attacker.skillCooldowns)
                attacker.skillCooldowns = {};
              attacker.skillCooldowns[skillId] = skill.frequency || 1;
            }
            triggerStatusOnAction(attacker);
            return true;
          }
          targetIds.length = 0;
          targetIds.push(...remainingTargetIds);
        }
      }
      if (skill.category === "aoe") {
        let centerRow = attacker.row;
        let centerCol = attacker.col;
        if (targetId && targetId.startsWith("pos_")) {
          const [, rowStr, colStr] = targetId.split("_");
          centerRow = parseInt(rowStr);
          centerCol = parseInt(colStr);
        }
        processAOEAttackSkill(attacker, skill, centerRow, centerCol, charTemplate);
        const aoeSkillAttr = skill.attribute || "normal";
        const aoeSkillType = skill.type;
        triggerSkillEffect(attacker.row, attacker.col, aoeSkillAttr, "large", aoeSkillType);
        attacker.hasActed = true;
        if (attacker.isPlayer) {
          const attackerChar = player.value.characters.find((c) => c.id === attacker.characterId);
          if (attackerChar) {
            const playerSkill = attackerChar.skills.find((s) => s.id === skillId);
            if (playerSkill)
              playerSkill.currentCooldown = skill.frequency || 1;
          }
        } else {
          if (!attacker.skillCooldowns)
            attacker.skillCooldowns = {};
          attacker.skillCooldowns[skillId] = skill.frequency || 1;
        }
        triggerStatusOnAction(attacker);
        return true;
      }
      if (skill.category === "\u9677\u9635") {
        const result = processXianZhenSkill(attacker, skill, targetId, charTemplate);
        if (result) {
          return true;
        } else {
          return false;
        }
      }
      const healSkillIds = ["ai_de_bao_bao", "ai_de_fei_wen", "ai_de_hui_yi", "yu_yin_rao_liang", "feng_mo_qin_xin", "ning_xin_jue", "wan_gu_jie_jie", "fa_xiang_chong_yuan"];
      let skillHandled = false;
      if (healSkillIds.includes(skillId)) {
        processHealSkill(attacker, skill, targetId);
        skillHandled = true;
      }
      if (skillId === "shi_xin_shi_sui") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "tian_luo_di_wang") {
        if (targetId) {
          const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId];
          const attackPower2 = computeAttackPower(attacker);
          let totalDamageAll = 0;
          const damagedTargets = [];
          for (const tid of actualTargetIds) {
            let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === tid) : battleMap.value.players.filter((p) => p.id === tid);
            let buildingTargets = battleMap.value.buildings.filter((b) => b.id === tid && b.isPlayer !== attacker.isPlayer);
            if (charTargets.length > 0) {
              const target = charTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              totalDamageAll += damage;
              const tName = targetTemplate?.name || target.characterId;
              damagedTargets.push(tName);
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${tName}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
            } else if (buildingTargets.length > 0) {
              const targetBuilding2 = buildingTargets[0];
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              targetBuilding2.hp -= damage;
              totalDamageAll += damage;
              damagedTargets.push(targetBuilding2.name);
              triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
              showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
              if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
                targetBuilding2.hasSpawnedBonus = true;
                spawnVariantZombieFromHeart(targetBuilding2);
              }
              if (targetBuilding2.hp <= 0) {
                removeBuildingFromBattle2(targetBuilding2.id);
                battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
                battleLog.value.push(`${targetBuilding2.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += totalDamageAll;
          if (damagedTargets.length > 0) {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{damagedTargets.join('\uFF0C')}\u3011\u5206\u522B\u9020\u6210\u4F24\u5BB3\u5E76\u9677\u5165\u3010\u7638\u817F\u3011\u72B6\u6001`);
          } else {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u6CA1\u6709\u547D\u4E2D\u6709\u6548\u76EE\u6807`);
          }
        }
      }
      if (skillId === "tao_zhi_yao_yao") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u8FF7\u79BB\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      const healSkillIds2 = ["tao_hua_zhuo_zhuo", "fu_guang_lue_ying", "yin_yang_qi_he"];
      if (healSkillIds2.includes(skillId)) {
        processHealSkill(attacker, skill, targetId);
        skillHandled = true;
      }
      if (skillId === "cang_jian_yi_ye") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u8FF7\u79BB\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      const healSkillIds3 = ["mu_feng_wei_shang"];
      if (healSkillIds3.includes(skillId)) {
        processHealSkill(attacker, skill, targetId);
        skillHandled = true;
      }
      if (skillId === "nu_za_hu_lu") {
        if (targetId) {
          const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId];
          const attackPower2 = computeAttackPower(attacker);
          let totalDamageAll = 0;
          const damagedTargets = [];
          for (const tid of actualTargetIds) {
            let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === tid) : battleMap.value.players.filter((p) => p.id === tid);
            let buildingTargets = battleMap.value.buildings.filter((b) => b.id === tid && b.isPlayer !== attacker.isPlayer);
            if (charTargets.length > 0) {
              const target = charTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              totalDamageAll += damage;
              const tName = targetTemplate?.name || target.characterId;
              damagedTargets.push(tName);
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${tName}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
            } else if (buildingTargets.length > 0) {
              const targetBuilding2 = buildingTargets[0];
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              targetBuilding2.hp -= damage;
              totalDamageAll += damage;
              damagedTargets.push(targetBuilding2.name);
              triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
              showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
              if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
                targetBuilding2.hasSpawnedBonus = true;
                spawnVariantZombieFromHeart(targetBuilding2);
              }
              if (targetBuilding2.hp <= 0) {
                removeBuildingFromBattle2(targetBuilding2.id);
                battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
                battleLog.value.push(`${targetBuilding2.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += totalDamageAll;
          if (damagedTargets.length > 0) {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{damagedTargets.join('\uFF0C')}\u3011\u5206\u522B\u9020\u6210\u4F24\u5BB3\u5E76\u8FDB\u5165\u3010\u8106\u76AE\u3011\u72B6\u6001`);
          } else {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u6CA1\u6709\u547D\u4E2D\u6709\u6548\u76EE\u6807`);
          }
        }
      }
      const healSkillIds4 = ["bi_hai_chao_sheng"];
      if (healSkillIds4.includes(skillId)) {
        processHealSkill(attacker, skill, targetId);
        skillHandled = true;
      }
      if (skillId === "mo_ying_jian_guang") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "you_ju_xi_tian") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "shui_man_jin_shan") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
        if (attacker.isPlayer) {
          const attackerChar = player.value.characters.find((c) => c.id === attacker.characterId);
          if (attackerChar) {
            const playerSkill = attackerChar.skills.find((s) => s.id === skillId);
            if (playerSkill)
              playerSkill.currentCooldown = skill.frequency || 1;
          }
        } else {
          if (!attacker.skillCooldowns)
            attacker.skillCooldowns = {};
          attacker.skillCooldowns[skillId] = skill.frequency || 1;
        }
        triggerStatusOnAction(attacker);
        return true;
      }
      if (skillId === "hong_lian_hua_huo") {
        const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const buildingPool = battleMap.value.buildings.filter((b) => b.isPlayer !== attacker.isPlayer);
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        let handled = 0;
        if (targetId) {
          const actualIds = Array.isArray(targetId) ? targetId.slice(0, 1) : [targetId];
          for (const tid of actualIds) {
            const target = enemyPool.find((p) => p.id === tid);
            if (target) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              addStatusToCharacter(target, "burning", true);
              damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\u5E76\u4F7F\u5176\u9677\u5165\u3010\u71C3\u70E7\u3011\u72B6\u6001`);
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
              handled++;
            } else {
              const building = buildingPool.find((b) => b.id === tid);
              if (building) {
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
                building.hp -= damage;
                if (attacker.totalDamage === void 0)
                  attacker.totalDamage = 0;
                attacker.totalDamage += damage;
                triggerShake(building.row, building.col, "building");
                showFloatingText(building.row, building.col, damage, "damage");
                damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
                if (building.hp <= 0) {
                  removeBuildingFromBattle2(building.id);
                  battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
                }
                handled++;
              }
            }
          }
        }
        if (handled > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u672A\u547D\u4E2D\u4EFB\u4F55\u76EE\u6807\uFF01`);
        }
      }
      if (skillId === "she_jian_du_wen") {
        const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const buildingPool = battleMap.value.buildings.filter((b) => b.isPlayer !== attacker.isPlayer);
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        let handled = 0;
        if (targetId) {
          const actualIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId];
          for (const tid of actualIds) {
            const target = enemyPool.find((p) => p.id === tid);
            if (target) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              addStatusToCharacter(target, "bleeding", true);
              damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\u5E76\u4F7F\u5176\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001`);
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
              handled++;
            } else {
              const building = buildingPool.find((b) => b.id === tid);
              if (building) {
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
                building.hp -= damage;
                if (attacker.totalDamage === void 0)
                  attacker.totalDamage = 0;
                attacker.totalDamage += damage;
                triggerShake(building.row, building.col, "building");
                showFloatingText(building.row, building.col, damage, "damage");
                damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
                if (building.hp <= 0) {
                  removeBuildingFromBattle2(building.id);
                  battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
                }
                handled++;
              }
            }
          }
        }
        if (handled > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u672A\u547D\u4E2D\u4EFB\u4F55\u76EE\u6807\uFF01`);
        }
      }
      if (skillId === "xie_shen_di_yu") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "rao_luan_xin_shen") {
        let targetPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        let buildingPool = battleMap.value.buildings.filter((b) => b.isPlayer !== attacker.isPlayer);
        const damageResults = [];
        let handled = 0;
        const attackPower2 = attacker.attack;
        const validTargets = targetPool.filter((t) => t.id !== attacker.id && Math.abs(t.row - attacker.row) + Math.abs(t.col - attacker.col) <= 2);
        let chosenId = singleTargetId;
        if (chosenId && chosenId !== "empty") {
          const found = validTargets.find((t) => t.id === chosenId);
          if (!found)
            chosenId = "";
        }
        if (!chosenId || chosenId === "empty") {
          if (validTargets.length > 0) {
            const sorted = [...validTargets].sort((a, b) => b.attack - a.attack);
            chosenId = sorted[0].id;
          }
        }
        for (const tid of chosenId ? [chosenId] : []) {
          const target = targetPool.find((t) => t.id === tid);
          if (target) {
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - target.defense));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            triggerShake(target.row, target.col, "enemy");
            showFloatingText(target.row, target.col, damage, "damage");
            const positiveStatuses = Object.keys(STATUS_CONFIG).filter(
              (sid) => STATUS_CONFIG[sid]?.tag === "positive"
            );
            let dispelCount = 0;
            for (const sid of positiveStatuses) {
              const st = target.statuses?.find((s) => s.type === sid);
              if (st) {
                target.statuses = target.statuses.filter((s) => s.type !== sid);
                dispelCount++;
              }
            }
            let log = `\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`;
            if (dispelCount > 0)
              log += `\uFF0C\u5E76\u9A71\u6563${dispelCount}\u4E2A\u6B63\u9762\u72B6\u6001`;
            damageResults.push(log);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
            handled++;
          } else {
            const building = buildingPool.find((b) => b.id === tid);
            if (building) {
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              building.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(building.row, building.col, "building");
              showFloatingText(building.row, building.col, damage, "damage");
              damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
              if (building.hp <= 0) {
                removeBuildingFromBattle2(building.id);
                battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
              handled++;
            }
          }
        }
        if (handled > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u672A\u547D\u4E2D\u4EFB\u4F55\u76EE\u6807\uFF01`);
        }
      }
      if (skillId === "yi_jian_ting_yu") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
        addStatusToCharacter(attacker, "strong", true);
        addStatusToCharacter(attacker, "swift", true);
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u81EA\u8EAB\u83B7\u5F97\u3010\u5F3A\u529B\u3011\u548C\u3010\u8FC5\u6377\u3011\u72B6\u6001`);
      }
      if (skillId === "ling_yun_fei_jian") {
        const range = skill.range || 3;
        const maxTargets = skill.targetCount || 3;
        const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const buildingPool = battleMap.value.buildings.filter((b) => b.isPlayer !== attacker.isPlayer);
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        let handled = 0;
        if (targetIds && targetIds.length > 0) {
          const actualIds = [...targetIds].slice(0, maxTargets);
          for (const tid of actualIds) {
            const target = enemyPool.find((p) => {
              if (p.id !== tid)
                return false;
              const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col);
              return dist <= range;
            });
            if (target) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
              handled++;
            } else {
              const building = buildingPool.find((b) => {
                if (b.id !== tid)
                  return false;
                const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col);
                return dist <= range;
              });
              if (building) {
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
                building.hp -= damage;
                if (attacker.totalDamage === void 0)
                  attacker.totalDamage = 0;
                attacker.totalDamage += damage;
                triggerShake(building.row, building.col, "building");
                showFloatingText(building.row, building.col, damage, "damage");
                damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
                if (building.hp <= 0) {
                  removeBuildingFromBattle2(building.id);
                  battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
                }
                handled++;
              }
            }
          }
        }
        if (handled > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u672A\u547D\u4E2D\u4EFB\u4F55\u76EE\u6807\uFF01`);
        }
      }
      if (skillId === "ju_qi_cheng_ren") {
        const range = skill.range || 3;
        const maxTargets = skill.targetCount || 2;
        const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const buildingPool = battleMap.value.buildings.filter((b) => b.isPlayer !== attacker.isPlayer);
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        let handled = 0;
        if (targetIds && targetIds.length > 0) {
          const actualIds = [...targetIds].slice(0, maxTargets);
          for (const tid of actualIds) {
            const target = enemyPool.find((p) => {
              if (p.id !== tid)
                return false;
              const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col);
              return dist <= range;
            });
            if (target) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
              handled++;
            } else {
              const building = buildingPool.find((b) => {
                if (b.id !== tid)
                  return false;
                const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col);
                return dist <= range;
              });
              if (building) {
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
                building.hp -= damage;
                if (attacker.totalDamage === void 0)
                  attacker.totalDamage = 0;
                attacker.totalDamage += damage;
                triggerShake(building.row, building.col, "building");
                showFloatingText(building.row, building.col, damage, "damage");
                damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
                if (building.hp <= 0) {
                  removeBuildingFromBattle2(building.id);
                  battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
                }
                handled++;
              }
            }
          }
        }
        if (handled > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u672A\u547D\u4E2D\u4EFB\u4F55\u76EE\u6807\uFF01`);
        }
      }
      if (skillId === "yin_yang_kui_lei_shu") {
        const range = skill.range || 3;
        const maxTargets = skill.targetCount || 1;
        const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const buildingPool = battleMap.value.buildings.filter((b) => b.isPlayer !== attacker.isPlayer);
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        let handled = 0;
        if (targetIds && targetIds.length > 0) {
          const actualIds = [...targetIds].slice(0, maxTargets);
          for (const tid of actualIds) {
            const target = enemyPool.find((p) => {
              if (p.id !== tid)
                return false;
              const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col);
              return dist <= range;
            });
            if (target) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF0C\u5E76\u9677\u5165\u3010\u8106\u5F31\u3011\u72B6\u6001`);
              addStatusToCharacter(target, "fragile");
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
              handled++;
            } else {
              const building = buildingPool.find((b) => {
                if (b.id !== tid)
                  return false;
                const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col);
                return dist <= range;
              });
              if (building) {
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
                building.hp -= damage;
                if (attacker.totalDamage === void 0)
                  attacker.totalDamage = 0;
                attacker.totalDamage += damage;
                triggerShake(building.row, building.col, "building");
                showFloatingText(building.row, building.col, damage, "damage");
                damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
                if (building.hp <= 0) {
                  removeBuildingFromBattle2(building.id);
                  battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
                }
                handled++;
              }
            }
          }
        }
        if (handled > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u672A\u547D\u4E2D\u4EFB\u4F55\u76EE\u6807\uFF01`);
        }
      }
      if (skillId === "meng_hu_xia_shan") {
        const range = skill.range || 1;
        const maxTargets = skill.targetCount || 1;
        const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const buildingPool = battleMap.value.buildings.filter((b) => b.isPlayer !== attacker.isPlayer);
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        let handled = 0;
        if (targetIds && targetIds.length > 0) {
          const actualIds = [...targetIds].slice(0, maxTargets);
          for (const tid of actualIds) {
            const target = enemyPool.find((p) => {
              if (p.id !== tid)
                return false;
              const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col);
              return dist <= range;
            });
            if (target) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
              handled++;
            } else {
              const building = buildingPool.find((b) => {
                if (b.id !== tid)
                  return false;
                const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col);
                return dist <= range;
              });
              if (building) {
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
                building.hp -= damage;
                if (attacker.totalDamage === void 0)
                  attacker.totalDamage = 0;
                attacker.totalDamage += damage;
                triggerShake(building.row, building.col, "building");
                showFloatingText(building.row, building.col, damage, "damage");
                damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
                if (building.hp <= 0) {
                  removeBuildingFromBattle2(building.id);
                  battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
                }
                handled++;
              }
            }
          }
        }
        if (handled > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u672A\u547D\u4E2D\u4EFB\u4F55\u76EE\u6807\uFF01`);
        }
      }
      if (skillId === "meng_hu_si_hou") {
        const range = skill.range || 3;
        const maxTargets = skill.targetCount || 2;
        const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const buildingPool = battleMap.value.buildings.filter((b) => b.isPlayer !== attacker.isPlayer);
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        let handled = 0;
        if (targetIds && targetIds.length > 0) {
          const actualIds = [...targetIds].slice(0, maxTargets);
          for (const tid of actualIds) {
            const target = enemyPool.find((p) => {
              if (p.id !== tid)
                return false;
              const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col);
              return dist <= range;
            });
            if (target) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF0C\u5E76\u9677\u5165\u3010\u8106\u5F31\u3011\u72B6\u6001`);
              addStatusToCharacter(target, "fragile");
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
              handled++;
            } else {
              const building = buildingPool.find((b) => {
                if (b.id !== tid)
                  return false;
                const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col);
                return dist <= range;
              });
              if (building) {
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
                building.hp -= damage;
                if (attacker.totalDamage === void 0)
                  attacker.totalDamage = 0;
                attacker.totalDamage += damage;
                triggerShake(building.row, building.col, "building");
                showFloatingText(building.row, building.col, damage, "damage");
                damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
                if (building.hp <= 0) {
                  removeBuildingFromBattle2(building.id);
                  battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
                }
                handled++;
              }
            }
          }
        }
        if (handled > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u672A\u547D\u4E2D\u4EFB\u4F55\u76EE\u6807\uFF01`);
        }
      }
      if (skillId === "yuan_cheng_dao_dan") {
        let centerRow = attacker.row;
        let centerCol = attacker.col;
        if (targetPos) {
          centerRow = targetPos.row;
          centerCol = targetPos.col;
        } else if (singleTargetId && singleTargetId !== "empty") {
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
          const targetChar = allChars.find((c) => c.id === singleTargetId);
          if (targetChar) {
            centerRow = targetChar.row;
            centerCol = targetChar.col;
          } else {
            const targetBuilding2 = battleMap.value.buildings.find((b) => b.id === singleTargetId);
            if (targetBuilding2) {
              centerRow = targetBuilding2.row;
              centerCol = targetBuilding2.col;
            }
          }
        }
        processAOEAttackSkill(attacker, skill, centerRow, centerCol, charTemplate);
      }
      if (skillId === "qian_li_bing_feng") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "fierce_attack") {
        let hadValidTargets = false;
        if (targetId) {
          const targets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          hadValidTargets = targets.length > 0;
          if (targets.length > 0) {
            const target = targets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 + (skill.hpPct || 0) * attacker.hp - defense));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
            const range1 = 1;
            let destroyedCount = 0;
            for (let r = -range1; r <= range1; r++) {
              for (let c = -range1; c <= range1; c++) {
                const nr = attacker.row + r;
                const nc = attacker.col + c;
                const distance = Math.abs(r) + Math.abs(c);
                if (nr >= 0 && nr < battleMap.value.height && nc >= 0 && nc < battleMap.value.width) {
                  if (distance <= range1 && battleMap.value.tiles[nr]?.[nc]?.terrain === "obstacle") {
                    battleMap.value.tiles[nr][nc].terrain = "empty";
                    destroyedCount++;
                  }
                }
              }
            }
            if (destroyedCount > 0) {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6467\u6BC1{destroyedCount}\u4E2A\u969C\u788D\u7269\uFF01`);
            }
          }
        }
      }
      if (skillId === "shadow_assassination") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      } else if (skillId === "throw_grenade") {
        let centerRow = attacker.row;
        let centerCol = attacker.col;
        if (targetPos) {
          centerRow = targetPos.row;
          centerCol = targetPos.col;
        } else if (singleTargetId && singleTargetId !== "empty") {
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
          const targetChar = allChars.find((c) => c.id === singleTargetId);
          if (targetChar) {
            centerRow = targetChar.row;
            centerCol = targetChar.col;
          } else {
            const targetBuilding2 = battleMap.value.buildings.find((b) => b.id === singleTargetId);
            if (targetBuilding2) {
              centerRow = targetBuilding2.row;
              centerCol = targetBuilding2.col;
            }
          }
        }
        const areaRange = skill.areaRange || 1;
        const enemyChars = attacker.isPlayer ? battleMap.value.enemies.filter((enemy) => {
          const dist = Math.abs(enemy.row - centerRow) + Math.abs(enemy.col - centerCol);
          return dist <= areaRange && isCellVisibleToActor(attacker, enemy.row, enemy.col);
        }) : battleMap.value.players.filter((playerChar) => {
          const dist = Math.abs(playerChar.row - centerRow) + Math.abs(playerChar.col - centerCol);
          return dist <= areaRange && isCellVisibleToActor(attacker, playerChar.row, playerChar.col);
        });
        const enemyBuildings = battleMap.value.buildings.filter((building) => {
          const dist = Math.abs(building.row - centerRow) + Math.abs(building.col - centerCol);
          return dist <= areaRange && building.isPlayer !== attacker.isPlayer && isCellVisibleToActor(attacker, building.row, building.col);
        });
        const obstaclePositions = [];
        const aoeGridPositions = [];
        for (let dr = -areaRange; dr <= areaRange; dr++) {
          for (let dc = -areaRange; dc <= areaRange; dc++) {
            const dist = Math.abs(dr) + Math.abs(dc);
            if (dist <= areaRange) {
              const r = centerRow + dr;
              const c = centerCol + dc;
              if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
                aoeGridPositions.push({ row: r, col: c });
                if (battleMap.value.tiles[r][c].terrain === "obstacle") {
                  obstaclePositions.push({ row: r, col: c });
                }
              }
            }
          }
        }
        triggerAOEEffects(centerRow, centerCol, areaRange, skill.attribute || "normal", "diamond", "attack", "\u8F70\u70B8");
        const projType = getProjectileTypeForSkill(skill);
        if (projType) {
          triggerProjectile(attacker.row, attacker.col, centerRow, centerCol, projType, skill.attribute || "fire");
        }
        const hadValidTargets = enemyChars.length > 0 || enemyBuildings.length > 0 || obstaclePositions.length > 0;
        const damageResults = [];
        enemyChars.forEach((target) => {
          const targetTemplate = findCharacterTemplateInStore2(target.characterId);
          const attackPower2 = computeAttackPower(attacker);
          const defense = computeDefensePower(target);
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
          target.hp -= damage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += damage;
          triggerShake(target.row, target.col, "character");
          triggerHitFlash(target.row, target.col);
          showFloatingText(target.row, target.col, damage, "damage");
          damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
          if (target.hp <= 0) {
            removeCharacterFromBattle2(target.id, target.isPlayer);
            triggerDefeatAnimation(target.row, target.col, "kill");
            battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
          }
        });
        enemyBuildings.forEach((building) => {
          const attackPower2 = computeAttackPower(attacker);
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
          building.hp -= damage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += damage;
          triggerShake(building.row, building.col, "building");
          triggerHitFlash(building.row, building.col, attribute);
          showFloatingText(building.row, building.col, damage, "damage", attribute, true);
          damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
          if (building.type === "heart" && !building.hasSpawnedBonus) {
            building.hasSpawnedBonus = true;
            spawnVariantZombieFromHeart(building);
          }
          if (building.hp <= 0) {
            removeBuildingFromBattle2(building.id);
            triggerDefeatAnimation(building.row, building.col, "kill");
            battleLog.value.push(`${building.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
          }
        });
        obstaclePositions.forEach((pos) => {
          battleMap.value.tiles[pos.row][pos.col].terrain = "empty";
          triggerShake(pos.row, pos.col, "terrain");
          damageResults.push("\u6467\u6BC1\u4E86\u4E00\u4E2A\u969C\u788D\u7269");
        });
        if (hadValidTargets) {
          const summary = damageResults.join("\uFF0C");
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\u547D${enemyChars.length + enemyBuildings.length + obstaclePositions.length} \u4E2A\u76EE\u6807\uFF1A${summary}`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u8303\u56F4\u5185\u6CA1\u6709\u53EF\u653B\u51FB\u76EE\u6807`);
        }
      }
      if (skillId === "spit_slime") {
        if (targetId) {
          const targets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          if (targets.length > 0) {
            const target = targets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01{targetTemplate?.name || target.characterId}\u3011\u8FDB\u5165\u3010\u865A\u5F31\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          }
        }
      }
      if (skillId === "er_ye_pao_xiao") {
        if (targetId) {
          const targets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          if (targets.length > 0) {
            const target = targets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF0C\u81EA\u8EAB\u8FDB\u5165\u3010\u6124\u6012\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          }
        }
      }
      if (skillId === "xie_e_kun_bang") {
        if (targetId) {
          const targets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          if (targets.length > 0) {
            const target = targets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01{targetTemplate?.name || target.characterId}\u3011\u9677\u5165\u3010\u7981\u9522\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          }
        }
      }
      if (skillId === "life_drain") {
        if (targetId) {
          const targets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          if (targets.length > 0) {
            const target = targets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            const healAmount = Math.floor(damage * (skill.lifesteal || 0.333));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01`);
            const attackerCharTemplate = findCharacterTemplateInStore2(attacker.characterId);
            const maxHp = attackerCharTemplate?.maxHp || attackerCharTemplate?.baseMaxHp || 100;
            attacker.hp = Math.min(attacker.hp + healAmount, maxHp);
            if (attacker.totalHeal === void 0)
              attacker.totalHeal = 0;
            attacker.totalHeal += healAmount;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u6062\u590D\u4E86${healAmount}\u70B9\u751F\u547D\u503C\uFF08\u9020\u6210\u4F24\u5BB33%\uFF09\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          }
        }
      }
      if (skillId === "xi_rang_zai_sheng") {
        if (targetId) {
          const targets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          if (targets.length > 0) {
            const target = targets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            const healAmount = Math.floor(0.6 * (charTemplate.attack || charTemplate.baseAttack || 20));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            triggerShake(target.row, target.col, "character");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01`);
            const attackerCharTemplate = findCharacterTemplateInStore2(attacker.characterId);
            const maxHp = attackerCharTemplate?.maxHp || attackerCharTemplate?.baseMaxHp || 100;
            attacker.hp = Math.min(attacker.hp + healAmount, maxHp);
            if (attacker.totalHeal === void 0)
              attacker.totalHeal = 0;
            attacker.totalHeal += healAmount;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u6062\u590D\u4E86${healAmount}\u70B9\u751F\u547D\u503C\uFF01`);
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u8FDB\u5165\u3010\u521A\u6BC5\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          }
        }
      } else if (skillId === "bing_feng_zhi_men") {
        let createdCount = 0;
        const maxTargets = skill.targetCount || 2;
        const map = battleMap.value;
        for (let i = 0; i < Math.min(targetIds.length, maxTargets); i++) {
          const tid = targetIds[i];
          if (!tid || !tid.startsWith("pos_"))
            continue;
          const parts = tid.split("_");
          if (parts.length !== 3)
            continue;
          const r = parseInt(parts[1]);
          const c = parseInt(parts[2]);
          if (isNaN(r) || isNaN(c))
            continue;
          if (r < 0 || r >= map.height || c < 0 || c >= map.width)
            continue;
          const tile = map.tiles[r]?.[c];
          if (!tile)
            continue;
          const hasChar = [...map.players, ...map.enemies].some((x) => x.row === r && x.col === c);
          const hasBuilding = map.buildings.some((b) => b.row === r && b.col === c);
          if (hasChar || hasBuilding)
            continue;
          if (tile.terrain === "obstacle" || tile.terrain === "river")
            continue;
          tile.terrain = "obstacle";
          createdCount++;
          triggerShake(r, c, "character");
        }
        if (createdCount > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u751F\u6210{createdCount}\u4E2A\u969C\u788D\u7269\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u6CA1\u6709\u5408\u9002\u7684\u76EE\u6807\u4F4D\u7F6E\u3002`);
        }
      }
      if (skillId === "jue_chu_feng_sheng") {
        const attackerCharTemplate = findCharacterTemplateInStore2(attacker.characterId);
        const maxHp = attackerCharTemplate?.maxHp || attackerCharTemplate?.baseMaxHp || 100;
        const hpCost = Math.floor(maxHp * 0.2);
        const newHp = Math.max(1, attacker.hp - hpCost);
        attacker.hp = newHp;
        showFloatingText(attacker.row, attacker.col, hpCost, "damage");
        battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6D88{hpCost}\u70B9\u751F\u547D\u503C\uFF0C\u8FDB\u5165\u3010\u6124\u6012\u3011\u72B6\u6001\uFF01`);
      }
      if (skillId === "hong_hua_lv_ye") {
        if (targetId) {
          const attackPower2 = computeAttackPower(attacker);
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === targetId && b.isPlayer !== attacker.isPlayer);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            }
          }
          if (charTargets.length > 0 || buildingTargets.length > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
            const hpBuff = Math.floor(attackPower2 * 0.8);
            attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff;
            attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp);
            if (attacker.totalHeal === void 0)
              attacker.totalHeal = 0;
            attacker.totalHeal += hpBuff;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u751F\u547D\u503C\u4E0A${hpBuff}\u5E76\u6062{hpBuff}\u751F\u547D\uFF01`);
          }
        }
      }
      if (skillId === "tian_han_di_dong") {
        if (targetId) {
          const damageTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          if (damageTargets.length > 0) {
            const target = damageTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            triggerShake(target.row, target.col, "character");
            const expiresAfterPhase = attacker.isPlayer ? "enemy" : "player";
            const alreadyHasSnow = battleMap.value.snowAreas.some(
              (s) => s.row === target.row && s.col === target.col
            );
            if (!alreadyHasSnow) {
              battleMap.value.snowAreas.push({
                row: target.row,
                col: target.col,
                source: "skill",
                expiresAfterPhase
              });
            }
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u811A\u4E0B\u4EA7\u751F\u96EA\u5730\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          }
        }
      }
      if (skillId === "terror_scream") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "fushi_nianye") {
        const areaRange = skill.areaRange || 2;
        const attackerMaxHp = attacker.maxHp || (charTemplate?.maxHp || charTemplate?.baseMaxHp || 100);
        const hpPercent = attacker.hp / attackerMaxHp;
        if (hpPercent > 0.2 && attacker.isPlayer) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u751F\u547D\u503C\u8FC7\u9AD8\uFF0C\u65E0\u6CD5\u4F7F\u7528{skill.name}\u3011\uFF01`);
          return;
        }
        const enemyTargets = attacker.isPlayer ? battleMap.value.enemies.filter((enemy) => {
          const rowDiff = Math.abs(enemy.row - attacker.row);
          const colDiff = Math.abs(enemy.col - attacker.col);
          return rowDiff <= areaRange && colDiff <= areaRange && isCellVisibleToActor(attacker, enemy.row, enemy.col);
        }) : battleMap.value.players.filter((playerChar) => {
          const rowDiff = Math.abs(playerChar.row - attacker.row);
          const colDiff = Math.abs(playerChar.col - attacker.col);
          return rowDiff <= areaRange && colDiff <= areaRange && isCellVisibleToActor(attacker, playerChar.row, playerChar.col);
        });
        const enemyBuildings = battleMap.value.buildings.filter((building) => {
          const rowDiff = Math.abs(building.row - attacker.row);
          const colDiff = Math.abs(building.col - attacker.col);
          return rowDiff <= areaRange && colDiff <= areaRange && building.isPlayer !== attacker.isPlayer && isCellVisibleToActor(attacker, building.row, building.col);
        });
        const obstaclePositions = [];
        for (let dr = -areaRange; dr <= areaRange; dr++) {
          for (let dc = -areaRange; dc <= areaRange; dc++) {
            const r = attacker.row + dr;
            const c = attacker.col + dc;
            if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
              if (battleMap.value.tiles[r][c].terrain === "obstacle") {
                obstaclePositions.push({ row: r, col: c });
              }
            }
          }
        }
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        const defeatedNames = [];
        enemyTargets.forEach((target) => {
          const targetTemplate = findCharacterTemplateInStore2(target.characterId);
          const defense = computeDefensePower(target);
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
          target.hp -= damage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += damage;
          triggerShake(target.row, target.col, "character");
          showFloatingText(target.row, target.col, damage, "damage");
          damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
          if (target.hp <= 0) {
            removeCharacterFromBattle2(target.id, target.isPlayer);
            defeatedNames.push(targetTemplate?.name || target.characterId);
          }
        });
        const destroyedBuildings = [];
        enemyBuildings.forEach((building) => {
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
          building.hp -= damage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += damage;
          triggerShake(building.row, building.col, "building");
          showFloatingText(building.row, building.col, damage, "damage");
          damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
          trySpawnZombieFromHeart(building);
          if (building.hp <= 0) {
            removeBuildingFromBattle2(building.id);
            battleMap.value.tiles[building.row][building.col].building = null;
            destroyedBuildings.push(building.name);
          }
        });
        obstaclePositions.forEach((pos) => {
          battleMap.value.tiles[pos.row][pos.col].terrain = "empty";
          triggerShake(pos.row, pos.col, "character");
        });
        if (obstaclePositions.length > 0) {
          damageResults.push(`\u6E05\u9664${obstaclePositions.length}\u4E2A\u969C\u788D\u7269`);
        }
        const totalHits = enemyTargets.length + enemyBuildings.length + obstaclePositions.length;
        if (totalHits > 0) {
          const summary = damageResults.join("\uFF0C");
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\u547D${totalHits} \u4E2A\u76EE\u6807\uFF1A${summary}\uFF0C\u53D7\u51FB\u76EE\u6807\u9632\u5FA1\u529B-50%`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u8303\u56F4\u5185\u6CA1\u6709\u53EF\u653B\u51FB\u76EE\u6807`);
        }
        defeatedNames.forEach((name) => {
          battleLog.value.push(`${name}\u3011\u88AB\u51FB\u8D25\uFF01`);
        });
        destroyedBuildings.forEach((name) => {
          battleLog.value.push(`${name}\u3011\u88AB\u6467\u6BC1\uFF01`);
        });
        const attackerName = charTemplate?.name || attacker.characterId;
        battleLog.value.push(`${attackerName}\u3011\u5728\u8150\u8680\u7C98\u6DB2\u7684\u7206\u70B8\u4E2D\u5316\u4E3A\u7070\u70EC\uFF01`);
        removeCharacterFromBattle2(attacker.id, attacker.isPlayer);
      }
      if (skillId === "tian_beng_di_lie") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "ju_huo_fen_tian") {
        if (targetId) {
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === targetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            }
          }
          if (charTargets.length > 0 || buildingTargets.length > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u81EA\u8EAB\u8FDB\u5165\u3010\u5F3A\u529B\u3011\u72B6\u6001\uFF01`);
          }
        }
      }
      if (skillId === "luo_tu_fei_yan") {
        if (targetId) {
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === targetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            }
          }
          if (charTargets.length > 0 || buildingTargets.length > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
            addStatusToCharacter(attacker, "strong");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u81EA\u8EAB\u8FDB\u5165\u3010\u5F3A\u529B\u3011\u72B6\u6001\uFF01`);
          }
        }
      }
      if (skillId === "da_di_zhong_ji") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "mo_lian_gui_shou") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "man_jia_chong_ji") {
        if (targetId) {
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === targetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            }
          }
          if (charTargets.length > 0 || buildingTargets.length > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u81EA\u8EAB\u8FDB\u5165\u3010\u521A\u6BC5\u3011\u72B6\u6001\uFF01`);
          }
        }
      }
      if (skillId === "sui_lie_zhong_ji") {
        if (targetId) {
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === targetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u7729\u6655\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "sui_xing") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const damage = calculateSkillDamage(attacker, target, skill);
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            addStatusToCharacter(target, "bleeding", true);
            const skillAttribute = skill.attribute || "normal";
            triggerSkillEffect(target.row, target.col, skillAttribute, "medium", "attack", "\u6307\u5B9A", attacker.row, attacker.col);
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = calculateSkillDamage(attacker, targetBuilding2, skill);
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "lingqisi") {
        if (targetId) {
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === targetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            }
          }
          if (charTargets.length > 0 || buildingTargets.length > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
            const healAmount = Math.floor(totalDamage * (skill.lifesteal || 0.385));
            const maxHp = attacker.maxHp || (charTemplate?.maxHp || charTemplate?.baseMaxHp || 100);
            attacker.hp = Math.min(attacker.hp + healAmount, maxHp);
            if (attacker.totalHeal === void 0)
              attacker.totalHeal = 0;
            attacker.totalHeal += healAmount;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u6062\u590D${healAmount}\u70B9\u751F\u547D\uFF08\u9020\u6210\u4F24\u5BB38%\uFF09\uFF01`);
          }
        }
      }
      if (skillId === "zhai_ye_fei_hua") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let distance = 1;
          if (charTargets.length > 0) {
            const target = charTargets[0];
            distance = Math.abs(target.row - attacker.row) + Math.abs(target.col - attacker.col);
          } else if (buildingTargets.length > 0) {
            const target = buildingTargets[0];
            distance = Math.abs(target.row - attacker.row) + Math.abs(target.col - attacker.col);
          }
          const effectivePower = skill.power + 20 * distance;
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(effectivePower / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(effectivePower / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "wan_ye_fei_hua") {
        if (targetId) {
          const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId];
          const attackPower2 = computeAttackPower(attacker);
          let totalDamageAll = 0;
          const damagedTargets = [];
          for (const tid of actualTargetIds) {
            let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === tid) : battleMap.value.players.filter((p) => p.id === tid);
            let buildingTargets = battleMap.value.buildings.filter((b) => b.id === tid && b.isPlayer !== attacker.isPlayer);
            if (charTargets.length > 0) {
              const target = charTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              totalDamageAll += damage;
              const tName = targetTemplate?.name || target.characterId;
              damagedTargets.push(tName);
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${tName}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
            } else if (buildingTargets.length > 0) {
              const targetBuilding2 = buildingTargets[0];
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              targetBuilding2.hp -= damage;
              totalDamageAll += damage;
              damagedTargets.push(targetBuilding2.name);
              triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
              showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
              if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
                targetBuilding2.hasSpawnedBonus = true;
                spawnVariantZombieFromHeart(targetBuilding2);
              }
              if (targetBuilding2.hp <= 0) {
                removeBuildingFromBattle2(targetBuilding2.id);
                battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
                battleLog.value.push(`${targetBuilding2.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
          if (totalDamageAll > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamageAll;
            const targetsStr = damagedTargets.join("\uFF0C");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetsStr}\u3011\u9020\u6210\u603B\u8BA1${totalDamageAll}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001\uFF01`);
          }
        }
      }
      if (skillId === "yin_yang_yu_shou_yin") {
        if (targetId) {
          const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 3) : [targetId];
          const targetCount = actualTargetIds.length;
          const attackPower2 = computeAttackPower(attacker);
          const perTargetPower = Math.floor(skill.power / targetCount);
          let totalDamageAll = 0;
          const damagedTargets = [];
          for (const tid of actualTargetIds) {
            let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === tid) : battleMap.value.players.filter((p) => p.id === tid);
            let buildingTargets = battleMap.value.buildings.filter((b) => b.id === tid && b.isPlayer !== attacker.isPlayer);
            if (charTargets.length > 0) {
              const target = charTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(perTargetPower / 100 * attackPower2 - defense));
              target.hp -= damage;
              totalDamageAll += damage;
              const tName = targetTemplate?.name || target.characterId;
              damagedTargets.push(tName);
              triggerShake(target.row, target.col, "character");
              showFloatingText(target.row, target.col, damage, "damage");
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${tName}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
            } else if (buildingTargets.length > 0) {
              const targetBuilding2 = buildingTargets[0];
              const damage = Math.max(1, Math.floor(perTargetPower / 100 * attackPower2));
              targetBuilding2.hp -= damage;
              totalDamageAll += damage;
              damagedTargets.push(targetBuilding2.name);
              triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
              showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
              if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
                targetBuilding2.hasSpawnedBonus = true;
                spawnVariantZombieFromHeart(targetBuilding2);
              }
              if (targetBuilding2.hp <= 0) {
                removeBuildingFromBattle2(targetBuilding2.id);
                battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
                battleLog.value.push(`${targetBuilding2.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
          if (totalDamageAll > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamageAll;
            const targetsStr = damagedTargets.join("\uFF0C");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetsStr}\u3011\u9020\u6210\u603B\u8BA1${totalDamageAll}\u70B9\u4F24\u5BB3\uFF01\uFF08\u6BCF\u4E2A\u76EE{Math.floor(perTargetPower)}%\u653B\u51FB\u529B\u4F24\u5BB3\uFF09`);
          }
        }
      }
      if (skillId === "xi_xue") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            }
          }
          if (charTargets.length > 0 || buildingTargets.length > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
            const healAmount = Math.floor(totalDamage * (skill.lifesteal || 0.667));
            const maxHp = attacker.maxHp || (charTemplate?.maxHp || charTemplate?.baseMaxHp || 100);
            const oldHp = attacker.hp;
            attacker.hp = Math.min(attacker.hp + healAmount, maxHp);
            const actualHeal = attacker.hp - oldHp;
            if (attacker.totalHeal === void 0)
              attacker.totalHeal = 0;
            attacker.totalHeal += actualHeal;
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u6062\u590D${actualHeal}\u70B9\u751F\u547D\uFF08\u9020\u6210\u4F24\u5BB37%\uFF09\uFF01`);
          }
        }
      }
      if (skillId === "ling_hun_zu_zhou") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            addStatusToCharacter(target, "silenced", false, 3);
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u6C89\u9ED8\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "ling_hun_rao_luan") {
        if (targetId) {
          const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId];
          const attackPower2 = computeAttackPower(attacker);
          let totalDamageAll = 0;
          const damagedTargets = [];
          for (const tid of actualTargetIds) {
            let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === tid) : battleMap.value.players.filter((p) => p.id === tid);
            let buildingTargets = battleMap.value.buildings.filter((b) => b.id === tid && b.isPlayer !== attacker.isPlayer);
            if (charTargets.length > 0) {
              const target = charTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              totalDamageAll += damage;
              const tName = targetTemplate?.name || target.characterId;
              damagedTargets.push(tName);
              triggerShake(target.row, target.col, "character");
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${tName}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
            } else if (buildingTargets.length > 0) {
              const targetBuilding2 = buildingTargets[0];
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              targetBuilding2.hp -= damage;
              totalDamageAll += damage;
              damagedTargets.push(targetBuilding2.name);
              triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
              showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
              if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
                targetBuilding2.hasSpawnedBonus = true;
                spawnVariantZombieFromHeart(targetBuilding2);
              }
              if (targetBuilding2.hp <= 0) {
                removeBuildingFromBattle2(targetBuilding2.id);
                battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
                battleLog.value.push(`${targetBuilding2.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
          if (totalDamageAll > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamageAll;
            const targetsStr = damagedTargets.join("\uFF0C");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetsStr}\u3011\u9020\u6210\u603B\u8BA1${totalDamageAll}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u5FC3\u4E71\u3011\u72B6\u6001\uFF01`);
          }
        }
      }
      if (skillId === "mei_huo") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u5FC3\u4E71\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "pu_tong_hu_li") {
        if (targetId) {
          const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
          const targets = allyPool.filter((p) => p.id === targetId);
          if (targets.length > 0) {
            const target = targets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            if (charTemplate && targetTemplate) {
              const healAmount = Math.floor((charTemplate.attack || charTemplate.baseAttack || 20) * 0.5);
              target.hp = Math.min(target.hp + healAmount, targetTemplate.maxHp);
              target.mp = Math.min(target.mp + healAmount, targetTemplate.maxMp);
              showFloatingText(target.row, target.col, healAmount, "mp");
              if (attacker.totalHeal === void 0)
                attacker.totalHeal = 0;
              attacker.totalHeal += healAmount;
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate?.name || target.characterId}{healAmount}\u751F\u547D{healAmount}\u6CD5\u529B\uFF01`);
            }
          }
        }
      }
      if (skillId === "jin_ji_zhi_liao") {
        if (targetId) {
          const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
          const targets = allyPool.filter((p) => p.id === targetId);
          if (targets.length > 0) {
            const target = targets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            if (charTemplate && targetTemplate) {
              const healAmount = Math.floor(charTemplate.attack || charTemplate.baseAttack || 20);
              target.hp = Math.min(target.hp + healAmount, targetTemplate.maxHp);
              target.mp = Math.min(target.mp + healAmount, targetTemplate.maxMp);
              showFloatingText(target.row, target.col, healAmount, "mp");
              const dispelledStatuses = [];
              NEGATIVE_STATUSES.forEach((status) => {
                if (hasStatus(target, status)) {
                  removeStatusFromCharacter(target, status);
                  dispelledStatuses.push(STATUS_CONFIG[status].name);
                }
              });
              if (attacker.totalHeal === void 0)
                attacker.totalHeal = 0;
              attacker.totalHeal += healAmount;
              if (dispelledStatuses.length > 0) {
                battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate?.name || target.characterId}{healAmount}\u751F\u547D{healAmount}\u6CD5\u529B\uFF01\u9A71\u6563\u76EE\u6807\u7684{dispelledStatuses.join('\uFF0C')}\u3011\u72B6\u6001\uFF01`);
              } else {
                battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate?.name || target.characterId}{healAmount}\u751F\u547D{healAmount}\u6CD5\u529B\uFF01`);
              }
            }
          }
        }
      }
      if (skillId === "gao_shan_liu_shui") {
        if (targetId) {
          const actualTargetIds = Array.isArray(targetId) ? targetId.slice(0, 2) : [targetId];
          const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
          const targets = allyPool.filter((c) => actualTargetIds.includes(c.id));
          if (charTemplate) {
            const healAmount = Math.floor((charTemplate.attack || charTemplate.baseAttack || 20) * 0.75);
            for (const target of targets) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              if (!targetTemplate)
                continue;
              target.hp = Math.min(target.hp + healAmount, targetTemplate.maxHp);
              target.mp = Math.min(target.mp + healAmount, targetTemplate.maxMp);
              showFloatingText(target.row, target.col, healAmount, "mp");
              const dispelledStatuses = [];
              NEGATIVE_STATUSES.forEach((status) => {
                if (hasStatus(target, status)) {
                  removeStatusFromCharacter(target, status);
                  dispelledStatuses.push(STATUS_CONFIG[status].name);
                }
              });
              if (attacker.totalHeal === void 0)
                attacker.totalHeal = 0;
              attacker.totalHeal += healAmount;
              if (dispelledStatuses.length > 0) {
                battleLog.value.push(`${charTemplate.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate.name || target.characterId}{healAmount}\u751F\u547D{healAmount}\u6CD5\u529B\uFF01\u9A71\u6563\u76EE\u6807\u7684{dispelledStatuses.join('\uFF0C')}\u3011\u72B6\u6001\uFF01`);
              } else {
                battleLog.value.push(`${charTemplate.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate.name || target.characterId}{healAmount}\u751F\u547D{healAmount}\u6CD5\u529B\uFF01`);
              }
            }
          }
        }
      }
      if (skillId === "lian_yu_huo_hai") {
        processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate);
      }
      if (skillId === "wang_zhe_zhi_qi") {
        if (targetId) {
          const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId];
          const attackPower2 = computeAttackPower(attacker);
          let totalDamageAll = 0;
          const damagedTargets = [];
          for (const tid of actualTargetIds) {
            let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === tid) : battleMap.value.players.filter((p) => p.id === tid);
            let buildingTargets = battleMap.value.buildings.filter((b) => b.id === tid && b.isPlayer !== attacker.isPlayer);
            if (charTargets.length > 0) {
              const target = charTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              totalDamageAll += damage;
              const tName = targetTemplate?.name || target.characterId;
              damagedTargets.push(tName);
              triggerShake(target.row, target.col, "character");
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${tName}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
            } else if (buildingTargets.length > 0) {
              const targetBuilding2 = buildingTargets[0];
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              targetBuilding2.hp -= damage;
              totalDamageAll += damage;
              damagedTargets.push(targetBuilding2.name);
              triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
              showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
              if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
                targetBuilding2.hasSpawnedBonus = true;
                spawnVariantZombieFromHeart(targetBuilding2);
              }
              if (targetBuilding2.hp <= 0) {
                removeBuildingFromBattle2(targetBuilding2.id);
                battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
                battleLog.value.push(`${targetBuilding2.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += totalDamageAll;
          if (damagedTargets.length > 0) {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{damagedTargets.join('\uFF0C')}\u3011\u5206\u522B\u9020\u6210\u4F24\u5BB3\u5E76\u9677\u5165\u3010\u7D0A\u4E71\u3011\u72B6\u6001`);
          } else {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u6CA1\u6709\u547D\u4E2D\u6709\u6548\u76EE\u6807`);
          }
        }
      }
      if (skillId === "ku_lou_xue_shou_yin") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "liu_hun_kong_zhou") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            addStatusToCharacter(target, "silenced");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u4E0E\u3010\u6C89\u9ED8\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "zhi_yu_zhi_guang") {
        if (targetId) {
          const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
          const allyTargets = allyPool.filter((p) => p.id === targetId);
          const self = attacker;
          if (charTemplate) {
            const healAmount = Math.floor((charTemplate.attack || charTemplate.baseAttack || 20) * (skill.power / 100));
            const selfTemplate = findCharacterTemplateInStore2(self.characterId);
            if (selfTemplate) {
              self.hp = Math.min(self.hp + healAmount, selfTemplate.maxHp);
              self.mp = Math.min(self.mp + healAmount, selfTemplate.maxMp);
              if (attacker.totalHeal === void 0)
                attacker.totalHeal = 0;
              attacker.totalHeal += healAmount;
            }
            if (allyTargets.length > 0) {
              const target = allyTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              if (targetTemplate) {
                target.hp = Math.min(target.hp + healAmount, targetTemplate.maxHp);
                target.mp = Math.min(target.mp + healAmount, targetTemplate.maxMp);
                const dispelledStatuses = [];
                NEGATIVE_STATUSES.forEach((status) => {
                  if (hasStatus(target, status)) {
                    removeStatusFromCharacter(target, status);
                    dispelledStatuses.push(STATUS_CONFIG[status].name);
                  }
                });
                if (attacker.totalHeal === void 0)
                  attacker.totalHeal = 0;
                attacker.totalHeal += healAmount;
                if (dispelledStatuses.length > 0) {
                  battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D\u81EA\u8EAB\u4E0E{targetTemplate?.name || target.characterId}\u3011\u5404${healAmount}\u751F\u547D{healAmount}\u6CD5\u529B\uFF01\u9A71\u6563\u76EE\u6807\u7684{dispelledStatuses.join('\uFF0C')}\u3011\u72B6\u6001\uFF01`);
                } else {
                  battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D\u81EA\u8EAB\u4E0E{targetTemplate?.name || target.characterId}\u3011\u5404${healAmount}\u751F\u547D{healAmount}\u6CD5\u529B\uFF01`);
                }
              }
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D\u81EA\u8EAB${healAmount}\u751F\u547D{healAmount}\u6CD5\u529B\uFF01`);
            }
          }
        }
      }
      if (skillId === "tian_ya_qing_qing") {
        if (targetId) {
          const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
          const allyTargets = allyPool.filter((p) => p.id === targetId);
          if (charTemplate) {
            const hpHeal = Math.floor((charTemplate.maxHp || char.maxHp || 100) * 0.1);
            const mpHeal = Math.floor((charTemplate.maxMp || char.maxMp || 50) * 0.1);
            if (allyTargets.length > 0) {
              const target = allyTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              if (targetTemplate) {
                target.hp = Math.min(target.hp + hpHeal, targetTemplate.maxHp);
                target.mp = Math.min(target.mp + mpHeal, targetTemplate.maxMp);
                const dispelledStatuses = [];
                NEGATIVE_STATUSES.forEach((status) => {
                  if (hasStatus(target, status)) {
                    removeStatusFromCharacter(target, status);
                    dispelledStatuses.push(STATUS_CONFIG[status].name);
                  }
                });
                if (attacker.totalHeal === void 0)
                  attacker.totalHeal = 0;
                attacker.totalHeal += hpHeal;
                if (dispelledStatuses.length > 0) {
                  battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate?.name || target.characterId}{hpHeal}\u751F\u547D{mpHeal}\u6CD5\u529B\uFF01\u9A71\u6563\u76EE\u6807\u7684{dispelledStatuses.join('\uFF0C')}\u3011\u72B6\u6001\uFF01`);
                } else {
                  battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate?.name || target.characterId}{hpHeal}\u751F\u547D{mpHeal}\u6CD5\u529B\uFF01`);
                }
              }
            }
          }
        }
      }
      if (skillId === "emp_chong_ji_bo") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            addStatusToCharacter(target, "silenced", false, 3);
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u6C89\u9ED8\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skillId === "fu_she_da_ji") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === actualTargetId) : battleMap.value.players.filter((p) => p.id === actualTargetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetName}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding2 = buildingTargets[0];
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
            targetBuilding2.hp -= damage;
            totalDamage += damage;
            targetName = targetBuilding2.name;
            triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
            showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
            if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
              targetBuilding2.hasSpawnedBonus = true;
              spawnVariantZombieFromHeart(targetBuilding2);
            }
            if (targetBuilding2.hp <= 0) {
              removeBuildingFromBattle2(targetBuilding2.id);
              battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
              battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
            } else {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
            }
          }
          if (totalDamage > 0) {
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += totalDamage;
          }
        }
      }
      if (skill.category === "summon") {
        processSummonSkill(attacker, skill, targetId ? Array.isArray(targetId) ? targetId : [targetId] : [], charTemplate);
      } else if (skill.category === "\u76F4\u7EBF") {
        if (typeof targetId === "string" && ["up", "down", "left", "right"].includes(targetId)) {
          processLineAttackSkill(attacker, skill, targetId, charTemplate);
        }
      } else if (skill.category === "\u6A2A\u626B") {
        if (typeof targetId === "string" && ["up", "down", "left", "right"].includes(targetId)) {
          processSweepAttackSkill(attacker, skill, targetId, charTemplate);
        }
      } else if (skillId === "an_ye_jin_sheng") {
        if (targetId) {
          const targetIdsList = Array.isArray(targetId) ? targetId : [targetId];
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
          const attackPower2 = computeAttackPower(attacker);
          const damageResults = [];
          const defeatedNames = [];
          targetIdsList.forEach((tid) => {
            const target = allChars.find((c) => c.id === tid);
            if (target) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(target.row, target.col, "character");
              addStatusToCharacter(target, "silenced", false, 3);
              damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                defeatedNames.push(targetTemplate?.name || target.characterId);
              }
            }
          });
          if (damageResults.length > 0) {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u6C89\u9ED8\u3011\u72B6\u6001\uFF01`);
          }
          defeatedNames.forEach((name) => {
            battleLog.value.push(`${name}\u3011\u88AB\u51FB\u8D25\uFF01`);
          });
        }
      } else if (skill.type === "heal") {
        skillHandled = true;
      } else if (skillId === "ju_du_shi_gu") {
        if (targetId) {
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
          const target = allChars.find((c) => c.id === (Array.isArray(targetId) ? targetId[0] : targetId));
          if (target) {
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else {
            const buildingTarget = battleMap.value.buildings.find((b) => b.id === (Array.isArray(targetId) ? targetId[0] : targetId));
            if (buildingTarget && buildingTarget.isPlayer !== attacker.isPlayer) {
              const attackPower2 = computeAttackPower(attacker);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              buildingTarget.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(buildingTarget.row, buildingTarget.col, "building");
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{buildingTarget.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01`);
              if (buildingTarget.hp <= 0) {
                removeBuildingFromBattle2(buildingTarget.id);
                battleLog.value.push(`${buildingTarget.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
        }
      } else if (skillId === "die_xue_ci_ji") {
        if (targetId) {
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
          const target = allChars.find((c) => c.id === (Array.isArray(targetId) ? targetId[0] : targetId));
          if (target) {
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const attackPower2 = computeAttackPower(attacker);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            if (attacker.totalDamage === void 0)
              attacker.totalDamage = 0;
            attacker.totalDamage += damage;
            triggerShake(target.row, target.col, "character");
            showFloatingText(target.row, target.col, damage, "damage");
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u6D41\u8840\u3011\u72B6\u6001\uFF01`);
            if (target.hp <= 0) {
              removeCharacterFromBattle2(target.id, target.isPlayer);
              battleLog.value.push(`${targetTemplate?.name || target.characterId}\u3011\u88AB\u51FB\u8D25\uFF01`);
            }
          } else {
            const buildingTarget = battleMap.value.buildings.find((b) => b.id === (Array.isArray(targetId) ? targetId[0] : targetId));
            if (buildingTarget && buildingTarget.isPlayer !== attacker.isPlayer) {
              const attackPower2 = computeAttackPower(attacker);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              buildingTarget.hp -= damage;
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += damage;
              triggerShake(buildingTarget.row, buildingTarget.col, "building");
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{buildingTarget.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3\uFF01`);
              if (buildingTarget.hp <= 0) {
                removeBuildingFromBattle2(buildingTarget.id);
                battleLog.value.push(`${buildingTarget.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
        }
      } else if (skillId === "zi_bao_du_ye") {
        const areaRange = skill.areaRange || 1;
        const enemyTargets = attacker.isPlayer ? battleMap.value.enemies.filter((enemy) => {
          const rowDiff = Math.abs(enemy.row - attacker.row);
          const colDiff = Math.abs(enemy.col - attacker.col);
          return rowDiff <= areaRange && colDiff <= areaRange && isCellVisibleToActor(attacker, enemy.row, enemy.col);
        }) : battleMap.value.players.filter((playerChar) => {
          const rowDiff = Math.abs(playerChar.row - attacker.row);
          const colDiff = Math.abs(playerChar.col - attacker.col);
          return rowDiff <= areaRange && colDiff <= areaRange && isCellVisibleToActor(attacker, playerChar.row, playerChar.col);
        });
        const enemyBuildings = battleMap.value.buildings.filter((building) => {
          const rowDiff = Math.abs(building.row - attacker.row);
          const colDiff = Math.abs(building.col - attacker.col);
          return rowDiff <= areaRange && colDiff <= areaRange && building.isPlayer !== attacker.isPlayer && isCellVisibleToActor(attacker, building.row, building.col);
        });
        const attackPower2 = computeAttackPower(attacker);
        const damageResults = [];
        const defeatedNames = [];
        enemyTargets.forEach((target) => {
          const targetTemplate = findCharacterTemplateInStore2(target.characterId);
          const defense = computeDefensePower(target);
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
          target.hp -= damage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += damage;
          triggerShake(target.row, target.col, "character");
          addStatusToCharacter(target, "poison");
          damageResults.push(`\u5BF9${targetTemplate?.name || target.characterId}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
          if (target.hp <= 0) {
            removeCharacterFromBattle2(target.id, target.isPlayer);
            defeatedNames.push(targetTemplate?.name || target.characterId);
          }
        });
        const destroyedBuildingNames = [];
        enemyBuildings.forEach((building) => {
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
          building.hp -= damage;
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += damage;
          triggerShake(building.row, building.col, "building");
          showFloatingText(building.row, building.col, damage, "damage");
          damageResults.push(`\u5BF9${building.name}\u3011\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
          trySpawnZombieFromHeart(building);
          if (building.hp <= 0) {
            removeBuildingFromBattle2(building.id);
            destroyedBuildingNames.push(building.name);
          }
        });
        if (damageResults.length > 0) {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C${damageResults.join("\uFF0C")}\uFF01\u76EE\u6807\u8FDB\u5165\u3010\u4E2D\u6BD2\u3011\u72B6\u6001\uFF01`);
        } else {
          battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u8303\u56F4\u5185\u6CA1\u6709\u53EF\u653B\u51FB\u76EE\u6807\uFF01`);
        }
        defeatedNames.forEach((name) => {
          battleLog.value.push(`${name}\u3011\u88AB\u51FB\u8D25\uFF01`);
        });
        destroyedBuildingNames.forEach((name) => {
          battleLog.value.push(`${name}\u3011\u88AB\u6467\u6BC1\uFF01`);
        });
        const selfName = charTemplate?.name || attacker.characterId;
        triggerDefeatAnimation(attacker.row, attacker.col, "self");
        removeCharacterFromBattle2(attacker.id, attacker.isPlayer);
        battleLog.value.push(`${selfName}\u3011\u5728\u81EA\u7206\u6BD2\u6DB2\u4E2D\u6218\u8D25\u9000\u573A\uFF01`);
        checkBattleEnd2();
      }
      if (skillId === "gao_bie_ming_deng") {
        if (targetId) {
          const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId];
          const attackPower2 = computeAttackPower(attacker);
          let totalDamageAll = 0;
          const damagedTargets = [];
          for (const tid of actualTargetIds) {
            let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === tid) : battleMap.value.players.filter((p) => p.id === tid);
            let buildingTargets = battleMap.value.buildings.filter((b) => b.id === tid && b.isPlayer !== attacker.isPlayer);
            if (charTargets.length > 0) {
              const target = charTargets[0];
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const defense = computeDefensePower(target);
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
              target.hp -= damage;
              totalDamageAll += damage;
              const tName = targetTemplate?.name || target.characterId;
              damagedTargets.push(tName);
              triggerShake(target.row, target.col, "character");
              addStatusToCharacter(target, "crumble", true);
              if (target.hp <= 0) {
                removeCharacterFromBattle2(target.id, target.isPlayer);
                battleLog.value.push(`${tName}\u3011\u88AB\u51FB\u8D25\uFF01`);
              }
            } else if (buildingTargets.length > 0) {
              const targetBuilding2 = buildingTargets[0];
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2));
              targetBuilding2.hp -= damage;
              totalDamageAll += damage;
              damagedTargets.push(targetBuilding2.name);
              triggerShake(targetBuilding2.row, targetBuilding2.col, "building");
              showFloatingText(targetBuilding2.row, targetBuilding2.col, damage, "damage");
              if (targetBuilding2.type === "heart" && !targetBuilding2.hasSpawnedBonus) {
                targetBuilding2.hasSpawnedBonus = true;
                spawnVariantZombieFromHeart(targetBuilding2);
              }
              if (targetBuilding2.hp <= 0) {
                removeBuildingFromBattle2(targetBuilding2.id);
                battleMap.value.tiles[targetBuilding2.row][targetBuilding2.col].building = null;
                battleLog.value.push(`${targetBuilding2.name}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
          }
          if (attacker.totalDamage === void 0)
            attacker.totalDamage = 0;
          attacker.totalDamage += totalDamageAll;
          if (damagedTargets.length > 0) {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{damagedTargets.join('\uFF0C')}\u3011\u5206\u522B\u9020\u6210\u4F24\u5BB3\uFF01\u76EE\u6807\u9677\u5165\u3010\u8106\u76AE\u3011\u72B6\u6001\uFF01`);
          } else {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u6CA1\u6709\u547D\u4E2D\u6709\u6548\u76EE\u6807`);
          }
        }
      }
      if (skillId === "yue_zhi_yin_li") {
        if (targetId) {
          const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId;
          const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
          const target = allyPool.find((p) => p.id === actualTargetId);
          if (target) {
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            addStatusToCharacter(attacker, "heal", true);
            addStatusToCharacter(attacker, "meditate", true);
            addStatusToCharacter(target, "heal", true);
            addStatusToCharacter(target, "meditate", true);
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u81EA\u8EAB\u548C{targetTemplate?.name || target.characterId}\u3011\u83B7\u5F97\u3010\u6108\u5408\u3011\u548C\u3010\u8C03\u606F\u3011\u72B6\u6001\uFF01`);
          } else {
            battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u4F46\u6CA1\u6709\u627E\u5230\u6709\u6548\u76EE\u6807\uFF01`);
          }
        }
      } else if (skillId === "po_jing_chong_yuan") {
        if (targetId) {
          let charTargets = attacker.isPlayer ? battleMap.value.enemies.filter((e) => e.id === targetId) : battleMap.value.players.filter((p) => p.id === targetId);
          let buildingTargets = battleMap.value.buildings.filter((b) => b.id === targetId && b.isPlayer !== attacker.isPlayer);
          const attackPower2 = computeAttackPower(attacker);
          let totalDamage = 0;
          let targetName = "";
          if (charTargets.length > 0) {
            const target = charTargets[0];
            const targetTemplate = findCharacterTemplateInStore2(target.characterId);
            const defense = computeDefensePower(target);
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower2 - defense));
            target.hp -= damage;
            totalDamage += damage;
            targetName = targetTemplate?.name || target.characterId;
            triggerShake(target.row, target.col, "character");
            const buffStatuses = ["fury", "strong", "fierce", "swift", "resolute", "eagle_eye", "heal", "regen", "tune", "meditate", "undying"];
            const copiedStatusNames = [];
            if (target.statuses) {
              target.statuses.forEach((status) => {
                if (buffStatuses.includes(status)) {
                  addStatusToCharacter(attacker, status);
                  const statusName = STATUS_CONFIG[status]?.name || status;
                  copiedStatusNames.push(statusName);
                }
              });
            }
            if (copiedStatusNames.length > 0) {
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01\u590D\u5236\u4E86\u76EE\u6807\u7684{copiedStatusNames.join('\uFF0C')`);
              targetBuilding.hp -= damage;
              totalDamage += damage;
              targetName = targetBuilding.name;
              triggerShake(targetBuilding.row, targetBuilding.col, "building");
              battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u5BF9{targetName}\u3011\u9020\u6210${totalDamage}\u70B9\u4F24\u5BB3\uFF01`);
              if (targetBuilding.hp <= 0) {
                removeBuildingFromBattle2(targetBuilding.id);
                battleMap.value.tiles[targetBuilding.row][targetBuilding.col].building = null;
                battleLog.value.push(`${targetName}\u3011\u88AB\u6467\u6BC1\uFF01`);
              }
            }
            if (totalDamage > 0) {
              if (attacker.totalDamage === void 0)
                attacker.totalDamage = 0;
              attacker.totalDamage += totalDamage;
            }
          }
        }
        if (skillId === "jian_yu") {
          let centerRow = attacker.row;
          let centerCol = attacker.col;
          if (targetPos) {
            centerRow = targetPos.row;
            centerCol = targetPos.col;
          } else if (singleTargetId && singleTargetId !== "empty") {
            const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
            const targetChar = allChars.find((c) => c.id === singleTargetId);
            if (targetChar) {
              centerRow = targetChar.row;
              centerCol = targetChar.col;
            } else {
              const targetBuilding2 = battleMap.value.buildings.find((b) => b.id === singleTargetId);
              if (targetBuilding2) {
                centerRow = targetBuilding2.row;
                centerCol = targetBuilding2.col;
              }
            }
          }
          processAOEAttackSkill(attacker, skill, centerRow, centerCol, charTemplate);
        }
        if (skillId === "miao_shou") {
          if (targetId) {
            const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies;
            const target = allyPool.find((p) => p.id === targetId);
            if (target && charTemplate) {
              const targetTemplate = findCharacterTemplateInStore2(target.characterId);
              const attackPower2 = computeAttackPower(attacker);
              const healAmount = Math.floor(attackPower2 * (skill.power / 100));
              const currentMaxHp = target.maxHp || (targetTemplate?.maxHp || 100);
              const actualHeal = Math.min(healAmount, currentMaxHp - target.hp);
              target.hp = Math.min(target.hp + healAmount, currentMaxHp);
              showFloatingText(target.row, target.col, actualHeal, "heal");
              addStatusToCharacter(target, "heal", true);
              const dispelledStatuses = [];
              NEGATIVE_STATUSES.forEach((status) => {
                if (hasStatus(target, status)) {
                  removeStatusFromCharacter(target, status);
                  dispelledStatuses.push(STATUS_CONFIG[status].name);
                }
              });
              if (attacker.totalHeal === void 0)
                attacker.totalHeal = 0;
              attacker.totalHeal += actualHeal;
              if (dispelledStatuses.length > 0) {
                battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate?.name || target.characterId}{actualHeal}\u751F\u547D\uFF01{targetTemplate?.name || target.characterId}\u3011\u83B7\u5F97\u3010\u6108\u5408\u3011\u72B6\u6001\uFF01\u9A71\u6563{targetTemplate?.name || target.characterId}\u3011\u7684{dispelledStatuses.join('\uFF0C')}\u3011\u72B6\u6001\uFF01`);
              } else {
                battleLog.value.push(`${charTemplate?.name || attacker.characterId}\u3011\u4F7F\u7528\u6280\u80FD\u3010${skill.name}\u3011\uFF0C\u6062\u590D{targetTemplate?.name || target.characterId}{actualHeal}\u751F\u547D\uFF01{targetTemplate?.name || target.characterId}\u3011\u83B7\u5F97\u3010\u6108\u5408\u3011\u72B6\u6001\uFF01`);
              }
            }
          }
        } else if (!skillHandled) {
          processSingleOrMultiTargetSkill(attacker, skill, targetIds, charTemplate);
        }
        attacker.hasActed = true;
        if (attacker.isPlayer) {
          const attackerChar = player.value.characters.find((c) => c.id === attacker.characterId);
          if (attackerChar) {
            const playerSkill = attackerChar.skills.find((s) => s.id === skillId);
            if (playerSkill)
              playerSkill.currentCooldown = skill.frequency;
          } else {
            if (!attacker.skillCooldowns)
              attacker.skillCooldowns = {};
            attacker.skillCooldowns[skillId] = skill.frequency;
          }
        } else {
          if (!attacker.skillCooldowns)
            attacker.skillCooldowns = {};
          attacker.skillCooldowns[skillId] = skill.frequency;
        }
        triggerStatusOnAction(attacker);
        const skillAttribute = skill.attribute || "normal";
        const skillType = skill.type || "attack";
        const skillCategory = skill.category;
        if (skill.type === "attack" || skill.type === "support" || skill.type === "heal") {
          triggerSkillEffect(attacker.row, attacker.col, skillAttribute, "large", skillType, skillCategory);
          if (targetIds && targetIds.length > 0) {
            targetIds.forEach((tid) => {
              const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
              const targetChar = allChars.find((c) => c.id === tid);
              if (targetChar) {
                triggerSkillEffect(targetChar.row, targetChar.col, skillAttribute, "medium", skillType, skillCategory);
              }
              const targetBuilding2 = battleMap.value.buildings.find((b) => b.id === tid);
              if (targetBuilding2) {
                triggerSkillEffect(targetBuilding2.row, targetBuilding2.col, skillAttribute, "medium", skillType, skillCategory);
              }
            });
          }
        }
        checkBattleEnd2();
        return true;
      }
      function removeCharacterFromBattle2(charId, isPlayer) {
        if (!battleMap.value)
          return;
        if (isPlayer) {
          const idx = battleMap.value.players.findIndex((p) => p.id === charId);
          if (idx !== -1) {
            const char2 = battleMap.value.players[idx];
            if (!battleMap.value.defeatedCharacters) {
              battleMap.value.defeatedCharacters = [];
            }
            battleMap.value.defeatedCharacters.push(char2);
            battleMap.value.players.splice(idx, 1);
          }
        } else {
          const idx = battleMap.value.enemies.findIndex((e) => e.id === charId);
          if (idx !== -1) {
            const char2 = battleMap.value.enemies[idx];
            if (!battleMap.value.defeatedCharacters) {
              battleMap.value.defeatedCharacters = [];
            }
            battleMap.value.defeatedCharacters.push(char2);
            battleMap.value.enemies.splice(idx, 1);
          }
        }
      }
      function removeBuildingFromBattle2(buildingId) {
        if (!battleMap.value)
          return;
        const idx = battleMap.value.buildings.findIndex((b) => b.id === buildingId);
        if (idx !== -1) {
          const building = battleMap.value.buildings[idx];
          if (!battleMap.value.destroyedBuildings) {
            battleMap.value.destroyedBuildings = [];
          }
          battleMap.value.destroyedBuildings.push(building);
          battleMap.value.buildings.splice(idx, 1);
        }
      }
      let endBattleScheduled2 = false;
      function checkBattleEnd2() {
        if (!battleMap.value)
          return false;
        if (battleMap.value.battleEnded || endBattleScheduled2)
          return false;
        const hasEnemyBuildings = battleMap.value.buildings.some((b) => !b.isPlayer);
        if (battleMap.value.enemies.length === 0 && !hasEnemyBuildings) {
          scheduleEndBattle(true);
          return true;
        } else if (battleMap.value.players.length === 0) {
          scheduleEndBattle(false);
          return true;
        }
        return false;
      }
      function scheduleEndBattle(victory) {
        if (endBattleScheduled2)
          return;
        endBattleScheduled2 = true;
        setTimeout(async () => {
          try {
            await endBattle(victory);
          } catch (err) {
            console.error("[Battle] \u7ED3\u7B97\u6D41\u7A0B\u6267\u884C\u5931\u8D25:", err);
            endBattleScheduled2 = false;
          }
        }, 500);
      }
      function toggleSpeed() {
        if (gameSpeed.value === 1) {
          gameSpeed.value = 2;
        } else if (gameSpeed.value === 2) {
          gameSpeed.value = 3;
        } else {
          gameSpeed.value = 1;
        }
      }
      function findCharacterTemplateInStore2(charId) {
        const playerChar = player?.value?.characters.find((c) => c.id === charId);
        if (playerChar)
          return playerChar;
        const allChars = [...INITIAL_CHARACTERS, ...HIREABLE_CHARACTERS];
        return allChars.find((c) => c.id === charId);
      }
      function calculateDamage(attacker2, target) {
        if (!battleMap.value)
          return 0;
        const attackerTemplate = findCharacterTemplateInStore2(attacker2.characterId);
        const attackPower2 = computeAttackPower(attacker2);
        if ("characterId" in target) {
          const defense = computeDefensePower(target);
          return Math.max(1, attackPower2 - defense);
        }
        return attackPower2;
      }
      function calculateSkillDamage(attacker2, target, skill2) {
        if (!battleMap.value)
          return 0;
        const attackPower2 = computeAttackPower(attacker2);
        if ("characterId" in target) {
          const defense = computeDefensePower(target);
          if (skill2.damageFormula === "atk_plus_hp_pct") {
            const hpPct = skill2.hpPct || 0;
            return Math.max(1, Math.floor(skill2.power / 100 * attackPower2 + attacker2.hp * hpPct - defense));
          } else {
            return Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
          }
        } else {
          if (skill2.damageFormula === "atk_plus_hp_pct") {
            return Math.max(1, Math.floor(attackPower2));
          } else {
            return Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
          }
        }
      }
      function getDistance(row1, col1, row2, col2) {
        return Math.abs(row1 - row2) + Math.abs(col1 - col2);
      }
      function getNearestGatherPoint(char2) {
        if (gatheringPoints.value.length === 0)
          return null;
        let nearest = gatheringPoints.value[0];
        let minDist = getDistance(char2.row, char2.col, nearest.row, nearest.col);
        for (const point of gatheringPoints.value.slice(1)) {
          const dist = getDistance(char2.row, char2.col, point.row, point.col);
          if (dist < minDist) {
            minDist = dist;
            nearest = point;
          }
        }
        return nearest;
      }
      function getSkillAttackTargets(char2, skill2) {
        if (!battleMap.value)
          return [];
        const targets = [];
        const skillRange = skill2.category === "aoe" ? skill2.areaRange || skill2.range || 1 : skill2.range || 1;
        const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        for (const enemy of enemies) {
          const distance = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
          if (distance <= skillRange && isCellVisibleToActor(char2, enemy.row, enemy.col)) {
            targets.push(enemy);
          }
        }
        for (const building of battleMap.value.buildings) {
          if (building.isPlayer !== char2.isPlayer) {
            const distance = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
            if (distance <= skillRange && isCellVisibleToActor(char2, building.row, building.col)) {
              targets.push(building);
            }
          }
        }
        for (let r = -skillRange; r <= skillRange; r++) {
          for (let c = -skillRange; c <= skillRange; c++) {
            const nr = char2.row + r;
            const nc = char2.col + c;
            const distance = Math.abs(r) + Math.abs(c);
            if (nr >= 0 && nr < battleMap.value.height && nc >= 0 && nc < battleMap.value.width) {
              if (distance <= skillRange && battleMap.value.tiles[nr]?.[nc]?.terrain === "obstacle") {
                targets.push({ id: `obstacle_${nr}_${nc}`, row: nr, col: nc, isObstacle: true });
              }
            }
          }
        }
        return targets;
      }
      function getBestSkillTargets(char2, skill2) {
        if (!battleMap.value)
          return [];
        const allTargets = getSkillAttackTargets(char2, skill2);
        const validTargets = allTargets.filter((t) => !t.isObstacle && isCellVisibleToActor(char2, t.row, t.col));
        const attackPower2 = computeAttackPower(char2);
        const targetsWithDamage = validTargets.map((target) => {
          let damage;
          if ("characterId" in target) {
            const defense = computeDefensePower(target);
            damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
          } else if ("hp" in target && "maxHp" in target) {
            damage = Math.floor(skill2.power / 100 * attackPower2);
          } else {
            damage = 0;
          }
          return { target, damage };
        });
        targetsWithDamage.sort((a, b) => b.damage - a.damage);
        return targetsWithDamage.map((t) => t.target);
      }
      async function executeCharacterAi(char2, isPlayer) {
        if (!battleMap.value)
          return;
        currentAiCharacter.value = char2.id;
        try {
          console.log(`[AI] ${char2.id} | pos:(${char2.row},${char2.col}) | moved:${char2.hasMoved} acted:${char2.hasActed}`);
          if (char2.hasMoved && char2.hasActed) {
            console.log(`[AI] ${char2.id} | already moved and acted, skipping`);
            return;
          }
          if (hasStatus(char2, "stun")) {
            char2.isDefending = true;
            char2.hasActed = true;
            const template = findCharacterTemplateInStore2(char2.characterId);
            battleLog.value.push(`${template?.name || char2.characterId}\u3011\u56E0\u3010\u7729\u6655\u3011\u672C\u79D2\u65E0\u6CD5\u884C\u52A8\uFF0C\u53EA\u80FD\u9632\u5FA1`);
            return;
          }
          if (isPlayer && factionCommand.value === "gather") {
            await executeGatherMode(char2);
          } else {
            await executeAttackMode(char2);
          }
        } finally {
          currentAiCharacter.value = null;
        }
      }
      function getMinManhattanDistance(char2, enemies, buildings) {
        let minDistance = Infinity;
        for (const enemy of enemies) {
          if (enemy.hp > 0) {
            const distance = Math.abs(char2.row - enemy.row) + Math.abs(char2.col - enemy.col);
            if (distance < minDistance) {
              minDistance = distance;
            }
          }
        }
        for (const building of buildings) {
          if (building.hp > 0) {
            const distance = Math.abs(char2.row - building.row) + Math.abs(char2.col - building.col);
            if (distance < minDistance) {
              minDistance = distance;
            }
          }
        }
        return minDistance === Infinity ? 999 : minDistance;
      }
      function evaluateXianZhenSkillForAI(char2, skill2, fromRow, fromCol) {
        if (!battleMap.value)
          return { bestPos: null, maxDamage: 0 };
        const skillRange = skill2.range || 4;
        const areaRange = skill2.areaRange || 1;
        const rangeType = skill2.rangeType || "diamond";
        const attackPower2 = computeAttackPower(char2);
        const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const buildings = battleMap.value.buildings;
        const candidatePositions = [];
        for (let dr = -skillRange; dr <= skillRange; dr++) {
          for (let dc = -skillRange; dc <= skillRange; dc++) {
            const dist = Math.abs(dr) + Math.abs(dc);
            if (dist <= 0 || dist > skillRange)
              continue;
            const r = fromRow + dr;
            const c = fromCol + dc;
            if (r < 0 || r >= battleMap.value.height || c < 0 || c >= battleMap.value.width)
              continue;
            const tile = battleMap.value.tiles[r]?.[c];
            if (!tile || tile.terrain !== "empty")
              continue;
            const occupiedByPlayer = battleMap.value.players.some((p) => p.row === r && p.col === c);
            const occupiedByEnemy = battleMap.value.enemies.some((e) => e.row === r && e.col === c);
            const occupiedByBuilding = battleMap.value.buildings.some((b) => b.row === r && b.col === c);
            if (occupiedByPlayer || occupiedByEnemy || occupiedByBuilding)
              continue;
            let totalDamage = 0;
            for (const enemy of enemies) {
              const distToEnemy = Math.abs(enemy.row - r) + Math.abs(enemy.col - c);
              const inRange = rangeType === "diamond" ? distToEnemy <= areaRange : Math.abs(enemy.row - r) <= areaRange && Math.abs(enemy.col - c) <= areaRange;
              if (inRange) {
                const defense = computeDefensePower(enemy);
                const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                totalDamage += damage;
              }
            }
            for (const building of buildings) {
              const distToBuilding = Math.abs(building.row - r) + Math.abs(building.col - c);
              const inRange = rangeType === "diamond" ? distToBuilding <= areaRange : Math.abs(building.row - r) <= areaRange && Math.abs(building.col - c) <= areaRange;
              if (inRange && building.isPlayer !== char2.isPlayer) {
                const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                totalDamage += damage;
              }
            }
            if (totalDamage > 0) {
              candidatePositions.push({ pos: { row: r, col: c }, totalDamage });
            }
          }
        }
        if (candidatePositions.length > 0) {
          candidatePositions.sort((a, b) => b.totalDamage - a.totalDamage);
          return { bestPos: candidatePositions[0].pos, maxDamage: candidatePositions[0].totalDamage };
        }
        return { bestPos: null, maxDamage: 0 };
      }
      function executeXianZhenSkillAI(char2, skill2, targetPos2) {
        const targetId2 = `pos_${targetPos2.row}_${targetPos2.col}`;
        console.log(`[AI] ${char2.id} | using skill ${skill2.name} at pos(${targetPos2.row},${targetPos2.col})`);
        useSkill(skill2.id, char2.id, targetId2);
        console.log(`[AI] ${char2.id} | skill used successfully`);
      }
      async function executeAttackMode(char2) {
        try {
          if (!battleMap.value)
            return;
          const charTemplate2 = findCharacterTemplateInStore2(char2.characterId);
          const playerChar = player.value?.characters.find((c) => c.id === char2.characterId);
          let availableSkills = [];
          const charMaxHp = char2.maxHp || charTemplate2?.baseMaxHp || 100;
          const hpPercent = char2.hp / charMaxHp;
          if (char2.isPlayer && playerChar) {
            availableSkills = playerChar.skills.filter((skill2) => {
              if (skill2.frequency !== 0 || char2.mp < skill2.mpCost)
                return false;
              if (skill2.reikiCost && battleMap.value && battleMap.value.playerReiki < skill2.reikiCost)
                return false;
              if (skill2.shaQiCost && battleMap.value && battleMap.value.playerShaQi < skill2.shaQiCost)
                return false;
              if (skill2.id === "fushi_nianye" && hpPercent > 0.2)
                return false;
              if (skill2.selfHpThreshold !== void 0 && hpPercent < skill2.selfHpThreshold)
                return false;
              if (skill2.requireHpGtAtk && char2.hp <= char2.attack)
                return false;
              if (skill2.summonMaxCount && skill2.summonCountId && battleMap.value) {
                const existingCount = battleMap.value.players.filter((c) => c.characterId === skill2.summonCountId).length;
                if (existingCount >= skill2.summonMaxCount)
                  return false;
              }
              if (skill2.maxUsesPerBattle !== void 0) {
                const useCount = char2.skillUseCount ? char2.skillUseCount[skill2.id] || 0 : 0;
                if (useCount >= skill2.maxUsesPerBattle)
                  return false;
              }
              return true;
            });
          } else {
            availableSkills = (charTemplate2?.skills || []).filter((skill2) => {
              const cooldown = char2.skillCooldowns ? char2.skillCooldowns[skill2.id] : 0;
              if ((cooldown || 0) !== 0 || char2.mp < skill2.mpCost)
                return false;
              if (skill2.reikiCost && battleMap.value && battleMap.value.enemyReiki < skill2.reikiCost)
                return false;
              if (skill2.shaQiCost && battleMap.value && battleMap.value.enemyShaQi < skill2.shaQiCost)
                return false;
              if (skill2.id === "fushi_nianye" && hpPercent > 0.2)
                return false;
              if (skill2.selfHpThreshold !== void 0 && hpPercent < skill2.selfHpThreshold)
                return false;
              if (skill2.requireHpGtAtk && char2.hp <= char2.attack)
                return false;
              if (skill2.summonMaxCount && skill2.summonCountId && battleMap.value) {
                const existingCount = battleMap.value.enemies.filter((c) => c.characterId === skill2.summonCountId).length;
                if (existingCount >= skill2.summonMaxCount)
                  return false;
              }
              if (skill2.maxUsesPerBattle !== void 0) {
                const useCount = char2.skillUseCount ? char2.skillUseCount[skill2.id] || 0 : 0;
                if (useCount >= skill2.maxUsesPerBattle)
                  return false;
              }
              return true;
            });
          }
          const originalRow = char2.row;
          const originalCol = char2.col;
          const allEnemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
          const visibleEnemies = filterVisibleTargets(char2, allEnemies);
          const visibleEnemyBuildings = filterVisibleTargets(char2, battleMap.value.buildings.filter((b) => char2.isPlayer ? !b.isPlayer : b.isPlayer));
          const hasVisibleTargets = visibleEnemies.length > 0 || visibleEnemyBuildings.length > 0;
          let bestMove = null;
          let bestTarget = null;
          let bestSkill = null;
          let maxDamage = 0;
          const rawMoveRange = !char2.hasMoved ? getCharacterMoveRange(char2) : [];
          const moveRange = !char2.hasMoved ? [{ row: originalRow, col: originalCol }, ...rawMoveRange] : [{ row: originalRow, col: originalCol }];
          const baseAttackRangeVal = char2.attackRange || 1;
          const statusAttackRange = getStatusAttackRange(char2);
          for (const pos of moveRange) {
            if (battleMap.value?.visibilityEnabled && !hasVisibleTargets)
              break;
            char2.row = pos.row;
            char2.col = pos.col;
            let effectiveAttackRange = Math.max(0, baseAttackRangeVal + statusAttackRange);
            if (isFogArea(pos.row, pos.col)) {
              effectiveAttackRange = Math.min(effectiveAttackRange, 1);
            }
            for (const enemy of visibleEnemies) {
              const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
              if (dist <= effectiveAttackRange) {
                const damage = calculateDamage(char2, enemy);
                console.log(`[AI] ${char2.id} | melee attack on ${enemy.id} at dist ${dist}, range ${effectiveAttackRange}, damage: ${damage}`);
                if (damage > maxDamage) {
                  maxDamage = damage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = enemy;
                  bestSkill = null;
                }
              }
            }
            for (const skill2 of availableSkills) {
              if (skill2.id === "yi_jian_ting_yu") {
                const areaRange = skill2.areaRange || 2;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
                  if (dist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                  if (dist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "shui_man_jin_shan") {
                const areaRange = skill2.areaRange || 3;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
                  if (dist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                  if (dist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "mo_ying_jian_guang") {
                const areaRange = skill2.areaRange || 3;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
                  if (dist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                  if (dist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "qian_li_bing_feng") {
                const areaRange = skill2.areaRange || 3;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
                  if (dist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                  if (dist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "tian_beng_di_lie") {
                const areaRange = skill2.areaRange || 1;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const rowDist = Math.abs(enemy.row - char2.row);
                  const colDist = Math.abs(enemy.col - char2.col);
                  if (rowDist <= areaRange && colDist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const rowDist = Math.abs(building.row - char2.row);
                  const colDist = Math.abs(building.col - char2.col);
                  if (rowDist <= areaRange && colDist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "da_di_zhong_ji") {
                const areaRange = skill2.areaRange || 2;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
                  if (dist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                  if (dist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "mo_lian_gui_shou") {
                const areaRange = skill2.areaRange || 1;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const rowDist = Math.abs(enemy.row - char2.row);
                  const colDist = Math.abs(enemy.col - char2.col);
                  if (rowDist <= areaRange && colDist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const rowDist = Math.abs(building.row - char2.row);
                  const colDist = Math.abs(building.col - char2.col);
                  if (rowDist <= areaRange && colDist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "zi_bao_du_ye") {
                const areaRange = skill2.areaRange || 1;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const rowDist = Math.abs(enemy.row - char2.row);
                  const colDist = Math.abs(enemy.col - char2.col);
                  if (rowDist <= areaRange && colDist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const rowDist = Math.abs(building.row - char2.row);
                  const colDist = Math.abs(building.col - char2.col);
                  if (rowDist <= areaRange && colDist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "lian_yu_huo_hai") {
                const areaRange = skill2.areaRange || 2;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
                  if (dist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                  if (dist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "xie_shen_di_yu") {
                const areaRange = skill2.areaRange || 2;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
                  if (dist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                  if (dist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.category === "aoe" && skill2.targetCountTag === "\u8F70\u70B8") {
                const bestCenterPos = findBestBombingCenter(char2, skill2);
                if (bestCenterPos) {
                  const areaRange = skill2.areaRange || 1;
                  const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                  const buildings = battleMap.value.buildings;
                  let totalAreaDamage = 0;
                  for (const enemy of enemies) {
                    const enemyDist = Math.abs(enemy.row - bestCenterPos.row) + Math.abs(enemy.col - bestCenterPos.col);
                    if (enemyDist <= areaRange) {
                      const defense = computeDefensePower(enemy);
                      const attackPower2 = computeAttackPower(char2);
                      const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                      totalAreaDamage += damage;
                    }
                  }
                  for (const building of buildings) {
                    const buildingDist = Math.abs(building.row - bestCenterPos.row) + Math.abs(building.col - bestCenterPos.col);
                    if (buildingDist <= areaRange && building.isPlayer !== char2.isPlayer) {
                      const attackPower2 = computeAttackPower(char2);
                      const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                      totalAreaDamage += damage;
                    }
                  }
                  if (totalAreaDamage > 0 && totalAreaDamage > maxDamage) {
                    maxDamage = totalAreaDamage;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = bestCenterPos;
                    bestSkill = skill2;
                  }
                }
                continue;
              }
              if (skill2.id === "terror_scream") {
                const areaRange = skill2.areaRange || 3;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                let totalDamage = 0;
                for (const enemy of enemies) {
                  const dist = Math.abs(enemy.row - char2.row) + Math.abs(enemy.col - char2.col);
                  if (dist <= areaRange) {
                    const defense = computeDefensePower(enemy);
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                    totalDamage += damage;
                  }
                }
                for (const building of buildings) {
                  const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                  if (dist <= areaRange && building.isPlayer !== char2.isPlayer) {
                    const attackPower2 = computeAttackPower(char2);
                    const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                    totalDamage += damage;
                  }
                }
                if (totalDamage > 0 && totalDamage > maxDamage) {
                  maxDamage = totalDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.id === "bi_hai_chao_sheng") {
                const areaRange = skill2.areaRange || 3;
                const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                let totalHeal = 0;
                const attackPower2 = char2.attack || (charTemplate2?.baseAttack || 20);
                const healAmountPerTarget = Math.floor(attackPower2 * (skill2.power / 100));
                const selfTemplate = findCharacterTemplateInStore2(char2.characterId);
                const selfMaxHp = selfTemplate?.maxHp || char2.maxHp || 100;
                const selfMissingHp = selfMaxHp - char2.hp;
                if (selfMissingHp > 0) {
                  const actualHeal = Math.min(healAmountPerTarget, selfMissingHp);
                  totalHeal += actualHeal * 3;
                }
                for (const ally of allies) {
                  const dist = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                  if (dist <= areaRange && ally.id !== char2.id) {
                    const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                    const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                    const missingHp = allyMaxHp - ally.hp;
                    if (missingHp > 0) {
                      const actualHeal = Math.min(healAmountPerTarget, missingHp);
                      totalHeal += actualHeal * 3;
                    }
                  }
                }
                if (totalHeal > 0 && totalHeal > maxDamage) {
                  maxDamage = totalHeal;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = null;
                  bestSkill = skill2;
                } else if (totalHeal === 0 && allies.length > 0 && maxDamage === 0) {
                  totalHeal = 10;
                  if (totalHeal > maxDamage) {
                    maxDamage = totalHeal;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = null;
                    bestSkill = skill2;
                  }
                }
                continue;
              }
              if (skill2.category === "\u76F4\u7EBF") {
                const lineRange = skill2.range || 1;
                const lineWidth = skill2.lineWidth || 1;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                const directions = ["up", "down", "left", "right"];
                let maxLineDamage = 0;
                let bestDirection = null;
                const halfWidth = Math.floor(lineWidth / 2);
                const widthOffsets = lineWidth === 1 ? [0] : Array.from({ length: lineWidth }, (_, i) => i - halfWidth);
                for (const dir of directions) {
                  let totalDamage = 0;
                  const linePositions = [];
                  switch (dir) {
                    case "up":
                      for (let i = 1; i <= lineRange; i++) {
                        const r = char2.row - i;
                        if (r >= 0 && r < battleMap.value.height) {
                          for (const wOff of widthOffsets) {
                            const c = char2.col + wOff;
                            if (c >= 0 && c < battleMap.value.width) {
                              linePositions.push({ row: r, col: c });
                            }
                          }
                        }
                      }
                      break;
                    case "down":
                      for (let i = 1; i <= lineRange; i++) {
                        const r = char2.row + i;
                        if (r >= 0 && r < battleMap.value.height) {
                          for (const wOff of widthOffsets) {
                            const c = char2.col + wOff;
                            if (c >= 0 && c < battleMap.value.width) {
                              linePositions.push({ row: r, col: c });
                            }
                          }
                        }
                      }
                      break;
                    case "left":
                      for (let i = 1; i <= lineRange; i++) {
                        const c = char2.col - i;
                        if (c >= 0 && c < battleMap.value.width) {
                          for (const wOff of widthOffsets) {
                            const r = char2.row + wOff;
                            if (r >= 0 && r < battleMap.value.height) {
                              linePositions.push({ row: r, col: c });
                            }
                          }
                        }
                      }
                      break;
                    case "right":
                      for (let i = 1; i <= lineRange; i++) {
                        const c = char2.col + i;
                        if (c >= 0 && c < battleMap.value.width) {
                          for (const wOff of widthOffsets) {
                            const r = char2.row + wOff;
                            if (r >= 0 && r < battleMap.value.height) {
                              linePositions.push({ row: r, col: c });
                            }
                          }
                        }
                      }
                      break;
                  }
                  for (const enemy of enemies) {
                    if (linePositions.some((pos2) => pos2.row === enemy.row && pos2.col === enemy.col)) {
                      const defense = computeDefensePower(enemy);
                      const attackPower2 = computeAttackPower(char2);
                      const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                      totalDamage += damage;
                    }
                  }
                  for (const building of buildings) {
                    if (linePositions.some((pos2) => pos2.row === building.row && pos2.col === building.col) && building.isPlayer !== char2.isPlayer) {
                      const attackPower2 = computeAttackPower(char2);
                      const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                      totalDamage += damage;
                    }
                  }
                  if (totalDamage > maxLineDamage) {
                    maxLineDamage = totalDamage;
                    bestDirection = dir;
                  }
                }
                if (maxLineDamage > 0 && maxLineDamage > maxDamage) {
                  maxDamage = maxLineDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = { direction: bestDirection };
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.category === "\u6A2A\u626B") {
                const sweepLength = skill2.sweepLength || 3;
                const sweepWidth = skill2.sweepWidth || 2;
                const startJ = sweepWidth % 2 === 0 ? -(sweepWidth / 2 - 1) : -Math.floor(sweepWidth / 2);
                const endJ = sweepWidth % 2 === 0 ? sweepWidth / 2 : Math.floor(sweepWidth / 2);
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const buildings = battleMap.value.buildings;
                const directions = ["up", "down", "left", "right"];
                let maxSweepDamage = 0;
                let bestSweepDirection = null;
                for (const dir of directions) {
                  let totalDamage = 0;
                  const sweepPositions = [];
                  for (let i = 1; i <= sweepLength; i++) {
                    for (let j = startJ; j <= endJ; j++) {
                      let r = char2.row;
                      let c = char2.col;
                      switch (dir) {
                        case "up":
                          r = char2.row - i;
                          c = char2.col + j;
                          break;
                        case "down":
                          r = char2.row + i;
                          c = char2.col + j;
                          break;
                        case "left":
                          r = char2.row + j;
                          c = char2.col - i;
                          break;
                        case "right":
                          r = char2.row + j;
                          c = char2.col + i;
                          break;
                      }
                      if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
                        sweepPositions.push({ row: r, col: c });
                      }
                    }
                  }
                  for (const enemy of enemies) {
                    if (sweepPositions.some((pos2) => pos2.row === enemy.row && pos2.col === enemy.col)) {
                      const defense = computeDefensePower(enemy);
                      const attackPower2 = computeAttackPower(char2);
                      const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                      totalDamage += damage;
                    }
                  }
                  for (const building of buildings) {
                    if (sweepPositions.some((pos2) => pos2.row === building.row && pos2.col === building.col) && building.isPlayer !== char2.isPlayer) {
                      const attackPower2 = computeAttackPower(char2);
                      const damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2));
                      totalDamage += damage;
                    }
                  }
                  if (totalDamage > maxSweepDamage) {
                    maxSweepDamage = totalDamage;
                    bestSweepDirection = dir;
                  }
                }
                if (maxSweepDamage > 0 && maxSweepDamage > maxDamage) {
                  maxDamage = maxSweepDamage;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = { direction: bestSweepDirection };
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.category === "\u9677\u9635") {
                const result = evaluateXianZhenSkillForAI(char2, skill2, pos.row, pos.col);
                if (result.bestPos && result.maxDamage > maxDamage) {
                  maxDamage = result.maxDamage;
                  bestTarget = { row: result.bestPos.row, col: result.bestPos.col };
                  bestSkill = skill2;
                }
                continue;
              }
              if (skill2.type === "attack") {
                const skillTargets = getSkillAttackTargets(char2, skill2);
                if (skillTargets.length > 0) {
                  const targetDamages = [];
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length === 0)
                    continue;
                  const moveDistance = pos.row !== originalRow || pos.col !== originalCol ? Math.abs(pos.row - originalRow) + Math.abs(pos.col - originalCol) : char2.movedDistance || 0;
                  for (const target of validTargets) {
                    if ("characterId" in target) {
                      const defense = computeDefensePower(target);
                      const attackPower2 = computeAttackPower(char2);
                      let damage;
                      if (skill2.id === "shadow_assassination") {
                        const damageMultiplier = 1 + 0.3 * moveDistance;
                        damage = Math.max(1, Math.floor(damageMultiplier * attackPower2 - defense));
                      } else {
                        damage = Math.max(1, Math.floor(skill2.power / 100 * attackPower2 - defense));
                      }
                      targetDamages.push({ target, damage });
                    } else if ("hp" in target && "maxHp" in target) {
                      const attackPower2 = computeAttackPower(char2);
                      let damage;
                      if (skill2.id === "shadow_assassination") {
                        const damageMultiplier = 1 + 0.3 * moveDistance;
                        damage = Math.floor(damageMultiplier * attackPower2);
                      } else {
                        damage = Math.floor(skill2.power / 100 * attackPower2);
                      }
                      targetDamages.push({ target, damage });
                    }
                  }
                  let totalDamage = 0;
                  let bestSkillTarget = null;
                  if (skill2.category === "\u6307\u5B9A") {
                    const targetCount = skill2.targetCount || 1;
                    const selected = targetDamages.slice(0, targetCount);
                    totalDamage = selected.reduce((sum, t) => sum + t.damage, 0);
                    bestSkillTarget = selected[0]?.target || null;
                  } else {
                    bestSkillTarget = targetDamages[0]?.target || null;
                  }
                  if (totalDamage > 0 && totalDamage > maxDamage) {
                    maxDamage = totalDamage;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = bestSkillTarget;
                    bestSkill = skill2;
                  }
                }
              }
              if (skill2.id === "gao_shan_liu_shui") {
                const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                const skillRange = skill2.range || 4;
                const targetCount = skill2.targetCount || 2;
                const woundedAllies = [];
                for (const ally of allies) {
                  const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                  if (distance <= skillRange) {
                    const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                    const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                    const missingHp = allyMaxHp - ally.hp;
                    if (missingHp > 0) {
                      woundedAllies.push({ ally, missingHp });
                    }
                  }
                }
                if (woundedAllies.length > 0) {
                  let attackPower2 = char2.attack || (charTemplate2?.baseAttack || 20);
                  const healAmountPerTarget = Math.floor(attackPower2 * 1.2);
                  let totalHeal = 0;
                  for (let i = 0; i < Math.min(targetCount, woundedAllies.length); i++) {
                    totalHeal += Math.min(healAmountPerTarget, woundedAllies[i].missingHp);
                  }
                  const effectiveValue = totalHeal * 1;
                  if (effectiveValue > maxDamage) {
                    maxDamage = effectiveValue;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = woundedAllies[0].ally;
                    bestSkill = skill2;
                  }
                } else if (allies.length > 0 && maxDamage === 0) {
                  if (10 > maxDamage) {
                    maxDamage = 10;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = allies[0];
                    bestSkill = skill2;
                  }
                }
              }
              if (skill2.id === "tao_hua_zhuo_zhuo") {
                const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                const skillRange = skill2.range || 3;
                const targetCount = skill2.targetCount || 2;
                const woundedAllies = [];
                for (const ally of allies) {
                  const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                  if (distance <= skillRange) {
                    const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                    const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                    const missingHp = allyMaxHp - ally.hp;
                    if (missingHp > 0) {
                      woundedAllies.push({ ally, missingHp });
                    }
                  }
                }
                if (woundedAllies.length > 0) {
                  let attackPower2 = char2.attack || (charTemplate2?.baseAttack || 20);
                  const healAmountPerTarget = Math.floor(attackPower2 * (skill2.power / 100));
                  let totalHeal = 0;
                  for (let i = 0; i < Math.min(targetCount, woundedAllies.length); i++) {
                    totalHeal += Math.min(healAmountPerTarget, woundedAllies[i].missingHp);
                  }
                  const effectiveValue = totalHeal * 1;
                  if (effectiveValue > maxDamage) {
                    maxDamage = effectiveValue;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = woundedAllies[0].ally;
                    bestSkill = skill2;
                  }
                } else if (allies.length > 0 && maxDamage === 0) {
                  if (10 > maxDamage) {
                    maxDamage = 10;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = allies[0];
                    bestSkill = skill2;
                  }
                }
              } else if (skill2.id === "fu_guang_lue_ying") {
                const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                const areaRange = skill2.areaRange || 2;
                let totalHeal = 0;
                let bestAlly = null;
                let attackPower2 = char2.attack || (charTemplate2?.baseAttack || 20);
                const healAmountPerTarget = Math.floor(attackPower2 * (skill2.power / 100));
                for (const ally of allies) {
                  const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                  if (distance <= areaRange) {
                    const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                    const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                    const missingHp = allyMaxHp - ally.hp;
                    if (missingHp > 0) {
                      totalHeal += Math.min(healAmountPerTarget, missingHp);
                      if (!bestAlly)
                        bestAlly = ally;
                    }
                  }
                }
                const effectiveValue = totalHeal * 1.5;
                if (effectiveValue > 0 && effectiveValue > maxDamage) {
                  maxDamage = effectiveValue;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = bestAlly || char2;
                  bestSkill = skill2;
                } else if (totalHeal === 0 && allies.length > 0 && maxDamage === 0) {
                  if (10 > maxDamage) {
                    maxDamage = 10;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = allies[0];
                    bestSkill = skill2;
                  }
                }
              } else if (skill2.id === "yin_yang_qi_he") {
                const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                const areaRange = skill2.areaRange || 2;
                let totalHeal = 0;
                let bestAlly = null;
                let attackPower2 = char2.attack || (charTemplate2?.baseAttack || 20);
                const mpHealAmountPerTarget = Math.floor(attackPower2 * (skill2.power / 100));
                for (const ally of allies) {
                  const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                  if (distance <= areaRange) {
                    const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                    const allyMaxMp = allyTemplate?.maxMp || ally.maxMp || 50;
                    const missingMp = allyMaxMp - ally.mp;
                    if (missingMp > 0) {
                      totalHeal += Math.min(mpHealAmountPerTarget, missingMp);
                      if (!bestAlly)
                        bestAlly = ally;
                    }
                  }
                }
                const effectiveValue = totalHeal * 1.2;
                if (effectiveValue > 0 && effectiveValue > maxDamage) {
                  maxDamage = effectiveValue;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = bestAlly || char2;
                  bestSkill = skill2;
                } else if (totalHeal === 0 && allies.length > 0 && maxDamage === 0) {
                  if (10 > maxDamage) {
                    maxDamage = 10;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = allies[0];
                    bestSkill = skill2;
                  }
                }
              } else if (skill2.id === "mu_feng_wei_shang") {
                const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                const skillRange = skill2.range || 3;
                let attackPower2 = char2.attack || (charTemplate2?.baseAttack || 20);
                const hpHeal = Math.floor(attackPower2 * 0.5);
                const mpHeal = Math.floor(attackPower2 * 0.6);
                let bestAlly = null;
                let bestScore = 0;
                const selfMaxHp = charTemplate2?.maxHp || char2.maxHp || 100;
                const selfMaxMp = charTemplate2?.maxMp || char2.maxMp || 50;
                const selfMissingHp = selfMaxHp - char2.hp;
                const selfMissingMp = selfMaxMp - char2.mp;
                const selfScore = Math.min(hpHeal, selfMissingHp) * 1.5 + Math.min(mpHeal, selfMissingMp) * 1;
                for (const ally of allies) {
                  const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                  if (distance <= skillRange) {
                    const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                    const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                    const allyMaxMp = allyTemplate?.maxMp || ally.maxMp || 50;
                    const missingHp = allyMaxHp - ally.hp;
                    const missingMp = allyMaxMp - ally.mp;
                    let allyScore = 0;
                    if (missingHp > 0)
                      allyScore += Math.min(hpHeal, missingHp) * 1.5;
                    if (missingMp > 0)
                      allyScore += Math.min(mpHeal, missingMp) * 1;
                    let hasNegativeStatus = false;
                    for (const status of NEGATIVE_STATUSES) {
                      if (hasStatus(ally, status)) {
                        hasNegativeStatus = true;
                        break;
                      }
                    }
                    if (hasNegativeStatus)
                      allyScore += 30;
                    const totalScore = selfScore + allyScore;
                    if (totalScore > bestScore) {
                      bestScore = totalScore;
                      bestAlly = ally;
                    }
                  }
                }
                if (bestScore < selfScore + 20 && !bestAlly) {
                  bestAlly = char2;
                  bestScore = selfScore + 20;
                }
                if (bestScore > maxDamage && bestAlly) {
                  maxDamage = bestScore;
                  bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                  bestTarget = bestAlly;
                  bestSkill = skill2;
                }
              } else if (skill2.category === "summon") {
                const skillRange = skill2.range || 2;
                const map = battleMap.value;
                const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                const targetCount = skill2.targetCount || 1;
                let emptySpaceCount = 0;
                let minDistanceToEnemy = Infinity;
                if (map) {
                  for (let dr = -skillRange; dr <= skillRange; dr++) {
                    for (let dc = -skillRange; dc <= skillRange; dc++) {
                      const dist = Math.abs(dr) + Math.abs(dc);
                      if (dist > 0 && dist <= skillRange) {
                        const r = char2.row + dr;
                        const c = char2.col + dc;
                        if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
                          const tile = map.tiles[r]?.[c];
                          const hasChar = [...map.players || [], ...map.enemies || []].some((x) => x.row === r && x.col === c);
                          const hasBuilding = (map.buildings || []).some((b) => b.row === r && b.col === c);
                          if (tile && tile.terrain === "empty" && !hasChar && !hasBuilding) {
                            emptySpaceCount++;
                            const enemyDist = enemies.length > 0 ? Math.min(...enemies.map((e) => Math.abs(e.row - r) + Math.abs(e.col - c))) : Infinity;
                            if (enemyDist < minDistanceToEnemy) {
                              minDistanceToEnemy = enemyDist;
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (emptySpaceCount >= targetCount) {
                  const distanceBonus = enemies.length > 0 ? 10 - Math.min(minDistanceToEnemy, 10) : 0;
                  const summonValue = 9999 + distanceBonus;
                  if (summonValue > maxDamage) {
                    maxDamage = summonValue;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = char2;
                    bestSkill = skill2;
                  }
                }
              } else if (skill2.type === "heal") {
                const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                if (skill2.range === 0 && skill2.areaRange) {
                  const areaRange = skill2.areaRange;
                  let attackPower2 = char2.attack || (charTemplate2?.baseAttack || 20);
                  let healAmountPerTarget;
                  if (skill2.id === "bi_hai_chao_sheng") {
                    healAmountPerTarget = Math.floor(attackPower2 * 1.2);
                  } else if (skill2.id === "fu_guang_lue_ying") {
                    healAmountPerTarget = Math.floor(attackPower2 * 0.5);
                  } else if (skill2.id === "yin_yang_qi_he") {
                    healAmountPerTarget = Math.floor(attackPower2 * 0.4);
                  } else {
                    healAmountPerTarget = Math.floor(attackPower2 * (skill2.power / 100));
                  }
                  let totalHealValue = 0;
                  for (const ally of allies) {
                    const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                    if (distance <= areaRange) {
                      const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                      const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                      const missingHp = allyMaxHp - ally.hp;
                      if (missingHp > 0) {
                        const actualHeal = Math.min(healAmountPerTarget, missingHp);
                        totalHealValue += actualHeal;
                      }
                    }
                  }
                  const effectiveValue = totalHealValue * 2;
                  if (effectiveValue > maxDamage) {
                    maxDamage = effectiveValue;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = null;
                    bestSkill = skill2;
                  }
                } else {
                  const skillRange = skill2.range || 1;
                  let bestHealAmount = 0;
                  let bestHealTarget = null;
                  const selfMaxHp = charTemplate2?.maxHp || char2.maxHp || 100;
                  const selfHpPercent = char2.hp / selfMaxHp;
                  let selfHpBonus = 1;
                  if (selfHpPercent < 0.3) {
                    selfHpBonus = 2;
                  } else if (selfHpPercent < 0.5) {
                    selfHpBonus = 1.5;
                  }
                  for (const ally of allies) {
                    const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                    if (distance <= skillRange) {
                      const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                      const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                      const missingHp = allyMaxHp - ally.hp;
                      if (missingHp > 0) {
                        let healAmount;
                        if (skill2.id === "tian_ya_qing_qing") {
                        } else if (skill2.id === "ai_de_bao_bao" || skill2.id === "ai_de_fei_wen") {
                        } else if (skill2.id === "ai_de_hui_yi") {
                          if (ally.id !== char2.id)
                            continue;
                          healAmount = Math.floor(selfMaxHp * 0.1);
                        } else if (skill2.id === "mu_feng_wei_shang") {
                          let atkPower = char2.attack || (charTemplate2?.baseAttack || 20);
                          healAmount = Math.floor(atkPower * 0.5);
                        } else if (skill2.id === "fa_xiang_chong_yuan") {
                          if (ally.id !== char2.id)
                            continue;
                          healAmount = Math.floor(allyMaxHp * (skill2.selfHealPct || 0.5));
                        } else {
                          let attackPower2 = char2.attack || (charTemplate2?.baseAttack || 20);
                          healAmount = Math.floor(attackPower2 * (skill2.power / 100));
                        }
                        const actualHeal = Math.min(healAmount, missingHp);
                        const selfBonus = ally.id === char2.id ? selfHpBonus : 1;
                        const effectiveValue = actualHeal * 3 * selfBonus;
                        if (effectiveValue > bestHealAmount) {
                          bestHealAmount = effectiveValue;
                          bestHealTarget = ally;
                        }
                      }
                    }
                  }
                  if (bestHealAmount > maxDamage) {
                    maxDamage = bestHealAmount;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = bestHealTarget;
                    bestSkill = skill2;
                  }
                }
              } else if (skill2.type === "support") {
                if (skill2.id === "yue_zhi_yin_li") {
                  const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                  const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                  const skillRange = skill2.range || 2;
                  let hasValidTarget = false;
                  for (const ally of allies) {
                    const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                    if (distance <= skillRange && ally.id !== char2.id) {
                      hasValidTarget = true;
                      break;
                    }
                  }
                  if (hasValidTarget) {
                    const distanceToEnemy = enemies.length > 0 ? Math.min(...enemies.map((e) => Math.abs(e.row - char2.row) + Math.abs(e.col - char2.col))) : Infinity;
                    const distanceBonus = enemies.length > 0 ? 10 - Math.min(distanceToEnemy, 10) : 0;
                    const supportValue = 25 + distanceBonus;
                    if (supportValue > maxDamage) {
                      maxDamage = supportValue;
                      bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                      bestTarget = char2;
                      bestSkill = skill2;
                    }
                  }
                } else if (skill2.id === "jue_chu_feng_sheng") {
                  const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
                  const maxHp = charTemplate2?.maxHp || char2.maxHp || 100;
                  const hpCost = Math.floor(maxHp * 0.2);
                  if (char2.hp > hpCost) {
                    const distanceToEnemy = enemies.length > 0 ? Math.min(...enemies.map((e) => Math.abs(e.row - char2.row) + Math.abs(e.col - char2.col))) : Infinity;
                    const distanceBonus = enemies.length > 0 ? 10 - Math.min(distanceToEnemy, 10) : 0;
                    const supportValue = 5 + distanceBonus;
                    if (supportValue > maxDamage) {
                      maxDamage = supportValue;
                      bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                      bestTarget = char2;
                      bestSkill = skill2;
                    }
                  }
                } else if (skill2.category !== "special") {
                  let hasValidTarget = false;
                  if (skill2.type === "support") {
                    const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                    const skillRange = skill2.range || 2;
                    for (const ally of allies) {
                      const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                      if (distance <= skillRange) {
                        if (skill2.id === "pu_tong_hu_li" || skill2.id === "jin_ji_zhi_liao" || skill2.id === "zhi_yu_zhi_guang" || skill2.id === "tian_ya_qing_qing") {
                          const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                          const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                          if (ally.hp < allyMaxHp) {
                            hasValidTarget = true;
                            break;
                          }
                        } else if (skill2.id === "yu_yin_rao_liang" || skill2.id === "feng_mo_qin_xin") {
                          const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                          const allyMaxMp = allyTemplate?.maxMp || ally.maxMp || 100;
                          if (ally.mp < allyMaxMp) {
                            hasValidTarget = true;
                            break;
                          }
                        } else {
                          hasValidTarget = true;
                          break;
                        }
                      }
                    }
                  }
                  if (hasValidTarget) {
                    const supportValue = 15;
                    if (supportValue > maxDamage) {
                      maxDamage = supportValue;
                      bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                      bestTarget = char2;
                      bestSkill = skill2;
                    }
                  }
                }
              }
            }
            for (const building of battleMap.value.buildings) {
              if (char2.isPlayer ? !building.isPlayer : building.isPlayer) {
                const dist = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                if (dist <= effectiveAttackRange) {
                  const attackPower2 = computeAttackPower(char2);
                  console.log(`[AI] ${char2.id} | building attack on ${building.id} at dist ${dist}, range ${effectiveAttackRange}, attackPower: ${attackPower2}`);
                  if (attackPower2 > maxDamage) {
                    maxDamage = attackPower2;
                    bestMove = pos.row === originalRow && pos.col === originalCol ? null : pos;
                    bestTarget = building;
                    bestSkill = null;
                  }
                }
              }
            }
          }
          char2.row = originalRow;
          char2.col = originalCol;
          const currentPositionCanAct = !bestMove || bestMove.row === originalRow && bestMove.col === originalCol;
          if (maxDamage > 0 && currentPositionCanAct) {
            console.log(`[AI] ${char2.id} | current position can act, maxDamage:${maxDamage}, bestSkill:${bestSkill?.name || "null"}, bestTarget:${bestTarget?.id || "null"}`);
            if (!char2.hasActed) {
              if (bestSkill) {
                if ((bestSkill.category === "\u76F4\u7EBF" || bestSkill.category === "\u6A2A\u626B") && bestTarget && "direction" in bestTarget) {
                  console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} in direction ${bestTarget.direction}`);
                  useSkill(bestSkill.id, char2.id, bestTarget.direction);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.category === "\u9677\u9635") {
                  if (bestTarget && "row" in bestTarget && "col" in bestTarget) {
                    executeXianZhenSkillAI(char2, bestSkill, { row: bestTarget.row, col: bestTarget.col });
                  } else {
                    console.log(`[AI] ${char2.id} | no valid target position for ${bestSkill.name}, skipping skill`);
                  }
                } else if (bestSkill.category === "aoe" && bestSkill.targetCountTag !== "\u8F70\u70B8") {
                  useSkill(bestSkill.id, char2.id, null);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.category === "aoe" && bestSkill.targetCountTag === "\u8F70\u70B8") {
                  const bestCenterPos = findBestBombingCenter(char2, bestSkill);
                  if (bestCenterPos) {
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} at pos(${bestCenterPos.row},${bestCenterPos.col})`);
                    useSkill(bestSkill.id, char2.id, `pos_${bestCenterPos.row}_${bestCenterPos.col}`);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets for ${bestSkill.name}, skipping skill`);
                  }
                } else if (bestSkill.id === "bing_feng_zhi_men") {
                  const targetCount = bestSkill.targetCount || 2;
                  const range = bestSkill.range || 2;
                  const map = battleMap.value;
                  const candidatePositions = [];
                  if (map) {
                    for (let dr = -range; dr <= range; dr++) {
                      for (let dc = -range; dc <= range; dc++) {
                        const dist = Math.abs(dr) + Math.abs(dc);
                        if (dist > 0 && dist <= range) {
                          const r = char2.row + dr;
                          const c = char2.col + dc;
                          if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
                            const tile = map.tiles[r]?.[c];
                            const hasChar = [...map.players || [], ...map.enemies || []].some((x) => x.row === r && x.col === c);
                            const hasBuilding = (map.buildings || []).some((b) => b.row === r && b.col === c);
                            if (tile && tile.terrain === "empty" && !hasChar && !hasBuilding) {
                              candidatePositions.push(`pos_${r}_${c}`);
                            }
                          }
                        }
                      }
                    }
                  }
                  if (candidatePositions.length > 0) {
                    const positions = candidatePositions.slice(0, targetCount);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} at ${positions.join(",")}`);
                    useSkill(bestSkill.id, char2.id, positions);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid empty tiles for ${bestSkill.name}, skipping skill`);
                  }
                } else if (bestSkill.id === "gao_shan_liu_shui") {
                  const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                  const skillRange = bestSkill.range || 4;
                  const targetCount = bestSkill.targetCount || 2;
                  const woundedAllies = [];
                  for (const ally of allies) {
                    const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                    if (distance <= skillRange) {
                      const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                      const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                      const missingHp = allyMaxHp - ally.hp;
                      if (missingHp > 0) {
                        woundedAllies.push({ ally, missingHp });
                      }
                    }
                  }
                  if (woundedAllies.length > 0) {
                    woundedAllies.sort((a, b) => b.missingHp - a.missingHp);
                    const targetIds2 = woundedAllies.slice(0, targetCount).map((t) => t.ally.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no wounded allies for ${bestSkill.name}, skipping skill`);
                  }
                } else if (bestSkill.category === "summon") {
                  const skillRange = bestSkill.range || 2;
                  const targetCount = bestSkill.targetCount || 1;
                  const map = battleMap.value;
                  const candidatePositions = [];
                  if (map) {
                    const enemies = char2.isPlayer ? map.enemies : map.players;
                    for (let dr = -skillRange; dr <= skillRange; dr++) {
                      for (let dc = -skillRange; dc <= skillRange; dc++) {
                        const dist = Math.abs(dr) + Math.abs(dc);
                        if (dist > 0 && dist <= skillRange) {
                          const r = char2.row + dr;
                          const c = char2.col + dc;
                          if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
                            const tile = map.tiles[r]?.[c];
                            const hasChar = [...map.players || [], ...map.enemies || []].some((x) => x.row === r && x.col === c);
                            const hasBuilding = (map.buildings || []).some((b) => b.row === r && b.col === c);
                            if (tile && tile.terrain === "empty" && !hasChar && !hasBuilding) {
                              const minDistToEnemy = enemies.reduce((min, e) => Math.min(min, Math.abs(e.row - r) + Math.abs(e.col - c)), Infinity);
                              candidatePositions.push({ pos: `pos_${r}_${c}`, dist: minDistToEnemy, row: r, col: c });
                            }
                          }
                        }
                      }
                    }
                  }
                  if (candidatePositions.length >= targetCount) {
                    candidatePositions.sort((a, b) => a.dist - b.dist);
                    const positions = candidatePositions.slice(0, targetCount).map((p) => p.pos);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} at ${positions.join(",")}`);
                    useSkill(bestSkill.id, char2.id, positions);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else if (candidatePositions.length > 0) {
                    candidatePositions.sort((a, b) => a.dist - b.dist);
                    const position = candidatePositions[0].pos;
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} at ${position}`);
                    useSkill(bestSkill.id, char2.id, position);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid empty tiles for ${bestSkill.name}, skipping skill`);
                  }
                } else if (bestSkill.id === "an_ye_jin_sheng") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "jing_zhun_da_ji") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "ni_tian_can_ren") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(3, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "dao_guang_jian_ying" || bestSkill.id === "xing_huo_liao_yuan") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "qian_zhu_sui_ying") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(3, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "ju_du_shi_gu") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "die_xue_ci_ji") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "sui_lie_zhong_ji") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "xi_xue") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "ling_hun_zu_zhou" || bestSkill.id === "ku_lou_xue_shou_yin" || bestSkill.id === "liu_hun_kong_zhou" || bestSkill.id === "emp_chong_ji_bo" || bestSkill.id === "fu_she_da_ji" || bestSkill.id === "shi_xin_shi_sui") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "ling_hun_rao_luan" || bestSkill.id === "wang_zhe_zhi_qi" || bestSkill.id === "tian_luo_di_wang") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "mei_huo") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.type === "heal") {
                  const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                  const skillRange = bestSkill.range || 1;
                  if (skillRange === 0 && bestSkill.areaRange) {
                    console.log(`[AI] ${char2.id} | using heal AOE skill ${bestSkill.name} (self-centered)`);
                    useSkill(bestSkill.id, char2.id, null);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else if (bestSkill.id === "ai_de_hui_yi" || bestSkill.id === "wu_di_niu_niu" || bestSkill.id === "ning_xin_jue" || bestSkill.id === "wan_gu_jie_jie" || bestSkill.id === "fa_xiang_chong_yuan") {
                    useSkill(bestSkill.id, char2.id, char2.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    const targetCount = bestSkill.targetCount || 1;
                    let healTargets = [];
                    for (const ally of allies) {
                      const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                      if (distance <= skillRange) {
                        const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                        const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                        const missingHp = allyMaxHp - ally.hp;
                        if (missingHp > 0) {
                          healTargets.push(ally);
                        }
                      }
                    }
                    if (healTargets.length > 0) {
                      healTargets.sort((a, b) => {
                        const aT = findCharacterTemplateInStore2(a.characterId);
                        const aMax = aT?.maxHp || a.maxHp || 100;
                        const bT = findCharacterTemplateInStore2(b.characterId);
                        const bMax = bT?.maxHp || b.maxHp || 100;
                        return bMax - b.hp - (aMax - a.hp);
                      });
                      const selected = healTargets.slice(0, targetCount);
                      if (targetCount > 1) {
                        const targetIds2 = selected.map((t) => t.id);
                        console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                        useSkill(bestSkill.id, char2.id, targetIds2);
                      } else {
                        console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${selected[0].id}`);
                        useSkill(bestSkill.id, char2.id, selected[0].id);
                      }
                      console.log(`[AI] ${char2.id} | skill used successfully`);
                    } else {
                      console.log(`[AI] ${char2.id} | no valid heal targets, skipping skill`);
                    }
                  }
                } else if (bestSkill.id === "jue_chu_feng_sheng") {
                  useSkill(bestSkill.id, char2.id, char2.id);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.id === "yue_zhi_yin_li") {
                  const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                  const skillRange = bestSkill.range || 2;
                  let targetAlly = null;
                  for (const ally of allies) {
                    const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                    if (distance <= skillRange && ally.id !== char2.id) {
                      targetAlly = ally;
                      break;
                    }
                  }
                  if (targetAlly) {
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetAlly.id}`);
                    useSkill(bestSkill.id, char2.id, targetAlly.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid allies for ${bestSkill.name}, skipping skill`);
                  }
                } else if (bestSkill.type === "support" && bestSkill.category !== "special") {
                  useSkill(bestSkill.id, char2.id, bestTarget?.id || char2.id);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.id === "zhai_ye_fei_hua") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "wan_ye_fei_hua") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "yin_yang_yu_shou_yin") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(3, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "yi_jian_ting_yu") {
                  console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} (self-centered AOE)`);
                  useSkill(bestSkill.id, char2.id, null);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.id === "ling_yun_fei_jian" || bestSkill.id === "mo_yu_he_ling") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(3, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "ju_qi_cheng_ren") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "yin_yang_kui_lei_shu") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "meng_hu_xia_shan") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.id === "meng_hu_si_hou") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else if (bestSkill.category === "aoe" && bestSkill.targetCountTag !== "\u8F70\u70B8") {
                  useSkill(bestSkill.id, char2.id, null);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.category === "\u6307\u5B9A") {
                  const sortedTargets = getBestSkillTargets(char2, bestSkill);
                  if (sortedTargets.length > 0) {
                    const targetCount = bestSkill.targetCount || 1;
                    const selectedTargets = sortedTargets.slice(0, targetCount);
                    const targetIds2 = selectedTargets.map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2.length > 1 ? targetIds2 : targetIds2[0]);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                } else {
                  const sortedTargets = getBestSkillTargets(char2, bestSkill);
                  if (sortedTargets.length > 0) {
                    const target = sortedTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets after moving, skipping skill`);
                  }
                }
              } else if (bestTarget) {
                const baseAttackRange = char2.attackRange || 1;
                const attackRange = Math.max(0, baseAttackRange + getStatusAttackRange(char2));
                const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
                let targetStillValid = false;
                if ("characterId" in bestTarget) {
                  const target = allChars.find((c) => c.id === bestTarget.id);
                  if (target) {
                    const distance = Math.abs(target.row - char2.row) + Math.abs(target.col - char2.col);
                    targetStillValid = distance <= attackRange && isCellVisibleToActor(char2, target.row, target.col);
                  }
                } else if ("hp" in bestTarget && "maxHp" in bestTarget) {
                  const building = battleMap.value.buildings.find((b) => b.id === bestTarget.id);
                  if (building) {
                    const distance = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                    targetStillValid = distance <= attackRange && isCellVisibleToActor(char2, building.row, building.col);
                  }
                }
                if (targetStillValid) {
                  console.log(`[AI] ${char2.id} | attacking ${bestTarget.id}`);
                  if ("characterId" in bestTarget) {
                    attack(char2.id, bestTarget.id);
                  } else {
                    attackBuilding(char2.id, bestTarget.id);
                  }
                  console.log(`[AI] ${char2.id} | attack completed`);
                } else {
                  console.log(`[AI] ${char2.id} | target no longer valid after moving, skipping attack`);
                }
              }
            }
          }
          if (maxDamage > 0 && bestMove && !char2.hasMoved && !currentPositionCanAct) {
            console.log(`[AI] ${char2.id} | need to move to act, moving to ${bestMove.row},${bestMove.col}`);
            moveCharacter(char2.id, bestMove.row, bestMove.col);
            await new Promise((resolve) => setTimeout(resolve, 300 / (gameSpeed.value || 1)));
            console.log(`[AI] ${char2.id} | moved successfully`);
            if (!char2.hasActed) {
              if (bestSkill) {
                if ((bestSkill.category === "\u76F4\u7EBF" || bestSkill.category === "\u6A2A\u626B") && bestTarget && "direction" in bestTarget) {
                  console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} in direction ${bestTarget.direction}`);
                  useSkill(bestSkill.id, char2.id, bestTarget.direction);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.id === "shadow_assassination" || bestSkill.id === "fushi_nianye") {
                  console.log(`[AI] ${char2.id} | using skill ${bestSkill.name}`);
                  useSkill(bestSkill.id, char2.id, null);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.category === "aoe" && bestSkill.targetCountTag === "\u8F70\u70B8") {
                  const bestCenterPos = findBestBombingCenter(char2, bestSkill);
                  if (bestCenterPos) {
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} at pos(${bestCenterPos.row},${bestCenterPos.col})`);
                    useSkill(bestSkill.id, char2.id, `pos_${bestCenterPos.row}_${bestCenterPos.col}`);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    console.log(`[AI] ${char2.id} | no valid targets for ${bestSkill.name}, skipping skill`);
                  }
                } else if (bestSkill.category === "summon") {
                  const skillRange = bestSkill.range || 2;
                  const targetCount = bestSkill.targetCount || 1;
                  const map = battleMap.value;
                  const candidatePositions = [];
                  if (map) {
                    const enemies = char2.isPlayer ? map.enemies : map.players;
                    for (let dr = -skillRange; dr <= skillRange; dr++) {
                      for (let dc = -skillRange; dc <= skillRange; dc++) {
                        const dist = Math.abs(dr) + Math.abs(dc);
                        if (dist > 0 && dist <= skillRange) {
                          const r = char2.row + dr;
                          const c = char2.col + dc;
                          if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
                            const tile = map.tiles[r]?.[c];
                            const hasChar = [...map.players || [], ...map.enemies || []].some((x) => x.row === r && x.col === c);
                            const hasBuilding = (map.buildings || []).some((b) => b.row === r && b.col === c);
                            if (tile && tile.terrain === "empty" && !hasChar && !hasBuilding) {
                              const minDistToEnemy = enemies.reduce((min, e) => Math.min(min, Math.abs(e.row - r) + Math.abs(e.col - c)), Infinity);
                              candidatePositions.push({ pos: `pos_${r}_${c}`, dist: minDistToEnemy, row: r, col: c });
                            }
                          }
                        }
                      }
                    }
                    if (candidatePositions.length >= targetCount) {
                      candidatePositions.sort((a, b) => a.dist - b.dist);
                      const positions = candidatePositions.slice(0, targetCount).map((p) => p.pos);
                      console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} at ${positions.join(",")}`);
                      useSkill(bestSkill.id, char2.id, positions);
                      console.log(`[AI] ${char2.id} | skill used successfully`);
                    } else if (candidatePositions.length > 0) {
                      candidatePositions.sort((a, b) => a.dist - b.dist);
                      const position = candidatePositions[0].pos;
                      console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} at ${position}`);
                      useSkill(bestSkill.id, char2.id, position);
                      console.log(`[AI] ${char2.id} | skill used successfully`);
                    } else {
                      console.log(`[AI] ${char2.id} | no valid empty tiles for ${bestSkill.name}, skipping skill`);
                    }
                  }
                } else if (bestSkill.category === "\u9677\u9635") {
                  if (bestTarget && "row" in bestTarget && "col" in bestTarget) {
                    executeXianZhenSkillAI(char2, bestSkill, { row: bestTarget.row, col: bestTarget.col });
                  } else {
                    console.log(`[AI] ${char2.id} | no valid target position for ${bestSkill.name}, skipping skill`);
                  }
                } else if (bestSkill.id === "an_ye_jin_sheng") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "jing_zhun_da_ji") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "ni_tian_can_ren") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(3, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "dao_guang_jian_ying" || bestSkill.id === "xing_huo_liao_yuan") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "qian_zhu_sui_ying") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(3, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "ju_du_shi_gu" || bestSkill.id === "die_xue_ci_ji" || bestSkill.id === "sui_lie_zhong_ji" || bestSkill.id === "xi_xue" || bestSkill.id === "ling_hun_zu_zhou" || bestSkill.id === "ku_lou_xue_shou_yin" || bestSkill.id === "liu_hun_kong_zhou" || bestSkill.id === "emp_chong_ji_bo" || bestSkill.id === "fu_she_da_ji" || bestSkill.id === "shi_xin_shi_sui" || bestSkill.id === "mei_huo") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "ling_hun_rao_luan" || bestSkill.id === "wang_zhe_zhi_qi" || bestSkill.id === "tian_luo_di_wang") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.type === "heal") {
                  const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
                  const skillRange = bestSkill.range || 1;
                  if (skillRange === 0 && bestSkill.areaRange) {
                    console.log(`[AI] ${char2.id} | using heal AOE skill ${bestSkill.name} (self-centered)`);
                    useSkill(bestSkill.id, char2.id, null);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else if (bestSkill.id === "ai_de_hui_yi" || bestSkill.id === "wu_di_niu_niu" || bestSkill.id === "ning_xin_jue" || bestSkill.id === "wan_gu_jie_jie" || bestSkill.id === "fa_xiang_chong_yuan") {
                    useSkill(bestSkill.id, char2.id, char2.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  } else {
                    const targetCount = bestSkill.targetCount || 1;
                    let healTargets = [];
                    for (const ally of allies) {
                      const distance = Math.abs(ally.row - char2.row) + Math.abs(ally.col - char2.col);
                      if (distance <= skillRange) {
                        const allyTemplate = findCharacterTemplateInStore2(ally.characterId);
                        const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100;
                        const missingHp = allyMaxHp - ally.hp;
                        if (missingHp > 0) {
                          healTargets.push(ally);
                        }
                      }
                    }
                    if (healTargets.length > 0) {
                      healTargets.sort((a, b) => {
                        const aT = findCharacterTemplateInStore2(a.characterId);
                        const aMax = aT?.maxHp || a.maxHp || 100;
                        const bT = findCharacterTemplateInStore2(b.characterId);
                        const bMax = bT?.maxHp || b.maxHp || 100;
                        return bMax - b.hp - (aMax - a.hp);
                      });
                      const selected = healTargets.slice(0, targetCount);
                      if (targetCount > 1) {
                        const targetIds2 = selected.map((t) => t.id);
                        console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                        useSkill(bestSkill.id, char2.id, targetIds2);
                      } else {
                        console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${selected[0].id}`);
                        useSkill(bestSkill.id, char2.id, selected[0].id);
                      }
                      console.log(`[AI] ${char2.id} | skill used successfully`);
                    } else {
                      console.log(`[AI] ${char2.id} | no valid heal targets, skipping skill`);
                    }
                  }
                } else if (bestSkill.id === "zhai_ye_fei_hua") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "wan_ye_fei_hua") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "yin_yang_yu_shou_yin") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(3, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "yi_jian_ting_yu") {
                  console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} (self-centered AOE)`);
                  useSkill(bestSkill.id, char2.id, null);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else if (bestSkill.id === "ling_yun_fei_jian" || bestSkill.id === "mo_yu_he_ling") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(3, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "ju_qi_cheng_ren") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "yin_yang_kui_lei_shu") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "meng_hu_xia_shan") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "meng_hu_si_hou") {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const count = Math.min(2, validTargets.length);
                    const targetIds2 = validTargets.slice(0, count).map((t) => t.id);
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${targetIds2.join(",")}`);
                    useSkill(bestSkill.id, char2.id, targetIds2);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                } else if (bestSkill.id === "qian_li_bing_feng" || bestSkill.id === "terror_scream" || bestSkill.id === "tian_beng_di_lie" || bestSkill.id === "da_di_zhong_ji" || bestSkill.id === "mo_lian_gui_shou" || bestSkill.id === "zi_bao_du_ye" || bestSkill.id === "lian_yu_huo_hai" || bestSkill.id === "shui_man_jin_shan" || bestSkill.id === "bi_hai_chao_sheng") {
                  console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} (self-centered AOE)`);
                  useSkill(bestSkill.id, char2.id, null);
                  console.log(`[AI] ${char2.id} | skill used successfully`);
                } else {
                  const skillTargets = getSkillAttackTargets(char2, bestSkill);
                  const validTargets = skillTargets.filter((t) => !t.isObstacle);
                  if (validTargets.length > 0) {
                    const target = validTargets[0];
                    console.log(`[AI] ${char2.id} | using skill ${bestSkill.name} on ${target.id}`);
                    useSkill(bestSkill.id, char2.id, target.id);
                    console.log(`[AI] ${char2.id} | skill used successfully`);
                  }
                }
              } else if (bestTarget) {
                const baseAttackRange = char2.attackRange || 1;
                const attackRange = Math.max(0, baseAttackRange + getStatusAttackRange(char2));
                const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
                let targetStillValid = false;
                if ("characterId" in bestTarget) {
                  const target = allChars.find((c) => c.id === bestTarget.id);
                  if (target) {
                    const distance = Math.abs(target.row - char2.row) + Math.abs(target.col - char2.col);
                    targetStillValid = distance <= attackRange;
                  }
                } else if ("hp" in bestTarget && "maxHp" in bestTarget) {
                  const building = battleMap.value.buildings.find((b) => b.id === bestTarget.id);
                  if (building) {
                    const distance = Math.abs(building.row - char2.row) + Math.abs(building.col - char2.col);
                    targetStillValid = distance <= attackRange;
                  }
                }
                if (targetStillValid) {
                  console.log(`[AI] ${char2.id} | attacking ${bestTarget.id}`);
                  if ("characterId" in bestTarget) {
                    attack(char2.id, bestTarget.id);
                  } else {
                    attackBuilding(char2.id, bestTarget.id);
                  }
                  console.log(`[AI] ${char2.id} | attack completed`);
                }
              }
            }
          }
          if (!char2.hasActed) {
            if (battleMap.value?.visibilityEnabled && !hasVisibleTargets) {
              console.log(`[AI] ${char2.id} | no visible targets, staying in place`);
              char2.isDefending = true;
              char2.hasActed = true;
              const template = findCharacterTemplateInStore2(char2.characterId);
              battleLog.value.push(`${template?.name || char2.characterId}\u3011\u89C6\u91CE\u5185\u65E0\u76EE\u6807\uFF0C\u539F\u5730\u9632\u5FA1`);
              return;
            }
            console.log(`[AI] ${char2.id} | cannot attack, moving to nearest enemy or building`);
            const enemies = visibleEnemies;
            const enemyBuildings = visibleEnemyBuildings;
            let nearestTarget = null;
            let minDistance = Infinity;
            if (enemies.length > 0) {
              for (const enemy of enemies) {
                const dist = getDistance(char2.row, char2.col, enemy.row, enemy.col);
                if (dist < minDistance) {
                  minDistance = dist;
                  nearestTarget = enemy;
                }
              }
            }
            if (enemyBuildings.length > 0) {
              for (const building of enemyBuildings) {
                const dist = getDistance(char2.row, char2.col, building.row, building.col);
                if (dist < minDistance) {
                  minDistance = dist;
                  nearestTarget = building;
                }
              }
            }
            if (nearestTarget) {
              const moveRange2 = getCharacterMoveRange(char2);
              console.log(`[AI] ${char2.id} | moveRange size: ${moveRange2.length}, nearest target: ${"characterId" in nearestTarget ? nearestTarget.characterId : nearestTarget.id}`);
              let bestPosition = null;
              let bestDistance = Infinity;
              for (const pos of moveRange2) {
                const dist = getDistance(pos.row, pos.col, nearestTarget.row, nearestTarget.col);
                if (dist < bestDistance) {
                  bestDistance = dist;
                  bestPosition = pos;
                }
              }
              if (bestPosition && !char2.hasMoved) {
                console.log(`[AI] ${char2.id} | moving to ${bestPosition.row},${bestPosition.col}`);
                moveCharacter(char2.id, bestPosition.row, bestPosition.col);
                await new Promise((resolve) => setTimeout(resolve, 300 / (gameSpeed.value || 1)));
                console.log(`[AI] ${char2.id} | moved successfully`);
              } else {
                console.log(`[AI] ${char2.id} | no valid move position found or already moved`);
              }
            } else {
              console.log(`[AI] ${char2.id} | no enemies or buildings found in range, trying to move towards nearest enemy`);
              const allEnemies2 = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
              if (allEnemies2.length > 0) {
                let nearestEnemy = null;
                let minDist = Infinity;
                for (const enemy of allEnemies2) {
                  const dist = getDistance(char2.row, char2.col, enemy.row, enemy.col);
                  if (dist < minDist) {
                    minDist = dist;
                    nearestEnemy = enemy;
                  }
                }
                if (nearestEnemy && !char2.hasMoved) {
                  const moveRange2 = getCharacterMoveRange(char2);
                  let bestPosition = null;
                  let bestDistance = Infinity;
                  for (const pos of moveRange2) {
                    const dist = getDistance(pos.row, pos.col, nearestEnemy.row, nearestEnemy.col);
                    if (dist < bestDistance) {
                      bestDistance = dist;
                      bestPosition = pos;
                    }
                  }
                  if (bestPosition) {
                    console.log(`[AI] ${char2.id} | moving towards nearest enemy at ${bestPosition.row},${bestPosition.col}`);
                    moveCharacter(char2.id, bestPosition.row, bestPosition.col);
                    await new Promise((resolve) => setTimeout(resolve, 300 / (gameSpeed.value || 1)));
                    console.log(`[AI] ${char2.id} | moved successfully`);
                  }
                }
              }
            }
          }
          if (!char2.hasActed) {
            const hasPoison = hasStatus(char2, "poison");
            const poisonStacks = getStatusStacks(char2, "poison") || 1;
            const poisonDamage = poisonStacks * 50;
            const hpPercent2 = char2.hp / (char2.maxHp || 100);
            if (hasPoison && poisonDamage > char2.hp * 0.3 && hpPercent2 < 0.8) {
              console.log(`[AI] ${char2.id} | poisoned and in danger, trying to heal instead of defend`);
              const allies = char2.isPlayer ? battleMap.value.players : battleMap.value.enemies;
              const availableSkills2 = (charTemplate2?.skills || []).filter((skill2) => {
                const cooldown = char2.skillCooldowns ? char2.skillCooldowns[skill2.id] : 0;
                return cooldown === 0 && char2.mp >= skill2.mpCost && (skill2.type === "heal" || skill2.id === "bi_hai_chao_sheng" || skill2.id === "mu_feng_wei_shang");
              });
              if (availableSkills2.length > 0) {
                const bestSkill2 = availableSkills2[0];
                const alliesWithMissingHp = allies.filter((a) => {
                  const allyTemplate = findCharacterTemplateInStore2(a.characterId);
                  const allyMaxHp = allyTemplate?.maxHp || a.maxHp || 100;
                  return a.hp < allyMaxHp;
                });
                if (alliesWithMissingHp.length > 0) {
                  const healTarget = alliesWithMissingHp.sort((a, b) => {
                    const aMax = findCharacterTemplateInStore2(a.characterId)?.maxHp || a.maxHp || 100;
                    const bMax = findCharacterTemplateInStore2(b.characterId)?.maxHp || b.maxHp || 100;
                    return bMax - b.hp - (aMax - a.hp);
                  })[0];
                  console.log(`[AI] ${char2.id} | using heal skill ${bestSkill2.name} on poisoned target`);
                  useSkill(bestSkill2.id, char2.id, healTarget.id);
                  return;
                }
              }
            }
            console.log(`[AI] ${char2.id} | entering defense mode`);
            defend(char2.id);
            console.log(`[AI] ${char2.id} | defense completed`);
          }
        } catch (error) {
          console.error(`[AI ERROR] executeAttackMode failed for ${char2.id}:`, error);
          if (!char2.hasActed) {
            const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
            const enemyBuildings = battleMap.value.buildings.filter((b) => char2.isPlayer ? !b.isPlayer : b.isPlayer);
            if (enemies.length === 0 && enemyBuildings.length === 0) {
              defend(char2.id);
            }
          }
        }
      }
      async function handleNoDamageSituation(char2) {
        if (!battleMap.value || char2.hasActed)
          return;
        await moveToNearestEnemy(char2);
        if (!char2.hasActed) {
          const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
          const enemyBuildings = battleMap.value.buildings.filter((b) => char2.isPlayer ? !b.isPlayer : b.isPlayer);
          if (enemies.length === 0 && enemyBuildings.length === 0) {
            defend(char2.id);
          }
        }
      }
      async function moveToNearestEnemy(char2) {
        if (!battleMap.value)
          return;
        const enemies = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        if (enemies.length === 0)
          return;
        let nearestEnemy = enemies[0];
        let minDistance = getDistance(char2.row, char2.col, nearestEnemy.row, nearestEnemy.col);
        for (const enemy of enemies.slice(1)) {
          const dist = getDistance(char2.row, char2.col, enemy.row, enemy.col);
          if (dist < minDistance) {
            minDistance = dist;
            nearestEnemy = enemy;
          }
        }
        const moveRange = getCharacterMoveRange(char2);
        let bestPosition = null;
        let bestDistance = Infinity;
        for (const pos of moveRange) {
          const dist = getDistance(pos.row, pos.col, nearestEnemy.row, nearestEnemy.col);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestPosition = pos;
          }
        }
        if (bestPosition) {
          moveCharacter(char2.id, bestPosition.row, bestPosition.col);
          await new Promise((resolve) => setTimeout(resolve, 300 / (gameSpeed.value || 1)));
        }
      }
      async function executeGatherMode(char2) {
        if (!battleMap.value)
          return;
        const allEnemiesForGather = char2.isPlayer ? battleMap.value.enemies : battleMap.value.players;
        const visibleEnemies = filterVisibleTargets(char2, allEnemiesForGather);
        const visibleEnemyBuildings = filterVisibleTargets(char2, battleMap.value.buildings.filter((b) => char2.isPlayer ? !b.isPlayer : b.isPlayer));
        const nearestPoint = getNearestGatherPoint(char2);
        if (!nearestPoint) {
          return;
        }
        if (!char2.hasActed) {
          const currentTargets = getAttackableTargets(char2);
          if (currentTargets.length > 0) {
            let bestTarget = currentTargets[0];
            let maxDamage = calculateDamage(char2, bestTarget);
            for (const target of currentTargets.slice(1)) {
              const damage = calculateDamage(char2, target);
              if (damage > maxDamage) {
                maxDamage = damage;
                bestTarget = target;
              }
            }
            if ("characterId" in bestTarget) {
              attack(char2.id, bestTarget.id);
            } else {
              attackBuilding(char2.id, bestTarget.id);
            }
          }
        }
        if (!char2.hasMoved) {
          const moveRange = getCharacterMoveRange(char2);
          if (moveRange.length > 0) {
            let bestMove = moveRange[0];
            let minDist = getDistance(bestMove.row, bestMove.col, nearestPoint.row, nearestPoint.col);
            for (const pos of moveRange.slice(1)) {
              const dist = getDistance(pos.row, pos.col, nearestPoint.row, nearestPoint.col);
              if (dist < minDist) {
                minDist = dist;
                bestMove = pos;
              }
            }
            if (!char2.hasActed) {
              const newTargets = getAttackableTargets(char2);
              if (newTargets.length > 0) {
                const target = newTargets[Math.floor(Math.random() * newTargets.length)];
                if ("characterId" in target) {
                  attack(char2.id, target.id);
                } else {
                  attackBuilding(char2.id, target.id);
                }
              } else {
                if (battleMap.value?.visibilityEnabled && visibleEnemies.length === 0 && visibleEnemyBuildings.length === 0) {
                  defend(char2.id);
                }
              }
            }
          }
        } else if (!char2.hasActed) {
          if (battleMap.value?.visibilityEnabled && visibleEnemies.length === 0 && visibleEnemyBuildings.length === 0) {
            defend(char2.id);
          }
        }
      }
      async function executePlayerAiTurn() {
        if (!battleMap.value)
          return;
        const playerChars = battleMap.value.players.filter((p) => !p.hasMoved || !p.hasActed);
        for (const char2 of playerChars) {
          if (battleResult.value || battleMap.value.enemies.length === 0 || battleMap.value.players.length === 0)
            return;
          await new Promise((resolve) => setTimeout(resolve, 750 / gameSpeed.value));
          await executeCharacterAi(char2, true);
        }
      }
      async function endPlayerTurn() {
        if (!battleMap.value)
          return;
        console.log("=== \u79D2" + battleMap.value.turn + " \u7ED3\u675F ===");
        console.log("\u73A9\u5BB6:", battleMap.value.players.map((p) => `${p.characterId}(${p.row},${p.col}) moved:${p.hasMoved} acted:${p.hasActed}`));
        console.log("\u654C\u4EBA:", battleMap.value.enemies.map((e) => `${e.characterId}(${e.row},${e.col})`));
        let playerChars = battleMap.value.players.filter((p) => !p.hasMoved || !p.hasActed);
        if (playerChars.length > 0) {
          battleLog.value.push("\u5269\u4F59\u89D2\u8272\u81EA\u52A8\u884C\u52A8..");
          playerChars = playerChars.sort((a, b) => {
            const aDistance = getMinManhattanDistance(a, battleMap.value.enemies, battleMap.value.buildings.filter((b2) => b2.owner !== player.value.id));
            const bDistance = getMinManhattanDistance(b, battleMap.value.enemies, battleMap.value.buildings.filter((b2) => b2.owner !== player.value.id));
            return aDistance - bDistance;
          });
          for (const char2 of playerChars) {
            if (battleResult.value || battleMap.value.enemies.length === 0 || battleMap.value.players.length === 0)
              return;
            await new Promise((resolve) => setTimeout(resolve, 750 / gameSpeed.value));
            await executeCharacterAi(char2, true);
          }
        }
        if (battleResult.value || battleMap.value.enemies.length === 0)
          return;
        battleMap.value.players.forEach((p) => {
          p.hasMoved = false;
          p.hasActed = false;
          p.isDefending = false;
        });
        battleMap.value.battlePhase = "enemy";
        battleLog.value.push("\u654C\u65B9\u79D2\u5F00\u6280\u80FD\uFF01");
        setTimeout(() => executeEnemyTurn(), 750 / gameSpeed.value);
      }
      function getBuilding4AdjacentEmptyPositions(building) {
        if (!battleMap.value)
          return [];
        const positions = [];
        const offsets = [
          { row: -1, col: 0 },
          // 上
          { row: 1, col: 0 },
          // 下
          { row: 0, col: -1 },
          // 左
          { row: 0, col: 1 }
          // 右
        ];
        offsets.forEach((offset) => {
          const newRow = building.row + offset.row;
          const newCol = building.col + offset.col;
          if (newRow >= 0 && newRow < battleMap.value.height && newCol >= 0 && newCol < battleMap.value.width) {
            const tile = battleMap.value.tiles[newRow]?.[newCol];
            if (tile && tile.terrain === "empty" && !tile.building) {
              const hasCharacter = [...battleMap.value.players, ...battleMap.value.enemies].some(
                (char2) => char2.row === newRow && char2.col === newCol
              );
              const hasCollectible = battleMap.value.collectibles.some(
                (col) => col.row === newRow && col.col === newCol
              );
              if (!hasCharacter && !hasCollectible) {
                positions.push({ row: newRow, col: newCol });
              }
            }
          }
        });
        return positions;
      }
      function getBuildingAdjacentEmptyPositions2(building) {
        if (!battleMap.value)
          return [];
        const positions = [];
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (dr === 0 && dc === 0)
              continue;
            const newRow = building.row + dr;
            const newCol = building.col + dc;
            if (newRow >= 0 && newRow < battleMap.value.height && newCol >= 0 && newCol < battleMap.value.width) {
              const tile = battleMap.value.tiles[newRow]?.[newCol];
              if (tile && tile.terrain === "empty" && !tile.building) {
                const hasCharacter = [...battleMap.value.players, ...battleMap.value.enemies].some(
                  (char2) => char2.row === newRow && char2.col === newCol
                );
                const hasCollectible = battleMap.value.collectibles.some(
                  (col) => col.row === newRow && col.col === newCol
                );
                if (!hasCharacter && !hasCollectible) {
                  positions.push({ row: newRow, col: newCol });
                }
              }
            }
          }
        }
        return positions;
      }
      function trySpawnBuildingItems() {
        if (!battleMap.value)
          return;
        const currentTurn = battleMap.value.turn;
        console.log("=== trySpawnBuildingItems ===");
        console.log("\u5F53\u524D\u79D2:", currentTurn);
        console.log("\u5EFA\u7B51\u7269\u5217", battleMap.value.buildings);
        battleMap.value.buildings.forEach((building) => {
          console.log(`\u68C0\u67E5\u5EFA ${building.name}, isPlayer: ${building.isPlayer}, hasSpawnedBonus: ${building.hasSpawnedBonus}`);
          if (building.type === "heart" && !building.isPlayer) {
            if (building.spawnRound && currentTurn > 0 && currentTurn % building.spawnRound === 0) {
              console.log("\u8840\u5FC3\u89E6\u53D1\uFF01");
              spawnOrdinaryZombieFromHeart(building);
            }
            return;
          }
          if (building.type === "barracks" && !building.isPlayer) {
            const config = null;
            if (config.spawnRound && currentTurn > 0 && currentTurn % config.spawnRound === 0) {
              console.log("\u5175\u8425\u89E6\u53D1\u751F\u6210");
              spawnSoldierFromBarracks(building);
              battleLog.value.push(`\u5175\u8425\u79D2\u751F\u6210\u4E86\u4E00\u4E2A\u58EB\u5175\uFF01`);
            }
            return;
          }
          if (building.type === "tianqiPao" && !building.isPlayer) {
            if (!building.targetPositions) {
              building.targetPositions = [];
            }
            if (currentTurn % 2 === 1) {
              const targets = [];
              const playerTargets = [];
              battleMap.value.players.forEach((p) => {
                playerTargets.push({ row: p.row, col: p.col, type: "character", target: p });
              });
              battleMap.value.buildings.forEach((b) => {
                if (b.isPlayer) {
                  playerTargets.push({ row: b.row, col: b.col, type: "building", target: b });
                }
              });
              if (playerTargets.length > 0) {
                const shuffled = [...playerTargets].sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, Math.min(2, shuffled.length));
                selected.forEach((t) => {
                  targets.push({ row: t.row, col: t.col });
                });
              }
              building.targetPositions = targets;
              if (targets.length > 0) {
                const posStr = targets.map((t) => `(${t.row},${t.col})`).join(" ");
                battleLog.value.push(`\u5929\u542F\u70AE\u7784\u51C6\u4E86\u4F4D\u7F6E ${posStr}\uFF01`);
              }
            } else {
              if (building.targetPositions.length > 0) {
                battleLog.value.push(`\u5929\u542F\u70AE\u53D1\u5C04\uFF01`);
                building.targetPositions.forEach((targetPos2) => {
                  const characterAtPos = [...battleMap.value.players, ...battleMap.value.enemies].find(
                    (c) => c.row === targetPos2.row && c.col === targetPos2.col
                  );
                  const buildingAtPos = battleMap.value.buildings.find(
                    (b) => b.row === targetPos2.row && b.col === targetPos2.col
                  );
                  if (characterAtPos && characterAtPos.isPlayer) {
                    const characterTemplate = findCharacterTemplateInStore2(characterAtPos.characterId);
                    const maxHp = characterTemplate?.maxHp || characterTemplate?.baseMaxHp || characterAtPos.hp;
                    const damage = Math.floor(maxHp * 0.9);
                    const actualDamage = Math.max(1, damage);
                    characterAtPos.hp = Math.max(0, characterAtPos.hp - actualDamage);
                    battleLog.value.push(`\u5929\u542F\u70AE\u5BF9${characterTemplate?.name || "\u89D2\u8272"}\u3011\u9020\u6210 ${actualDamage} \u70B9\u4F24\u5BB3\uFF01`);
                    if (!building.totalDamage)
                      building.totalDamage = 0;
                    building.totalDamage += actualDamage;
                    if (characterAtPos.hp <= 0) {
                      removeCharacterFromBattle2(characterAtPos.id, characterAtPos.isPlayer);
                      battleLog.value.push(`${characterTemplate?.name || "\u89D2\u8272"} \u88AB\u5929\u542F\u70AE\u51FB\u6740\uFF01`);
                    }
                  } else if (buildingAtPos && buildingAtPos.isPlayer) {
                    const damage = Math.floor(buildingAtPos.maxHp * 0.45);
                    const actualDamage = Math.max(1, damage);
                    buildingAtPos.hp = Math.max(0, buildingAtPos.hp - actualDamage);
                    battleLog.value.push(`\u5929\u542F\u70AE\u5BF9${buildingAtPos.name}\u3011\u9020\u6210 ${actualDamage} \u70B9\u4F24\u5BB3\uFF01`);
                    if (!building.totalDamage)
                      building.totalDamage = 0;
                    building.totalDamage += actualDamage;
                    if (buildingAtPos.hp <= 0) {
                      removeBuildingFromBattle2(buildingAtPos.id);
                      battleMap.value.tiles[buildingAtPos.row][buildingAtPos.col].building = null;
                      battleLog.value.push(`${buildingAtPos.name} \u88AB\u5929\u542F\u70AE\u6467\u6BC1\uFF01`);
                    }
                  }
                });
                building.targetPositions = [];
              }
            }
            return;
          }
          if (building.type === "spiritField" && building.isPlayer) {
            const config = null;
            if (!building.hasSpawnedBonus && config.spawnRound && currentTurn === config.spawnRound) {
              console.log("\u7075\u7530\u89E6\u53D1\u751F\u6210");
              const emptyPositions = getBuilding4AdjacentEmptyPositions(building);
              console.log("\u7075\u7530\u5468\u56F4\u7A7A\u4F4D", emptyPositions);
              if (emptyPositions.length > 0) {
                const itemConfig = null;
                const count = Math.min(4, emptyPositions.length);
                for (let i = 0; i < count; i++) {
                  const pos = emptyPositions[i];
                  battleMap.value.collectibles.push({
                    id: `collect_${Date.now()}_${Math.random()}`,
                    type: "spirit_grass",
                    name: itemConfig.name,
                    icon: itemConfig.icon,
                    description: itemConfig.description,
                    hpRestore: itemConfig.hpRestore,
                    mpRestore: itemConfig.mpRestore,
                    row: pos.row,
                    col: pos.col
                  });
                }
                building.hasSpawnedBonus = true;
                battleLog.value.push(`\u7075\u7530\u4E2A\u76F8\u90BB\u7A7A\u683C\u4E0A\u751F\u6210${count} \u682A\u7075\u8349\uFF01`);
              }
            }
            return;
          }
          if (building.type === "elixirRoom" && building.isPlayer) {
            const config = null;
            if (!building.hasSpawnedBonus && config.spawnRound && currentTurn === config.spawnRound) {
              console.log("\u4E39\u623F\u89E6\u53D1\u751F\u6210");
              const emptyPositions = getBuilding4AdjacentEmptyPositions(building);
              console.log("\u4E39\u623F\u5468\u56F4\u7A7A\u4F4D", emptyPositions);
              if (emptyPositions.length > 0) {
                const itemConfig = null;
                const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                battleMap.value.collectibles.push({
                  id: `collect_${Date.now()}_${Math.random()}`,
                  type: "elixir",
                  name: itemConfig.name,
                  icon: itemConfig.icon,
                  description: itemConfig.description,
                  hpRestore: itemConfig.hpRestore,
                  mpRestore: itemConfig.mpRestore,
                  row: pos.row,
                  col: pos.col
                });
                building.hasSpawnedBonus = true;
                battleLog.value.push(`\u4E39\u623F\u4E2A\u76F8\u90BB\u7A7A\u683C\u4E0A\u751F\u6210\u4E86\u4E00\u4E2A\u4E39\u836F\uFF01`);
              }
            }
            return;
          }
        });
      }
      async function executeEnemyTurn() {
        if (!battleMap.value || !player.value)
          return;
        const sortedEnemies = [...battleMap.value.enemies].sort((a, b) => {
          const aDistance = getMinManhattanDistance(a, battleMap.value.players, battleMap.value.buildings.filter((b2) => b2.owner === player.value.id));
          const bDistance = getMinManhattanDistance(b, battleMap.value.players, battleMap.value.buildings.filter((b2) => b2.owner === player.value.id));
          return aDistance - bDistance;
        });
        for (const enemy of sortedEnemies) {
          if (battleResult.value || battleMap.value.players.length === 0 || battleMap.value.enemies.length === 0)
            return;
          await new Promise((resolve) => setTimeout(resolve, 750 / gameSpeed.value));
          await executeCharacterAi(enemy, false);
        }
        if (battleResult.value || battleMap.value.players.length === 0)
          return;
        if (battleMap.value.fireAreas.length > 0) {
          const weather = battleMap.value.weather;
          const weatherName = weather === "sky_fire" ? "\u5929\u706B" : "\u5C71\u706B";
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies];
          const fireDamageLogs = [];
          allChars.forEach((char2) => {
            if (isCharacterInFire(char2)) {
              const charTemplate2 = findCharacterTemplateInStore2(char2.characterId);
              const maxHp = charTemplate2?.maxHp || char2.maxHp || 100;
              const maxMp = charTemplate2?.maxMp || char2.maxMp || 100;
              const hpDamage = Math.max(1, Math.floor(maxHp * 0.1));
              const mpDamage = Math.max(1, Math.floor(maxMp * 0.1));
              char2.hp = Math.max(1, char2.hp - hpDamage);
              char2.mp = Math.max(0, char2.mp - mpDamage);
              showFloatingText(char2.row, char2.col, hpDamage, "damage");
              if (mpDamage > 0) {
                showFloatingText(char2.row, char2.col, mpDamage, "mp", void 0, false, "-");
              }
              triggerShake(char2.row, char2.col, "character");
              fireDamageLogs.push(`${charTemplate2?.name || char2.characterId}\u3011\u56E0${weatherName}\u635F\u5931${hpDamage}\u751F\u547D{mpDamage}\u6CD5\u529B`);
              if (char2.hp <= 0) {
                char2.hp = 1;
              }
            }
          });
          if (fireDamageLogs.length > 0) {
            battleLog.value.push(`${weatherName}\u6548\u679C${fireDamageLogs.join("\uFF0C")}`);
          }
        }
        console.log("=== \u5EFA\u7B51\u81EA\u52A8\u653B\u51FB ===");
        const playerBuildings = battleMap.value.buildings.filter((b) => b.isPlayer && (b.type === "archerTower" || b.type === "energyTower"));
        for (const building of playerBuildings) {
          if (building.hp <= 0)
            continue;
          if (battleResult.value || battleMap.value.enemies.length === 0)
            break;
          let attackRange = building.attackRange || 4;
          if (isFogArea(building.row, building.col)) {
            attackRange = Math.min(attackRange, 1);
          }
          const enemies = battleMap.value.enemies.filter((e) => e.hp > 0);
          const visibleEnemiesForBuilding = filterVisibleTargets(building, enemies);
          const targets = visibleEnemiesForBuilding.filter((enemy) => {
            const dist = Math.abs(enemy.row - building.row) + Math.abs(enemy.col - building.col);
            return dist <= attackRange;
          });
          if (targets.length > 0 && building.attack && building.attack > 0) {
            targets.sort((a, b) => {
              const distA = Math.abs(a.row - building.row) + Math.abs(a.col - building.col);
              const distB = Math.abs(b.row - building.row) + Math.abs(b.col - building.col);
              return distA - distB;
            });
            const target = targets[0];
            const template = findCharacterTemplateInStore2(target.characterId);
            const damage = Math.max(1, (building.attack || 0) - (target.defense || 0));
            if (!building.totalDamage)
              building.totalDamage = 0;
            building.totalDamage += damage;
            target.hp = Math.max(0, target.hp - damage);
            showFloatingText(target.row, target.col, damage, "damage");
            triggerShake(target.row, target.col, "character");
            triggerSkillEffect(target.row, target.col, "shadow", "small", "attack");
            const buildingName = building.type === "archerTower" ? "\u7BAD\u5854" : "\u7075\u80FD\u5854";
            const targetName = template?.name || target.characterId;
            battleLog.value.push(`${buildingName}\u3011\u653B\u51FB{targetName}\u3011\uFF0C\u9020\u6210${damage}\u70B9\u4F24\u5BB3`);
            if (target.hp <= 0) {
              triggerDefeatAnimation(target.row, target.col, "self");
              removeCharacterFromBattle2(target.id, false);
              if (battleMap.value.tiles[target.row]?.[target.col]) {
                battleMap.value.tiles[target.row][target.col].character = null;
              }
              battleLog.value.push(`${targetName}\u3011\u88AB{buildingName}\u3011\u51FB\u8D25\uFF01`);
            }
          }
        }
        battleMap.value.enemies.forEach((e) => {
          e.hasMoved = false;
          e.hasActed = false;
          e.isDefending = false;
          e.movedDistance = 0;
          if (e.skillCooldowns) {
            for (const skillId2 in e.skillCooldowns) {
              if (e.skillCooldowns[skillId2] > 0) {
                e.skillCooldowns[skillId2]--;
              }
            }
          }
        });
        battleMap.value.players.forEach((p) => {
          p.hasMoved = false;
          p.hasActed = false;
          p.isDefending = false;
          p.movedDistance = 0;
          const char2 = player.value?.characters.find((c) => c.id === p.characterId);
          char2?.skills.forEach((s) => {
            if (s.currentCooldown > 0)
              s.currentCooldown--;
          });
        });
        battleMap.value.turn++;
        battleMap.value.battlePhase = "player";
        if (battleMap.value.visibilityEnabled) {
          calculateVisibility();
        }
        const reikiFactions = ["human", "god", "immortal"];
        const shaqiFactions = ["demon", "ghost", "beast"];
        console.log("=== \u7075\u6C14\u715E\u6C14\u8BA1\u7B97 ===");
        console.log("\u73A9\u5BB6\u89D2\u8272:", battleMap.value.players.map((p) => `${p.characterId} faction:${p.faction} job:${p.job} hp:${p.hp}`));
        console.log("\u654C\u65B9\u89D2\u8272:", battleMap.value.enemies.map((e) => `${e.characterId} faction:${e.faction} job:${e.job} hp:${e.hp}`));
        const playerReikiBonus = battleMap.value.players.filter((p) => p.hp > 0 && reikiFactions.includes(p.faction)).reduce((sum, p) => sum + (JOB_CONFIG[p.job]?.rank || 1), 0);
        console.log("\u73A9\u5BB6\u7075\u6C14\u52A0\u6210:", playerReikiBonus);
        const playerShaQiBonus = battleMap.value.players.filter((p) => p.hp > 0 && shaqiFactions.includes(p.faction)).reduce((sum, p) => sum + (JOB_CONFIG[p.job]?.rank || 1), 0);
        console.log("\u73A9\u5BB6\u715E\u6C14\u52A0\u6210:", playerShaQiBonus);
        const enemyReikiBonus = battleMap.value.enemies.filter((e) => e.hp > 0 && reikiFactions.includes(e.faction)).reduce((sum, e) => sum + (JOB_CONFIG[e.job]?.rank || 1), 0);
        console.log("\u654C\u65B9\u7075\u6C14\u52A0\u6210:", enemyReikiBonus);
        const enemyShaQiBonus = battleMap.value.enemies.filter((e) => e.hp > 0 && shaqiFactions.includes(e.faction)).reduce((sum, e) => sum + (JOB_CONFIG[e.job]?.rank || 1), 0);
        console.log("\u654C\u65B9\u715E\u6C14\u52A0\u6210:", enemyShaQiBonus);
        const playerReikiGain = 10 + playerReikiBonus;
        const playerShaQiGain = 10 + playerShaQiBonus;
        const enemyReikiGain = 10 + enemyReikiBonus;
        const enemyShaQiGain = 10 + enemyShaQiBonus;
        battleMap.value.playerShaQi = Math.min(100, battleMap.value.playerShaQi + playerShaQiGain);
        battleMap.value.enemyReiki = Math.min(100, battleMap.value.enemyReiki + enemyReikiGain);
        battleMap.value.enemyShaQi = Math.min(100, battleMap.value.enemyShaQi + enemyShaQiGain);
        console.log(
          "\u7075\u6C14\u715E\u6C14\u6700\u7EC8",
          `playerReiki:${battleMap.value.playerReiki}`,
          `playerShaQi:${battleMap.value.playerShaQi}`,
          `enemyReiki:${battleMap.value.enemyReiki}`,
          `enemyShaQi:${battleMap.value.enemyShaQi}`
        );
        battleLog.value.push(`\u79D2\u7ED3\u675F\uFF0C\u6211\u65B9\u7075\u6C14${playerReikiGain}\uFF0C\u715E\u6C14${playerShaQiGain}`);
        battleLog.value.push(`\u79D2\u7ED3\u675F\uFF0C\u654C\u65B9\u7075\u6C14${enemyReikiGain}\uFF0C\u715E\u6C14${enemyShaQiGain}`);
        cleanupExpiredSnowAreas("enemy");
        battleLog.value.push(`${battleMap.value.turn} \u79D2\u5F00\u59CB`);
        updateWeather();
        trySpawnBuildingItems();
      }
      function pauseBattle() {
        if (battleManager)
          battleManager.pause();
      }
      function resumeBattle() {
        if (battleManager)
          battleManager.resume();
      }
      function toggleBattlePause() {
        if (battleManager)
          battleManager.togglePause();
      }
      function setBattleSpeed(multiplier) {
        if (battleManager)
          battleManager.setSpeedMultiplier(multiplier);
      }
      function castPlayerSkill(charId, skillId2, targetRow, targetCol) {
        if (!battleManager)
          return false;
        if (!battleManager.isPaused())
          return false;
        const ok = battleManager.castSkillByPlayer(charId, skillId2, targetRow, targetCol);
        if (ok) {
          battleLog.value.push(`[\u6682\u505C\u6307\u6325] \u91CA\u653E\u6280\u80FD\u6210\u529F`);
        }
        return ok;
      }
      function getSkillCooldownMs2(charId, skillId2) {
        if (!battleManager)
          return -1;
        return battleManager.getSkillCooldownFor(charId, skillId2);
      }
      function isSkillReady(charId, skillId2) {
        if (!battleManager)
          return false;
        const cd = battleManager.getSkillCooldownFor(charId, skillId2);
        if (cd > 0)
          return false;
        const state = battleManager.getState();
        const simChar = state.chars.find((c) => c.id === charId);
        if (!simChar || simChar.dead)
          return false;
        const skill2 = simChar.skills.find((s) => s.id === skillId2);
        if (!skill2)
          return false;
        if (simChar.mp < skill2.mpCost)
          return false;
        if (simChar.statuses.some((s) => s.type === "silenced"))
          return false;
        return true;
      }
      return {
        player,
        currentCharacter,
        battleMap,
        isInBattle,
        isLoading,
        battleLog,
        gameSpeed,
        shakingTargets,
        skillEffects,
        floatingTexts,
        triggerShake,
        // 新视觉特效系    hitFlashTargets,
        triggerHitFlash,
        defeatRecords,
        triggerDefeatAnimation,
        projectiles,
        triggerProjectile,
        statusApplyEffects,
        triggerStatusApplyEffect,
        summonEffects,
        triggerSummonEffect,
        moveTrailEffects,
        triggerMoveTrail,
        getProjectileTypeForSkill,
        getProjectileTypeForNormalAttack,
        // ============ 新增视觉特效导出 ============
        trailParticles,
        triggerTrailEffect,
        chargeEffects,
        triggerChargeEffect,
        clearChargeEffects,
        terrainMarks,
        triggerTerrainMark,
        deathEffects,
        triggerDeathEffect,
        // 地图级震    mapShakeTick,
        mapShakeIntensity,
        triggerMapShake,
        // ============
        factionCommand,
        gatheringPoints,
        isSelectingGatherPoints,
        aliveCharacters,
        totalAttack,
        totalDefense,
        totalMaxHp,
        totalMaxMp,
        totalMoveRange,
        totalAttackRange,
        battleResult,
        initGame,
        loadGame,
        saveGame,
        hasSaveData,
        getSaveSlots,
        saveToSlot,
        loadFromSlot,
        hireCharacter,
        equipItem,
        unequipItem,
        useConsumable,
        useSoul,
        updateHomeGrid,
        nextPhase,
        restoreResources,
        startBattle,
        currentAiCharacter,
        endBattle,
        // 实时战斗控制 API
        pauseBattle,
        resumeBattle,
        toggleBattlePause,
        setBattleSpeed,
        // 暂停指挥 API
        castPlayerSkill,
        getSkillCooldownMs: getSkillCooldownMs2,
        isSkillReady,
        moveCharacter,
        getCharacterMoveRange,
        getAttackableEnemies,
        getAttackableTargets,
        attack,
        attackBuilding,
        useSkill,
        defend,
        endPlayerTurn,
        toggleSpeed,
        useCollectible,
        collectCollectible,
        addExpToCharacter,
        upgradeEquipment,
        openChestStore,
        buyShopEquipment,
        buyShopConsumable,
        sellEquipment,
        updateWeather,
        generateSnowAreas,
        generateFireAreas,
        isSnowArea,
        isFireArea,
        isFogArea,
        getCellVisibility,
        calculateVisibility,
        isCharacterInSnow,
        isCharacterInFire,
        isCharacterInFog,
        setFactionCommand,
        toggleGatherPointSelection,
        addGatheringPoint,
        removeGatheringPoint,
        confirmGatheringPoints,
        getSkillAttackTargets,
        findCharacterTemplateInStore: findCharacterTemplateInStore2,
        computeAttackPower,
        computeDefensePower,
        // 状态系统
        addStatusToCharacter,
        removeStatusFromCharacter
      };
    }
  });
})();
