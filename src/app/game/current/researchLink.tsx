import { twMerge } from "tailwind-merge";

export function ResearchLink({
  name,
  displayName,
  className,
}: {
  name?: string;
  displayName: string;
  className?: string;
}) {
  if (process.env.NEXT_PUBLIC_TECH_TREE_VIEWER) {
    return (
      <a
        href={`${process.env.NEXT_PUBLIC_TECH_TREE_VIEWER}${name ? "#/" + name : ""}`}
        target="_blank"
        rel="noopener noreferrer"
        className={twMerge("underline", className)}
      >
        {displayName}
      </a>
    );
  } else {
    return <span className={twMerge("underline", className)}>{displayName}</span>;
  }
}
