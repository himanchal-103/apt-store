from rest_framework import status, viewsets
from rest_framework.response import Response

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Order
from .serializers import OrderSerializer, OrderUpdateSerializer

from accounts.permissions import IsReviewer, IsUserOrReviewer

from django.contrib.auth import get_user_model



channel_layer = get_channel_layer()
User = get_user_model()



class OrderViewset(viewsets.ViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    serializer_update_class = OrderUpdateSerializer
    permission_classes = [IsUserOrReviewer]

    def list(self,request):
        """
        list all orders

        method: get
        url: orders/list/all/
        """
        if request.user.is_reviewer() or request.user.is_admin():
            orders = self.queryset
        else:
            orders = self.queryset.filter(user=request.user)
        serializer = self.serializer_class(orders, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """
        retrieve order
        
        method: get
        url: orders/retrieve/<int:pk>/
        """
        try:
            order = self.queryset.get(pk=pk)
            serializer = self.serializer_class(order)
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request):
        """
        method: post
        url: orders/create/
        body: 
        {
            "product_name": ""
        }
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {
                    "message": "Order created succesfully",
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )    

    def destroy(self, request, pk=None):
        """
        method: delete
        url: orders/delete/<int:pk>/
        """
        try:
            order = self.queryset.get(pk=pk)
            order.delete()
            return Response(
                {"message": "Order deleted succesfully."},
                status=status.HTTP_200_OK
            )
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        


class OrderUpdateViewset(viewsets.ViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderUpdateSerializer
    permission_classes = [IsReviewer]

    def partial_update(self, request, pk=None):
        """
        method: patch
        url: orders/update/<int:pk>/
        body: 
        {
            "status": "<choices>"
        }

        choices = ['pending', 'shipped', 'delivered', 'cancelled']
        """
        try:
            order = self.queryset.get(pk=pk)
            serializer = self.serializer_class(order, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                # Broadcast to the order owner's group
                async_to_sync(channel_layer.group_send)(
                    f"user_{order.user.id}_orders",
                    {
                        "type": "order.status_update", # invoke consumer's order_status_update
                        "order_id": pk,
                        "status": serializer.data["status"],
                        "product_name": order.product_name,
                    }
                )

                return Response(
                    {
                        "message": "Order status updated successfully.",
                    },
                    status=status.HTTP_200_OK
                )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        except Order.DoesNotExist:
            return Response(
                {"error": "Order does not found."},
                status=status.HTTP_404_NOT_FOUND
            )