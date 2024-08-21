import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
}

@customElement("financial-app")
export class FinancialApp extends LitElement {
  @property({ type: Array })
  transactions: Transaction[] = [];

  @property({ type: String })
  description = "";

  @property({ type: Number })
  amount = 0;

  @property({ type: String })
  type: "income" | "expense" = "income";

  constructor() {
    super();
    this.getTransactions();
  }

  async getTransactions(): Promise<void> {
    try {
      const response = await fetch("/transactions");
      const data = await response.json();
      this.transactions = data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  async addTransaction(): Promise<void> {
    const newTransaction: Transaction = {
      id: "",
      description: this.description,
      amount: this.amount,
      type: this.type,
    };

    try {
      const response = await fetch("/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      });

      const data = await response.json();
      this.transactions = [...this.transactions, data];
      this.clearForm();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      await fetch(`/transaction/${id}`, {
        method: "DELETE",
      });

      this.transactions = this.transactions.filter(
        (transaction) => transaction.id !== id
      );
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }

  get totalBalance(): number {
    return this.transactions.reduce((acc, transaction) => {
      return transaction.type === "income"
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);
  }

  clearForm(): void {
    this.description = "";
    this.amount = 0;
    this.type = "income";
  }

  render(): any {
    return html`
      <h1>Financial Tracker</h1>

      <div>
        <label>Description:</label>
        <input
          type="text"
          .value=${this.description}
          @input=${(e: any) => (this.description = e.target.value)}
        />
      </div>

      <div>
        <label>Amount:</label>
        <input
          type="number"
          .value=${this.amount}
          @input=${(e: any) => (this.amount = parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label>Type:</label>
        <select
          .value=${this.type}
          @change=${(e: any) => (this.type = e.target.value)}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <button @click=${this.addTransaction}>Add Transaction</button>

      <h2>Total Balance: ${this.totalBalance}</h2>

      <h2>Transactions List</h2>
      <ul>
        ${this.transactions.map(
          (transaction) => html`
            <li>
              <strong>${transaction.description}</strong>
              - ${transaction.amount}
              (${transaction.type === "income" ? "Income" : "Expense"})
              <button @click=${() => this.deleteTransaction(transaction.id)}>
                Delete
              </button>
            </li>
          `
        )}
      </ul>
    `;
  }
}
