"use client";

import { useEffect, useMemo, useState } from "react";
import { Sora } from "next/font/google";
import SignaturePad from "@/components/SignaturePad";
import { supabase } from "@/utils/supabase";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

function formatDisplayDate(value: string) {
  if (!value) return "_______________";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatSignedDate(value?: string | null) {
  if (!value) return "_______________";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FieldValue({ value }: { value: string }) {
  const isEmpty = !value || value === "_______________";
  return <span className={`field-val${isEmpty ? " empty" : ""}`}>{value || "_______________"}</span>;
}

export default function SignContractPage({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchContract() {
      const { data, error: dbError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (dbError || !data) {
        setError("Contract not found or has expired.");
        setIsLoading(false);
        return;
      }

      setContract(data);
      setIsLoading(false);
    }

    fetchContract();
  }, [params.id]);

  const display = useMemo(() => {
    if (!contract) return null;

    return {
      lessorName: contract.lessor_name || "Anirudh Ahlawat",
      lessorAddress: contract.lessor_address || "36 Clearwater Rise Parade, Truganina VIC 3029",
      lessorPhone: contract.lessor_phone || "+61 401 991 420",
      lessorEmail: contract.lessor_email || "a.ahlawat@hotmail.com",
      lesseeName: contract.client_name || "_______________",
      lesseeAddress: contract.client_address || "_______________",
      lesseeLicence: contract.client_licence || "_______________",
      lesseeState: contract.client_state || "_______________",
      lesseeExpiry: formatDisplayDate(contract.client_expiry),
      vehicleMake: [contract.vehicle_make, contract.vehicle_model].filter(Boolean).join(" ") || "_______________",
      vehicleYear: contract.vehicle_year || "_______________",
      vehicleRego: contract.vehicle_rego || "_______________",
      vehicleVin: contract.vehicle_vin || "_______________",
      startDate: formatDisplayDate(contract.start_date),
      endDate: formatDisplayDate(contract.end_date),
      rentalRate: contract.weekly_payment ? `$${contract.weekly_payment}` : "_______________",
      bond: contract.bond_amount ? `$${contract.bond_amount}` : "_______________",
      dlf: contract.dlf_amount ? `$${contract.dlf_amount}` : "_______________",
      lessorSignedDate: formatSignedDate(contract.signed_at),
      lesseeSignedDate: formatSignedDate(contract.signed_at),
    };
  }, [contract]);

  if (isLoading) {
    return <div style={{ padding: "80px 24px", textAlign: "center" }}>Loading secure document...</div>;
  }

  if (error || !contract || !display) {
    return <div style={{ padding: "80px 24px", textAlign: "center", color: "#b91c1c" }}>{error}</div>;
  }

  const hasSigned = contract.status === "signed" && !!contract.signature;

  return (
    <div className={sora.className}>
      <style jsx global>{`
        body {
          background: #f4f6f9;
          color: #2c3340;
        }
      `}</style>

      <div className="topbar">
        <span className="topbar-title">Motor Vehicle Rental Agreement</span>
      </div>

      <div className="doc-outer" id="docPreview">
        <div className="doc-header">
          <h1>Motor Vehicle Rental Agreement</h1>
          <div className="subtitle">Private Arrangement - Victoria, Australia</div>
        </div>

        <div className="doc-body">
          {hasSigned && (
            <div className="signed-banner">
              This agreement has been digitally signed and saved.
            </div>
          )}

          <p className="intro-text">
            This Motor Vehicle Rental Agreement (<strong>"Agreement"</strong>) is entered into on the Date of Signing
            specified in the Schedule below, and establishes binding legal obligations between the Vehicle Owner (
            <strong>"Lessor"</strong>) and the Renter (<strong>"Lessee"</strong>) on the terms set out herein.
          </p>

          <div className="clause">
            <div className="clause-title">1. Definitions and Interpretation</div>
            <p><strong>1.1 ACL</strong> means the Australian Consumer Law as set out in Schedule 2 of the Competition and Consumer Act 2010 (Cth).</p>
            <p><strong>1.2 Damage Liability Fee (DLF)</strong> means the maximum predetermined amount the Lessee is contractually liable to pay per incident in the event of loss or damage to the Vehicle, provided there has been no Material Breach of this Agreement.</p>
            <p><strong>1.3 Fair Wear and Tear</strong> means the objective standard of acceptable vehicle deterioration resulting from normal, reasonable use.</p>
            <p><strong>1.4 PPSA</strong> means the Personal Property Securities Act 2009 (Cth) and associated regulations.</p>
            <p><strong>1.5 Vehicle</strong> means the motor vehicle described in the Schedule, including all keys, remote entry devices, accessories, tools, tyres, and equipment supplied with it.</p>
          </div>

          <div className="schedule-title">2. Schedule of Details</div>
          <table className="schedule-table">
            <tbody>
              <tr className="section-row"><td colSpan={2}>Lessor (Vehicle Owner)</td></tr>
              <tr><td>Full Name / Company</td><td><FieldValue value={display.lessorName} /></td></tr>
              <tr><td>Address</td><td><FieldValue value={display.lessorAddress} /></td></tr>
              <tr><td>Contact Number</td><td><FieldValue value={display.lessorPhone} /></td></tr>
              <tr><td>Email Address</td><td><FieldValue value={display.lessorEmail} /></td></tr>

              <tr className="section-row"><td colSpan={2}>Lessee (Primary Driver)</td></tr>
              <tr><td>Full Name</td><td><FieldValue value={display.lesseeName} /></td></tr>
              <tr><td>Address</td><td><FieldValue value={display.lesseeAddress} /></td></tr>
              <tr><td>Driver&apos;s Licence No.</td><td><FieldValue value={display.lesseeLicence} /></td></tr>
              <tr><td>State / Country of Issue</td><td><FieldValue value={display.lesseeState} /></td></tr>
              <tr><td>Licence Expiry Date</td><td><FieldValue value={display.lesseeExpiry} /></td></tr>

              <tr className="section-row"><td colSpan={2}>Vehicle Details</td></tr>
              <tr><td>Make / Model</td><td><FieldValue value={display.vehicleMake} /></td></tr>
              <tr><td>Year</td><td><FieldValue value={display.vehicleYear} /></td></tr>
              <tr><td>Registration Number</td><td><FieldValue value={display.vehicleRego} /></td></tr>
              <tr><td>VIN</td><td><FieldValue value={display.vehicleVin} /></td></tr>

              <tr className="section-row"><td colSpan={2}>Rental Parameters</td></tr>
              <tr><td>Rental Commencement Date</td><td><FieldValue value={display.startDate} /></td></tr>
              <tr><td>Rental Expiry Date</td><td><FieldValue value={display.endDate} /></td></tr>
              <tr><td>Weekly Rental Rate</td><td><FieldValue value={display.rentalRate} /></td></tr>
              <tr><td>Security Bond</td><td><FieldValue value={display.bond} /></td></tr>
              <tr><td>Damage Liability Fee (DLF)</td><td><FieldValue value={display.dlf} /></td></tr>
            </tbody>
          </table>

          <div className="clause">
            <div className="clause-title">3. Grant of Lease, Term, and Pricing</div>
            <p><strong>3.1</strong> The Lessor grants the Lessee the right to possess and operate the Vehicle for the term specified in the Schedule, subject strictly to the terms of this Agreement.</p>
            <p><strong>3.2</strong> The Lessee acknowledges that this Agreement constitutes a lease and bailment of the Vehicle. The Lessee obtains no legal or equitable title to the Vehicle.</p>
            <p><strong>3.3</strong> If the Lessee retains possession of the Vehicle beyond the Rental Expiry Date without express written consent of the Lessor, the Lessee will be charged at the prevailing daily pro-rata rate. Following 48 hours of unauthorised retention, the Lessor reserves the right to report the Vehicle as stolen to relevant law enforcement agencies.</p>
            <p><strong>3.4</strong> The Rental Rate stated in the Schedule is component-inclusive (base hire and standard overheads) but expressly excludes tolls, traffic infringements, and damage liabilities.</p>
          </div>

          <div className="clause">
            <div className="clause-title">4. Authorised Use and Jurisdictional Compliance</div>
            <p><strong>4.1</strong> The Vehicle must only be driven by the Lessee or additional drivers formally authorised in writing by the Lessor. All drivers must hold a valid, unexpired, and unrestricted driving licence applicable to the class of the Vehicle.</p>
            <p><strong>4.2</strong> The Lessee must strictly comply with all statutory road rules, traffic laws, and mobile phone restrictions (VIC) or state-applicable laws.</p>
            <p><strong>4.3</strong> The Lessee must not, and must not allow the Vehicle to be: (a) used for any illegal purpose; (b) used for racing or speed testing; (c) used to transport hazardous materials; (d) driven under the influence of alcohol or drugs; (e) driven if unsafe; (f) used for towing without consent.</p>
            <p><strong>4.4</strong> The Vehicle is strictly a non-smoking and no-pets environment. A cleaning fee of $200+ will be levied for violations.</p>
          </div>

          <div className="clause">
            <div className="clause-title">5. Financial Obligations and Security Bond</div>
            <p><strong>5.1</strong> The Lessee agrees to pay the agreed Rental Rate at the intervals specified, in advance, without deduction or set-off.</p>
            <p><strong>5.2</strong> A Security Bond is payable upon execution. The Bond will be refunded within 3 to 7 business days following termination, subject to inspection.</p>
            <p><strong>5.3</strong> The Lessor may make lawful deductions from the Security Bond for unpaid rent, fuel, or documented damage exceeding Fair Wear and Tear.</p>
          </div>

          <div className="clause">
            <div className="clause-title">6. Maintenance, Repairs, and Condition</div>
            <p><strong>6.1</strong> The Lessor warrants that the Vehicle is roadworthy and fit for purpose at commencement.</p>
            <p><strong>6.2</strong> The Lessor is responsible for capital repairs and scheduled servicing. The Lessee must notify the Lessor when servicing is due.</p>
            <p><strong>6.3</strong> The Lessee is responsible for weekly checks of engine oil, coolant, and tyre pressures.</p>
            <p><strong>6.4</strong> The Lessee must not undertake any alterations or repairs without the prior written consent of the Lessor.</p>
          </div>

          <div className="clause">
            <div className="clause-title">7. Damage Liability</div>
            <p><strong>7.1</strong> The Lessee is responsible for any loss or damage up to the Damage Liability Fee (DLF) regardless of fault.</p>
            <p><strong>7.2</strong> This cap is void if damage is linked to material breach (e.g., Clause 4 violations, incorrect fuel, submersion, or leaving keys in an unlocked vehicle).</p>
            <p><strong>7.3</strong> The Lessee agrees to pay the Insurance Excess Amount ($1,000) in the event of any accident claim.</p>
          </div>

          <div className="clause">
            <div className="clause-title">8. Tolls, Traffic Infringements, and Fines</div>
            <p><strong>8.1</strong> The Lessee is responsible for all toll charges, parking fines, and speeding tickets incurred during the term.</p>
            <p><strong>8.2</strong> The Lessor may charge an Administrative Fee of $50.00 AUD per infringement for processing statutory liability transfers.</p>
          </div>

          <div className="clause">
            <div className="clause-title">9. Default, Material Breach, and Termination</div>
            <p><strong>9.1</strong> The Lessor may terminate immediately for failure to pay rent (&gt;14 days), illegal activities, abandonment, or misuse.</p>
            <p><strong>9.2</strong> Either party may terminate without cause by providing 14 days&apos; written notice.</p>
          </div>

          <div className="execution-block">
            <p className="execution-note">
              By signing below, both parties confirm they have read, understood, and agree to be bound by all terms of
              this Agreement, including the Damage Liability parameters, maintenance obligations, and traffic infringement responsibilities.
            </p>
            <div className="sig-grid">
              <div className="sig-box">
                <div className="sig-box-title">Lessor (Vehicle Owner)</div>
                <div className="sig-line"></div>
                <div className="sig-label">Signature</div>
                <div className="sig-name-val">Name: <span>{display.lessorName}</span></div>
                <div className="sig-name-val">Date: <span>{hasSigned ? display.lessorSignedDate : "_______________"}</span></div>
              </div>
              <div className="sig-box">
                <div className="sig-box-title">Lessee (Primary Driver)</div>
                <div className="sig-signature-wrap">
                  {hasSigned ? (
                    <img className="signed-image" src={contract.signature} alt="Lessee signature" />
                  ) : (
                    <SignaturePad
                      onSave={async (signatureDataUrl: string) => {
                        setIsSaving(true);
                        const timestamp = new Date().toISOString();
                        await supabase
                          .from("contracts")
                          .update({ signature: signatureDataUrl, signed_at: timestamp, status: "signed" })
                          .eq("id", params.id);
                        setContract((prev: any) => ({
                          ...prev,
                          signature: signatureDataUrl,
                          signed_at: timestamp,
                          status: "signed",
                        }));
                        setIsSaving(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  )}
                </div>
                <div className="sig-label">Signature</div>
                <div className="sig-name-val">Name: <span>{display.lesseeName}</span></div>
                <div className="sig-name-val">Date: <span>{hasSigned ? display.lesseeSignedDate : "_______________"}</span></div>
                {isSaving && <div className="sig-saving">Saving signature...</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="doc-footer">Motor Vehicle Rental Agreement - Confidential - Governed by the Laws of Victoria, Australia</div>
      </div>

      <style jsx>{`
        .topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 56px;
          box-shadow: 0 1px 0 #dde3ea, 0 2px 12px rgba(44, 51, 64, 0.07);
        }

        .topbar-title {
          color: #2c3340;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .doc-outer {
          max-width: 820px;
          margin: 36px auto 80px;
          background: #ffffff;
          box-shadow: 0 2px 24px rgba(44, 51, 64, 0.09);
          border-radius: 8px;
          overflow: hidden;
        }

        .doc-header {
          background: #3d5166;
          color: #ffffff;
          padding: 36px 56px 28px;
          text-align: center;
          border-bottom: 3px solid #4a7fa5;
        }

        .doc-header h1 {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-bottom: 6px;
        }

        .subtitle {
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b8d4e8;
          font-weight: 400;
        }

        .doc-body {
          padding: 44px 56px;
        }

        .signed-banner {
          margin-bottom: 20px;
          border: 1px solid #d0e4f0;
          background: #eef4f9;
          color: #2c3340;
          padding: 12px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .intro-text {
          font-size: 13px;
          line-height: 1.75;
          color: #5a6475;
          margin-bottom: 32px;
          padding-bottom: 22px;
          border-bottom: 1px solid #e4eaf0;
        }

        .intro-text strong {
          color: #2c3340;
        }

        .schedule-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 14px;
          color: #2c3340;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .schedule-title::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #c9d4df;
        }

        .schedule-table {
          width: 68%;
          border-collapse: collapse;
          margin-bottom: 36px;
          font-size: 12px;
        }

        .schedule-table .section-row td {
          background: #3d5166;
          color: #b8d4e8;
          font-weight: 600;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 12px;
        }

        .schedule-table tr:not(.section-row) td {
          padding: 7px 12px;
          border-bottom: 1px solid #e8edf2;
          vertical-align: middle;
        }

        .schedule-table tr:not(.section-row):nth-child(even) td {
          background: #f8fafb;
        }

        .schedule-table td:first-child {
          font-weight: 500;
          width: 40%;
          color: #5a6475;
        }

        .schedule-table td:last-child {
          color: #2c3340;
          font-weight: 400;
        }

        .field-val {
          display: inline-block;
          min-width: 140px;
          border-bottom: 1.5px solid #4a7fa5;
          padding: 0 2px 1px;
          color: #2c3340;
          font-style: italic;
          min-height: 16px;
        }

        .field-val.empty {
          color: #aab5c0;
          font-style: italic;
        }

        .clause {
          margin-bottom: 26px;
        }

        .clause-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 9px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e4eaf0;
          color: #2c3340;
        }

        .clause p,
        .clause li {
          font-size: 12.5px;
          line-height: 1.78;
          color: #5a6475;
          margin-bottom: 5px;
        }

        .clause ul {
          padding-left: 20px;
          list-style: lower-alpha;
        }

        .sub {
          margin-left: 18px;
        }

        .execution-block {
          margin-top: 36px;
          padding-top: 22px;
          border-top: 1.5px solid #c9d4df;
        }

        .execution-note {
          font-size: 12px;
          font-style: italic;
          color: #5a6475;
          margin-bottom: 24px;
          line-height: 1.7;
        }

        .sig-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        .sig-box {
          border: 1px solid #dde4ea;
          padding: 18px;
          border-radius: 6px;
          background: #fafcfd;
        }

        .sig-box-title {
          font-weight: 600;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 12px;
          color: #4a7fa5;
        }

        .sig-line {
          border-bottom: 1px solid #bcc5ce;
          height: 46px;
          margin-bottom: 8px;
        }

        .sig-signature-wrap {
          margin-bottom: 8px;
        }

        .sig-label {
          font-size: 11px;
          color: #5a6475;
          margin-top: 4px;
        }

        .sig-name-val {
          font-size: 12px;
          margin-top: 10px;
        }

        .sig-name-val span {
          font-style: italic;
          color: #4a7fa5;
        }

        .signed-image {
          display: block;
          width: 100%;
          max-width: 100%;
          height: 120px;
          object-fit: contain;
          background: #ffffff;
          border: 1px solid #bcc5ce;
          border-radius: 4px;
        }

        .sig-saving {
          margin-top: 10px;
          font-size: 11px;
          color: #5a6475;
        }

        .doc-footer {
          background: #3d5166;
          color: #8fa4b8;
          text-align: center;
          font-size: 10px;
          padding: 14px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        :global(.sigCanvas) {
          border: 1px solid #bcc5ce;
          border-radius: 4px;
          background: #ffffff;
        }

        @media (max-width: 900px) {
          .topbar {
            padding: 0 18px;
          }

          .doc-outer {
            margin: 20px 16px 40px;
          }

          .doc-body,
          .doc-header {
            padding-left: 22px;
            padding-right: 22px;
          }

          .schedule-table {
            width: 100%;
          }

          .sig-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
