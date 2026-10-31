import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI } from "@/lib/api";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setMessage("This password reset link is missing its token.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmation) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await authAPI.resetPassword(token, password);
      setMessage(response.message);
      setComplete(true);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "We could not reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-card backdrop-blur-xl">
        <h1 className="font-serif text-3xl font-bold text-center">Choose a new password</h1>
        {complete ? (
          <div className="mt-6 space-y-5 text-center">
            <p className="text-muted-foreground">{message}</p>
            <Button className="w-full" asChild><Link to="/login">Sign in</Link></Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirm new password</Label>
              <Input id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={6} required />
            </div>
            <Button type="submit" disabled={isSubmitting || !token} className="w-full">
              {isSubmitting ? "Updating…" : "Update password"}
            </Button>
            {message && <p className="text-center text-sm text-destructive">{message}</p>}
          </form>
        )}
      </section>
    </main>
  );
}
