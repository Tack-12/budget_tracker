// budget-tracker.js

// Populate dashboard lists & summary
async function loadDashboard() {
    const res  = await fetch('/api/budget/summary');
    const data = await res.json();
    if (data.error) { alert(data.error); return; }

    // Update summary cards
    document.getElementById('income-value').textContent    = `$${data.monthlyIncome.toFixed(2)}`;
    document.getElementById('expenses-value').textContent  = `$${data.totalExpenses.toFixed(2)}`;
    document.getElementById('remaining-value').textContent = `$${data.remainingBudget.toFixed(2)}`;

    // --- Income list with remove button ---
    const incList = document.getElementById('income-list');
    incList.innerHTML = `
    <li>
      <span class="exp-item">Income: $${data.monthlyIncome.toFixed(2)}</span>
      <button class="remove-income">&times;</button>
    </li>`;
    incList.querySelector('.remove-income').onclick = async () => {
        await fetch('/api/budget/income', { method: 'DELETE' });
        loadDashboard();
    };

    // --- Expense list grouped by category with remove and notes ---
    const expList = document.getElementById('expense-list');
    expList.innerHTML = '';
    const grouped = {};
    data.expenses.forEach((e, idx) => {
        if (!grouped[e.category]) grouped[e.category] = [];
        grouped[e.category].push({ expense: e, index: idx });
    });

    Object.keys(grouped).forEach(category => {
        const header = document.createElement('div');
        header.className = 'expense-category-header';
        header.textContent = category;
        expList.appendChild(header);

        grouped[category].forEach(({ expense, index }) => {
            const li = document.createElement('li');
            li.innerHTML = `
        <span class="exp-item">$${expense.amount.toFixed(2)}</span>
        <button class="remove-expense" data-idx="${index}">&times;</button>
      `;
            // Show notes on click
            li.querySelector('.exp-item').onclick = () => {
                alert(expense.notes || 'No notes');
            };
            // Remove expense
            li.querySelector('.remove-expense').onclick = async (evt) => {
                const idx = evt.target.dataset.idx;
                await fetch(`/api/budget/expense/${idx}`, { method: 'DELETE' });
                loadDashboard();
            };
            expList.appendChild(li);
        });
    });
}

// Default categories
const defaultCategories = [
    "Food", "Entertainment", "Housing", "Transportation",
    "Utilities", "Healthcare", "Savings", "Education",
    "Personal Care", "Miscellaneous"
];

// Populate Add Expense category dropdown & handle form
async function populateCategories() {
    const res  = await fetch('/api/budget/summary');
    const data = await res.json();
    const sel = document.getElementById('expense-category');
    sel.innerHTML = '';

    // Placeholder
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '-- select or type category --';
    ph.disabled = true;
    ph.selected = true;
    sel.appendChild(ph);

    // Add default categories
    const seen = new Set();
    defaultCategories.forEach(cat => {
        seen.add(cat);
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        sel.appendChild(opt);
    });

    // Add dynamic categories from existing expenses
    data.expenses.forEach(e => {
        if (!seen.has(e.category)) {
            seen.add(e.category);
            const opt = document.createElement('option');
            opt.value = e.category;
            opt.textContent = e.category;
            sel.appendChild(opt);
        }
    });
}

// Initialize pages
window.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        populateCategories();
        expenseForm.addEventListener('submit', async e => {
            e.preventDefault();
            await fetch('/api/budget/expense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: document.getElementById('expense-category').value,
                    amount:   parseFloat(document.getElementById('expense-amount').value),
                    notes:    document.getElementById('expense-notes').value.trim()
                })
            });
            window.location = 'dashboard.html';
        });
    } else {
        loadDashboard();
    }
});