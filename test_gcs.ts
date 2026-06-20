import { Storage } from "@google-cloud/storage";

async function testGCS() {
  const getStorage = () => {
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY || !process.env.GCS_BUCKET_NAME) {
      console.log("Missing ENV vars!");
      return null;
    }
    
    return new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  };

  const storage = getStorage();
  if (!storage) return;

  const bucketName = process.env.GCS_BUCKET_NAME!;
  const bucket = storage.bucket(bucketName);
  
  const file = bucket.file(`test/test-${Date.now()}.txt`);

  try {
    console.log("Uploading file...");
    await file.save("Hello world test buffer", {
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    console.log("Upload SUCCESS");
  } catch (err: any) {
    console.error("Upload FAILED:", err.message);
  }
}

testGCS().catch(console.error);
