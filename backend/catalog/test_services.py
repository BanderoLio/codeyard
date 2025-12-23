"""Unit tests for catalog services."""

from django.contrib.auth import get_user_model
from django.test import TestCase

from catalog import models, services

User = get_user_model()


class CreateSolutionServiceTests(TestCase):
    """Tests for create_solution service."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.category, _ = models.Category.objects.get_or_create(name="Arrays")
        self.difficulty, _ = models.Difficulty.objects.get_or_create(name="Medium")
        self.language, _ = models.ProgrammingLanguage.objects.get_or_create(name="Python")
        self.task = models.ProgrammingTask.objects.create(
            name="Sum Array",
            description="Find sum of array elements",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.user,
        )

    def test_create_solution_private(self):
        """Test creating a private solution."""
        validated_data = {
            "task": self.task,
            "code": "sum([1, 2, 3])",
            "language": self.language,
            "explanation": "Using built-in sum",
            "is_public": False,
        }
        result = services.create_solution(
            user=self.user, validated_data=validated_data
        )

        self.assertTrue(result.created)
        self.assertIsNotNone(result.instance)
        self.assertEqual(result.instance.user, self.user)
        self.assertFalse(result.instance.is_public)
        # Task should remain private when solution is private
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, models.ProgrammingTask.TaskStatus.PRIVATE)

    def test_create_public_solution_makes_task_public(self):
        """Test that creating a public solution makes task public."""
        validated_data = {
            "task": self.task,
            "code": "return sum(arr)",
            "language": self.language,
            "explanation": "Direct implementation",
            "is_public": True,
        }
        result = services.create_solution(
            user=self.user, validated_data=validated_data
        )

        self.assertTrue(result.created)
        self.assertTrue(result.instance.is_public)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, models.ProgrammingTask.TaskStatus.PUBLIC)

    def test_create_solution_invalid_task(self):
        """Test creating solution with invalid task."""
        validated_data = {
            "task": None,
            "code": "code",
            "language": self.language,
            "explanation": "test",
            "is_public": False,
        }
        with self.assertRaises(ValueError):
            services.create_solution(
                user=self.user, validated_data=validated_data
            )


class PublishSolutionServiceTests(TestCase):
    """Tests for publish_solution service."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.category, _ = models.Category.objects.get_or_create(name="Strings")
        self.difficulty, _ = models.Difficulty.objects.get_or_create(name="Hard")
        self.language, _ = models.ProgrammingLanguage.objects.get_or_create(name="Java")
        self.task = models.ProgrammingTask.objects.create(
            name="Palindrome Check",
            description="Check if string is palindrome",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.user,
            status=models.ProgrammingTask.TaskStatus.PRIVATE,
        )
        self.solution = models.Solution.objects.create(
            task=self.task,
            code="def is_palindrome(s): return s == s[::-1]",
            language=self.language,
            explanation="Reverse and compare",
            user=self.user,
            is_public=False,
        )

    def test_publish_solution(self):
        """Test publishing a solution."""
        result = services.publish_solution(self.solution, make_public=True)

        self.assertTrue(result.is_public)
        self.assertIsNotNone(result.published_at)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, models.ProgrammingTask.TaskStatus.PUBLIC)

    def test_publish_already_published_solution(self):
        """Test publishing already published solution doesn't change published_at."""
        first_publish = services.publish_solution(self.solution, make_public=True)
        first_published_at = first_publish.published_at

        # Wait a bit and publish again
        second_publish = services.publish_solution(self.solution, make_public=True)

        # published_at should not change on second publish
        self.assertEqual(first_published_at, second_publish.published_at)

    def test_unpublish_solution(self):
        """Test unpublishing a solution."""
        from django.utils import timezone
        
        # First publish it
        self.solution.is_public = True
        self.solution.published_at = timezone.now()
        self.solution.save()

        result = services.publish_solution(self.solution, make_public=False)

        self.assertFalse(result.is_public)
        self.solution.refresh_from_db()
        self.assertFalse(self.solution.is_public)


class CreateReviewServiceTests(TestCase):
    """Tests for create_review service."""

    def setUp(self):
        """Set up test data."""
        self.user1 = User.objects.create_user(
            username="user1", password="testpass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", password="testpass123"
        )
        self.category, _ = models.Category.objects.get_or_create(name="Math")
        self.difficulty, _ = models.Difficulty.objects.get_or_create(name="Easy")
        self.language, _ = models.ProgrammingLanguage.objects.get_or_create(name="Python")
        self.task = models.ProgrammingTask.objects.create(
            name="Factorial",
            description="Calculate factorial",
            difficulty=self.difficulty,
            category=self.category,
            added_by=self.user1,
        )
        self.solution = models.Solution.objects.create(
            task=self.task,
            code="def factorial(n): return 1 if n <= 1 else n * factorial(n-1)",
            language=self.language,
            explanation="Recursive approach",
            user=self.user1,
            is_public=True,
        )

    def test_create_positive_review(self):
        """Test creating a positive review."""
        result = services.create_review(
            user=self.user2,
            solution=self.solution,
            review_type=models.Review.ReviewType.POSITIVE,
        )

        self.assertTrue(result.created)
        self.assertEqual(result.instance.review_type, models.Review.ReviewType.POSITIVE)
        self.assertEqual(result.instance.added_by, self.user2)

    def test_create_negative_review(self):
        """Test creating a negative review."""
        result = services.create_review(
            user=self.user2,
            solution=self.solution,
            review_type=models.Review.ReviewType.NEGATIVE,
        )

        self.assertTrue(result.created)
        self.assertEqual(result.instance.review_type, models.Review.ReviewType.NEGATIVE)

    def test_cannot_review_own_solution(self):
        """Test that user cannot review their own solution."""
        with self.assertRaises(ValueError) as context:
            services.create_review(
                user=self.user1,
                solution=self.solution,
                review_type=models.Review.ReviewType.POSITIVE,
            )

        self.assertIn("собственное решение", str(context.exception))

    def test_update_review(self):
        """Test updating an existing review."""
        # Create initial review
        result1 = services.create_review(
            user=self.user2,
            solution=self.solution,
            review_type=models.Review.ReviewType.NEGATIVE,
        )
        review_id = result1.instance.id

        # Update review
        result2 = services.create_review(
            user=self.user2,
            solution=self.solution,
            review_type=models.Review.ReviewType.POSITIVE,
        )

        self.assertFalse(result2.created)
        self.assertEqual(result2.instance.id, review_id)
        self.assertEqual(result2.instance.review_type, models.Review.ReviewType.POSITIVE)
        self.assertEqual(models.Review.objects.count(), 1)
