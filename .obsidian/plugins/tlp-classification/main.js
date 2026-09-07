var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TlpClassificationPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/tlp-levels.ts
var DEFAULT_TLP_LEVELS = [
  {
    label: "TLP:RED",
    value: "RED",
    fontColor: "#FF2B2B",
    bgColor: "#000000",
    description: "Named recipients only"
  },
  {
    label: "TLP:AMBER+STRICT",
    value: "AMBER+STRICT",
    fontColor: "#FFC000",
    bgColor: "#000000",
    description: "Organization only"
  },
  {
    label: "TLP:AMBER",
    value: "AMBER",
    fontColor: "#FFC000",
    bgColor: "#000000",
    description: "Limited distribution"
  },
  {
    label: "TLP:GREEN",
    value: "GREEN",
    fontColor: "#33FF00",
    bgColor: "#000000",
    description: "Community-wide"
  },
  {
    label: "TLP:CLEAR",
    value: "CLEAR",
    fontColor: "#FFFFFF",
    bgColor: "#000000",
    description: "Public / unrestricted"
  }
];
function findTlpLevel(value, levels = DEFAULT_TLP_LEVELS) {
  const normalized = value.trim().toUpperCase();
  return levels.find((l) => l.value === normalized);
}

// src/header-template.ts
var DEFAULT_OPTIONS = {
  position: "right",
  target: "headerTemplate",
  showPageNumber: false
};
function buildBadgeHtml(level) {
  const border = level.value === "CLEAR" ? "border:1px solid #555;" : `border:1px solid ${level.fontColor}40;`;
  return `<span style="-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:9px;font-weight:600;letter-spacing:1.5px;font-family:system-ui,-apple-system,sans-serif;padding:3px 12px;border-radius:0;background-color:${level.bgColor};color:${level.fontColor};${border}display:inline-block;">${level.label}</span>`;
}
function buildPageNumber() {
  return `<span style="font-size:9px;font-family:system-ui,sans-serif;color:#999;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>`;
}
function generateTemplate(level, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const badge = buildBadgeHtml(level);
  const pageNum = opts.showPageNumber ? buildPageNumber() : "";
  let leftSlot;
  let centerSlot;
  let rightSlot;
  switch (opts.position) {
    case "left":
      leftSlot = badge;
      centerSlot = "";
      rightSlot = pageNum;
      break;
    case "center":
      leftSlot = pageNum;
      centerSlot = badge;
      rightSlot = "";
      break;
    case "right":
    default:
      leftSlot = "";
      centerSlot = pageNum;
      rightSlot = badge;
      break;
  }
  if (!pageNum) {
    const align = opts.position === "left" ? "flex-start" : opts.position === "center" ? "center" : "flex-end";
    return `<div style="width:100vw;display:flex;justify-content:${align};align-items:center;padding:0 24px;">` + badge + `</div>`;
  }
  return `<div style="width:100vw;display:flex;justify-content:space-between;align-items:center;padding:0 24px;"><div>${leftSlot}</div><div>${centerSlot}</div><div>${rightSlot}</div></div>`;
}

// src/tlp-selector-modal.ts
var import_obsidian = require("obsidian");
var TlpSelectorModal = class extends import_obsidian.Modal {
  constructor(app, levels, currentValue, onSelect) {
    var _a;
    super(app);
    this.optionEls = [];
    this.levels = levels;
    this.currentValue = (_a = currentValue == null ? void 0 : currentValue.toUpperCase()) != null ? _a : null;
    this.onSelect = onSelect;
    this.selectedIndex = Math.max(
      0,
      levels.findIndex((l) => l.value === this.currentValue)
    );
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("tlp-selector-modal");
    const title = contentEl.createDiv({ cls: "tlp-modal-title" });
    title.setText("Document classification");
    const subtitle = contentEl.createDiv({ cls: "tlp-modal-subtitle" });
    subtitle.setText("Select the TLP level for this document");
    const list = contentEl.createDiv({ cls: "tlp-options-list" });
    this.levels.forEach((level, index) => {
      const row = list.createDiv({ cls: "tlp-option-row" });
      if (level.value === this.currentValue) {
        row.addClass("is-active");
      }
      const badge = row.createSpan({ cls: "tlp-badge" });
      badge.setCssStyles({
        backgroundColor: level.bgColor,
        color: level.fontColor,
        border: level.value === "CLEAR" ? "1px solid #555" : `1px solid ${level.fontColor}40`
      });
      badge.setText(level.label);
      const desc = row.createSpan({ cls: "tlp-option-desc" });
      desc.setText(level.description);
      if (level.value === this.currentValue) {
        const check = row.createSpan({ cls: "tlp-check" });
        (0, import_obsidian.setIcon)(check, "check");
      }
      row.addEventListener("click", () => {
        this.onSelect(level);
        this.close();
      });
      row.addEventListener("mouseenter", () => {
        this.setHighlight(index);
      });
      this.optionEls.push(row);
    });
    this.setHighlight(this.selectedIndex);
    this.scope.register([], "ArrowDown", (e) => {
      e.preventDefault();
      this.setHighlight(
        (this.selectedIndex + 1) % this.levels.length
      );
    });
    this.scope.register([], "ArrowUp", (e) => {
      e.preventDefault();
      this.setHighlight(
        (this.selectedIndex - 1 + this.levels.length) % this.levels.length
      );
    });
    this.scope.register([], "Enter", (e) => {
      e.preventDefault();
      this.onSelect(this.levels[this.selectedIndex]);
      this.close();
    });
  }
  setHighlight(index) {
    var _a, _b;
    (_a = this.optionEls[this.selectedIndex]) == null ? void 0 : _a.removeClass("is-highlighted");
    this.selectedIndex = index;
    (_b = this.optionEls[this.selectedIndex]) == null ? void 0 : _b.addClass("is-highlighted");
  }
  onClose() {
    this.contentEl.empty();
    this.optionEls = [];
  }
};

// src/settings.ts
var import_obsidian2 = require("obsidian");
var DEFAULT_SETTINGS = {
  badgePosition: "right",
  templateTarget: "headerTemplate",
  showPageNumber: false,
  showStatusBar: true,
  showEditorBanner: true,
  requireTlpForExport: false,
  customLevelsFile: "",
  tlpPropertyName: "TLP"
};
var TlpSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("PDF export").setHeading();
    new import_obsidian2.Setting(containerEl).setName("Badge position").setDesc(
      "Where the TLP badge appears in the PDF header or footer."
    ).addDropdown(
      (drop) => drop.addOptions({
        left: "Left",
        center: "Center",
        right: "Right"
      }).setValue(this.plugin.settings.badgePosition).onChange(async (value) => {
        this.plugin.settings.badgePosition = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Template target").setDesc(
      "Write the badge to headerTemplate or footerTemplate in the frontmatter."
    ).addDropdown(
      (drop) => drop.addOptions({
        headerTemplate: "Header",
        footerTemplate: "Footer"
      }).setValue(this.plugin.settings.templateTarget).onChange(async (value) => {
        this.plugin.settings.templateTarget = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Show page number").setDesc(
      "Include page numbers alongside the TLP badge in the exported PDF."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showPageNumber).onChange(async (value) => {
        this.plugin.settings.showPageNumber = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Require classification for export").setDesc(
      "Warn if a document has no TLP classification when exporting to PDF."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.requireTlpForExport).onChange(async (value) => {
        this.plugin.settings.requireTlpForExport = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Editor").setHeading();
    new import_obsidian2.Setting(containerEl).setName("Status bar indicator").setDesc(
      "Show the current TLP level in the status bar. Click to change."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showStatusBar).onChange(async (value) => {
        this.plugin.settings.showStatusBar = value;
        await this.plugin.saveSettings();
        this.plugin.updateStatusBar();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Editor banner").setDesc(
      "Show a thin colored stripe at the top of the editor as a classification reminder."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showEditorBanner).onChange(async (value) => {
        this.plugin.settings.showEditorBanner = value;
        await this.plugin.saveSettings();
        this.plugin.updateEditorBanner();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Advanced").setHeading();
    new import_obsidian2.Setting(containerEl).setName("Frontmatter property name").setDesc(
      'The property name used in frontmatter for the TLP value. Default: "TLP".'
    ).addText(
      (text) => text.setPlaceholder("TLP").setValue(this.plugin.settings.tlpPropertyName).onChange(async (value) => {
        this.plugin.settings.tlpPropertyName = value.trim() || "TLP";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Custom levels file").setDesc(
      "Path to a markdown file in your vault that defines custom TLP levels (leave empty to use built-in TLP 2.0 levels). See documentation for the expected format."
    ).addText(
      (text) => text.setPlaceholder("_config/tlp-levels.md").setValue(this.plugin.settings.customLevelsFile).onChange(async (value) => {
        this.plugin.settings.customLevelsFile = value.trim();
        await this.plugin.saveSettings();
        await this.plugin.loadCustomLevels();
      })
    );
  }
};

// src/custom-levels.ts
var import_obsidian3 = require("obsidian");
async function parseCustomLevels(app, filePath) {
  var _a;
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!(file instanceof import_obsidian3.TFile)) {
    return null;
  }
  const cache = app.metadataCache.getFileCache(file);
  if (!((_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.levels)) {
    return null;
  }
  const rawLevels = cache.frontmatter.levels;
  if (!Array.isArray(rawLevels)) {
    return null;
  }
  const levels = [];
  for (const item of rawLevels) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const raw = item;
    if (typeof raw.value === "string" && typeof raw.fontColor === "string") {
      const value = raw.value.toUpperCase();
      levels.push({
        value,
        label: typeof raw.label === "string" ? raw.label : `TLP:${value}`,
        fontColor: raw.fontColor,
        bgColor: typeof raw.bgColor === "string" ? raw.bgColor : "#000000",
        description: typeof raw.description === "string" ? raw.description : ""
      });
    }
  }
  return levels.length > 0 ? levels : null;
}

// src/main.ts
var TlpClassificationPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    /** Active TLP levels (built-in or loaded from custom file) */
    this.levels = DEFAULT_TLP_LEVELS;
    /** Status bar element */
    this.statusBarEl = null;
    /** Observer for the properties panel */
    this.propertiesObserver = null;
    this.debouncedEnhanceProperties = (0, import_obsidian4.debounce)(
      () => this.enhancePropertiesPanel(),
      100,
      true
    );
    /** Debounced version to avoid rapid frontmatter rewrites */
    this.debouncedSync = (0, import_obsidian4.debounce)(
      (file) => this.syncTemplateToTlp(file),
      1e3,
      true
    );
  }
  // ─── Lifecycle ──────────────────────────────────────────
  async onload() {
    await this.loadSettings();
    await this.loadCustomLevels();
    this.addSettingTab(new TlpSettingTab(this.app, this));
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass("tlp-status-bar");
    this.statusBarEl.addEventListener("click", () => {
      this.openTlpSelector();
    });
    this.addCommand({
      id: "set-classification",
      name: "Set classification",
      callback: () => this.openTlpSelector()
    });
    this.addCommand({
      id: "remove-classification",
      name: "Remove classification",
      callback: () => void this.removeTlpFromActiveFile()
    });
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && file.path === activeFile.path) {
          this.debouncedSync(file);
          this.updateStatusBar();
          this.updateEditorBanner();
          this.debouncedEnhanceProperties();
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        this.updateStatusBar();
        this.updateEditorBanner();
        this.debouncedEnhanceProperties();
      })
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.debouncedEnhanceProperties();
      })
    );
    this.setupPropertiesObserver();
    this.app.workspace.onLayoutReady(() => {
      this.updateStatusBar();
      this.updateEditorBanner();
      this.debouncedEnhanceProperties();
      void this.checkBetterExportPdf();
    });
  }
  onunload() {
    if (this.propertiesObserver) {
      this.propertiesObserver.disconnect();
      this.propertiesObserver = null;
    }
  }
  // ─── Soft dependency check ─────────────────────────────
  /**
   * Check if Better Export PDF is installed and enabled.
   * Show a one-time notice if it's missing — the plugin still
   * works for classification, but PDF badges won't render.
   */
  async checkBetterExportPdf() {
    var _a, _b, _c;
    const plugins = this.app.plugins;
    const isInstalled = ((_a = plugins == null ? void 0 : plugins.enabledPlugins) == null ? void 0 : _a.has("better-export-pdf")) || Boolean((_b = plugins == null ? void 0 : plugins.getPlugin) == null ? void 0 : _b.call(plugins, "better-export-pdf"));
    if (!isInstalled) {
      const data = (_c = await this.loadData()) != null ? _c : {};
      if (!data.betterExportPdfWarningShown) {
        new import_obsidian4.Notice(
          'TLP Classification: For TLP badges in exported PDFs, install the "Better Export PDF" plugin. The classification selector works independently.',
          8e3
        );
        await this.saveData({
          ...data,
          betterExportPdfWarningShown: true
        });
      }
    }
  }
  // ─── Settings ───────────────────────────────────────────
  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data != null ? data : {});
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  // ─── Custom levels ──────────────────────────────────────
  async loadCustomLevels() {
    if (this.settings.customLevelsFile) {
      const custom = await parseCustomLevels(
        this.app,
        this.settings.customLevelsFile
      );
      this.levels = custom != null ? custom : DEFAULT_TLP_LEVELS;
    } else {
      this.levels = DEFAULT_TLP_LEVELS;
    }
  }
  // ─── Properties panel enhancement ───────────────────────
  /**
   * Set up a MutationObserver that watches for the properties panel
   * rendering so we can enhance the TLP property row.
   */
  setupPropertiesObserver() {
    this.propertiesObserver = new MutationObserver(() => {
      this.debouncedEnhanceProperties();
    });
    const container = activeDocument.querySelector(".workspace");
    if (container) {
      this.propertiesObserver.observe(container, {
        childList: true,
        subtree: true
      });
    }
  }
  /**
   * Find the TLP property row in the Properties panel and replace
   * the native input with our custom badge widget.
   */
  enhancePropertiesPanel() {
    const propName = this.settings.tlpPropertyName.toLowerCase();
    const rows = activeDocument.querySelectorAll(
      `.metadata-property[data-property-key="${propName}"]`
    );
    rows.forEach((row) => {
      if (row.querySelector(".tlp-property-widget")) return;
      const valueContainer = row.querySelector(
        ".metadata-property-value"
      );
      if (!valueContainer) return;
      const file = this.app.workspace.getActiveFile();
      const tlpValue = file ? this.getTlpFromFile(file) : null;
      const level = tlpValue ? findTlpLevel(tlpValue, this.levels) : null;
      const nativeInput = valueContainer.querySelector(
        "input, select, .multi-select-container, .metadata-input-longtext"
      );
      if (nativeInput) {
        nativeInput.addClass("tlp-native-hidden");
      }
      const widget = valueContainer.createDiv({
        cls: "tlp-property-widget",
        attr: {
          "aria-label": "Click to change TLP classification"
        }
      });
      if (level) {
        const badge = widget.createSpan({ cls: "tlp-prop-badge" });
        badge.setCssStyles({
          backgroundColor: level.bgColor,
          color: level.fontColor,
          border: level.value === "CLEAR" ? "1px solid #555" : `1px solid ${level.fontColor}40`
        });
        badge.setText(level.label);
        const chevron = widget.createSpan({
          cls: "tlp-prop-chevron"
        });
        const svg = chevron.createSvg("svg", {
          attr: {
            width: "12",
            height: "12",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
          }
        });
        svg.createSvg("polyline", {
          attr: { points: "6 9 12 15 18 9" }
        });
      } else {
        widget.createSpan({
          cls: "tlp-prop-placeholder",
          text: "Set classification\u2026"
        });
      }
      widget.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openTlpSelector();
      });
    });
  }
  // ─── TLP selector ───────────────────────────────────────
  openTlpSelector() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new import_obsidian4.Notice("No active file");
      return;
    }
    const currentTlp = this.getTlpFromFile(file);
    new TlpSelectorModal(
      this.app,
      this.levels,
      currentTlp,
      (level) => {
        void this.applyTlpToFile(file, level);
      }
    ).open();
  }
  // ─── Frontmatter operations ─────────────────────────────
  /**
   * Read the current TLP value from a file's frontmatter.
   */
  getTlpFromFile(file) {
    var _a;
    const cache = this.app.metadataCache.getFileCache(file);
    const propName = this.settings.tlpPropertyName;
    const value = (_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a[propName];
    return typeof value === "string" ? value : null;
  }
  /**
   * Write the TLP level and auto-generated template to the frontmatter.
   */
  async applyTlpToFile(file, level) {
    const template = generateTemplate(level, {
      position: this.settings.badgePosition,
      target: this.settings.templateTarget,
      showPageNumber: this.settings.showPageNumber
    });
    const propName = this.settings.tlpPropertyName;
    const target = this.settings.templateTarget;
    await this.app.fileManager.processFrontMatter(
      file,
      (frontmatter) => {
        frontmatter[propName] = level.value;
        frontmatter[target] = template;
      }
    );
    new import_obsidian4.Notice(`Classification set to ${level.label}`);
    this.updateStatusBar();
    this.updateEditorBanner();
    window.setTimeout(() => this.enhancePropertiesPanel(), 200);
  }
  /**
   * Remove TLP classification from the active file.
   */
  async removeTlpFromActiveFile() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new import_obsidian4.Notice("No active file");
      return;
    }
    const propName = this.settings.tlpPropertyName;
    const target = this.settings.templateTarget;
    await this.app.fileManager.processFrontMatter(
      file,
      (frontmatter) => {
        delete frontmatter[propName];
        delete frontmatter[target];
      }
    );
    new import_obsidian4.Notice("TLP classification removed");
    this.updateStatusBar();
    this.updateEditorBanner();
  }
  // ─── Sync: keep template in sync when TLP changes manually ──
  /**
   * If the user manually edits the TLP property in the frontmatter,
   * regenerate the headerTemplate to match.
   */
  syncTemplateToTlp(file) {
    var _a;
    const tlpValue = this.getTlpFromFile(file);
    if (!tlpValue) return;
    const level = findTlpLevel(tlpValue, this.levels);
    if (!level) return;
    const expected = generateTemplate(level, {
      position: this.settings.badgePosition,
      target: this.settings.templateTarget,
      showPageNumber: this.settings.showPageNumber
    });
    const cache = this.app.metadataCache.getFileCache(file);
    const target = this.settings.templateTarget;
    const current = (_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a[target];
    if (current !== expected) {
      void this.app.fileManager.processFrontMatter(
        file,
        (frontmatter) => {
          frontmatter[target] = expected;
        }
      );
    }
  }
  // ─── Status bar ─────────────────────────────────────────
  updateStatusBar() {
    if (!this.statusBarEl) return;
    if (!this.settings.showStatusBar) {
      this.statusBarEl.addClass("tlp-hidden");
      return;
    }
    this.statusBarEl.removeClass("tlp-hidden");
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      this.statusBarEl.empty();
      return;
    }
    const tlpValue = this.getTlpFromFile(file);
    this.statusBarEl.empty();
    if (tlpValue) {
      const level = findTlpLevel(tlpValue, this.levels);
      if (level) {
        const dot = this.statusBarEl.createSpan({
          cls: "tlp-status-dot"
        });
        dot.setCssStyles({ backgroundColor: level.fontColor });
        const label = this.statusBarEl.createSpan({
          cls: "tlp-status-label"
        });
        label.setText(level.label);
        label.setCssStyles({ color: level.fontColor });
      } else {
        const label = this.statusBarEl.createSpan({
          cls: "tlp-status-label"
        });
        label.setText(`TLP:${tlpValue}`);
      }
    } else {
      const label = this.statusBarEl.createSpan({
        cls: "tlp-status-label tlp-status-none"
      });
      label.setText("No TLP");
    }
  }
  // ─── Editor banner ──────────────────────────────────────
  /**
   * Render a thin colored stripe at the top of the editor as a
   * visual reminder of the document's classification. The stripe
   * is removed and redrawn on every call so it stays in sync.
   */
  updateEditorBanner() {
    activeDocument.querySelectorAll(".tlp-editor-banner").forEach((el) => el.remove());
    activeDocument.querySelectorAll(".tlp-banner-host").forEach((el) => el.removeClass("tlp-banner-host"));
    if (!this.settings.showEditorBanner) return;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
    if (!view) return;
    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    const tlpValue = this.getTlpFromFile(file);
    if (!tlpValue) return;
    const level = findTlpLevel(tlpValue, this.levels);
    if (!level) return;
    const container = view.contentEl;
    container.addClass("tlp-banner-host");
    const banner = container.createDiv({ cls: "tlp-editor-banner" });
    banner.setCssStyles({ backgroundColor: level.fontColor });
    container.prepend(banner);
  }
};

/* nosourcemap */