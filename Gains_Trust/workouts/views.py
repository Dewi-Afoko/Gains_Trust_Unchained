from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Workout, SetDict
from .serializers import SetDictSerializer, WorkoutSerializer

# Create your views here.


class WorkoutView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workout_id=None):
        """Return a specific workout if workout_id is provided, otherwise return all workouts for the authenticated user"""
        if workout_id:
            try:
                workout = Workout.objects.get(id=workout_id, user=request.user)
                serializer = WorkoutSerializer(workout)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Workout.DoesNotExist:
                return Response({"error": "Workout not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # If no workout_id is provided, return all workouts for the user
        workouts = Workout.objects.filter(user=request.user).order_by("-date", "-id")
        serializer = WorkoutSerializer(workouts, many=True)
        return Response(
            {
                "message": f"Latest workout: {serializer.data[0]}" if serializer.data else "No workouts found",
                "workouts": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        """Create a new workout for the authenticated user"""
        serializer = WorkoutSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            workout = serializer.save()
            return Response(
                {
                    "message": f"{workout.workout_name} created",
                    "workout": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, workout_id):
        """Update a specific workout"""
        workout = get_object_or_404(Workout, id=workout_id, user=request.user)
        serializer = WorkoutSerializer(
            instance=workout,
            data=request.data,
            context={"request": request},
            partial=True,
        )
        if serializer.is_valid():
            updated_workout = serializer.save()
            return Response(
                {
                    "message": f"{updated_workout.workout_name} updated successfully",
                    "workout": serializer.data,
                },
                status=status.HTTP_200_OK,
            )  # Changed data to workout
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, workout_id):
        """Delete a specific workout"""
        workout = get_object_or_404(Workout, id=workout_id, user=request.user)
        workout.delete()
        return Response(
            {"message": f"Workout {workout.workout_name} deleted"},
            status=status.HTTP_200_OK,
        )


class SetDictView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workout_id, set_dict_id=None):
        """Retrieve all SetDicts for a specific workout or a single SetDict if ID is provided"""
        workout = get_object_or_404(Workout, id=workout_id, user=request.user)

        if set_dict_id:
            set_dict = get_object_or_404(SetDict, id=set_dict_id, workout=workout)
            serializer = SetDictSerializer(set_dict)
            return Response(
                {
                    "message": f"Details for set {set_dict_id}",
                    "set": serializer.data,
                },
                status=status.HTTP_200_OK,
            )  # Returns details of the specific set

        set_dicts = SetDict.objects.filter(workout=workout).order_by("set_order")
        serializer = SetDictSerializer(set_dicts, many=True)
        return Response(
            {
                "message": f"Here are all the sets for {workout.workout_name}",
                "sets": serializer.data,
            },
            status=status.HTTP_200_OK,
        )  # Returns message and list of sets for workout


    def post(self, request, workout_id):
        """Create a SetDict for a specific workout"""
        workout = get_object_or_404(Workout, id=workout_id, user=request.user)
        serializer = SetDictSerializer(
            data=request.data, context={"request": request, "workout": workout}
        )

        if serializer.is_valid():
            set_dict = serializer.save()
            return Response(
                {
                    "message": f"{set_dict.exercise_name} created",
                    "set": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )  # Returns message and set details

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, workout_id, set_dict_id):
        """Update a SetDict"""
        set_dict = get_object_or_404(
            SetDict,
            id=set_dict_id,
            workout__id=workout_id,
            workout__user=request.user,
        )
        serializer = SetDictSerializer(
            instance=set_dict,
            data=request.data,
            context={"request": request},
            partial=True,
        )
        if serializer.is_valid():
            updated_set_dict = serializer.save()
            return Response(
                {
                    "message": f"{updated_set_dict} updated",
                    "set": serializer.data,
                },
                status=status.HTTP_200_OK,
            )  # Returns the set that was updated
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, workout_id, set_dict_id):
        """Delete a SetDict"""
        set_dict = get_object_or_404(
            SetDict,
            id=set_dict_id,
            workout__id=workout_id,
            workout__user=request.user,
        )
        set_dict.delete()
        return Response(
            {"message": f"{set_dict} deleted"},
            status=status.HTTP_200_OK,
        )
