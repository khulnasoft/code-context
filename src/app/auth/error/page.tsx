"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md rounded-lg bg-white shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-600">
          Only users with a <span className="font-semibold">@github.com</span> email can sign in.
        </p>
        <div className="mt-6">
          <Button
            variant="default" size="lg"
            onClick={() => window.location.href = "/"} // Replace with desired redirect or action
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}