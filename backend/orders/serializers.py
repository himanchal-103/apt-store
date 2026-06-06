from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    # user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = ["id", "user", "product_name", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "status", "created_at", "updated_at"]


class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]
        read_only_fields = ["id", "product_name", "created_at", "updated_at"]