/*====================================================
                AUTH CHECK
====================================================*/

const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {

    window.location.href = "index.html";

}

const welcomeUser = document.querySelector("#welcomeUser");

if (welcomeUser) {

    welcomeUser.textContent = `👋 Welcome, ${currentUser}`;

}

/*====================================================
                DOM ELEMENTS
====================================================*/

const transactionForm = document.querySelector("#transactionForm");

const descriptionInput = document.querySelector("#description");

const amountInput = document.querySelector("#amount");

const categorySelect = document.querySelector("#category");

const typeSelect = document.querySelector("#type");

const dateInput = document.querySelector("#date");

const searchInput = document.querySelector("#search");

const filterType = document.querySelector("#filterType");

const filterCategory = document.querySelector("#filterCategory");

const transactionList = document.querySelector("#transactionList");

const balance = document.querySelector("#balance");

const income = document.querySelector("#income");

const expense = document.querySelector("#expense");

const themeBtn = document.querySelector(".theme-btn");

/*====================================================
                GLOBAL VARIABLES
====================================================*/

let transactions = [];

let editId = null;

const budgetInput = document.querySelector("#budgetInput");

const saveBudgetBtn = document.querySelector("#saveBudget");

const budgetBar = document.querySelector("#budgetBar");

const budgetText = document.querySelector("#budgetText");

const savingsCard = document.querySelector("#savingsCard");

const biggestExpenseCard = document.querySelector("#biggestExpenseCard");

const totalTransactionCard = document.querySelector("#totalTransactionCard");

const recentTransactions = document.querySelector("#recentTransactions");


/*====================================================
                INITIALIZE
====================================================*/

dateInput.valueAsDate = new Date();


function init() {
    loadFromLocalStorage();
    
    renderTransactions(getFilteredTransactions());
    
    updateSummary();
    
    initializeTheme();
    
    initializeCharts();

    updateStatisticsDashboard();
}


/*====================================================
                EVENTS
====================================================*/

transactionForm.addEventListener("submit", handleTransaction);

searchInput.addEventListener("input", () =>
  renderTransactions(getFilteredTransactions()),
);

filterType.addEventListener("change", () =>
  renderTransactions(getFilteredTransactions()),
);

filterCategory.addEventListener("change", () =>
  renderTransactions(getFilteredTransactions()),
);

themeBtn.addEventListener("click", toggleTheme);

/*====================================================
            ADD / UPDATE TRANSACTION
====================================================*/

function handleTransaction(e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();

  const amount = Number(amountInput.value);

  const category = categorySelect.value;

  const type = typeSelect.value;

  const date = dateInput.value;

  if (description === "" || amount <= 0 || category === "" || date === "") {
    alert("Please fill all fields.");

    return;
  }

  const transaction = {
    id: editId ?? Date.now(),

    description,

    amount,

    category,

    type,

    date,
  };

  if (editId !== null) {
    transactions = transactions.map((item) =>
      item.id === editId ? transaction : item,
    );

    sortTransactions();

    editId = null;

    document.querySelector(".add-btn").innerHTML = `
            <i class="fa-solid fa-plus"></i>
            Add Transaction
        `;
  } else {
    transactions.push(transaction);
    sortTransactions();
  }

  saveToLocalStorage();

  renderTransactions(getFilteredTransactions());

  updateSummary();

  updateCharts();

  updateBudget();

  updateStatisticsDashboard();

  dashboardReport();

  transactionForm.reset();

  dateInput.valueAsDate = new Date();
  console.log("Transaction Added");
}

/*====================================================
                RENDER TRANSACTIONS
====================================================*/

function renderTransactions(list = transactions) {
  transactionList.innerHTML = "";

  if (list.length === 0) {
    transactionList.innerHTML = `
            <li class="empty">
                No Transactions Yet
            </li>
        `;

    return;
  }

  list.forEach((transaction) => {
    const li = document.createElement("li");

    li.className = `transaction ${transaction.type}`;

    li.innerHTML = `

            <div class="transaction-info">

                <h3 class="transaction-title">

                    ${transaction.description}

                </h3>

                <div class="transaction-meta">

                    <span>

                        <i class="fa-solid fa-layer-group"></i>

                        ${transaction.category}

                    </span>

                    <span>

                        <i class="fa-solid fa-calendar"></i>

                        ${transaction.date}

                    </span>

                </div>

            </div>



            <div class="amount ${transaction.type}">

                ${transaction.type === "income" ? "+" : "-"}

                ₹${transaction.amount.toLocaleString("en-IN")}

            </div>



            <div class="action-buttons">

                <button
                    class="edit-btn"
                    onclick="editTransaction(${transaction.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>



                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        `;

    transactionList.appendChild(li);
  });
}

/*====================================================
                UPDATE SUMMARY
====================================================*/

function updateSummary() {
  const totalIncome = transactions

    .filter((item) => item.type === "income")

    .reduce(
      (total, item) => total + item.amount,

      0,
    );

  const totalExpense = transactions

    .filter((item) => item.type === "expense")

    .reduce(
      (total, item) => total + item.amount,

      0,
    );

  const totalBalance = totalIncome - totalExpense;

  income.textContent = `₹${totalIncome.toLocaleString("en-IN")}`;

  expense.textContent = `₹${totalExpense.toLocaleString("en-IN")}`;

  balance.textContent = `₹${totalBalance.toLocaleString("en-IN")}`;
}

/*====================================================
                DELETE TRANSACTION
====================================================*/

function deleteTransaction(id) {
  const confirmDelete = confirm("Delete this transaction?");

  if (!confirmDelete) {
    return;
  }

  transactions = transactions.filter((item) => {
    return item.id !== id;
  });

  saveToLocalStorage();

  renderTransactions(getFilteredTransactions());

  updateSummary();
  updateCharts();

  updateBudget();
  updateStatisticsDashboard();

  dashboardReport();

}

/*====================================================
                EDIT TRANSACTION
====================================================*/

function editTransaction(id) {
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction) return;

  descriptionInput.value = transaction.description;

  amountInput.value = transaction.amount;

  categorySelect.value = transaction.category;

  typeSelect.value = transaction.type;

  dateInput.value = transaction.date;

  editId = id;

  document.querySelector(".add-btn").innerHTML = `
        <i class="fa-solid fa-pen"></i>
        Update Transaction
    `;

  descriptionInput.focus();
}

/*====================================================
                LOCAL STORAGE
====================================================*/

function saveToLocalStorage() {
  localStorage.setItem("fintrackTransactions", JSON.stringify(transactions));
}

function loadFromLocalStorage() {
  const storedData = localStorage.getItem("fintrackTransactions");

  transactions = storedData ? JSON.parse(storedData) : [];
}

/*====================================================
                SEARCH + FILTER
====================================================*/

function getFilteredTransactions() {
  const searchValue = searchInput.value.trim().toLowerCase();

  const selectedType = filterType.value;

  const selectedCategory = filterCategory.value;

  return transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchValue);

    const matchesType =
      selectedType === "all" || transaction.type === selectedType;

    const matchesCategory =
      selectedCategory === "all" || transaction.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });
}

/*====================================================
                DARK MODE
====================================================*/

function toggleTheme() {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  localStorage.setItem("fintrackTheme", isDark ? "dark" : "light");

  themeBtn.innerHTML = isDark
    ? `<i class="fa-solid fa-sun"></i>`
    : `<i class="fa-solid fa-moon"></i>`;
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("fintrackTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");

    themeBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
  } else {
    document.body.classList.remove("dark");

    themeBtn.innerHTML = `<i class="fa-solid fa-moon"></i>`;
  }
}

/*====================================================
                CHART PLACEHOLDERS
====================================================*/

let monthlyChart = null;

let expenseChart = null;

function initializeCharts() {
  // Next Chunk
}

function updateCharts() {
  // Next Chunk
}

/*====================================================
                INITIALIZE CHARTS
====================================================*/

function initializeCharts() {
  const monthlyCanvas = document.getElementById("monthlyChart");

  const expenseCanvas = document.getElementById("expenseChart");

  if (!monthlyCanvas || !expenseCanvas) return;

  monthlyChart = new Chart(monthlyCanvas, {
    type: "bar",

    data: {
      labels: ["Income", "Expense"],

      datasets: [
        {
          label: "Amount (₹)",

          data: [0, 0],

          backgroundColor: ["#22c55e", "#ef4444"],

          borderRadius: 8,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });

  expenseChart = new Chart(expenseCanvas, {
    type: "doughnut",

    data: {
      labels: ["No Expense"],

      datasets: [
        {
          data: [1],

          backgroundColor: ["#d1d5db"],
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,
    },
  });

  updateCharts();
}

/*====================================================
                UPDATE CHARTS
====================================================*/

function updateCharts() {
  if (!monthlyChart || !expenseChart) return;

  const totalIncome = transactions

    .filter((item) => item.type === "income")

    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions

    .filter((item) => item.type === "expense")

    .reduce((sum, item) => sum + item.amount, 0);

  monthlyChart.data.datasets[0].data = [totalIncome, totalExpense];

  monthlyChart.update();

  const categoryTotals = {};

  transactions

    .filter((item) => item.type === "expense")

    .forEach((item) => {
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + item.amount;
    });

  const labels = Object.keys(categoryTotals);

  const values = Object.values(categoryTotals);

  const colors = [
    "#ef4444",

    "#f97316",

    "#eab308",

    "#22c55e",

    "#06b6d4",

    "#3b82f6",

    "#8b5cf6",

    "#ec4899",

    "#14b8a6",

    "#84cc16",
  ];

  if (labels.length === 0) {
    expenseChart.data.labels = ["No Expense"];

    expenseChart.data.datasets[0].data = [1];

    expenseChart.data.datasets[0].backgroundColor = ["#d1d5db"];
  } else {
    expenseChart.data.labels = labels;

    expenseChart.data.datasets[0].data = values;

    expenseChart.data.datasets[0].backgroundColor = colors.slice(
      0,
      labels.length,
    );
  }

  expenseChart.update();
}

/*====================================================
                SORT TRANSACTIONS
====================================================*/

function sortTransactions() {
  transactions.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
}

/*====================================================
                TOAST MESSAGE
====================================================*/

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;

  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}

/*====================================================
                EXPORT CSV
====================================================*/

function exportCSV() {
  if (transactions.length === 0) {
    alert("No transactions found.");

    return;
  }

  let csv = "Description,Amount,Category,Type,Date\n";

  transactions.forEach((item) => {
    csv +=
      `"${item.description}",` +
      `${item.amount},` +
      `"${item.category}",` +
      `"${item.type}",` +
      `"${item.date}"\n`;
  });

  const blob = new Blob(
    [csv],

    {
      type: "text/csv",
    },
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "FinTrack-Pro.csv";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/*====================================================
                KEYBOARD SHORTCUTS
====================================================*/

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    transactionForm.reset();

    editId = null;
  }

  if (e.ctrlKey && e.key.toLowerCase() === "s") {
    e.preventDefault();

    exportCSV();
  }
});

/*====================================================
                AUTO SORT
====================================================*/

sortTransactions();

/*====================================================
                MONTHLY REPORT
====================================================*/

function getCurrentMonthReport() {

    const now = new Date();

    const month = now.getMonth();

    const year = now.getFullYear();



    const monthlyTransactions = transactions.filter(item => {

        const date = new Date(item.date);

        return (

            date.getMonth() === month &&

            date.getFullYear() === year

        );

    });



    const income = monthlyTransactions

        .filter(item => item.type === "income")

        .reduce((sum, item) => sum + item.amount, 0);



    const expense = monthlyTransactions

        .filter(item => item.type === "expense")

        .reduce((sum, item) => sum + item.amount, 0);



    return {

        income,

        expense,

        balance: income - expense,

        totalTransactions: monthlyTransactions.length

    };

}



/*====================================================
                TOP EXPENSE CATEGORY
====================================================*/

function getTopExpenseCategory() {

    const categories = {};



    transactions

        .filter(item => item.type === "expense")

        .forEach(item => {

            categories[item.category] =

                (categories[item.category] || 0)

                + item.amount;

        });



    let topCategory = "";

    let highest = 0;



    for (const category in categories) {

        if (categories[category] > highest) {

            highest = categories[category];

            topCategory = category;

        }

    }



    return {

        category: topCategory,

        amount: highest

    };

}



/*====================================================
                TOTAL STATISTICS
====================================================*/

function getStatistics() {

    const incomeCount = transactions.filter(

        item => item.type === "income"

    ).length;



    const expenseCount = transactions.filter(

        item => item.type === "expense"

    ).length;



    return {

        total: transactions.length,

        income: incomeCount,

        expense: expenseCount

    };

}



/*====================================================
                DEBUG FUNCTIONS
====================================================*/

function printStatistics() {

    console.table(

        getStatistics()

    );



    console.table(

        getCurrentMonthReport()

    );



    console.table(

        getTopExpenseCategory()

    );

}



/*====================================================
                APP READY
====================================================*/

console.log(

    "%cFinTrack Pro Loaded Successfully",

    "color:#22c55e;font-size:16px;font-weight:bold"

);


/*====================================================
                CLEAR ALL DATA
====================================================*/

function clearAllTransactions() {

    if (transactions.length === 0) {

        showToast("No transactions found.", "error");

        return;

    }

    const confirmClear = confirm(
        "Delete all transactions?"
    );

    if (!confirmClear) return;

    transactions = [];

    saveToLocalStorage();

    renderTransactions();

    updateSummary();

    updateCharts();

    showToast("All transactions deleted.");

}



/*====================================================
                TOTAL SAVINGS
====================================================*/

function getSavings() {

    const totalIncome = transactions

        .filter(item => item.type === "income")

        .reduce((sum, item) => sum + item.amount, 0);



    const totalExpense = transactions

        .filter(item => item.type === "expense")

        .reduce((sum, item) => sum + item.amount, 0);



    return totalIncome - totalExpense;

}



/*====================================================
                LAST TRANSACTION
====================================================*/

function getLastTransaction() {

    if (transactions.length === 0) {

        return null;

    }

    return transactions[transactions.length - 1];

}



/*====================================================
                FORMAT DATE
====================================================*/

function formatDate(date) {

    return new Date(date).toLocaleDateString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}



/*====================================================
                FORMAT CURRENCY
====================================================*/

function formatCurrency(amount) {

    const settings = JSON.parse(

        localStorage.getItem(

`userSettings_${currentUser}`

)

    ) || {

        currency:"INR"

    };



    const symbols = {

        INR:"₹",

        USD:"$",

        EUR:"€",

        GBP:"£",

        JPY:"¥"

    };



    return `${symbols[settings.currency]}${amount.toLocaleString("en-IN")}`;

}



/*====================================================
                RESET FORM
====================================================*/

function resetForm() {

    transactionForm.reset();

    editId = null;

    dateInput.valueAsDate = new Date();

    document.querySelector(".add-btn").innerHTML = `

        <i class="fa-solid fa-plus"></i>

        Add Transaction

    `;

}



/*====================================================
                HELPERS
====================================================*/

function totalIncome() {

    return transactions

        .filter(item => item.type === "income")

        .reduce((sum, item) => sum + item.amount, 0);

}



function totalExpense() {

    return transactions

        .filter(item => item.type === "expense")

        .reduce((sum, item) => sum + item.amount, 0);

}



/*====================================================
                VERSION
====================================================*/

const APP_NAME = "FinTrack Pro";

const APP_VERSION = "1.0.0";

console.log(

    `${APP_NAME} v${APP_VERSION}`

);


/*====================================================
                TRANSACTION INSIGHTS
====================================================*/

function getTransactionInsights() {

    if (transactions.length === 0) {

        return {

            totalTransactions: 0,

            averageIncome: 0,

            averageExpense: 0,

            highestIncome: 0,

            highestExpense: 0

        };

    }



    const incomes = transactions.filter(

        item => item.type === "income"

    );



    const expenses = transactions.filter(

        item => item.type === "expense"

    );



    const averageIncome = incomes.length

        ? incomes.reduce((sum, item) => sum + item.amount, 0) / incomes.length

        : 0;



    const averageExpense = expenses.length

        ? expenses.reduce((sum, item) => sum + item.amount, 0) / expenses.length

        : 0;



    const highestIncome = incomes.length

        ? Math.max(...incomes.map(item => item.amount))

        : 0;



    const highestExpense = expenses.length

        ? Math.max(...expenses.map(item => item.amount))

        : 0;



    return {

        totalTransactions: transactions.length,

        averageIncome,

        averageExpense,

        highestIncome,

        highestExpense

    };

}



/*====================================================
                CATEGORY SUMMARY
====================================================*/

function getCategorySummary() {

    const summary = {};



    transactions.forEach(item => {

        if (!summary[item.category]) {

            summary[item.category] = {

                income: 0,

                expense: 0

            };

        }



        if (item.type === "income") {

            summary[item.category].income += item.amount;

        }

        else {

            summary[item.category].expense += item.amount;

        }

    });



    return summary;

}



/*====================================================
                PRINT REPORT
====================================================*/

function printFullReport() {

    console.group(

        "========== FinTrack Pro Report =========="

    );



    console.table(

        getStatistics()

    );



    console.table(

        getCurrentMonthReport()

    );



    console.table(

        getCategorySummary()

    );



    console.table(

        getTransactionInsights()

    );



    console.groupEnd();

}



/*====================================================
                GLOBAL ACCESS
====================================================*/

window.printFullReport = printFullReport;
window.exportCSV = exportCSV;



console.log(

    "Type printFullReport() in Console to view analytics."

);

init();


/*====================================================
                BUDGET GOAL
====================================================*/



let monthlyBudget = Number(

    localStorage.getItem("monthlyBudget")

) || 0;



if (budgetInput) {

    budgetInput.value =

        monthlyBudget || "";

}



updateBudget();



if (saveBudgetBtn) {

    saveBudgetBtn.addEventListener(

        "click",

        saveBudget

    );

}



function saveBudget() {

    const value = Number(

        budgetInput.value

    );



    if (value <= 0) {

        showToast(

            "Enter valid budget",

            "error"

        );

        return;

    }



    monthlyBudget = value;



    localStorage.setItem(

        "monthlyBudget",

        monthlyBudget

    );



    updateBudget();



    showToast(

        "Budget Saved"

    );

}



/*====================================================
                UPDATE BUDGET
====================================================*/

function updateBudget() {

    if (

        !budgetBar ||

        !budgetText

    ) {

        return;

    }



    if (

        monthlyBudget === 0

    ) {

        budgetBar.style.width = "0%";



        budgetText.textContent =

            "No Budget Set";



        return;

    }



    const spent = totalExpense();



    let percentage =

        (spent / monthlyBudget) * 100;



    if (

        percentage > 100

    ) {

        percentage = 100;

    }



    budgetBar.style.width =

        percentage + "%";



    if (

        spent > monthlyBudget

    ) {

        budgetBar.style.background =

            "#ef4444";



        budgetText.textContent =

            `Budget Exceeded by ₹${(

                spent - monthlyBudget

            ).toLocaleString("en-IN")}`;

    }

    else {

        budgetBar.style.background =

            "#22c55e";



        budgetText.textContent =

            `₹${spent.toLocaleString("en-IN")} / ₹${monthlyBudget.toLocaleString("en-IN")}`;

    }

}



/*====================================================
                BUDGET UTILITIES
====================================================*/

function getRemainingBudget() {

    if (monthlyBudget === 0) {

        return 0;

    }

    return monthlyBudget - totalExpense();

}



function getBudgetPercentage() {

    if (monthlyBudget === 0) {

        return 0;

    }

    return Math.round(

        (totalExpense() / monthlyBudget) * 100

    );

}



/*====================================================
                BUDGET WARNING
====================================================*/

function checkBudgetWarning() {

    if (monthlyBudget === 0) {

        return;

    }



    const percentage = getBudgetPercentage();



    if (

        percentage >= 80 &&

        percentage < 100

    ) {

        showToast(

            "Warning! You have used 80% of your budget.",

            "warning"

        );

    }



    if (

        percentage >= 100

    ) {

        showToast(

            "Budget Limit Exceeded!",

            "error"

        );

    }

}



/*====================================================
                RESET BUDGET
====================================================*/

function resetBudget() {

    monthlyBudget = 0;

    localStorage.removeItem(

        "monthlyBudget"

    );



    if (budgetInput) {

        budgetInput.value = "";

    }



    updateBudget();



    showToast(

        "Budget Reset Successfully"

    );

}



/*====================================================
                BUDGET INFO
====================================================*/

function printBudgetDetails() {

    console.table({

        Budget: monthlyBudget,

        Expense: totalExpense(),

        Remaining: getRemainingBudget(),

        Used: getBudgetPercentage() + "%"

    });

}


/*====================================================
            RECENT TRANSACTIONS
====================================================*/

function getRecentTransactions(limit = 5) {

    return [...transactions]

        .sort((a, b) => b.id - a.id)

        .slice(0, limit);

}



/*====================================================
            MONTHLY INCOME / EXPENSE
====================================================*/

function getMonthlySummary(month = new Date().getMonth()) {

    const summary = {

        income: 0,

        expense: 0

    };



    transactions.forEach(item => {

        const itemMonth = new Date(item.date).getMonth();

        if (itemMonth !== month) return;



        if (item.type === "income") {

            summary.income += item.amount;

        } else {

            summary.expense += item.amount;

        }

    });



    return summary;

}



/*====================================================
            MONTHLY SAVINGS
====================================================*/

function getMonthlySavings() {

    const summary = getMonthlySummary();

    return summary.income - summary.expense;

}



/*====================================================
            BIGGEST TRANSACTION
====================================================*/

function getBiggestTransaction() {

    if (transactions.length === 0) return null;



    return transactions.reduce((largest, current) => {

        return current.amount > largest.amount

            ? current

            : largest;

    });

}



/*====================================================
            QUICK REPORT
====================================================*/

function quickReport() {

    console.clear();



    console.log("========== FinTrack Report ==========");

    console.log(

        "Transactions :",

        transactions.length

    );



    console.log(

        "Savings :",

        formatCurrency(

            getSavings()

        )

    );



    console.log(

        "Monthly Savings :",

        formatCurrency(

            getMonthlySavings()

        )

    );



    console.log(

        "Recent :",

        getRecentTransactions()

    );



    console.log(

        "Biggest :",

        getBiggestTransaction()

    );

}

/*====================================================
        UPDATE STATISTICS DASHBOARD
====================================================*/




function updateStatisticsDashboard() {

    if (

        !savingsCard ||

        !biggestExpenseCard ||

        !totalTransactionCard ||

        !recentTransactions

    ) {

        return;

    }



    savingsCard.textContent =

        formatCurrency(

            getSavings()

        );



    const biggest = transactions

        .filter(item => item.type === "expense")

        .sort((a, b) => b.amount - a.amount)[0];



    biggestExpenseCard.textContent =

        biggest

            ? formatCurrency(biggest.amount)

            : "₹0";



    totalTransactionCard.textContent =

        transactions.length;



    recentTransactions.innerHTML = "";



    const latest = getRecentTransactions();



    if (latest.length === 0) {

        recentTransactions.innerHTML = `

            <li>

                No Recent Transactions

            </li>

        `;

        return;

    }



    latest.forEach(item => {

        const li = document.createElement("li");



        li.innerHTML = `

            <span>

                ${item.description}

            </span>

            <strong>

                ${formatCurrency(item.amount)}

            </strong>

        `;



        recentTransactions.appendChild(li);

    });

}



/*====================================================
            TRANSACTION ANALYTICS
====================================================*/

function getTransactionAnalytics() {

    const analytics = {

        totalIncome: 0,

        totalExpense: 0,

        incomeCount: 0,

        expenseCount: 0

    };



    transactions.forEach(item => {

        if (item.type === "income") {

            analytics.totalIncome += item.amount;

            analytics.incomeCount++;

        }

        else {

            analytics.totalExpense += item.amount;

            analytics.expenseCount++;

        }

    });



    analytics.netSavings =

        analytics.totalIncome -

        analytics.totalExpense;



    return analytics;

}



/*====================================================
            RECENT ACTIVITY
====================================================*/

function getRecentActivity(limit = 3) {

    return [...transactions]

        .sort((a, b) => b.id - a.id)

        .slice(0, limit);

}



/*====================================================
            DASHBOARD REPORT
====================================================*/

function dashboardReport() {

    const report =

        getTransactionAnalytics();



    console.group(

        "FinTrack Dashboard"

    );



    console.table(report);



    console.table(

        getRecentActivity()

    );



    console.groupEnd();

}


const logoutBtn = document.querySelector("#logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("currentUser");

        window.location.href = "index.html";

    });

}


/*====================================================
                RESET ALL DATA
====================================================*/

const resetAllBtn = document.querySelector("#resetAllBtn");

if (resetAllBtn) {

    resetAllBtn.addEventListener("click", () => {

        const confirmReset = confirm(

            "⚠️ Are you sure?\n\nThis will permanently delete all your transactions and budget."

        );

        if (!confirmReset) return;



        // Reset variables
        transactions = [];
        editId = null;
        monthlyBudget = 0;



        // Clear LocalStorage
        localStorage.removeItem("transactions");
        localStorage.removeItem("budget");



        // Reset UI
        renderTransactions(getFilteredTransactions());

        updateSummary();

        updateCharts();

        updateBudget();

        updateStatisticsDashboard();



        // Reset form
        if (transactionForm) {

            transactionForm.reset();

        }

        if (dateInput) {

            dateInput.valueAsDate = new Date();

        }



        alert("✅ All data has been reset.");

    });

}

/*====================================================
                SETTINGS
====================================================*/

const settingsBtn = document.querySelector("#settingsBtn");

const settingsModal = document.querySelector("#settingsModal");

const closeSettings = document.querySelector("#closeSettings");

const saveSettings = document.querySelector("#saveSettings");

const profileName = document.querySelector("#profileName");

const currencySelect = document.querySelector("#currencySelect");



let userSettings = JSON.parse(

    localStorage.getItem("userSettings")

) || {

    name: currentUser,

    currency:"INR"

};



profileName.value = userSettings.name;

currencySelect.value = userSettings.currency;



settingsBtn.addEventListener("click",()=>{

    settingsModal.classList.add("active");

});



closeSettings.addEventListener("click",()=>{

    settingsModal.classList.remove("active");

});



settingsModal.addEventListener("click",(e)=>{

    if(e.target===settingsModal){

        settingsModal.classList.remove("active");

    }

});



saveSettings.addEventListener("click",()=>{

    userSettings.name = profileName.value.trim();

    userSettings.currency = currencySelect.value;



    localStorage.setItem(

        "userSettings",

        JSON.stringify(userSettings)

    );



    welcomeUser.textContent=

    `👋 Welcome, ${userSettings.name}`;



    updateSummary();

    renderTransactions(getFilteredTransactions());

    updateStatisticsDashboard();

    updateBudget();



    settingsModal.classList.remove("active");



    alert("Settings Saved Successfully.");

});



welcomeUser.textContent=

`👋 Welcome, ${userSettings.name}`;


