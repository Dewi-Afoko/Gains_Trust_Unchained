from django.urls import path
from .views import register, logout, update_user, WeightView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('register/', register, name="register"),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout, name='logout'),
    path('update_user/', update_user, name='update'),
    path('weights/', WeightView.as_view(), name='weights'),
    path('weights/delete/', WeightView.as_view(), name='delete-weight'),
]