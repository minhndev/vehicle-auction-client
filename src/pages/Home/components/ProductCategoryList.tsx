import React, { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import type { CategoryResponse } from '../../../types';
import { getHomeCategories } from './homeDataService';
import styles from '../Home.module.css';

export interface CategoryData {
  id: string | number;
  name: string;
  logo: React.ElementType;
}

const CategoryItem = ({ data }: { data: CategoryData }) => {
  const Icon = data.logo;
  return (
    <div className={styles.categoryItem}>
      <div className={styles.categoryIconWrap}>
        <Icon size={40} strokeWidth={1.5} color="#2e3d83" className={styles.categoryIcon} />
      </div>
      <span className={styles.categoryName}>
        {data.name}
      </span>
    </div>
  );
};

export const ProductCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        const content = await getHomeCategories();
        const safeContent = Array.isArray(content) ? content : [];

        if (!mounted) return;
        setCategories(
          safeContent.map((item: CategoryResponse, index: number) => ({
            id: String(item.id ?? item.slug ?? item.name ?? `category-${index}`),
            name: item.name ?? 'Danh mục',
            logo: Car,
          })),
        );
      } catch {
        if (!mounted) return;
        setCategories([]);
      }
    };

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className={`${styles.sectionCompact} ${styles.sectionLight} ${styles.categorySection}`}>
      <div className={styles.container}>
      <div className={`${styles.titleBlock} ${styles.categoryTitleBlock}`}>
        <h2 className={`${styles.title} ${styles.categoryTitle}`}>
          Danh mục sản phẩm đấu giá
        </h2>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <div className={styles.dividerDot}></div>
        </div>
      </div>

      <div className={styles.categoryList}>
        {categories.length === 0 ? (
          <p className={styles.activityEmpty}>Chưa có danh mục.</p>
        ) : (
          categories.map((item) => (
            <CategoryItem key={item.id} data={item} />
          ))
        )}
      </div>

      </div>
    </section>
  );
};

