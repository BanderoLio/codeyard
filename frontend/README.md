# Codeyard Frontend - MVP

Frontend приложение для Codeyard - платформы для хранения решений задач по программированию.

## Техническое задание

### Технологический стек

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **UI Components**: shadcn-ui (Radix UI)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Architecture**: Feature-Sliced Design (FSD)

### Архитектура проекта

Проект следует принципам Feature-Sliced Design:

```
frontend/
├── app/                    # Next.js App Router страницы
│   ├── auth/              # Страницы авторизации
│   ├── catalog/           # Страницы каталога
│   └── layout.tsx         # Root layout
├── components/             # Переиспользуемые UI компоненты
│   └── ui/               # shadcn-ui компоненты
├── features/             # Функциональные модули (FSD)
│   ├── auth/            # Модуль авторизации
│   │   ├── auth.api.ts  # API методы
│   │   ├── auth.store.ts # Zustand store
│   │   ├── components/  # Компоненты модуля
│   │   └── types/       # TypeScript типы
│   └── catalog/         # Модуль каталога
│       ├── catalog.api.ts
│       ├── components/
│       └── types/
├── lib/                  # Утилиты и конфигурация
│   ├── api-client.ts    # HTTP клиент с JWT
│   └── utils.ts
├── pages/                # Page компоненты (FSD)
├── shared/               # Общие провайдеры и утилиты
│   └── providers/       # React провайдеры
└── widgets/              # Композитные компоненты (FSD)
    ├── layouts/         # Layout компоненты
    └── navbar.tsx       # Навигационная панель
```

### Функциональные требования

#### 1. Авторизация

- **Регистрация** (`/auth/register`)
  - Форма с полями: username, email, password
  - Валидация через Zod
  - После успешной регистрации - автоматический вход

- **Вход** (`/auth/login`)
  - Форма с полями: username, password
  - Валидация через Zod
  - Сохранение access token в Zustand store
  - Refresh token хранится в HttpOnly cookie (управляется бэкендом)

- **Выход**
  - Очистка токенов и данных пользователя
  - Редирект на главную страницу

- **Автоматическое обновление токенов**
  - При 401 ошибке автоматический refresh через cookie
  - Обработка очереди запросов во время refresh

#### 2. Каталог задач (`/catalog`)

- **Список задач**
  - Отображение публичных задач (status: PUBLIC)
  - Карточки с названием, описанием, автором, датой
  - Пагинация

- **Поиск и фильтры**
  - Поиск по названию задачи (search)
  - Фильтр по категории
  - Фильтр по сложности
  - Комбинированные фильтры

- **Создание задачи** (`/catalog/create-task`)
  - Форма создания задачи (для авторизованных пользователей)
  - Поля: name, description, resource (URL), category, difficulty

#### 3. Страница задачи (`/catalog/[taskId]`)

- **Информация о задаче**
  - Название, описание, ссылка на оригинал
  - Категория и сложность

- **Список решений**
  - Разделение на "Мои решения" и "Публичные решения"
  - Для каждого решения:
    - Язык программирования
    - Код решения
    - Объяснение (если есть)
    - Автор и дата создания
    - Статус публичности

- **Создание решения**
  - Форма для авторизованных пользователей
  - Поля: language, code, explanation
  - Созданное решение по умолчанию приватное

- **Редактирование решения**
  - Только для автора решения
  - Редактирование кода и объяснения

- **Публикация решения**
  - Кнопка публикации для автора
  - При публикации решение становится видимым всем

- **Оценки решений**
  - Кнопки "Like" и "Dislike" для публичных решений других пользователей
  - Один отзыв на решение от пользователя
  - Отображение количества лайков/дизлайков

#### 4. Навигация

- **Navbar**
  - Логотип и название (ссылка на главную)
  - Для неавторизованных: кнопки Login и Sign Up
  - Для авторизованных: имя пользователя и кнопка Logout

- **Главная страница** (`/`)
  - Приветственный экран
  - Кнопки перехода в каталог и регистрации

### Технические детали

#### API Client

- Базовый URL: `process.env.NEXT_PUBLIC_API_BASE_URL` или `http://localhost:8000`
- Автоматическое добавление `Authorization: Bearer {token}` заголовка
- Обработка 401 ошибок с автоматическим refresh
- Поддержка cookies для refresh token
- Очередь запросов во время refresh

#### State Management

- **Zustand** для глобального состояния:
  - `authorization`: access token
  - `user`: данные текущего пользователя
- Persist в localStorage для authorization
- Селекторы через `withSelectors` для удобного доступа

#### Data Fetching

- **TanStack Query** для всех API запросов
- Автоматическая инвалидация кэша при мутациях
- Оптимистичные обновления где возможно
- Обработка состояний загрузки и ошибок

#### Формы

- **React Hook Form** для управления формами
- **Zod** для валидации схем
- Интеграция с shadcn-ui компонентами

#### UI Components

Все компоненты из shadcn-ui:
- Button, Input, Textarea, Select
- Dialog, Form, Label
- Spinner, Tooltip

Кастомные компоненты:
- FormItem (обертка для полей формы)
- IconButton
- CodeyardIcon

### Переменные окружения

Создайте `.env.local` в корне `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Установка и запуск

```bash
# Установка зависимостей
pnpm install

# Разработка
pnpm dev

# Сборка
pnpm build

# Продакшн
pnpm start
```

### Зависимости

Основные зависимости (см. `package.json`):
- `next`: 16.0.3
- `react`: 19.2.0
- `typescript`: ^5
- `tailwindcss`: ^4
- `@tanstack/react-query`: ^5.90.12
- `zustand`: ^5.0.9
- `axios`: ^1.13.2
- `react-hook-form`: ^7.68.0
- `zod`: ^4.1.13
- `@radix-ui/*`: UI примитивы

### Интеграция с бэкендом

#### Endpoints

- `POST /api/auth/login/` - вход
- `POST /api/auth/register/` - регистрация (если реализовано)
- `POST /api/auth/refresh/` - обновление токена
- `POST /api/auth/logout/` - выход
- `GET /api/categories/` - список категорий
- `GET /api/difficulties/` - список сложностей
- `GET /api/languages/` - список языков
- `GET /api/tasks/` - список задач (с фильтрами)
- `GET /api/tasks/{id}/` - детали задачи
- `POST /api/tasks/` - создание задачи
- `PATCH /api/tasks/{id}/` - обновление задачи
- `DELETE /api/tasks/{id}/` - удаление задачи
- `GET /api/solutions/` - список решений (с фильтрами)
- `GET /api/solutions/{id}/` - детали решения
- `POST /api/solutions/` - создание решения
- `PATCH /api/solutions/{id}/` - обновление решения
- `DELETE /api/solutions/{id}/` - удаление решения
- `POST /api/solutions/{id}/publish/` - публикация решения
- `GET /api/reviews/` - список отзывов
- `POST /api/reviews/` - создание отзыва

#### Формат ответов

Все списки возвращаются в формате пагинации:
```typescript
{
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

### Безопасность

- Access token хранится в памяти (Zustand store)
- Refresh token в HttpOnly cookie (управляется бэкендом)
- Автоматическая очистка токенов при logout
- Защита роутов через проверку авторизации
- Валидация всех пользовательских данных через Zod

### Производительность

- Server-side rendering через Next.js App Router
- Кэширование запросов через React Query
- Оптимистичные обновления UI
- Lazy loading компонентов где возможно
- Оптимизация изображений через Next.js Image

### Доступность

- Семантический HTML
- ARIA атрибуты через Radix UI
- Клавиатурная навигация
- Фокус-индикаторы

### Будущие улучшения

- [ ] Страница редактирования решения
- [ ] Страница создания задачи
- [ ] Профиль пользователя
- [ ] Социальная авторизация (GitHub, Google)
- [ ] Темная тема (уже настроена через next-themes)
- [ ] Мобильная адаптация
- [ ] Тесты (Jest + React Testing Library)
- [ ] Storybook для компонентов
