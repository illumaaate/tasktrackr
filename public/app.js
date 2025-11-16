const API_URL = '/api/tasks';

// отображение статусов по-русски
function getStatusLabel(status) {
  switch (status) {
    case 'todo':
      return 'Запланировано';
    case 'in-progress':
      return 'В работе';
    case 'done':
      return 'Готово';
    default:
      return 'Неизвестно';
  }
}

// отображение категорий по-русски
function getCategoryLabel(category) {
  switch (category) {
    case 'study':
      return 'Учебная';
    case 'work':
      return 'Рабочая';
    case 'practice':
      return 'Практика';
    case 'personal':
      return 'Личная';
    default:
      return 'Не указана';
  }
}

// 3.1 Приветствие по времени суток
function setGreeting() {
  const el = document.getElementById('greeting');
  if (!el) return;
  const hour = new Date().getHours();
  let text = 'Доброе время суток!';
  if (hour < 12) text = 'Доброе утро!';
  else if (hour < 18) text = 'Добрый день!';
  else text = 'Добрый вечер!';
  el.textContent = text;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
}

// ====== Модальное окно задачи ======

function openTaskModal(task) {
  const overlay = document.getElementById('task-modal-overlay');
  if (!overlay) return;

  const titleEl = document.getElementById('modal-title');
  const categoryEl = document.getElementById('modal-category');
  const statusEl = document.getElementById('modal-status');
  const dueEl = document.getElementById('modal-due');
  const descEl = document.getElementById('modal-description');
  const jsonEl = document.getElementById('modal-json');
  const xmlEl = document.getElementById('modal-xml');

  titleEl.textContent = task.title || 'Без названия';
  categoryEl.textContent = getCategoryLabel(task.category);
  statusEl.textContent = getStatusLabel(task.status);
  dueEl.textContent = formatDate(task.dueDate);
  descEl.textContent = task.description || '—';

  const compactTask = {
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    category: task.category,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
  jsonEl.textContent = JSON.stringify(compactTask, null, 2);

  const xml =
    '<task>' +
    `<id>${task._id}</id>` +
    `<title>${task.title}</title>` +
    `<status>${task.status}</status>` +
    `<category>${task.category || ''}</category>` +
    `<dueDate>${task.dueDate || ''}</dueDate>` +
    '</task>';
  xmlEl.textContent = xml;

  overlay.classList.add('visible');
}

function closeTaskModal() {
  const overlay = document.getElementById('task-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
}

// 3.2 Скрытие/показ списка задач
function initToggleTasks() {
  const btn = document.getElementById('toggle-tasks');
  const section = document.getElementById('tasks-section');
  if (!btn || !section) return;
  btn.addEventListener('click', () => {
    const table = document.getElementById('tasks-table');
    if (!table) return;
    const hidden = table.hasAttribute('hidden');
    if (hidden) table.removeAttribute('hidden');
    else table.setAttribute('hidden', 'true');
  });
}

// 4.2 Динамическое создание HTML элементов
function renderTasks(tasks) {
  const tbody = document.getElementById('tasks-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  tasks.forEach((task) => {
    const tr = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.textContent = task.title;

    const tdCategory = document.createElement('td');
    tdCategory.textContent = getCategoryLabel(task.category);

    const tdStatus = document.createElement('td');
    tdStatus.textContent = getStatusLabel(task.status);

    const tdDue = document.createElement('td');
    tdDue.textContent = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : '—';

    const tdActions = document.createElement('td');
    const btnDone = document.createElement('button');
    btnDone.textContent = 'Готово';
    btnDone.addEventListener('click', (e) => {
      e.stopPropagation();
      updateTask(task._id, { status: 'done' });
    });

    const btnDelete = document.createElement('button');
    btnDelete.textContent = 'Удалить';
    btnDelete.classList.add('secondary');
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task._id);
    });

    tdActions.append(btnDone, btnDelete);
    tr.append(tdTitle, tdCategory, tdStatus, tdDue, tdActions);

    tr.addEventListener('click', () => openTaskModal(task));

    tbody.appendChild(tr);
  });
}

// ====== Блок статистики для stats.html ======

function computeStats(tasks) {
  const stats = {
    total: tasks.length,
    byStatus: {
      todo: 0,
      'in-progress': 0,
      done: 0,
    },
    withoutDue: 0,
    categories: {
      study: { total: 0, todo: 0, 'in-progress': 0, done: 0 },
      project: { total: 0, todo: 0, 'in-progress': 0, done: 0 },
    },
  };

  tasks.forEach((task) => {
    const status = task.status || 'todo';
    const cat = task.category || 'study';

    if (stats.byStatus[status] !== undefined) {
      stats.byStatus[status] += 1;
    }

    if (!task.dueDate) {
      stats.withoutDue += 1;
    }

    // условно считаем: study -> "Учёба", остальные -> "Проекты"
    const bucket =
      cat === 'study' ? stats.categories.study : stats.categories.project;

    bucket.total += 1;
    if (bucket[status] !== undefined) {
      bucket[status] += 1;
    }
  });

  return stats;
}

function updateStatsDom(stats) {
  const totalEl = document.getElementById('stat-total');
  const inProgressEl = document.getElementById('stat-in-progress');
  const doneEl = document.getElementById('stat-done');
  const withoutDueEl = document.getElementById('stat-without-due');

  if (totalEl) totalEl.textContent = stats.total;
  if (inProgressEl) inProgressEl.textContent = stats.byStatus['in-progress'];
  if (doneEl) doneEl.textContent = stats.byStatus.done;
  if (withoutDueEl) withoutDueEl.textContent = stats.withoutDue;

  const study = stats.categories.study;
  const studyTotal = document.getElementById('cat-study-total');
  const studyTodo = document.getElementById('cat-study-todo');
  const studyInProgress = document.getElementById('cat-study-in-progress');
  const studyDone = document.getElementById('cat-study-done');

  if (studyTotal) studyTotal.textContent = study.total;
  if (studyTodo) studyTodo.textContent = study.todo;
  if (studyInProgress) studyInProgress.textContent = study['in-progress'];
  if (studyDone) studyDone.textContent = study.done;

  const proj = stats.categories.project;
  const projTotal = document.getElementById('cat-project-total');
  const projTodo = document.getElementById('cat-project-todo');
  const projInProgress = document.getElementById('cat-project-in-progress');
  const projDone = document.getElementById('cat-project-done');

  if (projTotal) projTotal.textContent = proj.total;
  if (projTodo) projTodo.textContent = proj.todo;
  if (projInProgress) projInProgress.textContent = proj['in-progress'];
  if (projDone) projDone.textContent = proj.done;
}

// 5.1/5.2 async/await + REST API

async function fetchTasks() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
}

async function createTask(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ошибка создания');
  return res.json();
}

async function updateTask(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ошибка обновления');
  await loadAndRender();
}

async function deleteTask(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Ошибка удаления');
  await loadAndRender();
}

async function loadAndRender() {
  try {
    const tasks = await fetchTasks();
    renderTasks(tasks);
    const stats = computeStats(tasks);
    updateStatsDom(stats);
  } catch (e) {
    console.error(e);
  }
}

// 3.5 Клиентская валидация формы
function initForm() {
  const form = document.getElementById('task-form');
  const errorEl = document.getElementById('form-error');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('title-input');
    if (!titleInput.value || titleInput.value.length < 3) {
      errorEl.textContent = 'Название должно быть не короче 3 символов';
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
      await createTask(data);
      form.reset();
      await loadAndRender();
    } catch (err) {
      errorEl.textContent = 'Ошибка сохранения задачи';
      errorEl.hidden = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  setGreeting();
  initToggleTasks();
  initForm();

  const overlay = document.getElementById('task-modal-overlay');
  const closeBtn = document.getElementById('task-modal-close');

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeTaskModal();
      }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeTaskModal);
  }

  await loadAndRender();
});
