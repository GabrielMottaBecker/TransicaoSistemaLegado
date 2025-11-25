# funcionarios/login_urls.py

from django.urls import path
from .views import login_usuario

urlpatterns = [
    # Mapeia apenas a função de login
    path('login/', login_usuario, name='login-api'), 
]