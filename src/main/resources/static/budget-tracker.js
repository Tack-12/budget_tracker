// budget-tracker.js

const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');
const loadSummaryBtn = document.getElementById('load-summary');
const summaryEl = document.getElementById('summary');

// Set Income
incomeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('income-amount').value);
    const frequency = document.getElementById('frequency').value;
    const response = await fetch('/api/budget/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, frequency })
    });
    const result = await response.json();
    alert(result.message || result.error);
    incomeForm.reset();
});

// Add Expense
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('expense-category').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const response = await fetch('/api/budget/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount })
    });
    const result = await response.json();
    alert(result.message || result.error);
    expenseForm.reset();
});

// Load Summary
loadSummaryBtn.addEventListener('click', async () => {
    const response = await fetch('/api/budget/summary');
    const summary = await response.json();
    summaryEl.textContent = JSON.stringify(summary, null, 2);
});
