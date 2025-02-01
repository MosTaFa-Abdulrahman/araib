export const formatDate = (dateString) => {
  const date = new Date(dateString);

  // Get day and pad with leading zero if needed
  const day = date.getDate().toString().padStart(2, "0");

  // Get month abbreviation (Jan, Feb, etc)
  const month = date.toLocaleString("en-US", { month: "short" });

  // Get full year
  const year = date.getFullYear();

  // Return formatted string
  return `${day}/${month}/${year}`;
};
