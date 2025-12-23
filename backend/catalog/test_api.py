from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from catalog import models

User = get_user_model()


class ProgrammingTaskAPITests(APITestCase):
    """Tests for ProgrammingTask API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username="taskuser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="other", password="testpass123"
        )
        self.category = models.Category.objects.create(
            name="Sorting", description="Sorting algorithms"
        )
        self.difficulty = models.Difficulty.objects.create(name="Medium")
        self.task = models.ProgrammingTask.objects.create(
            name="Merge Sort",
            description="Implement merge sort algorithm",
            resource="https://example.com/merge-sort",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.user,
            status=models.ProgrammingTask.TaskStatus.PRIVATE,
        )

    def test_list_tasks_anonymous_only_public(self):
        """Test that anonymous users only see public tasks."""
        public_task = models.ProgrammingTask.objects.create(
            name="Public Task",
            description="A public task",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.user,
            status=models.ProgrammingTask.TaskStatus.PUBLIC,
        )

        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tasks = response.data.get("results", response.data)
        task_ids = [t["id"] for t in tasks]

        self.assertIn(public_task.id, task_ids)
        self.assertNotIn(self.task.id, task_ids)

    def test_list_tasks_authenticated_sees_own_and_public(self):
        """Test that authenticated users see their own and public tasks."""
        self.client.force_authenticate(user=self.user)
        
        public_task = models.ProgrammingTask.objects.create(
            name="Public Task",
            description="A public task",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.other_user,
            status=models.ProgrammingTask.TaskStatus.PUBLIC,
        )

        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tasks = response.data.get("results", response.data)
        task_ids = [t["id"] for t in tasks]

        self.assertIn(self.task.id, task_ids)  # Own task
        self.assertIn(public_task.id, task_ids)  # Public task

    def test_create_task_authenticated_only(self):
        """Test that only authenticated users can create tasks."""
        payload = {
            "name": "Quick Sort",
            "description": "Implement quick sort",
            "difficulty": self.difficulty.id,
            "category": self.category.id,
        }

        response = self.client.post("/api/tasks/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/tasks/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["added_by"], self.user.username
        )

    def test_create_task_with_validation_errors(self):
        """Test task creation with invalid data."""
        self.client.force_authenticate(user=self.user)

        # Test with short name
        payload = {
            "name": "AB",  # Too short
            "description": "This is a long description for the task",
            "difficulty": self.difficulty.id,
            "category": self.category.id,
        }
        response = self.client.post("/api/tasks/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test with invalid URL
        payload = {
            "name": "Valid Task Name",
            "description": "This is a long description for the task",
            "resource": "not-a-valid-url",
            "difficulty": self.difficulty.id,
            "category": self.category.id,
        }
        response = self.client.post("/api/tasks/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unique_task_name_per_user(self):
        """Test that task names are unique per user."""
        self.client.force_authenticate(user=self.user)

        payload = {
            "name": "Merge Sort",  # Same as self.task
            "description": "Another merge sort implementation",
            "difficulty": self.difficulty.id,
            "category": self.category.id,
        }
        response = self.client.post("/api/tasks/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_task_owner_only(self):
        """Test that only task owner can update."""
        self.client.force_authenticate(user=self.other_user)

        payload = {"description": "Modified description"}
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/", payload, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Owner can update
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/", payload, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_task_owner_only(self):
        """Test that only task owner can delete."""
        self.client.force_authenticate(user=self.other_user)

        response = self.client.delete(f"/api/tasks/{self.task.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Owner can delete
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f"/api/tasks/{self.task.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class SolutionAPITests(APITestCase):
    """Tests for Solution API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username="soluser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="solother", password="testpass123"
        )
        self.category = models.Category.objects.create(name="DP")
        self.difficulty = models.Difficulty.objects.create(name="Hard")
        self.language = models.ProgrammingLanguage.objects.create(name="C++")
        self.task = models.ProgrammingTask.objects.create(
            name="LCS",
            description="Longest Common Subsequence",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.user,
        )

    def test_create_solution_requires_auth(self):
        """Test that creating solution requires authentication."""
        payload = {
            "task": self.task.id,
            "code": "int main() { return 0; }",
            "language": self.language.id,
            "explanation": "C++ solution",
            "is_public": False,
        }

        response = self.client.post("/api/solutions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_public_solution_updates_task(self):
        """Test that creating public solution makes task public."""
        self.client.force_authenticate(user=self.user)

        payload = {
            "task": self.task.id,
            "code": "def lcs(a, b): pass",
            "language": self.language.id,
            "explanation": "Dynamic programming",
            "is_public": True,
        }

        response = self.client.post("/api/solutions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.task.refresh_from_db()
        self.assertEqual(
            self.task.status, models.ProgrammingTask.TaskStatus.PUBLIC
        )

    def test_publish_solution_endpoint(self):
        """Test publishing a solution via API."""
        solution = models.Solution.objects.create(
            task=self.task,
            code="solution code",
            language=self.language,
            user=self.user,
            is_public=False,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f"/api/solutions/{solution.id}/publish/",
            {"is_public": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        solution.refresh_from_db()
        self.assertTrue(solution.is_public)

    def test_solution_visibility(self):
        """Test solution visibility based on public/private status."""
        private_solution = models.Solution.objects.create(
            task=self.task,
            code="private code",
            language=self.language,
            user=self.user,
            is_public=False,
        )
        public_solution = models.Solution.objects.create(
            task=self.task,
            code="public code",
            language=self.language,
            user=self.user,
            is_public=True,
        )

        # Anonymous can only see public
        response = self.client.get("/api/solutions/")
        solutions = response.data.get("results", response.data)
        solution_ids = [s["id"] for s in solutions]

        self.assertIn(public_solution.id, solution_ids)
        self.assertNotIn(private_solution.id, solution_ids)

        # Author can see both
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/solutions/")
        solutions = response.data.get("results", response.data)
        solution_ids = [s["id"] for s in solutions]

        self.assertIn(public_solution.id, solution_ids)
        self.assertIn(private_solution.id, solution_ids)


class ReviewAPITests(APITestCase):
    """Tests for Review API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.author = User.objects.create_user(
            username="author", password="testpass123"
        )
        self.reviewer = User.objects.create_user(
            username="reviewer", password="testpass123"
        )
        self.category = models.Category.objects.create(name="Graphs")
        self.difficulty = models.Difficulty.objects.create(name="Medium")
        self.language = models.ProgrammingLanguage.objects.create(name="Python")
        self.task = models.ProgrammingTask.objects.create(
            name="BFS",
            description="Breadth First Search",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.author,
        )
        self.solution = models.Solution.objects.create(
            task=self.task,
            code="def bfs(graph, start): pass",
            language=self.language,
            user=self.author,
            is_public=True,
        )

    def test_create_review_requires_auth(self):
        """Test that creating review requires authentication."""
        payload = {
            "solution": self.solution.id,
            "review_type": models.Review.ReviewType.POSITIVE,
        }

        response = self.client.post("/api/reviews/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_review_own_solution(self):
        """Test that user cannot review their own solution."""
        self.client.force_authenticate(user=self.author)

        payload = {
            "solution": self.solution.id,
            "review_type": models.Review.ReviewType.POSITIVE,
        }

        response = self.client.post("/api/reviews/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_one_review_per_solution_per_user(self):
        """Test that user can only review each solution once."""
        self.client.force_authenticate(user=self.reviewer)

        payload = {
            "solution": self.solution.id,
            "review_type": models.Review.ReviewType.POSITIVE,
        }

        # First review
        response1 = self.client.post("/api/reviews/", payload, format="json")
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(models.Review.objects.count(), 1)

        # Update review
        payload["review_type"] = models.Review.ReviewType.NEGATIVE
        response2 = self.client.post("/api/reviews/", payload, format="json")
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(models.Review.objects.count(), 1)
