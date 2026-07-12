import React from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        Welcome to TransitOps
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        The system of record for logistics fleet operations.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <a
          href="/login"
          className="rounded-md bg-blue-600 px-5 py-3 text-base font-medium text-white shadow hover:bg-blue-700"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}
