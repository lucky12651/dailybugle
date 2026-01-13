import React from "react";
import { QRCodeSVG } from "qrcode.react";

const QRCodeGenerator = ({ qrUrl, setQrUrl, downloadQRCode }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Generate QR Code
      </h2>
      {/* <p className="text-gray-600 text-sm mb-6">Create a QR code for any URL</p> */}

      <label
        htmlFor="qrUrl"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Enter URL to generate QR code
      </label>
      <input
        type="url"
        id="qrUrl"
        value={qrUrl}
        onChange={(e) => setQrUrl(e.target.value)}
        placeholder="https://example.com/my-url"
        className="w-full px-6 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500 transition-all duration-200"
      />

      {qrUrl && (
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <QRCodeSVG
              value={qrUrl}
              size={200}
              level="H"
              includeMargin={true}
              id="qr-code-svg"
            />
          </div>
          <button
            onClick={() => {
              downloadQRCode("qr-code-svg");
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
