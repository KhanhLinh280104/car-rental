import React from 'react';
import UserSidebar from "../component/user/UserSidebar"; 
import ChangePasswordContent from "../component/ChangePasswordContent";

const ChangePasswordPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4"> 
        <div className="flex flex-col lg:flex-row">
          {/* Active="password" để menu đổi mật khẩu sáng lên */}
          <UserSidebar active="password" /> 
          <ChangePasswordContent />
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;