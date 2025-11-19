from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from catalog import models


User = get_user_model()


class SolutionApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester", password="strongpass123"
        )
        self.other = User.objects.create_user(
            username="other", password="strongpass123"
        )
        self.category, _ = models.Category.objects.get_or_create(name="Graphs")
        self.difficulty, _ = models.Difficulty.objects.get_or_create(
            name="Easy"
        )
        self.language, _ = models.ProgrammingLanguage.objects.get_or_create(
            name="Python"
        )
        self.task = models.ProgrammingTask.objects.create(
            name="Two Sum",
            description="Find two numbers",
            resource="https://example.com",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.user,
        )

    def authenticate(self, user=None):
        user = user or self.user
        self.client.force_authenticate(user=user)

    def test_public_solutions_visible_to_anonymous(self):
        solution = models.Solution.objects.create(
            task=self.task,
            code="print(1)",
            language=self.language,
            explanation="",
            user=self.user,
            is_public=True,
        )

        response = self.client.get("/api/solutions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], solution.id)

    def test_create_solution_requires_authentication(self):
        payload = {
            "task": self.task.id,
            "code": "print(2)",
            "language": self.language.id,
            "explanation": "works",
            "is_public": False,
        }
        response = self.client.post("/api/solutions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.authenticate()
        response = self.client.post("/api/solutions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(models.Solution.objects.count(), 1)

    def test_publish_solution_updates_task_status(self):
        self.authenticate()
        solution = models.Solution.objects.create(
            task=self.task,
            code="print(3)",
            language=self.language,
            explanation="",
            user=self.user,
            is_public=False,
        )

        response = self.client.post(
            f"/api/solutions/{solution.id}/publish/",
            {"is_public": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        solution.refresh_from_db()
        self.task.refresh_from_db()
        self.assertTrue(solution.is_public)
        self.assertEqual(
            self.task.status, models.ProgrammingTask.TaskStatus.PUBLIC
        )

    def test_review_other_user_solution_only_once(self):
        solution = models.Solution.objects.create(
            task=self.task,
            code="print(4)",
            language=self.language,
            explanation="",
            user=self.user,
            is_public=True,
        )
        self.authenticate(self.other)
        payload = {"solution": solution.id, "review_type": 1}
        first = self.client.post("/api/reviews/", payload, format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        payload["review_type"] = 0
        second = self.client.post("/api/reviews/", payload, format="json")
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(models.Review.objects.count(), 1)
