import React, { useState, useRef, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";

// Global styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
    background-color: #fff; /* white */
  }
`;

// Layout
const Container = styled.div`
  display: flex;
  height: 100vh;
  box-sizing: border-box;
  margin: 16px;
  height: calc(100vh - 32px);
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
`;

const ChatPanel = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #a78bfa;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08), 
              0 4px 8px rgba(0, 0, 0, 0.06), 
              0 2px 4px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
`;

const RenderPanel = styled.div`
  width: 70%;
  background: #fff;
  padding: 20px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08), 
              0 4px 8px rgba(0, 0, 0, 0.06), 
              0 2px 4px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
`;

// Chat transcript area
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Chat bubbles
const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 12px;
  font-size: 14px;
  color: ${(props) =>
    props.type === "received" ? "#fff" : props.type === "system" ? "#fff" : "#000"};
  background-color: ${(props) =>
    props.type === "sent"
      ? "#d8b4fe" // light purple
      : props.type === "received"
      ? "#6b21a8" // dark purple
      : "#9ca3af"}; // system = lighter gray
  font-family: ${(props) => (props.type === "system" ? "'IBM Plex Mono', monospace" : "inherit")};
  align-self: ${(props) =>
    props.type === "sent" ? "flex-end" : props.type === "received" ? "flex-start" : "center"};
  text-align: ${(props) =>
    props.type === "sent" ? "right" : props.type === "received" ? "left" : "center"};
`;

// Input area
const InputArea = styled.div`
  padding: 10px;
  background: #e9d5ff;
  display: flex;
  gap: 10px;
`;

const Input = styled.textarea`
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #a78bfa;
  resize: none;
  font-size: 14px;
  outline: none;
`;

const SendButton = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #6d28d9;
  }
`;

export default function ChatLayout() {
  const [messages, setMessages] = useState([
    { type: "system", text: "AI ChatSight Studio" },
    { type: "received", text: "Hello, how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [renderContent, setRenderContent] = useState("");
  const messagesEndRef = useRef(null);

  const botReplies = [
    "I'm here to assist you.",
    "Can you tell me more?",
    "Here's the sales data table I generated for you.",
    "Let me check on that for you.",
    "I see, please go on.",
  ];

  const htmlContent = `<table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Product</th>
          <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Sales</th>
          <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Growth</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px;">Widget A</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">$45,000</td>
          <td style="border: 1px solid #d1d5db; padding: 12px; color: #059669;">+12%</td>
        </tr>
        <tr style="background-color: #f9fafb;">
          <td style="border: 1px solid #d1d5db; padding: 12px;">Widget B</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">$32,000</td>
          <td style="border: 1px solid #d1d5db; padding: 12px; color: #dc2626;">-5%</td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px;">Widget C</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">$58,000</td>
          <td style="border: 1px solid #d1d5db; padding: 12px; color: #059669;">+18%</td>
        </tr>
      </tbody>
    </table>`;

  const imageContent = `<div style="text-align: center; margin: 20px 0;">
      <h3 style="color: #374151; margin-bottom: 16px;">Sales Performance Chart</h3>
      <img src="https://picsum.photos/600/400" 
           alt="Sales Performance Dashboard" 
           style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" 
           onError="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNjM2NmYxIi8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2FsZXMgRGFzaGJvYXJkPC90ZXh0Pgo8L3N2Zz4K'" />
      <p style="color: #6b7280; margin-top: 12px; font-size: 14px;">
        Interactive sales dashboard showing quarterly performance metrics
      </p>
    </div>`;

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { type: "sent", text: input }]);
    
    // Check if user typed "render" to trigger HTML table rendering
    if (input.toLowerCase().includes('render')) {
      setRenderContent(htmlContent);
      setMessages((prev) => [...prev, { type: "received", text: "Here's the sales data table I generated for you." }]);
      setInput("");
      return;
    }
    
    // Check if user typed "image" to trigger image rendering
    if (input.toLowerCase().includes('image')) {
      setRenderContent(imageContent);
      setMessages((prev) => [...prev, { type: "received", text: "Here's the sales performance chart I created for you." }]);
      setInput("");
      return;
    }
    
    setInput("");

    // Fake bot reply after 1.5s
    setTimeout(() => {
      const randomReply =
        botReplies[Math.floor(Math.random() * botReplies.length)];
      setMessages((prev) => [...prev, { type: "received", text: randomReply }]);
      
      // If the reply mentions "table" or "data", render the HTML table
      if (randomReply.includes('table') || randomReply.includes('data')) {
        setRenderContent(htmlContent);
      }
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <GlobalStyle />
      <Container>
        {/* Left Chat Panel */}
        <ChatPanel>
          <MessagesContainer>
            {messages.map((msg, index) => (
              <MessageBubble key={index} type={msg.type}>
                {msg.text}
              </MessageBubble>
            ))}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputArea>
            <Input
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
            <SendButton onClick={sendMessage}>Send</SendButton>
          </InputArea>
        </ChatPanel>

        {/* Right Render Panel */}
        <RenderPanel>
          {renderContent && (
            <div dangerouslySetInnerHTML={{ __html: renderContent }} />
          )}
        </RenderPanel>
      </Container>
    </>
  );
}
