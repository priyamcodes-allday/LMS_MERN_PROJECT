import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"

  const hasFetched = React.useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        // Redirect to home after 3 seconds
        setTimeout(() => navigate("/"), 3000);
      } catch (error) {
        setStatus("error");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
        {status === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900">
              Verifying your email...
            </h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-500 mt-2">
              Redirecting you to login in 3 seconds...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-500 mt-2">
              Please sign up again or request a new link.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
