import { Shield, Wallet, Clock, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'An toàn & Bảo hiểm',
    description: 'Xe được bảo dưỡng định kỳ, bảo hiểm toàn diện',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Wallet,
    title: 'Giá cả hợp lý',
    description: 'Đa dạng dòng xe, mức giá phù hợp mọi túi tiền',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Clock,
    title: 'Giao xe nhanh chóng',
    description: 'Giao xe tận nơi trong vòng 30 phút',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ',
    color: 'bg-orange-100 text-orange-600'
  }
];

const WhyChooseUs = () =>{
    return(
<section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">TẠI SAO CHỌN CHÚNG TÔI</h2>
        <p className="text-gray-600 text-center mb-12">Dịch vụ cho thuê xe tự lái hàng đầu Việt Nam</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group hover:transform hover:scale-105 transition">
              <div className={`${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition`}>
                <feature.icon className="w-10 h-10" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    );
};
export default WhyChooseUs;