from django_filters import rest_framework as filters

from catalog import models


class TaskFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")
    category = filters.NumberFilter(field_name="category")
    difficulty = filters.NumberFilter(field_name="difficulty")

    class Meta:
        model = models.ProgrammingTask
        fields = ("status", "category", "difficulty")


class SolutionFilter(filters.FilterSet):
    category = filters.CharFilter(
        field_name="task__category__name", lookup_expr="iexact"
    )
    difficulty = filters.CharFilter(
        field_name="task__difficulty__name", lookup_expr="iexact"
    )
    task_name = filters.CharFilter(
        field_name="task__name", lookup_expr="icontains"
    )

    class Meta:
        model = models.Solution
        fields = ("category", "difficulty", "task_name", "language")
