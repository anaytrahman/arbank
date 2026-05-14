import { useEffect, useState } from "react";
import { getPayees, getAccount, transferFunds } from "../utils/api";

// This page lets you send money to someone
const Transfer = ({ user }: any) => {
  // State for payees list
  const [payees, setPayees] = useState<any[]>([]);
  // State for user's account
  const [account, setAccount] = useState<any>(null);
  // State for the transfer form
  const [form, setForm] = useState({
    payeeId: "",
    amount: "",
    description: "Fund transfer",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      console.log("Loading data for user:", user?.id);
      loadData();
    }
  }, [user]);

  // This loads payees and account info when page opens
  const loadData = async () => {
    setDataLoading(true);
    setError("");
    try {
      console.log("Fetching payees for userId:", String(user?.id));
      const p = await getPayees(String(user?.id));
      console.log("Payees received:", p);

      const acc = await getAccount(String(user?.id));
      console.log("Account received:", acc);

      setPayees(p || []);
      setAccount(acc);

      if (!acc) {
        setError("Account not found for this user.");
      }
      if (!p || p.length === 0) {
        setMessage("No payees found. Add a payee to get started.");
      }
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError("Failed to load payees or account data. Make sure the server is running.");
      setPayees([]);
    } finally {
      setDataLoading(false);
    }
  };

  // This updates the form when user types
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  // This checks if the form is filled correctly
  const validate = () => {
    if (!form.payeeId) {
      setError("Please select a payee.");
      return false;
    }

    const amount = Number(form.amount);
    if (!form.amount.trim() || Number.isNaN(amount)) {
      setError("Enter a valid amount.");
      return false;
    }

    if (amount < 100) {
      setError("Minimum transfer amount is ₹100.");
      return false;
    }

    // Check maximum limit based on user type
    const maxLimit = user?.isAdmin ? 5000 : 2000;
    if (amount > maxLimit) {
      setError(`Maximum transfer amount is ₹${maxLimit}.`);
      alert(`Maximum transfer amount is ₹${maxLimit}.`);
      return false;
    }

    if (account && amount > account.balance) {
      setError("Insufficient balance for this transfer.");
      alert("Insufficient balance for this transfer.");
      return false;
    }

    return true;
  };

  // This sends the money when form is submitted
  const handleSubmit = async () => {

    setError("");
    setMessage("");

    if (!validate()) {
      return;
    }

    if (!account) {
      setError("Unable to determine sender account.");
      return;
    }

    setLoading(true);

    try {
      await transferFunds({
        userId: String(user?.id),
        payeeId: form.payeeId,
        amount: Number(form.amount),
        description: form.description,
        date: new Date().toISOString(),
      });

      setMessage("Transfer completed successfully.");
      alert("Transfer Successful ");
      setForm({ payeeId: "", amount: "", description: "Fund transfer" });
      const updatedAccount = await getAccount(String(user?.id));
      setAccount(updatedAccount);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  //keyup to remove 0 from amount field and 150k limit
  const ammountKeyUp = (e: any) => {
    const value = e.target.value;

    if (value == 0 || value === "00" || value >150000) {
      setForm((prev) => ({
        ...prev,
        amount: "",
      }));
    }
  };

  return (
    <div className="transfer-fund-container">
      <h5>Fund Transfer</h5>

      {dataLoading && <div className="alert alert-info">Loading payees and account...</div>}

      {/* {message && <div className="alert alert-warning">{message}</div>} */}

      <p>
        <strong>Available Balance:</strong> ₹{account?.balance ?? 0}
      </p>

      <div className="transfer-fund-form">
        <div className="form-fund-w">
          <div className="label-wrapper">
            <label className="form-label">
              Payee  <span className="text-danger">*</span>
            </label>
          </div>
          <select
            className={`form-control ${!form.payeeId ? "error-border" : ""
              }`}
            name="payeeId"
            value={form.payeeId}
            onChange={handleChange}
            disabled={payees.length === 0 || dataLoading}
          >
            <option value="">
              {payees.length === 0 ? "No payees available" : "Select payee"}
            </option>
            {payees.map((payee) => (
              <option key={payee.id} value={payee.id}>
                {payee.name} ({payee.accountNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="form-fund-w">
          <div className="label-wrapper">
            <label className="form-label">
              Amount <span className="text-danger">*</span>
            </label>
          </div>
          <input
            className={`form-control ${!form.amount ? "error-border" : ""
              }`}
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={form.amount}
            onChange={handleChange}
            onKeyUp={ammountKeyUp}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
              }
            }}
          />
        </div>

        <div className="form-fund-w">
          <div className="label-wrapper">
            <label className="form-label">
              Description <span className="text-danger">*</span>
            </label>
          </div>
          <textarea
            className={`form-control ${!form.description ? "error-border" : ""
              }`}
            name="description"
            placeholder="Transfer description"
            value={form.description}
            onChange={handleChange}
            rows={2}
          />
        </div>

        {error && <div className="text-danger mb-2">{error}</div>}
        {message && <div className="text-success mb-2">{message}</div>}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || payees.length === 0 || !account}
        >
          {loading ? "Processing..." : "Transfer"}
        </button>
      </div>
    </div>
  );
};

export default Transfer;
