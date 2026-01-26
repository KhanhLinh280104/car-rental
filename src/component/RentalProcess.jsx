import { Search, FileCheck, Car, ThumbsUp } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Chọn xe',
    description: 'Tìm kiếm và chọn xe phù hợp với nhu cầu của bạn'
  },
  {
    icon: FileCheck,
    number: '02',
    title: 'Đặt xe',
    description: 'Điền thông tin và xác nhận đặt xe'
  },
  {
    icon: Car,
    number: '03',
    title: 'Nhận xe',
    description: 'Nhận xe tại địa điểm hoặc giao xe tận nơi'
  },
  {
    icon: ThumbsUp,
    number: '04',
    title: 'Trải nghiệm',
    description: 'Tận hưởng chuyến đi của bạn'
  }
];
 const RentalProcess = () =>{
    return(
<section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">QUY TRÌNH THUÊ XE</h2>
        <p className="text-gray-600 text-center mb-12">Chỉ với 4 bước đơn giản</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                      {step.number}
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-center mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm text-center">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/3 -right-4 w-8 h-0.5 bg-green-600 opacity-30"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
    );
 };
 export default RentalProcess;