from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Workout, SetDict
from .serializers import SetDictSerializer, WorkoutSerializer
from datetime import timedelta
from django.utils.timezone import now


# 💻 Helper Functions
def update_active_set(workout_id):
    """Ensures only one active set per workout, adjusting start times correctly."""
    workout = get_object_or_404(Workout, id=workout_id)

    if not workout.start_time:
        return  

    # ✅ Find the next incomplete set
    next_set = SetDict.objects.filter(
        workout_id=workout_id, complete=False
    ).order_by("set_order").first()

    # ✅ Reset all sets to inactive
    SetDict.objects.filter(workout_id=workout_id).update(is_active_set=False)

    if next_set:
        # ✅ Get the last completed set, if available
        last_completed_set = SetDict.objects.filter(
            workout_id=workout_id, complete=True
        ).order_by("-set_order").first()

        # ✅ Apply rest time only if the last completed set was immediately before this one
        if last_completed_set and last_completed_set.set_order == (next_set.set_order - 1):
            next_set.set_start_time = now() + timedelta(seconds=last_completed_set.rest) if last_completed_set.rest else now()
        else:
            next_set.set_start_time = now()

        next_set.is_active_set = True
        next_set.save()


def skip_active_set(workout_id, skipped_set):
    """Handles skipping a set and ensures the correct next set is activated."""
    
    # ✅ Find the next available set to activate
    next_set = SetDict.objects.filter(
        workout_id=workout_id, complete=False
    ).exclude(id=skipped_set.id).order_by("set_order").first()

    # ✅ Reset all sets to inactive
    SetDict.objects.filter(workout_id=workout_id).update(is_active_set=False)

    if next_set:
        # ❌ Since a set was skipped, start immediately (no rest delay)
        next_set.set_start_time = now()
        next_set.is_active_set = True
        next_set.save()



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

    og_workout_sets = SetDict.objects.filter(workout=original_workout).order_by("set_order")

    for set_dict in og_workout_sets:
        new_dict = SetDict.objects.create(
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
        new_dict.save()


    return Response({"message": "Workout duplicated", "workout": WorkoutSerializer(new_workout).data}, status=201)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def start_timer(request, workout_id):

    workout = get_object_or_404(Workout, id=workout_id, user=request.user)
    if workout.start_time == None:
        workout.start_time = now()
        workout.save()

        update_active_set(workout_id)

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
    """Mark a SetDict as Complete or Undo Completion"""
    set_dict = get_object_or_404(
        SetDict, id=set_dict_id, workout_id=workout_id, workout__user=request.user
    )

    if set_dict.complete:  # ✅ Undo completion
        set_dict.complete = False
        set_dict.set_duration = None  # 🔥 No need to reset start_time (it gets overwritten when reactivated)
    else:  # ✅ Marking set as complete
        set_dict.complete = True
        if set_dict.set_start_time and set_dict.set_start_time <= now():
            set_dict.set_duration = int((now() - set_dict.set_start_time).total_seconds())

    set_dict.save()

    # 🔥 Update which set is now active
    update_active_set(workout_id)

    return Response(
        {
            "message": f"Set {set_dict.id} completion status changed",
            "set": SetDictSerializer(set_dict).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def skip_set(request, workout_id, set_dict_id):
    """Moves a set to the last position in `set_order`."""
    set_dict = get_object_or_404(
        SetDict, id=set_dict_id, workout__id=workout_id, workout__user=request.user
    )
    max_set_order = SetDict.objects.filter(workout_id=workout_id).count()
    set_dict.set_order = max_set_order + 1  # Moves set to last position
    set_dict.is_active_set = False  # 🔥 Ensure skipped sets aren’t active
    set_dict.set_start_time = None
    set_dict.save()

    # 🔥 Update which set is now active
    skip_active_set(workout_id, set_dict)

    return Response(
        {
            "message": f"Set {set_dict.id} skipped",
            "set": SetDictSerializer(set_dict).data,  # ✅ Return updated set order
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

    # 🔥 Ensure the correct set is active
    update_active_set(workout_id)

    return Response(
        {
            "message": f"Set {set_dict.id} moved to position {new_position}",
            "set": SetDictSerializer(set_dict).data,
        },
        status=status.HTTP_200_OK,
    )
