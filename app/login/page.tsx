"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // Username & password sederhana
    if (username === "admin" && password === "12345") {
      localStorage.setItem("isLogin", "true");
      router.push("/admin");
    } else {
      alert("Username atau password salah!");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">
          Login Admin
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 rounded"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
