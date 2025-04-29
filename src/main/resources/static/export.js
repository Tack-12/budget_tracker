window.addEventListener('DOMContentLoaded', async () => {
    let data;
    try {
        const res = await fetch('/api/budget/summary');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    } catch (err) {
        return alert('Failed to load data for export: ' + err.message);
    }

    document.getElementById('export-csv').onclick = () => {
        let csv = 'Type,Category,Amount,Date,Notes\n';
        csv += `Income,,${data.monthlyIncome},${data.incomeDate},\n`;
        data.expenses.forEach(e => {
            csv += `Expense,${e.category},${e.amount},${e.date},"${e.notes||''}"\n`;
        });
        downloadBlob(csv, 'budget_export.csv', 'text/csv');
    };

    document.getElementById('export-json').onclick = () => {
        downloadBlob(JSON.stringify(data, null, 2), 'budget_export.json', 'application/json');
    };
});

function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
