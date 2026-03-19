/**
 * POST /api/payment/create
 * Creates a Midtrans Snap transaction token for the logged-in user.
 * Returns { token, orderId } on success.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { snap, PREMIUM_PRICE_IDR, PRODUCT_NAME } from '@/lib/midtrans';

/**
 * Derive the application base URL from the request or environment variables.
 * Prefers NEXTAUTH_URL, then falls back to the Host / x-forwarded-proto headers.
 */
function getBaseUrl(req: NextRequest): string {
  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl) {
    // Validate it is a proper URL before using it
    try {
      return new URL(envUrl).origin;
    } catch {
      // Fall through to header-based derivation
    }
  }

  // Derive from request headers (works on Vercel and any reverse-proxy setup)
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (host) {
    return `${proto}://${host}`;
  }

  // Last-resort fallback so the route still returns a clear error instead of crashing
  return '';
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Already premium — no need to pay again
  if ((session.user as { plan?: string }).plan === 'premium') {
    return NextResponse.json({ error: 'Already premium' }, { status: 400 });
  }

  const baseUrl = getBaseUrl(req);
  if (!baseUrl) {
    console.error(
      'Payment create: cannot determine base URL. ' +
        'Set NEXTAUTH_URL in your environment variables.'
    );
    return NextResponse.json(
      { error: 'Server misconfiguration: base URL unavailable. Contact support.' },
      { status: 500 }
    );
  }

  // Generate a unique order ID: userId + timestamp
  const orderId = `RTI-${session.user.id}-${Date.now()}`;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: PREMIUM_PRICE_IDR,
    },
    item_details: [
      {
        id: 'premium-monthly',
        price: PREMIUM_PRICE_IDR,
        quantity: 1,
        name: PRODUCT_NAME,
      },
    ],
    customer_details: {
      first_name: session.user.name ?? 'User',
      email: session.user.email ?? '',
    },
    // Pre-select GoPay in the popup (user can still choose other methods)
    enabled_payments: ['gopay', 'bank_transfer', 'credit_card', 'other_qris'],
    // Redirect URLs after payment completes (Snap popup closes and redirects)
    callbacks: {
      finish: `${baseUrl}/upgrade?status=success`,
      error: `${baseUrl}/upgrade?status=error`,
      pending: `${baseUrl}/upgrade?status=pending`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({
      token: transaction.token,
      orderId,
    });
  } catch (err) {
    console.error('Midtrans createTransaction error:', err);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
