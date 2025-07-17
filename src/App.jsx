import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

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

function encrypt(text) {
  return text
    .toUpperCase()
    .split('')
    .map(char => cipherMap[char] || char)
    .join('');
}

function decrypt(text) {
  return text
    .toUpperCase()
    .split('')
    .map(char => reverseCipherMap[char] || char)
    .join('');
}

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedInput, setDecryptedInput] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [imageText, setImageText] = useState('');
  const [imageDecryptedText, setImageDecryptedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEncrypt = () => {
    setEncryptedText(encrypt(inputText));
  };

  const handleDecrypt = () => {
    setDecryptedText(decrypt(decryptedInput));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      const cleanedText = text.replace(/\n/g, '').trim();
      setImageText(cleanedText);
      setImageDecryptedText(decrypt(cleanedText));
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 h-full w-full">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Encrypt Section */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-bold text-blue-700">Encrypt Text</h2>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your secret message"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={handleEncrypt}
          >
            Encrypt
          </button>
          {encryptedText && (
            <p className="font-mono text-green-700 break-words">
              Encrypted: {encryptedText}
            </p>
          )}
        </div>

        {/* Decrypt Section */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-bold text-purple-700">Decrypt Text</h2>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter encrypted message"
            value={decryptedInput}
            onChange={(e) => setDecryptedInput(e.target.value)}
          />
          <button
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            onClick={handleDecrypt}
          >
            Decrypt
          </button>
          {decryptedText && (
            <p className="font-mono text-blue-700 break-words">
              Decrypted: {decryptedText}
            </p>
          )}
        </div>

        {/* Image OCR + Decryption */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-bold text-teal-700">Image Decryption (OCR)</h2>
          <label className="block w-full cursor-pointer">
            <span className="inline-block px-4 py-2 border-2 border-dashed border-gray-400 rounded-lg hover:bg-gray-100 transition">
              Choose Image File
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {loading && <p className="text-gray-600">Processing image...</p>}
          {imageText && (
            <div>
              <p className="font-mono text-gray-800 break-words">
                <strong>OCR Text:</strong> {imageText}
              </p>
              <p className="font-mono text-green-800 break-words">
                <strong>Decrypted:</strong> {imageDecryptedText}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
