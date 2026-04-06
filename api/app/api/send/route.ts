import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/utils/supabase';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ── Resend-only path: contract already updated by client, just send email ──
    if (data.updateId) {
      const baseUrl  = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const signLink = `${baseUrl}/sign/${data.updateId}`;

      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Anirudh Contracts <onboarding@resend.dev>',
          to: [data.clientEmail],
          subject: `Updated Contract — ${data.vehicleMake} ${data.vehicleModel} (${data.vehicleRego})`,
          html: `
            <div style="font-family:Arial,sans-serif;padding:20px;color:#333;">
              <h2>Hello ${data.clientName},</h2>
              <p>Your Motor Vehicle Rental Agreement has been updated and requires your signature.</p>
              <div style="background:#f8fafc;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #e2e8f0;">
                <p><strong>Vehicle:</strong> ${data.vehicleMake} ${data.vehicleModel} (${data.vehicleRego})</p>
                <p><strong>Rental Term:</strong> ${data.startDate} to ${data.endDate}</p>
                <p><strong>Weekly Rent:</strong> $${data.weeklyPayment}</p>
              </div>
              <a href="${signLink}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
                Review & Sign Updated Contract
              </a>
              <p style="margin-top:30px;font-size:12px;color:#666;">The signing link is the same as before — your previous signature has been cleared.</p>
            </div>
          `,
        });
      } else {
        console.log('RESEND_API_KEY not set. Would have resent email with link:', signLink);
      }

      return NextResponse.json({ success: true, signLink }, { headers: corsHeaders });
    }

    const { data: contractData, error: dbError } = await supabase
      .from('contracts')
      .insert([
        {
          lessor_name: data.lessorName,
          lessor_address: data.lessorAddress,
          lessor_phone: data.lessorPhone,
          lessor_email: data.lessorEmail || null,

          client_name: data.clientName,
          client_email: data.clientEmail,
          client_phone: data.clientPhone || null,
          client_address: data.clientAddress,
          client_licence: data.clientLicence,
          client_state: data.clientState,
          client_expiry: data.clientExpiry,

          vehicle_make: data.vehicleMake,
          vehicle_model: data.vehicleModel,
          vehicle_year: data.vehicleYear,
          vehicle_colour: data.vehicleColour || null,
          vehicle_rego: data.vehicleRego,
          vehicle_vin: data.vehicleVin,

          emerg_name: data.emergName || null,
          emerg_relationship: data.emergRelationship || null,
          emerg_phone: data.emergPhone || null,

          start_date: data.startDate,
          end_date: data.endDate,
          bond_amount: data.bondAmount,
          bond_due_date: data.bondDueDate || null,
          weekly_payment: data.weeklyPayment,
          dlf_amount: data.dlfAmount,
          insurance_excess: data.insuranceExcess || '$1,000',

          ho_odometer: data.hoOdometer || null,
          ho_fuel: data.hoFuel || null,
          ho_damage: data.hoDamage || null,

          status: data.externalLink ? 'signed' : 'pending',
          external_link: data.externalLink || null,
          signature: data.externalLink ? 'EXTERNAL' : null,
          signed_at: data.externalLink ? new Date().toISOString() : null
        }
      ])
      .select()
      .single();

    if (dbError || !contractData) {
      return NextResponse.json({ error: dbError?.message || 'Failed to save contract to database.' }, { status: 500, headers: corsHeaders });
    }

    const contractId = contractData.id;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const signLink = data.externalLink || `${baseUrl}/sign/${contractId}`;

    if (!data.externalLink && !data.saveOnly && process.env.RESEND_API_KEY) {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Anirudh Contracts <onboarding@resend.dev>',
        to: [data.clientEmail],
        subject: `Requires Signature: Car Lease Contract for ${data.vehicleMake} ${data.vehicleModel}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Hello ${data.clientName},</h2>
            <p>Your binding Motor Vehicle Rental Agreement is ready for your review and execution.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p><strong>Vehicle:</strong> ${data.vehicleMake} ${data.vehicleModel} (${data.vehicleRego})</p>
              <p><strong>Rental Term:</strong> ${data.startDate} to ${data.endDate}</p>
              <p><strong>Weekly Rent:</strong> $${data.weeklyPayment}</p>
            </div>
            <a href="${signLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Access Secure Contract
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">This is an automated contractual notice. If you have any questions, please reply directly.</p>
          </div>
        `,
      });

      if (emailError) {
        return NextResponse.json({ error: emailError.message }, { status: 400, headers: corsHeaders });
      }
    } else if (data.saveOnly) {
      console.log('saveOnly flag set. Contract saved to DB, no email sent.');
    } else if (!data.externalLink) {
      console.log('RESEND_API_KEY not set. Would have sent email with link:', signLink);
    } else {
      console.log('External contract linked, skipping email.');
    }

    return NextResponse.json({ success: true, contractId, signLink }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
