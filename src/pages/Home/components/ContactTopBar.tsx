import React from 'react';
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

// --- MOCK DATA ---
interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: React.ElementType;
}

interface SocialLink {
  id: string;
  url: string;
  icon: React.ElementType;
}

const MOCK_CONTACTS: ContactInfo[] = [
  {
    id: 'email',
    type: 'email',
    label: 'Email:',
    value: 'support@vehicleauction.com',
    icon: Mail
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone:',
    value: '+1 234 567 8900',
    icon: Phone
  }
];

const MOCK_SOCIALS: SocialLink[] = [
  { id: 'facebook', url: '#', icon: Facebook },
  { id: 'twitter', url: '#', icon: Twitter },
  { id: 'instagram', url: '#', icon: Instagram },
  { id: 'linkedin', url: '#', icon: Linkedin }
];

// --- MAIN COMPONENT ---
export const ContactTopBar: React.FC = () => {
  return (
    <div className="w-full bg-[#0f172a] text-slate-300 py-1.5 px-4 xl:px-0 text-xs font-medium tracking-wide">
      <div className="w-full max-w-[1202px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          {MOCK_CONTACTS.map(contact => {
            const Icon = contact.icon;
            return (
              <div key={contact.id} className="flex items-center gap-2">
                <Icon size={14} className="text-[#ffcb23]" strokeWidth={2} />
                <span className="hidden sm:inline">{contact.label}</span>
                <a href={contact.type === 'email' ? `mailto:${contact.value}` : `tel:${contact.value}`} className="hover:text-white transition-colors">
                  {contact.value}
                </a>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-slate-400">Kết nối với chúng tôi:</span>
          <div className="flex items-center gap-3">
            {MOCK_SOCIALS.map(social => {
              const Icon = social.icon;
              return (
                <a key={social.id} href={social.url} className="text-slate-400 hover:text-[#ffcb23] transition-colors" title={social.id}>
                  <Icon size={14} strokeWidth={2} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactTopBar;

