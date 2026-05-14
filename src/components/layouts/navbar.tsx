
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
function Navbar() {
  const user = useSelector((state: any) => state.auth.user);
  return (
    <nav className="navbar-wrapper">



      <div className="navbcols" >
        <ul className="navbar-nav menu-item-ts">

          <li className="nav-item">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active active-menu fw-bold" : "nav-link"
              }
            >
              Home
            </NavLink>
          </li>
          {
            user?.isAdmin && (
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive ? "nav-link active active-menu fw-bold" : "nav-link"
                  }
                >
                  Admin Screen
                </NavLink>
              </li>
            )
          }
          <li className="nav-item">
            <NavLink
              to="/add-payee"
              className={({ isActive }) =>
                isActive ? "nav-link  active active-menu fw-bold" : "nav-link"
              }
            >
             Add Payee
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/TransferFund"
              className={({ isActive }) =>
                isActive ? "nav-link active active-menu fw-bold" : "nav-link"
              }
            >
              Transfer Fund
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                isActive ? "nav-link active active-menu fw-bold" : "nav-link"
              }
            >
              Transactions History
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "nav-link active active-menu fw-bold" : "nav-link"
              }
            >
              About
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "nav-link active active-menu fw-bold" : "nav-link"
              }
            >
              Contact
            </NavLink>
          </li>

        </ul>
      </div>

    </nav>
  );
}

export default Navbar;