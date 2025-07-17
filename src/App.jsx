// App.jsx
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import { Player } from '@lottiefiles/react-lottie-player';
import './App.css';

import floatingBlobs from './lottie/floating-blobs.json';
import sparkle from './lottie/sparkle.json';

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

  const handleEncrypt = () => setEncryptedText(encrypt(inputText));
  const handleDecrypt = () => setDecryptedText(decrypt(decryptedInput));
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      const cleaned = text.replace(/\n/g, '').trim();
      setImageText(cleaned);
      setImageDecryptedText(decrypt(cleaned));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#131a29] to-[#0d1117] text-white relative overflow-hidden p-6">
      <Player autoplay loop src={floatingBlobs}
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0" />
      <Player autoplay loop src={sparkle}
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0" />

      <div className="relative z-10 max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-teal-300">CipherCraft</h1>
        <p className="text-gray-400">Encrypt &amp; decrypt securely. Also works on images!</p>
      </div>

      <div className="relative z-10 space-y-10 max-w-2xl mx-auto">
        <SectionCard
          title="Encrypt Text"
          accent="teal"
          tooltip="Type a message and click encrypt"
          value={inputText}
          onChange={setInputText}
          action={handleEncrypt}
          result={encryptedText}
          button="Encrypt"
        />
        <SectionCard
          title="Decrypt Text"
          accent="orange"
          tooltip="Paste your ciphered text here"
          value={decryptedInput}
          onChange={setDecryptedInput}
          action={handleDecrypt}
          result={decryptedText}
          button="Decrypt"
        />
        <motion.div
          className="bg-[#1f2330] p-6 rounded-2xl shadow-xl border-l-4 border-purple-400"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-purple-300">Image OCR Decrypt 🔍</h2>
          <p className="text-gray-400 mb-2">Upload an image to decode hidden text.</p>
          <label className="block cursor-pointer">
            <span className="inline-block px-4 py-2 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-800 transition text-sm">
              Choose Image
            </span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          {loading && <p className="text-teal-300 animate-pulse">Reading image...</p>}
          {imageText && (
            <div className="space-y-2">
              <p className="font-mono text-gray-200"><strong>OCR:</strong> {imageText}</p>
              <p className="font-mono text-green-300"><strong>Result:</strong> {imageDecryptedText}</p>
            </div>
          )}
        </motion.div>
      </div>

      <Tooltip id="tooltip" className="z-50" />
    </div>
  );
}

function SectionCard({ title, accent, tooltip, value, onChange, action, result, button }) {
  const borderChoices = { teal: 'border-teal-400', orange: 'border-orange-400' };
  const buttonChoices = {
    teal: 'bg-teal-500 hover:bg-teal-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  };
  const ringChoices = { teal: 'focus:ring-teal-300', orange: 'focus:ring-orange-300' };

  return (
    <motion.div className={`bg-[#1f2330] p-6 rounded-2xl shadow-xl border-l-4 ${borderChoices[accent]}`}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: accent === 'teal' ? 0.2 : 0.4 }}
      data-tooltip-id="tooltip" data-tooltip-content={tooltip}
    >
      <h2 className={`text-2xl font-semibold text-${accent}-300`}>{title}</h2>
      <input
        type="text"
        className={`w-full p-3 bg-[#161a25] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 ${ringChoices[accent]}`}
        placeholder="Type here..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        className={`w-full py-2 text-white rounded-lg transition ${buttonChoices[accent]} mt-2`}
        onClick={action}
      >
        {button}
      </button>
      {result && (
        <p className="font-mono text-green-300 break-words mt-2"><strong>Result:</strong> {result}</p>
      )}
    </motion.div>
  );
}
