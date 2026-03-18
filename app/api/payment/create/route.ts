/**
 * POST /api/payment/create
 * Creates a Midtrans Snap transaction token for the logged-in user.
 * Returns { token, orderId } on success.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { snap, PREMIUM_PRICE_IDR, PRODUCT_NAME } from '@/lib/midtrans';

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Already premium — no need to pay again
  if ((session.user as { plan?: string }).plan === 'premium') {
    return NextResponse.json({ error: 'Already premium' }, { status: 400 });
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
      finish: `${process.env.NEXTAUTH_URL}/upgrade?status=success`,
      error: `${process.env.NEXTAUTH_URL}/upgrade?status=error`,
      pending: `${process.env.NEXTAUTH_URL}/upgrade?status=pending`,
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
