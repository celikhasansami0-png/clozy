"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "./onboarding.module.css";

const CLIENT_COUNT_OPTIONS = ["1 to 5", "5 to 20", "20+"];

export default function OnboardingPage() {
  const router = useRouter();
  const [clientCount, setClientCount] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = Boolean(clientCount) && companyName.trim().length > 0;

  async function handleContinue() {
    if (!canContinue) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("You need to be logged in to continue.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        client_count: clientCount,
        company_name: companyName.trim(),
        onboarded: true,
      })
      .eq("id", user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <div className={`card ${styles.card}`}>
        <h1 className={styles.heading}>
          How many clients are you currently managing?
        </h1>

        <div className={styles.options}>
          {CLIENT_COUNT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles.option} ${
                clientCount === option ? styles.optionSelected : ""
              }`}
              onClick={() => setClientCount(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="companyName">
            Company name
          </label>
          <Input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Agency"
          />
        </div>

        {error && <p className="text-error">{error}</p>}

        <Button onClick={handleContinue} disabled={!canContinue || loading}>
          {loading ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
