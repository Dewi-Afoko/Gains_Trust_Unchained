from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, serializers
from .models import Workout, SetDict
from .serializers import SetDictSerializer, WorkoutSerializer
from datetime import timedelta
from django.utils.timezone import now
import threading
from django.db import transaction
from rest_framework.viewsets import ModelViewSet

local_storage = threading.local()


# 💻 Helper Functions
def update_active_set(workout_id):
    """Ensures only one active set per workout, adjusting start times correctly."""
    workout = get_object_or_404(Workout, id=workout_id)

    if not workout.start_time:
        return

    # ✅ Find the next incomplete set
    next_set = (
        SetDict.objects.filter(workout_id=workout_id, complete=False)
        .order_by("set_order")
        .first()
    )

    # ✅ Ensure all set dicts are inactive
    SetDict.objects.filter(workout_id=workout_id, is_active_set=True).update(
        is_active_set=False
    )

    if next_set:
        # ✅ Get the last completed set, if available
        last_completed_set = (
            SetDict.objects.filter(workout_id=workout_id, complete=True)
            .order_by("-set_order")
            .first()
        )

        # ✅ Apply rest time if the last completed set was previous set
        if last_completed_set and last_completed_set.set_order == (
            next_set.set_order - 1
        ):
            next_set.set_start_time = (
                now() + timedelta(seconds=last_completed_set.rest)
                if last_completed_set.rest
                else now()
            )
        else:
            next_set.set_start_time = now()

        next_set.is_active_set = True
        next_set.save()


def skip_active_set(workout_id, skipped_set):
    """Handles skipping a set and ensures the correct next set is activated."""

    # ✅ Find the next available set to activate
    next_set = (
        SetDict.objects.filter(workout_id=workout_id, complete=False)
        .exclude(id=skipped_set.id)
        .order_by("set_order")
        .first()
    )

    # ✅ Reset all sets to inactive
    SetDict.objects.filter(workout_id=workout_id).update(is_active_set=False)

    if next_set:
        # ❌ Since a set was skipped, start immediately (no rest delay)
        next_set.set_start_time = now()
        next_set.is_active_set = True
        next_set.save()


# ✅ Workout ViewSet
class WorkoutViewSet(ModelViewSet):
    """
    ViewSet for managing Workouts.
    - `list`: Retrieves all workouts (paginated).
    - `retrieve`: Retrieves a single workout by ID.
    - `create`: Creates a new workout.
    - `update`: Updates a workout.
    - `destroy`: Deletes a workout.
    """

    queryset = Workout.objects.all().order_by("-date")  # Default ordering
    serializer_class = WorkoutSerializer
    permission_classes = [
        IsAuthenticated
    ]  # Ensures only authenticated users can access

    def get_queryset(self):
        """Ensure users only see their own workouts."""
        return Workout.objects.filter(user=self.request.user).order_by("-date")

    def perform_create(self, serializer):
        """Ensures the logged-in user is assigned to the created workout,
        logic moved from serializer."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["POST"])
    def duplicate(self, request, pk=None):
        """Duplicates a workout and its sets."""
        original_workout = self.get_object()
        new_workout = Workout.objects.create(
            user=original_workout.user,
            workout_name=f"{original_workout.workout_name} (Copy)",
            date=now().date(),
            notes=original_workout.notes,
        )

        og_workout_sets = original_workout.set_dicts.all().order_by("set_order")

        SetDict.objects.bulk_create(
            [
                SetDict(
                    workout=new_workout,
                    exercise_name=s.exercise_name,
                    set_number=s.set_number,
                    set_order=s.set_order,
                    set_type=s.set_type,
                    reps=s.reps,
                    loading=s.loading,
                    rest=s.rest,
                    focus=s.focus,
                    notes=s.notes,
                )
                for s in og_workout_sets
            ]
        )

        return Response(
            {
                "message": "Workout duplicated",
                "workout": WorkoutSerializer(new_workout).data,
            },
            status=201,
        )

    @action(detail=True, methods=["PATCH"])
    def start_workout(self, request, pk=None):
        """Starts or restarts a workout timer."""
        workout = self.get_object()

        if workout.start_time is None:
            workout.start_time = now()
            workout.save()
            update_active_set(workout.id)

            return Response(
                {
                    "message": "Workout timer started",
                    "start_time": workout.start_time,
                    "workout": WorkoutSerializer(workout).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "message": "Workout timer restarted",
                "start_time": workout.start_time,
                "workout": WorkoutSerializer(workout).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["PATCH"])
    def complete_workout(self, request, pk=None):
        """Marks a workout as complete."""
        workout = self.get_object()

        if not workout.start_time:
            return Response(
                {
                    "message":
                    "Workout cannot be marked complete before it has been started!"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not workout.complete:
            workout.duration = int((now() - workout.start_time).total_seconds())
            workout.complete = True
            workout.save()
            return Response(
                {
                    "message": "Workout marked complete!",
                    "workout_duration": workout.duration,
                    "workout": WorkoutSerializer(workout).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": "Workout already marked as complete!"},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ✅ SetDict ViewSet
class SetDictViewSet(ModelViewSet):
    """ViewSet for managing sets"""

    queryset = SetDict.objects.all().order_by("set_order")
    serializer_class = SetDictSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Ensure users only see their own sets & allow filtering by workout"""

        queryset = SetDict.objects.filter(workout__user=self.request.user).order_by(
            "set_order"
        )
        workout_id = self.request.query_params.get("workout")

        if workout_id:
            queryset = queryset.filter(workout_id=workout_id)

        return queryset

    def perform_create(self, serializer):
        """Handle set creation by getting workout instance from the request data"""
        workout_id = self.request.data.get('workout')
        if workout_id:
            try:
                workout = Workout.objects.get(id=workout_id, user=self.request.user)
                serializer.save(workout=workout)
            except Workout.DoesNotExist:
                raise serializers.ValidationError(
                    {"workout": "Workout not found or you don't have permission to access it."}
                )
        else:
            raise serializers.ValidationError(
                {"workout": "Workout ID is required."}
            )

    @action(detail=True, methods=["POST"])
    def duplicate(self, request, pk=None):
        """Duplicates a set within the same workout."""
        original_set = self.get_object()
        workout = original_set.workout

        # Get the maximum set_order for this workout
        max_set_order = SetDict.objects.filter(workout=workout).count()

        # Create new set with incremented set_order
        new_set = SetDict.objects.create(
            workout=workout,
            exercise_name=original_set.exercise_name,
            set_type=original_set.set_type,
            reps=original_set.reps,
            loading=original_set.loading,
            rest=original_set.rest,
            focus=original_set.focus,
            notes=original_set.notes,
            set_order=max_set_order + 1,  # Place at the end
            set_number=max_set_order + 1,  # New set number
            complete=False,  # Always start as incomplete
            set_duration=None,
            set_start_time=None,
            is_active_set=False
        )

        return Response(
            {
                "message": f"Set {original_set.id} duplicated",
                "set": SetDictSerializer(new_set).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["PATCH"])
    def complete_set(self, request, pk=None):
        """Mark a SetDict as Complete or Undo Completion"""
        set_dict = self.get_object()
        workout = set_dict.workout

        if set_dict.complete:  # ✅ Undo completion
            set_dict.complete = False
            set_dict.set_duration = None
            set_dict.set_start_time = None
        else:  # ✅ Marking set as complete
            set_dict.complete = True
            if set_dict.set_start_time and set_dict.set_start_time <= now():
                set_dict.set_duration = int(
                    (now() - set_dict.set_start_time).total_seconds()
                )

        set_dict.save()

        # 🔥 Update which set is now active
        update_active_set(workout.id)

        return Response(
            {
                "message": f"Set {set_dict.id} completion status changed",
                "set": SetDictSerializer(set_dict).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["PATCH"])
    def skip_set(self, request, pk=None):
        """Moves a set to the last position in `set_order`."""
        set_dict = self.get_object()
        workout = set_dict.workout

        max_set_order = SetDict.objects.filter(workout_id=workout.id).count()

        """We move the set_dict beyond the last position in the running order,
        because the post save signal ensures a consistent running order,
        so by pushing the skipped set beyond that,
        we escape race conditions of indexing conflicts."""
        set_dict.set_order = max_set_order + 1  # Moves set beyond last position

        set_dict.is_active_set = False  # 🔥 Ensure skipped sets aren't active
        set_dict.set_start_time = None
        set_dict.save()

        # 🔥 Update which set is now active
        skip_active_set(workout.id, set_dict)

        return Response(
            {
                "message": f"Set {set_dict.id} skipped",
                "set": SetDictSerializer(set_dict).data,  # ✅ Return updated set order
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["PATCH"])
    def move_set(self, request, pk=None):
        """Moves a set to a new position,
        keeping all other sets ordered sequentiallly."""

        set_dict = self.get_object()
        workout = set_dict.workout

        new_position = int(request.data.get("new_position"))

        try:
            with transaction.atomic():  # ✅ Ensure atomicity
                set_to_move = SetDict.objects.get(id=set_dict.id, workout_id=workout.id)

                # 🚀 Temporarily disable the signal
                local_storage.disable_reorder_signal = True

                # ✅ Shift all other sets down/up
                affected_sets = (
                    SetDict.objects.filter(workout=workout.id)
                    .exclude(id=set_dict.id)
                    .order_by("set_order")
                )
                for index, set_instance in enumerate(affected_sets, start=1):
                    set_instance.set_order = (
                        index if index < new_position else index + 1
                    )

                SetDict.objects.bulk_update(affected_sets, ["set_order"])

                # ✅ Assign new position to the moved set
                set_to_move.set_order = new_position
                set_to_move.save()

                # ✅ Re-enable the signal
                local_storage.disable_reorder_signal = False

            return Response(
                {
                    "message": f"Set {set_dict.id} moved to position {new_position}",
                    "set": SetDictSerializer(set_to_move).data,
                }
            )

        except SetDict.DoesNotExist:
            return Response({"error": "Set not found"}, status=404)
