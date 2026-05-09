import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export const metadata: Metadata = {
  title: "Cofecito Portal",
  description: "Ecosystem Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full antialiased">
        <div className="flex h-full overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
