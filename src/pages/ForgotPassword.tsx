import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import collegeLogo from "@/assets/college-logo.png";

type Step = "verify" | "otp" | "password";
const MAX_RESEND_ATTEMPTS = 3;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("verify");
  const [loading, setLoading] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendAttempts, setResendAttempts] = useState(0);

  const sendVerificationCode = async (targetEmail: string, isResend = false) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail.trim(),
      options: { shouldCreateUser: false },
    });

    if (error) {
      toast.error(error.message);
      return false;
    }

    toast.success(
      isResend
        ? "A new 6-digit code has been sent to your email."
        : "A 6-digit code has been sent to your email."
    );
    return true;
  };

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
    if (error || !matches) {
      setLoading(false);
      toast.error("Student ID and Email do not match our records.");
      return;
    }
    const otpSent = await sendVerificationCode(email);
    setLoading(false);
    if (!otpSent) {
      return;
    }
    setResendAttempts(0);
    setStep("otp");
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code from your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error("Invalid or expired code. Please try again.");
      return;
    }
    toast.success("Code verified! Set your new password.");
    setStep("password");
  };

  const handleResendCode = async () => {
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      toast.error("You have reached the resend limit.");
      return;
    }

    setLoading(true);
    const otpSent = await sendVerificationCode(email, true);
    setLoading(false);

    if (!otpSent) {
      return;
    }

    setOtp("");
    setResendAttempts((current) => current + 1);
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
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    await supabase.auth.signOut();
    setLoading(false);
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
          <CardTitle className="text-2xl">
            {step === "verify" && "Forgot Password"}
            {step === "otp" && "Enter Verification Code"}
            {step === "password" && "Set New Password"}
          </CardTitle>
          <CardDescription>
            {step === "verify" && "Verify your Student ID and Email"}
            {step === "otp" && `We sent a code to ${email}`}
            {step === "password" && "Choose a strong new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "verify" && (
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
                {loading ? "Verifying..." : "Send Code"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 font-semibold">
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={loading || resendAttempts >= MAX_RESEND_ATTEMPTS}
                className="w-full h-12 font-semibold"
              >
                {loading
                  ? "Sending..."
                  : resendAttempts >= MAX_RESEND_ATTEMPTS
                    ? "Resend Limit Reached"
                    : `Resend Code (${MAX_RESEND_ATTEMPTS - resendAttempts} left)`}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                You can resend the code up to {MAX_RESEND_ATTEMPTS} times.
              </p>
              <button
                type="button"
                onClick={() => setStep("verify")}
                className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            </form>
          )}

          {step === "password" && (
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
