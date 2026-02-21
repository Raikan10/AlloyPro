import { NextResponse } from 'next/server';

const DUST_WORKSPACE_ID = 'DiI18NcyDY';
const DUST_API_KEY = 'sk-96bcdc878511c7807eb8fff938c383d6';

export async function POST(request: Request) {
    try {
        const { orderDetails, partDetails } = await request.json();

        const prompt = `Please place a purchase order for the following diagnostic task:
Order Reference: ${orderDetails.id}
Customer: ${orderDetails.customer}
Equipment: ${orderDetails.system} (${orderDetails.oemBrand})
Required Part: ${partDetails.name} (SKU: ${partDetails.sku}, Qty: ${partDetails.quantity})
Reporter: ${orderDetails.reporter.name}`;

        const dustRes = await fetch(
            `https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/assistant/conversations`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${DUST_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: {
                        content: prompt,
                        mentions: [{ configurationId: 'relay' }],
                        context: {
                            username: 'AlloyPro System',
                            timezone: 'America/New_York',
                            profilePictureUrl: null,
                        },
                    },
                    blocking: true,
                }),
            }
        );

        if (!dustRes.ok) {
            const errorText = await dustRes.text();
            console.error('Dust API Error:', errorText);
            // For the sake of the demo, DO NOT fail the request.
            // We log the error, but still return success to the frontend.
            return NextResponse.json({ success: true, warning: 'Dust API failed, but demo continues.' });
        }

        try {
            const data = await dustRes.json();
            return NextResponse.json({ success: true, data });
        } catch (e) {
            return NextResponse.json({ success: true, warning: 'Could not parse Dust response.' });
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        // Even if something critically fails, return success to not block the demo screen.
        return NextResponse.json({ success: true, warning: 'Internal Server Error caught.' });
    }
}
