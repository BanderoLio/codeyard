# Codeyard - Store your code solutions with enjoy

# О чём продукт

Продукт позволяет решить проблему "разрозненности" решений задач по программированию по разным платформам (Решал на GfG, acmp.ru и т.д), но тяжело найти решение к задаче, т.к надо ее сначала найти на конкретной платформе, а потом там искать решение в интерфейсе платформы (если предоставляется). Решает это путем сохранения задач и решений к ним внутри себя. По сути, это личный “каталог задач” с возможностью хранить решение, объяснение и ссылки на источники. В дальнейшем может развиваться как в целом платформа для кодинга.

Минимальная структура моделей для mvp (неполная)

```
Модель: User
	username (charfield)

Модель: Category
	name (CharField)
	description (TextField)

Модель: Difficulty
	name (CharField)

Модель: ProgrammingLanguage
	name (CharField)

Модель: ProgrammingTask
	TextChoices: TaskStatus # PRIVATE | PUBLIC | HIDDEN

	name (CharField)
	name (CharField)
	description (TextField)
resource (URLField)
difficulty (ForeignKey(Difficulty))
category (ForeignKey(Category))
	added_by (ForeignKey(User))
	added_at (DateTimeField)
	status (EnumField(TaskStatus))

	UNIQUE (name, added_by_id)

Модель: Solution
	task (ForeignKey(ProgrammingTask))
	code (TextField)
language (ForeignKey(ProgrammingLanguage))
	explanation (TextField)
	user (ForeignKey(User))
added_at (DateTimeField)
is_public (BooleanField)
published_at (DateTimeField)

Модель:  Review
	IntegerChoices: ReviewType: NEGATIVE = 0; POSITIVE = 1

	type (EnumField(ReviewType))
	solution (ForeignKey(Solution))
	added_by (ForeignKey(User))

```

# Tech Stack

Backend:
Django, Django Rest Framework, Swagger, django-ratelimit
DB: Postgres,
В коде на backend должны быть реализованы:
REST API (с доками),
соответствие PEP-8 (в т.ч. длина строки не больше 79 символов)
type-safety,
безопасность продукта (защита от CSRF, XSS атак)
Separation of concerns
Бизнес логика должна находиться в сервисах, логика контроллеров отдельно.
База данных в 3НФ, с использованием индексов на важных полях поиска
Настроенный CORS для интеграции с frontend на React
Конфигурация через .env файлы (для dev и production)
Инструкция к запуску проекта в README.md

# Модули для минимального MVP-MVP:

## Авторизация

Должна быть доступна авторизация через JWT-токены с access и refresh токенами. Refresh точно должен храниться в HttpOnly, Secure (в продакшн env) и SameSite куки. С возможностью дальнейшей интеграции социальных провайдеров (github, google). Любой защищенный эндпоинт должен проверять корректность `accessToken`, выдавать Unauthorized если некорректен. Должно быть можно легко сделать эндпоинты защищенными и незащищенными.

## Решения

Публичные решения задачам могут просматривать любые пользователи, просматривать (приватные) и создавать (любые) свои только авторизированные. Свои существующие решения пользователь может редактировать. Решения должно быть можно искать по категории задачи, названию задачи (схожим по названию), сложности задачи.
Решения к задаче можно опубликовать (Если такая задача уже существует публично, решения будут добавлены к ней, иначе опубликована задача).
Решения других пользователей можно оценивать (1 раз)
