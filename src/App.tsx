import { Authenticated, Unauthenticated } from "convex/react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Landing from "./pages/Landing";
import AppShell from "./components/AppShell";

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={
        <>
          <Unauthenticated>
            <Landing />
          </Unauthenticated>
          <Authenticated>
            <Navigate to="/dashboard" replace />
          </Authenticated>
        </>
      } />

      {/* Auth Portal */}
      <Route path="/auth" element={
        <>
          <Unauthenticated>
            <SignIn />
          </Unauthenticated>
          <Authenticated>
            <Navigate to="/dashboard" replace />
          </Authenticated>
        </>
      } />

      {/* Protected Workspace */}
      <Route path="/dashboard/*" element={
        <>
          <Authenticated>
            <AppShell />
          </Authenticated>
          <Unauthenticated>
            <Navigate to="/auth" replace />
          </Unauthenticated>
        </>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}