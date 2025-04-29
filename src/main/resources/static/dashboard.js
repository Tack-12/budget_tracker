// track last fetch for export
window.__lastDashboardData = null;

async function loadDashboard() {
    try {
        const res = await fetch('/api/budget/summary');
        const data = await res.json();
        if (data.error) { alert(data.error); return; }

        window.__lastDashboardData = data;

        // filters
        let expenses = data.expenses;
        const start = document.getElementById('filter-start').value;
        const end   = document.getElementById('filter-end').value;
        const cat   = document.getElementById('filter-category').value;
        if (start)   expenses = expenses.filter(e => e.date >= start);
        if (end)     expenses = expenses.filter(e => e.date <= end);
        if (cat)     expenses = expenses.filter(e => e.category === cat);

        renderCharts({ ...data, expenses });
        renderCards(data);
        renderLists(data, expenses);
        showAlert(data.remainingBudget);
    } catch(err) {
        console.error(err);
    }
}

function renderCards(data) {
    document.getElementById('income-value').textContent =
        `${getCurrency()}${data.monthlyIncome.toFixed(2)} — ${data.incomeDate}`;
    document.getElementById('expenses-value').textContent =
        `${getCurrency()}${data.totalExpenses.toFixed(2)}`;
    document.getElementById('remaining-value').textContent =
        `${getCurrency()}${data.remainingBudget.toFixed(2)}`;
}

function renderCharts(data) {
    const pieCtx  = document.getElementById('pie-chart').getContext('2d');
    const histCtx = document.getElementById('histogram-chart').getContext('2d');

    const totals = data.expenses.reduce((a,e) => {
        a[e.category] = (a[e.category]||0) + e.amount; return a;
    }, {});
    const pieLabels = Object.keys(totals);
    const pieData   = Object.values(totals);
    const histData  = data.expenses.map(e=>e.amount);
    const histLabels= histData.map((_,i)=>`#${i+1}`);

    new Chart(pieCtx, {
        type: 'pie',
        data: { labels: pieLabels, datasets: [{ data: pieData }] }
    });
    new Chart(histCtx, {
        type: 'bar',
        data: { labels: histLabels, datasets: [{ data: histData, label: 'Amount' }] },
        options: { scales: { y: { beginAtZero:true } } }
    });

    // breakdown list
    const breakdown = document.getElementById('category-breakdown');
    breakdown.innerHTML = '';
    pieLabels.forEach((c,i) => {
        const li = document.createElement('li');
        li.textContent = `${c}: ${getCurrency()}${pieData[i].toFixed(2)}`;
        breakdown.appendChild(li);
    });
}

function renderLists(data, expenses) {
    // income list
    const incList = document.getElementById('income-list');
    incList.innerHTML = `
    <li>
      <span class="exp-item">
        Income — ${getCurrency()}${data.monthlyIncome.toFixed(2)} — ${data.incomeDate}
      </span>
      <button class="edit-income">✎</button>
      <button class="remove-income">×</button>
    </li>`;
    incList.querySelector('.edit-income').onclick = async () => {
        const oldAmt = data.monthlyIncome.toFixed(2);
        const newAmtI = prompt('New income:', oldAmt);
        if (newAmtI===null) return;
        const newAmt = parseFloat(newAmtI);
        if (isNaN(newAmt)||newAmt<=0) return alert('Positive number required');
        const newFreq = prompt('Frequency:', 'monthly');
        if (newFreq===null) return;
        const newDate = prompt('Date (YYYY-MM-DD):', data.incomeDate);
        if (newDate===null) return;
        await fetch('/api/budget/income', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ amount:newAmt, frequency:newFreq, date:newDate })
        });
        loadDashboard();
    };
    incList.querySelector('.remove-income').onclick = async () => {
        await fetch('/api/budget/income',{method:'DELETE'});
        loadDashboard();
    };

    // expense list
    const expList = document.getElementById('expense-list');
    expList.innerHTML = '';
    const grouped = expenses.reduce((a,e,i)=>{
        (a[e.category]=a[e.category]||[]).push({e,i}); return a;
    },{});
    Object.entries(grouped).forEach(([cat,items])=>{
        const header = document.createElement('div');
        header.className='expense-category-header';
        header.textContent=cat;
        expList.appendChild(header);
        items.forEach(({e,i})=>{
            const li=document.createElement('li');
            li.innerHTML=`
        <span class="exp-item">
          ${getCurrency()}${e.amount.toFixed(2)} — ${e.date}
        </span>
        <button data-idx="${i}" class="edit-expense">✎</button>
        <button data-idx="${i}" class="remove-expense">×</button>
      `;
            li.querySelector('.exp-item').onclick=()=>alert(e.notes||'No notes');
            li.querySelector('.edit-expense').onclick=async evt=>{
                const idx=evt.target.dataset.idx;
                const exp=data.expenses[idx];
                const nc=prompt('Category:',exp.category);
                if(nc===null) return;
                const naI=prompt('Amount:',exp.amount);
                if(naI===null) return;
                const na=parseFloat(naI);
                if(isNaN(na)||na<=0) return alert('Positive number required');
                const nn=prompt('Notes:',exp.notes)||'';
                const nd=prompt('Date:',exp.date);
                if(nd===null) return;
                await fetch(`/api/budget/expense/${idx}`,{method:'DELETE'});
                await fetch('/api/budget/expense',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({
                        category:nc, amount:na, notes:nn, date:nd
                    })
                });
                loadDashboard();
            };
            li.querySelector('.remove-expense').onclick=async evt=>{
                await fetch(`/api/budget/expense/${evt.target.dataset.idx}`,{method:'DELETE'});
                loadDashboard();
            };
            expList.appendChild(li);
        });
    });

    // populate category filter once
    const sel=document.getElementById('filter-category');
    if(sel.options.length===1) {
        const cats=[...new Set(data.expenses.map(e=>e.category))];
        cats.forEach(c=>{
            const o=document.createElement('option');
            o.value=o.textContent=c;
            sel.appendChild(o);
        });
    }
}

function showAlert(rem) {
    document.getElementById('budget-alert')
        .style.display = rem<0 ? 'block':'none';
}

function getCurrency() {
    return (JSON.parse(localStorage.getItem('settings')||'{}').currency)||'$';
}

// exports
document.getElementById('export-csv').onclick = () => {
    const D = window.__lastDashboardData;
    if(!D) return;
    let csv='Type,Category,Amount,Date,Notes\n';
    csv+=`Income,,${D.monthlyIncome},${D.incomeDate},\n`;
    D.expenses.forEach(e=>{
        csv+=`Expense,${e.category},${e.amount},${e.date},"${e.notes||''}"\n`;
    });
    downloadBlob(csv,'budget_export.csv','text/csv');
};
document.getElementById('export-json').onclick = () => {
    const D = window.__lastDashboardData;
    if(!D) return;
    downloadBlob(JSON.stringify(D,null,2),'budget_export.json','application/json');
};
function downloadBlob(content,name,type) {
    const blob=new Blob([content],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=name; a.click();
    URL.revokeObjectURL(url);
}

// filter buttons
document.getElementById('apply-filters').onclick = loadDashboard;
document.getElementById('reset-filters').onclick = () => {
    ['filter-start','filter-end','filter-category'].forEach(id=>{
        document.getElementById(id).value='';
    });
    loadDashboard();
};

window.addEventListener('DOMContentLoaded', loadDashboard);
