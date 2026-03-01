import { useState, useEffect, useRef } from "react";
import { Button, Drawer, Input, Typography, Space } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const { Text } = Typography;

export default function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi 👋 Ask me about movies, shows, seats, or your bookings." },
  ]);
  const [loading, setLoading] = useState(false);
  const userData = useSelector((s) => s.user?.userData);
  const bodyRef = useRef(null);

  const send = async () => {
    const msg = text.trim();
    if (!msg || loading) return;

    const next = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setText("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          userContext: {
            path: window.location.pathname,
            user: userData ? { id: userData._id || userData.id, email: userData.email } : null,
          },
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "No reply" }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // persist messages in sessionStorage and restore on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ai_messages");
      if (raw) setMessages(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("ai_messages", JSON.stringify(messages));
    } catch (e) {}
    // auto-scroll
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  const clearChat = () => {
    const start = [{ role: "assistant", content: "Hi 👋 Ask me about movies, shows, seats, or your bookings." }];
    setMessages(start);
    try {
      sessionStorage.setItem("ai_messages", JSON.stringify(start));
    } catch (e) {}
  };

  return (
    <>
      {/* Floating button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        className="ai-fab"
        icon={<MessageOutlined />}
        onClick={() => setOpen(true)}
        aria-label="Open AI Assistant"
      />

      {/* Chat drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Booking Assistant</span>
            <Button type="link" onClick={clearChat} style={{ padding: 0 }}>
              Clear
            </Button>
          </div>
        }
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        width={380}
      >
        <div className="ai-chat-body" ref={bodyRef} style={{ height: 420, overflowY: "auto", padding: 8 }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`ai-bubble ${m.role === "user" ? "user" : "bot"}`}
              style={{ marginBottom: 8 }}
            >
              <Text>{m.content}</Text>
            </div>
          ))}
          {loading && (
            <div className={`ai-bubble bot`} style={{ opacity: 0.8 }}>
              <Text>Typing...</Text>
            </div>
          )}
        </div>

        <Space.Compact style={{ width: "100%" }}>
          <Input
            value={text}
            placeholder="Ask about shows, seats, payments..."
            onChange={(e) => setText(e.target.value)}
            onPressEnter={send}
            disabled={loading}
          />
          <Button type="primary" onClick={send} loading={loading}>
            Send
          </Button>
        </Space.Compact>
      </Drawer>
    </>
  );
}