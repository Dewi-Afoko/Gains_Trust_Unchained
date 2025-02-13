from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Weight

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "height",
            "dob",
            "email",
            "first_name",
            "last_name",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        email = validated_data.get("email")
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=email if email else None,
        )
        return user

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if value is not None and attr != "password":
                setattr(instance, attr, value)
        password = validated_data.get("password")
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class WeightSerializer(serializers.ModelSerializer):

    class Meta:
        model = Weight
        fields = "__all__"
        read_only_fields = ["user", "date_recorded"]

    def create(self, validated_data):
        request = self.context.get("request")
        weight = Weight.objects.create(
            user=request.user, weight=validated_data["weight"]
        )
        return weight
