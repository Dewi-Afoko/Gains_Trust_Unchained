from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, WeightSerializer
from .models import Weight

# Create your views here.

@api_view(['POST'])
def register(request):

    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {"message": f'{user.username} successfully registered!'},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        
class WeightView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        weights = Weight.objects.filter(user=user).order_by("-date_recorded")
        serializer = WeightSerializer(weights, many=True)
        serialized_data = serializer.data

        return Response(serialized_data, status=status.HTTP_200_OK)
    
    def post(self, request):
        user = request.user
        serializer = WeightSerializer(data=request.data, context={'request' : request})

        if serializer.is_valid():
            weight = serializer.save()
            return Response({'message' : f'{weight.weight} logged on {weight.date_recorded} by {user.username}'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



