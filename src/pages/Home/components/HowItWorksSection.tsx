import React, { useEffect, useState } from 'react';
import { Users, Gavel, Trophy } from 'lucide-react';
import { getAuctionList, getHomeCategories, getUpcomingAuctions } from './homeDataService';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const getProcessSteps = (stats: {
  categoryCount: number;
  scheduledCount: number;
  activeCount: number;
  completedCount: number;
}): ProcessStep[] => {
  return [
    {
      id: 1,
      title: 'Tạo Tài Khoản & Chọn Xe',
      description: `${stats.categoryCount} danh mục xe, ${stats.scheduledCount} phiên sắp mở.`,
      icon: Users,
    },
    {
      id: 2,
      title: 'Đặt Cọc & Đấu Giá',
      description: `${stats.activeCount} phiên đang diễn ra thời gian thực.`,
      icon: Gavel,
    },
    {
      id: 3,
      title: 'Thắng Phiên & Hoàn Tất',
      description: `${stats.completedCount} phiên đã hoàn thành thành công.`,
      icon: Trophy,
    },
  ];
};

const ProcessStepCard: React.FC<{ data: ProcessStep; stepNum: number }> = ({ data, stepNum }) => {
  const Icon = data.icon;
  return (
    <div className="relative flex flex-col items-center flex-1 max-w-[320px] mx-auto text-center group">
      <div className="absolute top-0 right-10 -mt-4 -mr-4 text-8xl font-black text-slate-100/50 z-0 select-none group-hover:text-blue-50 transition-colors">
        0{stepNum}
      </div>
      <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-[#2e3d83]/10 flex items-center justify-center mb-8 relative z-10 border border-slate-100 group-hover:-translate-y-2 transition-transform duration-300">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-[#2e3d83] transition-colors duration-300">
          <Icon size={32} strokeWidth={2} className="text-[#2e3d83] group-hover:text-white transition-colors duration-300" />
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-[#2e3d83] mb-3 relative z-10">
        {data.title}
      </h3>
      <p className="text-slate-500 font-medium leading-relaxed relative z-10 px-4">
        {data.description}
      </p>
    </div>
  );
};

const HowItWorksSection: React.FC = () => {
  const [steps, setSteps] = useState<ProcessStep[]>(
    getProcessSteps({
      categoryCount: 0,
      scheduledCount: 0,
      activeCount: 0,
      completedCount: 0,
    }),
  );

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        const [categories, activeList, upcomingList, completedList] = await Promise.all([
          getHomeCategories(),
          getAuctionList({ status: 'ACTIVE', page: 0, size: 100 }),
          getUpcomingAuctions(100),
          getAuctionList({ status: 'COMPLETED', page: 0, size: 100 }),
        ]);

        if (!mounted) return;

        setSteps(
          getProcessSteps({
            categoryCount: Array.isArray(categories) ? categories.length : 0,
            activeCount: activeList.length,
            scheduledCount: upcomingList.length,
            completedCount: completedList.length,
          }),
        );
      } catch {
        if (!mounted) return;
        setSteps(
          getProcessSteps({
            categoryCount: 0,
            activeCount: 0,
            scheduledCount: 0,
            completedCount: 0,
          }),
        );
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="w-full bg-slate-50 py-24 pb-32 border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-24 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2e3d83] mb-6 tracking-tight">
            Cách Thức <span className="text-[#f4c23d]">Hoạt Động</span>
          </h2>
          <div className="flex items-center justify-center relative w-64 h-8 mb-4">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200"></div>
            <div className="w-8 h-8 rounded-full bg-[#f4c23d] relative z-10 shadow-md"></div>
          </div>
          <p className="text-lg text-slate-500 font-medium mt-4">
            Chọn xe đã được kiểm định, theo dõi lịch sử minh bạch và tham gia đấu giá trực tuyến với cập nhật thời gian thực.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-16 md:gap-4 relative">
          
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-slate-300 -z-10"></div>

          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <ProcessStepCard data={step} stepNum={index + 1} />
              
              {/* Arrow for Desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex flex-col items-center justify-center pt-[32px] text-slate-300">
                  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" aria-hidden="true">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;

