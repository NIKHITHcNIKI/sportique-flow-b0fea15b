import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { LogIn } from "lucide-react";
import collegeLogo from "@/assets/college-logo.png";

const Login = () => {
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get("mode") === "admin";

  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpStudentId, setFpStudentId] = useState("");
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  const loginWithEmail = async (loginEmail: string) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .single();
    setLoading(false);
    if (data?.role === "admin") navigate("/admin");
    else navigate("/student");
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) { toast.error("Please enter your Student ID"); return; }
    setLoading(true);
    const { data: emailData, error: lookupError } = await supabase.rpc("get_email_by_student_id", { _student_id: studentId.trim() });
    if (lookupError || !emailData) {
      setLoading(false);
      toast.error("Student ID not found. Please check and try again.");
      return;
    }
    await loginWithEmail(emailData as string);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    await loginWithEmail(email);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpStudentId.trim() || !fpEmail.trim()) {
      toast.error("Please enter both Student ID and Email");
      return;
    }
    setFpLoading(true);
    const { data: matches, error: verifyError } = await supabase.rpc("verify_student_id_email", {
      _student_id: fpStudentId.trim(),
      _email: fpEmail.trim(),
    });
    if (verifyError) {
      setFpLoading(false);
      toast.error("Could not verify your details. Please try again.");
      return;
    }
    if (!matches) {
      setFpLoading(false);
      toast.error("Student ID and Email do not match our records.");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(fpEmail.trim(), {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password`,
    });
    setFpLoading(false);
    if (resetError) {
      toast.error(resetError.message);
      return;
    }
    toast.success("Password reset link sent! Please check your email.");
    setForgotOpen(false);
    setFpStudentId("");
    setFpEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-4 border-primary" />
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full border-4 border-primary" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border-4 border-primary" />
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-card relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full overflow-hidden shadow-lg">
            <img src={collegeLogo} alt="SET Institutions Logo" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-4xl text-secondary tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            SPORTS EQUIP
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            {isAdminMode ? "Admin Login" : "Student Login"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          {isAdminMode ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-semibold gap-2">
                <LogIn className="h-5 w-5" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <Input
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="h-12 text-base"
                maxLength={50}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-semibold gap-2">
                <LogIn className="h-5 w-5" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {!isAdminMode && (
            <p className="text-center mt-4 text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={() => navigate("/register")} className="text-primary font-semibold hover:underline">
                Register here
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your Student ID and registered Email. If they match, we'll send a password reset link to your email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
            <Input
              placeholder="Student ID (UUCMS ID)"
              value={fpStudentId}
              onChange={(e) => setFpStudentId(e.target.value)}
              required
              className="h-11"
              maxLength={50}
            />
            <Input
              type="email"
              placeholder="Registered Email"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              required
              className="h-11"
            />
            <Button type="submit" disabled={fpLoading} className="w-full h-11 font-semibold">
              {fpLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
