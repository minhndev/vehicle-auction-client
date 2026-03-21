import React from 'react';
import { Link } from 'react-router-dom';
import styles from './About.module.css';

const teamMembers = [
  { name: 'Nguyen Hoang', role: 'Chief Auctioneer', years: '12 years' },
  { name: 'Tran Minh', role: 'Head of Vehicle Curation', years: '9 years' },
  { name: 'Le Anh', role: 'Platform Operations Lead', years: '8 years' },
];

const milestones = [
  { year: '2018', detail: 'Vehicle Auction launched with trusted seller verification.' },
  { year: '2021', detail: 'Introduced realtime bidding and mobile alerts.' },
  { year: '2024', detail: 'Expanded to nationwide logistics and buyer protection.' },
];

export const About: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>About Vehicle Auction</p>
        <h1 className={styles.title}>A safer and smarter way to buy premium vehicles</h1>
        <p className={styles.lead}>
          We combine transparent inspections, verified sellers, and realtime bidding so every bid is backed by trust.
        </p>
        <div className={styles.heroActions}>
          <Link to="/auctions" className={styles.primaryAction}>Browse Live Auctions</Link>
          <Link to="/register" className={styles.secondaryAction}>Join as Member</Link>
        </div>
      </section>

      <section className={styles.gridSection}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Our mission</h2>
          <p className={styles.panelText}>
            Make vehicle transactions transparent and efficient by giving buyers full visibility into history,
            condition, and real market demand.
          </p>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>What makes us different</h2>
          <ul className={styles.featureList}>
            <li>Independent condition reports on every listed vehicle</li>
            <li>Realtime auction timeline with secure bid validation</li>
            <li>Escrow-first payments and buyer protection policy</li>
          </ul>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Milestones</h2>
          <p>Built progressively with buyers, sellers, and fleet partners.</p>
        </div>
        <div className={styles.milestones}>
          {milestones.map((milestone) => (
            <article key={milestone.year} className={styles.milestoneCard}>
              <span className={styles.milestoneYear}>{milestone.year}</span>
              <p>{milestone.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Leadership team</h2>
          <p>Specialists in auto valuation, compliance, and digital auction operations.</p>
        </div>
        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <article key={member.name} className={styles.memberCard}>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <span>{member.years}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
