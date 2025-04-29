window.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('expense-category');
    const dateInput = document.getElementById('expense-date');

    const defaults = [
        "Food","Entertainment","Housing","Transportation",
        "Utilities","Healthcare","Savings","Education",
        "Personal Care","Miscellaneous"
    ];
    sel.innerHTML = '<option disabled selected>-- select or type category --</option>';
    defaults.forEach(cat => {
        const o = document.createElement('option');
        o.value = o.textContent = cat;
        sel.appendChild(o);
    });

    fetch('/api/budget/summary')
        .then(r => r.json())
        .then(d => {
            if (Array.isArray(d.expenses)) {
                [...new Set(d.expenses.map(e=>e.category))].forEach(cat => {
                    const o = document.createElement('option');
                    o.value = o.textContent = cat;
                    sel.appendChild(o);
                });
            }
        })
        .catch(()=>{});

    dateInput.value = new Date().toISOString().split('T')[0];

    document.getElementById('expense-form').addEventListener('submit', async e => {
        e.preventDefault();
        const payload = {
            category: sel.value,
            amount:   parseFloat(document.getElementById('expense-amount').value),
            notes:    document.getElementById('expense-notes').value.trim(),
            date:     dateInput.value
        };

        if (document.getElementById('expense-recurring').checked) {
            payload.lastApplied = payload.date;
            await fetch('/api/budget/recurring', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(payload)
            });
        } else {
            await fetch('/api/budget/expense', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(payload)
            });
        }

        window.location.href = 'dashboard.html';
    });
});
