# Fetch Dog Adoption App

A slick little web app that hooks you up with your dream doggo from across the USA. Powered by your Fetch API (I see what you did there), it’s all about browsing, filtering, and snagging the perfect pup.

## Features

- **Interactive Dog Browser**: Browse dogs with filtering by breed
- **Location-Based Search**: Filter dogs by location using an interactive map
- **Matching Algorithm**: Like dogs and get matched with the perfect dog for adoption
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Map Visualization**: View the location of dogs and your matched dog on a map

## Tech Stack

This project is built with:

- **Next.js 15**: React's cooler cousin with App Router magic.
- **React 19**: UI goodness for all the shiny bits.
- **TypeScript**: Keeps our code from going rogue.
- **Tailwind CSS**: Styles so sharp they bite.
- **Leaflet Maps**: Maps that don't suck.
- **Auth**: Custom Fetch API login—because security's sexy.

## Getting Started

### Prerequisites

Make sure you have Node.js (v18 or newer) and npm/pnpm/yarn installed on your machine.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fetch.git
cd fetch
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Build for Production

To create an optimized production build:

```bash
pnpm build
# or
npm run build
# or
yarn build
```

Then start the production server:

```bash
pnpm start
# or
npm start
# or
yarn start
```

## Implementation Notes

- The app uses client-side components for interactive elements like maps that require access to browser APIs
- Server-side rendering (SSR) is used for initial page loads to improve SEO and performance
- The map functionality uses a custom component that allows users to select areas on the map to filter dogs by location
