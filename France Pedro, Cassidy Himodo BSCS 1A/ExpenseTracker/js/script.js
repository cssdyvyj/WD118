const STORAGE_KEY = 'expense_tracker_data';

const categoryEmoji = {
    food: '🍱',
    transport: '🚌',
    bills: '💡',
    shopping: '🛍️',
    health: '💊',
    others: '📦'
};

let expenses = loadExpenses();

const frm = document.getElementById('frm');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const expenseList = document.getElementById('expenseList');
const totalExp = document.getElementById('totalExp');
const expCount = document.getElementById('expCount');
const highestExp = document.getElementById('highestExp');
const sortFilter = document.getElementById('sort');
const sortOrder = document.getElementById('sortOrder');
const clearAllBtn = document.getElementById('clearAllBtn');
const toast = document.getElementById('toast');
const emptyMsg = document.getElementById('emptyMsg');

function loadExpenses() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveExpenses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

function formatAmount(amount) {
    return '₱' + parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function updateStats() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const highest = expenses.length ? Math.max(...expenses.map(e => e.amount)) : 0;
    totalExp.textContent = formatAmount(total);
    expCount.textContent = expenses.length;
    highestExp.textContent = formatAmount(highest);
}

function getFiltered() {
    const filter = sortFilter.value;
    const order = sortOrder.value;

    let list = filter === 'all' ? [...expenses] : expenses.filter(e => e.category === filter);

    if (order === 'newest') list.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (order === 'oldest') list.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (order === 'highest') list.sort((a, b) => b.amount - a.amount);
    else if (order === 'lowest') list.sort((a, b) => a.amount - b.amount);

    return list;
}

function renderList() {
    const list = getFiltered();
    expenseList.innerHTML = '';

    if (list.length === 0) {
        const li = document.createElement('li');
        li.className = 'empty-state';
        li.innerHTML = expenses.length === 0
            ? '<span>No expenses yet.<br>Add your first one above!</span>'
            : '<span>No expenses match this filter.</span>';
        expenseList.appendChild(li);
        return;
    }

    list.forEach(expense => {
        const li = document.createElement('li');
        li.className = `expense-item cat-${expense.category}`;
        li.dataset.id = expense.id;
        li.innerHTML = `
            <span class="expense-emoji">${categoryEmoji[expense.category] || '📦'}</span>
            <div class="expense-info">
                <div class="expense-name">${escapeHtml(expense.name)}</div>
                <div class="expense-meta">${capitalize(expense.category)} · ${formatDate(expense.date)}</div>
            </div>
            <span class="expense-amount">${formatAmount(expense.amount)}</span>
            <button class="delete-btn" data-id="${expense.id}" title="Delete">✕</button>
        `;
        expenseList.appendChild(li);
    });
}

function render() {
    updateStats();
    renderList();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

frm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (!name) { showToast('Please enter an expense name.'); nameInput.focus(); return; }
    if (!amount || amount <= 0) { showToast('Please enter a valid amount.'); amountInput.focus(); return; }

    const expense = {
        id: Date.now().toString(),
        name,
        amount,
        category,
        date: new Date().toISOString()
    };

    expenses.unshift(expense);
    saveExpenses();
    render();
    showToast(`Added: ${name} — ${formatAmount(amount)}`);

    frm.reset();
    nameInput.focus();
});

expenseList.addEventListener('click', function (e) {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;

    const id = btn.dataset.id;
    const expense = expenses.find(ex => ex.id === id);
    if (!expense) return;

    expenses = expenses.filter(ex => ex.id !== id);
    saveExpenses();
    render();
    showToast(`Deleted: ${expense.name}`);
});

clearAllBtn.addEventListener('click', function () {
    if (expenses.length === 0) { showToast('No expenses to clear.'); return; }
    if (!confirm('Are you sure you want to clear all expenses?')) return;
    expenses = [];
    saveExpenses();
    render();
    showToast('All expenses cleared.');
});

sortFilter.addEventListener('change', renderList);
sortOrder.addEventListener('change', renderList);

render();
