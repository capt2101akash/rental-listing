import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendSignupAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, address, password } = body;

    if (!email || !phone || !address || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Check if signup request already exists
    const existingRequest = await prisma.signUpRequest.findUnique({ where: { email } });
    if (existingRequest) {
      if (existingRequest.status === "REJECTED") {
        // Delete the old rejected request so they can try again
        await prisma.signUpRequest.delete({ where: { id: existingRequest.id } });
      } else {
        return NextResponse.json({ error: 'A signup request for this email is already pending' }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const signUpRequest = await prisma.signUpRequest.create({
      data: {
        email,
        phone,
        address,
        passwordHash,
      }
    });

    // Send email notification to Admin
    await sendSignupAdminNotification(email, phone).catch(console.error);

    return NextResponse.json({ success: true, request: { id: signUpRequest.id } });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
