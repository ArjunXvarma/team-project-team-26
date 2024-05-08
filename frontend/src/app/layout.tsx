import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <MantineProvider>
            <Notifications position="top-right" limit={5} />
            {children}
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
