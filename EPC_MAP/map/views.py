from django.http import JsonResponse
from django.views.generic import TemplateView
from rest_framework.generics import RetrieveAPIView, GenericAPIView, ListAPIView

from .models import Certificate, Recommendation
from .serializers import CertificateSerializer, CertificateMapSerializer


# Create your views here.
class Map(TemplateView):
    template_name = 'maps/map.html'

class MapAPI(ListAPIView):
    model = Certificate
    serializer_class = CertificateMapSerializer
    queryset = Certificate.objects.all()[:100]

class CertificateAPI(RetrieveAPIView):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    lookup_field = 'lmk_key'
    lookup_url_kwarg = 'lmk_key'

    # def get(self, request, *args, **kwargs):
    #     super().get()
