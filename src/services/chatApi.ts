import axios from "axios";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const CHAT_API_URL = "/api/chat";

export async function sendChatMessage(
  message: string,
  sessionId: string,
): Promise<string> {
  const payload = { message, sessionId };

  const response = await axios.post(CHAT_API_URL, payload, {
    timeout: 90000,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/plain",
    },
    responseType: "text",
    transformResponse: [(data) => data],
  });

  console.log("RAW RESPONSE:", response.data);

  const aiText =
    typeof response.data === "string"
      ? response.data
      : (response.data as { text?: string })?.text || "";

  return aiText.trim();
}
