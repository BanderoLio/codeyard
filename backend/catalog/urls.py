from rest_framework.routers import DefaultRouter

from catalog import views

router = DefaultRouter()
router.register("categories", views.CategoryViewSet, basename="category")
router.register("difficulties", views.DifficultyViewSet, basename="difficulty")
router.register(
    "languages", views.ProgrammingLanguageViewSet, basename="language"
)
router.register("tasks", views.ProgrammingTaskViewSet, basename="task")
router.register("solutions", views.SolutionViewSet, basename="solution")
router.register("reviews", views.ReviewViewSet, basename="review")

urlpatterns = router.urls
