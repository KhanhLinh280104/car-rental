import { Star } from 'lucide-react';
const cars = [
  { name: 'Toyota Fortuner 2023', price: '850.000đ', location: 'Hà Nội', rating: 4.9, trips: 120, image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Honda CR-V 2023', price: '750.000đ', location: 'Hà Nội', rating: 4.8, trips: 95, image: 'https://images.pexels.com/photos/248747/pexels-photo-248747.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Mazda CX-5 2023', price: '700.000đ', location: 'Hà Nội', rating: 4.9, trips: 150, image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Ford Ranger 2023', price: '900.000đ', location: 'Hà Nội', rating: 4.7, trips: 80, image: 'https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Hyundai Tucson 2023', price: '650.000đ', location: 'Hà Nội', rating: 4.8, trips: 110, image: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Kia Seltos 2023', price: '600.000đ', location: 'Hà Nội', rating: 4.9, trips: 140, image: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Mitsubishi Xpander 2023', price: '550.000đ', location: 'Hà Nội', rating: 4.7, trips: 160, image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'VinFast VF8 2023', price: '1.200.000đ', location: 'Hà Nội', rating: 5.0, trips: 50, image: 'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const CarBrand = () =>{
    return(
 <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">HỆ THỐNG CÁC HÃNG</h2>
        <p className="text-gray-600 text-center mb-12">Đa dạng dòng xe, đáp ứng mọi nhu cầu</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group">
              <div className="relative overflow-hidden">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {car.price}/ngày
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{car.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{car.location}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{car.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">{car.trips} chuyến</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
            Xem thêm xe
          </button>
        </div>
      </div>
    </section>
    );
};
export default CarBrand;