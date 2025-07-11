"""
URL configuration for Gains_Trust project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
import os
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .views import ReactAppView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    path("api/", include("users.urls")),
    path("api/", include("workouts.urls")),
    # DRF JWTs
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # DRF Spectacular doc generation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    
    # Favicon and icon files - MUST come before catch-all
    path("favicon.ico", serve, {"document_root": settings.REACT_APP_DIR, "path": "favicon.ico"}),
    path("favicon-16.png", serve, {"document_root": settings.REACT_APP_DIR, "path": "favicon-16.png"}),
    path("favicon-32.png", serve, {"document_root": settings.REACT_APP_DIR, "path": "favicon-32.png"}),
    path("logo192.png", serve, {"document_root": settings.REACT_APP_DIR, "path": "logo192.png"}),
    path("logo512.png", serve, {"document_root": settings.REACT_APP_DIR, "path": "logo512.png"}),
    path("manifest.json", serve, {"document_root": settings.REACT_APP_DIR, "path": "manifest.json"}),
    
    # React Frontend - Catch all other routes
    re_path(r'^.*$', ReactAppView.as_view(), name='react_app'),
]
