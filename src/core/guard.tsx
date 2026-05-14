import { Navigate } from "react-router-dom";

// This component protects admin pages
const AdminRoute = ({ children, user }: any) => {
  console.log("AdminRoute hit", user);

  // If no user, go to home
  if (!user) return <Navigate to="/" />;
  // If not admin, go to home
  if (user.isAdmin !== 1) return <Navigate to="/" />;

  return children;
};

export default AdminRoute;