import React from 'react';
import UserSidebar from "../component/user/UserSidebar";
import DeleteAccountContent from "../component/DeleteAccountContent";

const DeleteAccountPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4"> 
        <div className="flex flex-col lg:flex-row">
          <UserSidebar active="delete" /> 
          <DeleteAccountContent />
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;