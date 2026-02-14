import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const s3 = new S3Client({
  region: "us-east-2",
});

const CDN_BUCKET = "finny-cdn";
const ONBOARDING_BUCKET = "advisor-onboarding-documents";
const CDN_BASE_URL = `https://${CDN_BUCKET}.s3.us-east-2.amazonaws.com`;

export async function POST(request) {
  try {
    const formData = await request.formData();

    const htmlCode = formData.get("html");
    const advisorEmail = formData.get("advisorEmail");
    const userId = formData.get("userId");

    if (!htmlCode || !advisorEmail || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: html, advisorEmail, userId" },
        { status: 400 }
      );
    }

    // Collect all uploaded images
    const images = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        images.push({
          key,
          file: value,
          name: value.name,
        });
      }
    }

    // Upload images to finny-cdn/{user_id}/
    const imageUrlMap = {};
    for (const img of images) {
      const buffer = Buffer.from(await img.file.arrayBuffer());
      const s3Key = `${userId}/${img.name}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: CDN_BUCKET,
          Key: s3Key,
          Body: buffer,
          ContentType: img.file.type || "image/png",
        })
      );

      const cdnUrl = `${CDN_BASE_URL}/${encodeURIComponent(userId)}/${encodeURIComponent(img.name)}`;
      // Map by index (image_0 -> first img tag, etc.)
      const index = parseInt(key.replace("image_", ""), 10);
      imageUrlMap[img.key] = cdnUrl;
    }

    // Parse HTML and replace img src attributes
    const $ = cheerio.load(htmlCode, { decodeEntities: false });
    const imgTags = $("img");

    // Build ordered list of CDN URLs
    const orderedUrls = [];
    for (let i = 0; i < images.length; i++) {
      orderedUrls.push(imageUrlMap[`image_${i}`]);
    }

    // Replace img src values in order
    imgTags.each((i, el) => {
      if (i < orderedUrls.length) {
        $(el).attr("src", orderedUrls[i]);
      }
    });

    const processedHtml = $.html();

    // Upload email_signature.html to advisor-onboarding-documents/{email}/
    const signatureKey = `${advisorEmail}/email_signature.html`;

    await s3.send(
      new PutObjectCommand({
        Bucket: ONBOARDING_BUCKET,
        Key: signatureKey,
        Body: processedHtml,
        ContentType: "text/html",
      })
    );

    return NextResponse.json({
      success: true,
      message: "Signature processed and uploaded successfully",
      details: {
        imagesUploaded: images.length,
        cdnPaths: images.map((img) => `${CDN_BUCKET}/${userId}/${img.name}`),
        signaturePath: `${ONBOARDING_BUCKET}/${signatureKey}`,
      },
    });
  } catch (error) {
    console.error("Error processing signature:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process signature" },
      { status: 500 }
    );
  }
}
