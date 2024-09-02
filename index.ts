import "dotenv/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

async function fetchAndPut() {
  const response = await fetch("https://picsum.photos/1600/900.webp");

  if (!response.ok) {
    console.error("Bad response");
    process.exit(1);
  }

  if (!response.body) {
    console.error("No body");
    process.exit(1);
  }

  // This one will fail despite there being no compile-time type errors
  await s3Client
    .send(
      new PutObjectCommand({
        Bucket: "fetchandputrepro",
        Key: "image1.webp",
        Body: response.body,
        ContentType: "image/webp",
      })
    )
    .then(
      (data) => console.log(`Etag: ${data.ETag}`),
      (err) => console.error(`response.body error: ${err}`)
    );

  // This works, but requires reading the file into memory, which is alright in
  // this example, but would be suboptimal if I had to do this for large videos
  await s3Client
    .send(
      new PutObjectCommand({
        Bucket: "fetchandputrepro",
        Key: "image2.webp",
        Body: new Uint8Array(await response.arrayBuffer()),
        ContentType: "image/webp",
      })
    )
    .then(
      (data) => console.log(`Etag: ${data.ETag}`),
      (err) => console.error(`Read and convert into Uint8Array error: ${err}`)
    );
}

await fetchAndPut();
