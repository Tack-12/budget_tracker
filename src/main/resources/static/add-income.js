window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('income-form').addEventListener('submit', async e => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('income-amount').value);
        const frequency = document.getElementById('frequency').value;
        const res = await fetch('/api/budget/income', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, frequency })
        });
        const data = await res.json();
        alert(data.message || data.error);
        // After setting income, reload dashboard in place
        window.location.href = 'dashboard.html';
    });
});