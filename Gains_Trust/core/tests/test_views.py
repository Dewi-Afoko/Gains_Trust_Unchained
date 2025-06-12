import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Fixture for API client."""
    return APIClient()


@pytest.mark.django_db
def test_homepage_view(api_client):
    """Test the homepage API endpoint."""
    url = reverse('homepage')
    response = api_client.get(url)
    
    assert response.status_code == 200
    assert response.data == {"message": "Welcome to Gains Trust API"} 