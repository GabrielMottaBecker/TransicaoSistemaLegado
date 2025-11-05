from django.urls import path
from .views import sales_today, active_clients, products_total, sales_total

urlpatterns = [
    path("sales-today/", sales_today, name="sales_today"),
    path("active-clients/", active_clients, name="active_clients"),
    path("products-total/", products_total, name="products_total"),
    path("sales-total/", sales_total, name="sales_total"),
]
