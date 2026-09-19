import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ServicePaymentProvider } from "../context/ServicePaymentContext";

export const metadata = {
  title: "Digital Money House",
  description: "Billetera virtual Digital Money House",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ServicePaymentProvider>{children}</ServicePaymentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}