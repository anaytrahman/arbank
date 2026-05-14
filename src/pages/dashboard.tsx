import { useEffect, useState } from "react";
import { getAccount, getTransactions } from "../utils/api";

const Dashboard = ({ user }: any) => {
  const [account, setAccount] = useState<any>(null);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const acc = await getAccount(user.id);
      const txns = await getTransactions(user.id);
      setAccount(acc);
      setRecentTxns(txns.slice(0, 5));
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="alert alert-info mt-3">Loading...</div>;

  return (
    <div className="mt-2">
      <h5>Welcome, {user?.name}</h5>

      <div className="card mb-4 mt-3" style={{ maxWidth: "350px" }}>
        <div className="card-body">
          <p className="mb-1 text-muted">Account Number</p>
          <h6>{account?.accountNumber ?? "N/A"}</h6>
          <p className="mb-1 text-muted mt-2">Available Balance</p>
          <h4 className="text-success">₹{account?.balance ?? 0}</h4>
          <p className="recent-transaction mb-1 mt-2 btn btn-primary btn-sm" onClick={() => setShowTransactions(!showTransactions)}>
            {showTransactions ? 'Hide Recent Transactions' : 'See Recent Transactions'}
          </p>
        </div>
      </div>
      

      {showTransactions && (
        <>
          <h6>Recent Transactions</h6>
          {recentTxns.length === 0 ? (
            <p className="text-muted">No transactions found.</p>
          ) : (
            <table className="table table-bordered table-sm mt-2">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map((txn) => (
                  <tr key={txn.id}>
                    <td>{new Date(txn.date).toLocaleDateString()}</td>
                    <td>{txn.description}</td>
                    <td>
                      <span className={`badge ${txn.type === "Credit" ? "bg-success" : "bg-danger"}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td>₹{txn.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
