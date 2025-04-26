// src/main/resources/static/dashboard.js
async function loadDashboard() {
    try {
        const res  = await fetch('/api/budget/summary');
        const data = await res.json();
        if (data.error) { alert(data.error); return; }

        // Charts
        renderCharts(data);

        // Header cards
        document.getElementById('income-value').textContent    =
            `$${data.monthlyIncome.toFixed(2)} — ${data.incomeDate}`;
        document.getElementById('expenses-value').textContent  =
            `$${data.totalExpenses.toFixed(2)}`;
        document.getElementById('remaining-value').textContent =
            `$${data.remainingBudget.toFixed(2)}`;

        // Income list with Edit & Remove
        const incList = document.getElementById('income-list');
        incList.innerHTML = `
      <li>
        <span class="exp-item">
          Income — $${data.monthlyIncome.toFixed(2)} — ${data.incomeDate}
        </span>
        <button class="edit-income">✎</button>
        <button class="remove-income">×</button>
      </li>`;
        incList.querySelector('.edit-income').onclick = async () => {
            const oldAmt  = data.monthlyIncome.toFixed(2);
            const newAmtI = prompt('Enter new income amount:', oldAmt);
            if (newAmtI === null) return;
            const newAmt  = parseFloat(newAmtI);
            if (isNaN(newAmt) || newAmt <= 0) {
                alert('Amount must be a positive number.');
                return;
            }
            const newFreq = prompt('Enter frequency:', 'monthly');
            if (newFreq === null) return;
            const newDate = prompt('Enter new date (YYYY-MM-DD):', data.incomeDate);
            if (newDate === null) return;

            await fetch('/api/budget/income', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount:    newAmt,
                    frequency: newFreq,
                    date:      newDate
                })
            });
            loadDashboard();
        };
        incList.querySelector('.remove-income').onclick = async () => {
            await fetch('/api/budget/income', { method: 'DELETE' });
            loadDashboard();
        };

        // Expense list with dates, edit & remove
        const expList = document.getElementById('expense-list');
        expList.innerHTML = '';
        const grouped = data.expenses.reduce((acc, e, i) => {
            (acc[e.category] = acc[e.category] || []).push({ e, i });
            return acc;
        }, {});
        Object.entries(grouped).forEach(([cat, items]) => {
            const header = document.createElement('div');
            header.className = 'category-header';
            header.textContent = cat;
            expList.appendChild(header);

            items.forEach(({ e, i }) => {
                const li = document.createElement('li');
                li.innerHTML = `
          <span class="exp-item">
            $${e.amount.toFixed(2)} — ${e.date}
          </span>
          <button data-idx="${i}" class="edit-expense">✎</button>
          <button data-idx="${i}" class="remove-expense">×</button>
        `;

                // View notes
                li.querySelector('.exp-item').onclick = () =>
                    alert(e.notes || 'No notes');

                // Edit expense
                li.querySelector('.edit-expense').onclick = async evt => {
                    const idx   = evt.target.dataset.idx;
                    const exp   = data.expenses[idx];
                    const newCat = prompt('Enter new category:', exp.category);
                    if (newCat === null) return;
                    const newAmtI = prompt('Enter new amount:', exp.amount);
                    if (newAmtI === null) return;
                    const newAmt  = parseFloat(newAmtI);
                    if (isNaN(newAmt) || newAmt <= 0) {
                        alert('Amount must be a positive number.');
                        return;
                    }
                    const newNotes = prompt('Enter new notes:', exp.notes) || '';
                    const newDate  = prompt('Enter new date (YYYY-MM-DD):', exp.date);
                    if (newDate === null) return;

                    // remove old then post updated
                    await fetch(`/api/budget/expense/${idx}`, { method: 'DELETE' });
                    await fetch('/api/budget/expense', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            category: newCat,
                            amount:   newAmt,
                            notes:    newNotes,
                            date:     newDate
                        })
                    });
                    loadDashboard();
                };

                // Remove expense
                li.querySelector('.remove-expense').onclick = async evt => {
                    await fetch(
                        `/api/budget/expense/${evt.target.dataset.idx}`,
                        { method: 'DELETE' }
                    );
                    loadDashboard();
                };

                expList.appendChild(li);
            });
        });

    } catch (err) {
        console.error(err);
    }
}

window.addEventListener('DOMContentLoaded', loadDashboard);

// Chart rendering unchanged
function renderCharts(data) {
    const pieCtx = document.getElementById('pie-chart').getContext('2d');
    const histCtx = document.getElementById('histogram-chart').getContext('2d');
    let pieLabels = [], pieData = [];
    let histLabels = [], histData = [];

    if (data.expenses && data.expenses.length) {
        const totals = data.expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category]||0) + e.amount;
            return acc;
        }, {});
        pieLabels = Object.keys(totals);
        pieData   = Object.values(totals);
        histData  = data.expenses.map(e => e.amount);
        histLabels= histData.map((_,i) => `#${i+1}`);
    }

    new Chart(pieCtx, {
        type: 'pie',
        data: { labels: pieLabels, datasets: [{ data: pieData }] }
    });
    new Chart(histCtx, {
        type: 'bar',
        data: { labels: histLabels, datasets: [{ data: histData, label: 'Amount' }] },
        options: { scales: { y: { beginAtZero: true } } }
    });
}







// async function loadDashboard() {
//     try {
//         const res = await fetch('/api/budget/summary');
//         const data = await res.json();
//         if (data.error) { alert(data.error); return; }
//
//         // Render Charts
//         renderCharts(data);
//
//         // Update Cards
//         document.getElementById('income-value').textContent    = `$${data.monthlyIncome.toFixed(2)}`;
//         document.getElementById('expenses-value').textContent  = `$${data.totalExpenses.toFixed(2)}`;
//         document.getElementById('remaining-value').textContent = `$${data.remainingBudget.toFixed(2)}`;
//
//         // Income List
//         const incList = document.getElementById('income-list');
//         incList.innerHTML = `<li><span class="exp-item">Income: $${data.monthlyIncome.toFixed(2)}</span><button class="remove-income">×</button></li>`;
//         incList.querySelector('.remove-income').onclick = async () => { await fetch('/api/budget/income',{method:'DELETE'}); loadDashboard(); };
//
//         // Expense List
//         const expList = document.getElementById('expense-list'); expList.innerHTML = '';
//         const grouped = data.expenses.reduce((acc,e,i)=>{(acc[e.category]=acc[e.category]||[]).push({e,i});return acc;},{ });
//         Object.entries(grouped).forEach(([cat,items])=>{
//             const header = document.createElement('div'); header.className='expense-category-header'; header.textContent=cat; expList.appendChild(header);
//             items.forEach(({e,i})=>{
//                 const li=document.createElement('li');
//                 li.innerHTML=`<span class="exp-item">$${e.amount.toFixed(2)}</span><button data-idx="${i}" class="remove-expense">×</button>`;
//                 li.querySelector('.exp-item').onclick=()=>alert(e.notes||'No notes');
//                 li.querySelector('.remove-expense').onclick=async evt=>{await fetch(`/api/budget/expense/${evt.target.dataset.idx}`,{method:'DELETE'});loadDashboard();};
//                 expList.appendChild(li);
//             });
//         });
//     } catch(err){ console.error(err); }
// }
//
// // Chart rendering
// function renderCharts(data) {
//     const pieCtx = document.getElementById('pie-chart').getContext('2d');
//     const histCtx = document.getElementById('histogram-chart').getContext('2d');
//     let pieLabels=[], pieData=[];
//     let histLabels=[], histData=[];
//
//     if (data.expenses && data.expenses.length) {
//         const totals = data.expenses.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
//         pieLabels = Object.keys(totals);
//         pieData   = Object.values(totals);
//         histData  = data.expenses.map(e=>e.amount);
//         histLabels= histData.map((_,i)=>`#${i+1}`);
//     } else {
//         const demoCats=['Food','Transport','Entertainment','Savings'];
//         pieLabels=demoCats;
//         pieData=demoCats.map(()=>Math.floor(Math.random()*100)+20);
//         histData=Array.from({length:10},()=>Math.floor(Math.random()*200)+10);
//         histLabels=histData.map((_,i)=>`#${i+1}`);
//     }
//
//     new Chart(pieCtx, {
//         type:'pie',
//         data:{ labels:pieLabels, datasets:[{data:pieData}] }
//     });
//
//     new Chart(histCtx, {
//         type:'bar',
//         data:{ labels:histLabels, datasets:[{data:histData,label:'Amount'}] },
//         options:{ scales:{ y:{ beginAtZero:true } } }
//     });
// }
//
// window.addEventListener('DOMContentLoaded', loadDashboard);