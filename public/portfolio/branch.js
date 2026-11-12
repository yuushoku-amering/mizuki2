const chapterNames = ["overview", "spring", "autumn", "winter"];
const chapters = [
  { title: "用户研究作品集", kicker: "吕家欣", summary: "社会调查、数据分析与产品交互设计", season: "spring", start: 0, jump: 0 },
  { title: "社会调查能力", kicker: "春 · 樱花", summary: "从问卷、访谈与现场观察中理解人的行为。", season: "spring", start: .66, jump: 1.47, ids: ["game", "snack", "mangrove"] },
  { title: "数据分析能力", kicker: "秋 · 银杏", summary: "整理数据，解释消费者、商品与渠道之间的关系。", season: "autumn", start: 1.66, jump: 2.47, ids: ["retail", "model", "game"] },
  { title: "产品交互设计能力", kicker: "冬 · 雪梅", summary: "把需求和流程做成可操作的原型。", season: "winter", start: 2.66, jump: 3.47, ids: ["vesper", "melody", "office", "mio"] },
];
projects.mio = {
  title: "澪 · 多端语音助手",
  summary: "在手机上唤醒澪，接入电脑端 Codex 继续轻量对话，也可以确认并发出预设的电脑指令。",
  path: "projects/mio.html",
};
const markerPositions = [
  { x: 27, y: 35, tilt: -10 },
  { x: 51, y: 25, tilt: 7 },
  { x: 74, y: 43, tilt: -8 },
  { x: 44, y: 54, tilt: 5 },
];
const seasonSymbols = { spring: "cherry", autumn: "ginkgo", winter: "plum" };
const shortProjectNames = {
  game: "游戏付费调查", snack: "好想来消费研究", mangrove: "红树林共治",
  retail: "服饰零售分析", model: "风险预警建模",
  vesper: "岚苔工作台", melody: "Melody Aiming", office: "AI 协作办公室", mio: "澪语音助手",
};
const cameraPositions = [
  { scale: .97, x: 0, y: 0 },
  { scale: 1.24, x: .075, y: .075 },
  { scale: 1.29, x: -.018, y: .064 },
  { scale: 1.24, x: -.068, y: .068 },
];
const totalJourney = 3.5;
const journey = document.querySelector("#journey");
const stage = document.querySelector("#stage");
const canopy = document.querySelector(".canopy-view");
const camera = document.querySelector(".tree-camera");
const treeLayer = document.querySelector(".tree-layer");
const markerGroup = document.querySelector("#branch-projects");
const note = document.querySelector("#selected-project");
const scrollCue = document.querySelector("#scroll-cue");
const ring = document.querySelector(".pointer-ring");
const finePointer = matchMedia("(pointer: fine)");
const compact = matchMedia("(max-width: 760px), (max-height: 600px)");
const jumpLinks = [...document.querySelectorAll("[data-jump]")];
const revealOffsets = [.12, .32, .53, .72];
const inlineTree = document.body.classList.contains("portfolio-page");
const seasonHeading = document.querySelector("#season-heading");
const returnKey = inlineTree ? "branch-return-inline" : "branch-return";
let inlinePosition = 0;
let activeChapter = -1;
let currentPosition = 0;
let frame = 0;
let markers = [];
let activeMarker = null;
let magneticFlower = null;
let pointerVisible = false;
let pointerX = 0;
let pointerY = 0;
let ringX = 0;
let ringY = 0;
let parallaxX = 0;
let parallaxY = 0;

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const journeyDistance = () => Math.max(1, journey.offsetHeight - stage.offsetHeight);
const journeyProgress = () => inlineTree ? inlinePosition : clamp(-journey.getBoundingClientRect().top / journeyDistance(), 0, 1) * totalJourney;

function requestFrame() {
  if (!frame) frame = requestAnimationFrame(renderFrame);
}

function closeNote(restoreFocus = false) {
  note.hidden = true;
  if (activeMarker) {
    activeMarker.setAttribute("aria-pressed", "false");
    if (restoreFocus && !activeMarker.hidden) activeMarker.focus();
  }
  activeMarker = null;
}

function openCase(event, projectId) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
  event.preventDefault();
  sessionStorage.setItem(returnKey, String(journeyProgress()));
  showTransition(caseUrl(projectId), chapters[activeChapter].season, projects[projectId].title);
}

function caseUrl(projectId) {
  const url = new URL(projects[projectId].path || `projects/${projectId}.html`, root);
  url.searchParams.set("from", inlineTree ? "tree" : "seasons");
  if (projectId === "game" && chapters[activeChapter].season === "autumn") {
    url.searchParams.set("season", "autumn");
  }
  return url.href;
}

function describeProject(marker, id) {
  if (activeMarker) activeMarker.setAttribute("aria-pressed", "false");
  activeMarker = marker;
  marker.setAttribute("aria-pressed", "true");
  const project = projects[id];
  const close = document.createElement("button");
  close.id = "close-note";
  close.type = "button";
  close.setAttribute("aria-label", "关闭项目简介");
  close.textContent = "×";
  close.addEventListener("click", () => closeNote(true));
  const title = document.createElement("h2");
  title.textContent = project.title;
  const summary = document.createElement("p");
  summary.textContent = project.summary;
  const link = document.createElement("a");
  link.href = caseUrl(id);
  link.textContent = "打开案例 ↗";
  link.addEventListener("click", event => openCase(event, id));
  note.replaceChildren(close, title, summary, link);
  note.hidden = false;
}

function renderChapter(index) {
  const chapter = chapters[index];
  const keyboardWasOnProject = markerGroup.contains(document.activeElement) || note.contains(document.activeElement);
  closeNote();
  magneticFlower = null;
  activeChapter = index;
  document.body.dataset.chapter = String(index);
  document.body.dataset.clockSeason = chapter.season;
  if (seasonHeading) seasonHeading.textContent = index === 0 ? "雨铃" : "三季之树";
  if (!inlineTree) {
    document.querySelector("#chapter-kicker").textContent = chapter.kicker;
    const title = document.querySelector("#chapter-title");
    if (index === 0) title.replaceChildren("用户研究", document.createElement("br"), "作品集");
    else title.textContent = chapter.title;
    const hint = finePointer.matches ? "请点击花朵，单击预览，双击跳转" : "轻触花朵预览，点「打开案例」进入";
    document.querySelector("#chapter-summary").textContent = index === 0 ? chapter.summary : hint;
    document.querySelector("#start-journey").hidden = index !== 0;
  }
  jumpLinks.forEach((link, i) => {
    if (i === index) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  markers = (chapter.ids || []).map((id, i) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "branch-project";
    marker.hidden = true;
    marker.dataset.project = id;
    marker.setAttribute("aria-label", projects[id].title);
    marker.setAttribute("aria-pressed", "false");
    const point = markerPositions[i];
    marker.style.setProperty("--branch-x", point.x + "%");
    marker.style.setProperty("--branch-y", point.y + "%");
    marker.style.setProperty("--label-tilt", point.tilt + "deg");
    const flower = document.createElement("span");
    flower.className = "branch-flower";
    flower.setAttribute("aria-hidden", "true");
    const symbol = el("svg", { viewBox: "-18 -18 36 36" }, flower);
    el("use", { href: "#" + seasonSymbols[chapter.season] }, symbol);
    const label = document.createElement("span");
    label.className = "branch-project-label";
    const fullName = document.createElement("span");
    fullName.className = "branch-name-full";
    fullName.textContent = projects[id].title;
    const shortName = document.createElement("span");
    shortName.className = "branch-name-short";
    shortName.textContent = shortProjectNames[id];
    label.append(fullName, shortName);
    marker.append(flower, label);
    marker.addEventListener("click", () => describeProject(marker, id));
    marker.addEventListener("dblclick", event => openCase(event, id));
    marker.addEventListener("pointerenter", () => { magneticFlower = flower; requestFrame(); });
    marker.addEventListener("pointerleave", () => { magneticFlower = null; requestFrame(); });
    return marker;
  });
  markerGroup.replaceChildren(...markers);
  if (keyboardWasOnProject) jumpLinks[index].focus({ preventScroll: true });
}

function updateCamera(position) {
  const from = Math.min(Math.floor(position), cameraPositions.length - 1);
  const to = Math.min(from + 1, cameraPositions.length - 1);
  const fraction = clamp(position - from, 0, 1);
  const eased = fraction * fraction * (3 - 2 * fraction);
  const origin = cameraPositions[from];
  const target = cameraPositions[to];
  const strength = inlineTree ? .16 : compact.matches ? .45 : 1;
  const scale = 1 + (lerp(origin.scale, target.scale, eased) - 1) * strength;
  const x = lerp(origin.x, target.x, eased) * Math.min(canopy.clientWidth, 850) * strength;
  const y = lerp(origin.y, target.y, eased) * Math.min(canopy.clientHeight, 760) * strength;
  camera.style.setProperty("--camera-scale", reduced ? 1 : scale);
  camera.style.setProperty("--camera-x", (reduced ? 0 : x) + "px");
  camera.style.setProperty("--camera-y", (reduced ? 0 : y) + "px");
  markerGroup.style.setProperty("--marker-scale", reduced ? 1 : 1 / scale);
}

function updatePointer() {
  if (!ring) return false;
  const visible = pointerVisible && finePointer.matches && !reduced;
  let targetX = pointerX;
  let targetY = pointerY;
  const isMagnetic = visible && magneticFlower?.isConnected;
  if (isMagnetic) {
    const bounds = magneticFlower.getBoundingClientRect();
    targetX = lerp(pointerX, bounds.left + bounds.width / 2, .75);
    targetY = lerp(pointerY, bounds.top + bounds.height / 2, .75);
  }
  ringX = lerp(ringX, targetX, .14);
  ringY = lerp(ringY, targetY, .14);
  ring.classList.toggle("is-visible", visible);
  ring.classList.toggle("is-magnetized", Boolean(isMagnetic));
  ring.style.transform = `translate3d(${ringX - 19}px, ${ringY - 19}px, 0)`;
  const parallaxTargetX = visible ? (pointerX / innerWidth - .5) * 14 : 0;
  const parallaxTargetY = visible ? (pointerY / innerHeight - .5) * 10 : 0;
  parallaxX = reduced ? 0 : lerp(parallaxX, parallaxTargetX, .15);
  parallaxY = reduced ? 0 : lerp(parallaxY, parallaxTargetY, .15);
  treeLayer.style.setProperty("--parallax-x", parallaxX + "px");
  treeLayer.style.setProperty("--parallax-y", parallaxY + "px");
  return (visible && Math.hypot(targetX - ringX, targetY - ringY) > .15) ||
    Math.hypot(parallaxTargetX - parallaxX, parallaxTargetY - parallaxY) > .08;
}

function renderFrame() {
  frame = 0;
  const position = journeyProgress();
  const chapterIndex = chapters.findLastIndex(chapter => position >= chapter.start);
  if (chapterIndex !== activeChapter) renderChapter(chapterIndex);
  currentPosition = reduced ? position : lerp(currentPosition, position, .18);
  const offset = position - chapters[activeChapter].start;
  markers.forEach((marker, index) => {
    const revealed = reduced || offset >= revealOffsets[index];
    if (marker.hidden === !revealed) return;
    if (!revealed && marker === activeMarker) closeNote();
    if (!revealed && marker.contains(document.activeElement)) {
      jumpLinks[activeChapter].focus({ preventScroll: true });
    }
    marker.hidden = !revealed;
    marker.classList.toggle("is-new", revealed && !reduced);
  });
  document.querySelector(".scroll-progress")?.style.setProperty("--progress", position / totalJourney);
  if (scrollCue) scrollCue.hidden = position >= totalJourney - .03;
  updateCamera(currentPosition);
  const pointerAnimating = updatePointer();
  if (pointerAnimating || Math.abs(position - currentPosition) > .001) requestFrame();
}

function jumpTo(position, behavior) {
  if (inlineTree) inlinePosition = position;
  else window.scrollTo({ top: journey.offsetTop + journeyDistance() * position / totalJourney, behavior });
  requestFrame();
}

jumpLinks.forEach((link, index) => {
  link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.replaceState(null, "", link.hash);
    jumpTo(chapters[index].jump, reduced ? "instant" : "smooth");
  });
});
document.querySelector("#start-journey")?.addEventListener("click", event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  history.replaceState(null, "", "#spring");
  jumpTo(chapters[1].jump, reduced ? "instant" : "smooth");
});
document.querySelector("#motion").addEventListener("click", requestFrame);
window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame);
window.addEventListener("pageshow", requestFrame);
window.addEventListener("pointermove", event => {
  if (event.pointerType !== "mouse" || !finePointer.matches || reduced) return;
  if (!pointerVisible) {
    ringX = event.clientX;
    ringY = event.clientY;
  }
  pointerVisible = true;
  pointerX = event.clientX;
  pointerY = event.clientY;
  requestFrame();
}, { passive: true });
document.documentElement.addEventListener("pointerleave", () => {
  pointerVisible = false;
  requestFrame();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !note.hidden) closeNote(true);
});

if (inlineTree) {
  document.querySelector("#catalogue").addEventListener("click", event => {
    const link = event.target.closest("a[href^='projects/']");
    if (!link || event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const id = link.getAttribute("href").slice("projects/".length, -".html".length);
    const project = projects[id];
    if (!project) return;
    event.preventDefault();
    showTransition(link.href, link.closest("[data-season]").dataset.season, project.title);
  });
}

const savedPosition = sessionStorage.getItem(returnKey);
const hashChapter = chapterNames.indexOf(location.hash.slice(1));
if (savedPosition !== null) {
  sessionStorage.removeItem(returnKey);
  const restoredPosition = Number(savedPosition);
  if (Number.isFinite(restoredPosition)) jumpTo(clamp(restoredPosition, 0, totalJourney), "instant");
} else if (hashChapter >= 0) {
  jumpTo(chapters[hashChapter].jump, "instant");
}
requestFrame();
