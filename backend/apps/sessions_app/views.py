from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Session, Category
from .serializers import SessionListSerializer, CategorySerializer
from .permissions import IsCreatorOrReadOnly


class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionListSerializer
    permission_classes = [IsCreatorOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ['status', 'category', 'creator']
    search_fields = ['title', 'description']
    ordering_fields = ['scheduled_at', 'price', 'created_at']
    ordering = ['-scheduled_at']
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Session.objects.select_related('creator', 'category')
        user = self.request.user
        if self.action in ('list', 'retrieve'):
            if user.is_authenticated and user.is_creator:
                return qs.filter(
                    Q(status='published') | Q(creator=user)
                )
            return qs.filter(status='published')
        return qs

    @action(detail=False, methods=['get'], url_path='my-sessions')
    def my_sessions(self, request):
        if not request.user.is_creator:
            return Response(
                {'detail': 'Creators only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        qs = Session.objects.filter(creator=request.user)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer