from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Booking
from .serializers import BookingSerializer
from .permissions import IsOwnerOrAdmin


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        if user.is_creator:
            return Booking.objects.filter(
                Q(user=user) | Q(session__creator=user)
            ).select_related('session', 'user')
        return Booking.objects.filter(user=user).select_related('session')

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status in ('cancelled', 'completed'):
            return Response(
                {'detail': 'Cannot cancel.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        return Response({'status': 'cancelled'})