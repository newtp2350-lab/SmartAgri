import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
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
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
                <input
                  id="signupPassword"
                  className="input"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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


