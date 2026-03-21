import React from 'react';
import styles from '../Home.module.css';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  feedback: string;
  image: string;
}

const TESTIMONIAL_DATA: Testimonial[] = [
  {
    id: 1,
    name: "Robert Jaqob",
    role: "Winner 01",
    feedback: "Absolutely incredible experience. Bidding was seamless and I won my dream car at a fraction of the market price!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80"
  },
  {
    id: 2,
    name: "Robert Jaqob",
    role: "Winner 02",
    feedback: "Absolutely incredible experience. Bidding was seamless and I won my dream car at a fraction of the market price!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80"
  }
];

const TestimonialCard: React.FC<{ data: Testimonial }> = ({ data }) => {
  return (
    <div className={styles.testimonialCard}>
      <div className={styles.testimonialCardBody}>
        <h4 className={styles.testimonialName}>
          {data.name}
        </h4>
        <span className={styles.testimonialRole}>
          {data.role}
        </span>
        <div className={styles.testimonialStars}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.testimonialStar}></div>
          ))}
        </div>
        <p className={styles.testimonialText}>
          {data.feedback}
        </p>
      </div>

      <img
        src={data.image}
        alt={data.name}
        className={styles.testimonialAvatar}
      />
    </div>
  );
};

const TestimonialSection: React.FC = () => {
  return (
    <section className={`${styles.section} ${styles.sectionSoft} ${styles.testimonialSection}`}>
      <div className={styles.container}>
      <div className={styles.sectionColumnCenter}>
        <div className={`${styles.titleBlock} ${styles.testimonialTitleBlock}`}>
          <h2 className={`${styles.title} ${styles.testimonialTitle}`}>
            Auction Winner Says
          </h2>
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerDot}></div>
          </div>
        </div>

        <div className={styles.testimonialContentRow}>
          <div className={styles.testimonialLeft}>
            <h3 className={styles.testimonialLeftTitle}>
              Great Reviews
            </h3>
            <p className={styles.testimonialLeftQuote}>
              Don’t Belive Me! Check What Client Think of Us ?
            </p>

            <div className={styles.testimonialArrowRow}>
              <button className={styles.testimonialArrowButton}>
                <svg width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 1L1 4M1 4L4 7M1 4H17" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className={styles.testimonialArrowButton}>
                <svg width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 1L17 4M17 4L14 7M17 4H1" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.testimonialRight}>
            <div className={styles.testimonialTrack}>
              {TESTIMONIAL_DATA.map(item => (
                <TestimonialCard key={item.id} data={item} />
              ))}
            </div>
          </div>

        </div>

      </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

