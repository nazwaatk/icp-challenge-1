import express, { Request, Response } from "express";
import path from "path";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
}

let db: Transaction[] = [];

const app = express();
app.use(express.json());

app.post(
  "/transaction",
  (req: Request<any, any, Transaction>, res: Response) => {
    const newTransaction: Transaction = {
      id: `${db.length + 1}`,
      description: req.body.description,
      amount: req.body.amount,
      type: req.body.type,
    };

    db.push(newTransaction);
    res.status(201).json(newTransaction);
  }
);

app.get("/transactions", (_req, res: Response) => {
  res.json(db);
});

app.delete("/transaction/:id", (req: Request, res: Response) => {
  const transactionIndex = db.findIndex((t) => t.id === req.params.id);

  if (transactionIndex !== -1) {
    db.splice(transactionIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: "Transaction not found" });
  }
});

app.use(express.static(path.join(__dirname, "dist")));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
