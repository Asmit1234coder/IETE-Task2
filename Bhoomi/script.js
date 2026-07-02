let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Save data
function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Add Transaction
function addTransaction(type) {

    const amount = Number(document.getElementById("amount").value);
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;

    if (amount <= 0 || description === "" || category === "") {
        alert("Please fill all fields.");
        return;
    }

    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        description: description,
        category: category,
        date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    };

    transactions.push(transaction);

    saveData();
    renderTransactions();

    // Clear Inputs
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";
    document.getElementById("category").value = "";
}

// Delete Transaction
function deleteTransaction(id) {

    transactions = transactions.filter(item => item.id !== id);

    saveData();

    renderTransactions();
}

// Clear All
function clearAll() {

    if (transactions.length === 0) {
        alert("No transactions available.");
        return;
    }

    if (confirm("Are you sure you want to delete all transactions?")) {

        transactions = [];

        saveData();

        renderTransactions();
    }
}

// Render
function renderTransactions() {

    const list = document.getElementById("transactionList");

    list.innerHTML = "";

    let income = 0;
    let expense = 0;

    if (transactions.length === 0) {

        list.innerHTML = `
            <p class="empty">
                No transactions yet. Start by adding income or expenses.
            </p>
        `;

    }

    transactions.forEach(item => {

        if (item.type === "income") {
            income += item.amount;
        } else {
            expense += item.amount;
        }

        const li = document.createElement("li");

        li.className = `transaction-item ${item.type}`;

        li.innerHTML = `

            <div class="transaction-details">

                <h4>${item.description}</h4>

                <p>${item.category} • ${item.date}</p>

            </div>

            <div class="transaction-right">

                <div class="transaction-amount">

                    ${item.type === "income" ? "+" : "-"} ₹${item.amount.toLocaleString("en-IN")}

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${item.id})">

                    Delete

                </button>

            </div>

        `;

        list.appendChild(li);

    });

    document.getElementById("income").innerText =
        "₹" + income.toLocaleString("en-IN", {
            minimumFractionDigits: 2
        });

    document.getElementById("expense").innerText =
        "₹" + expense.toLocaleString("en-IN", {
            minimumFractionDigits: 2
        });

    document.getElementById("balance").innerText =
        "₹" + (income - expense).toLocaleString("en-IN", {
            minimumFractionDigits: 2
        });
}

// Initial Render
renderTransactions();

