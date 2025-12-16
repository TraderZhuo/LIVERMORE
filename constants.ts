import { Settings } from './types';

export const DEFAULT_SYSTEM_PROMPT = `你现在是传奇交易员杰西·利弗莫尔（Jesse Livermore）。你穿越到了现代，但依然坚守你的交易哲学。
**核心原则**：
1. 顺势而为：不要试图抓住最高点或最低点，那是愚蠢的。重要的是抓住中间的大趋势。
2. 关键点（Pivotal Points）：根据价格在关键位置的表现来决定买卖。
3. 人性不变：华尔街没有新鲜事，因为投机像山岳一样古老，人性中的贪婪和恐惧永远不会改变。
4. 资金管理：如果你损失了本金的50%，你必须获利100%才能回本。保护本金是第一位的。
**回复风格**：
- 使用第一人称“我”。
- 语气冷静、自信，甚至带有一点对由于人性弱点而失败的散户的冷眼旁观。
- 在分析用户提供的现代标的（如股票、加密货币）时，尝试套用你的经典理论。
- 多引用你的名言，但要切合语境。`;

export const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: 'https://ark.cn-beijing.volces.com/api/v3',
  apiKey: '',
  modelId: '',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  language: 'zh',
  theme: 'dark',
};

export const LOCAL_STORAGE_KEY = 'livermore_terminal_settings';
export const LOCAL_STORAGE_HISTORY_KEY = 'livermore_terminal_history';

export const UI_TEXT = {
  zh: {
    title: "利弗莫尔说",
    subtitle: "百年美股第一人",
    askPlaceholder: "询问利弗莫尔...",
    execute: "执行",
    footer: "知识来自利弗莫尔",
    emptyStateQuote: "“华尔街没有新鲜事。”",
    settingsTitle: "系统配置",
    endpointLabel: "API 接入点 (Base URL)",
    apiKeyLabel: "API 密钥",
    modelIdLabel: "模型 ID",
    promptLabel: "系统人格设定 (System Prompt)",
    languageLabel: "界面语言 (Language)",
    themeLabel: "外观风格 (Theme)",
    themeDark: "暗夜终端",
    themeLight: "复古账本",
    reset: "恢复默认",
    cancel: "取消",
    confirm: "确认",
    clearHistory: "彻底清空历史",
    copySuccess: "已复制",
    copyFail: "复制失败",
    trader: "交易员",
    assistant: "杰西·利弗莫尔",
    corsWarning: "⚠️ 浏览器跨域警告: 大多数 API 禁止浏览器直接访问。本地测试请使用 'Allow CORS' 插件。",
    pathNote: "* 系统将自动追加 /chat/completions",
    historyCleared: "历史记录已销毁",
    edit: "编辑",
    regenerate: "保存并重新生成",
    cancelEdit: "取消编辑"
  },
  en: {
    title: "LIVERMORE SAYS",
    subtitle: "The Greatest Stock Operator of the Century",
    askPlaceholder: "Ask Livermore...",
    execute: "EXECUTE",
    footer: "Knowledge comes from Livermore",
    emptyStateQuote: "\"There is nothing new in Wall Street.\"",
    settingsTitle: "CONFIGURATION",
    endpointLabel: "API ENDPOINT (BASE URL)",
    apiKeyLabel: "API KEY",
    modelIdLabel: "MODEL ID",
    promptLabel: "SYSTEM PROMPT (PERSONA)",
    languageLabel: "INTERFACE LANGUAGE",
    themeLabel: "APPEARANCE",
    themeDark: "DARK TERMINAL",
    themeLight: "VINTAGE LEDGER",
    reset: "RESET DEFAULT",
    cancel: "CANCEL",
    confirm: "CONFIRM",
    clearHistory: "NUKE HISTORY",
    copySuccess: "COPIED",
    copyFail: "FAILED",
    trader: "TRADER",
    assistant: "JESSE LIVERMORE",
    corsWarning: "⚠️ Browser CORS Warning: Most APIs block direct browser access. Use 'Allow CORS' extension for testing.",
    pathNote: "* System will append /chat/completions automatically",
    historyCleared: "HISTORY DESTROYED",
    edit: "EDIT",
    regenerate: "SAVE & REGENERATE",
    cancelEdit: "CANCEL"
  }
};