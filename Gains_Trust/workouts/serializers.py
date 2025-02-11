from rest_framework import serializers
from .models import Workout, SetDict
from django.shortcuts import get_object_or_404

class WorkoutSerializer(serializers.ModelSerializer):

    class Meta:
        model = Workout
        fields = ['user', 'workout_name', 'date', 'complete', 'user_weight', 'sleep_score', 'sleep_quality', 'notes']
        read_only_fields = ['user']

    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not request.user:
            raise serializers.ValidationError({"user": "An authenticated user is required to create a workout."})
        
        return Workout.objects.create(user=request.user, **validated_data)

    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)
        
        instance.save()
        return instance
    
class SetDictSerializer(serializers.ModelSerializer):

    class Meta:
        model = SetDict
        fields = ["workout", "exercise_name", "set_order", "set_number", "set_type", "reps", "focus", "rest", "notes", "complete"]
        read_only_fields = ["workout", "set_number"]

    def create(self, validated_data):
        workout = self.context.get("workout")
        if not workout:
            raise serializers.ValidationError({"workout": "A valid workout instance must be provided."})
        

        if "set_order" not in validated_data:
            validated_data["set_order"] = SetDict.objects.filter(workout=workout).count() + 1
        
        return SetDict.objects.create(workout=workout, **validated_data)
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)
        
        instance.save()
        return instance
        
