import { useSelector } from "react-redux";
import { useState } from "react";
import ProfileModal from "../../modals/user-profile";
type HeaderProps = {
  onLogout: () => void;
  user: any;
};

function Header({ onLogout }: HeaderProps) {
  // Get current user from Redux auth state
  const user = useSelector((state: any) => state.auth.user);
  
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="header-content">
      <div className="logo-title-wrp">
        <h5>MyBank</h5>
      </div>

      <div className="profile-wrapper">
        <div className="profile-pic" onClick={() => setShowModal(!showModal)}>
          <img
            src="https://randomuser.me/api/portraits/men/75.jpg"
            alt="Profile Picture"
          />
        </div>

        <div className="profile-name">
          <h6>{user?.name}</h6>
        
        </div>

        <div className={`profile-show-wrp profile-show-container ${showModal ? "show" : ""}`}>
          <div className="profle-col">
            {/* <h6>{user?.name}</h6> */}
            <button className="btn btn-danger btn-sm w-100" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
   
  );
}

export default Header;