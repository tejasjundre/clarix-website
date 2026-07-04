# Deployment instructions

## 1. Push to GitHub
- Create a GitHub repository for this folder.
- Commit and push all files.

## 2. Deploy on Render
- Open https://render.com
- Create a new Web Service
- Connect your GitHub repo
- Use these values:
  - Build Command: npm install && npm run build
  - Start Command: npm start
- Add environment variables if you want email notifications:
  - FORM_TO_EMAIL
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_SECURE
  - SMTP_USER
  - SMTP_PASS
  - SMTP_FROM_EMAIL

## 3. Connect your domain
- In Render, go to the service > Custom Domains
- Add your purchased domain
- Update your domain DNS to the Render target shown there

## 4. Verify
- Open your domain in the browser
- Test the contact form
- If SMTP is configured, confirm enquiries are delivered
