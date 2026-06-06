import api from './client'

export const ordersApi = {
  list: ()              => api.get('/orders/list/all/'),
  retrieve: (id)        => api.get(`/orders/retrieve/${id}/`),
  create: (productName) => api.post('/orders/create/', { product_name: productName }),
  delete: (id)          => api.delete(`/orders/delete/${id}/`),
  updateStatus: (id, status) => api.patch(`/orders/update/${id}/`, { status }),
}
