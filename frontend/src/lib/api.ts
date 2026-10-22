
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
).replace(/\/+$/, "");

export async function submitRsvp(payload: {
  fullName: string;
  attendanceResponse: "attending" | "celebrating_from_afar";
  message: string;
  privacyConsent: true;
  website: "";
}) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/public/rsvp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "We couldn't connect to the wedding RSVP service. Please try again."
    );
  }

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "We couldn't submit your RSVP. Please try again.";

    throw new Error(errorMessage);
  }

  return result;
}
