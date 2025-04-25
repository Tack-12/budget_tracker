/* dashboard.js */
let pieChart, barChart;

window.addEventListener('DOMContentLoaded', () => {
    loadDashboard();

    const allocBtn = document.getElementById('update-allocations');
    if (allocBtn) {
        allocBtn.addEventListener('click', async () => {
            try {
                const form = document.getElementById('allocation-form');
                const monthlyIncome = window.dashboardData.monthlyIncome || 0;
                const allocData = {};
                form.querySelectorAll('input[id^="alloc-"]').forEach(inp => {
                    const cat = inp.id.replace('alloc-','');
                    const pct = parseFloat(inp.value) || 0;
                    allocData[cat] = (pct/100) * monthlyIncome;
                });

                const res = await fetch('/api/budget/allocations', {
                    method: 'POST',
                    headers: { 'Content-Type':'application/json' },
                    body: JSON.stringify(allocData)
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.error('POST /allocations failed', res.status, text);
                    alert(`Failed to set allocations (HTTP ${res.status})`);
                    return;
                }

                await loadDashboard();
            } catch (err) {
                console.error('Error in allocation update:', err);
                alert('Allocation update error: ' + err.message);
            }
        });
    }
});

async function loadDashboard() {
    try {
        const res = await fetch('/api/budget/summary');
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`GET /summary failed ${res.status}: ${txt}`);
        }
        const data = await res.json();
        if (data.error) {
            throw new Error(data.error);
        }

        window.dashboardData = data;

        // Charts + Cards + Lists
        renderCharts(data);

        document.getElementById('income-value').textContent    = `$${data.monthlyIncome.toFixed(2)}`;
        document.getElementById('expenses-value').textContent  = `$${data.totalExpenses.toFixed(2)}`;
        document.getElementById('remaining-value').textContent = `$${data.remainingBudget.toFixed(2)}`;

        const incList = document.getElementById('income-list');
        incList.innerHTML = '';
        if (data.monthlyIncome > 0) {
            const li = document.createElement('li');
            li.textContent = `$${data.monthlyIncome.toFixed(2)}`;
            incList.appendChild(li);
        }

        const expList = document.getElementById('expense-list');
        expList.innerHTML = '';
        data.expenses.forEach((e, idx) => {
            const li = document.createElement('li');
            li.textContent = `${e.category}: $${e.amount.toFixed(2)}`;

            const btn = document.createElement('button');
            btn.textContent = 'X';
            btn.addEventListener('click', async () => {
                const del = await fetch(`/api/budget/expense/${idx}`, { method:'DELETE' });
                if (!del.ok) {
                    alert('Could not delete expense');
                    return;
                }
                loadDashboard();
            });

            li.appendChild(btn);
            expList.appendChild(li);
        });

        populateAllocations(data.allocations, data.monthlyIncome);
        populateRemaining(data.remainingPerCategory);

    } catch (err) {
        console.error('loadDashboard error:', err);
        alert('Error loading dashboard: ' + err.message);
    }
}

function renderCharts(data) {
    const pieCtx  = document.getElementById('pie-chart').getContext('2d');
    const histCtx = document.getElementById('histogram-chart').getContext('2d');

    // destroy old charts if they exist
    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

    let pieLabels = [], pieData = [];
    if (data.allocations && Object.keys(data.allocations).length) {
        pieLabels = Object.keys(data.allocations);
        pieData   = Object.values(data.allocations);
    } else if (data.expenses && data.expenses.length) {
        const totals = data.expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category]||0)+e.amount; return acc;}, {});
        pieLabels = Object.keys(totals);
        pieData   = Object.values(totals);
    } else {
        const demo = ['Food','Transport','Entertainment','Savings'];
        pieLabels = demo;
        pieData   = demo.map(()=>Math.floor(Math.random()*100)+20);
    }

    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: { labels: pieLabels, datasets: [{ data: pieData }] }
    });

    let barLabels = [], barData = [];
    if (data.remainingPerCategory && Object.keys(data.remainingPerCategory).length) {
        barLabels = Object.keys(data.remainingPerCategory);
        barData   = Object.values(data.remainingPerCategory);
    } else if (data.expenses && data.expenses.length) {
        barData   = data.expenses.map(e=>e.amount);
        barLabels = barData.map((_,i)=>`#${i+1}`);
    } else {
        const demo = ['Food','Transport','Entertainment','Savings'];
        barLabels = demo;
        barData   = demo.map(()=>Math.floor(Math.random()*100)+20);
    }

    barChart = new Chart(histCtx, {
        type: 'bar',
        data: { labels: barLabels, datasets: [{ data: barData, label: 'Remaining' }] },
        options: { scales: { y: { beginAtZero:true } } }
    });
}

function populateAllocations(alloc, income) {
    const form = document.getElementById('allocation-form');
    form.innerHTML = '';
    const cats = alloc &&	Object.keys(alloc).length
        ? Object.keys(alloc)
        : (window.dashboardData.expenses||[])
            .map(e=>e.category)
            .filter((v,i,a)=>a.indexOf(v)===i);

    cats.forEach(cat=>{
        const lbl = document.createElement('label');
        lbl.textContent = `${cat} (%)`;
        const inp = document.createElement('input');
        inp.type='number'; inp.step='0.1'; inp.id=`alloc-${cat}`;
        const abs = alloc?.[cat]||0;
        inp.value = income>0 ? ((abs/income)*100).toFixed(1) : '0';
        form.append(lbl, inp);
    });
}

function populateRemaining(remMap) {
    const ul = document.getElementById('remaining-list');
    ul.innerHTML = '';
    (Object.entries(remMap||{})).forEach(([cat, rem])=>{
        const li = document.createElement('li');
        li.textContent = `${cat}: $${rem.toFixed(2)}`;
        ul.appendChild(li);
    });
}




// async function loadDashboard() {
//     try {
//         const res = await fetch('/api/budget/summary');
//         const data = await res.json();
//         if (data.error) { alert(data.error); return; }
//
//         window.dashboardData = data;
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
//         incList.innerHTML = '';
//         if (data.monthlyIncome && data.monthlyIncome > 0) {
//             const li = document.createElement('li');
//             li.textContent = `$${data.monthlyIncome.toFixed(2)}`;
//             incList.appendChild(li);
//         }
//
//         // Expense List
//         const expList = document.getElementById('expense-list');
//         expList.innerHTML = '';
//         data.expenses.forEach((e, index) => {
//             const li = document.createElement('li');
//             li.textContent = `${e.category}: $${e.amount.toFixed(2)}`;
//             // Add delete button
//             const btn = document.createElement('button');
//             btn.textContent = 'X';
//             btn.addEventListener('click', async () => {
//                 const res = await fetch(`/api/budget/expense/${index}`, { method: 'DELETE' });
//                 if (!res.ok) { console.error('Delete failed'); return; }
//                 loadDashboard();
//             });
//             li.appendChild(btn);
//             expList.appendChild(li);
//         });
//         //populate allocation inputs if any
//         populateAllocations(data.allocations, data.monthlyIncome);
//         populateRemaining(data.remainingPerCategory);
//
//     } catch (error) {
//         console.error('Error loading dashboard:', error);
//     }
// }
//
// // Chart rendering
// function renderCharts(data) {
//     const pieCtx = document.getElementById('pie-chart').getContext('2d');
//     const histCtx = document.getElementById('histogram-chart').getContext('2d');
//     let pieLabels=[], pieData=[];
//     let histLabels=[], histData=[];
//
//     if (data.allocations && Object.keys(data.allocations).length) {
//         pieLabels = Object.keys(data.allocations);
//         pieData   = Object.values(data.allocations);
//     } else if (data.expenses && data.expenses.length) {
//         const totals = data.expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
//         pieLabels = Object.keys(totals);
//         pieData   = Object.values(totals);
//     } else {
//         const demoCats = ['Food', 'Transport', 'Entertainment', 'Savings'];
//         pieLabels = demoCats;
//         pieData   = demoCats.map(() => Math.floor(Math.random() * 100) + 20);
//     }
//
//     new Chart(pieCtx, {
//         type:'pie',
//         data:{ labels:pieLabels, datasets:[{data:pieData}] }
//     });
//
//     // Bar: remaining per category if available, otherwise per-expense amounts
//     if (data.remainingPerCategory && Object.keys(data.remainingPerCategory).length) {
//         barLabels = Object.keys(data.remainingPerCategory);
//         barData   = Object.values(data.remainingPerCategory);
//     } else if (data.expenses && data.expenses.length) {
//         barData   = data.expenses.map(e => e.amount);
//         barLabels = barData.map((_, i) => `#${i+1}`);
//     } else {
//         const demoCats = ['Food', 'Transport', 'Entertainment', 'Savings'];
//         barLabels = demoCats;
//         barData   = demoCats.map(() => Math.floor(Math.random() * 100) + 20);
//     }
//
//     new Chart(histCtx, {
//         type: 'bar',
//         data: { labels: barLabels, datasets: [{ data: barData, label: 'Remaining' }] },
//         options: { scales: { y: { beginAtZero: true } } }
//     });
// }
//
// //build allocation inputs dynamically
// function populateAllocations(alloc) {
//     const form = document.getElementById('allocation-form');
//     if (!form) return;
//     form.innerHTML = '';
//
//     const categories = alloc && Object.keys(alloc).length
//         ? Object.keys(alloc)
//         : (window.dashboardData.expenses || []).map(e => e.category)
//             .filter((v,i,a) => a.indexOf(v) === i);
//
//     categories.forEach(cat => {
//         const lbl = document.createElement('label');
//         lbl.textContent = `${cat} (%)`;
//         const inp = document.createElement('input');
//         inp.type  = 'number';
//         inp.step  = '0.1';
//         inp.id    = `alloc-${cat}`;
//         const absAlloc = alloc && alloc[cat] ? alloc[cat] : 0;
//         const pct = monthlyIncome > 0 ? (absAlloc / monthlyIncome * 100).toFixed(1) : 0;
//         inp.value = pct;
//         form.append(lbl, inp);
//     });
// }
//
// //     if (!alloc || !Object.keys(alloc).length) {
// //         // no existing allocations to show
// //         return;
// //     }
// //     Object.entries(alloc).forEach(([cat, amt]) => {
// //         const lbl = document.createElement('label');
// //         lbl.textContent = cat;
// //         const inp = document.createElement('input');
// //         inp.type  = 'number';
// //         inp.step  = '0.01';
// //         inp.id    = `alloc-${cat}`;
// //         inp.value = amt;
// //         form.append(lbl, inp);
// //     });
// // }
//
//
// //show remaining budget per category
// function populateRemaining(remMap) {
//     const ul = document.getElementById('remaining-list');
//     if (!ul) return;
//     ul.innerHTML = '';
//     if (!remMap) return;
//     Object.entries(remMap).forEach(([cat, rem]) => {
//         const li = document.createElement('li');
//         li.textContent = `${cat}: $${rem.toFixed(2)}`;
//         ul.appendChild(li);
//     });
// }
//
//
// //handle "Update Allocations" button
// // Initialize on page load and wire up allocation button
// window.addEventListener('DOMContentLoaded', () => {
//     loadDashboard();
//     const allocBtn = document.getElementById('update-allocations');
//     if (allocBtn) {
//         allocBtn.addEventListener('click', async () => {
//             const monthlyIncome = window.dashboardData?.monthlyIncome || 0;
//             const form = document.getElementById('allocation-form');
//             const allocData = {};
//             Array.from(form.querySelectorAll('input[id^="alloc-"]')).forEach(inp => {
//                 const cat = inp.id.replace('alloc-', '');
//                 const pct = parseFloat(inp.value) || 0;
//                 allocData[cat] = pct / 100 * monthlyIncome;
//             });
//             await fetch('/api/budget/allocations', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(allocData)
//             });
//             loadDashboard();
//         });
//     }
// });