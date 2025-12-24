"""Seed initial data for the application."""

import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from catalog import models, services

User = get_user_model()


class Command(BaseCommand):
    """Management command to seed initial reference data."""

    help = "Seed initial data for categories, difficulties, languages, users, tasks, solutions, and reviews"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding",
        )

    def handle(self, *args, **options):
        """Execute the seeding process."""
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Clearing existing data..."))
            models.Review.objects.all().delete()
            models.Solution.objects.all().delete()
            models.ProgrammingTask.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            models.Category.objects.all().delete()
            models.Difficulty.objects.all().delete()
            models.ProgrammingLanguage.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("✓ Existing data cleared"))

        self.seed_reference_data()
        users = self.seed_users()
        tasks = self.seed_tasks(users)
        solutions = self.seed_solutions(users, tasks)
        self.seed_reviews(users, solutions)

        self.stdout.write(
            self.style.SUCCESS("\n✓ All data seeded successfully!")
        )

    def seed_reference_data(self):
        """Seed categories, difficulties, and languages."""
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
            models.Category.objects.get_or_create(
                name=name, defaults={"description": description}
            )
        self.stdout.write(
            self.style.SUCCESS(f"✓ Created {len(categories_data)} categories")
        )

        difficulties_data = ["Trivial", "Easy", "Medium", "Hard", "Expert"]

        for name in difficulties_data:
            models.Difficulty.objects.get_or_create(name=name)
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Created {len(difficulties_data)} difficulty levels"
            )
        )

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
        ]

        for name in languages_data:
            models.ProgrammingLanguage.objects.get_or_create(name=name)
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Created {len(languages_data)} programming languages"
            )
        )

    def seed_users(self):
        """Create test users."""
        users_data = [
            {"username": "alice_dev", "email": "alice@example.com"},
            {"username": "bob_coder", "email": "bob@example.com"},
            {"username": "charlie_tech", "email": "charlie@example.com"},
            {"username": "diana_prog", "email": "diana@example.com"},
            {"username": "eve_hacker", "email": "eve@example.com"},
        ]

        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data["username"],
                defaults={
                    "email": user_data["email"],
                    "password": "pbkdf2_sha256$870000$dummy$dummy=",
                },
            )
            if created:
                user.set_password("testpass123")
                user.save()
            users.append(user)

        self.stdout.write(self.style.SUCCESS(f"✓ Created {len(users)} users"))
        return users

    def seed_tasks(self, users):
        """Create programming tasks."""
        categories = list(models.Category.objects.all())
        difficulties = list(models.Difficulty.objects.all())

        tasks_data = [
            {
                "name": "Two Sum",
                "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                "category": "Arrays",
                "difficulty": "Easy",
                "resource": "https://leetcode.com/problems/two-sum/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Reverse Linked List",
                "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
                "category": "Linked Lists",
                "difficulty": "Easy",
                "resource": "https://leetcode.com/problems/reverse-linked-list/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Binary Tree Inorder Traversal",
                "description": "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
                "category": "Trees",
                "difficulty": "Easy",
                "resource": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Longest Palindromic Substring",
                "description": "Given a string s, return the longest palindromic substring in s.",
                "category": "Strings",
                "difficulty": "Medium",
                "resource": "https://leetcode.com/problems/longest-palindromic-substring/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Merge Intervals",
                "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
                "category": "Arrays",
                "difficulty": "Medium",
                "resource": "https://leetcode.com/problems/merge-intervals/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Word Ladder",
                "description": "A transformation sequence from word beginWord to word endWord using a dictionary wordList.",
                "category": "Graphs",
                "difficulty": "Hard",
                "resource": "https://leetcode.com/problems/word-ladder/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Coin Change",
                "description": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.",
                "category": "Dynamic Programming",
                "difficulty": "Medium",
                "resource": "https://leetcode.com/problems/coin-change/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Valid Parentheses",
                "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                "category": "Strings",
                "difficulty": "Easy",
                "resource": "https://leetcode.com/problems/valid-parentheses/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Maximum Subarray",
                "description": "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
                "category": "Dynamic Programming",
                "difficulty": "Easy",
                "resource": "https://leetcode.com/problems/maximum-subarray/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "Course Schedule",
                "description": "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1.",
                "category": "Graphs",
                "difficulty": "Medium",
                "resource": "https://leetcode.com/problems/course-schedule/",
                "status": models.ProgrammingTask.TaskStatus.PUBLIC,
            },
            {
                "name": "My Private Task",
                "description": "This is a private task for testing purposes.",
                "category": "Arrays",
                "difficulty": "Easy",
                "resource": "",
                "status": models.ProgrammingTask.TaskStatus.PRIVATE,
            },
            {
                "name": "Another Private Task",
                "description": "Another private task example.",
                "category": "Strings",
                "difficulty": "Medium",
                "resource": "",
                "status": models.ProgrammingTask.TaskStatus.PRIVATE,
            },
        ]

        tasks = []
        for task_data in tasks_data:
            category = next(
                (c for c in categories if c.name == task_data["category"]),
                None,
            )
            difficulty = next(
                (d for d in difficulties if d.name == task_data["difficulty"]),
                None,
            )
            user = random.choice(users)

            if category and difficulty:
                task, created = models.ProgrammingTask.objects.get_or_create(
                    name=task_data["name"],
                    added_by=user,
                    defaults={
                        "description": task_data["description"],
                        "category": category,
                        "difficulty": difficulty,
                        "resource": task_data["resource"],
                        "status": task_data["status"],
                    },
                )
                tasks.append(task)

        self.stdout.write(
            self.style.SUCCESS(f"✓ Created {len(tasks)} programming tasks")
        )
        return tasks

    def seed_solutions(self, users, tasks):
        """Create solutions for tasks."""
        languages = list(models.ProgrammingLanguage.objects.all())
        public_tasks = [
            t
            for t in tasks
            if t.status == models.ProgrammingTask.TaskStatus.PUBLIC
        ]

        solutions_data = [
            {
                "task_name": "Two Sum",
                "code": """def twoSum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []""",
                "language": "Python",
                "explanation": "Using hashmap to store complements. Time: O(n), Space: O(n)",
                "is_public": True,
            },
            {
                "task_name": "Two Sum",
                "code": """class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}""",
                "language": "Java",
                "explanation": "HashMap approach. Time: O(n), Space: O(n)",
                "is_public": True,
            },
            {
                "task_name": "Two Sum",
                "code": """class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};""",
                "language": "C++",
                "explanation": "Using unordered_map for O(1) lookup. Time: O(n), Space: O(n)",
                "is_public": True,
            },
            {
                "task_name": "Reverse Linked List",
                "code": """def reverseList(head):
    prev = None
    current = head
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev""",
                "language": "Python",
                "explanation": "Iterative approach with three pointers. Time: O(n), Space: O(1)",
                "is_public": True,
            },
            {
                "task_name": "Reverse Linked List",
                "code": """function reverseList(head) {
    let prev = null;
    let current = head;
    while (current !== null) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    return prev;
}""",
                "language": "JavaScript",
                "explanation": "Iterative reversal. Time: O(n), Space: O(1)",
                "is_public": True,
            },
            {
                "task_name": "Valid Parentheses",
                "code": """function isValid(s) {
    const stack = [];
    const pairs = {
        '(': ')',
        '{': '}',
        '[': ']'
    };
    
    for (let char of s) {
        if (pairs[char]) {
            stack.push(char);
        } else {
            if (stack.length === 0 || pairs[stack.pop()] !== char) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}""",
                "language": "JavaScript",
                "explanation": "Stack-based solution. Time: O(n), Space: O(n)",
                "is_public": True,
            },
            {
                "task_name": "Valid Parentheses",
                "code": """def isValid(s):
    stack = []
    pairs = {'(': ')', '{': '}', '[': ']'}
    
    for char in s:
        if char in pairs:
            stack.append(char)
        else:
            if not stack or pairs[stack.pop()] != char:
                return False
    
    return len(stack) == 0""",
                "language": "Python",
                "explanation": "Stack approach. Time: O(n), Space: O(n)",
                "is_public": True,
            },
            {
                "task_name": "Maximum Subarray",
                "code": """def maxSubArray(nums):
    max_sum = current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum""",
                "language": "Python",
                "explanation": "Kadane's algorithm. Time: O(n), Space: O(1)",
                "is_public": True,
            },
            {
                "task_name": "Maximum Subarray",
                "code": """class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];
        
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        
        return maxSum;
    }
}""",
                "language": "Java",
                "explanation": "Kadane's algorithm implementation. Time: O(n), Space: O(1)",
                "is_public": True,
            },
            {
                "task_name": "Longest Palindromic Substring",
                "code": """def longestPalindrome(s):
    def expandAroundCenter(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return s[left + 1:right]
    
    longest = ""
    for i in range(len(s)):
        odd = expandAroundCenter(i, i)
        even = expandAroundCenter(i, i + 1)
        longest = max(longest, odd, even, key=len)
    return longest""",
                "language": "Python",
                "explanation": "Expand around center approach. Time: O(n^2), Space: O(1)",
                "is_public": True,
            },
            {
                "task_name": "Binary Tree Inorder Traversal",
                "code": """class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        inorder(root, result);
        return result;
    }
    
    private void inorder(TreeNode node, List<Integer> result) {
        if (node != null) {
            inorder(node.left, result);
            result.add(node.val);
            inorder(node.right, result);
        }
    }
}""",
                "language": "Java",
                "explanation": "Recursive inorder traversal. Time: O(n), Space: O(h)",
                "is_public": True,
            },
            {
                "task_name": "Binary Tree Inorder Traversal",
                "code": """def inorderTraversal(root):
    result = []
    
    def inorder(node):
        if node:
            inorder(node.left)
            result.append(node.val)
            inorder(node.right)
    
    inorder(root)
    return result""",
                "language": "Python",
                "explanation": "Recursive solution. Time: O(n), Space: O(h)",
                "is_public": True,
            },
            {
                "task_name": "Merge Intervals",
                "code": """def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    
    for current in intervals[1:]:
        last = merged[-1]
        if current[0] <= last[1]:
            last[1] = max(last[1], current[1])
        else:
            merged.append(current)
    
    return merged""",
                "language": "Python",
                "explanation": "Sort and merge overlapping intervals. Time: O(n log n), Space: O(n)",
                "is_public": True,
            },
            {
                "task_name": "Coin Change",
                "code": """def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1""",
                "language": "Python",
                "explanation": "Dynamic programming approach. Time: O(amount * len(coins)), Space: O(amount)",
                "is_public": True,
            },
            {
                "task_name": "My Private Task",
                "code": """def privateSolution():
    return "This is a private solution"
""",
                "language": "Python",
                "explanation": "Private solution example",
                "is_public": False,
            },
        ]

        solutions = []
        for solution_data in solutions_data:
            task = next(
                (t for t in tasks if t.name == solution_data["task_name"]),
                None,
            )
            language = next(
                (l for l in languages if l.name == solution_data["language"]),
                None,
            )
            user = random.choice(users)

            if task and language:
                solution, created = models.Solution.objects.get_or_create(
                    task=task,
                    user=user,
                    language=language,
                    defaults={
                        "code": solution_data["code"],
                        "explanation": solution_data["explanation"],
                        "is_public": solution_data["is_public"],
                    },
                )
                if solution_data["is_public"]:
                    services.publish_solution(solution, make_public=True)
                solutions.append(solution)

        self.stdout.write(
            self.style.SUCCESS(f"✓ Created {len(solutions)} solutions")
        )
        return solutions

    def seed_reviews(self, users, solutions):
        """Create reviews for public solutions."""
        public_solutions = [s for s in solutions if s.is_public]

        reviews_created = 0
        for solution in public_solutions:
            reviewers = [u for u in users if u.id != solution.user_id]
            if not reviewers:
                continue

            num_reviews = random.randint(1, min(3, len(reviewers)))
            selected_reviewers = random.sample(reviewers, num_reviews)

            for reviewer in selected_reviewers:
                review_type = random.choice([0, 1])
                try:
                    services.create_review(
                        user=reviewer,
                        solution=solution,
                        review_type=review_type,
                    )
                    reviews_created += 1
                except ValueError:
                    pass

        self.stdout.write(
            self.style.SUCCESS(f"✓ Created {reviews_created} reviews")
        )
