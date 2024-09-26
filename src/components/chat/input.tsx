// components/ChatInput.js
import { useState } from 'react';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const sendMessage = async () => {
    // Create FormData to send both message and file
    const formData = new FormData();
    formData.append('message', message);
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch('/api/messages/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log(data); // Handle response (like saving message in your DB)
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <input type="file" onChange={handleFileChange} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatInput;
