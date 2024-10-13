import React, { useState, useEffect } from 'react';
import { Mic, ChevronRight } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/command';

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setOutput(['Welcome to EggsGuy Voice Assistant! Ready to learn together?']);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await executeCommand(input);
      setInput('');
    }
  };

  const executeCommand = async (command: string) => {
    setOutput(prev => [...prev, `> ${command}`]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      setOutput(prev => [...prev, data.response]);
    } catch (error) {
      setOutput(prev => [...prev, `Error: Unable to reach the server. Make sure the Flask backend is running.`]);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setOutput(prev => [...prev, 'Listening for voice input...']);
      // Simulating voice recognition (replace with actual implementation later)
      setTimeout(() => {
        const recognizedText = 'What is the capital of France?';
        executeCommand(recognizedText);
        setIsListening(false);
      }, 3000);
    } else {
      setOutput(prev => [...prev, 'Voice input stopped.']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">EggsGuy Voice Assistant</h1>
        <div className="text-sm">{isListening ? 'Listening...' : 'Idle'}</div>
      </header>
      <main className="flex-grow p-4 overflow-auto">
        {output.map((line, index) => (
          <p key={index} className="mb-2">{line}</p>
        ))}
      </main>
      <footer className="bg-white p-4 border-t">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command..."
            className="flex-grow border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors">
            <ChevronRight />
          </button>
          <button type="button" onClick={handleVoiceInput} className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            <Mic />
          </button>
        </form>
      </footer>
    </div>
  );
}