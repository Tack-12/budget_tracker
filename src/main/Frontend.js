// budget-tracker.js

document.body.style.fontFamily = 'Arial, sans-serif';
document.body.style.padding = '20px';

const title = document.createElement('h1');
title.textContent = 'Budget Tracker';
document.body.appendChild(title);

// Form
const form = document.createElement('form');

const descInput = document.createElement('input');
descInput.type = 'text';
descInput.placeholder = 'Description';
descInput.required = true;

const amountInput = document.createElement('input');
amountInput.type = 'number';
amountInput.placeholder = 'Amount';
amountInput.required = true;

const submitBtn = document.createElement('button');
submitBtn.type = 'submit';
submitBtn.textContent = 'Add';

form.appendChild(descInput);
form.appendChild(amountInput);
form.appendChild(submitBtn);
document.body.appendChild(form);

// List for transactions
const list = document.createElement('ul');
document.body.appendChild(list);

// Submit handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = descInput.value;
    const amount = parseFloat(amountInput.value);

    if (!description || isNaN(amount)) return;

    const response = await fetch('http://localhost:8080/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount }),
    });

    const data = await response.json();

    const item = document.createElement('li');
    item.textContent = `${data.description}: $${data.amount}`;
    list.appendChild(item);

    form.reset();
});
