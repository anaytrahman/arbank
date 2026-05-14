import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Header from "./components/layouts/header";
import Navbar from "./components/layouts/navbar";
import Login from "./pages/login";

import Dashboard from "./pages/dashboard";
import TransferFund from "./pages/transfer-fund";
import Transactions from "./pages/transaction";
import AboutPage from "./pages/about";
import AddPayee from "./pages/addPayee";
import AdminPage from "./pages/admin-screen";
import Footer from "./components/layouts/footer";
import { logout, login } from "./reducers/authslice";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser && !user) {
      dispatch(login(JSON.parse(savedUser)));
    }
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.removeItem("user");
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="banking-app-main container-fluid">
      <div className="header-section">
        <Header onLogout={handleLogout} user={user} />
      </div>

      <div className="main-content-section row">
        <div className="sidebar-wrapper col-12 col-md-2 bg-light p-3">
          <Navbar />
        </div>

        <div className="content-wrapper col-12 col-md-9 p-3">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path='/admin' element={<AdminPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/TransferFund" element={<TransferFund user={user} />} />
            <Route path="/transactions" element={<Transactions user={user} />} />
            <Route path="/add-payee" element={<AddPayee user={user} />} />
          </Routes>
        </div>
      </div>

      <footer className="footer-section">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
