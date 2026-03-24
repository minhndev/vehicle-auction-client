import React from 'react';
import { ShieldCheck, Award, Headset } from 'lucide-react';

interface ReasonItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const MOCK_REASONS: ReasonItem[] = [
  {
    id: 1,
    title: "Tuyệt Đối An Toàn",
    description: "Nhận các ưu đãi tốt nhất về xe đã được kiểm định với báo cáo lịch sử minh bạch và đội ngũ hỗ trợ chuyên gia.",
    icon: ShieldCheck
  },
  {
    id: 2,
    title: "Chất Lượng Cao Mất",
    description: "Những siêu xe cao cấp vượt qua hàng trăm tiêu chuẩn đánh giá nghiêm ngặt trước khi được đưa lên sàn đấu giá.",
    icon: Award
  },
  {
    id: 3,
    title: "Hỗ Trợ 24/7",
    description: "Đội ngũ chuyên nghiệp luôn túc trực để hỗ trợ các phiên đấu giá và thủ tục mua bán bất cứ lúc nào.",
    icon: Headset
  }
];

const ReasonCard: React.FC<{ data: ReasonItem }> = ({ data }) => {
  const Icon = data.icon;
  return (
    <div className="flex flex-col flex-1 p-8 sm:p-10 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-[#2e3d83]/5 group hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl hover:border-[#2e3d83]/10">
      <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-[#2e3d83] group-hover:rotate-6 transition-all duration-500">
        <Icon size={40} strokeWidth={1.5} className="text-[#2e3d83] group-hover:text-white transition-colors duration-500" />
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-[#2e3d83] transition-colors">
        {data.title}
      </h3>
      <p className="text-slate-500 text-lg leading-relaxed font-medium">
        {data.description}
      </p>
    </div>
  );
};

const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="w-full bg-slate-50 py-24 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2e3d83] mb-6 tracking-tight">
            Tại Sao <span className="text-[#f4c23d]">Chọn Chúng Tôi?</span>
          </h2>
          <div className="flex items-center justify-center relative w-64 h-8 mb-4">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200"></div>
            <div className="w-8 h-8 rounded-full bg-[#f4c23d] relative z-10 shadow-md"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {MOCK_REASONS.map((item) => (
            <ReasonCard key={item.id} data={item} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUsSection;

