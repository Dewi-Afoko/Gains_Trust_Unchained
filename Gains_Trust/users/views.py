from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .serializers import UserSerializer, WeightSerializer
from .models import Weight
from django.contrib.auth import get_user_model, authenticate, login
from rest_framework.viewsets import ModelViewSet
from django.utils.timezone import now


# Create your views here.

User = get_user_model()


# Username and email availability checker for real-time registration feedbacvk
@api_view(["GET"])
def check_availability(request):
    username = request.query_params.get("username")
    email = request.query_params.get("email")

    if username and User.objects.filter(username=username).exists():
        return Response({"username": "taken"}, status=400)

    if email and User.objects.filter(email=email).exists():
        return Response({"email": "taken"}, status=400)

    return Response({"message": "available"}, status=200)


# User ViewSet
class UserViewSet(ModelViewSet):
    """ViewSet for managing users"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Ensure users can only see their own details. Unauthenticated users get a 403."""
        if not self.request.user.is_authenticated:
            return User.objects.none()  # ✅ Ensures unauthenticated users get a 403 instead of 404
        return User.objects.all()  # ✅ This allows the viewset to explicitly block unauthorized access


    @action(detail=False, methods=["POST"], permission_classes=[])
    def register(self, request):
        """User registration"""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User registered successfully!",
                    "user": UserSerializer(user).data,
                },
                status=201,
            )
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["POST"], permission_classes=[])
    def login(self, request):
        """User login with JWT token response"""
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            user.login_history.append(str(now()))
            user.login_history = user.login_history[-2:]  # Keep last 2 logins
            user.save()

            # ✅ Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            return Response(
                {
                    "message": "Login successful!",
                    "access_token": str(access),
                    "refresh_token": str(refresh),  # ✅ Now returning refresh token
                    "user": UserSerializer(user).data,
                }
            )
        return Response({"error": "Invalid credentials"}, status=401)

    @action(detail=False, methods=["GET", "PATCH"])
    def me(self, request):
        """Retrieve or update the logged-in user's details"""
        if request.method == "PATCH":
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)
        return Response(UserSerializer(request.user).data)

    def update(self, request, *args, **kwargs):
        """Override update to prevent users from modifying other accounts"""
        user = self.get_object()
        if user != request.user:
            return Response(
                {"error": "You can only update your own profile."}, status=403
            )
        return super().update(request, *args, **kwargs)


# Weight ViewSet


class WeightViewSet(ModelViewSet):
    """ViewSet for managing user weight entries."""

    queryset = Weight.objects.all().order_by("-date_recorded")
    serializer_class = WeightSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Ensure users only see their own weight entries."""
        return Weight.objects.filter(user=self.request.user).order_by("-date_recorded")

    def perform_create(self, serializer):
        """Assigns the logged-in user when creating a weight entry."""
        serializer.save(user=self.request.user)
