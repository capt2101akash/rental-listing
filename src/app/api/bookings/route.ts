import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNewBookingOwnerNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, roomId, studentName, studentEmail, studentPhone, budget, requirements } = body;

    if (!propertyId || !studentName || !studentEmail || !studentPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch property to get the owner's email
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        roomId: roomId || null,
        studentEmail,
        studentName,
        studentPhone,
        budget,
        requirements,
      }
    });

    // Send email to owner
    await sendNewBookingOwnerNotification(
      property.owner.email,
      studentName,
      studentEmail,
      studentPhone,
      budget,
      requirements,
      property.address
    ).catch(console.error);

    return NextResponse.json({ success: true, booking: { id: booking.id } });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
