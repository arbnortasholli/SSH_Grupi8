import React from 'react';
import { ChatWidget } from '../components/chat/ChatWidget';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="app-shell">
    <Navbar />
    <main className="app-main">{children}</main>
    <Footer />
    <ChatWidget />
  </div>
);
