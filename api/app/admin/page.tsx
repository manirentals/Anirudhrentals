"use client";

import { useState } from "react";

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    lessorName: "Anirudh Ahlawat",
    lessorAddress: "36 Clearwater Rise Parade, Truganina VIC 3029",
    lessorPhone: "+61 401 991 420",
    lessorEmail: "a.ahlawat@hotmail.com",
    clientName: "",
    clientAddress: "",
    clientLicence: "",
    clientState: "",
    clientExpiry: "",
    clientEmail: "",
    vehicleMake: "Haval",
    vehicleModel: "Jolion Pro Premium",
    vehicleYear: "",
    vehicleRego: "",
    vehicleVin: "",
    startDate: "",
    endDate: "",
    bondAmount: "1000",
    weeklyPayment: "290",
    dlfAmount: "2000",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendContract = async () => {
    setIsLoading(true);
    setStatusMsg("");
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg("Contract sent successfully!");
        setTimeout(() => {
          setIsModalOpen(false);
          setStatusMsg("");
        }, 3000);
      } else {
        setStatusMsg(`Failed: ${data.error}`);
      }
    } catch {
      setStatusMsg("An error occurred while sending.");
    }
    setIsLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: "1000px" }}>
      <div className="header">
        <h1>Prepare Lease Contract</h1>
        <p>Complete all rental and lessee details to dispatch a binding agreement.</p>
      </div>

      <div className="card">
        <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(true); }} style={{ display: "grid", gap: "2rem" }}>
          <div>
            <h3 style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1rem", fontSize: "1.1rem" }}>Lessee (Primary Driver)</h3>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input required className="input-field" name="clientName" value={formData.clientName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address (To send contract)</label>
                <input required type="email" className="input-field" name="clientEmail" value={formData.clientEmail} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ gridColumn: "span 2" }}>
                <label className="input-label">Residential Address</label>
                <input required className="input-field" name="clientAddress" value={formData.clientAddress} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Driver's Licence No.</label>
                <input required className="input-field" name="clientLicence" value={formData.clientLicence} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">State of Issue</label>
                <input required className="input-field" name="clientState" value={formData.clientState} onChange={handleChange} placeholder="e.g. VIC" />
              </div>
              <div className="input-group">
                <label className="input-label">Licence Expiry</label>
                <input required type="date" className="input-field" name="clientExpiry" value={formData.clientExpiry} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1rem", fontSize: "1.1rem" }}>Vehicle Details</h3>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
              <div className="input-group">
                <label className="input-label">Make</label>
                <input required className="input-field" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Model</label>
                <input required className="input-field" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Year / Colour</label>
                <input required className="input-field" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} placeholder="e.g. 2022 / Silver" />
              </div>
              <div className="input-group">
                <label className="input-label">Registration Number</label>
                <input required className="input-field" name="vehicleRego" value={formData.vehicleRego} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ gridColumn: "span 2" }}>
                <label className="input-label">VIN</label>
                <input required className="input-field" name="vehicleVin" value={formData.vehicleVin} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1rem", fontSize: "1.1rem" }}>Rental Parameters</h3>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
              <div className="input-group">
                <label className="input-label">Commencement Date</label>
                <input required type="date" className="input-field" name="startDate" value={formData.startDate} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Expiry Date</label>
                <input required type="date" className="input-field" name="endDate" value={formData.endDate} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Weekly Rental Rate ($)</label>
                <input required type="number" className="input-field" name="weeklyPayment" value={formData.weeklyPayment} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Security Bond ($)</label>
                <input required type="number" className="input-field" name="bondAmount" value={formData.bondAmount} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Damage Liability Fee (DLF) ($)</label>
                <input required type="number" className="input-field" name="dlfAmount" value={formData.dlfAmount} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}>
              Review & Send Contract
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1rem" }}>Confirm Dispatch</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Are you sure you want to send this contract to <strong>{formData.clientEmail}</strong>?
            </p>
            <ul style={{ marginBottom: "2rem", listStyle: "none", lineHeight: "1.6" }}>
              <li><strong>Client:</strong> {formData.clientName}</li>
              <li><strong>Vehicle:</strong> {formData.vehicleMake} {formData.vehicleModel} ({formData.vehicleRego})</li>
              <li><strong>Term:</strong> {formData.startDate} to {formData.endDate}</li>
            </ul>

            {statusMsg && (
              <div style={{ marginBottom: "1rem", padding: "1rem", background: "var(--bg-color)", borderRadius: "var(--radius-md)", color: statusMsg.includes("success") ? "var(--success-color)" : "var(--danger-color)" }}>
                {statusMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button disabled={isLoading} className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button disabled={isLoading} className="btn-primary" onClick={handleSendContract}>
                {isLoading ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
