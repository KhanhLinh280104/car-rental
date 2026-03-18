import axiosClient from './axiosClient';

const paymentApi = {
  processPayment: (paymentData) => {
    return axiosClient.post('/payments/process', paymentData);
  },
};

export default paymentApi;