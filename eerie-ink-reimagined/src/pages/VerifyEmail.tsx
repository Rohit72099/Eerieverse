import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type VerificationStatus = "idle" | "verifying" | "verified" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [status, setStatus] = useState<VerificationStatus>(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const verifiedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token || verifiedToken.current === token) return;

    verifiedToken.current = token;
    const verify = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        setMessage(response.message);
        setStatus("verified");
      } catch (error: any) {
        setMessage(error.response?.data?.message || "We could not verify this link.");
        setStatus("error");
      }
    };

    void verify();
  }, [token]);

  const resend = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsResending(true);
    setMessage("");

    try {
      const response = await authAPI.resendVerification(email);
      setMessage(response.message);
      setStatus("idle");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "We could not send the verification email.");
      setStatus("error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-card backdrop-blur-xl">
        <h1 className="font-serif text-3xl font-bold text-center">Verify your email</h1>

        {status === "verifying" && <p className="mt-5 text-center text-muted-foreground">Verifying your link…</p>}

        {status === "verified" ? (
          <div className="mt-5 space-y-5 text-center">
            <p className="text-muted-foreground">{message}</p>
            <Button className="w-full" asChild><Link to="/login">Sign in</Link></Button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {status === "error" ? message : "We sent a verification link to your email address."}
            </p>
            <form onSubmit={resend} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <Button type="submit" disabled={isResending} className="w-full">
                {isResending ? "Sending…" : "Resend verification email"}
              </Button>
            </form>
            {!token && message && <p className="mt-4 text-center text-sm text-muted-foreground">{message}</p>}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
