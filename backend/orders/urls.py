from django.urls import path
from .views import OrderViewset, OrderUpdateViewset



order_list = OrderViewset.as_view({
    'get': 'list'
})

order_create = OrderViewset.as_view({
    'post': 'create'
})

order_detail = OrderViewset.as_view({
    'get': 'retrieve',
    'delete': 'destroy'
})

order_update = OrderUpdateViewset.as_view({
    'patch': 'partial_update',
})


urlpatterns = [
    # Orders
    path('list/all/', order_list, name="list-order"),
    path('retrieve/<int:pk>/', order_detail, name="retrieve-order"),
    path('create/', order_create, name="create-order"),
    path('delete/<int:pk>/', order_detail, name="delete-order"),

    path('update/<int:pk>/', order_update, name="update-status-order"),
]