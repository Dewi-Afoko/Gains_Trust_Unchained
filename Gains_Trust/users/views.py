from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, WeightSerializer
from .models import Weight

# Create your views here.


@api_view(["POST"])
def register(request):

    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                "message": f"{user.username} successfully registered!",
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )  # Added user object to return

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"message": "Successfully logged out."},
            status=status.HTTP_205_RESET_CONTENT,
        )
    except KeyError:
        return Response(
            {"error": "Refresh token missing."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception:
        return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    serializer = UserSerializer(
        instance=user,
        data=request.data,
        context={"request": request},
        partial=True,
    )

    if serializer.is_valid():
        updated_user = serializer.save()
        return Response(
            {
                "message": f"User details updated successfully for {updated_user.username}.",
                "user": serializer.data,
            },
            status=status.HTTP_200_OK,
        )  # Changed data to user, for consistency and clarity

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WeightView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        weights = Weight.objects.filter(user=user).order_by("-date_recorded")
        serializer = WeightSerializer(weights, many=True)
        serialized_data = serializer.data

        return Response(
            {
                "message": f"Latest weight object: {serialized_data[0]}",
                "weights": serialized_data,
            },
            status=status.HTTP_200_OK,
        )  # Return latest object in message and list of all objects in weights

    def post(self, request):
        user = request.user
        serializer = WeightSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            weight = serializer.save()
            return Response(
                {
                    "message": f"{weight.weight} logged on {weight.date_recorded} by {user.username}",
                    "weight": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )  # Added weight to return created object

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, weight_id):
        """Delete a specific weight record"""
        weight = get_object_or_404(Weight, id=weight_id, user=request.user)
        weight.delete()

        return Response(
            {
                "message": f"Weight record with ID {weight_id} has been deleted for {request.user.username}"
            },
            status=status.HTTP_200_OK,
        )
