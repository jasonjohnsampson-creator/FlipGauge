export function AuthMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (error) return <div className="message message-error">{error}</div>;
  if (success) return <div className="message message-success">{success}</div>;
  return null;
}
