# Finny Signature Tool

Internal tool for processing advisor email signatures and uploading them to S3.

## What it does

1. You paste the email signature HTML and upload any images from the signature
2. Enter the advisor's email and their user_id from the database
3. Click submit — the tool:
   - Uploads images to `finny-cdn/{user_id}/`
   - Replaces `<img>` src URLs in the HTML with the new S3 CDN URLs
   - Uploads the final `email_signature.html` to `advisor-onboarding-documents/{advisor_email}/`

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your AWS credentials. The IAM user needs `s3:PutObject` permission on both buckets:
- `finny-cdn`
- `advisor-onboarding-documents`

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

Add your environment variables in Vercel project settings:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Image ordering

Images map to `<img>` tags in the HTML by order:
- 1st uploaded image → 1st `<img>` tag in HTML
- 2nd uploaded image → 2nd `<img>` tag in HTML
- etc.

The tool shows you how many `<img>` tags it detects in the HTML so you know how many images to upload.
