const STORAGE_KEY = "task-manager-tasks";
const STATUSES = ["Pending", "In Progress", "Completed"];
const dialog = document.querySelector("#task-dialog");
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const descriptionInput = document.querySelector("#task-description");
const assigneeInput = document.querySelector("#task-assignee");
const statusInput = document.querySelector("#task-status");
const idInput = document.querySelector("#task-id");
const formError = document.querySelector("#form-error");
const dialogTitle = document.querySelector("#dialog-title");
const dialogKicker = document.querySelector("#dialog-kicker");
let tasks = loadTasks();
if (localStorage.getItem(STORAGE_KEY) === null) saveTasks();

function loadTasks() {
  const savedValue = localStorage.getItem(STORAGE_KEY);
  if (savedValue === null) {
    const now = new Date().toISOString();
    return [
      { id: createId(), title: "Collect project requirements", description: "Confirm the final feature list and submission deadline with the team.", assignee: "Aisha", status: "Pending", createdAt: now, updatedAt: now },
      { id: createId(), title: "Build task board layout", description: "Create the three status columns and make sure the mobile view remains easy to scan.", assignee: "Marco", status: "In Progress", createdAt: now, updatedAt: now },
      { id: createId(), title: "Review Local Storage flow", description: "Refresh the browser and verify that saved tasks are restored correctly.", assignee: "Aisha", status: "Completed", createdAt: now, updatedAt: now }
    ];
  }
  try { const savedTasks = JSON.parse(savedValue); return Array.isArray(savedTasks) ? savedTasks : []; } catch (error) { return []; }
}
function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function formatDate(dateString) { return new Intl.DateTimeFormat("en", { month:"short", day:"numeric", year:"numeric" }).format(new Date(dateString)); }
function createId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[character])); }

function renderTasks() {
  STATUSES.forEach((status) => {
    const list = document.querySelector(`[data-list="${status}"]`);
    const count = document.querySelector(`[data-count="${status}"]`);
    const statusTasks = tasks.filter((task) => task.status === status);
    count.textContent = statusTasks.length;
    list.innerHTML = statusTasks.length ? statusTasks.map(taskTemplate).join("") : "<p class=\"empty-state\">No tasks here yet.</p>";
  });
}

function taskTemplate(task) {
  const description = task.description ? escapeHtml(task.description) : "No description added.";
  const assignee = task.assignee ? escapeHtml(task.assignee) : "Unassigned";
  return `<article class="task-card" draggable="true" data-task-id="${task.id}"><h3>${escapeHtml(task.title)}</h3><p class="task-description">${description}</p><div class="task-meta"><span class="assignee">${assignee}</span><span>Created ${formatDate(task.createdAt)}<br>Updated ${formatDate(task.updatedAt)}</span></div><div class="task-actions"><button class="small-button" type="button" data-action="edit" data-id="${task.id}">Edit</button><button class="small-button delete-button" type="button" data-action="delete" data-id="${task.id}">Delete</button></div></article>`;
}

function openTaskDialog(task = null) {
  form.reset(); formError.textContent = ""; idInput.value = task ? task.id : ""; dialogTitle.textContent = task ? "Edit task" : "Add a task"; dialogKicker.textContent = task ? "UPDATE ENTRY" : "NEW ENTRY";
  if (task) { titleInput.value = task.title; descriptionInput.value = task.description; assigneeInput.value = task.assignee; statusInput.value = task.status; }
  dialog.showModal(); titleInput.focus();
}
function closeTaskDialog() { dialog.close(); }

document.querySelector("#add-task-button").addEventListener("click", () => openTaskDialog());
document.querySelector("#close-dialog-button").addEventListener("click", closeTaskDialog);
document.querySelector("#cancel-dialog-button").addEventListener("click", closeTaskDialog);
dialog.addEventListener("click", (event) => { if (event.target === dialog) closeTaskDialog(); });

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) { formError.textContent = "Please enter a task title."; titleInput.focus(); return; }
  const now = new Date().toISOString();
  const taskData = { title, description:descriptionInput.value.trim(), assignee:assigneeInput.value.trim(), status:statusInput.value, updatedAt:now };
  const existingIndex = tasks.findIndex((task) => task.id === idInput.value);
  if (existingIndex >= 0) tasks[existingIndex] = { ...tasks[existingIndex], ...taskData };
  else tasks.unshift({ ...taskData, id:createId(), createdAt:now });
  saveTasks(); renderTasks(); closeTaskDialog();
});

document.querySelector(".board").addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]"); if (!actionButton) return;
  const task = tasks.find((item) => item.id === actionButton.dataset.id); if (!task) return;
  if (actionButton.dataset.action === "edit") openTaskDialog(task);
  if (actionButton.dataset.action === "delete" && window.confirm(`Delete \"${task.title}\"?`)) { tasks = tasks.filter((item) => item.id !== task.id); saveTasks(); renderTasks(); }
});

const board = document.querySelector(".board");
board.addEventListener("dragstart", (event) => {
  const card = event.target.closest("[data-task-id]");
  if (!card) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", card.dataset.taskId);
  card.classList.add("dragging");
});

board.addEventListener("dragover", (event) => {
  const column = event.target.closest(".column");
  if (!column) return;
  event.preventDefault();
  board.querySelectorAll(".column").forEach((item) => item.classList.toggle("drop-target", item === column));
});

board.addEventListener("drop", (event) => {
  const column = event.target.closest(".column");
  if (!column) return;
  event.preventDefault();
  const task = tasks.find((item) => item.id === event.dataTransfer.getData("text/plain"));
  if (task && STATUSES.includes(column.dataset.status) && task.status !== column.dataset.status) {
    task.status = column.dataset.status;
    task.updatedAt = new Date().toISOString();
    saveTasks();
    renderTasks();
  }
  board.querySelectorAll(".column").forEach((item) => item.classList.remove("drop-target"));
});

board.addEventListener("dragend", (event) => {
  event.target.closest("[data-task-id]")?.classList.remove("dragging");
  board.querySelectorAll(".column").forEach((item) => item.classList.remove("drop-target"));
});

renderTasks();