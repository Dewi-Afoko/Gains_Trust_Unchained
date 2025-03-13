from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from .models import SetDict
import threading


# ✅ Thread-local storage to track when `move_set` is being used
local_storage = threading.local()

@receiver(pre_save, sender=SetDict)
def assign_set_order(sender, instance, **kwargs):
    """Assigns set_order dynamically BEFORE saving a new set."""
    if not instance.pk:  # Only assign if this is a new object
        instance.set_order = (
            SetDict.objects.filter(workout=instance.workout).count() + 1
        )


@receiver(post_save, sender=SetDict)
def reorder_sets_after_creation(sender, instance, created, **kwargs):
    """Ensures `set_number` is assigned uniquely and sequentially, while skipping manually moved sets."""

    # 🚨 Check if the move_set function is active and SKIP reordering if true
    if getattr(local_storage, "disable_reorder_signal", False):
        return  

    sets = SetDict.objects.filter(workout=instance.workout).order_by("set_order")
    exercise_count = {}

    for index, set_instance in enumerate(sets, start=1):
        exercise_name = set_instance.exercise_name

        if exercise_name not in exercise_count:
            exercise_count[exercise_name] = 1
        else:
            exercise_count[exercise_name] += 1

        set_instance.set_number = exercise_count[exercise_name]
        set_instance.set_order = index  # ✅ Reassign `set_order` for other sets

    SetDict.objects.bulk_update(sets, ["set_number", "set_order"])


@receiver(post_delete, sender=SetDict)
def reorder_sets_after_deletion(sender, instance, **kwargs):
    """Ensures `set_number` and `set_order` update correctly after a set is deleted."""

    # ✅ Fetch all remaining sets in this workout ordered by `set_order`
    remaining_sets = list(
        SetDict.objects.filter(workout=instance.workout).order_by("set_order")
    )

    # ✅ Dictionary to track counts for each exercise
    exercise_count = {}

    # ✅ Reassign `set_number` and `set_order` dynamically
    for index, set_instance in enumerate(remaining_sets, start=1):
        exercise_name = set_instance.exercise_name

        if exercise_name not in exercise_count:
            exercise_count[exercise_name] = 1  # ✅ Start from 1 for each exercise
        else:
            exercise_count[exercise_name] += 1  # ✅ Increment count

        set_instance.set_number = exercise_count[exercise_name]
        set_instance.set_order = index  # ✅ Ensure order remains sequential

    # ✅ Bulk update all affected sets
    SetDict.objects.bulk_update(remaining_sets, ["set_number", "set_order"])
