"""Seed initial data for the application."""

from django.core.management.base import BaseCommand
from catalog.models import Category, Difficulty, ProgrammingLanguage


class Command(BaseCommand):
    """Management command to seed initial reference data."""

    help = "Seed initial data for categories, difficulties, and languages"

    def handle(self, *args, **options):
        """Execute the seeding process."""
        # Create categories
        categories_data = [
            ("Arrays", "Array manipulation and problems"),
            ("Strings", "String processing and algorithms"),
            ("Linked Lists", "Linked list data structures"),
            ("Trees", "Binary trees, BSTs, and tree algorithms"),
            ("Graphs", "Graph traversal and algorithms"),
            ("Dynamic Programming", "Dynamic programming problems"),
            ("Sorting", "Sorting algorithms and techniques"),
            ("Searching", "Search algorithms and techniques"),
            ("Hashing", "Hash tables and hashing problems"),
            ("Greedy", "Greedy algorithm problems"),
            ("Backtracking", "Backtracking and recursion"),
            ("Math", "Mathematical problems"),
            ("Design", "System design problems"),
            ("Others", "Miscellaneous problems"),
        ]

        for name, description in categories_data:
            Category.objects.get_or_create(
                name=name, defaults={"description": description}
            )
        self.stdout.write(
            self.style.SUCCESS(f"✓ Created {len(categories_data)} categories")
        )

        # Create difficulties
        difficulties_data = ["Trivial", "Easy", "Medium", "Hard", "Expert"]

        for name in difficulties_data:
            Difficulty.objects.get_or_create(name=name)
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Created {len(difficulties_data)} difficulty levels"
            )
        )

        # Create programming languages
        languages_data = [
            "Python",
            "JavaScript",
            "Java",
            "C++",
            "C#",
            "Go",
            "Rust",
            "TypeScript",
            "PHP",
            "Ruby",
            "Swift",
            "Kotlin",
            "R",
            "Julia",
            "Scala",
            "Haskell",
        ]

        for name in languages_data:
            ProgrammingLanguage.objects.get_or_create(name=name)
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Created {len(languages_data)} programming languages"
            )
        )

        self.stdout.write(
            self.style.SUCCESS("\n✓ All reference data initialized successfully!")
        )
