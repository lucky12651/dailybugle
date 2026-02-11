import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download } from "lucide-react";

const QRCodeGenerator = ({ qrUrl, setQrUrl, downloadQRCode }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <QrCode className="text-green-500" />
        Generate QR Code
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="qrUrl"
            className="block text-sm font-medium text-zinc-400 mb-2"
          >
            Enter URL to generate QR code
          </label>
          <input
            type="url"
            id="qrUrl"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            placeholder="https://example.com/my-url"
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-white placeholder-zinc-600 transition-all"
          />
        </div>

        {qrUrl && (
          <div className="flex flex-col items-center space-y-6 pt-4">
            <div className="p-6 bg-white rounded-2xl shadow-xl shadow-white/5 border border-zinc-200">
              <QRCodeSVG
                id="qr-code-svg"
                value={qrUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <button
              onClick={() => downloadQRCode("qr-code-svg")}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-black rounded-xl font-bold transition-all group"
            >
              <Download size={18} />
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
