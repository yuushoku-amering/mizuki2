const scenarios = {
  chat: {
    utterance: "澪，帮我理一下接下来先做什么？",
    reply: "可以。先说说你手头有哪些事，我们一起挑一件先做。",
  },
  command: {
    utterance: "澪，帮我打开电脑上的记事本。",
    reply: "将在已配对的电脑上打开记事本。",
  },
};

const scenarioButtons = document.querySelectorAll("[data-scenario]");
const status = document.querySelector("#demo-status");
const userMessage = document.querySelector("#demo-user");
const reply = document.querySelector("#demo-reply");
const next = document.querySelector("#demo-next");
const confirmation = document.querySelector("#demo-confirmation");
const allow = document.querySelector("#demo-allow");
const decline = document.querySelector("#demo-decline");

let selected = "chat";
let stage = "idle";

function reset() {
  stage = "idle";
  status.textContent = "等待唤醒";
  userMessage.hidden = true;
  reply.hidden = true;
  confirmation.hidden = true;
  next.hidden = false;
  next.textContent = "模拟说「mio」";
}

function finish(message) {
  stage = "done";
  status.textContent = "演示结束";
  if (message) reply.textContent = message;
  confirmation.hidden = true;
  next.hidden = false;
  next.textContent = "再试一次";
  next.focus();
}

scenarioButtons.forEach(button => {
  button.addEventListener("click", () => {
    selected = button.dataset.scenario;
    scenarioButtons.forEach(choice => choice.setAttribute("aria-pressed", String(choice === button)));
    reset();
  });
});

next.addEventListener("click", () => {
  if (stage === "done") {
    reset();
    return;
  }
  const scenario = scenarios[selected];
  if (stage === "idle") {
    stage = "listening";
    status.textContent = "已唤醒 · 正在听";
    next.textContent = `说「${scenario.utterance}」`;
    return;
  }
  userMessage.textContent = scenario.utterance;
  userMessage.hidden = false;
  reply.textContent = scenario.reply;
  reply.hidden = false;
  if (selected === "chat") {
    finish();
    return;
  }
  status.textContent = "等待手机确认";
  next.hidden = true;
  confirmation.hidden = false;
  allow.focus();
});

allow.addEventListener("click", () => finish("模拟回执：已打开电脑上的记事本。"));
decline.addEventListener("click", () => finish("已取消，电脑未执行操作。"));

const treeSource = new URLSearchParams(location.search).get("from");
if (treeSource === "seasons" || treeSource === "tree") {
  const returnLink = document.querySelector("[data-case-return]");
  if (returnLink) {
    returnLink.href = treeSource === "seasons" ? "../seasons.html#winter" : "../index.html#winter";
    returnLink.textContent = "← 返回冬季枝条";
  }
}
