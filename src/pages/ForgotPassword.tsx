import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, KeyRound } from "lucide-react";
import collegeLogo from "@/assets/college-logo.png";

type Step = "verify" | "password";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("verify");
  const [loading, setLoading] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !email.trim()) {
      toast.error("Please enter both Student ID and Email");
      return;
    }
    setLoading(true);
    const { data: matches, error } = await supabase.rpc("verify_student_id_email", {
      _student_id: studentId.trim(),
      _email: email.trim(),
    });
    setLoading(false);
    if (error || !matches) {
      toast.error("Student ID and Email do not match our records.");
      return;
    }
    toast.success("Verified! Set your new password.");
    setStep("password");
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("reset-student-password", {
      body: {
        student_id: studentId.trim(),
        email: email.trim(),
        new_password: newPassword,
      },
    });
    setLoading(false);

    if (error || (data && (data as any).error)) {
      const msg = (data as any)?.error || error?.message || "Failed to update password";
      toast.error(msg);
      return;
    }

    toast.success("Password updated! Please log in with your new password.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full overflow-hidden shadow-lg">
            <img src={collegeLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <KeyRound className="h-5 w-5" />
            {step === "verify" ? "Forgot Password" : "Set New Password"}
          </CardTitle>
          <CardDescription>
            {step === "verify"
              ? "Verify your Student ID and Email to reset your password"
              : "Enter your new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "verify" ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                placeholder="Student ID (UUCMS ID)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="h-12"
                maxLength={50}
              />
              <Input
                type="email"
                placeholder="Registered Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
              <Button type="submit" disabled={loading} className="w-full h-12 font-semibold">
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <Input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-12"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12"
              />
              <Button type="submit" disabled={loading} className="w-full h-12 font-semibold">
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("verify")}
                className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-sm text-muted-foreground hover:text-primary mt-4 text-center"
          >
            Back to Login
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
