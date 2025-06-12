import os
from django.http import HttpResponse, Http404
from django.conf import settings
from django.views.generic import View


class ReactAppView(View):
    """
    Serves the React application.
    Serves index.html for all non-API routes to enable React Router.
    """
    
    def get(self, request, *args, **kwargs):
        try:
            # Path to React build index.html
            index_path = os.path.join(settings.REACT_APP_DIR, 'index.html')
            
            with open(index_path) as f:
                return HttpResponse(f.read(), content_type='text/html')
                
        except FileNotFoundError:
            raise Http404("React app not found. Please build the frontend first.") 