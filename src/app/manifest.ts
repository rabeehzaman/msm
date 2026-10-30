import type { MetadataRoute } from "next";

// Lets the app be added to a phone's home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mahallu Smart Manager",
    short_name: "Mahallu",
    description: "Finances and daily administration for the Mahallu committee",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f5ec",
    theme_color: "#0d4f43",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
