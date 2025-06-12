import pytest
from django.contrib import admin
from core.models import Exercise


@pytest.mark.django_db
def test_exercise_admin_registered():
    """Test that Exercise model is registered in admin."""
    assert Exercise in admin.site._registry
    
@pytest.mark.django_db  
def test_exercise_admin_model():
    """Test Exercise admin model configuration."""
    admin_class = admin.site._registry[Exercise]
    assert admin_class.model == Exercise 