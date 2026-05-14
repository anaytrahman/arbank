import { useEffect, useState } from "react";
import { getPayees, addPayee } from "../utils/api";

const AddPayee = ({ user }: any) => {
    const [payees, setPayees] = useState<any[]>([]);
    const [newId, setNewId] = useState<string | null>(null);

    const [form, setForm] = useState({
        payeeName: "",
        accountNo: "",
    });

    const [loading, setLoading] = useState(false);

    // 🔹 Load payees
    useEffect(() => {
        if (user?.id) {
            loadPayees();
        }
    }, [user]);

    const loadPayees = async () => {
        const data = await getPayees(Number(user?.id));
        setPayees(data);

    };

    // 🔹 Handle input
    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });
    };

    // 🔹 Submit
    const handleSubmit = async () => {
        if (!form.payeeName || !form.accountNo) {
            alert("All fields required ❌");
            return;
        }

        //duplicate check
        const exists = payees.find(
            (p) => p.accountNumber === form.accountNo
        );

        if (exists) {
            alert("Payee already exists ❌");
            return;
        }

        try {

            //convert to string
            debugger
            setLoading(true);

            debugger
            await addPayee({
                payeeId: generateUniqueId(),
                userId: Number(user?.id),
                name: form.payeeName,
                accountNumber: form.accountNo,
            });

            alert("Payee Added ✅");

            // 🔄 refresh list
            await loadPayees();

            // reset form
            setForm({
                payeeName: "",
                accountNo: "",
            });

        } catch (err) {
            console.error(err);
            alert("Failed to add payee ❌");
        } finally {
            setLoading(false);
        }
    };

    const generateUniqueId = () => {
        debugger
        if (!payees.length) return null;

        let id: any;
        let isDuplicate = true;

        while (isDuplicate) {
            const num = Math.floor(10000 + Math.random() * 90000); // 5 digit
            id = `P${num}`;

            isDuplicate = payees.some(p => p.id === id);
        }
        setNewId(id);
        return id;
    };


    return (
        <div className="transfer-fund-container">
            <h2>Add Payee</h2>

            <div className="transfer-fund-form">

                {/* Name */}
                <div className="form-fund-w">
                    <div className="label-wrapper">
                        <label className="form-label">
                            Payee  <span className="text-danger">*</span>
                        </label>
                    </div>
                    <input
                        className={`form-control ${!form.payeeName ? "error-border" : ""
                            }`}
                        type="text"
                        name="payeeName"
                        placeholder="Enter payee name"
                        value={form.payeeName}
                        onChange={handleChange}
                    />
                </div>

                {/* Account No */}
                <div className="form-fund-w">
                    <div className="label-wrapper">
                        <label className="form-label">
                            Account Number  <span className="text-danger">*</span>
                        </label>
                    </div>
                    <input
                        className={`form-control ${!form.accountNo ? "error-border" : ""
                            }`}
                        
                        type="number"
                        name="accountNo"
                        placeholder="Enter account number"
                        value={form.accountNo}
                        onChange={handleChange}
                    />
                </div>

                {/* Button */}
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={form.payeeName === '' || form.accountNo === '' || loading}
                >
                    {loading ? "Processing..." : "Add Payee"}
                </button>

            </div>
        </div>
    );
};

export default AddPayee;