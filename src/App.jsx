import React, { useState } from 'react';
import { motion } from 'framer-motion';

const cipherMap = {
  A: 'Q', B: 'W', C: 'E', D: 'R', E: 'T',
  F: 'Y', G: 'U', H: 'I', I: 'O', J: 'P',
  K: 'A', L: 'S', M: 'D', N: 'F', O: 'G',
  P: 'H', Q: 'J', R: 'K', S: 'L', T: 'Z',
  U: 'X', V: 'C', W: 'V', X: 'B', Y: 'N', Z: 'M'
};
const reverseCipherMap = Object.fromEntries(
  Object.entries(cipherMap).map(([k, v]) => [v, k])
);
const encrypt = text => text.toUpperCase().split('').map(c => cipherMap[c] || c).join('');
const decrypt = text => text.toUpperCase().split('').map(c => reverseCipherMap[c] || c).join('');

export default function App() {
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedInput, setDecryptedInput] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [imageText, setImageText] = useState('');
  const [imageDecryptedText, setImageDecryptedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrApiKey, setOcrApiKey] = useState(import.meta.env.VITE_OCR_API_KEY || '');

  const handleEncrypt = () => setEncryptedText(encrypt(inputText));
  const handleDecrypt = () => setDecryptedText(decrypt(decryptedInput));

  const processWithOCRSpace = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('isTable', 'false');
    formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy
    
    // Add API key if provided, otherwise use free tier
    if (ocrApiKey) {
      formData.append('apikey', ocrApiKey);
    } else {
      // Use environment variable if available, otherwise fall back to free tier
      const envApiKey = import.meta.env.VITE_OCR_API_KEY;
      formData.append('apikey', envApiKey || 'helloworld');
    }

    try {
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || 'OCR processing failed');
      }

      if (result.ParsedResults && result.ParsedResults.length > 0) {
        const parsedText = result.ParsedResults[0].ParsedText;
        if (parsedText) {
          return parsedText.trim();
        }
      }

      throw new Error('No text detected in the image');
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (OCR.space free tier has 1MB limit)
    if (file.size > 1024 * 1024) {
      alert('File size too large. Please use an image smaller than 1MB or get an API key for larger files.');
      return;
    }
    
    setLoading(true);
    setImageText('');
    setImageDecryptedText('');
    
    try {
      const extractedText = await processWithOCRSpace(file);
      const cleaned = extractedText.replace(/\r\n/g, ' ').replace(/\n/g, ' ').trim();
      setImageText(cleaned);
      setImageDecryptedText(decrypt(cleaned));
    } catch (err) {
      console.error('OCR Error:', err);
      setImageText(`Error: ${err.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            CipherCraft Pro
          </h1>
          <p className="text-xl text-gray-300">
            Advanced encryption with AI-powered OCR
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <SectionCard
            title="🔒 Encrypt Text"
            accent="cyan"
            value={inputText}
            onChange={setInputText}
            action={handleEncrypt}
            result={encryptedText}
            button="Encrypt"
            placeholder="Enter text to encrypt..."
          />
          <SectionCard
            title="🔓 Decrypt Text"
            accent="purple"
            value={decryptedInput}
            onChange={setDecryptedInput}
            action={handleDecrypt}
            result={decryptedText}
            button="Decrypt"
            placeholder="Enter encrypted text..."
          />
        </div>

        <motion.div
          className="bg-gradient-to-r from-gray-800 to-gray-700 p-8 rounded-3xl shadow-2xl border border-gray-600"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
            🔍 OCR Text Recognition
            <span className="text-sm bg-green-500 px-2 py-1 rounded-full text-white">OCR.space</span>
          </h2>
          
          <div className="mb-6">
            {/* <label className="block text-sm font-medium text-gray-300 mb-3">
              OCR.space API Key {import.meta.env.VITE_OCR_API_KEY ? '(Default key loaded)' : '(Optional - free tier available)'}:
            </label>
            <input
              type="password"
              className="w-full p-3 bg-gray-900 text-white border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              placeholder={import.meta.env.VITE_OCR_API_KEY ? "Using environment key (override if needed)" : "Enter your OCR.space API key (optional)"}
              value={ocrApiKey}
              onChange={e => setOcrApiKey(e.target.value)}
            /> */}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl cursor-pointer hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Image for OCR
              </span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </label>

            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
                <span className="ml-4 text-green-400 font-medium">
                  Processing with OCR.space... Please wait
                </span>
              </div>
            )}

            {imageText && (
              <motion.div
                className="space-y-4 p-6 bg-gray-800 rounded-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">📝 Extracted Text:</h3>
                  <p className="font-mono text-blue-300 break-words">{imageText}</p>
                </div>
                
                {!imageText.startsWith('Error:') && (
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">🔓 Decrypted Result:</h3>
                    <p className="font-mono text-green-400 break-words font-bold">{imageDecryptedText}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

         
        </motion.div>
      </div>
    </div>
  );
}

function SectionCard({ title, accent, value, onChange, action, result, button, placeholder }) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-400',
      button: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      text: 'text-cyan-400',
      ring: 'focus:ring-cyan-400'
    },
    purple: {
      border: 'border-purple-400',
      button: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      text: 'text-purple-400',
      ring: 'focus:ring-purple-400'
    }
  };

  const colors = colorMap[accent];

  return (
    <motion.div
      className={`bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-3xl shadow-2xl border-2 ${colors.border}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: accent === 'cyan' ? 0.2 : 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>{title}</h2>
      <div className="space-y-4">
        <input
          type="text"
          className={`w-full p-4 bg-gray-900 text-white border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 ${colors.ring} focus:border-transparent transition-all`}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button
          className={`w-full py-3 text-white font-semibold rounded-xl transition-all shadow-lg ${colors.button}`}
          onClick={action}
        >
          {button}
        </button>
        {result && (
          <motion.div
            className="p-4 bg-gray-900 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-gray-400 mb-1">Result:</p>
            <p className="font-mono text-green-400 break-words font-bold">{result}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}