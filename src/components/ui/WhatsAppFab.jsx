import { WhatsApp } from '@mui/icons-material';

const WHATSAPP_URL = 'https://wa.me/94775868899';

export default function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_URL}
      className="whatsapp-fab"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <WhatsApp aria-hidden="true" />
    </a>
  );
}
