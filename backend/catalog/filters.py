from django_filters import rest_framework as filters

from catalog import models


class TaskFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")
    category = filters.NumberFilter(field_name="category")
    difficulty = filters.NumberFilter(field_name="difficulty")
    added_by = filters.NumberFilter(field_name="added_by")
    solved_by = filters.NumberFilter(
        method="filter_solved_by",
    )

    def filter_solved_by(self, queryset, name, value):
        """Filter tasks that have solutions by the specified user."""
        if value:
            return queryset.filter(solutions__user_id=value).distinct()
        return queryset

    class Meta:
        model = models.ProgrammingTask
        fields = ("status", "category", "difficulty", "added_by", "solved_by")


class SolutionFilter(filters.FilterSet):
    task = filters.NumberFilter(field_name="task")
    category = filters.CharFilter(
        field_name="task__category__name", lookup_expr="iexact"
    )
    difficulty = filters.CharFilter(
        field_name="task__difficulty__name", lookup_expr="iexact"
    )
    task_name = filters.CharFilter(
        field_name="task__name", lookup_expr="icontains"
    )
    language = filters.NumberFilter(field_name="language")

    class Meta:
        model = models.Solution
        fields = ("task", "category", "difficulty", "task_name", "language")


class ReviewFilter(filters.FilterSet):
    solution = filters.NumberFilter(field_name="solution")

    class Meta:
        model = models.Review
        fields = ("solution",)
