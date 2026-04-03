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
            <p>
              <strong>1.1</strong> <em>ACL</em> means the Australian Consumer Law as set out in Schedule 2 of the
              Competition and Consumer Act 2010 (Cth).
            </p>
            <p>
              <strong>1.2</strong> <em>Damage Liability Fee (DLF)</em> means the maximum predetermined amount the
              Lessee is contractually liable to pay per incident in the event of loss or damage to the Vehicle,
              provided there has been no Material Breach of this Agreement.
            </p>
            <p>
              <strong>1.3</strong> <em>Fair Wear and Tear</em> means the objective standard of acceptable vehicle
              deterioration resulting from normal, reasonable use, as defined by the most current edition of the AFIA
              Fair Wear and Tear Guide.
            </p>
            <p>
              <strong>1.4</strong> <em>PPSA</em> means the Personal Property Securities Act 2009 (Cth) and associated
              regulations.
            </p>
            <p>
              <strong>1.5</strong> <em>Vehicle</em> means the motor vehicle described in the Schedule, including all
              keys, remote entry devices, accessories, tools, tyres, and equipment supplied with it.
            </p>
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
              <tr><td>Year / Colour</td><td><FieldValue value={display.vehicleYear} /></td></tr>
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
            <p><strong>3.4</strong> The Rental Rate stated in the Schedule is component-inclusive (base hire, GST, and standard overheads) but expressly excludes tolls, traffic infringements, and damage liabilities, which are contingent on Lessee behaviour.</p>
          </div>

          <div className="clause">
            <div className="clause-title">4. Asset Security and the PPSA</div>
            <p><strong>4.1</strong> The Lessee acknowledges and agrees that this Agreement may constitute a "PPS Lease" and thereby creates a statutory security interest in the Vehicle under the PPSA.</p>
            <p><strong>4.2</strong> The Lessee irrevocably consents to the Lessor registering a Purchase Money Security Interest (PMSI) or standard security interest on the national PPSR against the Lessee&apos;s details and the Vehicle&apos;s VIN.</p>
            <p><strong>4.3</strong> The Lessee agrees to sign any further documents required by the Lessor to ensure the security interest is perfected and retains the highest possible priority against third-party creditors or liquidators.</p>
            <p><strong>4.4</strong> The Lessee must not attempt to sell, sublease, pledge, or create any competing security interest over the Vehicle.</p>
            <p><strong>4.5</strong> To the maximum extent permitted by law, the Lessee waives their right to receive any notice of a verification statement regarding a registration event under section 157 of the PPSA.</p>
          </div>

          <div className="clause">
            <div className="clause-title">5. Financial Obligations and Security Bond</div>
            <p><strong>5.1</strong> The Lessee agrees to pay the agreed Rental Rate at the intervals specified, in advance, without deduction or set-off.</p>
            <p><strong>5.2</strong> A Security Bond is payable upon execution of this Agreement. The Bond will be retained in trust by the Lessor and refunded within 7 to 14 business days following termination of this Agreement and return of the Vehicle.</p>
            <p><strong>5.3</strong> The Lessor may make lawful deductions from the Security Bond for unpaid rent, fuel replenishment costs, reasonable detailing fees, or documented damage to the Vehicle that exceeds Fair Wear and Tear and falls within the DLF parameters.</p>
          </div>

          <div className="clause">
            <div className="clause-title">6. Authorised Use and Jurisdictional Compliance</div>
            <p><strong>6.1</strong> The Vehicle must only be driven by the Lessee or additional drivers formally authorised in writing by the Lessor. All drivers must hold a valid, unexpired, and unrestricted driving licence applicable to the class of the Vehicle.</p>
            <p><strong>6.2</strong> The Lessee must strictly comply with all statutory road rules, traffic laws, and mobile phone/wearable technology restrictions of the specific Australian State or Territory in which the Vehicle is operating.</p>
            <p><strong>6.3</strong> The Lessee must not, and must not allow the Vehicle to be:</p>
            <ul className="sub">
              <li>used for any illegal purpose or in the commission of a criminal offence;</li>
              <li>driven on unsealed roads, beaches, or through flooded areas, unless the Vehicle is explicitly designated as an off-road 4WD and authorised in writing for such environments;</li>
              <li>used for racing, pace-making, reliability trials, or speed testing;</li>
              <li>used to transport hazardous, toxic, or highly flammable materials;</li>
              <li>driven by any person under the influence of alcohol, drugs, or any medication that impairs driving ability;</li>
              <li>driven if it is materially damaged, unsafe, or displaying critical mechanical warning lights on the dashboard.</li>
            </ul>
            <p><strong>6.4</strong> The Vehicle is strictly a non-smoking environment. Pets are prohibited unless explicitly permitted in writing. A reasonable detailing fee will be levied if the Vehicle is returned with embedded smoke odour, excessive animal hair, or severe interior soiling.</p>
          </div>

          <div className="clause">
            <div className="clause-title">7. Maintenance, Repairs, and Condition</div>
            <p><strong>7.1</strong> The Lessor warrants that, at the Commencement Date, the Vehicle is roadworthy, structurally sound, and mechanically fit for its intended purpose.</p>
            <p><strong>7.2</strong> <em>Lessor&apos;s Obligations:</em> The Lessor is responsible for all capital repairs, remediation of inherent mechanical faults, and all manufacturer-scheduled periodic servicing. The Lessee must notify the Lessor immediately when scheduled servicing is approaching or if any mechanical fault manifests.</p>
            <p><strong>7.3</strong> <em>Lessee&apos;s Obligations:</em> The Lessee is responsible for ongoing operational maintenance including weekly checks of engine oil levels, engine coolant levels, and tyre pressures, as well as maintaining adequate fuel or battery charge.</p>
            <p><strong>7.4</strong> The Lessee must return the Vehicle in the same condition as documented at the Commencement Date, subject only to Fair Wear and Tear.</p>
            <p><strong>7.5</strong> The Lessee must not authorise, commission, or undertake any mechanical repairs, aesthetic alterations, or component modifications to the Vehicle without the express prior written consent of the Lessor.</p>
          </div>

          <div className="clause">
            <div className="clause-title">8. Damage Liability and Waiver Mechanisms</div>
            <p><strong>8.1</strong> <em>No Insurance Product Sold:</em> The Lessor does not offer, sell, or distribute insurance policies. The Lessor utilises a contractual Damage Liability Fee (DLF) waiver mechanism to limit the Lessee&apos;s financial exposure to asset damage.</p>
            <p><strong>8.2</strong> Subject to Clause 8.3, in the event of accidental loss or damage to the Vehicle, or third-party property damage caused by the Vehicle, the Lessee&apos;s maximum financial liability per incident is capped at the DLF stated in the Schedule.</p>
            <p><strong>8.3</strong> <em>Breach and Loss of DLF Protection:</em> The DLF limitation will be voided, and the Lessee will be fully liable for all reasonably foreseeable repair costs, recovery and towing costs, and Loss of Use, if the damage or loss is causally linked to:</p>
            <ul className="sub">
              <li>a Material Breach of the Authorised Use conditions outlined in Clause 6;</li>
              <li>the introduction of incorrect fuel or fluids into the Vehicle;</li>
              <li>submersion in water or driving through flooded terrain;</li>
              <li>mechanical failure directly resulting from the Lessee&apos;s failure to maintain oil/coolant levels as required by Clause 7.3;</li>
              <li>a failure to secure the Vehicle, leading to its theft (e.g., leaving the keys in the ignition or cabin of an unattended vehicle).</li>
            </ul>
            <p><strong>8.4</strong> If the Lessee is not at fault for a collision, and an identified at-fault third party&apos;s insurer accepts full liability and finalises payment, the Lessor will refund the DLF to the Lessee.</p>
          </div>

          <div className="clause">
            <div className="clause-title">9. Tolls, Traffic Infringements, and Statutory Nominations</div>
            <p><strong>9.1</strong> The Lessee is strictly responsible for all toll road charges, parking fines, speeding tickets, and any other traffic infringements incurred during the Rental Term across all Australian jurisdictions.</p>
            <p><strong>9.2</strong> The Lessee hereby grants the Lessor irrevocable legal authority to nominate the Lessee to the relevant state or territory traffic authority (e.g., Fines Victoria, Revenue NSW) as the responsible driver for any camera-detected infringement notices received by the Lessor corresponding to the Rental Term.</p>
            <p><strong>9.3</strong> The Lessor may charge a reasonable Administrative Fee not exceeding $45.00 AUD per infringement to cover the genuine, actual administrative costs incurred in processing the statutory nomination form and transferring the legal liability to the Lessee.</p>
          </div>

          <div className="clause">
            <div className="clause-title">10. Accident and Breakdown Procedure</div>
            <p><strong>10.1</strong> In the event of a collision or accident, the Lessee must:</p>
            <ul className="sub">
              <li>secure the Vehicle to prevent further damage;</li>
              <li>notify the police immediately if required by state law (e.g., if vehicles require towing or there are injuries);</li>
              <li>obtain the names, addresses, licence details, and vehicle registration numbers of all involved third parties;</li>
              <li>notify the Lessor immediately;</li>
              <li>refrain from admitting legal liability or guilt to any third party.</li>
            </ul>
            <p><strong>10.2</strong> In the event of an inherent mechanical breakdown not caused by the Lessee&apos;s negligence, the Lessor will arrange roadside assistance. If the Vehicle cannot be repaired in a reasonable timeframe, the Lessor will endeavour to provide a substitute vehicle of similar specification, or terminate the Agreement with a pro-rata refund for the unused term.</p>
          </div>

          <div className="clause">
            <div className="clause-title">11. Default, Material Breach, and Termination</div>
            <p><strong>11.1</strong> The Lessor may terminate this Agreement immediately and take lawful steps to repossess the Vehicle if the Lessee commits a defined Material Breach. A Material Breach strictly includes:</p>
            <ul className="sub">
              <li>failure to pay the Rental Rate for a consecutive period exceeding 14 days;</li>
              <li>use of the Vehicle for illegal activities;</li>
              <li>severe neglect, abandonment, or malicious damage to the Vehicle;</li>
              <li>the Lessee becoming bankrupt, entering external administration, or liquidating.</li>
            </ul>
            <p><strong>11.2</strong> Upon termination for a Material Breach, the Lessee forfeits the right to possess the Vehicle but remains legally liable for all outstanding rent, repossession costs, and damage assessments. The Lessor will refund any pre-paid rent on a pro-rata basis, less any legally recoverable damages and actual costs incurred due to the Lessee&apos;s breach.</p>
            <p><strong>11.3</strong> Either party may terminate this Agreement without cause by providing 14 days&apos; written notice, subject to the settlement of all outstanding financial obligations.</p>
          </div>

          <div className="clause">
            <div className="clause-title">12. Dispute Resolution, Governing Law, and Jurisdiction</div>
            <p><strong>12.1</strong> Any dispute arising under this Agreement must first be addressed through the Lessor&apos;s internal dispute resolution process. If unresolved, the Lessee may refer the matter to the Australian Car Rental Conciliation Service (CRCS) for independent review, or the relevant state consumer administrative tribunal.</p>
            <p><strong>12.2</strong> This Agreement shall be governed by and construed in accordance with the laws of the State of Victoria, Australia.</p>
            <p><strong>12.3</strong> The parties submit to the non-exclusive jurisdiction of the courts of Victoria, or the courts of any Australian State or Territory where the Vehicle is physically located, for the resolution of any legal proceedings or repossession actions.</p>
          </div>

          <div className="clause">
            <div className="clause-title">13. Severability</div>
            <p><strong>13.1</strong> If any term or provision of this Agreement is held to be invalid, void, or unenforceable by a court of competent jurisdiction under the ACL or any other statute, that specific provision will be severed from the Agreement. The remaining terms and provisions will continue to operate with full force and legal effect.</p>
          </div>

          <div className="execution-block">
            <p className="execution-note">
              By signing below, both parties confirm they have read, understood, and agree to be bound by all terms of
              this Agreement, including the Damage Liability parameters, the PPSA security interest provisions, and
              obligations regarding traffic infringements and maintenance.
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
