import { Storage } from "@google-cloud/storage";

// Initialize storage safely. If env vars are missing, it will still export a mock or fail gracefully at runtime.
const getStorage = () => {
  if (!process.env.GCS_PROJECT_ID || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY || !process.env.GCS_BUCKET_NAME) {
    return null;
  }
  
  return new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
      client_email: process.env.GCS_CLIENT_EMAIL,
      private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'), // handle newlines correctly
    },
  });
};

const storage = getStorage();

export async function uploadToGCS(
  fileBuffer: Buffer, 
  filename: string, 
  propertyId: string, 
  roomId?: string
): Promise<string> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  
  if (!storage || !bucketName) {
    console.warn("GCS credentials missing. Skipping actual upload and returning a placeholder URL.");
    // Return a dummy placeholder image so UI development can continue without crashing
    return `https://placehold.co/600x400/png?text=Missing+GCS+Credentials`;
  }

  const bucket = storage.bucket(bucketName);
  
  // Enforce structured directory mapping: propertyId/roomId/filename
  const destinationPath = roomId 
    ? `${propertyId}/${roomId}/${filename}`
    : `${propertyId}/${filename}`;

  const file = bucket.file(destinationPath);

  // Upload the buffer with a retry loop to mitigate Next.js global fetch "Premature close" bugs during GCP OAuth
  let attempts = 3;
  while (attempts > 0) {
    try {
      await file.save(fileBuffer, {
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });
      break; // Success, exit loop
    } catch (error: any) {
      if (error?.message?.includes('Premature close') && attempts > 1) {
        console.warn(`GCS Upload 'Premature close' encountered. Retrying... (${attempts - 1} attempts left)`);
        attempts--;
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s before retry
      } else {
        throw error; // If it's not a premature close, or we're out of attempts, throw it.
      }
    }
  }

  // Construct the public CDN URL
  return `https://storage.googleapis.com/${bucketName}/${encodeURI(destinationPath)}`;
}
