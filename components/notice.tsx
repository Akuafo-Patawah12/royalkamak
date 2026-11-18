export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-line bg-card text-foreground",
    error: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300",
    success:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`border px-5 py-4 text-sm ${styles}`}>
      {children}
    </div>
  );
}
