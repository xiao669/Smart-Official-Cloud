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
  const modeConfigs = {
    // 药品管理
    medicine: {
      id: "medicine",
      name: "药品管理",
      icon: "💊",
      description: "专业的药品库存管理系统",
      features: ["药品入库", "效期预警", "智能提醒", "用药记录"],
      terminology: {
        item: "药品",
        itemUnit: "盒",
        inventory: "库存",
        inbound: "入库",
        outbound: "出库",
        expiry: "效期",
        batch: "批号",
        category: "分类",
        warning: "预警",
        management: "药品管理",
        list: "药品列表",
        detail: "药品详情",
        add: "添加药品",
        edit: "修改药品",
        delete: "删除药品",
        search: "搜索药品",
        statistics: "药品统计"
      }
    },
    // 库存管理
    inventory: {
      id: "inventory",
      name: "库存管理",
      icon: "📦",
      description: "通用商品库存管理系统",
      features: ["商品入库", "库存盘点", "出入库记录", "数据统计"],
      terminology: {
        item: "商品",
        itemUnit: "件",
        inventory: "库存",
        inbound: "入库",
        outbound: "出库",
        expiry: "保质期",
        batch: "批次",
        category: "类别",
        warning: "提醒",
        management: "库存管理",
        list: "商品列表",
        detail: "商品详情",
        add: "添加商品",
        edit: "修改商品",
        delete: "删除商品",
        search: "搜索商品",
        statistics: "库存统计"
      }
    },
    // 食品管理
    food: {
      id: "food",
      name: "食品管理",
      icon: "🍱",
      description: "食品安全与保质期管理",
      features: ["食品入库", "保质期提醒", "批次追溯", "安全管理"],
      terminology: {
        item: "食品",
        itemUnit: "份",
        inventory: "库存",
        inbound: "入库",
        outbound: "出库",
        expiry: "保质期",
        batch: "批次",
        category: "类别",
        warning: "提醒",
        management: "食品管理",
        list: "食品列表",
        detail: "食品详情",
        add: "添加食品",
        edit: "修改食品",
        delete: "删除食品",
        search: "搜索食品",
        statistics: "食品统计"
      }
    }
  };
  function getCurrentModeConfig() {
    const appMode = uni.getStorageSync("app_mode") || "medicine";
    return modeConfigs[appMode] || modeConfigs.medicine;
  }
  function replaceTerms(text) {
    const config = getCurrentModeConfig();
    const terms = config.terminology;
    const replacements = {
      "药品": terms.item,
      "盒": terms.itemUnit,
      "效期": terms.expiry,
      "批号": terms.batch,
      "药品管理": terms.management,
      "药品列表": terms.list,
      "药品详情": terms.detail,
      "添加药品": terms.add,
      "修改药品": terms.edit,
      "删除药品": terms.delete,
      "搜索药品": terms.search,
      "药品统计": terms.statistics
    };
    let result = text;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, "g"), value);
    }
    return result;
  }
  function updateTabBarText() {
    const config = getCurrentModeConfig();
    const itemTerm = config.terminology.item;
    uni.setTabBarItem({
      index: 1,
      text: itemTerm
    });
  }
  function useMode() {
    const modeConfig = vue.ref(getCurrentModeConfig());
    const refreshKey = vue.ref(0);
    const refreshConfig = () => {
      modeConfig.value = getCurrentModeConfig();
      refreshKey.value++;
      updateTabBarText();
    };
    const terms = vue.computed(() => {
      refreshKey.value;
      return modeConfig.value.terminology;
    });
    const modeName = vue.computed(() => {
      refreshKey.value;
      return modeConfig.value.name;
    });
    const modeIcon = vue.computed(() => {
      refreshKey.value;
      return modeConfig.value.icon;
    });
    const term = (key) => {
      refreshKey.value;
      return terms.value[key];
    };
    const replace = (text) => {
      return replaceTerms(text);
    };
    return {
      modeConfig,
      terms,
      modeName,
      modeIcon,
      term,
      replace,
      refreshConfig,
      refreshKey,
      updateTabBarText
    };
  }
  const APP_VERSION = "6.0.2";
  const APP_VERSION_CODE = 602;
  const APP_NAME = "智管云";
  const APP_DESCRIPTION = "智能管理 · 安全高效";
  const COPYRIGHT_YEAR = 2026;
  const COPYRIGHT_TEXT = `© ${COPYRIGHT_YEAR}`;
  const DISCLAIMER = "仅辅助管理，无收银功能，不可商用";
  const AppConfig = {
    version: APP_VERSION,
    versionCode: APP_VERSION_CODE,
    name: APP_NAME,
    description: APP_DESCRIPTION,
    copyrightYear: COPYRIGHT_YEAR,
    copyrightText: COPYRIGHT_TEXT,
    disclaimer: DISCLAIMER,
    // 获取完整版本显示文本
    getVersionText: () => `v${APP_VERSION}`,
    // 获取完整版权文本
    getFullCopyright: (modeName) => `${COPYRIGHT_TEXT} ${modeName}系统`
  };
  const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { modeName } = useMode();
      const versionText = AppConfig.getVersionText();
      const disclaimer = AppConfig.disclaimer;
      const showLogo = vue.ref(false);
      const showName = vue.ref(false);
      const showSlogan = vue.ref(false);
      const showLoading = vue.ref(false);
      const showFooter = vue.ref(false);
      const loadingText = vue.ref("正在启动...");
      let hasNavigated = false;
      function checkLoginStatus() {
        try {
          const token = uni.getStorageSync("token");
          return !!token;
        } catch (e) {
          return false;
        }
      }
      function navigateToMain() {
        if (hasNavigated)
          return;
        hasNavigated = true;
        const isLoggedIn = checkLoginStatus();
        if (isLoggedIn) {
          uni.switchTab({
            url: "/pages/index/index"
          });
        } else {
          uni.redirectTo({
            url: "/pages/login/index"
          });
        }
      }
      vue.onMounted(() => {
        setTimeout(() => {
          showLogo.value = true;
        }, 100);
        setTimeout(() => {
          showName.value = true;
        }, 400);
        setTimeout(() => {
          showSlogan.value = true;
        }, 700);
        setTimeout(() => {
          showLoading.value = true;
        }, 1e3);
        setTimeout(() => {
          showFooter.value = true;
        }, 1200);
        setTimeout(() => {
          loadingText.value = "正在初始化...";
        }, 1500);
        setTimeout(() => {
          loadingText.value = "即将进入...";
        }, 2200);
        setTimeout(() => {
          navigateToMain();
        }, 1500);
      });
      const __returned__ = { modeName, versionText, disclaimer, showLogo, showName, showSlogan, showLoading, showFooter, loadingText, get hasNavigated() {
        return hasNavigated;
      }, set hasNavigated(v) {
        hasNavigated = v;
      }, checkLoginStatus, navigateToMain };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  const _imports_0 = "/static/logo.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "splash-container" }, [
      vue.createElementVNode("view", { class: "bg-animation" }, [
        vue.createElementVNode("view", { class: "circle circle-1" }),
        vue.createElementVNode("view", { class: "circle circle-2" }),
        vue.createElementVNode("view", { class: "circle circle-3" })
      ]),
      vue.createElementVNode("view", { class: "splash-content" }, [
        vue.createElementVNode("view", { class: "logo-section" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["logo-wrapper", { "animate": $setup.showLogo }])
            },
            [
              vue.createElementVNode("view", { class: "logo-icon" }, [
                vue.createElementVNode("image", {
                  class: "logo-image",
                  src: _imports_0,
                  mode: "aspectFit"
                })
              ])
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["app-name", { "animate": $setup.showName }])
            },
            [
              vue.createElementVNode("text", { class: "name-text" }, "智管云")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["app-slogan", { "animate": $setup.showSlogan }])
            },
            [
              vue.createElementVNode(
                "text",
                { class: "slogan-text" },
                "智能" + vue.toDisplayString($setup.modeName) + " · 安全高效",
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ]),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["loading-section", { "animate": $setup.showLoading }])
          },
          [
            vue.createElementVNode("view", { class: "loading-dots" }, [
              vue.createElementVNode("view", { class: "dot dot-1" }),
              vue.createElementVNode("view", { class: "dot dot-2" }),
              vue.createElementVNode("view", { class: "dot dot-3" })
            ]),
            vue.createElementVNode(
              "text",
              { class: "loading-text" },
              vue.toDisplayString($setup.loadingText),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["footer-section", { "animate": $setup.showFooter }])
        },
        [
          vue.createElementVNode(
            "text",
            { class: "version" },
            vue.toDisplayString($setup.versionText),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "copyright" },
            "© 2026 " + vue.toDisplayString($setup.modeName) + "系统",
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "disclaimer" },
            vue.toDisplayString($setup.disclaimer),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )
    ]);
  }
  const PagesSplashIndex = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-3709ed17"], ["__file", "G:/YIYAO/medicine-app/pages/splash/index.vue"]]);
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LAUNCH = "onLaunch";
  const ON_LOAD = "onLoad";
  const ON_REACH_BOTTOM = "onReachBottom";
  const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onHide = /* @__PURE__ */ createLifeCycleHook(
    ON_HIDE,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLaunch = /* @__PURE__ */ createLifeCycleHook(
    ON_LAUNCH,
    1
    /* HookFlags.APP */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const onReachBottom = /* @__PURE__ */ createLifeCycleHook(
    ON_REACH_BOTTOM,
    2
    /* HookFlags.PAGE */
  );
  const onPullDownRefresh = /* @__PURE__ */ createLifeCycleHook(
    ON_PULL_DOWN_REFRESH,
    2
    /* HookFlags.PAGE */
  );
  const BASE_URL = "http://192.168.3.2:8000/api";
  const TIMEOUT = 1e4;
  let isRedirectingToLogin = false;
  function detectSuspiciousInput(value) {
    if (typeof value !== "string")
      return false;
    const suspiciousPatterns = [
      /<script\b/i,
      // script标签
      /javascript\s*:/i,
      // javascript协议
      /on\w+\s*=\s*["']/i
      // 事件处理器（更严格的匹配）
    ];
    return suspiciousPatterns.some((pattern) => pattern.test(value));
  }
  function getToken() {
    try {
      return uni.getStorageSync("token") || "";
    } catch (e) {
      return "";
    }
  }
  function requestInterceptor(options) {
    const token = getToken();
    if (token) {
      options.header = {
        ...options.header,
        "Authorization": `Bearer ${token}`
      };
    }
    if (options.showLoading !== false) {
      uni.showLoading({
        title: "加载中...",
        mask: true
      });
    }
    return options;
  }
  function responseInterceptor(response, options) {
    var _a, _b;
    if (options.showLoading !== false) {
      uni.hideLoading();
    }
    const { statusCode, data } = response;
    if (statusCode === 200) {
      return data;
    }
    if (statusCode === 401) {
      uni.removeStorageSync("token");
      uni.removeStorageSync("userInfo");
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const currentPath = (currentPage == null ? void 0 : currentPage.route) || "";
        if (!currentPath.includes("login") && !currentPath.includes("splash")) {
          uni.reLaunch({
            url: "/pages/login/index",
            complete: () => {
              setTimeout(() => {
                isRedirectingToLogin = false;
              }, 1e3);
            }
          });
        } else {
          isRedirectingToLogin = false;
        }
      }
      throw new Error("登录已过期，请重新登录");
    }
    let errorMsg = (data == null ? void 0 : data.message) || (data == null ? void 0 : data.detail) || "请求失败";
    if (statusCode === 422 && ((_a = data == null ? void 0 : data.details) == null ? void 0 : _a.errors)) {
      const errors = data.details.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        const firstError = errors[0];
        const field = ((_b = firstError.loc) == null ? void 0 : _b.join(".")) || "";
        const msg = firstError.msg || "";
        errorMsg = field ? `${field}: ${msg}` : msg;
      }
    }
    formatAppLog("error", "at src/utils/request.ts:175", `[请求错误] ${statusCode}:`, errorMsg, data);
    if (options.showError !== false) {
      uni.showToast({
        title: errorMsg,
        icon: "none",
        duration: 3e3
      });
    }
    throw new Error(errorMsg);
  }
  function request(options) {
    return new Promise((resolve, reject) => {
      if (options.data && !options.skipSanitize) {
        const dataStr = JSON.stringify(options.data);
        if (detectSuspiciousInput(dataStr)) {
          formatAppLog("warn", "at src/utils/request.ts:197", "检测到可疑输入，已阻止请求");
          reject(new Error("输入包含非法字符"));
          return;
        }
      }
      const requestOptions = requestInterceptor({
        ...options,
        url: BASE_URL + options.url,
        method: options.method || "GET",
        timeout: TIMEOUT,
        header: {
          "Content-Type": "application/json",
          ...options.header
        }
      });
      uni.request({
        ...requestOptions,
        success: (res) => {
          try {
            const data = responseInterceptor(res, options);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        fail: (err) => {
          if (options.showLoading !== false) {
            uni.hideLoading();
          }
          const errorMsg = "网络请求失败，请检查网络连接";
          if (options.showError !== false) {
            uni.showToast({
              title: errorMsg,
              icon: "none"
            });
          }
          reject(new Error(errorMsg));
        }
      });
    });
  }
  const http = {
    get(url, data, options) {
      return request({
        url,
        method: "GET",
        data,
        ...options
      });
    },
    post(url, data, options) {
      return request({
        url,
        method: "POST",
        data,
        ...options
      });
    },
    put(url, data, options) {
      return request({
        url,
        method: "PUT",
        data,
        ...options
      });
    },
    delete(url, data, options) {
      return request({
        url,
        method: "DELETE",
        data,
        ...options
      });
    }
  };
  const authApi = {
    /**
     * 登录
     */
    login(data) {
      return http.post("/auth/login", data);
    },
    /**
     * 发送短信验证码
     */
    sendSmsCode(phone) {
      return http.post("/auth/sms/send", { phone });
    },
    /**
     * 短信验证码登录
     */
    smsLogin(phone, code) {
      return http.post("/auth/sms/login", { phone, code });
    },
    /**
     * 获取当前用户信息
     */
    getCurrentUser() {
      return http.get("/auth/me");
    },
    /**
     * 更新用户使用场景
     */
    updateUserMode(mode) {
      return http.put(`/auth/mode?mode=${mode}`);
    },
    /**
     * 退出登录
     */
    logout() {
      return http.post("/auth/logout");
    }
  };
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      function updateTabBarText2() {
        const config = getCurrentModeConfig();
        const itemTerm = config.terminology.item;
        uni.setTabBarItem({
          index: 1,
          text: itemTerm
        });
      }
      const modeList = vue.ref([
        {
          id: "medicine",
          name: "药品管理",
          icon: "💊",
          description: "专业的药品库存管理系统",
          features: ["药品入库", "效期预警", "智能提醒", "用药记录"]
        },
        {
          id: "inventory",
          name: "库存管理",
          icon: "📦",
          description: "通用商品库存管理系统",
          features: ["商品入库", "库存盘点", "出入库记录", "数据统计"]
        },
        {
          id: "food",
          name: "食品管理",
          icon: "🍱",
          description: "食品安全与保质期管理",
          features: ["食品入库", "保质期提醒", "批次追溯", "安全管理"]
        }
      ]);
      const selectedMode = vue.ref("");
      function selectMode(modeId) {
        selectedMode.value = modeId;
      }
      async function confirmMode() {
        var _a;
        if (!selectedMode.value) {
          uni.showToast({ title: "请选择使用场景", icon: "none" });
          return;
        }
        const oldMode = uni.getStorageSync("app_mode");
        try {
          await authApi.updateUserMode(selectedMode.value);
          uni.setStorageSync("app_mode", selectedMode.value);
          updateTabBarText2();
          const modeName = ((_a = modeList.value.find((m) => m.id === selectedMode.value)) == null ? void 0 : _a.name) || "";
          uni.showToast({
            title: `已切换到${modeName}模式`,
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            if (oldMode) {
              uni.reLaunch({
                url: "/pages/index/index",
                success: () => {
                  uni.$emit("modeChanged");
                }
              });
            } else {
              uni.switchTab({ url: "/pages/index/index" });
            }
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/select-mode/index.vue:152", "切换场景失败:", error);
          uni.showToast({
            title: "切换场景失败，请重试",
            icon: "none"
          });
        }
      }
      async function skipSelection() {
        uni.showModal({
          title: "提示",
          content: "跳过后将默认使用药品管理模式，您可以稍后在设置中更改",
          confirmText: "确定跳过",
          cancelText: "返回选择",
          success: async (res) => {
            if (res.confirm) {
              try {
                await authApi.updateUserMode("medicine");
                uni.setStorageSync("app_mode", "medicine");
                updateTabBarText2();
                uni.switchTab({ url: "/pages/index/index" });
              } catch (error) {
                formatAppLog("error", "at pages/select-mode/index.vue:181", "设置默认场景失败:", error);
                uni.setStorageSync("app_mode", "medicine");
                updateTabBarText2();
                uni.switchTab({ url: "/pages/index/index" });
              }
            }
          }
        });
      }
      const __returned__ = { updateTabBarText: updateTabBarText2, modeList, selectedMode, selectMode, confirmMode, skipSelection };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "select-mode-page" }, [
      vue.createElementVNode("view", { class: "bg-decoration" }, [
        vue.createElementVNode("view", { class: "circle circle-1" }),
        vue.createElementVNode("view", { class: "circle circle-2" })
      ]),
      vue.createElementVNode("view", { class: "content-container" }, [
        vue.createElementVNode("view", { class: "header-section" }, [
          vue.createElementVNode("text", { class: "main-title" }, "选择使用场景"),
          vue.createElementVNode("text", { class: "sub-title" }, "智管云支持多种管理场景，请选择您的使用需求")
        ]),
        vue.createElementVNode("scroll-view", {
          class: "mode-list",
          "scroll-y": ""
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.modeList, (mode) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: mode.id,
                class: vue.normalizeClass(["mode-card", { selected: $setup.selectedMode === mode.id }]),
                onClick: ($event) => $setup.selectMode(mode.id)
              }, [
                vue.createElementVNode("view", { class: "mode-icon-wrap" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "mode-icon" },
                    vue.toDisplayString(mode.icon),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "mode-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "mode-name" },
                    vue.toDisplayString(mode.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "mode-desc" },
                    vue.toDisplayString(mode.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "mode-features" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(mode.features, (feature, index) => {
                        return vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: index,
                            class: "feature-tag"
                          },
                          vue.toDisplayString(feature),
                          1
                          /* TEXT */
                        );
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]),
                vue.createElementVNode("view", { class: "mode-check" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "check-icon" },
                    vue.toDisplayString($setup.selectedMode === mode.id ? "✓" : ""),
                    1
                    /* TEXT */
                  )
                ])
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "footer-actions" }, [
          vue.createElementVNode("button", {
            class: "confirm-btn",
            disabled: !$setup.selectedMode,
            onClick: $setup.confirmMode
          }, [
            vue.createElementVNode("text", { class: "btn-text" }, "确认进入")
          ], 8, ["disabled"]),
          vue.createElementVNode("text", {
            class: "skip-text",
            onClick: $setup.skipSelection
          }, "暂时跳过，稍后设置")
        ])
      ])
    ]);
  }
  const PagesSelectModeIndex = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-c660ea4c"], ["__file", "G:/YIYAO/medicine-app/pages/select-mode/index.vue"]]);
  const dashboardApi = {
    /**
     * 获取统计数据
     */
    getStats() {
      return http.get("/dashboard/stats");
    }
  };
  const warningApi = {
    /**
     * 获取预警列表
     */
    list(params) {
      return http.get("/warnings", params);
    },
    /**
     * 标记预警为已读
     */
    markAsRead(id) {
      return http.put(`/warnings/${id}/read`);
    },
    /**
     * 一键全部标记已读
     */
    markAllAsRead() {
      return http.put("/warnings/read-all");
    },
    /**
     * 检查并生成预警
     */
    checkWarnings() {
      return http.post("/warnings/check");
    },
    /**
     * 获取预警配置
     */
    getConfig() {
      return http.get("/warnings/config");
    },
    /**
     * 更新预警配置
     */
    updateConfig(data) {
      return http.put("/warnings/config", data);
    },
    /**
     * 删除单条预警
     */
    delete(id) {
      return http.delete(`/warnings/${id}`);
    },
    /**
     * 删除所有预警
     */
    deleteAll() {
      return http.delete("/warnings/batch/all");
    },
    /**
     * 删除所有已读预警
     */
    deleteRead() {
      return http.delete("/warnings/batch/read");
    },
    /**
     * 获取补货建议
     */
    getReplenishSuggestions() {
      return http.get("/warnings/replenish-suggestions");
    },
    /**
     * 计算补货建议
     */
    calculateReplenishSuggestions() {
      return http.post("/warnings/replenish-suggestions/calculate");
    }
  };
  const notificationApi = {
    /**
     * 获取待推送的通知（分别推送，每次1条）
     */
    getPending(limit = 1) {
      return http.get(
        "/notifications/pending",
        { limit }
      );
    },
    /**
     * 标记通知为已推送
     */
    markAsPushed(id) {
      return http.post(`/notifications/${id}/pushed`);
    },
    /**
     * 标记通知为已读
     */
    markAsRead(id) {
      return http.post(`/notifications/${id}/read`);
    },
    /**
     * 获取通知列表
     */
    list(params) {
      return http.get("/notifications", params);
    },
    /**
     * 获取未读通知数量
     */
    getUnreadCount() {
      return http.get("/notifications/unread-count");
    },
    /**
     * 获取推送状态
     */
    getStatus() {
      return http.get("/notifications/status");
    }
  };
  const inventoryApi = {
    /**
     * 获取库存列表
     */
    list(params) {
      const finalParams = {
        ...params,
        show_zero_stock: (params == null ? void 0 : params.show_zero_stock) ?? false
      };
      return http.get("/inventory", finalParams);
    },
    /**
     * 获取批次详情
     */
    detail(id) {
      return http.get(`/inventory/batches/${id}`);
    },
    /**
     * 药品入库
     */
    inbound(data) {
      return http.post("/inventory/inbound", data);
    },
    /**
     * 药品出库
     */
    outbound(data) {
      return http.post("/inventory/outbound", data);
    },
    /**
     * 删除库存批次
     */
    delete(id) {
      return http.delete(`/inventory/batches/${id}`);
    },
    /**
     * 更新库存批次
     */
    update(id, data) {
      return http.put(`/inventory/batches/${id}`, data);
    }
  };
  function formatDate(date, format = "YYYY-MM-DD") {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    const second = String(d.getSeconds()).padStart(2, "0");
    return format.replace("YYYY", String(year)).replace("MM", month).replace("DD", day).replace("HH", hour).replace("mm", minute).replace("ss", second);
  }
  function getDaysFromNow(date) {
    const targetDate = typeof date === "string" ? new Date(date) : date;
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diff = targetDate.getTime() - today.getTime();
    return Math.ceil(diff / (1e3 * 60 * 60 * 24));
  }
  function getExpiryStatus(expiryDate) {
    const days = getDaysFromNow(expiryDate);
    if (days < 0) {
      return {
        type: "expired",
        text: "已过期",
        color: "#F56C6C"
      };
    }
    if (days <= 90) {
      return {
        type: "expiry",
        text: "临期",
        color: "#E6A23C"
      };
    }
    return {
      type: "normal",
      text: "正常",
      color: "#67C23A"
    };
  }
  function formatRelativeTime(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    const now2 = /* @__PURE__ */ new Date();
    const diff = now2.getTime() - d.getTime();
    const minute = 60 * 1e3;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) {
      return "刚刚";
    }
    if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`;
    }
    if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`;
    }
    if (diff < 7 * day) {
      return `${Math.floor(diff / day)}天前`;
    }
    return formatDate(d);
  }
  const NOTIFICATION_INTERVAL = 60 * 1e3;
  const MAX_EMPTY_CHECKS = 3;
  const MIN_RELOAD_INTERVAL = 30 * 1e3;
  const CACHE_KEY_STATS = "home_stats_cache";
  const CACHE_KEY_WARNINGS = "home_warnings_cache";
  const CACHE_EXPIRE_TIME = 5 * 60 * 1e3;
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { terms, term, modeName, modeIcon, refreshConfig } = useMode();
      let notificationTimer = null;
      let emptyCheckCount = 0;
      let isFirstLoad = true;
      let lastLoadTime = 0;
      const currentDate = vue.computed(() => {
        const now2 = /* @__PURE__ */ new Date();
        const month = now2.getMonth() + 1;
        const day = now2.getDate();
        const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        return `${month}月${day}日 ${weekDays[now2.getDay()]}`;
      });
      const greetingText = vue.computed(() => {
        const hour = (/* @__PURE__ */ new Date()).getHours();
        if (hour >= 5 && hour < 9)
          return "早上好 🌅";
        if (hour >= 9 && hour < 12)
          return "上午好 ☀️";
        if (hour >= 12 && hour < 14)
          return "中午好 🌞";
        if (hour >= 14 && hour < 18)
          return "下午好 ☀️";
        if (hour >= 18 && hour < 22)
          return "晚上好 🌆";
        return "夜深了 🌙";
      });
      const stats = vue.ref({
        total_medicines: 0,
        total_inventory: 0,
        expired_count: 0,
        expiry_count: 0,
        low_stock_count: 0
      });
      const warnings = vue.ref([]);
      const statusBarHeight = vue.ref(44);
      try {
        const systemInfo = uni.getSystemInfoSync();
        statusBarHeight.value = systemInfo.statusBarHeight || 44;
      } catch (e) {
        statusBarHeight.value = 44;
      }
      const searchKeyword = vue.ref("");
      const showSearchResult = vue.ref(false);
      const searchLoading = vue.ref(false);
      const searchResults = vue.ref([]);
      let searchTimer = null;
      const unreadCount = vue.computed(() => {
        return warnings.value.filter((w) => !w.is_read).length;
      });
      function loadFromCache() {
        try {
          const statsCache = uni.getStorageSync(CACHE_KEY_STATS);
          if (statsCache) {
            const { data, timestamp } = JSON.parse(statsCache);
            stats.value = data;
          }
          const warningsCache = uni.getStorageSync(CACHE_KEY_WARNINGS);
          if (warningsCache) {
            const { data } = JSON.parse(warningsCache);
            warnings.value = data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:330", "读取缓存失败:", e);
        }
      }
      function saveToCache(key, data) {
        try {
          uni.setStorageSync(key, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:342", "保存缓存失败:", e);
        }
      }
      function isCacheExpired(key) {
        try {
          const cache = uni.getStorageSync(key);
          if (!cache)
            return true;
          const { timestamp } = JSON.parse(cache);
          return Date.now() - timestamp > CACHE_EXPIRE_TIME;
        } catch {
          return true;
        }
      }
      async function loadStats(forceRefresh = false) {
        try {
          const data = await dashboardApi.getStats();
          if (JSON.stringify(data) !== JSON.stringify(stats.value)) {
            stats.value = data;
          }
          saveToCache(CACHE_KEY_STATS, data);
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:368", "加载统计数据失败:", error);
        }
      }
      async function loadWarnings() {
        try {
          const res = await warningApi.list({
            page: 1,
            page_size: 10,
            is_read: false
          });
          if (JSON.stringify(res.items) !== JSON.stringify(warnings.value)) {
            warnings.value = res.items;
          }
          saveToCache(CACHE_KEY_WARNINGS, res.items);
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:386", "加载预警列表失败:", error);
        }
      }
      async function checkWarnings() {
        uni.showLoading({ title: "检查中..." });
        try {
          const res = await warningApi.checkWarnings();
          uni.hideLoading();
          if (res.generated_count > 0) {
            uni.showToast({
              title: `发现 ${res.generated_count} 条新预警`,
              icon: "none"
            });
            await loadStats();
            await loadWarnings();
          } else {
            uni.showToast({
              title: "暂无新预警",
              icon: "none"
            });
          }
        } catch (error) {
          uni.hideLoading();
        }
      }
      function goToWarnings(type) {
        if (type) {
          uni.setStorageSync("warningFilterType", type);
        } else {
          uni.removeStorageSync("warningFilterType");
        }
        uni.switchTab({ url: "/pages/warning/index" });
      }
      function goToAdd() {
        uni.navigateTo({ url: "/pages/add/index" });
      }
      function goToScanOutbound() {
        uni.scanCode({
          success: (res) => {
            const code = res.result;
            if (code) {
              uni.showModal({
                title: "扫描成功",
                content: `条形码: ${code}`,
                confirmText: "去出库",
                cancelText: "取消",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    uni.setStorageSync("scannedBarcode", code);
                    uni.navigateTo({ url: "/pages/outbound/index" });
                  }
                }
              });
            }
          },
          fail: (err) => {
            var _a;
            if (!((_a = err.errMsg) == null ? void 0 : _a.includes("cancel"))) {
              uni.showToast({ title: "扫描失败", icon: "none" });
            }
          }
        });
      }
      function goToMedicineList() {
        uni.switchTab({ url: "/pages/medicine/list" });
      }
      function onSearchInput() {
        if (searchTimer) {
          clearTimeout(searchTimer);
        }
        if (!searchKeyword.value.trim()) {
          showSearchResult.value = false;
          searchResults.value = [];
          return;
        }
        searchTimer = setTimeout(() => {
          handleSearch();
        }, 500);
      }
      async function handleSearch() {
        if (!searchKeyword.value.trim()) {
          return;
        }
        showSearchResult.value = true;
        searchLoading.value = true;
        try {
          const res = await inventoryApi.list({
            page: 1,
            page_size: 20,
            keyword: searchKeyword.value.trim()
          });
          searchResults.value = res.items;
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:498", "搜索失败:", error);
          uni.showToast({ title: "搜索失败", icon: "none" });
        } finally {
          searchLoading.value = false;
        }
      }
      function clearSearch() {
        searchKeyword.value = "";
        showSearchResult.value = false;
        searchResults.value = [];
      }
      function closeSearchResult() {
        showSearchResult.value = false;
      }
      function goToMedicineDetail(item) {
        closeSearchResult();
        uni.navigateTo({
          url: `/pages/medicine/edit?id=${item.id}&medicine_id=${item.medicine_id}`
        });
      }
      function getStatusClass(expiryDate) {
        const status = getExpiryStatus(expiryDate);
        return `status-${status.type}`;
      }
      function getStatusText(expiryDate) {
        const status = getExpiryStatus(expiryDate);
        return status.text;
      }
      function handlePhotoOutbound() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["camera", "album"],
          success: async (res) => {
            if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
              return;
            }
            const tempFilePath = res.tempFilePaths[0];
            uni.showLoading({
              title: "识别中...",
              mask: true
            });
            try {
              const uploadRes = await uni.uploadFile({
                url: "http://192.168.3.2:8000/api/ocr/recognize",
                filePath: tempFilePath,
                name: "file",
                header: {
                  "Authorization": `Bearer ${uni.getStorageSync("token")}`
                }
              });
              uni.hideLoading();
              if (uploadRes.statusCode === 200) {
                const result = JSON.parse(uploadRes.data);
                const hasValidInfo = result.name || result.batch_number;
                if (hasValidInfo) {
                  uni.setStorageSync("ocrResult", result);
                  uni.navigateTo({ url: "/pages/outbound/index" });
                } else {
                  uni.showToast({
                    title: "未识别到药品信息，请重试",
                    icon: "none",
                    duration: 2e3
                  });
                }
              } else {
                uni.showToast({
                  title: "识别失败，请重试",
                  icon: "none"
                });
              }
            } catch (error) {
              uni.hideLoading();
              uni.showToast({
                title: "识别失败，请重试",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            if (!err.errMsg.includes("cancel")) {
              uni.showToast({
                title: "拍照失败",
                icon: "none"
              });
            }
          }
        });
      }
      async function handleWarningClick(warning) {
        if (!warning.is_read) {
          try {
            await warningApi.markAsRead(warning.id);
            warning.is_read = true;
          } catch (error) {
            formatAppLog("error", "at pages/index/index.vue:613", "标记已读失败:", error);
          }
        }
      }
      function getWarningClass(type) {
        const classMap = {
          expired: "type-expired",
          expiry: "type-expiry",
          low_stock: "type-low-stock"
        };
        return classMap[type] || "type-low-stock";
      }
      function getWarningIcon(type) {
        const iconMap = {
          expired: "🚨",
          expiry: "⏰",
          low_stock: "📦"
        };
        return iconMap[type] || "⚠️";
      }
      function getWarningText(type) {
        const textMap = {
          expired: "已过期",
          expiry: "临期",
          low_stock: "低库存"
        };
        return textMap[type] || "预警";
      }
      function formatTime(time) {
        return formatRelativeTime(time);
      }
      onPullDownRefresh(async () => {
        await Promise.all([loadStats(), loadWarnings()]);
        lastLoadTime = Date.now();
        uni.stopPullDownRefresh();
      });
      async function checkAndPushNotification() {
        try {
          const res = await notificationApi.getPending(1);
          if (res.items && res.items.length > 0) {
            const notification = res.items[0];
            emptyCheckCount = 0;
            uni.showModal({
              title: notification.title,
              content: notification.content,
              showCancel: true,
              cancelText: "稍后查看",
              confirmText: "立即查看",
              success: async (modalRes) => {
                try {
                  await notificationApi.markAsRead(notification.id);
                } catch (e) {
                  formatAppLog("error", "at pages/index/index.vue:683", "标记已读失败:", e);
                }
                if (modalRes.confirm) {
                  uni.switchTab({ url: "/pages/warning/index" });
                }
              }
            });
            await notificationApi.markAsPushed(notification.id);
            await loadWarnings();
          } else {
            emptyCheckCount++;
            if (emptyCheckCount >= MAX_EMPTY_CHECKS) {
              stopNotificationPolling();
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:707", "推送通知检查失败:", error);
        }
      }
      function startNotificationPolling() {
        if (notificationTimer)
          return;
        const hasWarnings = stats.value.expired_count > 0 || stats.value.expiry_count > 0 || stats.value.low_stock_count > 0;
        if (!hasWarnings) {
          return;
        }
        emptyCheckCount = 0;
        setTimeout(() => {
          if (!notificationTimer)
            return;
          checkAndPushNotification();
        }, 1e4);
        notificationTimer = setInterval(() => {
          checkAndPushNotification();
        }, NOTIFICATION_INTERVAL);
      }
      function stopNotificationPolling() {
        if (notificationTimer) {
          clearInterval(notificationTimer);
          notificationTimer = null;
        }
      }
      vue.onMounted(async () => {
        const hasCache = uni.getStorageSync(CACHE_KEY_STATS);
        if (hasCache) {
          loadFromCache();
          Promise.all([loadStats(), loadWarnings()]).then(() => {
            lastLoadTime = Date.now();
            isFirstLoad = false;
            startNotificationPolling();
          });
        } else {
          await Promise.all([loadStats(), loadWarnings()]);
          lastLoadTime = Date.now();
          isFirstLoad = false;
          startNotificationPolling();
        }
      });
      onShow(async () => {
        refreshConfig();
        const now2 = Date.now();
        if (!isFirstLoad && now2 - lastLoadTime > MIN_RELOAD_INTERVAL) {
          Promise.all([loadStats(), loadWarnings()]).then(() => {
            lastLoadTime = now2;
          });
        }
        if (!notificationTimer) {
          startNotificationPolling();
        }
      });
      onHide(() => {
        stopNotificationPolling();
      });
      vue.onUnmounted(() => {
        stopNotificationPolling();
      });
      const __returned__ = { terms, term, modeName, modeIcon, refreshConfig, get notificationTimer() {
        return notificationTimer;
      }, set notificationTimer(v) {
        notificationTimer = v;
      }, NOTIFICATION_INTERVAL, get emptyCheckCount() {
        return emptyCheckCount;
      }, set emptyCheckCount(v) {
        emptyCheckCount = v;
      }, MAX_EMPTY_CHECKS, get isFirstLoad() {
        return isFirstLoad;
      }, set isFirstLoad(v) {
        isFirstLoad = v;
      }, get lastLoadTime() {
        return lastLoadTime;
      }, set lastLoadTime(v) {
        lastLoadTime = v;
      }, MIN_RELOAD_INTERVAL, CACHE_KEY_STATS, CACHE_KEY_WARNINGS, CACHE_EXPIRE_TIME, currentDate, greetingText, stats, warnings, statusBarHeight, searchKeyword, showSearchResult, searchLoading, searchResults, get searchTimer() {
        return searchTimer;
      }, set searchTimer(v) {
        searchTimer = v;
      }, unreadCount, loadFromCache, saveToCache, isCacheExpired, loadStats, loadWarnings, checkWarnings, goToWarnings, goToAdd, goToScanOutbound, goToMedicineList, onSearchInput, handleSearch, clearSearch, closeSearchResult, goToMedicineDetail, getStatusClass, getStatusText, handlePhotoOutbound, handleWarningClick, getWarningClass, getWarningIcon, getWarningText, formatTime, checkAndPushNotification, startNotificationPolling, stopNotificationPolling };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "home-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "fixed-status-bar",
          style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
        },
        null,
        4
        /* STYLE */
      ),
      vue.createElementVNode(
        "view",
        {
          class: "page-content",
          style: vue.normalizeStyle({ paddingTop: $setup.statusBarHeight + "px" })
        },
        [
          vue.createElementVNode("view", { class: "header-section" }, [
            vue.createElementVNode("view", { class: "custom-navbar" }, [
              vue.createElementVNode("view", { class: "navbar-left" }, [
                vue.createElementVNode(
                  "text",
                  { class: "greeting-text" },
                  vue.toDisplayString($setup.greetingText),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "notification-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.goToWarnings())
              }, [
                vue.createElementVNode("text", { class: "notification-icon" }, "🔔"),
                $setup.unreadCount > 0 ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "notification-badge"
                  },
                  vue.toDisplayString($setup.unreadCount > 99 ? "99+" : $setup.unreadCount),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createElementVNode("view", { class: "search-box" }, [
              vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "search-input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.searchKeyword = $event),
                placeholder: `搜索${$setup.term("item")}名称、${$setup.term("batch")}...`,
                "placeholder-class": "search-placeholder",
                "confirm-type": "search",
                onConfirm: $setup.handleSearch,
                onInput: $setup.onSearchInput
              }, null, 40, ["placeholder"]), [
                [vue.vModelText, $setup.searchKeyword]
              ]),
              $setup.searchKeyword ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "clear-btn",
                onClick: $setup.clearSearch
              }, "✕")) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", {
                class: "search-btn",
                onClick: $setup.handleSearch
              }, [
                vue.createElementVNode("text", { class: "search-btn-text" }, "搜索")
              ])
            ]),
            $setup.showSearchResult ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "search-result-overlay",
              onClick: $setup.closeSearchResult
            }, [
              vue.createElementVNode("view", {
                class: "search-result-panel",
                onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
                }, ["stop"]))
              }, [
                vue.createElementVNode("view", { class: "result-header" }, [
                  vue.createElementVNode("text", { class: "result-title" }, "搜索结果"),
                  vue.createElementVNode("text", {
                    class: "result-close",
                    onClick: $setup.closeSearchResult
                  }, "✕")
                ]),
                $setup.searchLoading ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "result-loading"
                }, [
                  vue.createElementVNode("text", { class: "loading-icon" }, "⏳"),
                  vue.createElementVNode("text", { class: "loading-text" }, "搜索中...")
                ])) : $setup.searchResults.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "result-empty"
                }, [
                  vue.createElementVNode("text", { class: "empty-icon" }, "🔍"),
                  vue.createElementVNode(
                    "text",
                    { class: "empty-text" },
                    "未找到相关" + vue.toDisplayString($setup.term("item")),
                    1
                    /* TEXT */
                  )
                ])) : (vue.openBlock(), vue.createElementBlock("scroll-view", {
                  key: 2,
                  class: "result-list",
                  "scroll-y": ""
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.searchResults, (item) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: item.id,
                        class: "result-item",
                        onClick: ($event) => $setup.goToMedicineDetail(item)
                      }, [
                        vue.createElementVNode("view", { class: "result-item-left" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "result-name" },
                            vue.toDisplayString(item.medicine_name),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "result-info" },
                            vue.toDisplayString($setup.term("batch")) + ": " + vue.toDisplayString(item.batch_number) + " | " + vue.toDisplayString($setup.term("inventory")) + ": " + vue.toDisplayString(item.quantity) + vue.toDisplayString(item.medicine_unit || $setup.term("itemUnit")),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["result-status", $setup.getStatusClass(item.expiry_date)])
                          },
                          vue.toDisplayString($setup.getStatusText(item.expiry_date)),
                          3
                          /* TEXT, CLASS */
                        )
                      ], 8, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]))
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "main-stats-card" }, [
              vue.createElementVNode("view", { class: "stats-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stats-title" },
                  vue.toDisplayString($setup.term("inventory")) + "概览",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stats-date" },
                  vue.toDisplayString($setup.currentDate),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "stats-row" }, [
                vue.createElementVNode("view", { class: "main-stat" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "main-stat-value" },
                    vue.toDisplayString($setup.stats.total_medicines),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "main-stat-label" },
                    vue.toDisplayString($setup.term("item")) + "种类",
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "stats-divider" }),
                vue.createElementVNode("view", { class: "main-stat" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "main-stat-value" },
                    vue.toDisplayString($setup.stats.total_inventory),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "main-stat-label" },
                    vue.toDisplayString($setup.term("inventory")) + "总量",
                    1
                    /* TEXT */
                  )
                ])
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "alert-cards" }, [
            vue.createElementVNode("view", {
              class: "alert-card expired",
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.goToWarnings("expired"))
            }, [
              vue.createElementVNode("view", { class: "alert-icon-wrap" }, [
                vue.createElementVNode("text", { class: "alert-icon" }, "🚨")
              ]),
              vue.createElementVNode(
                "text",
                { class: "alert-value" },
                vue.toDisplayString($setup.stats.expired_count),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "alert-label" }, "已过期")
            ]),
            vue.createElementVNode("view", {
              class: "alert-card warning",
              onClick: _cache[4] || (_cache[4] = ($event) => $setup.goToWarnings("expiry"))
            }, [
              vue.createElementVNode("view", { class: "alert-icon-wrap" }, [
                vue.createElementVNode("text", { class: "alert-icon" }, "⏰")
              ]),
              vue.createElementVNode(
                "text",
                { class: "alert-value" },
                vue.toDisplayString($setup.stats.expiry_count),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "alert-label" }, "临期预警")
            ]),
            vue.createElementVNode("view", {
              class: "alert-card low-stock",
              onClick: _cache[5] || (_cache[5] = ($event) => $setup.goToWarnings("low_stock"))
            }, [
              vue.createElementVNode("view", { class: "alert-icon-wrap" }, [
                vue.createElementVNode("text", { class: "alert-icon" }, "📦")
              ]),
              vue.createElementVNode(
                "text",
                { class: "alert-value" },
                vue.toDisplayString($setup.stats.low_stock_count),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "alert-label" }, "低库存")
            ])
          ]),
          vue.createElementVNode("view", { class: "quick-section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "快捷操作")
            ]),
            vue.createElementVNode("view", { class: "outbound-card" }, [
              vue.createElementVNode("view", { class: "outbound-left" }, [
                vue.createElementVNode("view", {
                  class: "outbound-btn",
                  onClick: $setup.goToScanOutbound
                }, [
                  vue.createElementVNode("text", { class: "outbound-btn-icon" }, "📷"),
                  vue.createElementVNode("text", { class: "outbound-btn-text" }, "扫码")
                ]),
                vue.createElementVNode("view", {
                  class: "outbound-btn",
                  onClick: $setup.handlePhotoOutbound
                }, [
                  vue.createElementVNode("text", { class: "outbound-btn-icon" }, "📤"),
                  vue.createElementVNode("text", { class: "outbound-btn-text" }, "拍照")
                ])
              ]),
              vue.createElementVNode("view", { class: "outbound-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "outbound-title" },
                  "快速" + vue.toDisplayString($setup.term("outbound")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "outbound-desc" },
                  "扫码或拍照识别" + vue.toDisplayString($setup.term("item")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "outbound-arrow" }, "›")
            ]),
            vue.createElementVNode("view", { class: "quick-grid" }, [
              vue.createElementVNode("view", {
                class: "quick-item",
                onClick: $setup.goToAdd
              }, [
                vue.createElementVNode("view", { class: "quick-icon-wrap add" }, [
                  vue.createElementVNode("text", { class: "quick-icon" }, "📥")
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "quick-text" },
                  vue.toDisplayString($setup.term("inbound")) + "登记",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "quick-item",
                onClick: $setup.checkWarnings
              }, [
                vue.createElementVNode("view", { class: "quick-icon-wrap check" }, [
                  vue.createElementVNode("text", { class: "quick-icon" }, "🔍")
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "quick-text" },
                  "检查" + vue.toDisplayString($setup.term("warning")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "quick-item",
                onClick: $setup.goToMedicineList
              }, [
                vue.createElementVNode("view", { class: "quick-icon-wrap list" }, [
                  vue.createElementVNode("text", { class: "quick-icon" }, "📋")
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "quick-text" },
                  vue.toDisplayString($setup.term("list")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "quick-item",
                onClick: _cache[6] || (_cache[6] = ($event) => $setup.goToWarnings())
              }, [
                vue.createElementVNode("view", { class: "quick-icon-wrap warning" }, [
                  vue.createElementVNode("text", { class: "quick-icon" }, "⚠️")
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "quick-text" },
                  vue.toDisplayString($setup.term("warning")) + "管理",
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "warnings-section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode(
                "text",
                { class: "section-title" },
                "最近" + vue.toDisplayString($setup.term("warning")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", {
                class: "section-more",
                onClick: _cache[7] || (_cache[7] = ($event) => $setup.goToWarnings())
              }, "查看全部 ›")
            ]),
            $setup.warnings.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "empty-state"
            }, [
              vue.createElementVNode("view", { class: "empty-icon-wrap" }, [
                vue.createElementVNode("text", { class: "empty-icon" }, "✅")
              ]),
              vue.createElementVNode("text", { class: "empty-title" }, "一切正常"),
              vue.createElementVNode(
                "text",
                { class: "empty-desc" },
                "暂无" + vue.toDisplayString($setup.term("warning")) + "信息，继续保持！",
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $setup.warnings.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "warning-list"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.warnings.slice(0, 5), (warning, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: warning.id,
                    class: vue.normalizeClass(["warning-card", { "is-read": warning.is_read }]),
                    style: vue.normalizeStyle({ animationDelay: index * 0.1 + "s" }),
                    onClick: ($event) => $setup.handleWarningClick(warning)
                  }, [
                    vue.createElementVNode("view", { class: "warning-left" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["warning-type-icon", $setup.getWarningClass(warning.type)])
                        },
                        vue.toDisplayString($setup.getWarningIcon(warning.type)),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "warning-center" }, [
                      vue.createElementVNode("view", { class: "warning-title-row" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "warning-medicine" },
                          vue.toDisplayString(warning.medicine_name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["warning-tag", $setup.getWarningClass(warning.type)])
                          },
                          vue.toDisplayString($setup.getWarningText(warning.type)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      vue.createElementVNode(
                        "text",
                        { class: "warning-message" },
                        vue.toDisplayString(warning.message),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "warning-time" },
                        vue.toDisplayString($setup.formatTime(warning.created_at)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "warning-right" }, [
                      vue.createElementVNode("text", { class: "warning-arrow" }, "›")
                    ])
                  ], 14, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "safe-bottom" })
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-1cf27b2a"], ["__file", "G:/YIYAO/medicine-app/pages/index/index.vue"]]);
  const pageSize$1 = 20;
  const SWIPE_THRESHOLD = 160;
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    __name: "list",
    setup(__props, { expose: __expose }) {
      __expose();
      const { term, refreshConfig } = useMode();
      const list = vue.ref([]);
      const loading = vue.ref(false);
      const loadingMore = vue.ref(false);
      const keyword = vue.ref("");
      const filterStatus = vue.ref("");
      const showFilterPopup = vue.ref(false);
      const page = vue.ref(1);
      const total = vue.ref(0);
      const hasMore = vue.computed(() => list.value.length < total.value);
      const swipeState = vue.ref({});
      const touchStartX = vue.ref(0);
      const touchStartY = vue.ref(0);
      const currentSwipeId = vue.ref(null);
      const isMoving = vue.ref(false);
      function getSwipeOffset(id) {
        return swipeState.value[id] || 0;
      }
      function onTouchStart(e, id) {
        if (currentSwipeId.value !== null && currentSwipeId.value !== id) {
          swipeState.value[currentSwipeId.value] = 0;
        }
        touchStartX.value = e.touches[0].clientX;
        touchStartY.value = e.touches[0].clientY;
        currentSwipeId.value = id;
        isMoving.value = false;
        isHorizontalSwipe.value = false;
      }
      const isHorizontalSwipe = vue.ref(false);
      function onTouchMove(e, id) {
        if (currentSwipeId.value !== id)
          return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX.value;
        const deltaY = touch.clientY - touchStartY.value;
        if (!isHorizontalSwipe.value && !isMoving.value) {
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
            isHorizontalSwipe.value = true;
          } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
            return;
          }
        }
        if (isHorizontalSwipe.value) {
          isMoving.value = true;
          let newOffset = (swipeState.value[id] || 0) + deltaX;
          if (newOffset > 0)
            newOffset = 0;
          if (newOffset < -SWIPE_THRESHOLD)
            newOffset = -SWIPE_THRESHOLD;
          swipeState.value[id] = newOffset;
          touchStartX.value = touch.clientX;
          touchStartY.value = touch.clientY;
        }
      }
      function onTouchEnd(e, id) {
        if (currentSwipeId.value !== id)
          return;
        const currentOffset = swipeState.value[id] || 0;
        if (currentOffset < -SWIPE_THRESHOLD / 2) {
          swipeState.value[id] = -SWIPE_THRESHOLD;
        } else {
          swipeState.value[id] = 0;
          currentSwipeId.value = null;
        }
        isHorizontalSwipe.value = false;
      }
      function handleItemClick(item) {
        if (isMoving.value)
          return;
        const offset = swipeState.value[item.id] || 0;
        if (offset < 0) {
          swipeState.value[item.id] = 0;
          currentSwipeId.value = null;
          return;
        }
        goToDetail(item);
      }
      function handleEdit(item) {
        swipeState.value[item.id] = 0;
        currentSwipeId.value = null;
        uni.navigateTo({
          url: `/pages/medicine/edit?id=${item.id}&medicine_id=${item.medicine_id}`
        });
      }
      function handleDelete(item) {
        swipeState.value[item.id] = 0;
        currentSwipeId.value = null;
        uni.showModal({
          title: "确认删除",
          content: `确定要删除"${item.medicine_name}"的这条库存记录吗？`,
          confirmColor: "#F56C6C",
          success: async (res) => {
            if (res.confirm) {
              try {
                await inventoryApi.delete(item.id);
                uni.showToast({ title: "删除成功", icon: "success" });
                list.value = list.value.filter((i) => i.id !== item.id);
                total.value--;
              } catch (error) {
                formatAppLog("error", "at pages/medicine/list.vue:375", "删除失败:", error);
                uni.showToast({ title: "删除失败", icon: "none" });
              }
            }
          }
        });
      }
      const expiredCount = vue.computed(() => {
        return list.value.filter((item) => getDaysFromNow(item.expiry_date) < 0).length;
      });
      const expiryCount = vue.computed(() => {
        return list.value.filter((item) => {
          const days = getDaysFromNow(item.expiry_date);
          return days >= 0 && days <= 90;
        }).length;
      });
      const normalCount = vue.computed(() => {
        return list.value.filter((item) => getDaysFromNow(item.expiry_date) > 90).length;
      });
      const statusOptions = [
        { label: "全部", value: "" },
        { label: "已过期", value: "expired" },
        { label: "临期", value: "expiry" },
        { label: "正常", value: "normal" }
      ];
      async function loadList(isRefresh = false) {
        if (isRefresh) {
          page.value = 1;
          list.value = [];
        }
        if (page.value === 1) {
          loading.value = true;
        } else {
          loadingMore.value = true;
        }
        try {
          const res = await inventoryApi.list({
            page: page.value,
            page_size: pageSize$1,
            keyword: keyword.value || void 0
          });
          let items = res.items;
          if (filterStatus.value) {
            items = items.filter((item) => {
              const days = getDaysFromNow(item.expiry_date);
              if (filterStatus.value === "expired") {
                return days < 0;
              } else if (filterStatus.value === "expiry") {
                return days >= 0 && days <= 90;
              } else if (filterStatus.value === "normal") {
                return days > 90;
              }
              return true;
            });
          }
          if (isRefresh) {
            list.value = items;
          } else {
            list.value = [...list.value, ...items];
          }
          total.value = res.total;
        } catch (error) {
          formatAppLog("error", "at pages/medicine/list.vue:455", "加载列表失败:", error);
        } finally {
          loading.value = false;
          loadingMore.value = false;
        }
      }
      function loadMore() {
        if (loadingMore.value || !hasMore.value)
          return;
        page.value++;
        loadList();
      }
      let searchTimer = null;
      function onSearchInput() {
        if (searchTimer) {
          clearTimeout(searchTimer);
        }
        if (!keyword.value.trim()) {
          loadList(true);
          return;
        }
        searchTimer = setTimeout(() => {
          loadList(true);
        }, 500);
      }
      function handleSearch() {
        if (searchTimer) {
          clearTimeout(searchTimer);
          searchTimer = null;
        }
        loadList(true);
      }
      function clearSearch() {
        keyword.value = "";
        loadList(true);
      }
      function selectFilter(value) {
        filterStatus.value = value;
        loadList(true);
      }
      function applyFilter() {
        showFilterPopup.value = false;
        loadList(true);
      }
      function resetFilter() {
        filterStatus.value = "";
        keyword.value = "";
        showFilterPopup.value = false;
        loadList(true);
      }
      function goToDetail(item) {
        uni.navigateTo({
          url: `/pages/medicine/detail?id=${item.id}`
        });
      }
      function getStatusClass(expiryDate) {
        const status = getExpiryStatus(expiryDate);
        return `status-${status.type}`;
      }
      function getStatusText(expiryDate) {
        const status = getExpiryStatus(expiryDate);
        return status.text;
      }
      function getDaysClass(expiryDate) {
        const days = getDaysFromNow(expiryDate);
        if (days < 0)
          return "danger";
        if (days <= 90)
          return "warning";
        return "normal";
      }
      function getDaysText(expiryDate) {
        const days = getDaysFromNow(expiryDate);
        if (days < 0)
          return `已过期 ${Math.abs(days)} 天`;
        if (days === 0)
          return "今天过期";
        return `剩余 ${days} 天`;
      }
      onPullDownRefresh(async () => {
        await loadList(true);
        uni.stopPullDownRefresh();
      });
      onReachBottom(() => {
        loadMore();
      });
      let isFirstLoad = true;
      onLoad(() => {
        loadList(true);
        isFirstLoad = false;
      });
      onShow(() => {
        refreshConfig();
        uni.setNavigationBarTitle({
          title: term("list")
        });
        if (!isFirstLoad) {
          loadList(true);
        }
      });
      const __returned__ = { term, refreshConfig, list, loading, loadingMore, keyword, filterStatus, showFilterPopup, page, pageSize: pageSize$1, total, hasMore, swipeState, touchStartX, touchStartY, currentSwipeId, isMoving, SWIPE_THRESHOLD, getSwipeOffset, onTouchStart, isHorizontalSwipe, onTouchMove, onTouchEnd, handleItemClick, handleEdit, handleDelete, expiredCount, expiryCount, normalCount, statusOptions, loadList, loadMore, get searchTimer() {
        return searchTimer;
      }, set searchTimer(v) {
        searchTimer = v;
      }, onSearchInput, handleSearch, clearSearch, selectFilter, applyFilter, resetFilter, goToDetail, getStatusClass, getStatusText, getDaysClass, getDaysText, get isFirstLoad() {
        return isFirstLoad;
      }, set isFirstLoad(v) {
        isFirstLoad = v;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "medicine-list-page" }, [
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("view", { class: "search-input-wrapper" }, [
          vue.createElementVNode("text", { class: "search-icon-left" }, "🔍"),
          vue.withDirectives(vue.createElementVNode("input", {
            class: "search-input",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.keyword = $event),
            placeholder: `搜索${$setup.term("item")}名称`,
            onConfirm: $setup.handleSearch,
            onInput: $setup.onSearchInput,
            "confirm-type": "search"
          }, null, 40, ["placeholder"]), [
            [vue.vModelText, $setup.keyword]
          ]),
          $setup.keyword ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "clear-icon",
            onClick: $setup.clearSearch
          }, "✕")) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("button", {
          class: "search-btn",
          onClick: $setup.handleSearch
        }, [
          vue.createElementVNode("text", null, "搜索")
        ])
      ]),
      vue.createElementVNode("view", { class: "stats-bar" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.total),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总数")
        ]),
        vue.createElementVNode("view", { class: "stat-divider" }),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value expired" },
            vue.toDisplayString($setup.expiredCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "已过期")
        ]),
        vue.createElementVNode("view", { class: "stat-divider" }),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value warning" },
            vue.toDisplayString($setup.expiryCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "临期")
        ]),
        vue.createElementVNode("view", { class: "stat-divider" }),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value normal" },
            vue.toDisplayString($setup.normalCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "正常")
        ])
      ]),
      vue.createElementVNode("view", { class: "filter-bar" }, [
        vue.createElementVNode("scroll-view", {
          class: "filter-scroll",
          "scroll-x": "",
          "show-scrollbar": false
        }, [
          vue.createElementVNode("view", { class: "filter-chips" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.statusOptions, (status) => {
                return vue.createElementVNode("view", {
                  key: status.value,
                  class: vue.normalizeClass(["filter-chip", { active: $setup.filterStatus === status.value }]),
                  onClick: ($event) => $setup.selectFilter(status.value)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "chip-text" },
                    vue.toDisplayString(status.label),
                    1
                    /* TEXT */
                  ),
                  $setup.filterStatus === status.value ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "chip-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ]),
      $setup.loading && $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-state"
      }, [
        vue.createElementVNode("text", { class: "loading-icon" }, "⏳"),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode(
          "text",
          { class: "empty-icon" },
          vue.toDisplayString($setup.keyword ? "🔍" : "📦"),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "empty-text" },
          vue.toDisplayString($setup.keyword ? `未找到相关${$setup.term("item")}` : `暂无${$setup.term("item")}数据`),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "empty-hint" },
          vue.toDisplayString($setup.keyword ? `没有找到"${$setup.keyword}"相关的${$setup.term("item")}` : `点击首页${$setup.term("inbound")}登记添加${$setup.term("item")}`),
          1
          /* TEXT */
        ),
        $setup.keyword ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-action",
          onClick: $setup.clearSearch
        }, [
          vue.createElementVNode("text", { class: "empty-action-text" }, "清除搜索")
        ])) : vue.createCommentVNode("v-if", true)
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "medicine-scroll"
      }, [
        vue.createElementVNode("view", { class: "medicine-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.list, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: item.id,
                class: "swipe-item-wrapper"
              }, [
                vue.createElementVNode("view", {
                  class: vue.normalizeClass(["swipe-container", { animating: !$setup.isMoving }]),
                  style: vue.normalizeStyle({ transform: `translateX(${$setup.getSwipeOffset(item.id)}px)` }),
                  onTouchstart: ($event) => $setup.onTouchStart($event, item.id),
                  onTouchmove: ($event) => $setup.onTouchMove($event, item.id),
                  onTouchend: ($event) => $setup.onTouchEnd($event, item.id)
                }, [
                  vue.createElementVNode("view", {
                    class: "medicine-item",
                    onClick: ($event) => $setup.handleItemClick(item)
                  }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["status-indicator", $setup.getStatusClass(item.expiry_date)])
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    vue.createElementVNode("view", { class: "item-content" }, [
                      vue.createElementVNode("view", { class: "medicine-header" }, [
                        vue.createElementVNode("view", { class: "name-section" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "medicine-name" },
                            vue.toDisplayString(item.medicine_name),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["status-tag", $setup.getStatusClass(item.expiry_date)])
                          },
                          vue.toDisplayString($setup.getStatusText(item.expiry_date)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "medicine-info" }, [
                        vue.createElementVNode("view", { class: "info-item" }, [
                          vue.createElementVNode("text", { class: "info-icon" }, "📦"),
                          vue.createElementVNode("view", { class: "info-content" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "info-label" },
                              vue.toDisplayString($setup.term("inventory")) + "数量",
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "info-value" },
                              vue.toDisplayString(item.quantity) + " " + vue.toDisplayString(item.medicine_unit || $setup.term("itemUnit")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        vue.createElementVNode("view", { class: "info-item" }, [
                          vue.createElementVNode("text", { class: "info-icon" }, "💰"),
                          vue.createElementVNode("view", { class: "info-content" }, [
                            vue.createElementVNode("text", { class: "info-label" }, "单价"),
                            item.medicine_price ? (vue.openBlock(), vue.createElementBlock(
                              "text",
                              {
                                key: 0,
                                class: "info-value price"
                              },
                              "¥" + vue.toDisplayString(item.medicine_price.toFixed(2)),
                              1
                              /* TEXT */
                            )) : (vue.openBlock(), vue.createElementBlock("text", {
                              key: 1,
                              class: "info-value"
                            }, "-"))
                          ])
                        ]),
                        vue.createElementVNode("view", { class: "info-item" }, [
                          vue.createElementVNode("text", { class: "info-icon" }, "🏭"),
                          vue.createElementVNode("view", { class: "info-content" }, [
                            vue.createElementVNode("text", { class: "info-label" }, "生产日期"),
                            vue.createElementVNode(
                              "text",
                              { class: "info-value" },
                              vue.toDisplayString(item.production_date || "未知"),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        vue.createElementVNode("view", { class: "info-item" }, [
                          vue.createElementVNode("text", { class: "info-icon" }, "📅"),
                          vue.createElementVNode("view", { class: "info-content" }, [
                            vue.createElementVNode("text", { class: "info-label" }, "有效期至"),
                            vue.createElementVNode(
                              "text",
                              { class: "info-value" },
                              vue.toDisplayString(item.expiry_date),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        vue.createElementVNode("view", { class: "info-item" }, [
                          vue.createElementVNode("text", { class: "info-icon" }, "⏰"),
                          vue.createElementVNode("view", { class: "info-content" }, [
                            vue.createElementVNode("text", { class: "info-label" }, "剩余时间"),
                            vue.createElementVNode(
                              "text",
                              {
                                class: vue.normalizeClass(["info-value", $setup.getDaysClass(item.expiry_date)])
                              },
                              vue.toDisplayString($setup.getDaysText(item.expiry_date)),
                              3
                              /* TEXT, CLASS */
                            )
                          ])
                        ])
                      ]),
                      vue.createElementVNode("view", { class: "item-arrow" }, "›")
                    ])
                  ], 8, ["onClick"])
                ], 46, ["onTouchstart", "onTouchmove", "onTouchend"]),
                vue.createElementVNode("view", { class: "swipe-actions" }, [
                  vue.createElementVNode("view", {
                    class: "action-btn edit-btn",
                    onClick: ($event) => $setup.handleEdit(item)
                  }, [
                    vue.createElementVNode("text", { class: "action-icon" }, "✏️"),
                    vue.createElementVNode("text", { class: "action-text" }, "修改")
                  ], 8, ["onClick"]),
                  vue.createElementVNode("view", {
                    class: "action-btn delete-btn",
                    onClick: ($event) => $setup.handleDelete(item)
                  }, [
                    vue.createElementVNode("text", { class: "action-icon" }, "🗑️"),
                    vue.createElementVNode("text", { class: "action-text" }, "删除")
                  ], 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        $setup.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "load-more"
        }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($setup.loadingMore ? "加载中..." : "上拉加载更多"),
            1
            /* TEXT */
          )
        ])) : $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "no-more"
        }, [
          vue.createElementVNode(
            "text",
            null,
            "已加载全部 " + vue.toDisplayString($setup.total) + " 条数据",
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ])),
      $setup.showFilterPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "filter-popup",
        onClick: _cache[3] || (_cache[3] = ($event) => $setup.showFilterPopup = false)
      }, [
        vue.createElementVNode("view", {
          class: "filter-content",
          onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "filter-header" }, [
            vue.createElementVNode("text", { class: "filter-title" }, "筛选条件"),
            vue.createElementVNode("text", {
              class: "filter-close",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.showFilterPopup = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "filter-body" }, [
            vue.createElementVNode("view", { class: "filter-section" }, [
              vue.createElementVNode("text", { class: "filter-label" }, "状态"),
              vue.createElementVNode("view", { class: "filter-options" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.statusOptions, (status) => {
                    return vue.createElementVNode("view", {
                      key: status.value,
                      class: vue.normalizeClass(["filter-option", { active: $setup.filterStatus === status.value }]),
                      onClick: ($event) => $setup.filterStatus = status.value
                    }, vue.toDisplayString(status.label), 11, ["onClick"]);
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "filter-footer" }, [
            vue.createElementVNode("view", {
              class: "filter-btn reset",
              onClick: $setup.resetFilter
            }, "重置"),
            vue.createElementVNode("view", {
              class: "filter-btn confirm",
              onClick: $setup.applyFilter
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMedicineList = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-b52fc9df"], ["__file", "G:/YIYAO/medicine-app/pages/medicine/list.vue"]]);
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const detail = vue.ref(null);
      const loading = vue.ref(false);
      const showOutboundDialog = vue.ref(false);
      const submitting = vue.ref(false);
      const outboundForm = vue.ref({
        batch_id: 0,
        quantity: 1,
        reason: "",
        recipient: ""
      });
      const reasonOptions = ["销售", "报损", "过期销毁", "其他"];
      async function loadDetail(id) {
        loading.value = true;
        try {
          const data = await inventoryApi.detail(id);
          detail.value = data;
          outboundForm.value.batch_id = id;
        } catch (error) {
          formatAppLog("error", "at pages/medicine/detail.vue:185", "加载详情失败:", error);
        } finally {
          loading.value = false;
        }
      }
      function onReasonChange(e) {
        outboundForm.value.reason = reasonOptions[e.detail.value];
      }
      async function handleOutbound() {
        var _a;
        if (!outboundForm.value.quantity || outboundForm.value.quantity <= 0) {
          uni.showToast({
            title: "请输入正确的数量",
            icon: "none"
          });
          return;
        }
        if (outboundForm.value.quantity > (((_a = detail.value) == null ? void 0 : _a.quantity) || 0)) {
          uni.showToast({
            title: "出库数量不能大于库存",
            icon: "none"
          });
          return;
        }
        if (!outboundForm.value.reason) {
          uni.showToast({
            title: "请选择出库原因",
            icon: "none"
          });
          return;
        }
        submitting.value = true;
        try {
          await inventoryApi.outbound(outboundForm.value);
          uni.showToast({
            title: "出库成功",
            icon: "success"
          });
          showOutboundDialog.value = false;
          if (detail.value) {
            loadDetail(detail.value.id);
          }
        } catch (error) {
          formatAppLog("error", "at pages/medicine/detail.vue:238", "出库失败:", error);
        } finally {
          submitting.value = false;
        }
      }
      function getStatusClass(expiryDate) {
        const status = getExpiryStatus(expiryDate);
        return `status-${status.type}`;
      }
      function getStatusText(expiryDate) {
        const status = getExpiryStatus(expiryDate);
        return status.text;
      }
      function getDaysClass(expiryDate) {
        const days = getDaysFromNow(expiryDate);
        if (days < 0)
          return "danger";
        if (days <= 90)
          return "warning";
        return "normal";
      }
      function getDaysText(expiryDate) {
        const days = getDaysFromNow(expiryDate);
        if (days < 0)
          return `已过期 ${Math.abs(days)} 天`;
        if (days === 0)
          return "今天过期";
        return `距离过期还有 ${days} 天`;
      }
      function getExpiryIcon(expiryDate) {
        const days = getDaysFromNow(expiryDate);
        if (days < 0)
          return "❌";
        if (days <= 90)
          return "⚠️";
        return "✅";
      }
      function getExpiryTitle(expiryDate) {
        const days = getDaysFromNow(expiryDate);
        if (days < 0)
          return "已过期";
        if (days <= 90)
          return "临期预警";
        return "状态正常";
      }
      function formatDate2(dateStr) {
        if (!dateStr)
          return "未知";
        return dateStr.split("T")[0];
      }
      onLoad((options) => {
        if (options.id) {
          loadDetail(Number(options.id));
        }
      });
      const __returned__ = { detail, loading, showOutboundDialog, submitting, outboundForm, reasonOptions, loadDetail, onReasonChange, handleOutbound, getStatusClass, getStatusText, getDaysClass, getDaysText, getExpiryIcon, getExpiryTitle, formatDate: formatDate2 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b;
    return vue.openBlock(), vue.createElementBlock("view", { class: "detail-page" }, [
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-state"
      }, [
        vue.createElementVNode("text", { class: "loading-icon" }, "⏳"),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : $setup.detail ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "detail-container"
      }, [
        vue.createElementVNode("view", { class: "medicine-header" }, [
          vue.createElementVNode("view", { class: "medicine-name-section" }, [
            vue.createElementVNode(
              "text",
              { class: "medicine-name" },
              vue.toDisplayString($setup.detail.medicine_name),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["status-tag", $setup.getStatusClass($setup.detail.expiry_date)])
            },
            vue.toDisplayString($setup.getStatusText($setup.detail.expiry_date)),
            3
            /* TEXT, CLASS */
          )
        ]),
        vue.createElementVNode("view", { class: "quantity-card" }, [
          vue.createElementVNode("view", { class: "quantity-icon" }, "📦"),
          vue.createElementVNode("view", { class: "quantity-info" }, [
            vue.createElementVNode("text", { class: "quantity-label" }, "当前库存"),
            vue.createElementVNode(
              "text",
              { class: "quantity-value" },
              vue.toDisplayString($setup.detail.quantity) + " 盒",
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "info-card" }, [
          vue.createElementVNode("view", { class: "card-title" }, [
            vue.createElementVNode("text", { class: "title-icon" }, "📋"),
            vue.createElementVNode("text", { class: "title-text" }, "基本信息")
          ]),
          vue.createElementVNode("view", { class: "info-list" }, [
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "info-icon" }, "🏭"),
                vue.createElementVNode("view", { class: "info-content" }, [
                  vue.createElementVNode("text", { class: "info-label" }, "生产日期"),
                  vue.createElementVNode(
                    "text",
                    { class: "info-value" },
                    vue.toDisplayString($setup.detail.production_date || "未知"),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "info-icon" }, "📅"),
                vue.createElementVNode("view", { class: "info-content" }, [
                  vue.createElementVNode("text", { class: "info-label" }, "有效期至"),
                  vue.createElementVNode(
                    "text",
                    { class: "info-value" },
                    vue.toDisplayString($setup.detail.expiry_date),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "info-row" }, [
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "info-icon" }, "📥"),
                vue.createElementVNode("view", { class: "info-content" }, [
                  vue.createElementVNode("text", { class: "info-label" }, "入库日期"),
                  vue.createElementVNode(
                    "text",
                    { class: "info-value" },
                    vue.toDisplayString($setup.formatDate($setup.detail.inbound_date)),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            $setup.detail.remark ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "info-row"
            }, [
              vue.createElementVNode("view", { class: "info-item full" }, [
                vue.createElementVNode("text", { class: "info-icon" }, "📝"),
                vue.createElementVNode("view", { class: "info-content" }, [
                  vue.createElementVNode("text", { class: "info-label" }, "备注信息"),
                  vue.createElementVNode(
                    "text",
                    { class: "info-value remark" },
                    vue.toDisplayString($setup.detail.remark),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ]),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["expiry-card", $setup.getDaysClass($setup.detail.expiry_date)])
          },
          [
            vue.createElementVNode(
              "text",
              { class: "expiry-icon" },
              vue.toDisplayString($setup.getExpiryIcon($setup.detail.expiry_date)),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "expiry-content" }, [
              vue.createElementVNode(
                "text",
                { class: "expiry-title" },
                vue.toDisplayString($setup.getExpiryTitle($setup.detail.expiry_date)),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "expiry-text" },
                vue.toDisplayString($setup.getDaysText($setup.detail.expiry_date)),
                1
                /* TEXT */
              )
            ])
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode("view", { class: "action-buttons" }, [
          vue.createElementVNode("button", {
            class: "action-btn primary",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.showOutboundDialog = true)
          }, [
            vue.createElementVNode("text", { class: "btn-icon" }, "📤"),
            vue.createElementVNode("text", null, "出库")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showOutboundDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "dialog-mask",
        onClick: _cache[6] || (_cache[6] = ($event) => $setup.showOutboundDialog = false)
      }, [
        vue.createElementVNode("view", {
          class: "dialog-content",
          onClick: _cache[5] || (_cache[5] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "dialog-header" }, [
            vue.createElementVNode("text", { class: "dialog-title" }, "药品出库"),
            vue.createElementVNode("text", {
              class: "dialog-close",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.showOutboundDialog = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "dialog-body" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "form-label" }, "当前库存"),
              vue.createElementVNode(
                "text",
                { class: "form-value" },
                vue.toDisplayString((_a = $setup.detail) == null ? void 0 : _a.quantity),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "form-label required" }, "出库数量"),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.outboundForm.quantity = $event),
                type: "number",
                max: (_b = $setup.detail) == null ? void 0 : _b.quantity,
                placeholder: "请输入出库数量"
              }, null, 8, ["max"]), [
                [
                  vue.vModelText,
                  $setup.outboundForm.quantity,
                  void 0,
                  { number: true }
                ]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "form-label required" }, "出库原因"),
              vue.createElementVNode(
                "picker",
                {
                  mode: "selector",
                  range: $setup.reasonOptions,
                  onChange: $setup.onReasonChange
                },
                [
                  vue.createElementVNode("view", { class: "form-input" }, [
                    vue.createElementVNode(
                      "text",
                      {
                        class: vue.normalizeClass({ placeholder: !$setup.outboundForm.reason })
                      },
                      vue.toDisplayString($setup.outboundForm.reason || "请选择出库原因"),
                      3
                      /* TEXT, CLASS */
                    ),
                    vue.createElementVNode("text", { class: "arrow" }, "›")
                  ])
                ],
                32
                /* NEED_HYDRATION */
              )
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "form-label" }, "领用人"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.outboundForm.recipient = $event),
                  placeholder: "请输入领用人（可选）"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.outboundForm.recipient]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-footer" }, [
            vue.createElementVNode("button", {
              class: "dialog-btn cancel",
              onClick: _cache[4] || (_cache[4] = ($event) => $setup.showOutboundDialog = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "dialog-btn confirm",
              onClick: $setup.handleOutbound,
              loading: $setup.submitting
            }, "确定", 8, ["loading"])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMedicineDetail = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-87b2e844"], ["__file", "G:/YIYAO/medicine-app/pages/medicine/detail.vue"]]);
  const medicineApi = {
    /**
     * 获取药品列表
     */
    list(params) {
      return http.get("/medicines", params);
    },
    /**
     * 获取药品详情
     */
    detail(id) {
      return http.get(`/medicines/${id}`);
    },
    /**
     * 通过条形码获取药品
     */
    getByBarcode(barcode) {
      return http.get(`/medicines/barcode/${barcode}`);
    },
    /**
     * 创建药品
     */
    create(data) {
      return http.post("/medicines", data);
    },
    /**
     * 更新药品
     */
    update(id, data) {
      return http.put(`/medicines/${id}`, data);
    },
    /**
     * 删除药品
     */
    delete(id) {
      return http.delete(`/medicines/${id}`);
    },
    /**
     * 获取分类列表（根据当前场景动态返回）
     */
    getCategories() {
      return http.get("/medicines/categories");
    }
  };
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    __name: "edit",
    setup(__props, { expose: __expose }) {
      __expose();
      const batch = vue.ref(null);
      const batchId = vue.ref(0);
      const medicineId = vue.ref(0);
      const submitting = vue.ref(false);
      const form = vue.ref({
        medicine_id: 0,
        batch_number: "",
        quantity: 0,
        production_date: "",
        expiry_date: "",
        remark: ""
      });
      const productionDateInput = vue.ref("");
      const expiryDateInput = vue.ref("");
      const showCategoryPicker = vue.ref(false);
      const showUnitPicker = vue.ref(false);
      const selectedCategory = vue.ref("");
      const selectedUnit = vue.ref("");
      const categoryList = ["中药", "西药"];
      const unitList = ["盒", "瓶", "支", "袋", "片", "粒", "管", "贴", "包", "罐", "桶", "箱"];
      const showProductionDatePicker = vue.ref(false);
      const showExpiryDatePicker = vue.ref(false);
      const years = vue.ref([]);
      for (let i = 2018; i <= 2035; i++) {
        years.value.push(i);
      }
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
      const defaultYearIndex = years.value.indexOf(currentYear) >= 0 ? years.value.indexOf(currentYear) : 0;
      const productionDatePickerValue = vue.ref([defaultYearIndex, currentMonth - 1, 0]);
      const expiryDatePickerValue = vue.ref([defaultYearIndex + 2, currentMonth - 1, 0]);
      const months = vue.ref([]);
      for (let i = 1; i <= 12; i++) {
        months.value.push(i);
      }
      const days = vue.ref(["不选"]);
      for (let i = 1; i <= 31; i++) {
        days.value.push(i);
      }
      function selectCategory(cat) {
        selectedCategory.value = cat;
        showCategoryPicker.value = false;
      }
      function selectUnit(unit) {
        selectedUnit.value = unit;
        showUnitPicker.value = false;
      }
      async function loadBatch() {
        var _a, _b;
        try {
          const data = await inventoryApi.detail(batchId.value);
          batch.value = data;
          form.value = {
            medicine_id: data.medicine_id,
            batch_number: data.batch_number || "",
            quantity: data.quantity,
            production_date: data.production_date,
            expiry_date: data.expiry_date,
            remark: data.remark || ""
          };
          productionDateInput.value = ((_a = data.production_date) == null ? void 0 : _a.replace(/-/g, ".")) || "";
          expiryDateInput.value = ((_b = data.expiry_date) == null ? void 0 : _b.replace(/-/g, ".")) || "";
          if (data.medicine_id) {
            try {
              const medicine = await medicineApi.detail(data.medicine_id);
              selectedUnit.value = medicine.unit || "盒";
              selectedCategory.value = medicine.category === "中药" ? "中药" : "西药";
            } catch (e) {
              formatAppLog("error", "at pages/medicine/edit.vue:304", "加载药品信息失败:", e);
              selectedUnit.value = "盒";
              selectedCategory.value = "西药";
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/medicine/edit.vue:310", "加载失败:", error);
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      }
      function formatDateInput(dateStr) {
        if (!dateStr)
          return null;
        dateStr = dateStr.trim();
        const parts = dateStr.split(/[.\-/]/);
        if (parts.length < 2)
          return null;
        const year = parts[0].padStart(4, "0");
        const month = parts[1].padStart(2, "0");
        const day = parts.length >= 3 ? parts[2].padStart(2, "0") : "01";
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        if (yearNum < 2e3 || yearNum > 2100)
          return null;
        if (monthNum < 1 || monthNum > 12)
          return null;
        const fullDate = `${year}-${month}-${day}`;
        const display = parts.length >= 3 ? `${year}.${month}.${day}` : `${year}.${month}`;
        return { date: fullDate, display };
      }
      function onProductionDateInput() {
        const result = formatDateInput(productionDateInput.value);
        if (result) {
          form.value.production_date = result.date;
          productionDateInput.value = result.display;
        }
      }
      function onExpiryDateInput() {
        const result = formatDateInput(expiryDateInput.value);
        if (result) {
          form.value.expiry_date = result.date;
          expiryDateInput.value = result.display;
        }
      }
      function openProductionDatePicker() {
        if (form.value.production_date) {
          const parts = form.value.production_date.split("-");
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          const yearIdx = years.value.indexOf(year);
          productionDatePickerValue.value = [
            yearIdx >= 0 ? yearIdx : defaultYearIndex,
            month - 1,
            day === 1 ? 0 : day
          ];
        }
        showProductionDatePicker.value = true;
      }
      function openExpiryDatePicker() {
        if (form.value.expiry_date) {
          const parts = form.value.expiry_date.split("-");
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          const yearIdx = years.value.indexOf(year);
          expiryDatePickerValue.value = [
            yearIdx >= 0 ? yearIdx : defaultYearIndex + 2,
            month - 1,
            day === 1 ? 0 : day
          ];
        }
        showExpiryDatePicker.value = true;
      }
      function onProductionDatePickerChange(e) {
        productionDatePickerValue.value = e.detail.value;
      }
      function onExpiryDatePickerChange(e) {
        expiryDatePickerValue.value = e.detail.value;
      }
      function confirmProductionDate() {
        const [yearIdx, monthIdx, dayIdx] = productionDatePickerValue.value;
        const year = years.value[yearIdx] || years.value[0];
        const month = months.value[monthIdx] || 1;
        const day = days.value[dayIdx];
        if (day === "不选" || dayIdx === 0) {
          form.value.production_date = `${year}-${String(month).padStart(2, "0")}-01`;
          productionDateInput.value = `${year}.${String(month).padStart(2, "0")}`;
        } else {
          form.value.production_date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          productionDateInput.value = `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
        }
        showProductionDatePicker.value = false;
      }
      function confirmExpiryDate() {
        const [yearIdx, monthIdx, dayIdx] = expiryDatePickerValue.value;
        const year = years.value[yearIdx] || years.value[0];
        const month = months.value[monthIdx] || 1;
        const day = days.value[dayIdx];
        if (day === "不选" || dayIdx === 0) {
          form.value.expiry_date = `${year}-${String(month).padStart(2, "0")}-01`;
          expiryDateInput.value = `${year}.${String(month).padStart(2, "0")}`;
        } else {
          form.value.expiry_date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          expiryDateInput.value = `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
        }
        showExpiryDatePicker.value = false;
      }
      function getCategoryId(categoryName) {
        return categoryName === "中药" ? 1 : 2;
      }
      async function handleSubmit() {
        if (!selectedCategory.value) {
          uni.showToast({ title: "请选择药品分类", icon: "none" });
          return;
        }
        if (!selectedUnit.value) {
          uni.showToast({ title: "请选择单位", icon: "none" });
          return;
        }
        if (!form.value.quantity || form.value.quantity <= 0) {
          uni.showToast({ title: "请输入正确的数量", icon: "none" });
          return;
        }
        if (!form.value.production_date) {
          uni.showToast({ title: "请选择生产日期", icon: "none" });
          return;
        }
        if (!form.value.expiry_date) {
          uni.showToast({ title: "请选择有效期", icon: "none" });
          return;
        }
        submitting.value = true;
        try {
          if (form.value.medicine_id) {
            await medicineApi.update(form.value.medicine_id, {
              unit: selectedUnit.value,
              category_id: getCategoryId(selectedCategory.value)
            });
          }
          await inventoryApi.update(batchId.value, form.value);
          uni.showToast({ title: "修改成功", icon: "success" });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/medicine/edit.vue:470", "修改失败:", error);
          uni.showToast({ title: "修改失败", icon: "none" });
        } finally {
          submitting.value = false;
        }
      }
      onLoad((options) => {
        if (options == null ? void 0 : options.id) {
          batchId.value = parseInt(options.id);
          loadBatch();
        }
      });
      const __returned__ = { batch, batchId, medicineId, submitting, form, productionDateInput, expiryDateInput, showCategoryPicker, showUnitPicker, selectedCategory, selectedUnit, categoryList, unitList, showProductionDatePicker, showExpiryDatePicker, years, currentYear, currentMonth, defaultYearIndex, productionDatePickerValue, expiryDatePickerValue, months, days, selectCategory, selectUnit, loadBatch, formatDateInput, onProductionDateInput, onExpiryDateInput, openProductionDatePicker, openExpiryDatePicker, onProductionDatePickerChange, onExpiryDatePickerChange, confirmProductionDate, confirmExpiryDate, getCategoryId, handleSubmit };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "edit-page" }, [
      $setup.batch ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "form-container"
      }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label" }, "药品名称"),
          vue.createElementVNode(
            "view",
            { class: "form-value readonly" },
            vue.toDisplayString($setup.batch.medicine_name),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "药品分类"),
          vue.createElementVNode("view", {
            class: "form-input picker-input",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.showCategoryPicker = true)
          }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass({ placeholder: !$setup.selectedCategory })
              },
              vue.toDisplayString($setup.selectedCategory || "请选择药品分类"),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode("text", { class: "arrow" }, "›")
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "单位"),
          vue.createElementVNode("view", {
            class: "form-input picker-input",
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.showUnitPicker = true)
          }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass({ placeholder: !$setup.selectedUnit })
              },
              vue.toDisplayString($setup.selectedUnit || "请选择单位"),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode("text", { class: "arrow" }, "›")
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "数量"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.quantity = $event),
              type: "number",
              placeholder: "请输入数量"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              vue.vModelText,
              $setup.form.quantity,
              void 0,
              { number: true }
            ]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "生产日期"),
          vue.createElementVNode("view", { class: "date-input-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input date-input",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.productionDateInput = $event),
                placeholder: "格式：2024.12 或 2024.12.18",
                onBlur: $setup.onProductionDateInput
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.productionDateInput]
            ]),
            vue.createElementVNode("button", {
              class: "date-picker-btn",
              onClick: $setup.openProductionDatePicker
            }, [
              vue.createElementVNode("text", { class: "picker-icon" }, "📅")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "有效期"),
          vue.createElementVNode("view", { class: "date-input-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input date-input",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.expiryDateInput = $event),
                placeholder: "格式：2026.12 或 2026.12.18",
                onBlur: $setup.onExpiryDateInput
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.expiryDateInput]
            ]),
            vue.createElementVNode("button", {
              class: "date-picker-btn",
              onClick: $setup.openExpiryDatePicker
            }, [
              vue.createElementVNode("text", { class: "picker-icon" }, "📅")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label" }, "备注"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              class: "form-textarea",
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.remark = $event),
              placeholder: "请输入备注信息（可选）",
              maxlength: "200"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.remark]
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "form-footer" }, [
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: $setup.handleSubmit,
          loading: $setup.submitting
        }, " 保存修改 ", 8, ["loading"])
      ]),
      $setup.showProductionDatePicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "picker-popup",
        onClick: _cache[9] || (_cache[9] = ($event) => $setup.showProductionDatePicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content",
          onClick: _cache[8] || (_cache[8] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("text", { class: "picker-title" }, "选择生产日期"),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[6] || (_cache[6] = ($event) => $setup.showProductionDatePicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "date-picker-body" }, [
            vue.createElementVNode("picker-view", {
              value: $setup.productionDatePickerValue,
              onChange: $setup.onProductionDatePickerChange,
              class: "date-picker-view",
              "indicator-style": "height: 88rpx;"
            }, [
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.years, (year) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: year,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(year) + "年",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.months, (month) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: month,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(month) + "月",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.days, (day) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: day,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(day === "不选" ? "日(可选)" : day + "日"),
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", { class: "picker-footer" }, [
            vue.createElementVNode("button", {
              class: "picker-cancel-btn",
              onClick: _cache[7] || (_cache[7] = ($event) => $setup.showProductionDatePicker = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "picker-confirm-btn",
              onClick: $setup.confirmProductionDate
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showExpiryDatePicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "picker-popup",
        onClick: _cache[13] || (_cache[13] = ($event) => $setup.showExpiryDatePicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content",
          onClick: _cache[12] || (_cache[12] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("text", { class: "picker-title" }, "选择有效期"),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[10] || (_cache[10] = ($event) => $setup.showExpiryDatePicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "date-picker-body" }, [
            vue.createElementVNode("picker-view", {
              value: $setup.expiryDatePickerValue,
              onChange: $setup.onExpiryDatePickerChange,
              class: "date-picker-view",
              "indicator-style": "height: 88rpx;"
            }, [
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.years, (year) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: year,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(year) + "年",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.months, (month) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: month,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(month) + "月",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.days, (day) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: day,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(day === "不选" ? "日(可选)" : day + "日"),
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", { class: "picker-footer" }, [
            vue.createElementVNode("button", {
              class: "picker-cancel-btn",
              onClick: _cache[11] || (_cache[11] = ($event) => $setup.showExpiryDatePicker = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "picker-confirm-btn",
              onClick: $setup.confirmExpiryDate
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showCategoryPicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "picker-popup",
        onClick: _cache[16] || (_cache[16] = ($event) => $setup.showCategoryPicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content simple-picker-content",
          onClick: _cache[15] || (_cache[15] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("text", { class: "picker-title" }, "选择药品分类"),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[14] || (_cache[14] = ($event) => $setup.showCategoryPicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("scroll-view", {
            class: "picker-list",
            "scroll-y": ""
          }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.categoryList, (cat) => {
                return vue.createElementVNode("view", {
                  key: cat,
                  class: vue.normalizeClass(["simple-picker-item", { active: $setup.selectedCategory === cat }]),
                  onClick: ($event) => $setup.selectCategory(cat)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(cat),
                    1
                    /* TEXT */
                  ),
                  $setup.selectedCategory === cat ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showUnitPicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "picker-popup",
        onClick: _cache[19] || (_cache[19] = ($event) => $setup.showUnitPicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content simple-picker-content",
          onClick: _cache[18] || (_cache[18] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("text", { class: "picker-title" }, "选择单位"),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[17] || (_cache[17] = ($event) => $setup.showUnitPicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("scroll-view", {
            class: "picker-list",
            "scroll-y": ""
          }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.unitList, (unit) => {
                return vue.createElementVNode("view", {
                  key: unit,
                  class: vue.normalizeClass(["simple-picker-item", { active: $setup.selectedUnit === unit }]),
                  onClick: ($event) => $setup.selectUnit(unit)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(unit),
                    1
                    /* TEXT */
                  ),
                  $setup.selectedUnit === unit ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMedicineEdit = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-afbef69c"], ["__file", "G:/YIYAO/medicine-app/pages/medicine/edit.vue"]]);
  const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { term, refreshConfig } = useMode();
      const form = vue.ref({
        medicine_id: 0,
        batch_number: "",
        quantity: 1,
        production_date: "",
        expiry_date: "",
        remark: ""
      });
      const submitting = vue.ref(false);
      const recognizing = vue.ref(false);
      const showMedicinePicker = vue.ref(false);
      const medicineList = vue.ref([]);
      const medicineKeyword = vue.ref("");
      const medicineName = vue.ref("");
      const medicineBarcode = vue.ref("");
      const medicinePrice = vue.ref(void 0);
      const productionDateInput = vue.ref("");
      const expiryDateInput = vue.ref("");
      const showCategoryPicker = vue.ref(false);
      const showUnitPicker = vue.ref(false);
      const selectedCategory = vue.ref("");
      const selectedUnit = vue.ref("");
      const categoryList = vue.ref([]);
      const selectedCategoryId = vue.ref(0);
      const unitConfigs = {
        medicine: ["盒", "瓶", "支", "袋", "片", "粒", "管", "贴", "包", "罐"],
        inventory: ["件", "个", "箱", "包", "套", "台", "只", "条", "卷", "桶"],
        food: ["份", "袋", "包", "瓶", "罐", "盒", "斤", "公斤", "克", "升"]
      };
      const unitList = vue.ref([]);
      function loadUnits() {
        const appMode = uni.getStorageSync("app_mode") || "medicine";
        unitList.value = unitConfigs[appMode] || unitConfigs.medicine;
        formatAppLog("log", "at pages/add/index.vue:350", "加载单位列表:", appMode, unitList.value);
      }
      async function loadCategories() {
        try {
          const categories = await medicineApi.getCategories();
          categoryList.value = categories || [];
          formatAppLog("log", "at pages/add/index.vue:358", "加载分类列表成功:", categoryList.value);
        } catch (error) {
          formatAppLog("error", "at pages/add/index.vue:360", "加载分类列表失败:", error);
          categoryList.value = [
            { id: 1, name: "默认分类" }
          ];
        }
      }
      const showProductionDatePicker = vue.ref(false);
      const showExpiryDatePicker = vue.ref(false);
      const years = vue.ref([]);
      for (let i = 2018; i <= 2035; i++) {
        years.value.push(i);
      }
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
      const defaultYearIndex = years.value.indexOf(currentYear) >= 0 ? years.value.indexOf(currentYear) : 0;
      const productionDatePickerValue = vue.ref([defaultYearIndex, currentMonth - 1, 0]);
      const expiryDatePickerValue = vue.ref([defaultYearIndex + 2, currentMonth - 1, 0]);
      const months = vue.ref([]);
      for (let i = 1; i <= 12; i++) {
        months.value.push(i);
      }
      const days = vue.ref(["不选"]);
      for (let i = 1; i <= 31; i++) {
        days.value.push(i);
      }
      const selectedMedicine = vue.computed(() => {
        return medicineList.value.find((m) => m.id === form.value.medicine_id);
      });
      function onMedicineNameInput() {
        form.value.medicine_id = 0;
      }
      async function loadMedicines() {
        try {
          const res = await medicineApi.list({ page: 1, page_size: 100 });
          medicineList.value = res.items || [];
        } catch (error) {
          formatAppLog("error", "at pages/add/index.vue:414", "加载药品列表失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
          medicineList.value = [];
        }
      }
      function searchMedicines() {
        loadMedicines();
      }
      function selectMedicine(medicine) {
        form.value.medicine_id = medicine.id;
        medicineName.value = medicine.name;
        showMedicinePicker.value = false;
      }
      function selectCategory(cat) {
        selectedCategoryId.value = cat.id;
        selectedCategory.value = cat.name;
        showCategoryPicker.value = false;
      }
      function selectUnit(unit) {
        selectedUnit.value = unit;
        showUnitPicker.value = false;
      }
      function handleScanBarcode() {
        uni.scanCode({
          success: (res) => {
            const code = res.result;
            if (code) {
              medicineBarcode.value = code;
              uni.showToast({
                title: "条形码已填入",
                icon: "success"
              });
            }
          },
          fail: (err) => {
            var _a;
            if (!((_a = err.errMsg) == null ? void 0 : _a.includes("cancel"))) {
              uni.showToast({ title: "扫描失败", icon: "none" });
            }
          }
        });
      }
      function loadScannedBarcode() {
        try {
          const barcode = uni.getStorageSync("scannedBarcode");
          if (barcode) {
            medicineBarcode.value = barcode;
            uni.removeStorageSync("scannedBarcode");
            uni.showToast({
              title: "条形码已填入",
              icon: "success"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/add/index.vue:483", "读取条形码失败:", error);
        }
      }
      function formatDateInput(dateStr) {
        if (!dateStr)
          return null;
        dateStr = dateStr.trim();
        const parts = dateStr.split(/[.\-/]/);
        if (parts.length < 2)
          return null;
        const year = parts[0].padStart(4, "0");
        const month = parts[1].padStart(2, "0");
        const day = parts.length >= 3 ? parts[2].padStart(2, "0") : "01";
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        if (yearNum < 2e3 || yearNum > 2100)
          return null;
        if (monthNum < 1 || monthNum > 12)
          return null;
        if (parts.length >= 3) {
          const dayNum = parseInt(day);
          if (dayNum < 1 || dayNum > 31)
            return null;
        }
        const fullDate = `${year}-${month}-${day}`;
        const display = parts.length >= 3 ? `${year}.${month}.${day}` : `${year}.${month}`;
        return { date: fullDate, display };
      }
      function onProductionDateInput() {
        const result = formatDateInput(productionDateInput.value);
        if (result) {
          form.value.production_date = result.date;
          productionDateInput.value = result.display;
        } else if (productionDateInput.value) {
          uni.showToast({
            title: "请输入正确的年月，如 2024.12",
            icon: "none"
          });
        }
      }
      function onExpiryDateInput() {
        const result = formatDateInput(expiryDateInput.value);
        if (result) {
          form.value.expiry_date = result.date;
          expiryDateInput.value = result.display;
        } else if (expiryDateInput.value) {
          uni.showToast({
            title: "请输入正确的年月，如 2026.12",
            icon: "none"
          });
        }
      }
      function openProductionDatePicker() {
        if (form.value.production_date) {
          const parts = form.value.production_date.split("-");
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          const yearIdx = years.value.indexOf(year);
          productionDatePickerValue.value = [
            yearIdx >= 0 ? yearIdx : defaultYearIndex,
            month - 1,
            day === 1 ? 0 : day
            // 如果是1日，可能是默认值，显示"不选"
          ];
        } else {
          productionDatePickerValue.value = [defaultYearIndex, currentMonth - 1, 0];
        }
        showProductionDatePicker.value = true;
      }
      function openExpiryDatePicker() {
        if (form.value.expiry_date) {
          const parts = form.value.expiry_date.split("-");
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          const yearIdx = years.value.indexOf(year);
          expiryDatePickerValue.value = [
            yearIdx >= 0 ? yearIdx : defaultYearIndex + 2,
            month - 1,
            day === 1 ? 0 : day
          ];
        } else {
          expiryDatePickerValue.value = [defaultYearIndex + 2, currentMonth - 1, 0];
        }
        showExpiryDatePicker.value = true;
      }
      function onProductionDatePickerChange(e) {
        const val = e.detail.value;
        productionDatePickerValue.value = [
          Math.min(Math.max(val[0] || 0, 0), years.value.length - 1),
          Math.min(Math.max(val[1] || 0, 0), 11),
          Math.min(Math.max(val[2] || 0, 0), days.value.length - 1)
        ];
      }
      function onExpiryDatePickerChange(e) {
        const val = e.detail.value;
        expiryDatePickerValue.value = [
          Math.min(Math.max(val[0] || 0, 0), years.value.length - 1),
          Math.min(Math.max(val[1] || 0, 0), 11),
          Math.min(Math.max(val[2] || 0, 0), days.value.length - 1)
        ];
      }
      function confirmProductionDate() {
        const yearIndex = productionDatePickerValue.value[0] || 0;
        const monthIndex = productionDatePickerValue.value[1] || 0;
        const dayIndex = productionDatePickerValue.value[2] || 0;
        const year = years.value[yearIndex] || years.value[0];
        const month = months.value[monthIndex] || 1;
        const day = days.value[dayIndex];
        formatAppLog("log", "at pages/add/index.vue:628", "生产日期选择:", { yearIndex, monthIndex, dayIndex, year, month, day });
        if (day === "不选" || dayIndex === 0) {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-01`;
          form.value.production_date = dateStr;
          productionDateInput.value = `${year}.${String(month).padStart(2, "0")}`;
        } else {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          form.value.production_date = dateStr;
          productionDateInput.value = `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
        }
        showProductionDatePicker.value = false;
      }
      function confirmExpiryDate() {
        const yearIndex = expiryDatePickerValue.value[0] || 0;
        const monthIndex = expiryDatePickerValue.value[1] || 0;
        const dayIndex = expiryDatePickerValue.value[2] || 0;
        const year = years.value[yearIndex] || years.value[0];
        const month = months.value[monthIndex] || 1;
        const day = days.value[dayIndex];
        formatAppLog("log", "at pages/add/index.vue:654", "有效期选择:", { yearIndex, monthIndex, dayIndex, year, month, day });
        if (day === "不选" || dayIndex === 0) {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-01`;
          form.value.expiry_date = dateStr;
          expiryDateInput.value = `${year}.${String(month).padStart(2, "0")}`;
        } else {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          form.value.expiry_date = dateStr;
          expiryDateInput.value = `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
        }
        showExpiryDatePicker.value = false;
      }
      function validateForm() {
        if (!form.value.medicine_id && !medicineName.value.trim()) {
          uni.showToast({ title: "请输入或选择药品名称", icon: "none" });
          return false;
        }
        if (!selectedCategoryId.value) {
          uni.showToast({ title: "请选择药品分类", icon: "none" });
          return false;
        }
        if (!selectedUnit.value) {
          uni.showToast({ title: "请选择单位", icon: "none" });
          return false;
        }
        if (!form.value.quantity || form.value.quantity <= 0) {
          uni.showToast({ title: "请输入正确的数量", icon: "none" });
          return false;
        }
        if (!form.value.production_date) {
          uni.showToast({ title: "请选择生产日期", icon: "none" });
          return false;
        }
        if (!form.value.expiry_date) {
          uni.showToast({ title: "请选择有效期", icon: "none" });
          return false;
        }
        if (form.value.expiry_date <= form.value.production_date) {
          uni.showToast({ title: "有效期必须晚于生产日期", icon: "none" });
          return false;
        }
        return true;
      }
      async function fillFormWithOCRResult(result) {
        let filledCount = 0;
        if (result.batch_number) {
          form.value.batch_number = result.batch_number;
          filledCount++;
          formatAppLog("log", "at pages/add/index.vue:723", "填充批次号:", result.batch_number);
        }
        if (result.production_date) {
          form.value.production_date = result.production_date;
          productionDateInput.value = result.production_date.replace(/-/g, ".");
          filledCount++;
          formatAppLog("log", "at pages/add/index.vue:730", "填充生产日期:", result.production_date);
        }
        if (result.expiry_date) {
          form.value.expiry_date = result.expiry_date;
          expiryDateInput.value = result.expiry_date.replace(/-/g, ".");
          filledCount++;
          formatAppLog("log", "at pages/add/index.vue:737", "填充有效期:", result.expiry_date);
        }
        if (result.name) {
          formatAppLog("log", "at pages/add/index.vue:742", "识别到药品名称:", result.name);
          let matchedMedicine = medicineList.value.find((m) => m.name === result.name);
          if (!matchedMedicine) {
            matchedMedicine = medicineList.value.find(
              (m) => m.name.includes(result.name) || result.name.includes(m.name)
            );
          }
          if (matchedMedicine) {
            form.value.medicine_id = matchedMedicine.id;
            medicineName.value = matchedMedicine.name;
            filledCount++;
            formatAppLog("log", "at pages/add/index.vue:758", "匹配到药品:", matchedMedicine.name);
          } else {
            formatAppLog("log", "at pages/add/index.vue:760", "未找到匹配的药品，尝试自动创建");
            try {
              const code = "MED" + Date.now();
              const categoryId = selectedCategoryId.value || 2;
              const createData = {
                name: result.name,
                code,
                category_id: categoryId,
                specification: result.specification || "未知",
                unit: selectedUnit.value || "盒",
                manufacturer: result.manufacturer || "未知"
              };
              if (medicinePrice.value !== void 0 && medicinePrice.value > 0) {
                createData.price = medicinePrice.value;
              }
              const newMedicine = await medicineApi.create(createData);
              formatAppLog("log", "at pages/add/index.vue:781", "自动创建药品成功:", newMedicine);
              await loadMedicines();
              form.value.medicine_id = newMedicine.id;
              medicineName.value = result.name;
              filledCount++;
              uni.showToast({
                title: `已自动添加药品"${result.name}"`,
                icon: "success",
                duration: 2e3
              });
            } catch (error) {
              formatAppLog("error", "at pages/add/index.vue:794", "自动创建药品失败:", error);
              uni.showModal({
                title: "无法自动添加药品",
                content: `识别到药品"${result.name}"，但自动添加失败。请手动输入药品名称。`,
                showCancel: false
              });
            }
          }
        }
        return filledCount;
      }
      function handleAIRecognize() {
        formatAppLog("log", "at pages/add/index.vue:809", "开始AI识别...");
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["camera", "album"],
          success: async (res) => {
            try {
              formatAppLog("log", "at pages/add/index.vue:817", "图片选择成功:", res);
              if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
                formatAppLog("log", "at pages/add/index.vue:820", "未选择图片");
                return;
              }
              const tempFilePath = res.tempFilePaths[0];
              formatAppLog("log", "at pages/add/index.vue:825", "图片路径:", tempFilePath);
              recognizing.value = true;
              uni.showLoading({
                title: "识别中...",
                mask: true
              });
              const uploadRes = await uni.uploadFile({
                url: "http://192.168.3.2:8000/api/ocr/recognize",
                filePath: tempFilePath,
                name: "file",
                header: {
                  "Authorization": `Bearer ${uni.getStorageSync("token")}`
                }
              });
              if (uploadRes.statusCode === 200) {
                const result = JSON.parse(uploadRes.data);
                formatAppLog("log", "at pages/add/index.vue:845", "OCR识别结果:", result);
                const filledCount = await fillFormWithOCRResult(result);
                if (filledCount > 0) {
                  uni.showToast({
                    title: `识别成功，已填充${filledCount}个字段`,
                    icon: "success",
                    duration: 2e3
                  });
                } else {
                  uni.showToast({
                    title: "识别成功，但未提取到有效信息",
                    icon: "none",
                    duration: 2e3
                  });
                }
              } else {
                throw new Error("识别失败");
              }
            } catch (error) {
              formatAppLog("error", "at pages/add/index.vue:868", "识别处理失败:", error);
              uni.showToast({
                title: "识别失败，请重试",
                icon: "none",
                duration: 2e3
              });
            } finally {
              uni.hideLoading();
              recognizing.value = false;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/add/index.vue:880", "图片选择失败:", err);
            recognizing.value = false;
            if (err.errMsg && err.errMsg.includes("cancel")) {
              formatAppLog("log", "at pages/add/index.vue:885", "用户取消选择图片");
              return;
            }
            let errorMsg = "图片选择失败";
            if (err.errMsg && err.errMsg.includes("permission")) {
              errorMsg = "请授予相机和相册权限";
            }
            uni.showToast({
              title: errorMsg,
              icon: "none",
              duration: 2e3
            });
          }
        });
      }
      async function handleSubmit() {
        if (submitting.value) {
          formatAppLog("log", "at pages/add/index.vue:908", "正在提交中，忽略重复点击");
          return;
        }
        if (!validateForm())
          return;
        submitting.value = true;
        try {
          if (!form.value.medicine_id && medicineName.value.trim()) {
            formatAppLog("log", "at pages/add/index.vue:918", "手动输入新药品:", medicineName.value);
            try {
              const code = "MED" + Date.now();
              const createData = {
                name: medicineName.value.trim(),
                code,
                category_id: selectedCategoryId.value,
                // 使用选中的分类ID
                specification: "未知",
                unit: selectedUnit.value,
                manufacturer: "未知"
              };
              if (medicineBarcode.value && medicineBarcode.value.trim()) {
                createData.barcode = medicineBarcode.value.trim();
              }
              if (medicinePrice.value !== void 0 && medicinePrice.value > 0) {
                createData.price = medicinePrice.value;
              }
              const newMedicine = await medicineApi.create(createData);
              formatAppLog("log", "at pages/add/index.vue:944", "自动创建药品成功:", newMedicine);
              form.value.medicine_id = newMedicine.id;
              uni.showToast({
                title: `已自动添加药品"${medicineName.value}"`,
                icon: "success",
                duration: 1500
              });
              await new Promise((resolve) => setTimeout(resolve, 1500));
            } catch (error) {
              formatAppLog("error", "at pages/add/index.vue:956", "自动创建药品失败:", error);
              uni.showToast({
                title: "创建药品失败，请重试",
                icon: "none"
              });
              submitting.value = false;
              return;
            }
          }
          if (!form.value.batch_number || form.value.batch_number.trim() === "") {
            form.value.batch_number = null;
            formatAppLog("log", "at pages/add/index.vue:970", "批次号为空，保持为空");
          }
          formatAppLog("log", "at pages/add/index.vue:974", "检查条形码:", {
            medicine_id: form.value.medicine_id,
            barcode: medicineBarcode.value
          });
          if (form.value.medicine_id && medicineBarcode.value && medicineBarcode.value.trim()) {
            formatAppLog("log", "at pages/add/index.vue:980", "准备更新条形码, medicine_id:", form.value.medicine_id, "barcode:", medicineBarcode.value.trim());
            try {
              const updateResult = await medicineApi.update(form.value.medicine_id, {
                barcode: medicineBarcode.value.trim()
              });
              formatAppLog("log", "at pages/add/index.vue:985", "更新条形码成功:", updateResult);
            } catch (error) {
              formatAppLog("error", "at pages/add/index.vue:987", "更新条形码失败:", error);
              uni.showToast({
                title: "条形码保存失败: " + (error.message || "未知错误"),
                icon: "none",
                duration: 3e3
              });
            }
          } else {
            formatAppLog("log", "at pages/add/index.vue:995", "跳过条形码更新: medicine_id或barcode为空");
          }
          await inventoryApi.inbound(form.value);
          uni.showToast({
            title: "添加成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/add/index.vue:1011", "添加失败:", error);
        } finally {
          submitting.value = false;
        }
      }
      vue.onMounted(() => {
        loadMedicines();
        loadCategories();
        loadUnits();
      });
      onShow(() => {
        refreshConfig();
        loadCategories();
        loadUnits();
        uni.setNavigationBarTitle({
          title: term("add")
        });
      });
      onShow(() => {
        loadScannedBarcode();
      });
      const __returned__ = { term, refreshConfig, form, submitting, recognizing, showMedicinePicker, medicineList, medicineKeyword, medicineName, medicineBarcode, medicinePrice, productionDateInput, expiryDateInput, showCategoryPicker, showUnitPicker, selectedCategory, selectedUnit, categoryList, selectedCategoryId, unitConfigs, unitList, loadUnits, loadCategories, showProductionDatePicker, showExpiryDatePicker, years, currentYear, currentMonth, defaultYearIndex, productionDatePickerValue, expiryDatePickerValue, months, days, selectedMedicine, onMedicineNameInput, loadMedicines, searchMedicines, selectMedicine, selectCategory, selectUnit, handleScanBarcode, loadScannedBarcode, formatDateInput, onProductionDateInput, onExpiryDateInput, openProductionDatePicker, openExpiryDatePicker, onProductionDatePickerChange, onExpiryDatePickerChange, confirmProductionDate, confirmExpiryDate, validateForm, fillFormWithOCRResult, handleAIRecognize, handleSubmit };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "add-page" }, [
      vue.createElementVNode("view", { class: "ai-section" }, [
        vue.createElementVNode("button", {
          class: "ai-btn primary",
          onClick: $setup.handleAIRecognize,
          loading: $setup.recognizing
        }, [
          vue.createElementVNode("text", { class: "ai-icon" }, "📷"),
          vue.createElementVNode(
            "text",
            { class: "ai-text" },
            vue.toDisplayString($setup.recognizing ? "识别中..." : "拍照识别"),
            1
            /* TEXT */
          )
        ], 8, ["loading"]),
        vue.createElementVNode(
          "text",
          { class: "ai-tip" },
          "拍照识别" + vue.toDisplayString($setup.term("item")) + "包装信息，自动填充表单",
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode(
            "view",
            { class: "form-label required" },
            vue.toDisplayString($setup.term("item")) + "名称",
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "medicine-input-group" }, [
            vue.withDirectives(vue.createElementVNode("input", {
              class: "form-input medicine-name-input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.medicineName = $event),
              placeholder: `请输入或选择${$setup.term("item")}名称`,
              onInput: $setup.onMedicineNameInput
            }, null, 40, ["placeholder"]), [
              [vue.vModelText, $setup.medicineName]
            ]),
            vue.createElementVNode("button", {
              class: "select-btn",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.showMedicinePicker = true)
            }, [
              vue.createElementVNode("text", { class: "select-icon" }, "📋")
            ])
          ]),
          vue.createElementVNode(
            "text",
            { class: "form-tip" },
            "温馨提示：可以手动输入新" + vue.toDisplayString($setup.term("item")) + "名称，或点击右侧按钮从列表选择",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode(
            "view",
            { class: "form-label required" },
            vue.toDisplayString($setup.term("item")) + vue.toDisplayString($setup.term("category")),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", {
            class: "form-input picker-input",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.showCategoryPicker = true)
          }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass({ placeholder: !$setup.selectedCategory })
              },
              vue.toDisplayString($setup.selectedCategory || `请选择${$setup.term("item")}${$setup.term("category")}`),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode("text", { class: "arrow" }, "›")
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "单位"),
          vue.createElementVNode("view", {
            class: "form-input picker-input",
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.showUnitPicker = true)
          }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass({ placeholder: !$setup.selectedUnit })
              },
              vue.toDisplayString($setup.selectedUnit || "请选择单位"),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode("text", { class: "arrow" }, "›")
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label" }, "条形码"),
          vue.createElementVNode("view", { class: "barcode-input-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input barcode-input",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.medicineBarcode = $event),
                placeholder: "请输入或扫描条形码（必填）"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.medicineBarcode]
            ]),
            vue.createElementVNode("button", {
              class: "scan-btn",
              onClick: $setup.handleScanBarcode
            }, [
              vue.createElementVNode("text", { class: "scan-icon" }, "📷")
            ])
          ]),
          vue.createElementVNode(
            "text",
            { class: "form-tip" },
            "条形码用于" + vue.toDisplayString($setup.term("outbound")) + "时快速扫码识别" + vue.toDisplayString($setup.term("item")),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "数量"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.quantity = $event),
              type: "number",
              placeholder: "请输入数量"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              vue.vModelText,
              $setup.form.quantity,
              void 0,
              { number: true }
            ]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "生产日期"),
          vue.createElementVNode("view", { class: "date-input-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input date-input",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.productionDateInput = $event),
                onBlur: $setup.onProductionDateInput
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.productionDateInput]
            ]),
            vue.createElementVNode("button", {
              class: "date-picker-btn",
              onClick: $setup.openProductionDatePicker
            }, [
              vue.createElementVNode("text", { class: "picker-icon" }, "📅")
            ])
          ]),
          vue.createElementVNode("text", { class: "form-tip" }, "输入年月即可（如2024.12），日期可选")
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label required" }, "有效期"),
          vue.createElementVNode("view", { class: "date-input-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input date-input",
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.expiryDateInput = $event),
                onBlur: $setup.onExpiryDateInput
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.expiryDateInput]
            ]),
            vue.createElementVNode("button", {
              class: "date-picker-btn",
              onClick: $setup.openExpiryDatePicker
            }, [
              vue.createElementVNode("text", { class: "picker-icon" }, "📅")
            ])
          ]),
          vue.createElementVNode("text", { class: "form-tip" }, "输入年月即可（如2026.12），日期可选")
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label" }, "单价（元）"),
          vue.withDirectives(vue.createElementVNode("input", {
            class: "form-input",
            "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $setup.medicinePrice = $event),
            type: "digit",
            placeholder: `请输入${$setup.term("item")}单价（选填）`
          }, null, 8, ["placeholder"]), [
            [
              vue.vModelText,
              $setup.medicinePrice,
              void 0,
              { number: true }
            ]
          ]),
          vue.createElementVNode(
            "text",
            { class: "form-tip" },
            "新增" + vue.toDisplayString($setup.term("item")) + "时可填写单价，已有" + vue.toDisplayString($setup.term("item")) + "无需填写",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label" }, "备注"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              class: "form-textarea",
              "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.form.remark = $event),
              placeholder: "请输入备注信息（可选）",
              maxlength: "200"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.remark]
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "form-footer" }, [
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: $setup.handleSubmit,
          loading: $setup.submitting
        }, " 确认添加 ", 8, ["loading"])
      ]),
      $setup.showProductionDatePicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "picker-popup",
        onClick: _cache[13] || (_cache[13] = ($event) => $setup.showProductionDatePicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content date-picker-content",
          onClick: _cache[12] || (_cache[12] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("text", { class: "picker-title" }, "选择生产日期"),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[10] || (_cache[10] = ($event) => $setup.showProductionDatePicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "date-picker-body" }, [
            vue.createElementVNode("picker-view", {
              value: $setup.productionDatePickerValue,
              onChange: $setup.onProductionDatePickerChange,
              class: "date-picker-view",
              "indicator-style": "height: 88rpx;"
            }, [
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.years, (year) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: year,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(year) + "年",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.months, (month) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: month,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(month) + "月",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.days, (day) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: day,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(day === "不选" ? "日(可选)" : day + "日"),
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", { class: "picker-footer" }, [
            vue.createElementVNode("button", {
              class: "picker-cancel-btn",
              onClick: _cache[11] || (_cache[11] = ($event) => $setup.showProductionDatePicker = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "picker-confirm-btn",
              onClick: $setup.confirmProductionDate
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showExpiryDatePicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "picker-popup",
        onClick: _cache[17] || (_cache[17] = ($event) => $setup.showExpiryDatePicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content date-picker-content",
          onClick: _cache[16] || (_cache[16] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("text", { class: "picker-title" }, "选择有效期"),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[14] || (_cache[14] = ($event) => $setup.showExpiryDatePicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "date-picker-body" }, [
            vue.createElementVNode("picker-view", {
              value: $setup.expiryDatePickerValue,
              onChange: $setup.onExpiryDatePickerChange,
              class: "date-picker-view",
              "indicator-style": "height: 88rpx;"
            }, [
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.years, (year) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: year,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(year) + "年",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.months, (month) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: month,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(month) + "月",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.days, (day) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: day,
                        class: "date-picker-item"
                      },
                      vue.toDisplayString(day === "不选" ? "日(可选)" : day + "日"),
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", { class: "picker-footer" }, [
            vue.createElementVNode("button", {
              class: "picker-cancel-btn",
              onClick: _cache[15] || (_cache[15] = ($event) => $setup.showExpiryDatePicker = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "picker-confirm-btn",
              onClick: $setup.confirmExpiryDate
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showCategoryPicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "picker-popup",
        onClick: _cache[20] || (_cache[20] = ($event) => $setup.showCategoryPicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content simple-picker-content",
          onClick: _cache[19] || (_cache[19] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-title" },
              "选择" + vue.toDisplayString($setup.term("item")) + vue.toDisplayString($setup.term("category")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[18] || (_cache[18] = ($event) => $setup.showCategoryPicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("scroll-view", {
            class: "picker-list",
            "scroll-y": ""
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.categoryList, (cat) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: cat.id,
                  class: vue.normalizeClass(["simple-picker-item", { active: $setup.selectedCategoryId === cat.id }]),
                  onClick: ($event) => $setup.selectCategory(cat)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(cat.name),
                    1
                    /* TEXT */
                  ),
                  $setup.selectedCategoryId === cat.id ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showUnitPicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "picker-popup",
        onClick: _cache[23] || (_cache[23] = ($event) => $setup.showUnitPicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content simple-picker-content",
          onClick: _cache[22] || (_cache[22] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("text", { class: "picker-title" }, "选择单位"),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[21] || (_cache[21] = ($event) => $setup.showUnitPicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("scroll-view", {
            class: "picker-list",
            "scroll-y": ""
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.unitList, (unit) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: unit,
                  class: vue.normalizeClass(["simple-picker-item", { active: $setup.selectedUnit === unit }]),
                  onClick: ($event) => $setup.selectUnit(unit)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(unit),
                    1
                    /* TEXT */
                  ),
                  $setup.selectedUnit === unit ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showMedicinePicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "picker-popup",
        onClick: _cache[27] || (_cache[27] = ($event) => $setup.showMedicinePicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content",
          onClick: _cache[26] || (_cache[26] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-title" },
              "选择" + vue.toDisplayString($setup.term("item")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[24] || (_cache[24] = ($event) => $setup.showMedicinePicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "picker-search" }, [
            vue.withDirectives(vue.createElementVNode("input", {
              class: "search-input",
              "onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => $setup.medicineKeyword = $event),
              placeholder: `搜索${$setup.term("item")}名称`,
              onInput: $setup.searchMedicines
            }, null, 40, ["placeholder"]), [
              [vue.vModelText, $setup.medicineKeyword]
            ])
          ]),
          vue.createElementVNode("scroll-view", {
            class: "picker-list",
            "scroll-y": ""
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.medicineList, (medicine) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: medicine.id,
                  class: vue.normalizeClass(["picker-item", { active: $setup.form.medicine_id === medicine.id }]),
                  onClick: ($event) => $setup.selectMedicine(medicine)
                }, [
                  vue.createElementVNode("view", { class: "medicine-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "medicine-name" },
                      vue.toDisplayString(medicine.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "medicine-spec" },
                      vue.toDisplayString(medicine.specification),
                      1
                      /* TEXT */
                    )
                  ]),
                  $setup.form.medicine_id === medicine.id ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            $setup.medicineList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "empty-state"
            }, [
              vue.createElementVNode(
                "text",
                null,
                "暂无" + vue.toDisplayString($setup.term("item")) + "数据",
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesAddIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-89f6901d"], ["__file", "G:/YIYAO/medicine-app/pages/add/index.vue"]]);
  const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { term, refreshConfig } = useMode();
      const form = vue.ref({
        batch_id: 0,
        quantity: 1,
        reason: "销售",
        // 默认原因为"销售"
        recipient: "",
        batch_number: ""
      });
      const reasonOptions = [
        "销售",
        "损耗",
        "过期",
        "退货",
        "调拨",
        "其他"
      ];
      const showReasonPicker = vue.ref(false);
      const submitting = vue.ref(false);
      const scanning = vue.ref(false);
      const showMedicinePicker = vue.ref(false);
      const medicineList = vue.ref([]);
      const medicineKeyword = vue.ref("");
      const medicineName = vue.ref("");
      const selectedMedicineId = vue.ref(0);
      function onMedicineNameInput() {
        selectedMedicineId.value = 0;
      }
      async function loadMedicines() {
        try {
          const res = await medicineApi.list({ page: 1, page_size: 100 });
          medicineList.value = res.items || [];
        } catch (error) {
          formatAppLog("error", "at pages/outbound/index.vue:195", "加载药品列表失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
          medicineList.value = [];
        }
      }
      function searchMedicines() {
        loadMedicines();
      }
      function selectMedicine(medicine) {
        selectedMedicineId.value = medicine.id;
        medicineName.value = medicine.name;
        showMedicinePicker.value = false;
      }
      function selectReason(reason) {
        form.value.reason = reason;
        showReasonPicker.value = false;
      }
      function handleScanBarcode() {
        uni.scanCode({
          success: async (res) => {
            const code = res.result;
            if (code) {
              scanning.value = true;
              try {
                const medicine = await medicineApi.getByBarcode(code);
                selectedMedicineId.value = medicine.id;
                medicineName.value = medicine.name;
                uni.showToast({
                  title: `已识别: ${medicine.name}`,
                  icon: "success"
                });
              } catch (error) {
                formatAppLog("error", "at pages/outbound/index.vue:239", "条形码查询失败:", error);
                uni.showToast({
                  title: "未找到该条形码对应的药品",
                  icon: "none"
                });
              } finally {
                scanning.value = false;
              }
            }
          },
          fail: (err) => {
            var _a;
            if (!((_a = err.errMsg) == null ? void 0 : _a.includes("cancel"))) {
              uni.showToast({ title: "扫描失败", icon: "none" });
            }
          }
        });
      }
      async function loadScanResult() {
        try {
          const barcode = uni.getStorageSync("scannedBarcode");
          if (barcode) {
            uni.removeStorageSync("scannedBarcode");
            scanning.value = true;
            try {
              const medicine = await medicineApi.getByBarcode(barcode);
              selectedMedicineId.value = medicine.id;
              medicineName.value = medicine.name;
              uni.showToast({
                title: `已识别: ${medicine.name}`,
                icon: "success"
              });
            } catch (error) {
              formatAppLog("error", "at pages/outbound/index.vue:274", "条形码查询失败:", error);
              uni.showToast({
                title: "未找到该条形码对应的药品",
                icon: "none"
              });
            } finally {
              scanning.value = false;
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/outbound/index.vue:284", "读取扫描结果失败:", error);
        }
      }
      function validateForm() {
        if (!selectedMedicineId.value && !medicineName.value.trim()) {
          uni.showToast({ title: "请输入或选择药品名称", icon: "none" });
          return false;
        }
        if (!form.value.quantity || form.value.quantity <= 0) {
          uni.showToast({ title: "请输入正确的出库数量", icon: "none" });
          return false;
        }
        if (!form.value.reason || !form.value.reason.trim()) {
          uni.showToast({ title: "请输入出库原因", icon: "none" });
          return false;
        }
        return true;
      }
      async function handleSubmit() {
        var _a;
        if (!validateForm())
          return;
        submitting.value = true;
        try {
          let batchId = form.value.batch_id;
          if (!batchId || batchId === 0) {
            formatAppLog("log", "at pages/outbound/index.vue:318", "查找批次:", {
              medicineName: medicineName.value,
              batchNumber: form.value.batch_number,
              selectedMedicineId: selectedMedicineId.value
            });
            const inventoryRes = await inventoryApi.list({
              medicine_id: selectedMedicineId.value || void 0,
              page: 1,
              page_size: 100,
              show_zero_stock: false
              // 明确指定只查询有库存的批次
            });
            formatAppLog("log", "at pages/outbound/index.vue:333", "库存列表:", inventoryRes);
            formatAppLog("log", "at pages/outbound/index.vue:334", "库存数量:", ((_a = inventoryRes.items) == null ? void 0 : _a.length) || 0);
            let matchedBatch = null;
            if (!inventoryRes.items || inventoryRes.items.length === 0) {
              formatAppLog("error", "at pages/outbound/index.vue:340", "库存列表为空");
              uni.showToast({
                title: "未找到库存信息",
                icon: "none",
                duration: 3e3
              });
              submitting.value = false;
              return;
            }
            if (form.value.batch_number && form.value.batch_number.trim()) {
              formatAppLog("log", "at pages/outbound/index.vue:352", "按批次号匹配:", form.value.batch_number);
              matchedBatch = inventoryRes.items.find(
                (batch) => batch.medicine_name === medicineName.value && batch.batch_number === form.value.batch_number
              );
              formatAppLog("log", "at pages/outbound/index.vue:357", "批次号匹配结果:", matchedBatch);
            } else {
              formatAppLog("log", "at pages/outbound/index.vue:360", "按药品名称匹配:", medicineName.value);
              const batches = inventoryRes.items.filter((batch) => {
                formatAppLog("log", "at pages/outbound/index.vue:362", "检查批次:", batch.medicine_name, "===", medicineName.value, "?", batch.medicine_name === medicineName.value);
                return batch.medicine_name === medicineName.value && batch.quantity > 0;
              });
              formatAppLog("log", "at pages/outbound/index.vue:366", "匹配到的批次数:", batches.length);
              if (batches.length > 0) {
                matchedBatch = batches.reduce(
                  (max, batch) => batch.quantity > max.quantity ? batch : max
                );
                formatAppLog("log", "at pages/outbound/index.vue:372", "选择库存最多的批次:", matchedBatch);
              }
            }
            if (!matchedBatch) {
              formatAppLog("error", "at pages/outbound/index.vue:377", "未找到匹配的批次");
              uni.showToast({
                title: form.value.batch_number ? "未找到匹配的批次" : "该药品暂无库存",
                icon: "none",
                duration: 3e3
              });
              submitting.value = false;
              return;
            }
            batchId = matchedBatch.id;
            formatAppLog("log", "at pages/outbound/index.vue:388", "找到批次:", matchedBatch);
            if (matchedBatch.quantity < form.value.quantity) {
              uni.showToast({
                title: `库存不足，当前库存 ${matchedBatch.quantity}`,
                icon: "none"
              });
              submitting.value = false;
              return;
            }
          }
          const outboundData = {
            batch_id: Number(batchId),
            quantity: Number(form.value.quantity),
            reason: String(form.value.reason || "").trim()
          };
          if (form.value.recipient && form.value.recipient.trim()) {
            outboundData.recipient = String(form.value.recipient).trim();
          }
          formatAppLog("log", "at pages/outbound/index.vue:413", "准备出库:", JSON.stringify(outboundData));
          formatAppLog("log", "at pages/outbound/index.vue:414", "数据类型:", {
            batch_id: typeof outboundData.batch_id,
            quantity: typeof outboundData.quantity,
            reason: typeof outboundData.reason,
            reason_length: outboundData.reason.length
          });
          if (!outboundData.batch_id || outboundData.batch_id <= 0) {
            throw new Error("批次ID无效");
          }
          if (!outboundData.quantity || outboundData.quantity <= 0) {
            throw new Error("出库数量必须大于0");
          }
          if (!outboundData.reason || outboundData.reason.length === 0) {
            throw new Error("出库原因不能为空");
          }
          if (outboundData.reason.length > 200) {
            throw new Error("出库原因不能超过200字符");
          }
          await inventoryApi.outbound(outboundData);
          uni.showToast({
            title: "出库成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/outbound/index.vue:446", "出库失败:", error);
          formatAppLog("error", "at pages/outbound/index.vue:447", "错误详情:", JSON.stringify(error));
          let errorMessage = "出库失败，请重试";
          if (error.message) {
            errorMessage = error.message;
          } else if (error.data && error.data.detail) {
            errorMessage = error.data.detail;
          } else if (typeof error === "string") {
            errorMessage = error;
          }
          uni.showToast({
            title: errorMessage,
            icon: "none",
            duration: 3e3
          });
        } finally {
          submitting.value = false;
        }
      }
      function loadOCRResultFromStorage() {
        try {
          const result = uni.getStorageSync("ocrResult");
          if (result) {
            formatAppLog("log", "at pages/outbound/index.vue:475", "从本地存储接收到OCR识别结果:", result);
            uni.removeStorageSync("ocrResult");
            let filledCount = 0;
            if (result.batch_number) {
              form.value.batch_number = result.batch_number;
              filledCount++;
              formatAppLog("log", "at pages/outbound/index.vue:486", "填充批次号:", result.batch_number);
            }
            if (result.name) {
              medicineName.value = result.name;
              filledCount++;
              formatAppLog("log", "at pages/outbound/index.vue:493", "填充药品名称:", result.name);
              const matchedMedicine = medicineList.value.find(
                (m) => m.name === result.name || m.name.includes(result.name) || result.name.includes(m.name)
              );
              if (matchedMedicine) {
                selectedMedicineId.value = matchedMedicine.id;
                medicineName.value = matchedMedicine.name;
                formatAppLog("log", "at pages/outbound/index.vue:505", "匹配到药品:", matchedMedicine.name);
              } else {
                formatAppLog("log", "at pages/outbound/index.vue:507", "未匹配到药品，使用识别的名称:", result.name);
              }
            }
            if (filledCount > 0) {
              uni.showToast({
                title: `已自动填充${filledCount}个字段`,
                icon: "success",
                duration: 2e3
              });
            } else {
              uni.showToast({
                title: "未识别到有效信息",
                icon: "none",
                duration: 2e3
              });
            }
          } else {
            formatAppLog("log", "at pages/outbound/index.vue:525", "本地存储中没有OCR识别结果");
          }
        } catch (error) {
          formatAppLog("error", "at pages/outbound/index.vue:528", "读取OCR结果失败:", error);
          uni.showToast({
            title: "识别结果读取失败",
            icon: "none"
          });
        }
      }
      vue.onMounted(() => {
        loadMedicines();
        setTimeout(() => {
          loadOCRResultFromStorage();
        }, 300);
      });
      onShow(() => {
        refreshConfig();
        uni.setNavigationBarTitle({
          title: term("outbound")
        });
        loadScanResult();
      });
      const __returned__ = { term, refreshConfig, form, reasonOptions, showReasonPicker, submitting, scanning, showMedicinePicker, medicineList, medicineKeyword, medicineName, selectedMedicineId, onMedicineNameInput, loadMedicines, searchMedicines, selectMedicine, selectReason, handleScanBarcode, loadScanResult, validateForm, handleSubmit, loadOCRResultFromStorage };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "outbound-page" }, [
      vue.createElementVNode("view", { class: "quick-actions" }, [
        vue.createElementVNode("button", {
          class: "action-btn scan-barcode-btn",
          onClick: $setup.handleScanBarcode,
          loading: $setup.scanning
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "📷"),
          vue.createElementVNode(
            "text",
            { class: "action-text" },
            vue.toDisplayString($setup.scanning ? "识别中..." : `扫码${$setup.term("outbound")}`),
            1
            /* TEXT */
          )
        ], 8, ["loading"]),
        vue.createElementVNode(
          "text",
          { class: "action-tip" },
          "扫描" + vue.toDisplayString($setup.term("item")) + "条形码，快速识别" + vue.toDisplayString($setup.term("item")),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode(
            "view",
            { class: "form-label required" },
            vue.toDisplayString($setup.term("item")) + "名称",
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "medicine-input-group" }, [
            vue.withDirectives(vue.createElementVNode("input", {
              class: "form-input medicine-name-input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.medicineName = $event),
              placeholder: `请输入或选择${$setup.term("item")}名称`,
              onInput: $setup.onMedicineNameInput
            }, null, 40, ["placeholder"]), [
              [vue.vModelText, $setup.medicineName]
            ]),
            vue.createElementVNode("button", {
              class: "select-btn",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.showMedicinePicker = true)
            }, [
              vue.createElementVNode("text", { class: "select-icon" }, "📋")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode(
            "view",
            { class: "form-label required" },
            vue.toDisplayString($setup.term("outbound")) + "数量",
            1
            /* TEXT */
          ),
          vue.withDirectives(vue.createElementVNode("input", {
            class: "form-input",
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.quantity = $event),
            type: "number",
            placeholder: `请输入${$setup.term("outbound")}数量`
          }, null, 8, ["placeholder"]), [
            [
              vue.vModelText,
              $setup.form.quantity,
              void 0,
              { number: true }
            ]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode(
            "view",
            { class: "form-label required" },
            vue.toDisplayString($setup.term("outbound")) + "原因",
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "reason-input-group" }, [
            vue.createElementVNode("view", {
              class: "form-input reason-display",
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.showReasonPicker = true)
            }, [
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass({ placeholder: !$setup.form.reason })
                },
                vue.toDisplayString($setup.form.reason || `请选择${$setup.term("outbound")}原因`),
                3
                /* TEXT, CLASS */
              ),
              vue.createElementVNode("text", { class: "arrow" }, "▼")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "form-label" }, "领用人"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.recipient = $event),
              placeholder: "请输入领用人（选填）"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.recipient]
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "form-footer" }, [
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: $setup.handleSubmit,
          loading: $setup.submitting
        }, " 确认" + vue.toDisplayString($setup.term("outbound")), 9, ["loading"])
      ]),
      $setup.showReasonPicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "picker-popup",
        onClick: _cache[7] || (_cache[7] = ($event) => $setup.showReasonPicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content reason-picker-content",
          onClick: _cache[6] || (_cache[6] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-title" },
              "选择" + vue.toDisplayString($setup.term("outbound")) + "原因",
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[5] || (_cache[5] = ($event) => $setup.showReasonPicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("scroll-view", {
            class: "picker-list",
            "scroll-y": ""
          }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.reasonOptions, (reason, index) => {
                return vue.createElementVNode("view", {
                  key: index,
                  class: vue.normalizeClass(["picker-item reason-item", { active: $setup.form.reason === reason }]),
                  onClick: ($event) => $setup.selectReason(reason)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "reason-text" },
                    vue.toDisplayString(reason),
                    1
                    /* TEXT */
                  ),
                  $setup.form.reason === reason ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showMedicinePicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "picker-popup",
        onClick: _cache[11] || (_cache[11] = ($event) => $setup.showMedicinePicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "picker-content",
          onClick: _cache[10] || (_cache[10] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-title" },
              "选择" + vue.toDisplayString($setup.term("item")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", {
              class: "picker-close",
              onClick: _cache[8] || (_cache[8] = ($event) => $setup.showMedicinePicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "picker-search" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "search-input",
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.medicineKeyword = $event),
                placeholder: "搜索药品名称",
                onInput: $setup.searchMedicines
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.medicineKeyword]
            ])
          ]),
          vue.createElementVNode("scroll-view", {
            class: "picker-list",
            "scroll-y": ""
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.medicineList, (medicine) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: medicine.id,
                  class: vue.normalizeClass(["picker-item", { active: $setup.selectedMedicineId === medicine.id }]),
                  onClick: ($event) => $setup.selectMedicine(medicine)
                }, [
                  vue.createElementVNode("view", { class: "medicine-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "medicine-name" },
                      vue.toDisplayString(medicine.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "medicine-spec" },
                      vue.toDisplayString(medicine.specification),
                      1
                      /* TEXT */
                    )
                  ]),
                  $setup.selectedMedicineId === medicine.id ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            $setup.medicineList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "empty-state"
            }, [
              vue.createElementVNode("text", null, "暂无药品数据")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesOutboundIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-e24b5023"], ["__file", "G:/YIYAO/medicine-app/pages/outbound/index.vue"]]);
  const pageSize = 20;
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const loading = vue.ref(false);
      const loadingMore = vue.ref(false);
      const activeTab = vue.ref("");
      const autoCheckEnabled = vue.ref(true);
      const page = vue.ref(1);
      const total = vue.ref(0);
      const hasMore = vue.computed(() => list.value.length < total.value);
      const tabs = vue.computed(() => [
        { label: "全部", value: "", count: 0 },
        {
          label: "过期",
          value: "expired",
          count: list.value.filter((w) => w.type === "expired" && !w.is_read).length
        },
        {
          label: "临期",
          value: "expiry",
          count: list.value.filter((w) => w.type === "expiry" && !w.is_read).length
        },
        {
          label: "低库存",
          value: "low_stock",
          count: list.value.filter((w) => w.type === "low_stock" && !w.is_read).length
        }
      ]);
      async function loadList(isRefresh = false) {
        if (isRefresh) {
          page.value = 1;
          list.value = [];
        }
        if (page.value === 1) {
          loading.value = true;
        } else {
          loadingMore.value = true;
        }
        try {
          const res = await warningApi.list({
            page: page.value,
            page_size: pageSize,
            type: activeTab.value || void 0
          });
          if (isRefresh) {
            list.value = res.items;
          } else {
            list.value = [...list.value, ...res.items];
          }
          total.value = res.total;
        } catch (error) {
          formatAppLog("error", "at pages/warning/index.vue:159", "加载列表失败:", error);
        } finally {
          loading.value = false;
          loadingMore.value = false;
        }
      }
      function loadMore() {
        if (loadingMore.value || !hasMore.value)
          return;
        page.value++;
        loadList();
      }
      function switchTab(value) {
        activeTab.value = value;
        loadList(true);
      }
      let autoCheckTimer = null;
      async function autoCheckWarnings() {
        try {
          const res = await warningApi.checkWarnings();
          if (res.generated_count > 0) {
            loadList(true);
          }
        } catch (error) {
          formatAppLog("error", "at pages/warning/index.vue:191", "自动检查预警失败:", error);
        }
      }
      function startAutoCheck() {
        autoCheckWarnings();
        autoCheckTimer = setInterval(() => {
          autoCheckWarnings();
        }, 5 * 60 * 1e3);
      }
      function stopAutoCheck() {
        if (autoCheckTimer) {
          clearInterval(autoCheckTimer);
          autoCheckTimer = null;
        }
      }
      function toggleAutoCheck() {
        autoCheckEnabled.value = !autoCheckEnabled.value;
        if (autoCheckEnabled.value) {
          startAutoCheck();
          uni.showToast({
            title: "自动检查已开启",
            icon: "success"
          });
        } else {
          stopAutoCheck();
          uni.showToast({
            title: "自动检查已关闭",
            icon: "none"
          });
        }
        uni.setStorageSync("autoCheckEnabled", autoCheckEnabled.value);
      }
      async function markAsRead(warning) {
        try {
          await warningApi.markAsRead(warning.id);
          warning.is_read = true;
          uni.showToast({
            title: "已标记为已读",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/warning/index.vue:246", "标记已读失败:", error);
        }
      }
      async function markAllAsRead() {
        uni.showModal({
          title: "提示",
          content: "确定要将所有未读预警标记为已读吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                await warningApi.markAllAsRead();
                list.value.forEach((w) => {
                  w.is_read = true;
                });
                uni.showToast({
                  title: "操作成功",
                  icon: "success"
                });
              } catch (error) {
                formatAppLog("error", "at pages/warning/index.vue:267", "操作失败:", error);
              }
            }
          }
        });
      }
      function handleWarningClick(warning) {
        if (!warning.is_read) {
          markAsRead(warning);
        }
      }
      function showDeleteOptions() {
        uni.showActionSheet({
          itemList: ["删除已读预警", "删除全部预警"],
          success: (res) => {
            if (res.tapIndex === 0) {
              deleteReadWarnings();
            } else if (res.tapIndex === 1) {
              deleteAllWarnings();
            }
          }
        });
      }
      async function deleteReadWarnings() {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除所有已读预警吗？",
          confirmColor: "#F56C6C",
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await warningApi.deleteRead();
                uni.showToast({
                  title: result.message,
                  icon: "success"
                });
                loadList(true);
              } catch (error) {
                formatAppLog("error", "at pages/warning/index.vue:311", "删除失败:", error);
                uni.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      }
      async function deleteAllWarnings() {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除所有预警吗？此操作不可恢复！",
          confirmColor: "#F56C6C",
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await warningApi.deleteAll();
                uni.showToast({
                  title: result.message,
                  icon: "success"
                });
                loadList(true);
              } catch (error) {
                formatAppLog("error", "at pages/warning/index.vue:338", "删除失败:", error);
                uni.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      }
      function getWarningClass(type) {
        const classMap = {
          expired: "tag-danger",
          expiry: "tag-warning",
          low_stock: "tag-info"
        };
        return classMap[type] || "tag-info";
      }
      function getWarningText(type) {
        const textMap = {
          expired: "已过期",
          expiry: "临期",
          low_stock: "低库存"
        };
        return textMap[type] || "预警";
      }
      function formatTime(time) {
        return formatRelativeTime(time);
      }
      onPullDownRefresh(async () => {
        await loadList(true);
        uni.stopPullDownRefresh();
      });
      onReachBottom(() => {
        loadMore();
      });
      onLoad((options) => {
        if (options.type) {
          activeTab.value = options.type;
        }
        const savedAutoCheck = uni.getStorageSync("autoCheckEnabled");
        autoCheckEnabled.value = savedAutoCheck !== false;
        loadList(true);
        if (autoCheckEnabled.value) {
          startAutoCheck();
        }
      });
      onShow(() => {
        const filterType = uni.getStorageSync("warningFilterType");
        if (filterType) {
          uni.removeStorageSync("warningFilterType");
          if (filterType !== activeTab.value) {
            activeTab.value = filterType;
            loadList(true);
          }
        }
        if (autoCheckEnabled.value && !autoCheckTimer) {
          startAutoCheck();
        }
      });
      onHide(() => {
        stopAutoCheck();
      });
      vue.onUnmounted(() => {
        stopAutoCheck();
      });
      const __returned__ = { list, loading, loadingMore, activeTab, autoCheckEnabled, page, pageSize, total, hasMore, tabs, loadList, loadMore, switchTab, get autoCheckTimer() {
        return autoCheckTimer;
      }, set autoCheckTimer(v) {
        autoCheckTimer = v;
      }, autoCheckWarnings, startAutoCheck, stopAutoCheck, toggleAutoCheck, markAsRead, markAllAsRead, handleWarningClick, showDeleteOptions, deleteReadWarnings, deleteAllWarnings, getWarningClass, getWarningText, formatTime };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "warning-page" }, [
      vue.createElementVNode("view", { class: "tabs" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tabs, (tab) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: tab.value,
              class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === tab.value }]),
              onClick: ($event) => $setup.switchTab(tab.value)
            }, [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString(tab.label),
                1
                /* TEXT */
              ),
              tab.count > 0 ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "tab-badge"
                },
                vue.toDisplayString(tab.count),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "action-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["auto-check-status", { disabled: !$setup.autoCheckEnabled }]),
            onClick: $setup.toggleAutoCheck
          },
          [
            $setup.autoCheckEnabled ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "pulse-dot"
            })) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "static-dot"
            })),
            vue.createElementVNode(
              "text",
              { class: "status-text" },
              vue.toDisplayString($setup.autoCheckEnabled ? "自动检查" : "已关闭"),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode("view", {
          class: "action-btn",
          onClick: $setup.markAllAsRead
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "✓"),
          vue.createElementVNode("text", null, "已读")
        ]),
        vue.createElementVNode("view", {
          class: "action-btn delete-btn",
          onClick: $setup.showDeleteOptions
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "🗑️"),
          vue.createElementVNode("text", null, "删除")
        ]),
        vue.createElementVNode("view", {
          class: "action-btn refresh-btn",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.loadList(true))
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "🔄"),
          vue.createElementVNode("text", null, "刷新")
        ])
      ]),
      $setup.loading && $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-state"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "✅"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无预警信息")
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "warning-scroll"
      }, [
        vue.createElementVNode("view", { class: "warning-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.list, (warning) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: warning.id,
                class: vue.normalizeClass(["warning-item", { "is-read": warning.is_read }]),
                onClick: ($event) => $setup.handleWarningClick(warning)
              }, [
                vue.createElementVNode("view", { class: "warning-header" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["warning-tag", $setup.getWarningClass(warning.type)])
                    },
                    vue.toDisplayString($setup.getWarningText(warning.type)),
                    3
                    /* TEXT, CLASS */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "warning-time" },
                    vue.toDisplayString($setup.formatTime(warning.created_at)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "warning-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "warning-medicine" },
                    vue.toDisplayString(warning.medicine_name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "warning-message" },
                    vue.toDisplayString(warning.message),
                    1
                    /* TEXT */
                  )
                ]),
                !warning.is_read ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "warning-footer"
                }, [
                  vue.createElementVNode("view", {
                    class: "mark-read-btn",
                    onClick: vue.withModifiers(($event) => $setup.markAsRead(warning), ["stop"])
                  }, " 标记已读 ", 8, ["onClick"])
                ])) : vue.createCommentVNode("v-if", true)
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        $setup.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "load-more"
        }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($setup.loadingMore ? "加载中..." : "上拉加载更多"),
            1
            /* TEXT */
          )
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "no-more"
        }, [
          vue.createElementVNode("text", null, "没有更多了")
        ]))
      ]))
    ]);
  }
  const PagesWarningIndex = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-a6e250b1"], ["__file", "G:/YIYAO/medicine-app/pages/warning/index.vue"]]);
  var isVue2 = false;
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
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
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
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
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
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
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
  const USE_DEVTOOLS = IS_CLIENT;
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
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
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
    patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
    const originalHotUpdate = store._hotUpdate;
    vue.toRaw(store)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
    };
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
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
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
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
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
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
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
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
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
    function wrapAction(name, action) {
      return function() {
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
          name,
          store,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store, args);
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
    }
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
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
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
        const actionValue = hot ? prop : wrapAction(key, prop);
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
          const action = newStore[actionName];
          set(store, actionName, wrapAction(actionName, action));
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
    if (USE_DEVTOOLS) {
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
      if (USE_DEVTOOLS) {
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
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
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
  function setStorage(key, value) {
    try {
      uni.setStorageSync(key, JSON.stringify(value));
    } catch (error) {
      formatAppLog("error", "at src/utils/storage.ts:12", "setStorage error:", error);
    }
  }
  function getStorage(key) {
    try {
      const value = uni.getStorageSync(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      formatAppLog("error", "at src/utils/storage.ts:24", "getStorage error:", error);
      return null;
    }
  }
  function removeStorage(key) {
    try {
      uni.removeStorageSync(key);
    } catch (error) {
      formatAppLog("error", "at src/utils/storage.ts:36", "removeStorage error:", error);
    }
  }
  const tokenStorage = {
    get() {
      return uni.getStorageSync("token") || null;
    },
    set(token) {
      uni.setStorageSync("token", token);
    },
    remove() {
      uni.removeStorageSync("token");
    }
  };
  const userStorage = {
    get() {
      return getStorage("userInfo");
    },
    set(userInfo) {
      setStorage("userInfo", userInfo);
    },
    remove() {
      removeStorage("userInfo");
    }
  };
  const useUserStore = defineStore("user", {
    state: () => ({
      token: tokenStorage.get(),
      userInfo: userStorage.get(),
      isLoggedIn: !!tokenStorage.get()
    }),
    actions: {
      /**
       * 登录
       */
      async login(data) {
        try {
          const res = await authApi.login(data);
          this.token = res.access_token;
          this.userInfo = res.user;
          this.isLoggedIn = true;
          tokenStorage.set(res.access_token);
          userStorage.set(res.user);
          return res;
        } catch (error) {
          throw error;
        }
      },
      /**
       * 短信验证码登录
       */
      async smsLogin(phone, code) {
        try {
          const res = await authApi.smsLogin(phone, code);
          this.token = res.access_token;
          this.userInfo = res.user;
          this.isLoggedIn = true;
          tokenStorage.set(res.access_token);
          userStorage.set(res.user);
          return res;
        } catch (error) {
          throw error;
        }
      },
      /**
       * 退出登录
       */
      logout() {
        this.token = null;
        this.userInfo = null;
        this.isLoggedIn = false;
        tokenStorage.remove();
        userStorage.remove();
        uni.reLaunch({
          url: "/pages/login/index"
        });
      },
      /**
       * 获取当前用户信息
       */
      async fetchUserInfo() {
        try {
          const userInfo = await authApi.getCurrentUser();
          this.userInfo = userInfo;
          userStorage.set(userInfo);
          return userInfo;
        } catch (error) {
          throw error;
        }
      }
    }
  });
  const userApi = {
    /**
     * 更新个人资料
     */
    updateProfile(data) {
      return http.put("/users/profile", data);
    }
  };
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const userInfo = vue.computed(() => userStore.userInfo);
      const { modeName, modeIcon, refreshConfig } = useMode();
      const currentModeName = vue.computed(() => modeName.value);
      const currentModeIcon = vue.computed(() => modeIcon.value);
      const showConfigDialog = vue.ref(false);
      const showReplenishDialog = vue.ref(false);
      const replenishLoading = vue.ref(false);
      const replenishList = vue.ref([]);
      const showEditUsernameDialog = vue.ref(false);
      const newUsername = vue.ref("");
      const savingUsername = vue.ref(false);
      const showEditRealnameDialog = vue.ref(false);
      const newRealname = vue.ref("");
      const savingRealname = vue.ref(false);
      const config = vue.ref({
        expiry_warning_days: 90,
        low_stock_threshold: 10,
        reminder_start_time: "08:00",
        reminder_end_time: "20:00",
        reminder_enabled: true
      });
      const timeOptions = [
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00"
      ];
      function getTimeIndex(time) {
        const index = timeOptions.indexOf(time);
        return index >= 0 ? index : 2;
      }
      function onStartTimeChange(e) {
        config.value.reminder_start_time = timeOptions[e.detail.value];
      }
      function onEndTimeChange(e) {
        config.value.reminder_end_time = timeOptions[e.detail.value];
      }
      const currentTime = vue.ref("");
      const loginDays = vue.ref(1);
      function calculateLoginDays() {
        let firstUseDate = uni.getStorageSync("firstUseDate");
        if (!firstUseDate) {
          firstUseDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          uni.setStorageSync("firstUseDate", firstUseDate);
        }
        const first = new Date(firstUseDate);
        const now2 = /* @__PURE__ */ new Date();
        const diffTime = now2.getTime() - first.getTime();
        const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24)) + 1;
        loginDays.value = diffDays;
      }
      function updateTime() {
        const now2 = /* @__PURE__ */ new Date();
        const hours = String(now2.getHours()).padStart(2, "0");
        const minutes = String(now2.getMinutes()).padStart(2, "0");
        currentTime.value = `${hours}:${minutes}`;
      }
      function getAvatarEmoji() {
        var _a;
        const userType = (_a = userInfo.value) == null ? void 0 : _a.user_type;
        const emojis = {
          "admin": "👨‍💼",
          "manager": "👨‍🔬",
          "operator": "👨‍⚕️"
        };
        return emojis[userType || ""] || "👤";
      }
      function getUserTypeBadge() {
        var _a;
        const userType = (_a = userInfo.value) == null ? void 0 : _a.user_type;
        const badges = {
          "admin": "系统管理员",
          "manager": "仓库经理",
          "operator": "操作员"
        };
        return badges[userType || ""] || "普通用户";
      }
      function getUserTypeClass() {
        var _a;
        const userType = (_a = userInfo.value) == null ? void 0 : _a.user_type;
        const classes = {
          "admin": "badge-admin",
          "manager": "badge-manager",
          "operator": "badge-operator"
        };
        return classes[userType || ""] || "badge-user";
      }
      function getBadgeIcon() {
        var _a;
        const userType = (_a = userInfo.value) == null ? void 0 : _a.user_type;
        const icons = {
          "admin": "👑",
          "manager": "⭐",
          "operator": "🔧"
        };
        return icons[userType || ""] || "👤";
      }
      async function loadConfig() {
        try {
          const data = await warningApi.getConfig();
          config.value = data;
        } catch (error) {
          formatAppLog("error", "at pages/settings/index.vue:621", "加载配置失败:", error);
        }
      }
      function adjustDays(delta) {
        const newValue = config.value.expiry_warning_days + delta;
        if (newValue >= 1 && newValue <= 365) {
          config.value.expiry_warning_days = newValue;
        }
      }
      function adjustStock(delta) {
        const newValue = config.value.low_stock_threshold + delta;
        if (newValue >= 1 && newValue <= 1e3) {
          config.value.low_stock_threshold = newValue;
        }
      }
      async function saveConfig() {
        try {
          await warningApi.updateConfig(config.value);
          uni.showToast({ title: "保存成功", icon: "success" });
          showConfigDialog.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/settings/index.vue:648", "保存失败:", error);
        }
      }
      function goToMedicineList() {
        uni.switchTab({ url: "/pages/medicine/list" });
      }
      function goToWarnings() {
        uni.switchTab({ url: "/pages/warning/index" });
      }
      function goToSelectMode() {
        uni.navigateTo({
          url: "/pages/select-mode/index",
          success: () => {
          }
        });
      }
      function refreshData() {
        uni.showLoading({ title: "刷新中..." });
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({ title: "数据已刷新", icon: "success" });
          refreshConfig();
        }, 1e3);
      }
      function clearCache() {
        uni.showModal({
          title: "清除缓存",
          content: "确定要清除本地缓存吗？",
          success: (res) => {
            if (res.confirm) {
              const theme = uni.getStorageSync("theme");
              uni.clearStorageSync();
              if (theme) {
                uni.setStorageSync("theme", theme);
              }
              uni.showToast({ title: "缓存已清除", icon: "success" });
            }
          }
        });
      }
      function showAbout() {
        uni.showModal({
          title: "关于智管云",
          content: `版本：${AppConfig.getVersionText()}

一款专业的智能库存管理应用，帮助您轻松管理库存、追踪有效期、及时预警。

⚠️ 免责声明：
${AppConfig.disclaimer}`,
          showCancel: false
        });
      }
      function handleLogout() {
        uni.showModal({
          title: "退出登录",
          content: "确定要退出当前账号吗？",
          confirmColor: "#F56C6C",
          success: (res) => {
            if (res.confirm) {
              userStore.logout();
            }
          }
        });
      }
      async function loadReplenishSuggestions() {
        replenishLoading.value = true;
        try {
          const data = await warningApi.getReplenishSuggestions();
          replenishList.value = data;
        } catch (error) {
          formatAppLog("error", "at pages/settings/index.vue:732", "加载补货建议失败:", error);
        } finally {
          replenishLoading.value = false;
        }
      }
      async function calculateReplenish() {
        replenishLoading.value = true;
        try {
          const res = await warningApi.calculateReplenishSuggestions();
          replenishList.value = res.suggestions;
          if (res.count > 0) {
            uni.showToast({ title: `发现 ${res.count} 条建议`, icon: "none" });
          } else {
            uni.showToast({ title: "库存充足", icon: "success" });
          }
        } catch (error) {
          formatAppLog("error", "at pages/settings/index.vue:750", "计算补货建议失败:", error);
          uni.showToast({ title: "分析失败", icon: "none" });
        } finally {
          replenishLoading.value = false;
        }
      }
      vue.watch(showReplenishDialog, (val) => {
        if (val) {
          loadReplenishSuggestions();
        }
      });
      vue.watch(showEditUsernameDialog, (val) => {
        var _a;
        if (val) {
          newUsername.value = ((_a = userInfo.value) == null ? void 0 : _a.username) || "";
        }
      });
      vue.watch(showEditRealnameDialog, (val) => {
        var _a;
        if (val) {
          newRealname.value = ((_a = userInfo.value) == null ? void 0 : _a.realname) || "";
        }
      });
      async function saveUsername() {
        if (!newUsername.value || newUsername.value.length < 3) {
          uni.showToast({ title: "用户名至少3个字符", icon: "none" });
          return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(newUsername.value)) {
          uni.showToast({ title: "用户名只能包含字母、数字、下划线", icon: "none" });
          return;
        }
        savingUsername.value = true;
        try {
          await userApi.updateProfile({ username: newUsername.value });
          if (userStore.userInfo) {
            userStore.userInfo.username = newUsername.value;
          }
          uni.showToast({ title: "用户名修改成功", icon: "success" });
          showEditUsernameDialog.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/settings/index.vue:802", "修改用户名失败:", error);
        } finally {
          savingUsername.value = false;
        }
      }
      async function saveRealname() {
        savingRealname.value = true;
        try {
          await userApi.updateProfile({ realname: newRealname.value || void 0 });
          if (userStore.userInfo) {
            userStore.userInfo.realname = newRealname.value || null;
          }
          uni.showToast({ title: "真实姓名修改成功", icon: "success" });
          showEditRealnameDialog.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/settings/index.vue:822", "修改真实姓名失败:", error);
        } finally {
          savingRealname.value = false;
        }
      }
      vue.onMounted(() => {
        updateTime();
        setInterval(updateTime, 6e4);
        loadConfig();
        calculateLoginDays();
        uni.$on("modeChanged", () => {
          refreshConfig();
        });
      });
      const __returned__ = { userStore, userInfo, modeName, modeIcon, refreshConfig, currentModeName, currentModeIcon, showConfigDialog, showReplenishDialog, replenishLoading, replenishList, showEditUsernameDialog, newUsername, savingUsername, showEditRealnameDialog, newRealname, savingRealname, config, timeOptions, getTimeIndex, onStartTimeChange, onEndTimeChange, currentTime, loginDays, calculateLoginDays, updateTime, getAvatarEmoji, getUserTypeBadge, getUserTypeClass, getBadgeIcon, loadConfig, adjustDays, adjustStock, saveConfig, goToMedicineList, goToWarnings, goToSelectMode, refreshData, clearCache, showAbout, handleLogout, loadReplenishSuggestions, calculateReplenish, saveUsername, saveRealname, get AppConfig() {
        return AppConfig;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b, _c, _d;
    return vue.openBlock(), vue.createElementBlock("view", { class: "settings-page" }, [
      vue.createElementVNode("view", { class: "header-bg" }, [
        vue.createElementVNode("view", { class: "bg-pattern" })
      ]),
      vue.createElementVNode("view", { class: "user-card" }, [
        vue.createElementVNode("view", { class: "user-avatar-section" }, [
          vue.createElementVNode("view", { class: "avatar-container" }, [
            vue.createElementVNode("view", { class: "avatar-ring" }, [
              vue.createElementVNode("view", { class: "avatar-inner" }, [
                vue.createElementVNode(
                  "text",
                  { class: "avatar-emoji" },
                  vue.toDisplayString($setup.getAvatarEmoji()),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "online-indicator" })
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["user-badge", $setup.getUserTypeClass()])
            },
            [
              vue.createElementVNode(
                "text",
                { class: "badge-icon" },
                vue.toDisplayString($setup.getBadgeIcon()),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "badge-text" },
                vue.toDisplayString($setup.getUserTypeBadge()),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ]),
        vue.createElementVNode("view", { class: "user-info-section" }, [
          vue.createElementVNode(
            "text",
            { class: "user-name" },
            vue.toDisplayString(((_a = $setup.userInfo) == null ? void 0 : _a.username) || "未登录"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "user-realname" },
            vue.toDisplayString(((_b = $setup.userInfo) == null ? void 0 : _b.realname) || "欢迎使用智管云"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "user-stats" }, [
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.loginDays),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "使用天数")
            ]),
            vue.createElementVNode("view", { class: "stat-divider" }),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.currentTime),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "当前时间")
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "quick-features" }, [
        vue.createElementVNode("view", {
          class: "feature-item",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.showConfigDialog = true)
        }, [
          vue.createElementVNode("view", { class: "feature-icon warning" }, [
            vue.createElementVNode("text", null, "⚙️")
          ]),
          vue.createElementVNode("text", { class: "feature-text" }, "预警设置")
        ]),
        vue.createElementVNode("view", {
          class: "feature-item",
          onClick: _cache[1] || (_cache[1] = ($event) => $setup.showReplenishDialog = true)
        }, [
          vue.createElementVNode("view", { class: "feature-icon primary" }, [
            vue.createElementVNode("text", null, "📦")
          ]),
          vue.createElementVNode("text", { class: "feature-text" }, "补货建议")
        ]),
        vue.createElementVNode("view", {
          class: "feature-item",
          onClick: $setup.goToWarnings
        }, [
          vue.createElementVNode("view", { class: "feature-icon danger" }, [
            vue.createElementVNode("text", null, "🔔")
          ]),
          vue.createElementVNode("text", { class: "feature-text" }, "预警中心")
        ]),
        vue.createElementVNode("view", {
          class: "feature-item",
          onClick: $setup.refreshData
        }, [
          vue.createElementVNode("view", { class: "feature-icon success" }, [
            vue.createElementVNode("text", null, "🔄")
          ]),
          vue.createElementVNode("text", { class: "feature-text" }, "刷新数据")
        ])
      ]),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "账号设置")
        ]),
        vue.createElementVNode("view", { class: "menu-card" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.showEditUsernameDialog = true)
          }, [
            vue.createElementVNode("view", { class: "menu-left" }, [
              vue.createElementVNode("view", { class: "menu-icon-box purple" }, [
                vue.createElementVNode("text", { class: "menu-icon" }, "✏️")
              ]),
              vue.createElementVNode("view", { class: "menu-text" }, [
                vue.createElementVNode("text", { class: "menu-title" }, "修改用户名"),
                vue.createElementVNode(
                  "text",
                  { class: "menu-subtitle" },
                  "当前：" + vue.toDisplayString(((_c = $setup.userInfo) == null ? void 0 : _c.username) || "未设置"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "menu-right" }, [
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.showEditRealnameDialog = true)
          }, [
            vue.createElementVNode("view", { class: "menu-left" }, [
              vue.createElementVNode("view", { class: "menu-icon-box blue" }, [
                vue.createElementVNode("text", { class: "menu-icon" }, "👤")
              ]),
              vue.createElementVNode("view", { class: "menu-text" }, [
                vue.createElementVNode("text", { class: "menu-title" }, "修改真实姓名"),
                vue.createElementVNode(
                  "text",
                  { class: "menu-subtitle" },
                  "当前：" + vue.toDisplayString(((_d = $setup.userInfo) == null ? void 0 : _d.realname) || "未设置"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "menu-right" }, [
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "系统设置")
        ]),
        vue.createElementVNode("view", { class: "menu-card" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: $setup.goToSelectMode
          }, [
            vue.createElementVNode("view", { class: "menu-left" }, [
              vue.createElementVNode("view", { class: "menu-icon-box gradient" }, [
                vue.createElementVNode(
                  "text",
                  { class: "menu-icon" },
                  vue.toDisplayString($setup.currentModeIcon),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "menu-text" }, [
                vue.createElementVNode("text", { class: "menu-title" }, "使用场景"),
                vue.createElementVNode(
                  "text",
                  { class: "menu-subtitle" },
                  "当前：" + vue.toDisplayString($setup.currentModeName),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "menu-right" }, [
              vue.createElementVNode("text", { class: "menu-value" }, "切换"),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[4] || (_cache[4] = ($event) => $setup.showConfigDialog = true)
          }, [
            vue.createElementVNode("view", { class: "menu-left" }, [
              vue.createElementVNode("view", { class: "menu-icon-box orange" }, [
                vue.createElementVNode("text", { class: "menu-icon" }, "⏰")
              ]),
              vue.createElementVNode("view", { class: "menu-text" }, [
                vue.createElementVNode("text", { class: "menu-title" }, "预警配置"),
                vue.createElementVNode(
                  "text",
                  { class: "menu-subtitle" },
                  "临期" + vue.toDisplayString($setup.config.expiry_warning_days) + "天 · 库存" + vue.toDisplayString($setup.config.low_stock_threshold) + "件",
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "menu-right" }, [
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: $setup.clearCache
          }, [
            vue.createElementVNode("view", { class: "menu-left" }, [
              vue.createElementVNode("view", { class: "menu-icon-box blue" }, [
                vue.createElementVNode("text", { class: "menu-icon" }, "🗑️")
              ]),
              vue.createElementVNode("view", { class: "menu-text" }, [
                vue.createElementVNode("text", { class: "menu-title" }, "清除缓存"),
                vue.createElementVNode("text", { class: "menu-subtitle" }, "清理本地缓存数据")
              ])
            ]),
            vue.createElementVNode("view", { class: "menu-right" }, [
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "关于应用")
        ]),
        vue.createElementVNode("view", { class: "menu-card" }, [
          vue.createElementVNode("view", { class: "menu-item" }, [
            vue.createElementVNode("view", { class: "menu-left" }, [
              vue.createElementVNode("view", { class: "menu-icon-box purple" }, [
                vue.createElementVNode("text", { class: "menu-icon" }, "💊")
              ]),
              vue.createElementVNode("view", { class: "menu-text" }, [
                vue.createElementVNode("text", { class: "menu-title" }, "智管云"),
                vue.createElementVNode("text", { class: "menu-subtitle" }, "智能库存管理系统")
              ])
            ]),
            vue.createElementVNode("view", { class: "menu-right" }, [
              vue.createElementVNode(
                "view",
                { class: "version-tag" },
                vue.toDisplayString($setup.AppConfig.getVersionText()),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: $setup.showAbout
          }, [
            vue.createElementVNode("view", { class: "menu-left" }, [
              vue.createElementVNode("view", { class: "menu-icon-box green" }, [
                vue.createElementVNode("text", { class: "menu-icon" }, "ℹ️")
              ]),
              vue.createElementVNode("view", { class: "menu-text" }, [
                vue.createElementVNode("text", { class: "menu-title" }, "关于我们"),
                vue.createElementVNode("text", { class: "menu-subtitle" }, "了解更多信息")
              ])
            ]),
            vue.createElementVNode("view", { class: "menu-right" }, [
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "logout-section" }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: $setup.handleLogout
        }, [
          vue.createElementVNode("text", { class: "logout-text" }, "退出登录")
        ]),
        vue.createElementVNode("text", { class: "logout-hint" }, "退出后需要重新登录")
      ]),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("text", { class: "footer-text" }, "© 2026 智管云"),
        vue.createElementVNode("text", { class: "footer-sub" }, "Made with ❤️"),
        vue.createElementVNode("text", { class: "footer-disclaimer" }, "本助手仅辅助管理，无收银功能，不可商用")
      ]),
      $setup.showConfigDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "dialog-overlay",
        onClick: _cache[14] || (_cache[14] = ($event) => $setup.showConfigDialog = false)
      }, [
        vue.createElementVNode("view", {
          class: "dialog-container",
          onClick: _cache[13] || (_cache[13] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "dialog-header" }, [
            vue.createElementVNode("view", { class: "dialog-title-wrap" }, [
              vue.createElementVNode("text", { class: "dialog-icon" }, "⚙️"),
              vue.createElementVNode("text", { class: "dialog-title" }, "预警配置")
            ]),
            vue.createElementVNode("view", {
              class: "dialog-close",
              onClick: _cache[5] || (_cache[5] = ($event) => $setup.showConfigDialog = false)
            }, [
              vue.createElementVNode("text", null, "✕")
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-body" }, [
            vue.createElementVNode("view", { class: "config-card" }, [
              vue.createElementVNode("view", { class: "config-header" }, [
                vue.createElementVNode("text", { class: "config-icon" }, "⏰"),
                vue.createElementVNode("text", { class: "config-title" }, "临期预警天数")
              ]),
              vue.createElementVNode("view", { class: "config-input-wrap" }, [
                vue.createElementVNode("button", {
                  class: "config-btn minus",
                  onClick: _cache[6] || (_cache[6] = ($event) => $setup.adjustDays(-10))
                }, "-10"),
                vue.createElementVNode("view", { class: "config-value-box" }, [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "number",
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.config.expiry_warning_days = $event),
                      class: "config-input"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      vue.vModelText,
                      $setup.config.expiry_warning_days,
                      void 0,
                      { number: true }
                    ]
                  ]),
                  vue.createElementVNode("text", { class: "config-unit" }, "天")
                ]),
                vue.createElementVNode("button", {
                  class: "config-btn plus",
                  onClick: _cache[8] || (_cache[8] = ($event) => $setup.adjustDays(10))
                }, "+10")
              ]),
              vue.createElementVNode("text", { class: "config-hint" }, "药品有效期剩余天数低于此值时触发预警")
            ]),
            vue.createElementVNode("view", { class: "config-card" }, [
              vue.createElementVNode("view", { class: "config-header" }, [
                vue.createElementVNode("text", { class: "config-icon" }, "📦"),
                vue.createElementVNode("text", { class: "config-title" }, "低库存阈值")
              ]),
              vue.createElementVNode("view", { class: "config-input-wrap" }, [
                vue.createElementVNode("button", {
                  class: "config-btn minus",
                  onClick: _cache[9] || (_cache[9] = ($event) => $setup.adjustStock(-5))
                }, "-5"),
                vue.createElementVNode("view", { class: "config-value-box" }, [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "number",
                      "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $setup.config.low_stock_threshold = $event),
                      class: "config-input"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      vue.vModelText,
                      $setup.config.low_stock_threshold,
                      void 0,
                      { number: true }
                    ]
                  ]),
                  vue.createElementVNode("text", { class: "config-unit" }, "件")
                ]),
                vue.createElementVNode("button", {
                  class: "config-btn plus",
                  onClick: _cache[11] || (_cache[11] = ($event) => $setup.adjustStock(5))
                }, "+5")
              ]),
              vue.createElementVNode("text", { class: "config-hint" }, "库存数量低于此值时触发低库存预警")
            ]),
            vue.createElementVNode("view", { class: "config-card" }, [
              vue.createElementVNode("view", { class: "config-header" }, [
                vue.createElementVNode("text", { class: "config-icon" }, "🔔"),
                vue.createElementVNode("text", { class: "config-title" }, "提醒时间段")
              ]),
              vue.createElementVNode("view", { class: "time-range-row" }, [
                vue.createElementVNode("view", { class: "time-select-item" }, [
                  vue.createElementVNode("text", { class: "time-label" }, "开始"),
                  vue.createElementVNode("picker", {
                    mode: "selector",
                    range: $setup.timeOptions,
                    value: $setup.getTimeIndex($setup.config.reminder_start_time || "08:00"),
                    onChange: $setup.onStartTimeChange
                  }, [
                    vue.createElementVNode("view", { class: "time-dropdown" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "time-value" },
                        vue.toDisplayString($setup.config.reminder_start_time || "08:00"),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "dropdown-icon" }, "▼")
                    ])
                  ], 40, ["value"])
                ]),
                vue.createElementVNode("text", { class: "time-separator" }, "至"),
                vue.createElementVNode("view", { class: "time-select-item" }, [
                  vue.createElementVNode("text", { class: "time-label" }, "结束"),
                  vue.createElementVNode("picker", {
                    mode: "selector",
                    range: $setup.timeOptions,
                    value: $setup.getTimeIndex($setup.config.reminder_end_time || "20:00"),
                    onChange: $setup.onEndTimeChange
                  }, [
                    vue.createElementVNode("view", { class: "time-dropdown" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "time-value" },
                        vue.toDisplayString($setup.config.reminder_end_time || "20:00"),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "dropdown-icon" }, "▼")
                    ])
                  ], 40, ["value"])
                ])
              ]),
              vue.createElementVNode("text", { class: "config-hint" }, "在此时间段内推送预警通知")
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-footer" }, [
            vue.createElementVNode("button", {
              class: "dialog-btn cancel",
              onClick: _cache[12] || (_cache[12] = ($event) => $setup.showConfigDialog = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "dialog-btn confirm",
              onClick: $setup.saveConfig
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "✓"),
              vue.createElementVNode("text", null, "保存设置")
            ])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showReplenishDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "dialog-overlay",
        onClick: _cache[18] || (_cache[18] = ($event) => $setup.showReplenishDialog = false)
      }, [
        vue.createElementVNode("view", {
          class: "dialog-container replenish-dialog",
          onClick: _cache[17] || (_cache[17] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "dialog-header" }, [
            vue.createElementVNode("view", { class: "dialog-title-wrap" }, [
              vue.createElementVNode("text", { class: "dialog-icon" }, "📦"),
              vue.createElementVNode("text", { class: "dialog-title" }, "补货建议")
            ]),
            vue.createElementVNode("view", {
              class: "dialog-close",
              onClick: _cache[15] || (_cache[15] = ($event) => $setup.showReplenishDialog = false)
            }, [
              vue.createElementVNode("text", null, "✕")
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-body replenish-body" }, [
            $setup.replenishLoading ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "replenish-loading"
            }, [
              vue.createElementVNode("text", null, "分析中...")
            ])) : $setup.replenishList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "replenish-empty"
            }, [
              vue.createElementVNode("text", { class: "empty-icon" }, "✅"),
              vue.createElementVNode("text", { class: "empty-text" }, "库存充足，暂无补货建议")
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "replenish-list"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.replenishList, (item) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: item.id,
                      class: vue.normalizeClass(["replenish-item", { urgent: item.is_urgent }])
                    },
                    [
                      vue.createElementVNode("view", { class: "replenish-header" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "replenish-name" },
                          vue.toDisplayString(item.medicine_name),
                          1
                          /* TEXT */
                        ),
                        item.is_urgent ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "urgent-tag"
                        }, "紧急")) : vue.createCommentVNode("v-if", true)
                      ]),
                      vue.createElementVNode("view", { class: "replenish-info" }, [
                        vue.createElementVNode("view", { class: "info-row" }, [
                          vue.createElementVNode("text", { class: "info-label" }, "当前库存"),
                          vue.createElementVNode(
                            "text",
                            { class: "info-value" },
                            vue.toDisplayString(item.current_stock) + " 件",
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "info-row" }, [
                          vue.createElementVNode("text", { class: "info-label" }, "日均消耗"),
                          vue.createElementVNode(
                            "text",
                            { class: "info-value" },
                            vue.toDisplayString(item.avg_daily_consumption) + " 件/天",
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "info-row" }, [
                          vue.createElementVNode("text", { class: "info-label" }, "预计断货"),
                          vue.createElementVNode(
                            "text",
                            {
                              class: vue.normalizeClass(["info-value", { "text-danger": item.days_until_stockout <= 7 }])
                            },
                            vue.toDisplayString(item.days_until_stockout) + " 天后 ",
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "info-row highlight" }, [
                          vue.createElementVNode("text", { class: "info-label" }, "建议补货"),
                          vue.createElementVNode(
                            "text",
                            { class: "info-value text-primary" },
                            vue.toDisplayString(item.suggested_quantity) + " 件",
                            1
                            /* TEXT */
                          )
                        ])
                      ])
                    ],
                    2
                    /* CLASS */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]))
          ]),
          vue.createElementVNode("view", { class: "dialog-footer" }, [
            vue.createElementVNode("button", {
              class: "dialog-btn cancel",
              onClick: _cache[16] || (_cache[16] = ($event) => $setup.showReplenishDialog = false)
            }, "关闭"),
            vue.createElementVNode("button", {
              class: "dialog-btn confirm",
              onClick: $setup.calculateReplenish
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "🔄"),
              vue.createElementVNode("text", null, "重新分析")
            ])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showEditUsernameDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "dialog-overlay",
        onClick: _cache[23] || (_cache[23] = ($event) => $setup.showEditUsernameDialog = false)
      }, [
        vue.createElementVNode("view", {
          class: "dialog-container edit-dialog",
          onClick: _cache[22] || (_cache[22] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "dialog-header" }, [
            vue.createElementVNode("view", { class: "dialog-title-wrap" }, [
              vue.createElementVNode("text", { class: "dialog-icon" }, "✏️"),
              vue.createElementVNode("text", { class: "dialog-title" }, "修改用户名")
            ]),
            vue.createElementVNode("view", {
              class: "dialog-close",
              onClick: _cache[19] || (_cache[19] = ($event) => $setup.showEditUsernameDialog = false)
            }, [
              vue.createElementVNode("text", null, "✕")
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-body edit-dialog-body" }, [
            vue.createElementVNode("view", { class: "edit-tip-box" }, [
              vue.createElementVNode("text", { class: "edit-tip-icon" }, "💡"),
              vue.createElementVNode("text", { class: "edit-tip-text" }, "用户名用于账号密码登录，修改后请使用新用户名登录")
            ]),
            vue.createElementVNode("view", { class: "edit-form-group" }, [
              vue.createElementVNode("text", { class: "edit-form-label" }, "新用户名"),
              vue.createElementVNode("view", { class: "edit-input-box" }, [
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "edit-form-input",
                    "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => $setup.newUsername = $event),
                    placeholder: "请输入新用户名",
                    maxlength: "20"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.newUsername]
                ])
              ]),
              vue.createElementVNode("text", { class: "edit-form-hint" }, "支持字母、数字、下划线，3-20个字符")
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-footer edit-dialog-footer" }, [
            vue.createElementVNode("button", {
              class: "dialog-btn cancel",
              onClick: _cache[21] || (_cache[21] = ($event) => $setup.showEditUsernameDialog = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "dialog-btn confirm",
              onClick: $setup.saveUsername,
              disabled: $setup.savingUsername
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($setup.savingUsername ? "保存中..." : "确认修改"),
                1
                /* TEXT */
              )
            ], 8, ["disabled"])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showEditRealnameDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "dialog-overlay",
        onClick: _cache[28] || (_cache[28] = ($event) => $setup.showEditRealnameDialog = false)
      }, [
        vue.createElementVNode("view", {
          class: "dialog-container edit-dialog",
          onClick: _cache[27] || (_cache[27] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "dialog-header" }, [
            vue.createElementVNode("view", { class: "dialog-title-wrap" }, [
              vue.createElementVNode("text", { class: "dialog-icon" }, "👤"),
              vue.createElementVNode("text", { class: "dialog-title" }, "修改真实姓名")
            ]),
            vue.createElementVNode("view", {
              class: "dialog-close",
              onClick: _cache[24] || (_cache[24] = ($event) => $setup.showEditRealnameDialog = false)
            }, [
              vue.createElementVNode("text", null, "✕")
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-body edit-dialog-body" }, [
            vue.createElementVNode("view", { class: "edit-form-group" }, [
              vue.createElementVNode("text", { class: "edit-form-label" }, "真实姓名"),
              vue.createElementVNode("view", { class: "edit-input-box" }, [
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "edit-form-input",
                    "onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => $setup.newRealname = $event),
                    placeholder: "请输入真实姓名",
                    maxlength: "20"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.newRealname]
                ])
              ]),
              vue.createElementVNode("text", { class: "edit-form-hint" }, "可选填写，方便管理员识别")
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-footer edit-dialog-footer" }, [
            vue.createElementVNode("button", {
              class: "dialog-btn cancel",
              onClick: _cache[26] || (_cache[26] = ($event) => $setup.showEditRealnameDialog = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: "dialog-btn confirm",
              onClick: $setup.saveRealname,
              disabled: $setup.savingRealname
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($setup.savingRealname ? "保存中..." : "确认修改"),
                1
                /* TEXT */
              )
            ], 8, ["disabled"])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSettingsIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-a11b3e9a"], ["__file", "G:/YIYAO/medicine-app/pages/settings/index.vue"]]);
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const loginType = vue.ref("password");
      const showAboutPopup = vue.ref(false);
      const showDisclaimerPopup = vue.ref(false);
      function openAbout() {
        showAboutPopup.value = true;
      }
      function closeAbout() {
        showAboutPopup.value = false;
      }
      function openDisclaimer() {
        showDisclaimerPopup.value = true;
      }
      function closeDisclaimer() {
        showDisclaimerPopup.value = false;
      }
      const agreeTerms = vue.ref(false);
      const form = vue.ref({
        username: "",
        password: ""
      });
      const loading = vue.ref(false);
      const usernameFocused = vue.ref(false);
      const passwordFocused = vue.ref(false);
      const smsForm = vue.ref({
        phone: "",
        code: ""
      });
      const phoneFocused = vue.ref(false);
      const codeFocused = vue.ref(false);
      const sendingCode = vue.ref(false);
      const countdown = vue.ref(0);
      const devCode = vue.ref("");
      function validateForm() {
        if (!form.value.username) {
          uni.showToast({ title: "请输入用户名", icon: "none" });
          return false;
        }
        if (!form.value.password) {
          uni.showToast({ title: "请输入密码", icon: "none" });
          return false;
        }
        if (!agreeTerms.value) {
          uni.showToast({ title: "请先阅读并同意免责声明和使用条款", icon: "none" });
          return false;
        }
        return true;
      }
      function validateSmsForm() {
        if (!smsForm.value.phone) {
          uni.showToast({ title: "请输入手机号", icon: "none" });
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(smsForm.value.phone)) {
          uni.showToast({ title: "手机号格式不正确", icon: "none" });
          return false;
        }
        if (!smsForm.value.code) {
          uni.showToast({ title: "请输入验证码", icon: "none" });
          return false;
        }
        if (!agreeTerms.value) {
          uni.showToast({ title: "请先阅读并同意免责声明和使用条款", icon: "none" });
          return false;
        }
        return true;
      }
      async function handleLogin() {
        if (!validateForm())
          return;
        loading.value = true;
        try {
          await userStore.login(form.value);
          uni.showToast({ title: "登录成功", icon: "success" });
          const appMode = uni.getStorageSync("app_mode");
          setTimeout(() => {
            if (appMode) {
              uni.switchTab({ url: "/pages/index/index" });
            } else {
              uni.navigateTo({ url: "/pages/select-mode/index" });
            }
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/login/index.vue:378", "登录失败:", error);
        } finally {
          loading.value = false;
        }
      }
      async function sendCode() {
        if (!smsForm.value.phone) {
          uni.showToast({ title: "请输入手机号", icon: "none" });
          return;
        }
        if (!/^1[3-9]\d{9}$/.test(smsForm.value.phone)) {
          uni.showToast({ title: "手机号格式不正确", icon: "none" });
          return;
        }
        sendingCode.value = true;
        devCode.value = "";
        try {
          const res = await authApi.sendSmsCode(smsForm.value.phone);
          uni.showToast({ title: res.message || "验证码已发送", icon: "none" });
          if (res.code) {
            devCode.value = res.code;
          }
          countdown.value = 60;
          const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
              clearInterval(timer);
            }
          }, 1e3);
        } catch (error) {
          formatAppLog("error", "at pages/login/index.vue:416", "发送验证码失败:", error);
        } finally {
          sendingCode.value = false;
        }
      }
      async function handleSmsLogin() {
        if (!validateSmsForm())
          return;
        loading.value = true;
        try {
          await userStore.smsLogin(smsForm.value.phone, smsForm.value.code);
          uni.showToast({ title: "登录成功", icon: "success" });
          devCode.value = "";
          const appMode = uni.getStorageSync("app_mode");
          setTimeout(() => {
            if (appMode) {
              uni.switchTab({ url: "/pages/index/index" });
            } else {
              uni.navigateTo({ url: "/pages/select-mode/index" });
            }
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/login/index.vue:445", "登录失败:", error);
        } finally {
          loading.value = false;
        }
      }
      const __returned__ = { userStore, loginType, showAboutPopup, showDisclaimerPopup, openAbout, closeAbout, openDisclaimer, closeDisclaimer, agreeTerms, form, loading, usernameFocused, passwordFocused, smsForm, phoneFocused, codeFocused, sendingCode, countdown, devCode, validateForm, validateSmsForm, handleLogin, sendCode, handleSmsLogin };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-page" }, [
      vue.createElementVNode("view", { class: "bg-decoration" }, [
        vue.createElementVNode("view", { class: "circle circle-1" }),
        vue.createElementVNode("view", { class: "circle circle-2" }),
        vue.createElementVNode("view", { class: "circle circle-3" })
      ]),
      vue.createElementVNode("view", { class: "login-container" }, [
        vue.createElementVNode("view", { class: "logo-section" }, [
          vue.createElementVNode("view", { class: "logo-wrapper" }, [
            vue.createElementVNode("image", {
              class: "logo-img",
              src: _imports_0,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "app-title" }, "智管云"),
          vue.createElementVNode("text", { class: "app-subtitle" }, "INTELLIGENT MANAGEMENT SYSTEM")
        ]),
        vue.createElementVNode("view", { class: "login-card" }, [
          vue.createElementVNode("view", { class: "card-header" }, [
            vue.createElementVNode("text", { class: "welcome-text" }, "欢迎登录"),
            vue.createElementVNode("text", { class: "welcome-desc" }, "请选择登录方式")
          ]),
          vue.createElementVNode("view", { class: "login-tabs" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["tab-item", { active: $setup.loginType === "password" }]),
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.loginType = "password")
              },
              [
                vue.createElementVNode("text", null, "账号密码")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["tab-item", { active: $setup.loginType === "sms" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.loginType = "sms")
              },
              [
                vue.createElementVNode("text", null, "验证码登录")
              ],
              2
              /* CLASS */
            )
          ]),
          $setup.loginType === "password" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "form-content"
          }, [
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("view", { class: "input-label" }, [
                vue.createElementVNode("text", { class: "label-icon" }, "👤"),
                vue.createElementVNode("text", { class: "label-text" }, "账号")
              ]),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["input-box", { focused: $setup.usernameFocused }])
                },
                [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      class: "input-field",
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.username = $event),
                      placeholder: "请输入用户名",
                      "placeholder-class": "input-placeholder",
                      onFocus: _cache[3] || (_cache[3] = ($event) => $setup.usernameFocused = true),
                      onBlur: _cache[4] || (_cache[4] = ($event) => $setup.usernameFocused = false)
                    },
                    null,
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.form.username]
                  ])
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("view", { class: "input-label" }, [
                vue.createElementVNode("text", { class: "label-icon" }, "🔒"),
                vue.createElementVNode("text", { class: "label-text" }, "密码")
              ]),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["input-box", { focused: $setup.passwordFocused }])
                },
                [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      class: "input-field",
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.password = $event),
                      type: "password",
                      placeholder: "请输入密码",
                      "placeholder-class": "input-placeholder",
                      onFocus: _cache[6] || (_cache[6] = ($event) => $setup.passwordFocused = true),
                      onBlur: _cache[7] || (_cache[7] = ($event) => $setup.passwordFocused = false)
                    },
                    null,
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.form.password]
                  ])
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "agreement-wrap" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["agreement-checkbox", { checked: $setup.agreeTerms }]),
                  onClick: _cache[8] || (_cache[8] = ($event) => $setup.agreeTerms = !$setup.agreeTerms)
                },
                [
                  $setup.agreeTerms ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode("view", { class: "agreement-text" }, [
                vue.createElementVNode("text", null, "我已阅读并同意"),
                vue.createElementVNode("text", {
                  class: "link",
                  onClick: vue.withModifiers($setup.openDisclaimer, ["stop"])
                }, "《免责声明》"),
                vue.createElementVNode("text", null, "和"),
                vue.createElementVNode("text", {
                  class: "link",
                  onClick: vue.withModifiers($setup.openAbout, ["stop"])
                }, "《使用条款》")
              ])
            ]),
            vue.createElementVNode("button", {
              class: "login-button",
              onClick: $setup.handleLogin,
              loading: $setup.loading,
              disabled: $setup.loading
            }, [
              vue.createElementVNode(
                "text",
                { class: "btn-text" },
                vue.toDisplayString($setup.loading ? "登录中..." : "立即登录"),
                1
                /* TEXT */
              )
            ], 8, ["loading", "disabled"])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.loginType === "sms" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "form-content"
          }, [
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("view", { class: "input-label" }, [
                vue.createElementVNode("text", { class: "label-icon" }, "📱"),
                vue.createElementVNode("text", { class: "label-text" }, "手机号")
              ]),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["input-box", { focused: $setup.phoneFocused }])
                },
                [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      class: "input-field",
                      "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.smsForm.phone = $event),
                      type: "number",
                      placeholder: "请输入手机号",
                      "placeholder-class": "input-placeholder",
                      maxlength: "11",
                      onFocus: _cache[10] || (_cache[10] = ($event) => $setup.phoneFocused = true),
                      onBlur: _cache[11] || (_cache[11] = ($event) => $setup.phoneFocused = false)
                    },
                    null,
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.smsForm.phone]
                  ])
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("view", { class: "input-label" }, [
                vue.createElementVNode("text", { class: "label-icon" }, "🔢"),
                vue.createElementVNode("text", { class: "label-text" }, "验证码")
              ]),
              vue.createElementVNode("view", { class: "code-input-wrap" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["input-box code-input", { focused: $setup.codeFocused }])
                  },
                  [
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        class: "input-field",
                        "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $setup.smsForm.code = $event),
                        type: "number",
                        placeholder: "请输入验证码",
                        "placeholder-class": "input-placeholder",
                        maxlength: "6",
                        onFocus: _cache[13] || (_cache[13] = ($event) => $setup.codeFocused = true),
                        onBlur: _cache[14] || (_cache[14] = ($event) => $setup.codeFocused = false)
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [vue.vModelText, $setup.smsForm.code]
                    ])
                  ],
                  2
                  /* CLASS */
                ),
                vue.createElementVNode("button", {
                  class: "send-code-btn",
                  disabled: $setup.countdown > 0 || $setup.sendingCode,
                  onClick: $setup.sendCode
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "send-code-text" },
                    vue.toDisplayString($setup.countdown > 0 ? `${$setup.countdown}s` : "获取验证码"),
                    1
                    /* TEXT */
                  )
                ], 8, ["disabled"])
              ])
            ]),
            $setup.devCode ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "dev-code-tip"
            }, [
              vue.createElementVNode("text", { class: "dev-code-label" }, "测试验证码："),
              vue.createElementVNode(
                "text",
                { class: "dev-code-value" },
                vue.toDisplayString($setup.devCode),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "agreement-wrap" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["agreement-checkbox", { checked: $setup.agreeTerms }]),
                  onClick: _cache[15] || (_cache[15] = ($event) => $setup.agreeTerms = !$setup.agreeTerms)
                },
                [
                  $setup.agreeTerms ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode("view", { class: "agreement-text" }, [
                vue.createElementVNode("text", null, "我已阅读并同意"),
                vue.createElementVNode("text", {
                  class: "link",
                  onClick: vue.withModifiers($setup.openDisclaimer, ["stop"])
                }, "《免责声明》"),
                vue.createElementVNode("text", null, "和"),
                vue.createElementVNode("text", {
                  class: "link",
                  onClick: vue.withModifiers($setup.openAbout, ["stop"])
                }, "《使用条款》")
              ])
            ]),
            vue.createElementVNode("button", {
              class: "login-button",
              onClick: $setup.handleSmsLogin,
              loading: $setup.loading,
              disabled: $setup.loading
            }, [
              vue.createElementVNode(
                "text",
                { class: "btn-text" },
                vue.toDisplayString($setup.loading ? "登录中..." : "立即登录"),
                1
                /* TEXT */
              )
            ], 8, ["loading", "disabled"])
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "footer-info" }, [
          vue.createElementVNode("view", { class: "footer-links" }, [
            vue.createElementVNode("text", {
              class: "link",
              onClick: $setup.openAbout
            }, "关于我们"),
            vue.createElementVNode("text", { class: "divider" }, "|"),
            vue.createElementVNode("text", {
              class: "link",
              onClick: $setup.openDisclaimer
            }, "免责声明")
          ]),
          vue.createElementVNode("text", { class: "footer-text" }, "智能提醒 · 安全管理 · 高效便捷")
        ])
      ]),
      $setup.showAboutPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "popup-mask",
        onClick: $setup.closeAbout
      }, [
        vue.createElementVNode("view", {
          class: "popup-content about-popup",
          onClick: _cache[16] || (_cache[16] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "popup-header about-header" }, [
            vue.createElementVNode("image", {
              class: "popup-logo-img",
              src: _imports_0,
              mode: "aspectFit"
            }),
            vue.createElementVNode("text", { class: "popup-title" }, "智管云"),
            vue.createElementVNode("text", { class: "popup-version" }, "v6.0.2")
          ]),
          vue.createElementVNode("view", { class: "popup-body" }, [
            vue.createElementVNode("text", { class: "popup-desc" }, "智管云是一款专业的库存管理软件，支持药品管理、商品库存、食品管理等多种使用场景。"),
            vue.createElementVNode("view", { class: "popup-features" }, [
              vue.createElementVNode("view", { class: "feature-item" }, [
                vue.createElementVNode("text", { class: "feature-icon" }, "📦"),
                vue.createElementVNode("text", { class: "feature-text" }, "库存管理")
              ]),
              vue.createElementVNode("view", { class: "feature-item" }, [
                vue.createElementVNode("text", { class: "feature-icon" }, "🔔"),
                vue.createElementVNode("text", { class: "feature-text" }, "智能预警")
              ]),
              vue.createElementVNode("view", { class: "feature-item" }, [
                vue.createElementVNode("text", { class: "feature-icon" }, "📊"),
                vue.createElementVNode("text", { class: "feature-text" }, "数据报表")
              ]),
              vue.createElementVNode("view", { class: "feature-item" }, [
                vue.createElementVNode("text", { class: "feature-icon" }, "📱"),
                vue.createElementVNode("text", { class: "feature-text" }, "移动办公")
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "popup-footer" }, [
            vue.createElementVNode("button", {
              class: "popup-btn",
              onClick: $setup.closeAbout
            }, "我知道了")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showDisclaimerPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "popup-mask",
        onClick: $setup.closeDisclaimer
      }, [
        vue.createElementVNode("view", {
          class: "popup-content disclaimer-popup",
          onClick: _cache[17] || (_cache[17] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "popup-header disclaimer-header" }, [
            vue.createElementVNode("text", { class: "popup-icon" }, "⚠️"),
            vue.createElementVNode("text", { class: "popup-title" }, "免责声明")
          ]),
          vue.createElementVNode("view", { class: "popup-body" }, [
            vue.createElementVNode("view", { class: "disclaimer-list" }, [
              vue.createElementVNode("view", { class: "disclaimer-item" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "⚠️"),
                vue.createElementVNode("text", { class: "item-text" }, [
                  vue.createTextVNode("本系统仅用于辅助库存管理，"),
                  vue.createElementVNode("text", { class: "highlight" }, "无任何收银交易功能")
                ])
              ]),
              vue.createElementVNode("view", { class: "disclaimer-item" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "⚠️"),
                vue.createElementVNode("text", { class: "item-text" }, [
                  vue.createTextVNode("本系统仅供个人学习研究使用，"),
                  vue.createElementVNode("text", { class: "highlight" }, "不可用于商业用途")
                ])
              ]),
              vue.createElementVNode("view", { class: "disclaimer-item" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "⚠️"),
                vue.createElementVNode("text", { class: "item-text" }, "使用本系统产生的任何问题，开发者不承担任何责任")
              ]),
              vue.createElementVNode("view", { class: "disclaimer-item" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "⚠️"),
                vue.createElementVNode("text", { class: "item-text" }, "库存管理涉及安全问题，请以实际库存为准")
              ]),
              vue.createElementVNode("view", { class: "disclaimer-item" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "⚠️"),
                vue.createElementVNode("text", { class: "item-text" }, "请妥善保管您的账号密码，避免泄露")
              ])
            ]),
            vue.createElementVNode("text", { class: "disclaimer-footer" }, "使用本系统即表示您已阅读并同意以上声明")
          ]),
          vue.createElementVNode("view", { class: "popup-footer" }, [
            vue.createElementVNode("button", {
              class: "popup-btn",
              onClick: $setup.closeDisclaimer
            }, "我知道了")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"], ["__file", "G:/YIYAO/medicine-app/pages/login/index.vue"]]);
  __definePage("pages/splash/index", PagesSplashIndex);
  __definePage("pages/select-mode/index", PagesSelectModeIndex);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/medicine/list", PagesMedicineList);
  __definePage("pages/medicine/detail", PagesMedicineDetail);
  __definePage("pages/medicine/edit", PagesMedicineEdit);
  __definePage("pages/add/index", PagesAddIndex);
  __definePage("pages/outbound/index", PagesOutboundIndex);
  __definePage("pages/warning/index", PagesWarningIndex);
  __definePage("pages/settings/index", PagesSettingsIndex);
  __definePage("pages/login/index", PagesLoginIndex);
  function initPushNotification() {
    if (typeof plus !== "undefined" && plus.push) {
      plus.globalEvent.addEventListener("newPath", ({ path }) => {
        if (!path) {
          return;
        }
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        if (currentPage && currentPage.$page && currentPage.$page.fullPath === path) {
          return;
        }
        uni.navigateTo({
          url: path,
          fail(res) {
            if (res.errMsg.indexOf("tabbar") > -1) {
              uni.switchTab({
                url: path,
                fail(res2) {
                  console.error(res2.errMsg);
                }
              });
            } else {
              console.error(res.errMsg);
            }
          }
        });
      });
    }
  }
  uni.invokePushCallback({
    type: "enabled",
    offline: true
  });
  Promise.resolve().then(() => {
    initPushNotification();
    plus.push.setAutoNotification && plus.push.setAutoNotification(false);
  });
  function requestNotificationPermission() {
    if (plus.os.name === "Android") {
      const permissionListener = uni.createRequestPermissionListener();
      permissionListener.onRequest((e) => {
        formatAppLog("log", "at src/utils/push.ts:18", "权限请求:", e);
      });
      permissionListener.onConfirm((e) => {
        formatAppLog("log", "at src/utils/push.ts:22", "权限确认:", e);
        permissionListener.stop();
      });
      permissionListener.onComplete((e) => {
        formatAppLog("log", "at src/utils/push.ts:27", "权限请求完成:", e);
        permissionListener.stop();
      });
      plus.android.requestPermissions(
        ["android.permission.POST_NOTIFICATIONS"],
        (result) => {
          formatAppLog("log", "at src/utils/push.ts:36", "通知权限请求结果:", result);
          if (result.granted && result.granted.length > 0) {
            formatAppLog("log", "at src/utils/push.ts:38", "通知权限已授予");
          } else if (result.deniedAlways && result.deniedAlways.length > 0) {
            uni.showModal({
              title: "通知权限",
              content: "需要通知权限才能接收预警提醒，是否去设置中开启？",
              confirmText: "去设置",
              success: (res) => {
                if (res.confirm) {
                  const Intent = plus.android.importClass("android.content.Intent");
                  const Settings = plus.android.importClass("android.provider.Settings");
                  const Uri = plus.android.importClass("android.net.Uri");
                  const main = plus.android.runtimeMainActivity();
                  const intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                  const uri = Uri.fromParts("package", main.getPackageName(), null);
                  intent.setData(uri);
                  main.startActivity(intent);
                }
              }
            });
          }
        },
        (error) => {
          formatAppLog("error", "at src/utils/push.ts:63", "请求通知权限失败:", error);
        }
      );
    }
  }
  function initPush() {
    requestNotificationPermission();
    const clientInfo = plus.push.getClientInfo();
    formatAppLog("log", "at src/utils/push.ts:88", "推送客户端信息:", clientInfo);
    if (clientInfo.clientid) {
      formatAppLog("log", "at src/utils/push.ts:91", "推送 CID:", clientInfo.clientid);
      uni.setStorageSync("push_cid", clientInfo.clientid);
      reportPushCid(clientInfo.clientid);
    }
    plus.push.addEventListener("click", (msg) => {
      formatAppLog("log", "at src/utils/push.ts:100", "点击推送消息:", msg);
      handlePushClick(msg);
    }, false);
    plus.push.addEventListener("receive", (msg) => {
      formatAppLog("log", "at src/utils/push.ts:106", "收到推送消息:", msg);
      handlePushReceive();
    }, false);
    checkLaunchPush();
  }
  async function reportPushCid(cid) {
    try {
      const token = uni.getStorageSync("token");
      if (!token) {
        formatAppLog("log", "at src/utils/push.ts:122", "未登录，暂不上报推送 CID");
        return;
      }
      await http.post("/users/push-cid", { cid }, { showLoading: false, showError: false });
      formatAppLog("log", "at src/utils/push.ts:127", "推送 CID 上报成功");
    } catch (error) {
      formatAppLog("error", "at src/utils/push.ts:129", "推送 CID 上报失败:", error);
    }
  }
  function handlePushClick(msg) {
    const token = uni.getStorageSync("token");
    if (!token) {
      formatAppLog("log", "at src/utils/push.ts:140", "未登录，跳转到登录页");
      uni.reLaunch({ url: "/pages/login/index" });
      return;
    }
    let payload = msg.payload;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
      }
    }
    if (payload && typeof payload === "object") {
      const type = payload.type || msg.type;
      switch (type) {
        case "expired":
        case "expiry":
        case "low_stock":
          uni.switchTab({ url: "/pages/warning/index" });
          break;
        case "medicine":
          const medicineId = payload.medicine_id;
          if (medicineId) {
            uni.navigateTo({ url: `/pages/medicine/detail?id=${medicineId}` });
          } else {
            uni.switchTab({ url: "/pages/medicine/list" });
          }
          break;
        default:
          uni.switchTab({ url: "/pages/index/index" });
      }
    } else {
      uni.switchTab({ url: "/pages/warning/index" });
    }
  }
  function handlePushReceive(msg) {
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage.route === "pages/index/index") {
        uni.$emit("refreshHome");
      }
    }
  }
  function checkLaunchPush() {
    setTimeout(() => {
      const token = uni.getStorageSync("token");
      if (!token) {
        formatAppLog("log", "at src/utils/push.ts:226", "未登录，跳过启动推送处理");
        return;
      }
      const args = plus.runtime.arguments;
      if (args) {
        formatAppLog("log", "at src/utils/push.ts:232", "启动参数:", args);
        try {
          const payload = JSON.parse(args);
          if (payload && payload.type) {
            handlePushClick({ payload });
          }
        } catch (e) {
        }
      }
    }, 1e3);
  }
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      function updateTabBarText2() {
        const config = getCurrentModeConfig();
        const itemTerm = config.terminology.item;
        uni.setTabBarItem({
          index: 1,
          text: itemTerm
        });
      }
      onLaunch(() => {
        formatAppLog("log", "at App.vue:19", "App Launch");
        setTimeout(() => {
          updateTabBarText2();
        }, 100);
        initPush();
      });
      onShow(() => {
        formatAppLog("log", "at App.vue:34", "App Show");
        updateTabBarText2();
        plus.runtime.setBadgeNumber(0);
      });
      onHide(() => {
        formatAppLog("log", "at App.vue:46", "App Hide");
      });
      const __returned__ = { updateTabBarText: updateTabBarText2, get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get initPush() {
        return initPush;
      }, get getCurrentModeConfig() {
        return getCurrentModeConfig;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "G:/YIYAO/medicine-app/App.vue"]]);
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
