from django.db.models import Q
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from catalog import filters, models, permissions as catalog_permissions, serializers, services


class StaffWritePermissionMixin(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class CategoryViewSet(StaffWritePermissionMixin):
    queryset = models.Category.objects.all().order_by('name')
    serializer_class = serializers.CategorySerializer


class DifficultyViewSet(StaffWritePermissionMixin):
    queryset = models.Difficulty.objects.all().order_by('name')
    serializer_class = serializers.DifficultySerializer


class ProgrammingLanguageViewSet(StaffWritePermissionMixin):
    queryset = models.ProgrammingLanguage.objects.all().order_by('name')
    serializer_class = serializers.ProgrammingLanguageSerializer


class ProgrammingTaskViewSet(viewsets.ModelViewSet):
    queryset = models.ProgrammingTask.objects.select_related(
        'category', 'difficulty', 'added_by'
    ).all()
    serializer_class = serializers.ProgrammingTaskSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    search_fields = ('name',)
    ordering_fields = ('created_at',)

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class SolutionViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.SolutionSerializer
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        catalog_permissions.IsOwnerOrReadOnly,
    )
    filterset_class = filters.SolutionFilter
    search_fields = ('task__name', 'language__name', 'user__username')

    def get_queryset(self):
        base_qs = models.Solution.objects.select_related(
            'task', 'task__category', 'task__difficulty', 'language', 'user'
        )
        if not self.request.user.is_authenticated:
            return base_qs.filter(is_public=True)
        return base_qs.filter(
            Q(is_public=True) | Q(user=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], url_path='publish')
    def publish(self, request, pk=None):
        solution = self.get_object()
        serializer = serializers.SolutionPublishSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.publish_solution(
            solution, make_public=serializer.validated_data['is_public']
        )
        return Response(
            self.get_serializer(solution).data, status=status.HTTP_200_OK
        )


class ReviewViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.ReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return models.Review.objects.select_related('solution', 'added_by')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        status_code = status.HTTP_201_CREATED
        if getattr(serializer, 'created', True) is False:
            status_code = status.HTTP_200_OK
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status_code, headers=headers)

