import React, { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import type { CategoryResponse } from '../../../types';
import { getHomeCategories } from './homeDataService';

export interface CategoryData {
  id: string | number;
  name: string;
  logo: React.ElementType;
}

const CategoryItem = ({ data }: { data: CategoryData }) => {
  const Icon = data.logo;
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group cursor-pointer hover:-translate-y-2">
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-[#2e3d83]/10 transition-colors">
        <Icon size={32} strokeWidth={1.5} className="text-slate-400 group-hover:text-[#2e3d83] transition-colors" />
      </div>
      <span className="text-xs font-bold text-slate-700 group-hover:text-[#2e3d83] transition-colors text-center uppercase tracking-widest">
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
    <section className="w-full bg-white py-24 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2e3d83] mb-6 tracking-tight">
            Khám Phá Theo <span className="text-[#f4c23d]">Dòng Xe</span>
          </h2>
          <div className="flex items-center justify-center relative w-64 h-8 mb-4">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200"></div>
            <div className="w-8 h-8 rounded-full bg-[#f4c23d] relative z-10 shadow-md"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-500 font-bold">
              Chưa có danh mục nào.
            </div>
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

