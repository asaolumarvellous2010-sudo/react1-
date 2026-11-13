# Kindred Charity Website

Kindred is a React website that helps people discover community fundraisers or create a cause of their own. It was created by **Achusiogu Chimaobim Brian**, a computer science student from Anambra.

The site uses a bright, welcoming design with editorial headings, warm orange accents, animated details, and locally stored photos of children and community support. Its goal is to make it easy to tell a fundraiser's story and show people how they can help.

## What the site can do

- Browse example fundraisers for education, food, health, community support, and emergency aid.
- Filter fundraisers by category and view their goals and progress.
- Create a fundraiser with a title, story, location, goal, contact email, and campaign photo.
- Add bank transfer details, a crypto wallet address with its network and asset, a PayPal payment link, or a combination of those methods.
- Save created fundraisers in the current browser and share a link that lets other people open the fundraiser and view its payment instructions.
- Copy bank or wallet payment details from a fundraiser's support panel.

The site is a front-end prototype. It does not process or verify payments. Supporters complete a payment directly with the fundraiser organizer. Created causes are saved in the browser where they were made; the share link carries the public campaign details so others can view it. Payment instructions and contact details included in a shared link are visible to anyone with that link. Use a backend and a payment provider if you need centrally managed campaigns, verified donations, or payment receipts.

## Built with

- React for the interactive page, category filters, cause creation form, and support dialogs.
- Vite for local development and production builds.
- CSS for the responsive layout, colors, transitions, and animations.
- Browser localStorage for saving causes on the organizer's device.
- URL hash data for portable cause links.
- Campaign photos stored in public/images/ and served with the website.

## Run the website locally

Install Node.js first. Then open a terminal in this project folder and run:

    npm install
    npm run dev

Vite prints a local address, usually http://localhost:5173. Open it in a browser to view the site.

## Useful commands

    npm run dev      # Start the local development server
    npm run build    # Create a production build in dist/
    npm run preview  # Preview the production build locally
    npm run lint     # Check the source with ESLint

## Project files

- src/App.jsx contains the page content, fundraiser data, and interactive features.
- src/App.css contains the page layout, responsive styles, and animations.
- src/index.css contains global styles and theme colors.
- public/images/ contains the photos used by the site.
- index.html contains the page title and metadata.

To change the featured example fundraisers, edit the sampleCauses list in src/App.jsx. To add or replace campaign photos, put the image in public/images/ and update the corresponding image path.
