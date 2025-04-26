window.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('income-date');
    // Default to today
    dateInput.value = new Date().toISOString().split('T')[0];

    document.getElementById('income-form').addEventListener('submit', async e => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('income-amount').value);
        const frequency = document.getElementById('frequency').value;
        const date = document.getElementById('income-date').value;


        const res = await fetch('/api/budget/income', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, frequency, date})
        });
        const data = await res.json();
        alert(data.message || data.error);
        // After setting income, reload dashboard in place
        window.location.href = 'dashboard.html';
    });
});