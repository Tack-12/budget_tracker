window.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('expense-category');
    const dateInput = document.getElementById('expense-date');

    // populate default categories
    const defaults = [
        "Food","Entertainment","Housing","Transportation",
        "Utilities","Healthcare","Savings","Education",
        "Personal Care","Miscellaneous"
    ];
    sel.innerHTML = '<option disabled selected>-- select or type category --</option>';
    defaults.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        sel.appendChild(opt);
    });

    // fetch dynamic categories
    fetch('/api/budget/summary')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data.expenses)) {
                const dynamic = [...new Set(data.expenses.map(e => e.category))];
                dynamic.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = cat;
                    sel.appendChild(opt);
                });
            }
        })
        .catch(() => {});

    dateInput.value = new Date().toISOString().split('T')[0];

    document.getElementById('expense-form').addEventListener('submit', async e => {
        e.preventDefault();
        await fetch('/api/budget/expense', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: sel.value,
                amount: parseFloat(document.getElementById('expense-amount').value),
                notes: document.getElementById('expense-notes').value.trim(),
                date: dateInput.value
            })
        });
        window.location.href = 'dashboard.html';
    });
});