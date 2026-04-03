"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface Props {
  onSave: (signature: string) => void;
}

export default function SignaturePad({ onSave }: Props) {
  const sigCanvas = useRef<any>(null);
  const [error, setError] = useState("");

  const clear = () => {
    sigCanvas.current?.clear();
    setError("");
  };

  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      setError("Please provide a signature before submitting.");
      return;
    }
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div 
        style={{ 
          border: "2px dashed var(--border-color)", 
          borderRadius: "var(--radius-md)", 
          background: "var(--bg-color)",
          overflow: "hidden",
          touchAction: "none"
        }}
      >
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: "sigCanvas",
            style: { width: "100%", height: "200px" }
          }}
        />
      </div>
      
      {error && <div style={{ color: "var(--danger-color)", fontSize: "0.9rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "1rem" }}>
        <button className="btn-secondary" onClick={clear}>Clear</button>
        <button className="btn-primary" onClick={handleSave}>Sign & Complete</button>
      </div>
    </div>
  );
}
