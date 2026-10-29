# Publish Luma

Import this repository's `luma-web-launch` branch into Vercel. The checked-in vercel.json serves the tested, prebuilt `site` folder without installing dependencies or requiring Python on the hosting platform. No environment variables or backend are required.

After deployment, share the production HTTPS URL from Vercel. Test calculations, downloads, saving, and mobile layout at that URL. Saved projects are browser-local.

## Updating the deployed app

Run `npm ci`, `npm test`, and `npm run build`. Replace `site` with the new `dist` contents, commit source and site together, and push this branch. Vercel redeploys automatically when connected. The app is hosted at the domain root.
