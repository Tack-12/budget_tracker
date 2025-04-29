window.addEventListener('DOMContentLoaded', () => {
    const catSel   = document.getElementById('rec-cat');
    const dateInput= document.getElementById('rec-date');
    dateInput.value = new Date().toISOString().split('T')[0];

    // populate categories
    fetch('/api/budget/summary')
        .then(r=>r.json())
        .then(d=>{
            [...new Set(d.expenses.map(e=>e.category))].forEach(c=>{
                const o=document.createElement('option');
                o.value=o.textContent=c;
                catSel.appendChild(o);
            });
        }).catch(()=>{});

    document.getElementById('rec-add').onclick = async () => {
        const payload = {
            category:    catSel.value,
            amount:      parseFloat(document.getElementById('rec-amt').value),
            notes:       document.getElementById('rec-notes').value.trim(),
            frequency:   document.getElementById('rec-freq').value,
            lastApplied: dateInput.value
        };
        await fetch('/api/budget/recurring', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(payload)
        });
        loadList();
    };

    async function loadList() {
        const res = await fetch('/api/budget/recurring');
        const d   = await res.json();
        const list= document.getElementById('rec-list');
        list.innerHTML = '';
        d.recurrings.forEach((r,i)=>{
            const li=document.createElement('li');
            li.innerHTML=`
        <span>${r.category} — ${getCurrency()}${r.amount.toFixed(2)} — last: ${r.lastApplied}</span>
        <button data-idx="${i}" class="remove-rec">×</button>
      `;
            li.querySelector('.remove-rec').onclick=async evt=>{
                await fetch(`/api/budget/recurring/${evt.target.dataset.idx}`,{method:'DELETE'});
                loadList();
            };
            list.appendChild(li);
        });
    }

    loadList();
});

function getCurrency() {
    return (JSON.parse(localStorage.getItem('settings')||'{}').currency) || '$';
}
