// UI Helper Functions
export const downloadQRCode = (elementId) => {
  const qrCodeElement = document.querySelector(`#${elementId}`);
  if (qrCodeElement) {
    const svgData = new XMLSerializer().serializeToString(qrCodeElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 200;
    canvas.height = 200;

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "qr-code.png";
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }
};
