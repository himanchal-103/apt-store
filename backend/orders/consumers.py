import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Order


class OrderStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        # Reject unauthenticated connections
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return
        
        # Reject if user has no active orders
        has_active = await self.has_active_orders(self.user)
        if not has_active:
            await self.accept()
            await self.send(json.dumps({
                "type": "connection.closing", 
                "reason": "No active orders"
            }))
            await self.close(code=1000)
            return
        
        self.group_name = f"user_{self.user.id}_orders"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send all current active order on connect
        orders = await self.get_active_orders(self.user)
        await self.send(json.dumps({
            "type": "active_orders",
            "orders": orders
        }))


    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)


    async def order_status_update(self, event):
        await self.send(json.dumps({
            "type": "order.status",
            "order_id": event["order_id"],
            "status": event["status"],
            "product_name": event["product_name"],
        }))

        # Close connection if user has no more active orders
        has_active = await self.has_active_orders(self.user)
        if not has_active:
            await self.send(json.dumps({
                "type": "connection.closing",
                "reason": "No active orders remaining.",
            }))
            await self.close(code=1000)

    @database_sync_to_async
    def has_active_orders(self, user):
        return Order.objects.filter(
            user=user
        ).exclude(
            status__in=("delivered", "cancelled")
        ).exists()

    @database_sync_to_async
    def get_active_orders(self, user):
        orders = Order.objects.filter(
            user=user
        ).exclude(
            status__in=("delivered", "cancelled")
        ).values("id", "product_name", "status")
        return list(orders)

