const SAMPLE_RECENTS = [
  {
    id: "sample-pier3",
    name: "Pier 3 generator set",
    type: "lift",
    typeLabel: "Lift study",
    openedAt: "2026-10-07T08:40:00+10:00"
  },
  {
    id: "sample-slings",
    name: "Tower crane dismantle slings",
    type: "rigging",
    typeLabel: "Rigging diagram",
    openedAt: "2026-10-06T16:15:00+10:00"
  },
  {
    id: "sample-mats",
    name: "130t AT outrigger mats",
    type: "drawing",
    typeLabel: "Equipment drawing",
    openedAt: "2026-10-04T11:05:00+10:00"
  },
  {
    id: "sample-girder",
    name: "Bridge girder tandem lift",
    type: "lift",
    typeLabel: "Lift study",
    openedAt: "2026-09-28T09:20:00+10:00"
  },
  {
    id: "sample-spreader",
    name: "Spreader bar SP-400",
    type: "drawing",
    typeLabel: "Equipment drawing",
    openedAt: "2026-09-21T14:45:00+10:00"
  }
];

const GLYPHS = {
  lift: '<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M14 3v4h4" stroke="currentColor" stroke-width="1.7"/></svg>',
  rigging: '<svg viewBox="0 0 24 24"><path d="M8 4h8v3H8zM12 7v4M6 20l6-9 6 9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  drawing: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 15l4-3 3 2 5-5 4 4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'
};

const list = document.getElementById("fileList");
const sidebar = document.getElementById("sidebar");
const scrim = document.getElementById("scrim");
const menuBtn = document.getElementById("menuBtn");

function formatOpened(iso) {
  const opened = new Date(iso);
  const now = new Date();
  const diff = now - opened;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day && opened.toDateString() === now.toDateString()) {
    return "Opened today, " + opened.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
  }
  if (diff < 2 * day) return "Opened yesterday";
  if (diff < 7 * day) return "Opened " + opened.toLocaleDateString("en-AU", { weekday: "long" });
  return "Opened " + opened.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function render(files) {
  list.replaceChildren();
  if (!files.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No files opened yet.";
    list.append(empty);
    return;
  }
  for (const file of files) {
    const item = document.createElement("li");
    const row = document.createElement("button");
    row.type = "button";
    row.className = "file-row";
    row.dataset.id = file.id;
    row.innerHTML =
      '<span class="file-glyph">' + (GLYPHS[file.type] || GLYPHS.lift) + "</span>" +
      '<span><span class="file-name"></span><span class="file-meta"></span></span>' +
      '<span class="type-pill ' + file.type + '"></span>';
    row.querySelector(".file-name").textContent = file.name;
    row.querySelector(".file-meta").textContent = formatOpened(file.openedAt) + " · sample";
    row.querySelector(".type-pill").textContent = file.typeLabel;
    row.addEventListener("click", function () {
      row.querySelector(".file-meta").textContent = "Opens in a later view · " + file.typeLabel;
    });
    item.append(row);
    list.append(item);
  }
}

function setMenu(open) {
  sidebar.classList.toggle("is-open", open);
  scrim.hidden = !open;
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

menuBtn.addEventListener("click", function () {
  setMenu(!sidebar.classList.contains("is-open"));
});
scrim.addEventListener("click", function () {
  setMenu(false);
});

render(SAMPLE_RECENTS);

const SETTINGS_KEY = "dlbc.settings";
const IMPERIAL_REGIONS = { US: true, LR: true, MM: true };
const homeView = document.getElementById("homeView");
const settingsView = document.getElementById("settingsView");
const pageTitle = document.getElementById("pageTitle");
const pageLede = document.getElementById("pageLede");
const unitsHelp = document.getElementById("unitsHelp");
const advancedSwitch = document.getElementById("advancedSwitch");

function regionCode() {
  const locale = navigator.language || "";
  try {
    const region = new Intl.Locale(locale).region;
    if (region) return region;
  } catch (err) {
    /* older browsers */
  }
  const parts = locale.split("-");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

function defaultUnits() {
  return IMPERIAL_REGIONS[regionCode()] ? "imperial" : "metric";
}

function loadSettings() {
  const defaults = { units: defaultUnits(), theme: "dark", advanced: false };
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      units: saved.units === "imperial" || saved.units === "metric" ? saved.units : defaults.units,
      theme: saved.theme === "light" || saved.theme === "dark" ? saved.theme : defaults.theme,
      advanced: saved.advanced === true
    };
  } catch (err) {
    return defaults;
  }
}

let settings = loadSettings();

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettings() {
  document.documentElement.dataset.theme = settings.theme;
  document.querySelectorAll("[data-setting='units']").forEach(function (btn) {
    btn.classList.toggle("is-selected", btn.dataset.value === settings.units);
  });
  document.querySelectorAll("[data-setting='theme']").forEach(function (btn) {
    btn.classList.toggle("is-selected", btn.dataset.value === settings.theme);
  });
  advancedSwitch.classList.toggle("is-on", settings.advanced);
  advancedSwitch.setAttribute("aria-checked", settings.advanced ? "true" : "false");
  const region = regionCode() || "unknown";
  const suggested = defaultUnits();
  unitsHelp.textContent = "Browser region " + region + " suggests " + suggested + ". Stored choice is " + settings.units + ".";
}

function showView(name) {
  const settingsOpen = name === "settings";
  settingsView.hidden = !settingsOpen;
  homeView.hidden = settingsOpen;
  pageTitle.textContent = settingsOpen ? "Settings" : "Home";
  pageLede.textContent = settingsOpen
    ? "Units, theme, and Advanced Mode for this browser."
    : "Recent studies on this device. Sample rows until local files exist.";
}

document.querySelectorAll(".nav-btn:not(.is-dummy)").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".nav-btn").forEach(function (other) {
      other.classList.remove("is-active");
    });
    btn.classList.add("is-active");
    showView(btn.dataset.view);
    setMenu(false);
  });
});

document.querySelectorAll(".segment-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    settings[btn.dataset.setting] = btn.dataset.value;
    saveSettings();
    applySettings();
  });
});

advancedSwitch.addEventListener("click", function () {
  settings.advanced = !settings.advanced;
  saveSettings();
  applySettings();
});

applySettings();
if (location.hash === "#settings") {
  const settingsBtn = document.querySelector("[data-view='settings']");
  if (settingsBtn) settingsBtn.click();
}
