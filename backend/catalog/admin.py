from django.contrib import admin

from catalog import models


@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "created_at")
    search_fields = ("name",)


@admin.register(models.Difficulty)
class DifficultyAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


@admin.register(models.ProgrammingLanguage)
class ProgrammingLanguageAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


@admin.register(models.ProgrammingTask)
class ProgrammingTaskAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "difficulty",
        "status",
        "added_by",
        "created_at",
    )
    search_fields = ("name",)
    list_filter = ("status", "category", "difficulty")


@admin.register(models.Solution)
class SolutionAdmin(admin.ModelAdmin):
    list_display = ("task", "user", "language", "is_public", "created_at")
    list_filter = ("is_public", "language")
    search_fields = ("task__name", "user__username")


@admin.register(models.Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("solution", "added_by", "review_type", "created_at")
    list_filter = ("review_type",)
