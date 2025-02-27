'use client';

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import { SubmitButton } from "@/app/components/submit-button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Signup(props: { searchParams: Promise<Message> }) {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useState<Message | undefined>(undefined);

  useEffect(() => {
    const fetchSearchParams = async () => {
      const params = await props.searchParams;
      setSearchParams(params);
      // If there's an email in the params, set it
      if ("email" in params && typeof params.email === 'string') {
        setEmail(params.email);
      }
    };
    fetchSearchParams();
  }, [props.searchParams]);

  if (!searchParams) return null; // Prevent rendering until searchParams are loaded

  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            placeholder="you@example.com"
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
