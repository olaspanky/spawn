// app/api/verify-payment/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  const { reference } = await request.json();

  try {
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${"sk_test_9e808e68ace31ed42ff6b19495b9461d2bbecabd"}`,
        },
      }
    );

    const { status } = paystackResponse.data.data;
    if (status !== 'success') {
      return NextResponse.json({ success: false, message: 'Payment not successful' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 500 });
  }
}
