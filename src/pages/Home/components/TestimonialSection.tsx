import React, { useEffect, useState } from 'react';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import type { AuctionResponse } from '../../../types';
import styles from '../Home.module.css';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  feedback: string;
  image: string;
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.max(0, amount));
};

const toAvatarUrl = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=ffffff&size=220`;
};

const toTestimonials = (completedAuctions: AuctionResponse[]): Testimonial[] => {
  return completedAuctions
    .filter((item) => item.winnerName || item.winnerUsername || item.winnerEmail)
    .slice(0, 3)
    .map((item, index) => {
      const winnerName = String(item.winnerName ?? item.winnerUsername ?? item.winnerEmail ?? `Người thắng ${index + 1}`);
      const auctionName = item.productName ?? 'phiên đấu giá';
      const price = Number(item.currentPrice ?? item.startPrice ?? 0);

      return {
        id: String(item.id ?? index),
        name: winnerName,
        role: `Người thắng #${index + 1}`,
        feedback: `Tôi đã thắng ${auctionName} với mức giá ${formatVND(price)}. Hệ thống đấu giá minh bạch, cập nhật realtime rõ ràng và thao tác rất nhanh.`,
        image: toAvatarUrl(winnerName),
      };
    });
};

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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTestimonials = async () => {
      try {
        const page = await auctionApi.getPublicAuctions({ status: 'COMPLETED', page: 0, size: 12, sort: 'updatedAt,desc' });
        const completedAuctions = Array.isArray(page?.content) ? page.content : [];

        if (!mounted) return;
        setTestimonials(toTestimonials(completedAuctions));
      } catch {
        if (!mounted) return;
        setTestimonials([]);
      }
    };

    fetchTestimonials();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className={`${styles.section} ${styles.sectionSoft} ${styles.testimonialSection}`}>
      <div className={styles.container}>
      <div className={styles.sectionColumnCenter}>
        <div className={`${styles.titleBlock} ${styles.testimonialTitleBlock}`}>
          <h2 className={`${styles.title} ${styles.testimonialTitle}`}>
            Chia sẻ từ người thắng
          </h2>
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerDot}></div>
          </div>
        </div>

        <div className={styles.testimonialContentRow}>
          <div className={styles.testimonialLeft}>
            <h3 className={styles.testimonialLeftTitle}>
              Đánh giá nổi bật
            </h3>
            <p className={styles.testimonialLeftQuote}>
              Trải nghiệm thực tế từ người tham gia và chiến thắng các phiên đấu giá gần đây.
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
              {testimonials.length === 0 ? (
                <p className={styles.activityEmpty}>Chưa có phản hồi từ người thắng phiên gần đây.</p>
              ) : (
                testimonials.map((item) => (
                  <TestimonialCard key={item.id} data={item} />
                ))
              )}
            </div>
          </div>

        </div>

      </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

