import axios from 'axios';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const rootFolder = import.meta.env.VITE_CLOUDINARY_FOLDER || 'car-rental';

export const uploadImageToCloudinary = async (file, folderPath = '') => {
  if (!cloudName || !uploadPreset) {
    throw new Error('Thiếu cấu hình Cloudinary. Vui lòng kiểm tra biến môi trường.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folderPath ? `${rootFolder}/${folderPath}` : rootFolder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await axios.post(endpoint, formData);

  return response.data?.secure_url;
};
