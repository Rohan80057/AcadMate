export function loadAiChat(container) {
  container.innerHTML = `
    <div class="ai-chat-box fade-in">
      <h2>AI Chat Assistant 🤖</h2>
      <div id="chat-window" style="height: 300px; overflow-y: auto; background: #fff; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 6px;"></div>
      <div style="display: flex; gap: 10px;">
        <input id="user-input" type="text" placeholder="Ask Gemini anything..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #aaa;" />
        <button id="send-btn" style="padding: 10px 20px; border-radius: 6px; border: none; background: #6366f1; color: white; font-weight: bold;">Send</button>
      </div>
    </div>
  `;

  const chatWindow = container.querySelector("#chat-window");
  const userInput = container.querySelector("#user-input");
  const sendBtn = container.querySelector("#send-btn");

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function appendMessage(sender, message) {
    const msg = document.createElement("div");
    msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
    msg.style.marginBottom = "8px";
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  async function sendMessage() {
    const userMsg = userInput.value.trim();
    if (!userMsg) return;

    appendMessage("You", userMsg);
    userInput.value = "";

    const API_KEY = "AIzaSyB3G8-nQW-ZhjHyh4dv82GNhLzoFHNrufU"; // ← Replace this with your real key
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }],
        }),
      });

      const data = await response.json();
      const aiReply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
      appendMessage("Gemini", aiReply);
    } catch (error) {
      console.error("Gemini API Error:", error);
      appendMessage("Gemini", "Error: Unable to fetch response.");
    }
  }
}
