from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.


@api_view(["GET"])
def homepage(request):
    return Response({"message": "Welcome to Gains Trust API"})
