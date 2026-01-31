# funds-master 项目架构分析文档

> 分析日期：2026年2月1日

## 一、项目概述

### 1.1 项目简介

**自选基金助手** 是一个浏览器扩展插件（Chrome/Edge/Firefox），用于实时查看基金涨跌幅、估值收益等信息，帮助用户方便地管理和追踪自己关注的基金。

### 1.2 是否有后端？

**没有后端服务器**。这是一个**纯前端项目**：
- 所有数据通过直接调用**东方财富公开 API** 获取
- 数据存储使用浏览器扩展的 `chrome.storage.sync` API（本地存储）
- 无需登录即可使用基本功能

---

## 二、技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue.js 2.x |
| 构建工具 | Webpack 4 |
| UI 组件库 | Element UI |
| 图表库 | ECharts 4 |
| HTTP 请求 | Axios |
| 导出功能 | xlsx、file-saver |
| 其他 | vue-clipboard2、qrcodejs2 |

---

## 三、项目目录结构

```
funds-master/
├── src/
│   ├── background.js          # 后台脚本（核心调度）
│   ├── manifest.json          # 扩展配置文件
│   ├── popup/                 # 弹窗页面（主界面）
│   │   ├── App.vue           # 主组件（1825行）
│   │   ├── popup.html
│   │   └── popup.js          # Vue 入口
│   ├── options/              # 设置页面
│   │   ├── App.vue           # 设置组件
│   │   ├── options.html
│   │   └── options.js
│   ├── common/               # 公共组件
│   │   ├── charts.vue        # 净值估算走势图
│   │   ├── charts2.vue       # 历史净值/累计收益图
│   │   ├── fundDetail.vue    # 基金详情弹窗
│   │   ├── fundInfo.vue      # 基金概况
│   │   ├── positionDetail.vue # 持仓明细
│   │   ├── indDetail.vue     # 指数/股票详情
│   │   ├── managerDetail.vue # 基金经理详情
│   │   ├── market.vue        # 行情中心
│   │   ├── marketLine.vue    # 大盘资金走势
│   │   ├── marketBar.vue     # 行业板块
│   │   ├── marketS2N.vue     # 北向资金
│   │   ├── marketN2S.vue     # 南向资金
│   │   ├── reward.vue        # 打赏页面
│   │   ├── changeLog.vue     # 更新日志
│   │   ├── configBox.vue     # 配置导入导出
│   │   └── js/
│   │       ├── customed.js   # ECharts 自定义主题（标准）
│   │       └── dark.js       # ECharts 暗色主题
│   └── icons/                # 扩展图标
├── holiday.json              # 节假日数据
├── webpack.config.js         # Webpack 配置
└── package.json
```

---

## 四、核心架构流程

```
┌────────────────────────────────────────────────────────────────┐
│                      Chrome Extension                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌─────────────┐    消息通信     ┌─────────────────────┐     │
│   │ background.js│◄──────────────►│   popup/App.vue     │     │
│   │  (后台脚本)   │                │    (弹窗主界面)      │     │
│   └──────┬──────┘                └─────────┬───────────┘     │
│          │                                   │                 │
│          │                                   │                 │
│   ┌──────▼──────┐                ┌─────────▼───────────┐     │
│   │ chrome.storage│              │   options/App.vue   │     │
│   │  (数据存储)    │              │     (设置页面)       │     │
│   └─────────────┘                └─────────────────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP 请求
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    东方财富 API 接口                            │
│  • fundmobapi.eastmoney.com - 基金数据                         │
│  • push2.eastmoney.com - 指数/股票实时数据                      │
│  • fundsuggest.eastmoney.com - 基金搜索                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 五、数据来源（API 接口详解）

所有数据均来自 **东方财富（eastmoney.com）** 的公开 API：

### 5.1 基金实时数据

**接口地址：**
```
https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo
```

**请求参数：**
| 参数 | 说明 |
|------|------|
| pageIndex | 页码，默认1 |
| pageSize | 每页数量，默认200 |
| plat | 平台，Android |
| appType | 应用类型，ttjj |
| product | 产品，EFund |
| Version | 版本，1 |
| deviceid | 设备ID（用户唯一标识） |
| Fcodes | 基金代码，多个用逗号分隔 |

**返回数据字段：**
```javascript
{
  FCODE: "001618",      // 基金代码
  SHORTNAME: "天弘中证...", // 基金名称
  PDATE: "2026-01-31",  // 净值日期
  NAV: "1.2345",        // 单位净值
  GSZ: "1.2400",        // 估算净值
  GSZZL: "0.45",        // 估算涨跌幅(%)
  GZTIME: "2026-02-01 15:00", // 估值时间
  NAVCHGRT: "0.42"      // 实际涨跌幅(%)
}
```

### 5.2 指数实时数据

**接口地址：**
```
https://push2.eastmoney.com/api/qt/ulist.np/get
```

**请求参数：**
| 参数 | 说明 |
|------|------|
| fltt | 格式，2 |
| fields | 返回字段，f2,f3,f4,f12,f13,f14 |
| secids | 证券ID，如 1.000001,0.399001 |

**返回数据字段：**
```javascript
{
  f2: 3250.12,    // 最新价
  f3: 0.85,       // 涨跌幅(%)
  f4: 27.56,      // 涨跌额
  f12: "000001",  // 代码
  f13: 1,         // 市场(1=沪,0=深)
  f14: "上证指数"  // 名称
}
```

### 5.3 基金搜索

**接口地址：**
```
https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx
```

**请求参数：**
| 参数 | 说明 |
|------|------|
| m | 类型，9 |
| key | 搜索关键词（支持拼音、汉字、代码） |

### 5.4 基金持仓明细

**接口地址：**
```
https://fundmobapi.eastmoney.com/FundMNewApi/FundMNInverstPosition
```

**请求参数：**
| 参数 | 说明 |
|------|------|
| FCODE | 基金代码 |
| deviceid | 设备ID |
| plat | 平台，Wap |

### 5.5 基金概况信息

**接口地址：**
```
https://fundmobapi.eastmoney.com/FundMApi/FundBaseTypeInformation.ashx
```

**返回数据字段：**
```javascript
{
  FCODE: "001618",
  SHORTNAME: "基金名称",
  FTYPE: "股票型",       // 基金类型
  JJGS: "天弘基金",      // 基金公司
  JJJL: "张三",          // 基金经理
  DWJZ: "1.2345",        // 单位净值
  LJJZ: "1.5678",        // 累计净值
  ENDNAV: "50000000",    // 基金规模
  SGZT: "开放申购",      // 申购状态
  SHZT: "开放赎回",      // 赎回状态
  SYL_Y: "5.23",         // 近1月收益率
  SYL_3Y: "12.56",       // 近3月收益率
  SYL_6Y: "18.90",       // 近6月收益率
  SYL_1N: "25.67"        // 近1年收益率
}
```

### 5.6 股票实时数据

**接口地址：**
```
https://push2.eastmoney.com/api/qt/ulist.np/get
```

与指数接口相同，用于获取持仓股票的实时价格和涨跌幅。

### 5.7 节假日数据

**接口地址：**
```
http://x2rr.github.io/funds/holiday.json
```

本地也有 `holiday.json` 文件备份。

---

## 六、主要功能模块详解

### 6.1 基金管理模块

| 功能 | 说明 |
|------|------|
| 添加基金 | 支持模糊搜索（拼音、汉字、编码） |
| 批量添加 | 一次添加多个基金 |
| 删除基金 | 从自选列表移除 |
| 拖拽排序 | 拖动调整基金顺序 |
| 按字段排序 | 按涨跌幅、收益等排序 |
| 锁定排序 | 保持当前排序方式 |

### 6.2 实时数据展示模块

| 功能 | 说明 |
|------|------|
| 角标提醒 | 在浏览器图标上显示涨跌幅/收益额 |
| 大盘指数 | 上证、深证、创业板、恒生、道琼斯等 |
| 基金估值 | 实时估算净值和涨跌幅 |
| 智能休市 | 节假日/周末自动切换休市状态 |
| 实时/暂停 | 可手动暂停实时更新 |
| 手动刷新 | 点击刷新按钮立即更新 |

**交易时间判断逻辑：**
```javascript
// 上午：9:30 - 11:35
// 下午：13:00 - 15:05
// 排除：周六日、节假日
```

### 6.3 收益计算模块

| 功能 | 说明 | 计算公式 |
|------|------|---------|
| 当日估值收益 | 输入份额计算 | `(估算净值 - 昨日净值) × 份额` |
| 持有收益 | 输入成本价计算 | `(当前净值 - 成本价) × 份额` |
| 持有收益率 | 百分比形式 | `(当前净值 - 成本价) / 成本价 × 100%` |
| 总收益 | 所有基金汇总 | 各基金收益之和 |
| 总收益率 | 加权平均 | `总收益 / 总持有金额 × 100%` |

### 6.4 图表展示模块（ECharts）

| 图表类型 | 组件 | 说明 |
|---------|------|------|
| 净值估算走势 | charts.vue | 当日分时图（9:30-15:00） |
| 历史净值走势 | charts2.vue | 可选时间范围 |
| 累计收益走势 | charts2.vue | 历史收益曲线 |
| 大盘资金流向 | marketLine.vue | 两市资金走势 |
| 行业板块 | marketBar.vue | 行业涨跌排行 |

### 6.5 详情查看模块

| 功能 | 组件 | 说明 |
|------|------|------|
| 基金详情 | fundDetail.vue | 净值、持仓、历史等Tab |
| 持仓明细 | positionDetail.vue | 股票列表、持仓占比 |
| 基金概况 | fundInfo.vue | 类型、规模、经理等 |
| 基金经理 | managerDetail.vue | 经理信息和业绩 |
| 指数/股票详情 | indDetail.vue | 走势图 |

### 6.6 行情中心模块

| Tab | 组件 | 说明 |
|-----|------|------|
| 大盘资金 | marketLine.vue | 两市成交额、涨跌数量 |
| 行业板块 | marketBar.vue | 行业资金流向 |
| 北向资金 | marketS2N.vue | 沪股通+深股通 |
| 南向资金 | marketN2S.vue | 港股通 |

### 6.7 个性化设置模块

| 设置项 | 选项 |
|--------|------|
| 主题模式 | 标准/暗色 |
| 字号大小 | 迷你/标准 |
| 界面灰度 | 0-100% |
| 透明度 | 0-90% |
| 角标开关 | 开/关 |
| 角标内容 | 单个基金/所有基金/单个指数 |
| 角标类型 | 收益率/收益额 |
| 显示设置 | 估算净值/持有金额/估值收益/持有收益/持有收益率 |

### 6.8 数据导入导出模块

| 功能 | 格式 | 说明 |
|------|------|------|
| 导出配置 | JSON | 完整配置信息 |
| 导入配置 | JSON | 恢复配置 |
| 导出基金列表 | Excel | 代码、名称、份额、成本 |
| 导入基金列表 | Excel | 批量导入基金 |
| 文本导入导出 | 文本 | 简单格式，便于小程序同步 |

---

## 七、数据存储结构

使用 `chrome.storage.sync` 存储，数据会跟随浏览器账号同步。

| Key | 类型 | 说明 |
|-----|------|------|
| `fundListM` | Array | 基金列表 |
| `seciList` | Array | 指数列表 |
| `RealtimeFundcode` | String | 特别关注的基金代码 |
| `RealtimeIndcode` | String | 特别关注的指数代码 |
| `darkMode` | Boolean | 暗色模式 |
| `normalFontSize` | Boolean | 标准字号 |
| `showGains` | Boolean | 显示收益 |
| `showAmount` | Boolean | 显示持有金额 |
| `showCost` | Boolean | 显示持有收益 |
| `showCostRate` | Boolean | 显示持有收益率 |
| `showGSZ` | Boolean | 显示估算净值 |
| `showBadge` | Number | 角标开关(1开/2关) |
| `BadgeContent` | Number | 角标内容(1单个基金/2所有/3指数) |
| `BadgeType` | Number | 角标类型(1收益率/2收益额) |
| `holiday` | Object | 节假日数据 |
| `userId` | String | 用户唯一标识(GUID) |
| `grayscaleValue` | Number | 灰度值 |
| `opacityValue` | Number | 透明度值 |
| `sortTypeObj` | Object | 排序设置 |
| `isLiveUpdate` | Boolean | 是否实时更新 |
| `version` | String | 版本号 |

**fundListM 数据结构：**
```javascript
[
  {
    code: "001618",  // 基金代码
    num: 1000,       // 持有份额
    cost: 1.2        // 成本价
  },
  // ...
]
```

---

## 八、关键业务逻辑

### 8.1 交易时间判断

```javascript
var isDuringDate = () => {
  // 转换为东8区时间
  var zoneOffset = 8;
  var offset8 = new Date().getTimezoneOffset() * 60 * 1000;
  var nowDate8 = new Date().getTime();
  var curDate = new Date(nowDate8 + offset8 + zoneOffset * 60 * 60 * 1000);

  // 检查节假日
  if (checkHoliday(curDate)) return false;
  
  // 检查周末
  if (curDate.getDay() == "6" || curDate.getDay() == "0") return false;
  
  // 检查交易时间
  // 上午：9:30 - 11:35
  // 下午：13:00 - 15:05
  // ...
};
```

### 8.2 收益计算

```javascript
// 当日收益
calculate(val, hasReplace) {
  let num = val.num ? val.num : 0;
  if (hasReplace) {
    // 已更新实际净值
    return ((val.dwjz - val.dwjz / (1 + val.gszzl * 0.01)) * num).toFixed(2);
  } else {
    // 使用估算净值
    return ((val.gsz - val.dwjz) * num).toFixed(2);
  }
}

// 持有收益
calculateCost(val) {
  if (val.cost) {
    return ((val.dwjz - val.cost) * val.num).toFixed(2);
  }
  return 0;
}

// 持有收益率
calculateCostRate(val) {
  if (val.cost && val.cost != 0) {
    return (((val.dwjz - val.cost) / val.cost) * 100).toFixed(2);
  }
  return 0;
}
```

### 8.3 角标更新逻辑

```javascript
// 定时更新（交易时间）
// 基金：每2分钟
// 指数：每10秒
var startInterval = (code, type = 1) => {
  let time = type == 3 ? 10 * 1000 : 2 * 60 * 1000;
  Interval = setInterval(() => {
    if (isDuringDate()) {
      setBadge(code, true, type);
    }
  }, time);
};
```

---

## 九、总结

### 9.1 技术特点

1. **纯前端架构**：无后端服务器，直接调用第三方 API
2. **浏览器扩展**：利用 Chrome Extension API
3. **本地存储**：使用 chrome.storage.sync 实现数据同步
4. **Vue 2 组件化**：功能模块化，易于维护

### 9.2 核心依赖

- 数据来源：东方财富 API（免费、公开）
- 数据存储：浏览器本地存储
- 图表渲染：ECharts
- UI 组件：Element UI

### 9.3 可迁移性

该项目的核心功能完全可以迁移到 Web 应用：
- API 调用逻辑可直接复用
- 数据结构可直接复用
- 业务逻辑可直接复用
- 仅需将 chrome.storage 替换为 localStorage 或状态管理库
