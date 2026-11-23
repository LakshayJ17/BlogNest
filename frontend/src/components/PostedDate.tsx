export const PostedDate = ({ date, className }: { date: string | Date; className?: string }) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return null;

  const sameYear = value.getFullYear() === new Date().getFullYear();
  const formatted = value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  return (
    <time dateTime={value.toISOString()} className={className}>
      {formatted}
    </time>
  );
};
