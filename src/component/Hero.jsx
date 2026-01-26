import { useEffect, useState } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";

const images = [
  "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-gradient-to-r from-green-50 to-blue-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* TEXT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Car Rental - Cho thuê xe
              <span className="block text-green-600">Giá tốt nhất</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Đặt xe nhanh chóng, tiện lợi và an toàn cùng Car Rental
            </p>
          </div>

          {/* SLIDER */}
          <div className="hidden md:block">
            <div className="relative overflow-hidden rounded-2xl shadow-xl h-[350px]">
              <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {images.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt="Car rental"
                    className="w-full h-full object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
