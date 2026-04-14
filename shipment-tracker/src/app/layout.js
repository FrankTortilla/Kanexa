import { Oswald, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Green Steel Shipment Tracker",
  description: "Live shipment tracking for warehouse and office",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${oswald.variable} ${ibmPlexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
