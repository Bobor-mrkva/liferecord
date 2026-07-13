"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import MyStoriesList from "@/components/MyStoriesList";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) return null;

  return (
    <MyStoriesList
      mode="freeform"
      heading={t("dashboard.lifeStoriesHeading")}
      emptyText={t("dashboard.lifeStoriesEmpty")}
    />
  );
}
