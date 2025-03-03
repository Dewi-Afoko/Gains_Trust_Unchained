from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Workout, SetDict
from .serializers import SetDictSerializer, WorkoutSerializer
from datetime import datetime
from django.utils.timezone import now


# ✅ Workout Views
class WorkoutView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workout_id=None):
        """Return a specific workout by ID or all user's workouts"""
        if workout_id:
            workout = get_object_or_404(Workout, id=workout_id, user=request.user)
            serializer = WorkoutSerializer(workout)
            return Response(serializer.data, status=status.HTTP_200_OK)

        workouts = Workout.objects.filter(user=request.user).order_by("-date", "-id")
        serializer = WorkoutSerializer(workouts, many=True)
        return Response(
            {"message": "All workouts retrieved", "workouts": serializer.data},
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        """Create a new workout"""
        serializer = WorkoutSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            workout = serializer.save()
            return Response(
                {
                    "message": f"Workout '{workout.workout_name}' created",
                    "workout": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, workout_id):
        """Update a specific workout"""
        workout = get_object_or_404(Workout, id=workout_id, user=request.user)
        serializer = WorkoutSerializer(
            workout, data=request.data, context={"request": request}, partial=True
        )
        if serializer.is_valid():
            updated_workout = serializer.save()
            return Response(
                {
                    "message": f"Workout '{updated_workout.workout_name}' updated",
                    "workout": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, workout_id):
        """Delete a specific workout"""
        workout = get_object_or_404(Workout, id=workout_id, user=request.user)
        workout.delete()
        return Response(
            {"message": f"Workout '{workout.workout_name}' deleted"},
            status=status.HTTP_200_OK,
        )
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def duplicate_workout(request, workout_id):

    original_workout = get_object_or_404(Workout, id=workout_id, user=request.user)

    new_workout = Workout.objects.create(
        user=original_workout.user,
        workout_name=f"{original_workout.workout_name} (Copy)",
        date=now().date(),
        notes=original_workout.notes,
    )

    og_workout_sets = SetDict.objects.filter(workout=original_workout)

    for set_dict in og_workout_sets:
        SetDict.objects.create(
            workout=new_workout,  # ✅ Assign to the new workout
            exercise_name=set_dict.exercise_name,
            set_number=set_dict.set_number,
            set_order=set_dict.set_order,
            set_type=set_dict.set_type,
            reps=set_dict.reps,
            loading=set_dict.loading,
            rest=set_dict.rest,
            focus=set_dict.focus,
            notes=set_dict.notes,
        )


    return Response({"message": "Workout duplicated", "workout": WorkoutSerializer(new_workout).data}, status=201)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def start_timer(request, workout_id):

    workout = get_object_or_404(Workout, id=workout_id, user=request.user)
    if workout.start_time == None:
        workout.start_time = now()
        workout.save()
        return Response({"message" : "Workout timer started", "start_time" : workout.start_time, "workout" : WorkoutSerializer(workout).data}, status=status.HTTP_200_OK)
    return Response({"message" : "Workout timer restarted", "start_time" : workout.start_time, "workout" : WorkoutSerializer(workout).data}, status=status.HTTP_200_OK)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def complete_workout(request, workout_id):
    workout = get_object_or_404(Workout, id=workout_id, user=request.user)

    if not workout.start_time:
        return Response({'message' : 'Workout cannot be marked complete before it has been started!'}, status=status.HTTP_400_BAD_REQUEST)
    if not workout.complete:
        workout.duration = int((now() - workout.start_time).total_seconds())
        workout.complete = True
        workout.save()
        return Response({'message' : 'Workout marked complete!', "workout_duration" : workout.duration, "workout": WorkoutSerializer(workout).data }, status=status.HTTP_200_OK)
    return Response({'error': 'Workout already marked as complete!'}, status=status.HTTP_400_BAD_REQUEST)

# ✅ SetDict Views
class SetDictView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workout_id, set_dict_id=None):
        """Return all SetDicts for a Workout or a single SetDict by ID"""
        workout = get_object_or_404(Workout, id=workout_id, user=request.user)

        if set_dict_id:
            set_dict = get_object_or_404(SetDict, id=set_dict_id, workout=workout)
            serializer = SetDictSerializer(set_dict)
            return Response(
                {"message": f"Details for set {set_dict_id}", "set": serializer.data},
                status=status.HTTP_200_OK,
            )

        # Filtering with query_params for complete status
        completed_param = request.query_params.get("completed")
        if completed_param is not None:
            try:
                completed = completed_param.lower() == "true"
                set_dicts = SetDict.objects.filter(
                    workout=workout, complete=completed
                ).order_by("set_order")
                serializer = SetDictSerializer(set_dicts, many=True)
                return Response(
                    {
                        "message":
                        f"Filtered sets ({'Completed' if completed else 'Incomplete'})",
                        "sets": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )
            except ValueError:
                return Response(
                    {"error": "Invalid value for 'completed' parameter"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Default: Return workout, all sets for workout and complete/incomplete list
        set_dicts = SetDict.objects.filter(workout=workout).order_by("set_order")
        completed_sets = SetDict.objects.filter(
            workout=workout, complete=True
        ).order_by("set_order")
        incomplete_sets = SetDict.objects.filter(
            workout=workout, complete=False
        ).order_by("set_order")
        workout_serialized = WorkoutSerializer(workout)
        sets_serialized = SetDictSerializer(set_dicts, many=True)
        complete_sets_serialized = SetDictSerializer(completed_sets, many=True)
        incomplete_sets_serialized = SetDictSerializer(incomplete_sets, many=True)
        return Response(
            {
                "message": f"All data for '{workout.workout_name}'",
                "workout": workout_serialized.data,
                "sets": sets_serialized.data,
                "incomplete_sets": incomplete_sets_serialized.data,
                "complete_sets": complete_sets_serialized.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, workout_id):
        """Create a new SetDict for a workout"""
        workout = get_object_or_404(Workout, id=workout_id, user=request.user)
        serializer = SetDictSerializer(
            data=request.data, context={"request": request, "workout": workout}
        )

        if serializer.is_valid():
            set_dict = serializer.save()
            return Response(
                {
                    "message": f"Set '{set_dict.exercise_name}' created",
                    "set": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, workout_id, set_dict_id):
        """Update a SetDict"""
        set_dict = get_object_or_404(
            SetDict, id=set_dict_id, workout__id=workout_id, workout__user=request.user
        )

        # ✅ Standard Update Logic (Skip logic removed)
        serializer = SetDictSerializer(
            set_dict, data=request.data, context={"request": request}, partial=True
        )
        if serializer.is_valid():
            updated_set_dict = serializer.save()
            return Response(
                {
                    "message": f"Set {updated_set_dict.id} updated",
                    "set": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, workout_id, set_dict_id):
        """Delete a SetDict"""
        set_dict = get_object_or_404(
            SetDict, id=set_dict_id, workout__id=workout_id, workout__user=request.user
        )
        set_dict.delete()
        return Response(
            {"message": f"Set {set_dict_id} deleted"}, status=status.HTTP_200_OK
        )


# ✅ New Action-Based Views
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_set(request, workout_id, set_dict_id):
    """Mark a SetDict as Complete"""
    set_dict = get_object_or_404(
        SetDict, id=set_dict_id, workout_id=workout_id, workout__user=request.user
    )
    if set_dict.complete is True:
        set_dict.complete = False
    elif set_dict.complete is False:
        set_dict.complete = True
    set_dict.save()
    return Response(
        {
            "message": f"Set {set_dict.id} completion status changed",
            "set": SetDictSerializer(set_dict).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])  # ✅ Changed from PATCH to POST
@permission_classes([IsAuthenticated])
def skip_set(request, workout_id, set_dict_id):
    """Moves a set to the last position in `set_order`."""
    set_dict = get_object_or_404(
        SetDict, id=set_dict_id, workout__id=workout_id, workout__user=request.user
    )

    max_set_order = SetDict.objects.filter(workout_id=workout_id).count()
    set_dict.set_order = max_set_order + 1  # Moves set to last position
    set_dict.save()  # Triggers signal to reorder all sets

    # ✅ Fetch the correctly reordered set
    updated_set = SetDict.objects.get(id=set_dict.id)

    return Response(
        {
            "message": f"Set {updated_set.id} skipped",
            "set": SetDictSerializer(updated_set).data,  # ✅ Return updated set order
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def move_set(request, workout_id, set_dict_id):
    """Move a SetDict to a new position"""
    set_dict = get_object_or_404(
        SetDict, id=set_dict_id, workout_id=workout_id, workout__user=request.user
    )
    new_position = request.data.get("new_position")

    if not isinstance(new_position, int) or new_position < 1:
        return Response(
            {"error": "Invalid position"}, status=status.HTTP_400_BAD_REQUEST
        )

    set_dict.set_order = new_position
    set_dict.save()
    return Response(
        {
            "message": f"Set {set_dict.id} moved to position {new_position}",
            "set": SetDictSerializer(set_dict).data,
        },
        status=status.HTTP_200_OK,
    )
