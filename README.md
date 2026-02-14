# Finny Signature Tool

Internal tool for processing advisor email signatures and uploading them to S3.

## What it does

1. You paste the email signature HTML and upload any images from the signature
2. Enter the advisor's email and their user_id from the database
3. Click submit — the tool:
   - Uploads images to `finny-cdn/{user_id}/`
   - Replaces `<img>` src URLs in the HTML with the new S3 CDN URLs
   - Uploads the final `email_signature.html` to `advisor-onboarding-documents/{advisor_email}/`

## Running locally

### 1. Clone and install

```bash
git clone <repository-url>
cd signature
npm install
```

### 2. Configure environment

Copy the example env file and add your AWS credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:

- `AWS_ACCESS_KEY_ID` — your AWS access key
- `AWS_SECRET_ACCESS_KEY` — your AWS secret key

The app uses the AWS SDK default credential chain (no credentials are passed in code). The IAM user or role must have `s3:PutObject` permission on both buckets:
- `finny-cdn`
- `advisor-onboarding-documents`

### 3. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**. Use the form to paste signature HTML, upload images, and enter the advisor email and user ID.

## Image ordering

Images map to `<img>` tags in the HTML by order:
- 1st uploaded image → 1st `<img>` tag in HTML
- 2nd uploaded image → 2nd `<img>` tag in HTML
- etc.

The tool shows you how many `<img>` tags it detects in the HTML so you know how many images to upload.
