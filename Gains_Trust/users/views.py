from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from .serializers import UserSerializer, WeightSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .models import Weight, PasswordResetToken
from django.contrib.auth import get_user_model, authenticate, login
from rest_framework.viewsets import ModelViewSet
from django.utils.timezone import now
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

# Create your views here.

User = get_user_model()


# Username and email availability checker for real-time registration feedbacvk
@api_view(["GET"])
@permission_classes([AllowAny])
def check_availability(request):
    username = request.query_params.get("username")
    email = request.query_params.get("email")

    if username and User.objects.filter(username=username).exists():
        return Response({"username": "taken"}, status=400)

    if email and User.objects.filter(email=email).exists():
        return Response({"email": "taken"}, status=400)

    return Response({"message": "available"}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Send password reset email"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Create password reset token
        reset_token = PasswordResetToken.objects.create(user=user)
        
        # Prepare email
        reset_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/reset-password/{reset_token.token}"
        
        subject = "Password Reset Request"
        message = f"""
        Hi {user.first_name or user.username},
        
        You requested a password reset for your Gains Trust account.
        
        Click the link below to reset your password:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this reset, please ignore this email.
        
        Best regards,
        The Gains Trust Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            logger.info(f"Password reset email sent successfully to {email}")
            return Response({"message": "Password reset email sent successfully"}, status=200)
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            return Response({
                "error": "Failed to send email. Please check your email configuration or try again later."
            }, status=500)
    
    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """Confirm password reset with token"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
            if reset_token.is_expired():
                return Response({"error": "Reset token has expired"}, status=400)
            
            # Reset the password
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.save()
            
            return Response({"message": "Password reset successfully"}, status=200)
            
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Invalid or expired reset token"}, status=400)
    
    return Response(serializer.errors, status=400)


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


    @action(detail=False, methods=["POST"], permission_classes=[AllowAny])
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

    @action(detail=False, methods=["POST"], permission_classes=[AllowAny])
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
