import { useState } from "react";
import { loginUser } from "../utils/api";
import { useDispatch } from "react-redux";
import { login } from "../reducers/authslice";

// This is the login page where users enter their email and password
const Login: React.FC = () => {
    // This sends actions to Redux
    const dispatch = useDispatch();
    // This holds the form data
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(false);

    // This updates the form when user types
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setGeneralError("");
    };

    // This checks if the form is filled correctly
    const validate = () => {
        if (!form.email || !form.password) {
            setGeneralError("Please enter email and password.");
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(form.email)) {
            setGeneralError("Invalid email.");
            return false;
        }

        setGeneralError("");
        return true;
    };

    // This tries to log in the user
    const handleLogin = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            const user = await loginUser(form.email, form.password);
            if (user) {
                dispatch(login(user)); // Save user in Redux
                sessionStorage.setItem('user', JSON.stringify(user));
                setGeneralError("");
            } else {
                setGeneralError("Invalid email or password.");
            }
        } catch (error) {
            console.error(error);
            setGeneralError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="login-container">
            <div className="login-card">
                <h2>Login</h2>
                <div className="field-wrap">
                    <div className="input-wrapper mb-3">
                        <input
                            className="form-control"
                            type="email"
                            name="email"
                            placeholder="Enter email *"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-wrapper">
                        <input
                            className="form-control"
                            type="password"
                            name="password"
                            placeholder="Enter password *"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="warning-wrpper">
                    {generalError && (
                        <span>
                            {generalError}
                        </span>
                    )}
                </div>
                <div className="button-wrapper">
                    <button className="btn btn-primary"
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ marginTop: "15px" }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>


            </div>
            <div className="dummy-data">
                <p><strong>Dummy emails/user:</strong> anayt@mail.com, aman@mail.com</p>
                <p> <strong>Dummy password:</strong> 123456</p>
            </div>
        </div>
    );
};

export default Login;