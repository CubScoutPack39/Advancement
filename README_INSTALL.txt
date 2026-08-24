CUB SCOUT ADVANCEMENT TRACKER — INSTALLABLE PWA

WHAT THIS IS
This version is a Progressive Web App (PWA). Once hosted at an HTTPS web address,
it can be installed on an iPhone/iPad Home Screen and opened full-screen like an app.

FILES
- index.html
- manifest.webmanifest
- sw.js
- icons/

IMPORTANT
A PWA cannot be installed from a local file:// link in the iPhone Files app.
It must be served from HTTPS (or localhost for development).

EASIEST DEPLOYMENT
Upload the entire contents of this folder to any static HTTPS host.
Examples include GitHub Pages, Netlify, Cloudflare Pages, or a web host you already use.

IPHONE INSTALLATION
1. Open the hosted HTTPS address in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Turn on Open as Web App.
5. Tap Add.

DATA
The tracker continues to save locally on each device/browser.
Use Backup Data and Restore Data to transfer records between devices.
Because data is local, installing the app does not automatically synchronize
your Mac and iPhone.

STATUS COLORS
Gray = Uncompleted / no change
Green = Completed
Red = Completed & Ordered

OFFLINE USE
After the app has been opened once from its HTTPS address, the service worker
caches the core app files so it can continue to open without a network connection.
