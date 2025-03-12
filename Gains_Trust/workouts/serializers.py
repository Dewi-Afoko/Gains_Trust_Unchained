from rest_framework import serializers
from .models import Workout, SetDict


class WorkoutSerializer(serializers.ModelSerializer):

    class Meta:
        model = Workout
        fields = "__all__"
        read_only_fields = ["user", "id"]
        extra_kwargs = {
            "user_weight": {"required": False, "allow_null": True},
            "sleep_score": {"required": False, "allow_null": True},
            "sleep_quality": {"required": False, "allow_null": True},
            "notes": {"required": False, "allow_null": True},
        }

    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not request.user:
            raise serializers.ValidationError(
                {"user": "An authenticated user is required to create a workout."}
            )

        return Workout.objects.create(user=request.user, **validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class SetDictSerializer(serializers.ModelSerializer):

    class Meta:
        model = SetDict
        fields = "__all__"
        read_only_fields = ["workout", "set_number", "id", "set_order"]
        extra_kwargs = {
            "loading": {"allow_null": True, "required": False},
            "reps": {"allow_null": True, "required": False},
            "rest": {"allow_null": True, "required": False},
        }

    def create(self, validated_data):
        workout = self.context.get("workout", validated_data.get("workout"))  # ✅ Fallback to validated_data

        if not workout:
            raise serializers.ValidationError(
                {"workout": "A valid workout instance must be provided."}
            )

        set_dict = SetDict.objects.create(workout=workout, **validated_data)
        set_dict.refresh_from_db()
        return set_dict


    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)

        instance.save()
        return instance
