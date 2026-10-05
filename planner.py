"""Small, explainable planning engine used by the prototype.

The challenge prototype deliberately keeps the generation path deterministic so
it works during a demo without API keys.  The output schema is designed so that
an LLM can replace this module later without changing the interface.
"""

from __future__ import annotations

import re
from typing import Any


DOMAIN_RULES: list[tuple[tuple[str, ...], dict[str, Any]]] = [
    (
        ("habit", "routine", "streak", "goal"),
        {
            "name": "Momentum",
            "entity": "habit",
            "audience": "people building consistent daily routines",
            "value": "make small goals visible and easier to repeat",
            "tabs": ["Today", "Progress", "Profile"],
            "cards": ["Morning walk", "Read 20 minutes", "Drink water"],
        },
    ),
    (
        ("expense", "budget", "money", "finance"),
        {
            "name": "PocketLens",
            "entity": "expense",
            "audience": "students and young professionals tracking spending",
            "value": "turn daily expenses into a clear monthly picture",
            "tabs": ["Overview", "Activity", "Budgets"],
            "cards": ["Food & dining", "Transport", "Subscriptions"],
        },
    ),
    (
        ("study", "revision", "exam", "learn"),
        {
            "name": "FocusDeck",
            "entity": "study session",
            "audience": "students planning revision around deadlines",
            "value": "convert a syllabus into focused daily sessions",
            "tabs": ["Plan", "Focus", "Insights"],
            "cards": ["Machine Learning", "Operating Systems", "DSA practice"],
        },
    ),
    (
        ("fitness", "workout", "gym", "health"),
        {
            "name": "FormFlow",
            "entity": "workout",
            "audience": "people following simple, repeatable workout plans",
            "value": "plan workouts and make progress easy to understand",
            "tabs": ["Today", "Plans", "Progress"],
            "cards": ["Upper body", "Mobility", "Evening walk"],
        },
    ),
    (
        ("food", "meal", "recipe", "diet"),
        {
            "name": "MealMap",
            "entity": "meal",
            "audience": "busy people planning practical meals",
            "value": "reduce meal-planning effort with reusable weekly plans",
            "tabs": ["Today", "Discover", "Plan"],
            "cards": ["Quick breakfast", "Lunch prep", "Dinner ideas"],
        },
    ),
]

DEFAULT_DOMAIN = {
    "name": "IdeaFlow",
    "entity": "item",
    "audience": "people who need a simpler way to complete this task",
    "value": "turn a repeated problem into a clear mobile workflow",
    "tabs": ["Home", "Activity", "Profile"],
    "cards": ["Getting started", "Recent activity", "Next step"],
}


def _pick_domain(prompt: str) -> dict[str, Any]:
    lowered = prompt.lower()
    for keywords, domain in DOMAIN_RULES:
        if any(keyword in lowered for keyword in keywords):
            return domain.copy()
    return DEFAULT_DOMAIN.copy()


def _clean_idea(prompt: str) -> str:
    cleaned = re.sub(r"\s+", " ", prompt).strip()
    return cleaned[0].upper() + cleaned[1:] if cleaned else cleaned


def _stack(platform: str) -> dict[str, str]:
    if platform == "android":
        return {
            "client": "Kotlin + Jetpack Compose",
            "state": "ViewModel + StateFlow",
            "storage": "Room database",
            "testing": "JUnit + Compose UI tests",
        }
    if platform == "ios":
        return {
            "client": "Swift + SwiftUI",
            "state": "Observable + async/await",
            "storage": "SwiftData",
            "testing": "XCTest + UI tests",
        }
    return {
        "client": "Flutter + Dart",
        "state": "Riverpod",
        "storage": "SQLite via Drift",
        "testing": "Flutter test + integration_test",
    }


def _flutter_files(domain: dict[str, Any]) -> dict[str, str]:
    name = domain["name"]
    cards = domain["cards"]
    return {
        "lib/main.dart": f'''import 'package:flutter/material.dart';

void main() => runApp(const {name}App());

class {name}App extends StatelessWidget {{
  const {name}App({{super.key}});

  @override
  Widget build(BuildContext context) {{
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: '{name}',
      theme: ThemeData.dark(useMaterial3: true),
      home: const HomeScreen(),
    );
  }}
}}''',
        "lib/screens/home_screen.dart": f'''import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {{
  const HomeScreen({{super.key}});

  static const items = {cards!r};

  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(title: const Text('{name}')),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: items.length,
        itemBuilder: (context, index) => Card(
          child: ListTile(
            title: Text(items[index]),
            trailing: const Icon(Icons.chevron_right),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {{}},
        child: const Icon(Icons.add),
      ),
    );
  }}
}}''',
        "lib/models/app_item.dart": '''class AppItem {
  final String id;
  final String title;
  final bool completed;

  const AppItem({
    required this.id,
    required this.title,
    this.completed = false,
  });
}''',
    }


def _android_files(domain: dict[str, Any]) -> dict[str, str]:
    name = domain["name"]
    return {
        "MainActivity.kt": f'''package com.lunor.{name.lower()}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Text

class MainActivity : ComponentActivity() {{
    override fun onCreate(savedInstanceState: Bundle?) {{
        super.onCreate(savedInstanceState)
        setContent {{ Text("Welcome to {name}") }}
    }}
}}''',
        "ui/HomeScreen.kt": '''@Composable
fun HomeScreen(items: List<String>) {
    LazyColumn(contentPadding = PaddingValues(20.dp)) {
        items(items) { item ->
            ListItem(headlineContent = { Text(item) })
        }
    }
}''',
        "data/AppItem.kt": '''data class AppItem(
    val id: String,
    val title: String,
    val completed: Boolean = false
)''',
    }


def _ios_files(domain: dict[str, Any]) -> dict[str, str]:
    name = domain["name"]
    return {
        f"{name}App.swift": f'''import SwiftUI

@main
struct {name}App: App {{
    var body: some Scene {{
        WindowGroup {{ HomeView() }}
    }}
}}''',
        "Views/HomeView.swift": f'''import SwiftUI

struct HomeView: View {{
    let items = {domain["cards"]!r}

    var body: some View {{
        NavigationStack {{
            List(items, id: \\.self) {{ Text($0) }}
                .navigationTitle("{name}")
        }}
    }}
}}''',
        "Models/AppItem.swift": '''struct AppItem: Identifiable {
    let id: UUID
    var title: String
    var completed = false
}''',
    }


def build_blueprint(
    prompt: str,
    platform: str,
    experience: str,
    constraints: list[str],
) -> dict[str, Any]:
    domain = _pick_domain(prompt)
    stack = _stack(platform)
    idea = _clean_idea(prompt)

    if platform == "android":
        files = _android_files(domain)
    elif platform == "ios":
        files = _ios_files(domain)
    else:
        files = _flutter_files(domain)

    constraint_text = ", ".join(constraints) if constraints else "No special constraints yet"

    return {
        "meta": {
            "appName": domain["name"],
            "mode": "Explainable prototype engine",
            "platform": platform,
            "experience": experience,
        },
        "understand": {
            "summary": idea,
            "problem": f"The user needs a simpler way to {domain['value']}.",
            "audience": domain["audience"],
            "coreOutcome": f"A user can create, review, and act on one {domain['entity']} in under a minute.",
            "assumptions": [
                "The first version supports one primary user role.",
                "Account creation is optional until cloud sync is needed.",
                f"Constraints selected: {constraint_text}.",
            ],
            "questions": [
                "What is the single action users should complete most often?",
                "Which information must still work without internet?",
                "What would make a user return tomorrow?",
            ],
        },
        "plan": {
            "mvp": [
                f"Create and edit a {domain['entity']}",
                "Simple home dashboard with clear next actions",
                "Local persistence and basic progress state",
                "Accessible empty, loading, and error states",
            ],
            "later": [
                "Authentication and multi-device sync",
                "Smart recommendations based on usage",
                "Notifications with user-controlled timing",
            ],
            "stack": stack,
            "architecture": ["Mobile UI", "State layer", "Repository", "Local database", "Optional API"],
            "milestones": [
                {"name": "Clickable flow", "time": "Day 1"},
                {"name": "Local MVP", "time": "Days 2–3"},
                {"name": "Test & refine", "time": "Day 4"},
                {"name": "Deploy beta", "time": "Day 5"},
            ],
        },
        "build": {
            "files": files,
            "commands": ["Create the project", "Add local storage", "Run tests", "Build a release"],
        },
        "explain": {
            "decisions": [
                {
                    "title": "Start local-first",
                    "detail": "The core workflow stays useful without sign-in or a network connection.",
                },
                {
                    "title": f"Use {stack['client']}",
                    "detail": "It matches the selected platform while keeping the first version small.",
                },
                {
                    "title": "Separate UI from data",
                    "detail": "Screens remain simple while storage or APIs can change later.",
                },
            ],
            "tradeoffs": [
                "Local-first is faster to build, but cloud sync becomes a later migration.",
                "A focused MVP serves fewer use cases, but it is easier to test with real users.",
            ],
        },
        "learn": {
            "path": [
                {"step": 1, "title": "Understand the UI structure", "duration": "25 min"},
                {"step": 2, "title": "Build the first screen", "duration": "45 min"},
                {"step": 3, "title": "Connect state to the UI", "duration": "40 min"},
                {"step": 4, "title": "Save data locally", "duration": "50 min"},
                {"step": 5, "title": "Test one complete user flow", "duration": "35 min"},
            ],
            "nextConcept": "State management",
            "checkpoint": "Explain how one tap moves data from the UI to local storage.",
        },
        "preview": {
            "name": domain["name"],
            "eyebrow": "TODAY",
            "greeting": "Good afternoon",
            "subtitle": domain["value"].capitalize(),
            "tabs": domain["tabs"],
            "cards": domain["cards"],
            "primaryAction": f"Add {domain['entity']}",
        },
    }

