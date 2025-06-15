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
        return Workout.objects.create(**validated_data)

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
        # The workout will be passed via the ViewSet's perform_create method
        return SetDict.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)

        instance.save()
        return instance
