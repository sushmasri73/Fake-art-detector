'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const speakSRK = (text: string) => {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.cancel(); // cancel previous speech
    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded before speaking
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = speak;
  } else {
    speak();
  }
};


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setResult(data.prediction);

      if (data.prediction.toLowerCase().includes('fake')) {
        speakSRK('This picture is fake art , dear ');
      } else {
        speakSRK('This picture is real art , dear');
      }
    } catch (error) {
      console.error(error);
      setResult('Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/artist-drawing.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <main className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg text-white text-center w-full max-w-md">
        <h1 className="text-4xl font-bold mb-6">🎨 Fake Art Detector</h1>

        <label className="mb-4 block">
          <span className="block mb-2 font-medium">Choose an image:</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-white"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold w-full disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Upload & Detect'}
        </button>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white text-xl font-medium">
            Detection Result:
            <div className="mt-2 font-bold text-2xl">{result}</div>
          </div>
        )}
      </main>
    </div>
  );
}
