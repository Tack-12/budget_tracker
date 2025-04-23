async function loadDashboard() {
    const res = await fetch('/api/budget/summary');
    const data = await res.json();
    if (data.error) { return alert(data.error); }

    document.getElementById('income-value').textContent    = `$${data.monthlyIncome.toFixed(2)}`;
    document.getElementById('expenses-value').textContent  = `$${data.totalExpenses.toFixed(2)}`;
    document.getElementById('remaining-value').textContent = `$${data.remainingBudget.toFixed(2)}`;

    // Income list
    const incList = document.getElementById('income-list');
    incList.innerHTML = `<li><span class="exp-item">Income: $${data.monthlyIncome.toFixed(2)}</span><button class="remove-income">×</button></li>`;
    incList.querySelector('.remove-income').onclick = async () => { await fetch('/api/budget/income', { method: 'DELETE' }); loadDashboard(); };

    // Expenses list
    const expList = document.getElementById('expense-list'); expList.innerHTML = '';
    const grouped = data.expenses.reduce((acc, e, i) => { (acc[e.category] = acc[e.category]||[]).push({e,i}); return acc; }, {});
    Object.entries(grouped).forEach(([cat, items]) => {
        const header = document.createElement('div'); header.className='expense-category-header'; header.textContent=cat; expList.appendChild(header);
        items.forEach(({e,i}) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="exp-item">$${e.amount.toFixed(2)}</span><button data-idx="${i}" class="remove-expense">×</button>`;
            li.querySelector('.exp-item').onclick = () => alert(e.notes||'No notes');
            li.querySelector('.remove-expense').onclick = async evt => { await fetch(`/api/budget/expense/${evt.target.dataset.idx}`, { method: 'DELETE' }); loadDashboard(); };
            expList.appendChild(li);
        });
    });
}

window.addEventListener('DOMContentLoaded', loadDashboard);