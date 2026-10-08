import { Metadata } from "next";
import BlogIndexClient from "./BlogIndexClient";

export const metadata: Metadata = {
  title: "Automotive Journal & Buyer Guides | mycarsNg",
  description:
    "Expert market valuations, inspection checklists, EV transitions, and essential car ownership tips for Nigeria.",
  openGraph: {
    title: "Carplug Journal & Automotive Guides | mycarsNg",
    description:
      "Expert market valuations, inspection checklists, EV transitions, and essential car ownership tips for Nigeria.",
    url: "https://carplug.ng/blog",
    siteName: "mycarsNg",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679199/carplug/articles/news1.jpg",
        width: 1200,
        height: 630,
        alt: "Carplug Journal & Automotive Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carplug Journal & Automotive Guides | mycarsNg",
    description:
      "Expert market valuations, inspection checklists, EV transitions, and essential car ownership tips for Nigeria.",
    images: ["https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679199/carplug/articles/news1.jpg"],
  },
};

export default function BlogPage() {
  return <BlogIndexClient />;
}
