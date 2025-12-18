from django.db import migrations


def add_programming_languages(apps, schema_editor):
    ProgrammingLanguage = apps.get_model("catalog", "ProgrammingLanguage")

    languages = [
        "Python",
        "JavaScript",
        "TypeScript",
        "Java",
        "C++",
        "C",
        "C#",
        "Go",
        "Rust",
        "PHP",
        "Ruby",
        "Swift",
        "Kotlin",
        "Scala",
        "R",
        "MATLAB",
        "Perl",
        "Haskell",
        "Clojure",
        "Erlang",
        "Elixir",
        "Dart",
        "Lua",
        "Julia",
        "OCaml",
        "F#",
        "VB.NET",
        "Objective-C",
        "Assembly",
        "SQL",
        "HTML",
        "CSS",
        "Shell",
        "Bash",
        "PowerShell",
        "Racket",
        "Scheme",
        "Prolog",
        "Fortran",
        "COBOL",
        "Ada",
        "Delphi",
        "Pascal",
        "Smalltalk",
        "Lisp",
        "Groovy",
        "D",
        "Nim",
        "Crystal",
        "Zig",
        "V",
        "Elm",
        "Reason",
        "PureScript",
        "Idris",
        "Agda",
    ]

    for language_name in languages:
        ProgrammingLanguage.objects.get_or_create(name=language_name)


def reverse_add_programming_languages(apps, schema_editor):
    ProgrammingLanguage = apps.get_model("catalog", "ProgrammingLanguage")

    language_names = [
        "Python",
        "JavaScript",
        "TypeScript",
        "Java",
        "C++",
        "C",
        "C#",
        "Go",
        "Rust",
        "PHP",
        "Ruby",
        "Swift",
        "Kotlin",
        "Scala",
        "R",
        "MATLAB",
        "Perl",
        "Haskell",
        "Clojure",
        "Erlang",
        "Elixir",
        "Dart",
        "Lua",
        "Julia",
        "OCaml",
        "F#",
        "VB.NET",
        "Objective-C",
        "Assembly",
        "SQL",
        "HTML",
        "CSS",
        "Shell",
        "Bash",
        "PowerShell",
        "Racket",
        "Scheme",
        "Prolog",
        "Fortran",
        "COBOL",
        "Ada",
        "Delphi",
        "Pascal",
        "Smalltalk",
        "Lisp",
        "Groovy",
        "D",
        "Nim",
        "Crystal",
        "Zig",
        "V",
        "Elm",
        "Reason",
        "PureScript",
        "Idris",
        "Agda",
    ]

    ProgrammingLanguage.objects.filter(name__in=language_names).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0003_seed_initial_data"),
    ]

    operations = [
        migrations.RunPython(
            add_programming_languages, reverse_add_programming_languages
        ),
    ]
