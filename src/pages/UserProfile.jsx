import React from 'react';
import UserSidebar from "../component/user/UserSidebar";
import UserContent from "../component/user/UserContent";
import Footer from "../component/Footer";

const UserProfile = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24"> 
        <div className="flex flex-col lg:flex-row">
          <UserSidebar />
          <UserContent />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;