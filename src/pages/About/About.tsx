import React from 'react';
import { Link } from 'react-router-dom';
import styles from './About.module.css';

const teamMembers = [
  { name: 'Nguyen Hoang', role: 'Trưởng bộ phận đấu giá', years: '12 năm' },
  { name: 'Tran Minh', role: 'Giám đốc thẩm định phương tiện', years: '9 năm' },
  { name: 'Le Anh', role: 'Trưởng vận hành nền tảng', years: '8 năm' },
];

const milestones = [
  { year: '2018', detail: 'Nền tảng Vehicle Auction ra mắt với quy trình xác minh người bán minh bạch.' },
  { year: '2021', detail: 'Triển khai đấu giá thời gian thực và cảnh báo trên di động.' },
  { year: '2024', detail: 'Mở rộng giao nhận toàn quốc và nâng cấp cơ chế bảo vệ người mua.' },
];

export const About: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Về Vehicle Auction</p>
        <h1 className={styles.title}>Cách mua xe chất lượng cao an toàn và thông minh hơn</h1>
        <p className={styles.lead}>
          Chúng tôi kết hợp thẩm định minh bạch, người bán đã xác minh và đấu giá thời gian thực để mỗi lượt trả giá đều đáng tin cậy.
        </p>
        <div className={styles.heroActions}>
          <Link to="/auctions" className={styles.primaryAction}>Xem các phiên đang diễn ra</Link>
          <Link to="/register" className={styles.secondaryAction}>Đăng ký thành viên</Link>
        </div>
      </section>

      <section className={styles.gridSection}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Sứ mệnh của chúng tôi</h2>
          <p className={styles.panelText}>
            Minh bạch và tối ưu giao dịch xe bằng cách cung cấp cho người mua đầy đủ thông tin về lịch sử,
            tình trạng và nhu cầu thị trường thực tế.
          </p>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Điểm khác biệt của chúng tôi</h2>
          <ul className={styles.featureList}>
            <li>Báo cáo thẩm định độc lập cho từng xe niêm yết</li>
            <li>Dòng thời gian đấu giá realtime với kiểm tra lượt trả giá an toàn</li>
            <li>Thanh toán ưu tiên đảm bảo và chính sách bảo vệ người mua</li>
          </ul>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Cột mốc phát triển</h2>
          <p>Được xây dựng và cải tiến liên tục cùng người mua, người bán và đối tác đội xe.</p>
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
          <h2>Đội ngũ điều hành</h2>
          <p>Các chuyên gia về định giá xe, tuân thủ pháp lý và vận hành đấu giá số.</p>
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
