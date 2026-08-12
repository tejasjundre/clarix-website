# Custom domain deployment

Use Netlify for hosting and serverless form handling, then connect your real domain so visitors only see:

```text
https://clarixdigitech.com
https://www.clarixdigitech.com
```

The site will not show a temporary platform URL to visitors.

## 1. Push the project to GitHub

```powershell
git init
git add .
git commit -m "Prepare Clarix website for custom domain hosting"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

If Git is not installed on your PC, install Git for Windows first, then restart VS Code.

## 2. Create the Netlify site

1. Open Netlify and choose **Add new site**.
2. Choose **Import an existing project**.
3. Connect your GitHub repository.
4. Use these settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Deploy the site.

## 3. Add form email settings

In Netlify, open **Site configuration > Environment variables** and add:

```text
FORM_TO_EMAIL=your-email@example.com
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@example.com
SMTP_PASS=your-hostinger-mailbox-password
SMTP_FROM_EMAIL=Your Company <your-email@example.com>
```

Use the real password for your mailbox from Hostinger Email.

After these values are added, every website enquiry submitted through `/api/enquiries` is emailed to your configured `FORM_TO_EMAIL` address. The email subject includes a Clarix reference ID like `CLX-20260812-ABC123`.

## 4. Connect your domain

1. In Netlify, open **Domain management**.
2. Add `clarixdigitech.com`.
3. Add `www.clarixdigitech.com`.
4. Netlify will show DNS records or nameservers.
5. Open your domain provider, such as Hostinger, GoDaddy, Namecheap, or Cloudflare.
6. Add exactly the DNS records Netlify shows.
7. Set `clarixdigitech.com` as the primary domain.
8. Enable HTTPS after DNS is verified.

## 5. Verify before sharing

Open these URLs:

```text
https://clarixdigitech.com
https://clarixdigitech.com/api/health
```

Then submit one test enquiry from the website and confirm it reaches your configured `FORM_TO_EMAIL` address.

## Professional recommendation

For your current website, Netlify + custom domain is the cleanest setup. It looks professional, loads fast, supports HTTPS, hides platform branding, and keeps the enquiry backend under your own domain path.
