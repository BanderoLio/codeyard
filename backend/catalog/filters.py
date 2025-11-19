from django_filters import rest_framework as filters

from catalog import models


class SolutionFilter(filters.FilterSet):
    category = filters.CharFilter(
        field_name='task__category__name', lookup_expr='iexact'
    )
    difficulty = filters.CharFilter(
        field_name='task__difficulty__name', lookup_expr='iexact'
    )
    task_name = filters.CharFilter(
        field_name='task__name', lookup_expr='icontains'
    )

    class Meta:
        model = models.Solution
        fields = ('category', 'difficulty', 'task_name', 'language')

