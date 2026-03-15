from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.db.models import Q
from django_ratelimit.decorators import ratelimit
from .models import Booking
from .serializers import BookingSerializer
from .permissions import IsOwnerOrAdmin


@method_decorator(
    ratelimit(key='user_or_ip', rate='20/h', method='POST', block=True),
    name='create'
)
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all().select_related('session', 'user')
        if user.role == 'creator':
            return Booking.objects.filter(
                Q(user=user) | Q(session__creator=user)
            ).select_related('session', 'user')
        return Booking.objects.filter(user=user).select_related('session')

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status in ('cancelled', 'completed'):
            return Response(
                {'detail': 'This booking cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        return Response({'status': 'cancelled'})

    @action(detail=False, methods=['post'], url_path='create-payment-intent')
    def create_payment_intent(self, request):
        import stripe
        from django.conf import settings
        from apps.sessions_app.models import Session as S

        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            sess = S.objects.get(pk=request.data.get('session_id'))
        except S.DoesNotExist:
            return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        if float(sess.price) == 0:
            return Response({'client_secret': None})

        intent = stripe.PaymentIntent.create(
            amount=int(float(sess.price) * 100),
            currency='usd',
            metadata={
                'session_id': sess.id,
                'user_id': request.user.id,
            },
        )
        return Response({'client_secret': intent.client_secret})

    @action(detail=False, methods=['post'], url_path='confirm-payment')
    def confirm_payment(self, request):
        import stripe
        from django.conf import settings
        from apps.sessions_app.models import Session as S

        stripe.api_key = settings.STRIPE_SECRET_KEY

        pi_id = request.data.get('payment_intent_id')
        session_id = request.data.get('session_id')

        try:
            intent = stripe.PaymentIntent.retrieve(pi_id)
        except stripe.error.StripeError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if intent.status != 'succeeded':
            return Response(
                {'detail': 'Payment not completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            sess = S.objects.get(pk=session_id)
        except S.DoesNotExist:
            return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        booking = Booking.objects.create(
            user=request.user,
            session=sess,
            status='confirmed',
            stripe_payment_id=pi_id,
            amount_paid=sess.price,
        )
        return Response(
            BookingSerializer(booking, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
