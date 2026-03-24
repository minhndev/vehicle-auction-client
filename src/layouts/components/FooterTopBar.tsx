import React from 'react';
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import styles from './FooterTopBar.module.css';

interface ContactItem {
  id: string;
  icon: React.ElementType;
  text: string;
}

interface SocialIcon {
  id: string;
  icon: React.ElementType;
  link: string;
}

const mockContacts: ContactItem[] = [
  { id: '1', icon: Phone, text: '+84 123 456 789' },
  { id: '2', icon: Mail, text: 'support@vehicleauction.com' },
];

const mockSocials: SocialIcon[] = [
  { id: 'facebook', icon: Facebook, link: '#' },
  { id: 'twitter', icon: Twitter, link: '#' },
  { id: 'instagram', icon: Instagram, link: '#' },
  { id: 'linkedin', icon: Linkedin, link: '#' },
];

export const FooterTopBar: React.FC = () => {
  return (
    <footer className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.contacts}>
            {mockContacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <div key={contact.id} className={styles.contactItem}>
                  <div className={styles.contactIconWrap}>
                    <Icon size={24} className={styles.contactIcon} strokeWidth={1.5} color="#2e3d83" />
                  </div>
                  <span className={styles.contactText}>{contact.text}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.socialWrap}>
            <span className={styles.socialLabel}>Follow Us</span>
            <div className={styles.socialRow}>
              {mockSocials.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.id} href={social.link} className={styles.socialItem}>
                    <Icon size={24} className={styles.socialIcon} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterTopBar;
