import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Profile() {

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
const navigate = useNavigate();
  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setEmail(user.email);
    }
  };

 const saveProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("User not logged in");
    return;
  }

  const { error } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email,
    name,
    gender,
    phone,
  });

  if (error) {
    console.log(error);
    alert(error.message);
  } else {
    alert("Profile saved successfully");
  }

  navigate("/baseline-test");
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">
          User Profile
        </h2>

        <input
          type="text"
          value={email}
          readOnly
          className="w-full border p-2 mb-4 rounded bg-gray-200"
        />

        <input
          type="text"
          placeholder="Enter Name"
          className="w-full border p-2 mb-4 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="w-full border p-2 mb-4 rounded"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full border p-2 mb-4 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={saveProfile}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Save Profile
        </button>

      </div>

    </div>
  );
}