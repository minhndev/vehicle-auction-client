import React from 'react';
import styles from './FooterTopBar.module.css';

interface ContactItem {
  id: string;
  icon: string;
  text: string;
}

interface SocialIcon {
  id: string;
  icon: string;
  link: string;
}

const mockContacts: ContactItem[] = [
  { id: '1', icon: 'https://img.icons8.com/color/48/000000/phone.png', text: '+84 123 456 789' },
  { id: '2', icon: 'https://img.icons8.com/color/48/000000/envelope.png', text: 'support@vehicleauction.com' },
];

const mockSocials: SocialIcon[] = [
  { id: 'facebook', icon: 'https://img.icons8.com/color/48/000000/facebook-new.png', link: '#' },
  { id: 'twitter', icon: 'https://img.icons8.com/color/48/000000/twitter--v1.png', link: '#' },
  { id: 'instagram', icon: 'https://img.icons8.com/color/48/000000/instagram-new--v1.png', link: '#' },
  { id: 'linkedin', icon: 'https://img.icons8.com/color/48/000000/linkedin.png', link: '#' },
];

export const FooterTopBar: React.FC = () => {
  return (
    <footer className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.contacts}>
            {mockContacts.map((contact) => (
              <div key={contact.id} className={styles.contactItem}>
                <div className={styles.contactIconWrap}>
                  <img src={contact.icon} alt="" className={styles.contactIcon} />
                </div>
                <span className={styles.contactText}>{contact.text}</span>
              </div>
            ))}
          </div>

          <div className={styles.socialWrap}>
            <span className={styles.socialLabel}>Follow Us</span>
            <div className={styles.socialRow}>
              {mockSocials.map((social) => (
                <a key={social.id} href={social.link} className={styles.socialItem}>
                  <img src={social.icon} alt={social.id} className={styles.socialIcon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterTopBar;
