import "./globals.css";

export const metadata = {
  title: "Finny Signature Tool",
  description: "Email signature processor for advisor onboarding",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
