import unittest

from planner import build_blueprint


class BlueprintPlannerTests(unittest.TestCase):
    def test_habit_prompt_creates_complete_blueprint(self) -> None:
        blueprint = build_blueprint(
            prompt="Build an offline habit tracker for students with streaks",
            platform="cross-platform",
            experience="beginner",
            constraints=["offline-first"],
        )

        self.assertEqual(blueprint["meta"]["appName"], "Momentum")
        self.assertEqual(blueprint["plan"]["stack"]["client"], "Flutter + Dart")
        self.assertIn("offline-first", blueprint["understand"]["assumptions"][2])
        self.assertEqual(len(blueprint["learn"]["path"]), 5)
        self.assertGreaterEqual(len(blueprint["build"]["files"]), 3)

    def test_platform_changes_recommended_stack(self) -> None:
        android = build_blueprint("Build a simple expense tracker", "android", "intermediate", [])
        ios = build_blueprint("Build a simple expense tracker", "ios", "intermediate", [])

        self.assertIn("Kotlin", android["plan"]["stack"]["client"])
        self.assertIn("Swift", ios["plan"]["stack"]["client"])


if __name__ == "__main__":
    unittest.main()
