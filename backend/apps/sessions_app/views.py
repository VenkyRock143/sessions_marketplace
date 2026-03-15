from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Session, Category
from .serializers import SessionListSerializer, CategorySerializer
from .permissions import IsCreatorOrReadOnly

class SessionViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD for Sessions with advanced filtering, 
    searching, and permission logic.
    """
    serializer_class = SessionListSerializer
    permission_classes = [IsCreatorOrReadOnly]
    lookup_field = 'slug'

    # Backend configurations
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ['status', 'category', 'creator']
    search_fields = ['title', 'description']
    ordering_fields = ['scheduled_at', 'price', 'created_at']
    ordering = ['-scheduled_at']

    def get_queryset(self):
        """
        Optimizes database access and enforces visibility rules.
        """
        # select_related solves the N+1 problem for foreign keys
        qs = Session.objects.select_related('creator', 'category')
        user = self.request.user

        if self.action in ('list', 'retrieve'):
            # Creators see their own drafts; everyone else sees only 'published'
            if user.is_authenticated and user.is_creator:
                return qs.filter(
                    Q(status='published') | Q(creator=user)
                )
            return qs.filter(status='published')
        
        return qs

    @action(detail=False, methods=['get'], url_path='my-sessions')
    def my_sessions(self, request):
        """
        Custom endpoint to list all sessions created by the current user.
        """
        if not request.user.is_creator:
            return Response(
                {'detail': 'Creators only.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        qs = Session.objects.filter(creator=request.user)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only access to session categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer