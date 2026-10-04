import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFab from '../ui/WhatsAppFab';

export default function Layout() {
  return (
    <div className="customer-shell min-h-screen flex flex-col bg-canvas text-ink font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
