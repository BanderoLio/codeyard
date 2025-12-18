from django.db.models import Q
from rest_framework import mixins, pagination, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from catalog import filters, models, serializers, services
from common.mixins import StaffWritePermissionMixin
from common.permissions import IsOwnerOrReadOnly


class NoPagination(pagination.PageNumberPagination):
    page_size = None


class CategoryViewSet(StaffWritePermissionMixin):
    queryset = models.Category.objects.all().order_by("name")
    serializer_class = serializers.CategorySerializer
    pagination_class = NoPagination


class DifficultyViewSet(StaffWritePermissionMixin):
    queryset = models.Difficulty.objects.all().order_by("name")
    serializer_class = serializers.DifficultySerializer
    pagination_class = NoPagination


class ProgrammingLanguageViewSet(StaffWritePermissionMixin):
    queryset = models.ProgrammingLanguage.objects.all().order_by("name")
    serializer_class = serializers.ProgrammingLanguageSerializer
    pagination_class = NoPagination


class ProgrammingTaskViewSet(viewsets.ModelViewSet):
    queryset = models.ProgrammingTask.objects.select_related(
        "category", "difficulty", "added_by"
    ).all()
    serializer_class = serializers.ProgrammingTaskSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    filterset_class = filters.TaskFilter
    search_fields = ("name",)
    ordering_fields = ("created_at",)

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_authenticated:
            return qs.filter(status=models.ProgrammingTask.TaskStatus.PUBLIC)
        return qs.filter(
            Q(status=models.ProgrammingTask.TaskStatus.PUBLIC)
            | Q(added_by=self.request.user)
        ).distinct()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class SolutionViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.SolutionSerializer
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    )
    filterset_class = filters.SolutionFilter
    search_fields = ("task__name", "language__name", "user__username")

    def get_queryset(self):
        base_qs = models.Solution.objects.select_related(
            "task", "task__category", "task__difficulty", "language", "user"
        )
        if not self.request.user.is_authenticated:
            return base_qs.filter(is_public=True)
        return base_qs.filter(
            Q(is_public=True) | Q(user=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, pk=None):
        solution = self.get_object()
        serializer = serializers.SolutionPublishSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.publish_solution(
            solution, make_public=serializer.validated_data["is_public"]
        )
        return Response(
            self.get_serializer(solution).data, status=status.HTTP_200_OK
        )


class ReviewViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    serializer_class = serializers.ReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return models.Review.objects.select_related("solution", "added_by")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        status_code = status.HTTP_201_CREATED
        if getattr(serializer, "created", True) is False:
            status_code = status.HTTP_200_OK
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status_code, headers=headers)
