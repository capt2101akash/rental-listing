import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendApprovalOwnerNotification } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
  // Verify Admin role
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { action } = await request.json();
  const signUpRequest = await prisma.signUpRequest.findUnique({ where: { id } });

  if (!signUpRequest) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  if (signUpRequest.status !== "PENDING") return NextResponse.json({ error: 'Request already processed' }, { status: 400 });

  try {
    if (action === 'approve') {
      // Create User from SignUpRequest (using the password they set)
      await prisma.user.create({
        data: {
          email: signUpRequest.email,
          phone: signUpRequest.phone,
          address: signUpRequest.address,
          passwordHash: signUpRequest.passwordHash,
          role: "OWNER"
        }
      });
      // Update status
      await prisma.signUpRequest.update({
        where: { id },
        data: { status: "APPROVED" }
      });
      // Send email to owner
      await sendApprovalOwnerNotification(signUpRequest.email).catch(console.error);
    } else if (action === 'reject') {
      await prisma.signUpRequest.update({
        where: { id },
        data: { status: "REJECTED" }
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    revalidatePath('/admin/requests');
    revalidatePath('/admin');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
