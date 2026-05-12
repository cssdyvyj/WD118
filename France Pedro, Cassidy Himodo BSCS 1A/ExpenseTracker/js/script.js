/* ══════════════════════════════════════
   Expense Tracker — script.js
   ══════════════════════════════════════ */

'use strict';

// ── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'expense_tracker_v2';

const CAT_ICON = {
  food:      'ti-tools-kitchen-2',
  transport: 'ti-bus',
  bills:     'ti-bolt',
  shopping:  'ti-shopping-bag',
  health:    'ti-heart-rate-monitor',
  others:    'ti-box',
};

const CAT_LABEL = {
  food:      'Food',
  transport: 'Transport',
  bills:     'Bills',
  shopping:  'Shopping',
  health:    'Health',
  others:    'Others',
};

// ── State ──────────────────────────────────────────────────────────────────

let expenses = loadExpenses();

// ── DOM refs ───────────────────────────────────────────────────────────────

const frm       = document.getElementById('frm');
const nameIn    = document.getElementById('name');
const amountIn  = document.getElementById('amount');
const catIn     = document.getElementById('category');
const listEl    = document.getElementById('expenseList');
const totalEl   = document.getElementById('totalExp');
const countEl   = document.getElementById('expCount');
const highEl    = document.getElementById('highestExp');
const filterSel = document.getElementById('sort');
const sortSel   = document.getElementById('sortOrder');
const clearBtn  = document.getElementById('clearAllBtn');
const toastEl   = document.getElementById('toast');
const toastMsg  = document.getElementById('toastMsg');

// ── Storage ────────────────────────────────────────────────────────────────

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatAmount(n) {
  return '₱' + parseFloat(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────

let toastTimer;

function showToast(msg, icon = 'ti-check') {
  toastMsg.textContent = msg;
  toastEl.querySelector('i').className = `ti ${icon}`;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// ── Stats ──────────────────────────────────────────────────────────────────

function updateStats() {
  const total   = expenses.reduce((sum, e) => sum + e.amount, 0);
  const highest = expenses.length ? Math.max(...expenses.map(e => e.amount)) : 0;

  totalEl.textContent = formatAmount(total);
  countEl.textContent = expenses.length;
  highEl.textContent  = formatAmount(highest);
}

// ── Filtering & sorting ────────────────────────────────────────────────────

function getFiltered() {
  const filter = filterSel.value;
  const order  = sortSel.value;

  let list = filter === 'all'
    ? [...expenses]
    : expenses.filter(e => e.category === filter);

  if (order === 'newest')  list.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (order === 'oldest')  list.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (order === 'highest') list.sort((a, b) => b.amount - a.amount);
  if (order === 'lowest')  list.sort((a, b) => a.amount - b.amount);

  return list;
}

// ── Render ─────────────────────────────────────────────────────────────────

function renderList() {
  const list = getFiltered();
  listEl.innerHTML = '';

  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.innerHTML = expenses.length === 0
      ? '<i class="ti ti-receipt-off" aria-hidden="true"></i>No expenses yet.<br>Add your first one above!'
      : '<i class="ti ti-filter-off" aria-hidden="true"></i>No expenses match this filter.';
    listEl.appendChild(li);
    return;
  }

  list.forEach((expense, idx) => {
    const li = document.createElement('li');
    li.className = `expense-item cat-${expense.category}`;
    li.dataset.id = expense.id;
    li.style.animationDelay = `${idx * 0.04}s`;

    li.innerHTML = `
      <div class="expense-icon-wrap">
        <i class="ti ${CAT_ICON[expense.category] || 'ti-box'}" aria-hidden="true"></i>
      </div>
      <div class="expense-info">
        <div class="expense-name">${esc(expense.name)}</div>
        <div class="expense-meta">
          <span class="cat-badge">${CAT_LABEL[expense.category] || 'Other'}</span>
          ${formatDate(expense.date)}
        </div>
      </div>
      <span class="expense-amount">${formatAmount(expense.amount)}</span>
      <button
        class="delete-btn"
        data-id="${expense.id}"
        title="Delete expense"
        aria-label="Delete ${esc(expense.name)}"
      >
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>
    `;

    listEl.appendChild(li);
  });
}

function render() {
  updateStats();
  renderList();
}

// ── Event: Add expense ─────────────────────────────────────────────────────

frm.addEventListener('submit', e => {
  e.preventDefault();

  const name   = nameIn.value.trim();
  const amount = parseFloat(amountIn.value);
  const cat    = catIn.value;

  if (!name) {
    showToast('Please enter an expense name.', 'ti-alert-circle');
    nameIn.focus();
    return;
  }

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount.', 'ti-alert-circle');
    amountIn.focus();
    return;
  }

  expenses.unshift({
    id:       Date.now().toString(),
    name,
    amount,
    category: cat,
    date:     new Date().toISOString(),
  });

  saveExpenses();
  render();
  showToast(`Added: ${name} — ${formatAmount(amount)}`);
  frm.reset();
  nameIn.focus();
});

// ── Event: Delete expense ──────────────────────────────────────────────────

listEl.addEventListener('click', e => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;

  const expense = expenses.find(ex => ex.id === btn.dataset.id);
  if (!expense) return;

  expenses = expenses.filter(ex => ex.id !== btn.dataset.id);
  saveExpenses();
  render();
  showToast(`Deleted: ${expense.name}`, 'ti-trash');
});

// ── Event: Clear all ───────────────────────────────────────────────────────

clearBtn.addEventListener('click', () => {
  if (!expenses.length) {
    showToast('No expenses to clear.', 'ti-info-circle');
    return;
  }

  if (!confirm('Clear all expenses? This cannot be undone.')) return;

  expenses = [];
  saveExpenses();
  render();
  showToast('All expenses cleared.', 'ti-trash');
});

// ── Event: Filter / sort change ────────────────────────────────────────────

filterSel.addEventListener('change', renderList);
sortSel.addEventListener('change', renderList);

// ── Init ───────────────────────────────────────────────────────────────────

render();