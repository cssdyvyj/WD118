let sum = 0;
const form = document.getElementById('frm');

function colorCategory(category) {
    if (category === "food") {
        return "red";
    }
    if (category === "transport") {
        return "blue";
    }
    if (category === "bills") {
        return "green";
    }
    if (category === "others") {
        return "yellow";
    }
    return "white";
}

function addTotal(amount) {
    sum += amount;
    document.getElementById('totalExp').textContent = "Total Expense: " + sum.toFixed(2) + " PHP";
}

form.addEventListener('submit', function(e) {
    const name = document.getElementById('name').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value; 

    e.preventDefault();
    const list = document.createElement('li');
    list.textContent = category + ": " + name + " - " + amount.toFixed(2) + " PHP";
    list.style.borderLeft = "5px solid " + colorCategory(category);

    addTotal(amount);

    c.appendChild(list);
});





































