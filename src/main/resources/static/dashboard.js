window.__lastDashboardData = null;

async function fetchAndRender() {
    try {
        const res = await fetch('/api/budget/summary');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        window.__lastDashboardData = data;
        renderAll(data, data.expenses);
    } catch (err) {
        console.error(err);
        alert('Unable to load data: ' + err.message);
    }
}

function renderAll(orig, exp) {
    renderCards(orig);
    renderCharts({ ...orig, expenses: exp });
    renderLists(orig, exp);
    showAlert(orig.remainingBudget);
}

function renderCards(d) {
    const cur = getCurrency();
    document.getElementById('income-value').textContent =
        `${cur}${d.monthlyIncome.toFixed(2)} — ${d.incomeDate}`;
    document.getElementById('expenses-value').textContent =
        `${cur}${d.totalExpenses.toFixed(2)}`;
    document.getElementById('remaining-value').textContent =
        `${cur}${d.remainingBudget.toFixed(2)}`;
}

function renderCharts(data) {
    const totals = data.expenses.reduce((a,e) => {
        a[e.category] = (a[e.category]||0) + e.amount;
        return a;
    }, {});
    const pieLabels = Object.keys(totals),
        pieData   = Object.values(totals),
        histData  = data.expenses.map(e=>e.amount),
        histLabels= histData.map((_,i)=>`#${i+1}`);

    new Chart(
        document.getElementById('pie-chart').getContext('2d'),
        { type:'pie', data:{ labels:pieLabels, datasets:[{ data:pieData }] } }
    );
    new Chart(
        document.getElementById('histogram-chart').getContext('2d'),
        { type:'bar',
            data:{ labels:histLabels, datasets:[{ label:'Amount', data:histData }] },
            options:{ scales:{ y:{ beginAtZero:true } } }
        }
    );

    const bd = document.getElementById('category-breakdown');
    bd.innerHTML = '';
    pieLabels.forEach((c,i) => {
        const li = document.createElement('li');
        li.textContent = `${c}: ${getCurrency()}${pieData[i].toFixed(2)}`;
        bd.appendChild(li);
    });
}

function renderLists(d, exp) {
    const incL = document.getElementById('income-list');
    incL.innerHTML = `
    <li>
      <span class="exp-item">
        Income — ${getCurrency()}${d.monthlyIncome.toFixed(2)} — ${d.incomeDate}
      </span>
      <button class="edit-income">✎</button>
      <button class="remove-income">×</button>
    </li>`;
    incL.querySelector('.edit-income').onclick   = editIncome;
    incL.querySelector('.remove-income').onclick = async () => {
        await fetch('/api/budget/income',{method:'DELETE'});
        fetchAndRender();
    };

    const expL = document.getElementById('expense-list');
    expL.innerHTML = '';
    const grouped = exp.reduce((a,e,i) => {
        (a[e.category]=a[e.category]||[]).push({e,i});
        return a;
    }, {});
    Object.entries(grouped).forEach(([cat,items]) => {
        const h = document.createElement('div');
        h.className = 'expense-category-header';
        h.textContent = cat;
        expL.appendChild(h);

        items.forEach(({e,i}) => {
            const li = document.createElement('li');
            li.innerHTML = `
        <span class="exp-item">
          ${getCurrency()}${e.amount.toFixed(2)} — ${e.date}
        </span>
        <button data-idx="${i}" class="edit-expense">✎</button>
        <button data-idx="${i}" class="remove-expense">×</button>
      `;
            li.querySelector('.exp-item').onclick = ()=>alert(e.notes||'No notes');
            li.querySelector('.edit-expense').onclick   = () => editExpense(d, i);
            li.querySelector('.remove-expense').onclick = async evt => {
                await fetch(`/api/budget/expense/${evt.target.dataset.idx}`,{method:'DELETE'});
                fetchAndRender();
            };
            expL.appendChild(li);
        });
    });

    const fc = document.getElementById('filter-category');
    if (fc.options.length===1) {
        const cats = [...new Set(d.expenses.map(x=>x.category))];
        cats.forEach(c => {
            const o = document.createElement('option');
            o.value = o.textContent = c;
            fc.appendChild(o);
        });
    }
}

function editIncome() {
    const d = window.__lastDashboardData;
    const naI = prompt('New income amount:', d.monthlyIncome.toFixed(2));
    if (naI===null) return;
    const na = parseFloat(naI);
    if (isNaN(na)||na<=0) return alert('Must be positive');
    const nf = prompt('Frequency:','monthly');
    if (nf===null) return;
    const nd = prompt('Date (YYYY-MM-DD):', d.incomeDate);
    if (nd===null) return;

    fetch('/api/budget/income',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ amount:na, frequency:nf, date:nd })
    }).then(fetchAndRender);
}

function editExpense(d, idx) {
    const e = d.expenses[idx];
    const nc = prompt('New category:', e.category);
    if (nc===null) return;
    const naI = prompt('New amount:', e.amount);
    if (naI===null) return;
    const na = parseFloat(naI);
    if (isNaN(na)||na<=0) return alert('Must be positive');
    const nn = prompt('Notes:', e.notes||'') || '';
    const nd = prompt('Date (YYYY-MM-DD):', e.date);
    if (nd===null) return;

    fetch(`/api/budget/expense/${idx}`,{method:'DELETE'})
        .then(()=>
            fetch('/api/budget/expense',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ category:nc, amount:na, notes:nn, date:nd })
            })
        )
        .then(fetchAndRender);
}

function showAlert(rem) {
    document.getElementById('budget-alert')
        .style.display = rem < 0 ? 'block' : 'none';
}

function getCurrency() {
    return JSON.parse(localStorage.getItem('settings')||'{}').currency || '$';
}

function applyFilters() {
    const d = window.__lastDashboardData;
    if (!d) return;
    let ex = d.expenses;
    const s = document.getElementById('filter-start').value;
    const e = document.getElementById('filter-end').value;
    const c = document.getElementById('filter-category').value;
    if (s) ex = ex.filter(x=>x.date>=s);
    if (e) ex = ex.filter(x=>x.date<=e);
    if (c) ex = ex.filter(x=>x.category===c);
    renderAll(d, ex);
}
function resetFilters() {
    ['filter-start','filter-end','filter-category'].forEach(id=>{
        document.getElementById(id).value = '';
    });
    const d = window.__lastDashboardData;
    if (d) renderAll(d, d.expenses);
}

window.addEventListener('DOMContentLoaded', () => {
    fetchAndRender();
    document.getElementById('apply-filters').onclick = applyFilters;
    document.getElementById('reset-filters').onclick = resetFilters;
});
