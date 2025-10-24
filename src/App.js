import React, { useState, useRef, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";

// Global styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
    background-color: #fff; /* white */
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.6; transform: scale(0.8); }
    25% { opacity: 1; transform: scale(1.2); }
    50% { opacity: 0.8; transform: scale(1.4); }
    75% { opacity: 1; transform: scale(1.1); }
  }

  .analyzing-text {
    color: #6b7280;
    position: relative;
    font-weight: 400;
    background: linear-gradient(90deg, #374151 25%, #ffffff 50%, #374151 75%);
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 1.5s infinite;
  }

  .analyzing-text::before {
    content: '';
  }

  .analyzing-text::after {
    content: '';
  }

  .ai-sparkle-message {
    color: #374151;
    text-align: center;
    font-size: 16px;
    font-family: 'IBM Plex Mono', monospace;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .ai-sparkle-message::before {
    content: '';
  }

  .ai-sparkle-message::after {
    content: '';
  }

  @keyframes aiGlow {
    0%, 100% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  .yellow-sparkle {
    color: #fbbf24;
    filter: drop-shadow(0 0 4px #fbbf24);
    font-size: 20px;
  }
`;

// Layout
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  margin: 16px;
  height: calc(100vh - 32px);
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #6b7280;
  color: white;
  font-size: 24px;
  font-weight: 600;
  font-family: 'IBM Plex Mono', monospace;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
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
    props.type === "received" ? "#374151" : props.type === "system" ? "#fff" : props.type === "analyzing" ? "#6b7280" : "#000"};
  background-color: ${(props) =>
    props.type === "sent"
      ? "#d8b4fe" // light purple
      : props.type === "received"
      ? "#e5e7eb" // light gray
      : props.type === "analyzing"
      ? "transparent" // no background
      : "#9ca3af"}; // system = lighter gray
  font-family: 'IBM Plex Mono', monospace;
  align-self: ${(props) =>
    props.type === "sent" ? "flex-end" : props.type === "received" || props.type === "analyzing" ? "flex-start" : "center"};
  text-align: ${(props) =>
    props.type === "sent" ? "left" : props.type === "received" || props.type === "analyzing" ? "left" : "center"};
  position: relative;
  z-index: ${(props) => props.type === "sent" || props.type === "received" ? "5" : "1"};
  box-shadow: ${(props) => 
    props.type === "sent" ? "0 4px 12px rgba(124, 58, 237, 0.2)" :
    props.type === "received" ? "0 4px 12px rgba(156, 163, 175, 0.3)" : "none"};
  
  ${(props) => props.type === "analyzing" && `
    /* No background styling for analyzing */
  `}

  @keyframes pulse {
    0%, 100% { 
      transform: scale(1); 
      box-shadow: 0 0 20px rgba(156, 163, 175, 0.3);
    }
    50% { 
      transform: scale(1.02); 
      box-shadow: 0 0 30px rgba(156, 163, 175, 0.5);
    }
  }
`;

// Input area
const InputArea = styled.div`
  padding: 10px;
  background: white;
  display: flex;
  gap: 10px;
  z-index: 100;
  position: relative;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.4);
  border-radius: 16px;
`;

const Input = styled.textarea`
  flex: 1;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  resize: none;
  font-size: 14px;
  font-family: 'IBM Plex Mono', monospace;
  min-height: 60px;
  max-height: 120px;
  outline: none;
  line-height: 1.5;
  background: white;
`;

const SendButton = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;

  &:hover {
    background: #6d28d9;
  }
`;

export default function ChatLayout() {
  const [messages, setMessages] = useState([
    { type: "received", text: "Hello, how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [renderContent, setRenderContent] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
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

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setLastUserMessage(userMessage); // Store the last user message
    setMessages((prev) => [...prev, { type: "sent", text: userMessage }]);
    setInput("");
    setMessages((prev) => [...prev, { type: "analyzing", text: "Analyzing..." }]);

    try {
      const response = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage, top_k: 10 }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      
      // Remove analyzing message
      setMessages((prev) => prev.filter((msg) => msg.text !== "Analyzing..."));
      
      // If response contains HTML, render it
      if (data && typeof data.answer === "string") {
        let htmlContent = data.answer;
        
        // Extract HTML from markdown code blocks if present
        if (htmlContent.includes("```html")) {
          // More robust HTML extraction
          const htmlMatch = htmlContent.match(/```html\s*([\s\S]*?)\s*```/);
          if (htmlMatch) {
            htmlContent = htmlMatch[1].trim();
          } else {
            // Fallback method
            htmlContent = htmlContent.replace(/```html\s*/g, '');
            htmlContent = htmlContent.replace(/\s*```/g, '');
            htmlContent = htmlContent.trim();
          }
        }
        
        // Decode escaped characters that might come from the API
        console.log("Before decoding:", htmlContent.length, "chars");
        console.log("Sample before:", htmlContent.substring(0, 100));
        
        htmlContent = htmlContent
          .replace(/\\x3C/g, '<')           // Fix \x3C to < (4 chars → 1 char = -3 each)
          .replace(/\\x3E/g, '>')           // Fix \x3E to > (4 chars → 1 char = -3 each)
          .replace(/\\n/g, '\n')            // Fix newlines (2 chars → 1 char = -1 each)
          .replace(/\\t/g, '\t')            // Fix tabs (2 chars → 1 char = -1 each)
          .replace(/\\"/g, '"')             // Fix quotes (2 chars → 1 char = -1 each)
          .replace(/\\'/g, "'")             // Fix single quotes (2 chars → 1 char = -1 each)
          .replace(/\\\\/g, '\\');          // Fix backslashes (2 chars → 1 char = -1 each)
        
        console.log("After decoding:", htmlContent.length, "chars");
        console.log("Sample after:", htmlContent.substring(0, 100));
        console.log("Character difference:", data.answer.length - htmlContent.length);
        
        console.log("Original API response length:", data.answer.length);
        console.log("Processed HTML Content length:", htmlContent.length);
        console.log("Character difference:", data.answer.length - htmlContent.length);
        
        // Count specific escape sequences for debugging
        const originalContent = data.answer;
        const x3CCount = (originalContent.match(/\\x3C/g) || []).length;
        const x3ECount = (originalContent.match(/\\x3E/g) || []).length;
        const newlineCount = (originalContent.match(/\\n/g) || []).length;
        
        console.log("Escape sequence counts:");
        console.log("- \\x3C (< tags):", x3CCount, "× 3 chars saved =", x3CCount * 3);
        console.log("- \\x3E (> tags):", x3ECount, "× 3 chars saved =", x3ECount * 3);
        console.log("- \\n (newlines):", newlineCount, "× 1 char saved =", newlineCount * 1);
        console.log("- Total expected savings:", (x3CCount * 3) + (x3ECount * 3) + newlineCount);
        
        console.log("First 200 chars of processed content:", htmlContent.substring(0, 200));
        
        // Check if it contains HTML tags
        if (htmlContent.includes("<")) {
          console.log("Setting render content:", htmlContent);
          
          // If it's a full HTML document, modify it to use full width
          if (htmlContent.includes('<!DOCTYPE html>')) {
            console.log("Full HTML document detected - optimizing for full width");
            
            // Modify the CSS to use full width instead of 60%
            htmlContent = htmlContent
              .replace(/width:\s*60%/g, 'width: 40%')
              .replace(/max-width:\s*500px/g, 'max-width: 400px')
              .replace(/min-height:\s*100vh/g, 'min-height: auto')
              .replace(/display:\s*flex[^}]+justify-content:\s*center[^}]+align-items:\s*center[^}]*}/g, 
                      'display: flex; justify-content: center; align-items: flex-start; padding: 20px;');
          }
          
          setRenderContent(htmlContent);
          setMessages((prev) => [...prev, { type: "received", text: "Here's the result from AI." }]);
        } else {
          console.log("No HTML tags found, treating as text:", htmlContent);
          setMessages((prev) => [...prev, { type: "received", text: data.answer }]);
        }
      } else {
        setMessages((prev) => [...prev, { type: "received", text: "No result returned from API." }]);
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => prev.filter((msg) => msg.text !== "Analyzing..."));
      setMessages((prev) => [...prev, { type: "received", text: `Error querying API: ${error.message}` }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === "ArrowUp" && input.trim() === "") {
      e.preventDefault();
      if (lastUserMessage) {
        setInput(lastUserMessage);
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug renderContent changes
  useEffect(() => {
    console.log("renderContent state changed:", renderContent);
  }, [renderContent]);

  return (
    <>
      <GlobalStyle />
      <Container>
        <MainContent>
          {/* Left Chat Panel */}
          <ChatPanel>
            <MessagesContainer>
              {messages.map((msg, index) => (
                <MessageBubble key={index} type={msg.type}>
                  <span className={msg.type === "analyzing" ? "analyzing-text" : ""}>
                    {msg.text}
                  </span>
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
              placeholder="Ask ChatSight..."
            />
          </InputArea>
        </ChatPanel>

        {/* Right Render Panel */}
        <RenderPanel>
          {renderContent && renderContent.trim() !== "" ? (
            renderContent.includes('<!DOCTYPE html>') ? (
              <iframe
                srcDoc={renderContent}
                style={{ 
                  width: '100%', 
                  height: '600px', 
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  display: 'block'
                }}
                title="Chart Visualization"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: renderContent }} />
            )
          ) : (
            <div className="ai-sparkle-message">
              AI ChatSight Studio
            </div>
          )}
        </RenderPanel>
        </MainContent>
      </Container>
    </>
  );
}
