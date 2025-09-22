import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import "./login.css";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserRow } from "@/integrations/supabase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Unable to sign in");
      setStatus("error");
    }
  }

  async function handleGoogleSignIn() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: "select_account"
          }
        }
      });
      if (error) throw error;
      // For PKCE flow, redirect happens; ensure user row when control returns
      await ensureUserRow();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Google sign-in failed");
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Unable to sign up");
      setStatus("error");
    }
  }

  return (
    <div className="container mx-auto px-4 py-14">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form className="form w-full" onSubmit={handleSignIn}>
                <div className="title">Welcome back<br /><span>Use your email and password</span></div>
                <div className="login-with" aria-label="Sign in with">
                  <button type="button" className="button-log" onClick={handleGoogleSignIn} title="Sign in with Google" aria-label="Sign in with Google">
                    <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M12 10.2v3.85h5.45c-.24 1.24-1.64 3.64-5.45 3.64-3.28 0-5.96-2.71-5.96-6.05s2.68-6.05 5.96-6.05c1.87 0 3.12.79 3.84 1.48l2.62-2.53C16.94 3.05 14.7 2 12 2 6.94 2 2.87 6.07 2.87 11.14S6.94 20.29 12 20.29c6.94 0 9.18-4.86 9.18-7.36 0-.49-.05-.86-.11-1.23H12z"/>
                    </svg>
                  </button>
                </div>
                <Label htmlFor="email" className="sr-only">Email</Label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Label htmlFor="password" className="sr-only">Password</Label>
                <div className="input-wrap">
                  <input
                    id="password"
                    className="input"
                    type={showPwd ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="toggle-eye" onClick={() => setShowPwd(v => !v)} aria-label={showPwd ? "Hide password" : "Show password"}>
                    {showPwd ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10.58 6.08A9.77 9.77 0 0112 6c5 0 9.27 3.11 11 7.5-.49 1.22-1.22 2.34-2.14 3.3M6.35 6.35C4.6 7.6 3.2 9.36 2 11.5c1.61 3.19 4.7 5.54 8.21 6.28 1.01.22 2.06.34 3.14.34 1.08 0 2.13-.12 3.14-.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errorMsg && <p className="helper">{errorMsg}</p>}
                {status === "success" && <p className="helper">Signed in successfully.</p>}
                <button className="button-confirm" type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="form w-full" onSubmit={handleSignUp}>
                <div className="title">Create account<br /><span>Verify via email after sign up</span></div>
                <Label htmlFor="fullName" className="sr-only">Name</Label>
                <input
                  id="fullName"
                  className="input"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Label htmlFor="signupEmail" className="sr-only">Email</Label>
                <input
                  id="signupEmail"
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Label htmlFor="signupPassword" className="sr-only">Password</Label>
                <div className="input-wrap">
                  <input
                    id="signupPassword"
                    className="input"
                    type={showSignupPwd ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="toggle-eye" onClick={() => setShowSignupPwd(v => !v)} aria-label={showSignupPwd ? "Hide password" : "Show password"}>
                    {showSignupPwd ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10.58 6.08A9.77 9.77 0 0112 6c5 0 9.27 3.11 11 7.5-.49 1.22-1.22 2.34-2.14 3.3M6.35 6.35C4.6 7.6 3.2 9.36 2 11.5c1.61 3.19 4.7 5.54 8.21 6.28 1.01.22 2.06.34 3.14.34 1.08 0 2.13-.12 3.14-.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errorMsg && <p className="helper">{errorMsg}</p>}
                {status === "success" && <p className="helper">Sign up successful. Check your email to verify.</p>}
                <button className="button-confirm" type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Signing up..." : "Sign Up"}
                </button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;


