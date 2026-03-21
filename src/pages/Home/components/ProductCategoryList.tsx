import React from 'react';
import styles from '../Home.module.css';

export interface CategoryData {
  id: string | number;
  name: string;
  logo: string;
}

const CATEGORY_MOCK_DATA: CategoryData[] = [
  { id: 1, name: 'Lamborgini', logo: 'https://img.icons8.com/color/96/000000/car.png' },
  { id: 2, name: 'Toyota', logo: 'https://img.icons8.com/color/96/000000/car.png' },
  { id: 3, name: 'Volkswagen', logo: 'https://img.icons8.com/color/96/000000/car.png' },
  { id: 4, name: 'Bently', logo: 'https://img.icons8.com/color/96/000000/car.png' },
  { id: 5, name: 'BMW', logo: 'https://img.icons8.com/color/96/000000/car.png' },
  { id: 6, name: 'Audi', logo: 'https://img.icons8.com/color/96/000000/car.png' },
  { id: 7, name: 'Rolls Royce', logo: 'https://img.icons8.com/color/96/000000/car.png' },
  { id: 8, name: 'Bugatti', logo: 'https://img.icons8.com/color/96/000000/car.png' },
  { id: 9, name: 'Rolls Royce', logo: 'https://img.icons8.com/color/96/000000/car.png' },
];

const CategoryItem = ({ data }: { data: CategoryData }) => {
  return (
    <div className={styles.categoryItem}>
      <div className={styles.categoryIconWrap}>
        <img src={data.logo} alt={data.name} className={styles.categoryIcon} />
      </div>
      <span className={styles.categoryName}>
        {data.name}
      </span>
    </div>
  );
};

export const ProductCategoryList: React.FC = () => {
  return (
    <section className={`${styles.sectionCompact} ${styles.sectionLight} ${styles.categorySection}`}>
      <div className={styles.container}>
      <div className={`${styles.titleBlock} ${styles.categoryTitleBlock}`}>
        <h2 className={`${styles.title} ${styles.categoryTitle}`}>
          Auction Product Category
        </h2>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <div className={styles.dividerDot}></div>
        </div>
      </div>

      <div className={styles.categoryList}>
        {CATEGORY_MOCK_DATA.map((item) => (
          <CategoryItem key={item.id} data={item} />
        ))}
      </div>

      </div>
    </section>
  );
};

