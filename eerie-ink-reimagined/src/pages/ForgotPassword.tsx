import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI } from "@/lib/api";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await authAPI.requestPasswordReset(email);
      setMessage(response.message);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "We could not send a reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-card backdrop-blur-xl">
        <h1 className="font-serif text-3xl font-bold text-center">Reset your password</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">Enter your email and we’ll send a one-hour reset link.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-muted-foreground">{message}</p>}
        <p className="mt-6 text-center text-sm text-muted-foreground"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
      </section>
    </main>
  );
}
