import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// RESEND_API_KEY must be set as an environment variable in .env.local (dev)
// or in your hosting platform's environment settings (production).
// Get your key at: https://resend.com/api-keys
const resend = new Resend(process.env.RESEND_API_KEY)

const FREIGHT_LABELS: Record<string, string> = {
  ftl: 'Full Truckload (FTL)',
  ltl: 'Less Than Truckload (LTL)',
  intermodal: 'Intermodal',
  specialized: 'Specialized / Heavy Haul',
  expedited: 'Expedited Freight',
  government: 'Government Freight',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      origin,
      destination,
      freightType,
      weightLbs,
      commodity,
      pickupDate,
      fullName,
      company,
      email,
      phone,
    } = body as Record<string, string>

    // Basic validation — all fields are required
    const required = [
      'origin', 'destination', 'freightType', 'weightLbs',
      'commodity', 'pickupDate', 'fullName', 'company', 'email', 'phone',
    ]
    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        )
      }
    }

    const freightLabel = FREIGHT_LABELS[freightType] ?? freightType

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Quote Request</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1d27;border:1px solid #2a2d3a;border-radius:8px 8px 0 0;padding:32px 40px;">
              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;font-weight:600;">Kanexa Freight</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#f0f0f0;letter-spacing:-0.3px;">New Quote Request</h1>
              <p style="margin:8px 0 0 0;font-size:13px;color:#888;"> ${origin} &rarr; ${destination}</p>
            </td>
          </tr>

          <!-- Shipment Details -->
          <tr>
            <td style="background:#14161f;border-left:1px solid #2a2d3a;border-right:1px solid #2a2d3a;padding:28px 40px 20px;">
              <p style="margin:0 0 16px 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#c9a84c;font-weight:600;">Shipment Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #1e2130;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Origin</span>
                    <span style="font-size:15px;color:#e8e8e8;font-weight:500;">${origin}</span>
                  </td>
                  <td style="padding:8px 0 8px 24px;border-bottom:1px solid #1e2130;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Destination</span>
                    <span style="font-size:15px;color:#e8e8e8;font-weight:500;">${destination}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #1e2130;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Freight Type</span>
                    <span style="font-size:15px;color:#e8e8e8;font-weight:500;">${freightLabel}</span>
                  </td>
                  <td style="padding:8px 0 8px 24px;border-bottom:1px solid #1e2130;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Weight</span>
                    <span style="font-size:15px;color:#e8e8e8;font-weight:500;">${weightLbs} lbs</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #1e2130;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Commodity</span>
                    <span style="font-size:15px;color:#e8e8e8;font-weight:500;">${commodity}</span>
                  </td>
                  <td style="padding:8px 0 8px 24px;border-bottom:1px solid #1e2130;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Requested Pickup</span>
                    <span style="font-size:15px;color:#e8e8e8;font-weight:500;">${pickupDate}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="background:#14161f;border-left:1px solid #2a2d3a;border-right:1px solid #2a2d3a;padding:20px 40px 28px;">
              <p style="margin:0 0 16px 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#c9a84c;font-weight:600;">Contact Information</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #1e2130;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Name</span>
                    <span style="font-size:15px;color:#e8e8e8;font-weight:500;">${fullName}</span>
                  </td>
                  <td style="padding:8px 0 8px 24px;border-bottom:1px solid #1e2130;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Company</span>
                    <span style="font-size:15px;color:#e8e8e8;font-weight:500;">${company}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Email</span>
                    <a href="mailto:${email}" style="font-size:15px;color:#c9a84c;font-weight:500;text-decoration:none;">${email}</a>
                  </td>
                  <td style="padding:8px 0 8px 24px;">
                    <span style="font-size:12px;color:#666;display:block;margin-bottom:2px;">Phone</span>
                    <a href="tel:${phone}" style="font-size:15px;color:#c9a84c;font-weight:500;text-decoration:none;">${phone}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1d27;border:1px solid #2a2d3a;border-top:none;border-radius:0 0 8px 8px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#555;">
                Reply directly to this email to respond to ${fullName} at ${company}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const { error } = await resend.emails.send({
      from: 'Kanexa Quotes <quotes@kanexagroup.com>',
      to: 'steve@kanexagroup.com',
      replyTo: email,
      subject: `Quote Request — ${company} | ${origin} → ${destination}`,
      html,
    })

    if (error) {
      console.error('[quote] Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[quote] Unexpected error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
