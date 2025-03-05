'use client';

import { useEffect, useState } from "react";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import { SubmitButton } from "@/app/components/submit-button";
import Link from "next/link";
import Image from 'next/image'
import { supabase } from '@/utils/supabase/client';
const baseUrl ="http://localhost:3000";
export default function Login(props: { searchParams: Promise<Message> }) {
  const [message, setMessage] = useState<Message | null>(null);
  useEffect(() => {
    const loadGoogleScript = () => {
      return new Promise((resolve) => {
        if (window.google) {
          resolve(true);
          return;
        }
  
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        document.head.appendChild(script);
      });
    };
  
    loadGoogleScript().then(() => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "", // Ensure fallback
          callback: handleSignIn,
        });
      }
    });
  
  }, []);

    const handleSignIn = async () => {
      const redirectTo = `${baseUrl}/auth/callback?redirect_to=/protected`;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    };
  // Fetch the message asynchronously on component mount
  useEffect(() => {
    const fetchMessage = async () => {
      const messageData = await props.searchParams;
      setMessage(messageData);
    };

    fetchMessage();
  }, [props.searchParams]);

  if (!message) return null; // Prevent rendering until searchParams are loaded

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">Welcome</h1>
        <p className="text-sm text-center text-gray-600">
          Log in to your account to continue to Krammy
        </p>

        <form action={signInAction} className="space-y-4">
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address*" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password*" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="text-right mt-2">
              <Link 
                href="/forgot-password" 
                className="text-sm text-teal-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-2 text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors"
          >
            Continue
          </button>

          {message && <FormMessage message={message} />}

          <div className="text-center text-sm text-gray-600">
            Don't have an account? <Link href="/sign-up" className="text-teal-600 hover:underline">Sign up</Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full border-t border-gray-300 my-4"></div>
            <span className="px-4 text-gray-600 bg-white absolute">OR</span>
          </div>

                 <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => google.accounts.id.prompt()} 
                  >
                    <Image src="/google-icon.png" alt="Google" width={20} height={20} />
                    <span>Continue with Google</span>
                  </button>
        </form>
      </div>
    </div>
  );
}