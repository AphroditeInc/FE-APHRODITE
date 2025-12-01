"use client";

import { useState } from "react";
import { useRegisterUserMutation, useRegisterWithEmailMutation } from "@/app/api/apiSlice";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CreateTestUserPage() {
  const [registerWithEmail, { isLoading: isEmailLoading, error: emailError }] = useRegisterWithEmailMutation();
  const [registerUser, { isLoading: isUserLoading, error: userError }] = useRegisterUserMutation();
  
  const isLoading = isEmailLoading || isUserLoading;
  const error = (emailError as any)?.data?.message || (userError as any)?.data?.message || (emailError as any)?.error || (userError as any)?.error || null;
  const router = useRouter();
  const [createdUser, setCreatedUser] = useState<{ id: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    email: `testuser${Date.now()}@test.com`,
    password: "Test123456",
    firstName: "Test",
    lastName: "User",
    userType: "client" as "client" | "rider" | "diva" | "hunk",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async () => {
    try {
      // Try email registration first
      const emailResponse = await registerWithEmail({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: formData.userType,
        countryCode: "+1",
        number: "0000000000",
      }).unwrap();

      // If email registration fails (404 or other error), try phone registration
      if (!emailResponse.success) {
        console.log("Email registration failed, trying phone registration endpoint...");
        // Use phone registration endpoint as fallback
        const phoneResponse = await registerUser({
          userType: formData.userType,
          countryCode: "+1",
          phoneNumber: `1${Date.now().toString().slice(-10)}`, // Generate unique phone number
        }).unwrap();

        if (phoneResponse.success && phoneResponse.data) {
          setCreatedUser({
            id: phoneResponse.data.id,
            email: formData.email,
          });
          console.log("Test user created:", phoneResponse.data);
        } else {
          console.error("Registration failed:", phoneResponse.error);
        }
      } else if (emailResponse.success && emailResponse.data) {
        setCreatedUser({
          id: emailResponse.data.user?.id || '',
          email: formData.email,
        });
        console.log("Test user created:", emailResponse.data);
      } else {
        console.error("Registration failed:", emailResponse.error);
      }
    } catch (err) {
      console.error("Failed to create test user:", err);
      // Fallback to phone registration on error if it was the email one that failed
      if (!isUserLoading) {
         try {
            console.log("Email registration threw error, trying phone registration endpoint...");
            const phoneResponse = await registerUser({
              userType: formData.userType,
              countryCode: "+1",
              phoneNumber: `1${Date.now().toString().slice(-10)}`,
            }).unwrap();
            
            if (phoneResponse.success && phoneResponse.data) {
              setCreatedUser({
                id: phoneResponse.data.id,
                email: formData.email,
              });
            }
         } catch (phoneErr) {
            console.error("Phone registration also failed:", phoneErr);
         }
      }
    }
  };

  const copyUserId = () => {
    if (createdUser) {
      navigator.clipboard.writeText(createdUser.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogin = () => {
    // Store credentials for easy login
    localStorage.setItem("testUserEmail", formData.email);
    localStorage.setItem("testUserPassword", formData.password);
    router.push("/login");
  };

  if (createdUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard
          title="Test User Created Successfully!"
          description="Use this user ID to test chat functionality"
          className="font-urbanist max-w-md"
        >
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-400 text-sm font-medium mb-2">User Created!</p>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-300 text-xs mb-1">User ID:</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-800 px-3 py-2 rounded text-white text-sm flex-1 break-all">
                      {createdUser.id}
                    </code>
                    <button
                      onClick={copyUserId}
                      className="bg-[#FA266D] hover:bg-pink-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 text-xs mb-1">Email:</p>
                  <p className="text-white text-sm">{createdUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-xs mb-1">Password:</p>
                  <p className="text-white text-sm">{formData.password}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
              <p className="text-blue-400 text-sm font-medium mb-2">How to Test Chat:</p>
              <ol className="text-gray-300 text-xs space-y-1 list-decimal list-inside">
                <li>Copy the User ID above</li>
                <li>Go to your main account&apos;s chat page</li>
                <li>Click &quot;New Chat&quot; button</li>
                <li>Paste the User ID and start chatting</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setCreatedUser(null);
                  setFormData({
                    email: `testuser${Date.now()}@test.com`,
                    password: "Test123456",
                    firstName: "Test",
                    lastName: "User",
                    userType: "client",
                  });
                }}
                className="flex-1 bg-white/10 text-white hover:bg-white/20"
              >
                Create Another
              </Button>
              <Button
                onClick={handleLogin}
                className="flex-1 bg-[#FA266D] hover:bg-pink-600 text-white"
              >
                Login as This User
              </Button>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <AuthCard
        title="Create Test User"
        description="Quickly create a test user for testing chat functionality"
        className="font-urbanist max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">User Type</label>
            <select
              value={formData.userType}
              onChange={(e) => handleInputChange("userType", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FA266D]"
            >
              <option value="client">Client</option>
              <option value="diva">Diva/Hunk</option>
              <option value="rider">Rider</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA266D]"
              placeholder="testuser@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA266D]"
              placeholder="Password"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-sm mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA266D]"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA266D]"
                placeholder="Last Name"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleCreateUser}
            disabled={isLoading || !formData.email || !formData.password}
            className={`w-full py-3 px-4 font-medium transition-all duration-200 ${
              isLoading || !formData.email || !formData.password
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#FA266D] hover:bg-pink-600 text-white"
            }`}
          >
            {isLoading ? "Creating User..." : "Create Test User"}
          </Button>

          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-yellow-400 text-xs font-medium mb-1">⚠️ Note:</p>
            <p className="text-yellow-300 text-xs">
              If email registration fails (404 error), the system will automatically try phone registration.
              <br />
              Phone registration may require OTP verification. For easier testing, use the regular signup flow at{" "}
              <a href="/signup" className="underline text-yellow-200">/signup</a>
            </p>
          </div>

          <p className="text-gray-400 text-xs text-center">
            This page is for testing purposes only
          </p>
        </div>
      </AuthCard>
    </div>
  );
}

