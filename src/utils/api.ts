import axios from "axios";

// This sets up the connection to the fake server
const API = axios.create({
  baseURL: "http://localhost:3001",
});

// These are the types for our data
type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin?: boolean;
};

type Payee = {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  bankName: string;
};

type Account = {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  createdAt: string;
};

type Transaction = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  type: "Debit" | "Credit" | "Transfer";
  description: string;
  date: string;
  status: string;
  payeeId?: string;
};

type EnrichedTransaction = Transaction & {
  fromAccountNumber: string;
  toAccountNumber: string;
  fromAccountName: string;
  toAccountName: string;
};

// This makes unique IDs for new data
const formatId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

// This checks if the email and password match a user
export const loginUser = async (email: string, password: string) => {
  const res = await API.get<User[]>('/users');
  
  // Find user by case-insensitive email match
  const user = res.data.find(
    (u: User) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  return user || null;
};

// This gets the list of people you can send money to
export const getPayees = async (userId: string | number) => {
  try {
    const res = await API.get<Payee[]>('/payees', {
      params: { userId: String(userId) },
    });
    return res.data || [];
  } catch (err) {
    console.error('Error fetching payees:', err);
    return [];
  }
};

export const getPayeeById = async (payeeId: string) => {
  const res = await API.get<Payee>(`/payees/${payeeId}`);
  return res.data;
};

// export const getAccount = async (userId: string | number) => {
//   debugger
//   const res = await API.get<Account[]>('/accounts', {
//     params: { userId: String(userId) },
//   });
//   return res.data[0] || null;
// };
export const getAccount = async (userId: string | number) => {
  const res = await API.get('/accounts');

  const account = res.data.find(
    (item: any) => item.userId === String(userId)
  );

  return account || null;
};

export const getAccountByNumber = async (accountNumber: string) => {
  const res = await API.get('/accounts');

  const account = res.data.find(
    (item: any) => item.accountNumber === accountNumber
  );

  return account || null;
};

export type TransactionFilter = {
  type?: "All" | "Debit" | "Credit";
  from?: string;
  to?: string;
};

// This gets the user's transaction history with filters
export const getTransactions = async (
  userId: string | number,
  filter: TransactionFilter = { type: "All" }
) => {
  const account = await getAccount(userId);
  if (!account) {
    return [] as EnrichedTransaction[];
  }

  const [transactionsRes, accountsRes, usersRes] = await Promise.all([
    API.get<Transaction[]>('/transactions'),
    API.get<Account[]>('/accounts'),
    API.get<User[]>('/users'),
  ]);

  const accountsMap = new Map(accountsRes.data.map((item) => [item.id, item]));
  const usersMap = new Map(usersRes.data.map((user) => [user.id, user]));

  const filtered = transactionsRes.data
    .filter((txn) => {
      // Always filter to user's transactions
      const isUserTxn = txn.fromAccountId === account.id || txn.toAccountId === account.id;
      if (!isUserTxn) return false;

      // Apply type filter
      if (filter.type === "Debit" && txn.fromAccountId !== account.id) return false;
      if (filter.type === "Credit" && txn.toAccountId !== account.id) return false;

      // Apply date filter
      const txnDate = new Date(txn.date);
      if (filter.from) {
        const fromDate = new Date(filter.from);
        if (txnDate < fromDate) return false;
      }
      if (filter.to) {
        const toDate = new Date(filter.to);
        toDate.setHours(23, 59, 59, 999);
        if (txnDate > toDate) return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((txn) => {
      const fromAccount = accountsMap.get(txn.fromAccountId);
      const toAccount = accountsMap.get(txn.toAccountId);
      const fromUser = fromAccount ? usersMap.get(fromAccount.userId) : undefined;
      const toUser = toAccount ? usersMap.get(toAccount.userId) : undefined;

      return {
        ...txn,
        type: txn.fromAccountId === account.id ? "Debit" : "Credit",
        fromAccountNumber: fromAccount?.accountNumber || "External",
        toAccountNumber: toAccount?.accountNumber || "External",
        fromAccountName: fromUser?.name || (fromAccount ? `User ${fromAccount.userId}` : "External"),
        toAccountName: toUser?.name || (toAccount ? `User ${toAccount.userId}` : "External"),
      };
    });

  return filtered;
};

export const createTransaction = async (data: Omit<Transaction, "id">) => {
  // This saves a new transaction to the database
  const newTransaction = {
    ...data,
    id: formatId("tx"),
  };

  const res = await API.post<Transaction>('/transactions', newTransaction);
  return res.data;
};

export const updateAccountBalance = async (accountId: string, balance: number) => {
  // This changes the money in an account
  const res = await API.patch<Account>(`/accounts/${accountId}`, {
    balance,
  });
  return res.data;
};

export const addPayee = async (data: Omit<Payee, "id">) => {
  // This adds a new person to send money to
  const newPayee = {
    ...data,
    id: formatId("payee"),
  };
  const res = await API.post<Payee>('/payees', newPayee);
  return res.data;
};

// This handles sending money from one account to another
export const transferFunds = async (data: {
  userId: string | number;
  payeeId: string;
  amount: number;
  description: string;
  date: string;
}) => {
  // Get the sender's account
  const senderAccount = await getAccount(data.userId);
  if (!senderAccount) {
    throw new Error("Sender account not found");
  }

  // Check if amount is valid
  if (data.amount <= 0) {
    throw new Error("Transfer amount must be greater than zero");
  }

  // Check if sender has enough money
  if (senderAccount.balance < data.amount) {
    throw new Error("Insufficient balance");
  }

  // Get the payee details
  const payee = await getPayeeById(data.payeeId);
  if (!payee || String(payee.userId) !== String(data.userId)) {
    throw new Error("Selected payee is invalid");
  }

  const receiverAccount = await getAccountByNumber(payee.accountNumber);

  const transactionBase = {
    fromAccountId: senderAccount.id,
    toAccountId: receiverAccount?.id ?? "external",
    amount: data.amount,
    description: data.description,
    date: data.date,
    status: "success",
    payeeId: payee.id,
  };

  const transaction = await createTransaction({
    ...transactionBase,
    type: "Transfer",
  });

  await updateAccountBalance(senderAccount.id, senderAccount.balance - data.amount);

  if (receiverAccount) {
    await updateAccountBalance(receiverAccount.id, receiverAccount.balance + data.amount);
  }

  return {
    transaction,
    receiverAccountExists: Boolean(receiverAccount),
  };
};