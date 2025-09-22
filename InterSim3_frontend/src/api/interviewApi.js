import { API_BASE_URL } from "../config";

// Setup Interview API
export async function setupInterview(data) {
  const response = await fetch(`${API_BASE_URL}/setup-interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(`Failed to setup interview: ${response.status} ${response.statusText}`);
  }

  return await response.json(); // { access_code, message }
}
