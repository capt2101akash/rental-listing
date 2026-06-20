"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadToGCS } from "@/lib/gcs";

export async function deleteProperty(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: false, error: "Unauthorized" };
    
    await prisma.property.deleteMany({
      where: { id, ownerId: (session.user as any).id }
    });
    
    revalidatePath("/dashboard/properties");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete property" };
  }
}

export async function updateRoomDetails(roomId: string, description: string, rent: number, isSharing: boolean, leaseTerm: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: false, error: "Unauthorized" };
    
    // Verify ownership implicitly or explicitly
    await prisma.room.update({
      where: { id: roomId },
      data: { description, rent, isSharing, leaseTerm }
    });
    
    revalidatePath("/dashboard/properties");
    revalidatePath("/listings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update room" };
  }
}

export async function toggleRoomRented(roomId: string, propertyId: string, isRented: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: false, error: "Unauthorized" };
    
    await prisma.room.update({
      where: { id: roomId },
      data: { isRented }
    });

    // Check if all rooms in the property are now rented
    const unrentedRooms = await prisma.room.count({
      where: { propertyId, isRented: false }
    });

    // Automatically update the property status based on its rooms
    await prisma.property.update({
      where: { id: propertyId },
      data: { isRented: unrentedRooms === 0 }
    });
    
    revalidatePath("/dashboard/properties");
    revalidatePath(`/property/${propertyId}`);
    revalidatePath("/listings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle room rented status" };
  }
}

export async function addCompleteProperty(formData: FormData) {
  try {
    // 1. Strict Authentication Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Unauthenticated. You must be logged in to add a property." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== "OWNER") {
      return { success: false, error: "Unauthorized. Only owners can add properties." };
    }

    // 2. Extract Property Data
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const bathrooms = parseInt(formData.get("bathrooms") as string) || 0;
    const bedrooms = parseInt(formData.get("bedrooms") as string) || 0;
    const rentWholeHouse = formData.get("rentWholeHouse") === "on";
    const rentIndividually = formData.get("rentIndividually") === "on";
    
    const wholeHouseRentRaw = formData.get("wholeHouseRent") as string;
    const wholeHouseRent = wholeHouseRentRaw ? parseFloat(wholeHouseRentRaw) : null;
    const numRooms = parseInt(formData.get("numRooms") as string) || 0;

    if (!address || !description) {
      return { success: false, error: "Address and Description are required." };
    }

    // Enforce Unique Property Addresses
    const existingProperty = await prisma.property.findFirst({
      where: { address }
    });
    if (existingProperty) {
      return { success: false, error: `A property with the address "${address}" is already listed.` };
    }

    // Calculate Walking Distance to CSUN
    let walkingMinutesToCsun = null;
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const CSUN_DESTINATION = "Younes and Soraya Nazarian Center for the Performing Arts, Northridge";
        const origin = encodeURIComponent(address);
        const destination = encodeURIComponent(CSUN_DESTINATION);
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=walking&key=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
          const durationSeconds = data.rows[0].elements[0].duration.value;
          walkingMinutesToCsun = Math.round(durationSeconds / 60);
        }
      }
    } catch (err) {
      console.error("Failed to calculate distance to CSUN:", err);
    }

    // Pre-generate UUIDs to structure GCS paths before DB insertion
    const propertyId = crypto.randomUUID();
    let propertyImageUrl: string | null = null;
    const roomsToCreate: Array<{
      id: string;
      description: string;
      rent: number;
      leaseTerm: string | null;
      isSharing: boolean;
      mediaUrls: string[];
    }> = [];

    // 3. Handle Property Main Image Upload
    const propertyImage = formData.get("propertyImage") as File | null;
    if (propertyImage && propertyImage.size > 0) {
      const buffer = Buffer.from(await propertyImage.arrayBuffer());
      propertyImageUrl = await uploadToGCS(buffer, propertyImage.name, propertyId);
    }

    // 4. Handle Dynamic Rooms Creation & Image Uploads
    for (let i = 0; i < numRooms; i++) {
      const roomDesc = formData.get(`room_${i}_description`) as string;
      const roomRentRaw = formData.get(`room_${i}_rent`) as string;
      const roomLeaseTermsArray = formData.getAll(`room_${i}_leaseTerm`) as string[];
      const roomLeaseTerm = roomLeaseTermsArray.join(", ");
      const isSharing = formData.get(`room_${i}_isSharing`) === "on";

      if (!roomDesc || !roomRentRaw) continue;

      const roomRent = parseFloat(roomRentRaw);
      const roomId = crypto.randomUUID();

      const mediaUrls: string[] = [];
      const roomMediaFiles = formData.getAll(`room_${i}_media`) as File[];
      for (const file of roomMediaFiles) {
        if (file && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const publicUrl = await uploadToGCS(buffer, file.name, propertyId, roomId);
          mediaUrls.push(publicUrl);
        }
      }

      roomsToCreate.push({
        id: roomId,
        description: roomDesc,
        rent: roomRent,
        leaseTerm: roomLeaseTerm || null,
        isSharing,
        mediaUrls
      });
    }

    // 5. Atomic Database Insertion (ACID Guarantee)
    await prisma.$transaction(async (tx) => {
      // Create Base Property Record
      await tx.property.create({
        data: {
          id: propertyId,
          ownerId: user.id,
          address,
          description,
          bedrooms,
          bathrooms,
          rentWholeHouse,
          rentIndividually,
          wholeHouseRent,
          walkingMinutesToCsun,
        }
      });

      // Create Property Media Record
      if (propertyImageUrl) {
        await tx.media.create({
          data: {
            entityType: "PROPERTY",
            propertyId: propertyId,
            url: propertyImageUrl
          }
        });
      }

      // Create Rooms and their Media
      for (const room of roomsToCreate) {
        await tx.room.create({
          data: {
            id: room.id,
            propertyId: propertyId,
            description: room.description,
            rent: room.rent,
            leaseTerm: room.leaseTerm,
            isSharing: room.isSharing,
          }
        });

        for (const url of room.mediaUrls) {
          await tx.media.create({
            data: {
              entityType: "ROOM",
              roomId: room.id,
              url: url
            }
          });
        }
      }
    });

    // Revalidate cache to show new property
    revalidatePath("/dashboard/properties");
    revalidatePath("/listings");

    return { success: true, propertyId };
  } catch (error: any) {
    console.error("Error adding property:", error);
    return { success: false, error: error.message || "Failed to add property" };
  }
}
