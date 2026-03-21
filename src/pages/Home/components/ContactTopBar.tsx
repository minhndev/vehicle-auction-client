import React from 'react';
import styles from '../Home.module.css';

// --- MOCK DATA ---
interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string;
}

interface SocialLink {
  id: string;
  url: string;
  icon: string;
}

const MOCK_CONTACTS: ContactInfo[] = [
  {
    id: 'email',
    type: 'email',
    label: 'Email:',
    value: 'support@vehicleauction.com',
    icon: 'https://img.icons8.com/color/48/000000/new-post.png' // Email Icon
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone:',
    value: '+1 234 567 8900',
    icon: 'https://img.icons8.com/color/48/000000/phone.png' // Phone Icon
  }
];

const MOCK_SOCIALS: SocialLink[] = [
  { id: 'facebook', url: '#', icon: 'https://img.icons8.com/color/48/000000/facebook-new.png' },
  { id: 'twitter', url: '#', icon: 'https://img.icons8.com/color/48/000000/twitter--v1.png' },
  { id: 'instagram', url: '#', icon: 'https://img.icons8.com/color/48/000000/instagram-new--v1.png' },
  { id: 'linkedin', url: '#', icon: 'https://img.icons8.com/color/48/000000/linkedin.png' }
];

// --- SUB-COMPONENTS ---
const ContactItem: React.FC<{ contact: ContactInfo }> = ({ contact }) => (
  <div className={styles.contactItem}>
    <div className={styles.contactIconWrap}>
      <img src={contact.icon} alt={contact.type} className={styles.contactIcon} />
    </div>
    <span className={styles.contactText}>
      {contact.label} <a href={contact.type === 'email' ? `mailto:${contact.value}` : `tel:${contact.value}`} className={styles.contactLink}>{contact.value}</a>
    </span>
  </div>
);

const SocialItem: React.FC<{ social: SocialLink }> = ({ social }) => (
  <a href={social.url} className={styles.contactSocialItem}>
    <img src={social.icon} alt={social.id} className={styles.contactSocialIcon} />
  </a>
);

// --- MAIN COMPONENT ---
export const ContactTopBar: React.FC = () => {
  return (
    <div className={styles.contactTopWrap}>
      <div className={`${styles.containerHero} ${styles.contactTopInner}`}>
        <div className={styles.contactLeft}>
          {MOCK_CONTACTS.map(contact => (
            <ContactItem key={contact.id} contact={contact} />
          ))}
        </div>

        <div className={styles.contactRight}>
          <span className={styles.contactFollow}>Follow us</span>
          <div className={styles.contactSocialRow}>
            {MOCK_SOCIALS.map(social => (
              <SocialItem key={social.id} social={social} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactTopBar;

