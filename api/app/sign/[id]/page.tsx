"use client";

import { useEffect, useMemo, useState } from "react";
import { Sora } from "next/font/google";
import SignaturePad from "@/components/SignaturePad";
import { supabase } from "@/utils/supabase";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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

function Row({ label, value }: { label: string; value: string }) {
  const empty = !value || value === "_______________";
  return (
    <tr>
      <td className="lbl">{label}</td>
      <td className={`val${empty ? " empty" : ""}`}>{value || "_______________"}</td>
    </tr>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={2} className="gh">{children}</td>
    </tr>
  );
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
      lessorName:        contract.lessor_name     || "Anirudh Ahlawat",
      lessorAddress:     contract.lessor_address  || "36 Clearwater Rise Parade, Truganina VIC 3029",
      lessorPhone:       contract.lessor_phone    || "0401 991 420",
      lesseeName:        contract.client_name     || "_______________",
      lesseeAddress:     contract.client_address  || "_______________",
      lesseeEmail:       contract.client_email    || "_______________",
      lesseePhone:       contract.client_phone    || "_______________",
      lesseeLicence:     contract.client_licence  || "_______________",
      lesseeState:       contract.client_state    || "_______________",
      lesseeExpiry:      formatDisplayDate(contract.client_expiry),
      emergName:         contract.emerg_name         || "_______________",
      emergRelationship: contract.emerg_relationship  || "_______________",
      emergPhone:        contract.emerg_phone         || "_______________",
      vehicleMake:       contract.vehicle_make   || "_______________",
      vehicleModel:      contract.vehicle_model  || "_______________",
      vehicleYear:       contract.vehicle_year   || "_______________",
      vehicleColour:     contract.vehicle_colour || "_______________",
      vehicleRego:       contract.vehicle_rego   || "_______________",
      vehicleVin:        contract.vehicle_vin    || "_______________",
      startDate:         formatDisplayDate(contract.start_date),
      endDate:           formatDisplayDate(contract.end_date),
      rentalRate:        contract.weekly_payment  ? `$${contract.weekly_payment} AUD` : "_______________",
      bond:              contract.bond_amount     ? `$${contract.bond_amount} AUD`    : "_______________",
      bondDueDate:       formatDisplayDate(contract.bond_due_date),
      dlf:               contract.dlf_amount      ? `$${contract.dlf_amount} AUD`     : "_______________",
      insuranceExcess:   contract.insurance_excess || "$1,000",
      hoOdometer:        contract.ho_odometer || "_______________",
      hoFuel:            contract.ho_fuel     || "_______________",
      hoDamage:          contract.ho_damage   || "_______________",
      lessorSignedDate:  formatSignedDate(contract.signed_at),
      lesseeSignedDate:  formatSignedDate(contract.signed_at),
    };
  }, [contract]);

  if (isLoading) {
    return <div style={{ padding: "80px 24px", textAlign: "center", fontFamily: "sans-serif" }}>Loading secure document...</div>;
  }

  if (error || !contract || !display) {
    return <div style={{ padding: "80px 24px", textAlign: "center", color: "#b91c1c", fontFamily: "sans-serif" }}>{error}</div>;
  }

  const hasSigned = contract.status === "signed" && !!contract.signature;

  return (
    <div className={sora.className}>
      <style jsx global>{`
        body { background: #D6D1C7; color: #1A1A1A; }
      `}</style>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <span className="toolbar-title">Motor Vehicle Rental Agreement</span>
      </div>

      <div className="pages">

        {/* ══ PAGE 1 ══ */}
        <div className="page">
          <div className="gold-bar" />

          <div className="doc-title">Motor Vehicle Rental Agreement</div>
          <div className="doc-subtitle">Private Arrangement — Victoria, Australia</div>

          {hasSigned && (
            <div className="signed-banner">
              This agreement has been digitally signed and saved.
            </div>
          )}

          <p className="preamble">
            This Motor Vehicle Rental Agreement (<strong>&ldquo;Agreement&rdquo;</strong>) is entered into on the Date of Signing
            specified in the Schedule below, and establishes binding legal obligations between the Vehicle Owner (
            <strong>&ldquo;Lessor&rdquo;</strong>) and the Renter (<strong>&ldquo;Lessee&rdquo;</strong>) on the terms set out herein.
          </p>

          <div className="sh">1. &nbsp; Definitions and Interpretation</div>
          <p className="cl"><strong>1.1 &nbsp; ACL</strong> means the Australian Consumer Law as set out in Schedule 2 of the Competition and Consumer Act 2010 (Cth).</p>
          <p className="cl"><strong>1.2 &nbsp; Damage Liability Fee (DLF)</strong> means the maximum predetermined amount the Lessee is contractually liable to pay per incident in the event of loss or damage to the Vehicle, provided there has been no Material Breach of this Agreement.</p>
          <p className="cl"><strong>1.3 &nbsp; Fair Wear and Tear</strong> means the objective standard of acceptable vehicle deterioration resulting from normal, reasonable use.</p>
          <p className="cl"><strong>1.4 &nbsp; PPSA</strong> means the Personal Property Securities Act 2009 (Cth) and associated regulations.</p>
          <p className="cl"><strong>1.5 &nbsp; Vehicle</strong> means the motor vehicle described in the Schedule, including all keys, remote entry devices, accessories, tools, tyres, and equipment supplied with it.</p>

          <div className="sh">2. &nbsp; Schedule of Details</div>
          <table className="sched">
            <tbody>
              <SectionHeader>Lessor (Vehicle Owner)</SectionHeader>
              <Row label="Full Name / Company" value={display.lessorName} />
              <Row label="Address"             value={display.lessorAddress} />
              <Row label="Contact Number"      value={display.lessorPhone} />

              <SectionHeader>Lessee (Primary Driver)</SectionHeader>
              <Row label="Full Name"             value={display.lesseeName} />
              <Row label="Address"               value={display.lesseeAddress} />
              <Row label="Email"                 value={display.lesseeEmail} />
              <Row label="Phone Number"          value={display.lesseePhone} />
              <Row label="Driver's Licence No."  value={display.lesseeLicence} />
              <Row label="State / Country of Issue" value={display.lesseeState} />
              <Row label="Licence Expiry Date"   value={display.lesseeExpiry} />

              <SectionHeader>Emergency Contact</SectionHeader>
              <Row label="Emergency Contact Name" value={display.emergName} />
              <Row label="Relationship"            value={display.emergRelationship} />
              <Row label="Phone Number"            value={display.emergPhone} />

              <SectionHeader>Vehicle Details</SectionHeader>
              <Row label="Make"                value={display.vehicleMake} />
              <Row label="Model"               value={display.vehicleModel} />
              <Row label="Year"                value={display.vehicleYear} />
              <Row label="Colour"              value={display.vehicleColour} />
              <Row label="Registration Number" value={display.vehicleRego} />
              <Row label="VIN"                 value={display.vehicleVin} />

              <SectionHeader>Rental Parameters</SectionHeader>
              <Row label="Rental Commencement Date"  value={display.startDate} />
              <Row label="Rental Expiry Date"        value={display.endDate} />
              <Row label="Weekly Rental Rate"        value={display.rentalRate} />
              <Row label="Security Bond"             value={display.bond} />
              <Row label="Bond Due Date"             value={display.bondDueDate} />
              <Row label="Damage Liability Fee (DLF)" value={display.dlf} />
              <Row label="Insurance Excess Amount"   value={display.insuranceExcess} />

              <SectionHeader>Vehicle Condition at Handover</SectionHeader>
              <Row label="Odometer Reading (kms)"  value={display.hoOdometer} />
              <Row label="Fuel Level (%)"          value={display.hoFuel} />
              <Row label="Existing Damage / Notes" value={display.hoDamage} />
            </tbody>
          </table>

          <div className="pf">Motor Vehicle Rental Agreement — Confidential — Governed by the Laws of Victoria, Australia — Page 1 of 4</div>
        </div>

        {/* ══ PAGE 2 ══ */}
        <div className="page">
          <div className="gold-bar" />

          <div className="sh" style={{ marginTop: 0 }}>3. &nbsp; Grant of Lease, Term, and Pricing</div>
          <p className="cl"><strong>3.1</strong> &nbsp; The Lessor grants the Lessee the right to possess and operate the Vehicle for the term specified in the Schedule, subject strictly to the terms of this Agreement.</p>
          <p className="cl"><strong>3.2</strong> &nbsp; The Lessee acknowledges that this Agreement constitutes a lease and bailment of the Vehicle. The Lessee obtains no legal or equitable title to the Vehicle.</p>
          <p className="cl"><strong>3.3</strong> &nbsp; If the Lessee retains possession of the Vehicle beyond the Rental Expiry Date without express written consent of the Lessor, the Lessee will be charged at the prevailing daily pro-rata rate. Following 48 hours of unauthorised retention, the Lessor reserves the right to report the Vehicle as stolen to relevant law enforcement agencies.</p>
          <p className="cl"><strong>3.4</strong> &nbsp; The Rental Rate stated in the Schedule is component-inclusive (base hire and standard overheads) but expressly excludes tolls, traffic infringements, and damage liabilities.</p>

          <div className="sh">4. &nbsp; Authorised Use and Jurisdictional Compliance</div>
          <p className="cl"><strong>4.1</strong> &nbsp; The Vehicle must only be driven by the Lessee or additional drivers formally authorised in writing by the Lessor. All drivers must hold a valid, unexpired, and unrestricted driving licence applicable to the class of the Vehicle.</p>
          <p className="cl"><strong>4.2</strong> &nbsp; The Lessee must strictly comply with all statutory road rules, traffic laws, and mobile phone restrictions of the specific Australian State or Territory in which the Vehicle is operating.</p>
          <p className="cl"><strong>4.3</strong> &nbsp; The Lessee must not, and must not allow the Vehicle to be:</p>
          <p className="sc">(a) &nbsp; used for any illegal purpose or in the commission of a criminal offence;</p>
          <p className="sc">(b) &nbsp; used for racing, pace-making, reliability trials, or speed testing;</p>
          <p className="sc">(c) &nbsp; used to transport hazardous, toxic, or highly flammable materials;</p>
          <p className="sc">(d) &nbsp; driven by any person under the influence of alcohol, drugs, or any medication that impairs driving ability;</p>
          <p className="sc">(e) &nbsp; driven if it is materially damaged, unsafe, or displaying critical mechanical warning lights;</p>
          <p className="sc">(f) &nbsp; used for towing unless expressly approved in writing by the Lessor.</p>
          <p className="cl"><strong>4.4</strong> &nbsp; The Vehicle is strictly a non-smoking environment. Smoking is prohibited under any circumstances. Pets are strictly prohibited under any circumstances. A cleaning fee of $200 or more (if professional detailing is required) will be levied for any violation of this clause, including the presence of smoke odour, pet hair, or severe interior soiling.</p>

          <div className="sh">5. &nbsp; Financial Obligations and Security Bond</div>
          <p className="cl"><strong>5.1</strong> &nbsp; The Lessee agrees to pay the agreed Rental Rate at the intervals specified, in advance, without deduction or set-off.</p>
          <p className="cl"><strong>5.2</strong> &nbsp; A Security Bond is payable upon execution of this Agreement. The Bond will be refunded within 3 to 7 business days following termination of this Agreement and return of the Vehicle, subject to inspection.</p>
          <p className="cl"><strong>5.3</strong> &nbsp; The Lessor may make lawful deductions from the Security Bond for unpaid rent, fuel replenishment costs, reasonable detailing fees, or documented damage to the Vehicle that exceeds Fair Wear and Tear.</p>

          <div className="sh">6. &nbsp; Maintenance, Repairs, and Condition</div>
          <p className="cl"><strong>6.1</strong> &nbsp; The Lessor warrants that, at the Commencement Date, the Vehicle is roadworthy, structurally sound, and mechanically fit for its intended purpose.</p>
          <p className="cl"><strong>6.2 &nbsp; Lessor&apos;s Obligations:</strong> The Lessor is responsible for all capital repairs, remediation of inherent mechanical faults, and all manufacturer-scheduled periodic servicing. The Lessee must notify the Lessor immediately when scheduled servicing is approaching or if any mechanical fault manifests.</p>
          <p className="cl"><strong>6.3 &nbsp; Lessee&apos;s Obligations:</strong> The Lessee is responsible for ongoing operational maintenance including weekly checks of engine oil levels, engine coolant levels, and tyre pressures, as well as maintaining adequate fuel or battery charge.</p>
          <p className="cl"><strong>6.4</strong> &nbsp; The Lessee must return the Vehicle in the same condition as documented at the Commencement Date, subject only to Fair Wear and Tear.</p>
          <p className="cl"><strong>6.5</strong> &nbsp; The Lessee must not authorise, commission, or undertake any mechanical repairs, aesthetic alterations, or component modifications to the Vehicle without the express prior written consent of the Lessor.</p>

          <div className="pf">Motor Vehicle Rental Agreement — Confidential — Governed by the Laws of Victoria, Australia — Page 2 of 4</div>
        </div>

        {/* ══ PAGE 3 ══ */}
        <div className="page">
          <div className="gold-bar" />

          <div className="sh" style={{ marginTop: 0 }}>7. &nbsp; Damage Liability</div>
          <p className="cl"><strong>7.1</strong> &nbsp; The Lessee is fully responsible for any loss or damage to the Vehicle during the rental period, regardless of fault, up to the Damage Liability Fee (DLF) stated in the Schedule.</p>
          <p className="cl"><strong>7.2</strong> &nbsp; The DLF limitation will be voided, and the Lessee will be fully liable for all repair costs, recovery costs, and loss of use, if damage or loss is causally linked to:</p>
          <p className="sc">(a) &nbsp; a Material Breach of the Authorised Use conditions outlined in Clause 4;</p>
          <p className="sc">(b) &nbsp; introduction of incorrect fuel or fluids into the Vehicle;</p>
          <p className="sc">(c) &nbsp; mechanical failure directly resulting from the Lessee&apos;s failure to maintain oil or coolant levels as required by Clause 6.3;</p>
          <p className="sc">(d) &nbsp; a failure to secure the Vehicle, leading to its theft (e.g., leaving keys in the ignition or cabin of an unattended vehicle).</p>
          <p className="cl"><strong>7.3</strong> &nbsp; The Lessee is liable for any third-party damage caused while operating the Vehicle.</p>
          <p className="cl"><strong>7.4</strong> &nbsp; The Lessee agrees to pay the Insurance Excess Amount specified in the Schedule in the event of any accident or claim, regardless of fault.</p>

          <div className="sh">8. &nbsp; Tolls, Traffic Infringements, and Fines</div>
          <p className="cl"><strong>8.1</strong> &nbsp; The Lessee is strictly responsible for all toll road charges, parking fines, speeding tickets, and any other traffic infringements incurred during the Rental Term across all Australian jurisdictions.</p>
          <p className="cl"><strong>8.2</strong> &nbsp; The Lessee must use their own Linkt account or toll payment arrangement for all toll roads, including CityLink, EastLink, or any Australian toll network. If tolls or fines are charged to the Lessor, they will be passed on to the Lessee in full.</p>
          <p className="cl"><strong>8.3</strong> &nbsp; The Lessor may charge an Administrative Fee not exceeding $50.00 AUD per infringement to cover the genuine costs incurred in processing and transferring statutory liability to the Lessee.</p>

          <div className="sh">9. &nbsp; Fuel Policy</div>
          <p className="cl"><strong>9.1</strong> &nbsp; The Vehicle must be returned with the same fuel level as at the start of the rental.</p>
          <p className="cl"><strong>9.2</strong> &nbsp; Failure to return the Vehicle with the same fuel level will result in refuelling charges plus a reasonable service fee.</p>

          <div className="sh">10. &nbsp; Accident and Breakdown Procedure</div>
          <p className="cl"><strong>10.1</strong> &nbsp; In the event of a collision or accident, the Lessee must:</p>
          <p className="sc">(a) &nbsp; secure the Vehicle to prevent further damage;</p>
          <p className="sc">(b) &nbsp; notify the police immediately if required by state law;</p>
          <p className="sc">(c) &nbsp; obtain the names, addresses, licence details, and vehicle registration numbers of all involved third parties;</p>
          <p className="sc">(d) &nbsp; notify the Lessor immediately;</p>
          <p className="sc">(e) &nbsp; refrain from admitting legal liability or guilt to any third party.</p>
          <p className="cl"><strong>10.2</strong> &nbsp; In the event of an inherent mechanical breakdown not caused by the Lessee&apos;s negligence, the Lessor will arrange roadside assistance. If the Vehicle cannot be repaired in a reasonable timeframe, the Lessor will endeavour to provide a substitute vehicle of similar specification, or terminate the Agreement with a pro-rata refund for the unused term.</p>
          <p className="cl"><strong>10.3</strong> &nbsp; Failure to follow the above procedure may result in the Lessee bearing full liability for all associated costs.</p>

          <div className="sh">11. &nbsp; Default, Material Breach, and Termination</div>
          <p className="cl"><strong>11.1</strong> &nbsp; The Lessor may terminate this Agreement immediately and repossess the Vehicle if the Lessee commits a Material Breach, including:</p>
          <p className="sc">(a) &nbsp; failure to pay the Rental Rate for a consecutive period exceeding 14 days;</p>
          <p className="sc">(b) &nbsp; use of the Vehicle for illegal activities;</p>
          <p className="sc">(c) &nbsp; severe neglect, abandonment, or malicious damage to the Vehicle;</p>
          <p className="sc">(d) &nbsp; misuse of the Vehicle contrary to the terms of this Agreement.</p>
          <p className="cl"><strong>11.2</strong> &nbsp; Upon termination for Material Breach, no refund of any pre-paid rent will be provided unless otherwise required by law. The Lessee remains liable for all outstanding obligations.</p>
          <p className="cl"><strong>11.3</strong> &nbsp; Either party may terminate this Agreement without cause by providing 14 days&apos; written notice, subject to settlement of all outstanding financial obligations.</p>

          <div className="sh">12. &nbsp; Indemnity</div>
          <p className="cl"><strong>12.1</strong> &nbsp; The Lessee agrees to indemnify and hold harmless the Lessor against any claims, damages, losses, or liabilities arising from the Lessee&apos;s use of the Vehicle, including any third-party claims.</p>

          <div className="sh">13. &nbsp; Dispute Resolution and Governing Law</div>
          <p className="cl"><strong>13.1</strong> &nbsp; Any dispute arising under this Agreement must first be addressed through good-faith negotiation between the parties. If unresolved, the matter may be referred to the relevant state consumer administrative tribunal.</p>
          <p className="cl"><strong>13.2</strong> &nbsp; This Agreement shall be governed by and construed in accordance with the laws of the State of Victoria, Australia.</p>
          <p className="cl"><strong>13.3</strong> &nbsp; The parties submit to the non-exclusive jurisdiction of the courts of Victoria for the resolution of any legal proceedings.</p>

          <div className="sh">14. &nbsp; Severability</div>
          <p className="cl"><strong>14.1</strong> &nbsp; If any term or provision of this Agreement is held to be invalid or unenforceable by a court of competent jurisdiction, that specific provision will be severed from the Agreement. The remaining terms will continue to operate with full force and legal effect.</p>

          <div className="pf">Motor Vehicle Rental Agreement — Confidential — Governed by the Laws of Victoria, Australia — Page 3 of 4</div>
        </div>

        {/* ══ PAGE 4 — Execution ══ */}
        <div className="page">
          <div className="gold-bar" />

          <div className="sh" style={{ marginTop: 0 }}>Execution</div>
          <p className="exec-note">
            By signing below, both parties confirm they have read, understood, and agree to be bound by all terms of
            this Agreement, including the Damage Liability parameters, maintenance obligations, and traffic infringement responsibilities.
          </p>

          <div className="sig-wrap">
            {/* Lessor */}
            <div className="sig-col">
              <div className="sig-hdr">Lessor (Vehicle Owner)</div>
              <div className="sig-body">
                <div className="sig-field">
                  <span className="sig-lbl">Signature</span>
                  <span className="sig-line" />
                </div>
                <div className="sig-field">
                  <span className="sig-lbl">Full Name</span>
                  <span className="sig-val">{display.lessorName}</span>
                </div>
                <div className="sig-field">
                  <span className="sig-lbl">Date</span>
                  <span className="sig-val">{hasSigned ? display.lessorSignedDate : "_______________"}</span>
                </div>
              </div>
            </div>

            {/* Lessee */}
            <div className="sig-col">
              <div className="sig-hdr">Lessee (Primary Driver)</div>
              <div className="sig-body">
                <div className="sig-field">
                  <span className="sig-lbl">Signature</span>
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
                <div className="sig-field">
                  <span className="sig-lbl">Full Name</span>
                  <span className="sig-val">{display.lesseeName}</span>
                </div>
                <div className="sig-field">
                  <span className="sig-lbl">Date</span>
                  <span className="sig-val">{hasSigned ? display.lesseeSignedDate : "_______________"}</span>
                </div>
                {isSaving && <div className="sig-saving">Saving signature...</div>}
              </div>
            </div>
          </div>

          <div className="end-rule">
            <div className="end-line" />
            <span className="end-txt">End of Agreement</span>
            <div className="end-line" />
          </div>

          <div className="pf" style={{ marginTop: "auto" }}>Motor Vehicle Rental Agreement — Confidential — Governed by the Laws of Victoria, Australia — Page 4 of 4</div>
        </div>

      </div>{/* /.pages */}

      <style jsx>{`
        /* ── Toolbar ── */
        .toolbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #1A1A1A;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 28px;
        }
        .toolbar-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #D4AA4A;
        }

        /* ── Page wrapper ── */
        .pages {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 28px 16px 48px;
        }
        .page {
          width: 794px;
          min-height: 1123px;
          background: #fff;
          padding: 52px 56px 48px;
          box-shadow: 0 3px 24px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* ── Gold bar ── */
        .gold-bar {
          height: 4px;
          background: linear-gradient(90deg, #B08D2E 0%, #D4AA4A 50%, #B08D2E 100%);
          margin-bottom: 20px;
        }

        /* ── Title ── */
        .doc-title {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          text-align: center;
          color: #1A1A1A;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .doc-subtitle {
          font-size: 12px;
          font-weight: 300;
          font-style: italic;
          text-align: center;
          color: #666;
          padding-bottom: 10px;
          border-bottom: 3px solid #B08D2E;
          margin-bottom: 16px;
        }

        /* ── Signed banner ── */
        .signed-banner {
          margin-bottom: 16px;
          border: 1px solid #B08D2E;
          background: #FFFBEF;
          color: #1A1A1A;
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        /* ── Preamble ── */
        .preamble {
          font-size: 11.5px;
          line-height: 1.7;
          color: #3A3A3A;
          margin-bottom: 16px;
        }

        /* ── Section headings ── */
        .sh {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1A1A1A;
          padding-bottom: 5px;
          border-bottom: 2px solid #B08D2E;
          margin-top: 18px;
          margin-bottom: 9px;
        }

        /* ── Clause text ── */
        .cl {
          font-size: 11px;
          line-height: 1.72;
          color: #1A1A1A;
          margin-bottom: 5px;
        }
        .sc {
          font-size: 11px;
          line-height: 1.72;
          color: #1A1A1A;
          margin-bottom: 4px;
          padding-left: 22px;
        }

        /* ── Schedule table ── */
        .sched {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          margin-bottom: 4px;
          font-size: 11px;
        }
        :global(.sched .gh) {
          background: #2C2C2C;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 10px;
        }
        :global(.sched td) {
          border: 1px solid #DDD;
          padding: 0;
          vertical-align: middle;
        }
        :global(.sched .lbl) {
          background: #F2EAD0;
          font-size: 10px;
          font-weight: 600;
          color: #1A1A1A;
          padding: 5px 9px;
          white-space: nowrap;
          width: 36%;
        }
        :global(.sched .val) {
          background: #fff;
          padding: 5px 8px;
          font-size: 11px;
          color: #1A1A1A;
        }
        :global(.sched .val.empty) {
          color: #AAA;
          font-style: italic;
        }
        :global(.sched tr:nth-child(even) .val) {
          background: #F7F7F7;
        }

        /* ── Signature block ── */
        .sig-wrap {
          display: flex;
          gap: 20px;
          margin-top: 14px;
        }
        .sig-col {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .sig-hdr {
          background: #2C2C2C;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 7px 10px;
        }
        .sig-body {
          border: 1px solid #DDD;
          border-top: none;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sig-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sig-lbl {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #666;
        }
        .sig-line {
          border-bottom: 1px solid #1A1A1A;
          height: 32px;
          width: 100%;
        }
        .sig-val {
          font-size: 11px;
          color: #1A1A1A;
          font-weight: 500;
          padding: 4px 0 0;
        }
        .signed-image {
          display: block;
          width: 100%;
          height: 80px;
          object-fit: contain;
          background: #fff;
          border: 1px solid #DDD;
          border-radius: 2px;
        }
        .sig-saving {
          font-size: 11px;
          color: #666;
        }

        /* ── Exec note ── */
        .exec-note {
          font-size: 10.5px;
          font-style: italic;
          color: #666;
          line-height: 1.65;
          margin-bottom: 14px;
        }

        /* ── End rule ── */
        .end-rule {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          margin-top: 36px;
        }
        .end-line {
          flex: 1;
          height: 1px;
          background: #B08D2E;
          max-width: 80px;
        }
        .end-txt {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #B08D2E;
        }

        /* ── Page footer ── */
        .pf {
          margin-top: auto;
          padding-top: 8px;
          border-top: 1px solid #DDD;
          text-align: center;
          font-size: 8px;
          color: #AAA;
          letter-spacing: 0.05em;
        }

        :global(.sigCanvas) {
          border: 1px solid #DDD;
          border-radius: 2px;
          background: #fff;
        }

        /* ── Mobile ── */
        @media (max-width: 860px) {
          .page {
            width: 100%;
            min-height: unset;
            padding: 28px 20px;
          }
          .pages {
            padding: 16px 8px 40px;
          }
          .sig-wrap {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
