import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";

export const metadata = {
  title: "Attkisson Autos | Premium Heritage & Performance Vehicles",
  description: "The premier destination for quality used vehicles since 1996. We deliver reliability and trust to our community.",
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
