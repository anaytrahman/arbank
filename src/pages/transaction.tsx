import { useEffect, useMemo, useState, ChangeEvent } from "react";
import TablePagination from '@mui/material/TablePagination';
import { getTransactions } from "../utils/api";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import * as XLSX from 'xlsx';

// This page shows your money transaction history
const Transactions = ({ user }: any) => {
  // State for the list of transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // State for date filters
  const [filters, setFilters] = useState({ from: "", to: "" });
  // State for type filter
  const [txType, setTxType] = useState<"All" | "Debit" | "Credit">("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (user?.id) {
      loadTransactionsData();
    }
  }, [user, filters, txType]);

  // This loads the transaction list with filters
  const loadTransactionsData = async () => {
    setLoading(true);
    try {
      const data = await getTransactions(String(user?.id), {
        type: txType,
        from: filters.from,
        to: filters.to,
      });
      setTransactions(data || []);
      setPage(0);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions;
  }, [transactions]);

  const pagedTransactions = filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setPage(0);
  };

  //page 
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // This creates and downloads an Excel file with transactions
  const downloadExcel = () => {
    if (pagedTransactions.length === 0) {
      alert("No transactions to download ");
      return;
    } else {
      const worksheet = XLSX.utils.json_to_sheet(filteredTransactions.map(txn => ({
        Date: new Date(txn.date).toLocaleString(),
        Description: txn.description || "Transfer",
        Type: txn.type,
        From: txn.fromAccountName && txn.fromAccountNumber !== "External"
          ? `${txn.fromAccountName} (${txn.fromAccountNumber})`
          : "External",
        To: txn.toAccountName && txn.toAccountNumber !== "External"
          ? `${txn.toAccountName} (${txn.toAccountNumber})`
          : "External",
        Amount: `₹${txn.amount}`,
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      const safeUserName = user?.name?.replace(/\s+/g, "-").toLowerCase() || "user";
      const fileName = `transaction-${safeUserName}-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }
  };
  return (
    <div>
      <div className="trsansaction-sec">
        <h6 className="transaction-history-heading">Transactions History</h6>

        <div className="content-top-wrapper">
          <div className="filter-wrapper mb-3 d-flex gap-2 align-items-end">
            <div>
              <label className="form-label">From</label>
              <input
                className="form-control"
                type="date"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label className="form-label">To</label>
              <input
                className="form-control"
                type="date"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label className="form-label">Type</label>
              <select
                className="form-control"
                name="type"
                value={txType}
                onChange={(e) => {
                  setTxType(e.target.value as "All" | "Debit" | "Credit");
                  setPage(0);
                }}
              >
                <option value="All">All</option>
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>


          </div>
          <div className="d-flex align-items-end">
            <button className="btn btn-success" onClick={downloadExcel}
              >
              Download Excel
            </button>
          </div>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From Account</TableCell>
                <TableCell>To Account</TableCell>
                <TableCell align="right">Amount (₹)</TableCell>
                 <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : pagedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                pagedTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{new Date(txn.date).toLocaleString()}</TableCell>
                    <TableCell>{txn.description || "Transfer"}</TableCell>
                    <TableCell className={txn.type === "Debit" ? "debit-column" : "credit-column"}>
                      {/* {txn.type} */}
                        <span className={`badge ${txn.type === "Debit" ? "bg-danger" : "bg-success"} ms-2`}>
                        {txn.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {txn.fromAccountName && txn.fromAccountNumber !== "External"
                        ? `${txn.fromAccountName} (${txn.fromAccountNumber})`
                        : "External"}
                    </TableCell>
                    <TableCell>
                      {txn.toAccountName && txn.toAccountNumber !== "External"
                        ? `${txn.toAccountName} (${txn.toAccountNumber})`
                        : "External"}
                    </TableCell>
                    <TableCell align="right">₹{txn.amount}</TableCell>
                      <TableCell className={txn.status === "Debit" ? "bg-danger" : "credit-column"}>
                      {/* {txn.status} */}
                       <span className={`badge ${txn.status === "Failed" ? "bg-danger" : "bg-success"} ms-2`}>
                        {txn.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
};

export default Transactions;
