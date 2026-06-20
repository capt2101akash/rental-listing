"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendBookingAcknowledgedNotification } from "@/lib/email";

export async function acknowledgeBooking(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Unauthenticated" };
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email;

    // Verify the booking belongs to a property owned by the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true }
    });

    if (!booking || booking.property.ownerId !== userId) {
      return { success: false, error: "Unauthorized or booking not found" };
    }

    // Update status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "ACKNOWLEDGED" }
    });

    // Send email to student
    await sendBookingAcknowledgedNotification(
      booking.studentEmail,
      booking.property.address,
      userEmail
    ).catch(console.error);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to acknowledge booking" };
  }
}
