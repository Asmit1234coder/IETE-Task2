
let transactions = JSON.parse(localStorage.getItem('spendwise_transactions')) || [];
let budgetLimit = parseFloat(localStorage.getItem('spendwise_budget')) || 15000;
let categoryChart = null; 

const totalBalanceText = document.getElementById('total-balance');
const totalIncomeText = document.getElementById('total-income');
const totalExpensesText = document.getElementById('total-expenses');

const budgetInput = document.getElementById('budget-input');
const saveBudgetBtn = document.getElementById('save-budget-btn');
const budgetProgressBar = document.getElementById('budget-progress-bar');
const budgetUsedText = document.getElementById('budget-used-text');
const budgetPercentText = document.getElementById('budget-percent-text');
const budgetStatusMessage = document.getElementById('budget-status-message');

const txForm = document.getElementById('transaction-form');
const txDescription = document.getElementById('tx-description');
const txAmount = document.getElementById('tx-amount');
const txType = document.getElementById('tx-type');
const txCategory = document.getElementById('tx-category');
const txDate = document.getElementById('tx-date');

const filterType = document.getElementById('history-filter-type');
const searchInput = document.getElementById('history-search');
const transactionList = document.getElementById('transaction-list');
const emptyState = document.getElementById('empty-state');


const editModal = document.getElementById('edit-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const editCancelBtn = document.getElementById('edit-cancel-btn');
const editForm = document.getElementById('edit-form');
const editTxId = document.getElementById('edit-tx-id');
const editTxDescription = document.getElementById('edit-tx-description');
const editTxAmount = document.getElementById('edit-tx-amount');
const editTxType = document.getElementById('edit-tx-type');
const editTxCategory = document.getElementById('edit-tx-category');
const editTxDate = document.getElementById('edit-tx-date');

const themeToggleBtn = document.getElementById('theme-toggle-btn');



document.addEventListener('DOMContentLoaded', () => {
    
    txDate.value = new Date().toISOString().split('T')[0];
    
   
    budgetInput.value = budgetLimit;
    
    initTheme();
    updateDashboard(); 
    
   
    txForm.addEventListener('submit', addTransaction);
    editForm.addEventListener('submit', saveEditTransaction);
    
    saveBudgetBtn.addEventListener('click', applyBudgetLimit);
    
    filterType.addEventListener('change', renderTransactions);
    searchInput.addEventListener('input', renderTransactions);
    
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    
    modalCloseBtn.addEventListener('click', closeEditModal);
    editCancelBtn.addEventListener('click', closeEditModal);
});


function updateDashboard() {
    let incomeSum = 0;
    let expenseSum = 0;
    
    
    transactions.forEach(t => {
        if (t.type === 'income') {
            incomeSum = incomeSum + t.amount;
        } else if (t.type === 'expense') {
            expenseSum = expenseSum + t.amount;
        }
    });
    
    const totalBalance = incomeSum - expenseSum;
    
    
    totalBalanceText.textContent = `₹${totalBalance.toFixed(2)}`;
    totalIncomeText.textContent = `₹${incomeSum.toFixed(2)}`;
    totalExpensesText.textContent = `₹${expenseSum.toFixed(2)}`;
    
   
    renderTransactions();
    updateBudgetProgressBar(expenseSum);
    updateChart(transactions);
}


function applyBudgetLimit() {
    const value = parseFloat(budgetInput.value);
    if (!isNaN(value) && value > 0) {
        budgetLimit = value;
        localStorage.setItem('spendwise_budget', budgetLimit);
        updateDashboard(); 
        showToast('Budget updated!');
    }
}

function updateBudgetProgressBar(totalExpenses) {
    const percent = Math.round((totalExpenses / budgetLimit) * 100);
    const cappedPercent = Math.min(percent, 100); // bar cannot be wider than 100%
    
    
    budgetProgressBar.style.width = cappedPercent + '%';
    budgetPercentText.textContent = percent + '%';
    budgetUsedText.textContent = `₹${totalExpenses.toFixed(0)} spent / ₹${budgetLimit.toFixed(0)}`;
    
    
    if (percent === 0) {
        budgetStatusMessage.textContent = 'Setup a budget target limit to track savings.';
        budgetProgressBar.style.backgroundColor = 'var(--accent)';
    } else if (percent < 70) {
        budgetStatusMessage.textContent = 'Excellent! You are safely within your spending limits.';
        budgetProgressBar.style.backgroundColor = 'var(--income-color)';
    } else if (percent < 100) {
        budgetStatusMessage.textContent = `Warning: You have used ${percent}% of your budget limit.`;
        budgetProgressBar.style.backgroundColor = '#fbbf24'; // yellow
    } else {
        budgetStatusMessage.textContent = `Alert: Spending limit exceeded by ${percent - 100}%!`;
        budgetProgressBar.style.backgroundColor = 'var(--expense-color)'; // red
    }
}


function updateChart(txList) {
    
    const expenses = txList.filter(t => t.type === 'expense');
    const chartCanvas = document.getElementById('category-chart');
    const noChartText = document.getElementById('no-chart-data');
    
    if (expenses.length === 0) {
        chartCanvas.style.display = 'none';
        noChartText.classList.remove('hidden');
        if (categoryChart) {
            categoryChart.destroy();
            categoryChart = null;
        }
        return;
    }
    
    chartCanvas.style.display = 'block';
    noChartText.classList.add('hidden');
    
    
    const categoryTotals = {};
    expenses.forEach(t => {
        if (categoryTotals[t.category]) {
            categoryTotals[t.category] = categoryTotals[t.category] + t.amount;
        } else {
            categoryTotals[t.category] = t.amount;
        }
    });
    
    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    
    
    const categoryColors = {
        'Food & Dining': '#10b981',
        'Utilities': '#3b82f6',
        'Shopping': '#ec4899',
        'Entertainment': '#f59e0b',
        'Transportation': '#8b5cf6',
        'Salary': '#14b8a6',
        'Others': '#6b7280'
    };
    
    const bgColors = labels.map(label => categoryColors[label] || '#6366f1');
    
    
    if (categoryChart) {
        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = values;
        categoryChart.data.datasets[0].backgroundColor = bgColors;
        categoryChart.update();
    } else {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const ctx = chartCanvas.getContext('2d');
        
        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: bgColors,
                    borderWidth: isDark ? 2 : 1,
                    borderColor: isDark ? '#1e2336' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: isDark ? '#9ca3af' : '#475569' }
                    }
                }
            }
        });
    }
}


function renderTransactions() {
    const selectedFilter = filterType.value;
    const searchVal = searchInput.value.toLowerCase().trim();
    
    transactionList.innerHTML = '';
    
    
    const filtered = transactions.filter(t => {
        const typeMatch = selectedFilter === 'all' || t.type === selectedFilter;
        const searchMatch = t.description.toLowerCase().includes(searchVal) ||
                            t.category.toLowerCase().includes(searchVal);
        return typeMatch && searchMatch;
    });
    
    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
   
    filtered.forEach((t) => {
       
        const index = transactions.findIndex(item => item.id === t.id);
        
        const sign = t.type === 'income' ? '+' : '-';
        const formattedDate = new Date(t.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
        
        const row = document.createElement('div');
        row.className = `transaction-row ${t.type}`;
        row.innerHTML = `
            <div class="tx-left">
                <span class="tx-desc">${t.description}</span>
                <div class="tx-meta">
                    <span>${t.category}</span>
                    <span>${formattedDate}</span>
                </div>
            </div>
            <div class="tx-right">
                <span class="tx-amount">${sign}₹${t.amount.toFixed(2)}</span>
                <button class="row-btn edit-btn" onclick="openEditModal(${index})" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                <button class="row-btn delete-btn" onclick="deleteTransaction(${index})" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        `;
        
        transactionList.appendChild(row);
    });
}


function addTransaction(e) {
    e.preventDefault();
    
    const desc = txDescription.value.trim();
    const amount = parseFloat(txAmount.value);
    const type = txType.value;
    const category = txCategory.value;
    const date = txDate.value;
    
    if (!desc || isNaN(amount) || amount <= 0) return;
    
    const newTransaction = {
        id: 'tx-' + Date.now(), 
        description: desc,
        amount: amount,
        type: type,
        category: category,
        date: date
    };
    
    transactions.push(newTransaction);
    saveAndRefresh();
    
    
    txDescription.value = '';
    txAmount.value = '';
    txDate.value = new Date().toISOString().split('T')[0];
    
    showToast('Transaction added!');
}

function deleteTransaction(index) {
    const desc = transactions[index].description;
    if (confirm(`Delete transaction "${desc}"?`)) {
        transactions.splice(index, 1);
        saveAndRefresh();
        showToast('Transaction deleted.');
    }
}

function openEditModal(index) {
    const t = transactions[index];
    
    editTxId.value = index; 
    editTxDescription.value = t.description;
    editTxAmount.value = t.amount;
    editTxType.value = t.type;
    editTxCategory.value = t.category;
    editTxDate.value = t.date;
    
    editModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    editModal.classList.add('hidden');
    document.body.style.overflow = '';
}

function saveEditTransaction(e) {
    e.preventDefault();
    
    const index = parseInt(editTxId.value);
    const desc = editTxDescription.value.trim();
    const amount = parseFloat(editTxAmount.value);
    const type = editTxType.value;
    const category = editTxCategory.value;
    const date = editTxDate.value;
    
    if (!desc || isNaN(amount) || amount <= 0) return;
    
    
    transactions[index] = {
        id: transactions[index].id,
        description: desc,
        amount: amount,
        type: type,
        category: category,
        date: date
    };
    
    saveAndRefresh();
    closeEditModal();
    showToast('Transaction updated!');
}

function saveAndRefresh() {
    localStorage.setItem('spendwise_transactions', JSON.stringify(transactions));
    updateDashboard();
}


function initTheme() {
    const savedTheme = localStorage.getItem('spendwise_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('spendwise_theme', next);
    updateThemeIcon(next);
    
    // Redraw chart to update font colors
    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
        updateChart(transactions);
    }
}

function updateThemeIcon(theme) {
    if (theme === 'light') {
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: #ea580c;"></i>';
    } else {
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(15, 23, 42, 0.95)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.7rem 1.25rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        zIndex: '1000'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}
