from django.contrib import admin
from .models import Order

# Register your models here.
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Custom admin class to show non editable fields in admin panel.
    """
    list_display = ('id', 'user', 'product_name', 'status', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')