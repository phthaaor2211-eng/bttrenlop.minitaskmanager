
"use strict";

// Dữ liệu mẫu theo yêu cầu đề bài.
const items = [
  { id: 1, title: "Viết báo cáo HTML", dueDate: "2026-10-20", priority: "Cao", status: "pending" },
  { id: 2, title: "Ôn Flexbox", dueDate: "2026-10-23", priority: "Trung bình", status: "pending" },
  { id: 3, title: "Làm bài DOM", dueDate: "2026-10-19", priority: "Cao", status: "done" },
  { id: 4, title: "Đọc tài liệu CSS", dueDate: "2026-10-25", priority: "Thấp", status: "pending" },
  { id: 5, title: "Thiết kế trang cá nhân", dueDate: "2026-10-21", priority: "Trung bình", status: "done" }
];

const taskForm = document.querySelector("#taskForm");
const taskName = document.querySelector("#taskName");
const taskDeadline = document.querySelector("#taskDeadline");
const taskPriority = document.querySelector("#taskPriority");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const taskList = document.querySelector("#taskList");
const errorMessage = document.querySelector("#errorMessage");
const emptyMessage = document.querySelector("#emptyMessage");

// Đổi định dạng ngày từ YYYY-MM-DD thành DD/MM/YYYY.
function formatDate(dateString) {
  if (!dateString) return "Chưa đặt hạn";

  const parts = dateString.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Kiểm tra công việc đã quá hạn hay chưa.
function isOverdue(item) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return item.status !== "done"
    && item.dueDate
    && new Date(`${item.dueDate}T00:00:00`) < today;
}

// Cập nhật các thẻ thống kê và phần trăm tiến độ.
function updateStatistics() {
  const total = items.length;
  const done = items.filter(item => item.status === "done").length;
  const pending = total - done;
  const overdue = items.filter(isOverdue).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  document.querySelector("#totalCount").textContent = total;
  document.querySelector("#pendingCount").textContent = pending;
  document.querySelector("#doneCount").textContent = done;
  document.querySelector("#overdueCount").textContent = overdue;
  document.querySelector("#progressPercent").textContent = `${percent}%`;
  document.querySelector("#progressText").textContent =
    `${done} trên ${total} công việc`;

  document.querySelector("#progressRing")
    .style.setProperty("--progress", `${percent * 3.6}deg`);
}

// Tạo giao diện cho một công việc.
function createTaskElement(item) {
  const article = document.createElement("article");
  article.className =
    `task-item ${item.status === "done" ? "is-done" : ""}`;

  const main = document.createElement("div");
  main.className = "task-main";

  const checkButton = document.createElement("button");
  checkButton.type = "button";
  checkButton.className = "check-button";
  checkButton.dataset.action = "toggle";
  checkButton.dataset.id = item.id;
  checkButton.setAttribute(
    "aria-label",
    item.status === "done"
      ? "Đánh dấu chưa hoàn thành"
      : "Đánh dấu hoàn thành"
  );
  checkButton.textContent = item.status === "done" ? "✓" : "";

  const details = document.createElement("div");
  details.className = "task-details";

  const title = document.createElement("h3");
  title.textContent = item.title;

  if (item.status === "done") {
    title.classList.add("completed");
  }

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const date = document.createElement("span");
  date.className = "due-date";
  date.textContent = `Hạn: ${formatDate(item.dueDate)}`;

  const priority = document.createElement("span");
  const priorityClass =
    item.priority === "Cao"
      ? "high"
      : item.priority === "Thấp"
        ? "low"
        : "medium";

  priority.className = `priority priority-${priorityClass}`;
  priority.textContent = `Ưu tiên ${item.priority}`;

  const status = document.createElement("span");
  const statusClass =
    item.status === "done"
      ? "status-done"
      : isOverdue(item)
        ? "status-overdue"
        : "status-pending";

  status.className = `status-pill ${statusClass}`;
  status.textContent =
    item.status === "done"
      ? "Đã hoàn thành"
      : isOverdue(item)
        ? "Quá hạn"
        : "Chưa hoàn thành";

  meta.append(date, priority, status);
  details.append(title, meta);
  main.append(checkButton, details);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "text-button";
  toggle.dataset.action = "toggle";
  toggle.dataset.id = item.id;
  toggle.textContent =
    item.status === "done" ? "Hoàn tác" : "Hoàn thành";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-button";
  remove.dataset.action = "delete";
  remove.dataset.id = item.id;
  remove.textContent = "Xóa";

  actions.append(toggle, remove);
  article.append(main, actions);

  return article;
}

// C1: Hiển thị dữ liệu từ mảng lên DOM.
function renderTasks() {
  const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
  const selectedStatus = statusFilter.value;

  const filteredItems = items.filter(item => {
    const matchesKeyword =
      item.title.toLocaleLowerCase("vi").includes(keyword);

    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    return matchesKeyword && matchesStatus;
  });

  taskList.replaceChildren();

  filteredItems.forEach(item => {
    taskList.appendChild(createTaskElement(item));
  });

  emptyMessage.hidden = filteredItems.length !== 0;

  document.querySelector("#visibleCount").textContent =
    `${filteredItems.length} mục`;

  updateStatistics();
}

// C2: Đọc form, kiểm tra dữ liệu và thêm công việc.
taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskName.value.trim();

  if (!title) {
    errorMessage.textContent =
      "Bạn hãy nhập tên công việc trước khi thêm.";
    taskName.focus();
    return;
  }

  const duplicated = items.some(
    item => item.title.toLocaleLowerCase("vi")
      === title.toLocaleLowerCase("vi")
  );

  if (duplicated) {
    errorMessage.textContent =
      "Công việc này đã có trong danh sách.";
    taskName.focus();
    return;
  }

  const newItem = {
    id: items.length
      ? Math.max(...items.map(item => item.id)) + 1
      : 1,
    title: title,
    dueDate: taskDeadline.value,
    priority: taskPriority.value,
    status: "pending"
  };

  items.unshift(newItem);

  taskForm.reset();
  taskPriority.value = "Trung bình";
  errorMessage.textContent = "";
  statusFilter.value = "all";
  searchInput.value = "";

  renderTasks();
  taskName.focus();
});

// C3: Tìm kiếm và lọc theo trạng thái.
searchInput.addEventListener("input", renderTasks);
statusFilter.addEventListener("change", renderTasks);

// C4: Cập nhật trạng thái và xóa công việc theo ID.
taskList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const index = items.findIndex(item => item.id === id);

  if (index === -1) return;

  if (button.dataset.action === "toggle") {
    items[index].status =
      items[index].status === "done" ? "pending" : "done";
  } else if (button.dataset.action === "delete") {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa "${items[index].title}" không?`
    );

    if (!confirmed) return;

    items.splice(index, 1);
  }

  renderTasks();
});

// Hiển thị ngày hiện tại trên đầu trang.
document.querySelector("#todayLabel").textContent =
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date());

// Hiển thị danh sách lần đầu khi mở trang.
renderTasks();
