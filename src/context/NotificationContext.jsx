import React, { createContext, useContext } from 'react';
import Swal from 'sweetalert2';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  // Hàm thông báo Thành công (Màu xanh)
  const notifySuccess = (msg, callback = null) => {
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: msg,
      confirmButtonColor: '#10B981', // Màu xanh lá (giống trang Admin)
      confirmButtonText: 'Tuyệt vời',
      timer: 3000, // Tự tắt sau 3 giây (nếu không bấm)
      timerProgressBar: true,
    }).then(() => {
      // Chạy callback sau khi đóng thông báo (ví dụ: chuyển trang)
      if (callback) callback();
    });
  };

  // Hàm thông báo Thất bại (Màu đỏ)
  const notifyError = (msg, callback = null) => {
    Swal.fire({
      icon: 'error',
      title: 'Rất tiếc!',
      text: msg,
      confirmButtonColor: '#EF4444', // Màu đỏ (giống trang Admin)
      confirmButtonText: 'Thử lại ngay',
    }).then(() => {
      if (callback) callback();
    });
  };

  // Hàm xác nhận (Ví dụ: Bạn có chắc muốn xóa?) - Tặng thêm để sau này dùng
  const notifyConfirm = (title, text, onConfirm) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
    });
  };

  return (
    <NotificationContext.Provider value={{ notifySuccess, notifyError, notifyConfirm }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);