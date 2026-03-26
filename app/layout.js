import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";

export const metadata = {
  metadataBase: new URL('https://attkissonautos.com'),
  title: {
    default: "Attkisson Autos | Quality Used Cars & Premium Vehicles",
    template: "%s | Attkisson Autos"
  },
  description: "The premier destination for quality used vehicles since 1996. Browse our inventory of certified pre-owned cars, apply for easy financing, and join our heritage of trust.",
  keywords: ["used cars", "buy used cars", "pre-owned vehicles", "car dealership", "auto finance", "heritage vehicles", "performance cars", "certified pre-owned"],
  authors: [{ name: "Attkisson Autos" }],
  creator: "Attkisson Autos",
  publisher: "Attkisson Autos",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "Attkisson Autos | Quality Used Cars",
    description: "Reliable pre-owned vehicles with easy financing. Serving the community since 1996.",
    url: "https://attkissonautos.com",
    siteName: "Attkisson Autos",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Attkisson Autos | Quality Used Cars",
    description: "Browse our inventory and apply for financing online.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col pt-[72px]">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Chat />
      </body>
    </html>
  );
}
