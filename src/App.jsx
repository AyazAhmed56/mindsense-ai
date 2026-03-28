import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import BaselineTest from "./pages/BaselineTest";
// import BehaviorTracking from "./pages/BehaviorTracking";
import { CognitiveStateProvider } from "./context/CognitiveStateContext";
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <h1 className="text-center mt-10">Loading...</h1>;
  }

  return (
    <CognitiveStateProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" /> : <Signup />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" />}
        />

        <Route
          path="/baseline-test"
          element={user ? <BaselineTest /> : <Navigate to="/" />}
        />

        {/* <Route
          path="/behavior-tracking"
          element={user ? <BehaviorTracking /> : <Navigate to="/" />}
        /> */}

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} />}
        />
      </Routes>
    </BrowserRouter>
    </CognitiveStateProvider>
  );
}

export default App;