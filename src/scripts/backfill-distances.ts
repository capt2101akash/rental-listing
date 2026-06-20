import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The target destination
const CSUN_DESTINATION = "Younes and Soraya Nazarian Center for the Performing Arts, Northridge";

async function backfillDistances() {
  console.log("Starting backfill for walking distances to CSUN...");
  
  const properties = await prisma.property.findMany({
    where: { walkingMinutesToCsun: null }
  });

  if (properties.length === 0) {
    console.log("No properties need backfilling.");
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in .env!");
    return;
  }

  for (const property of properties) {
    try {
      console.log(`Calculating for: ${property.address}`);
      const origin = encodeURIComponent(property.address);
      const destination = encodeURIComponent(CSUN_DESTINATION);
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=walking&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const durationSeconds = data.rows[0].elements[0].duration.value;
        const walkingMinutes = Math.round(durationSeconds / 60);

        await prisma.property.update({
          where: { id: property.id },
          data: { walkingMinutesToCsun: walkingMinutes }
        });
        console.log(`✅ Updated ${property.address}: ${walkingMinutes} minutes walking`);
      } else {
        console.error(`❌ Failed to get distance for ${property.address}:`, data.status, data.rows[0].elements[0].status);
      }
    } catch (error) {
      console.error(`❌ Error processing ${property.address}:`, error);
    }
    
    // Add a small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("Backfill complete.");
}

backfillDistances()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
