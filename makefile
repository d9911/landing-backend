# Декларируем абсолютно все цели как виртуальные, чтобы избежать конфликтов с именами файлов
.PHONY: install i clean-ports dev-backend dev-frontend dev build lint init-env _run-backend _run-frontend

# Конфигурационные порты экосистемы
BACKEND_PORT=3001
FRONTEND_PORT=5173

# 1. Автоматическая подготовка окружения перед стартом
init-env:
	@echo "📝 Проверка конфигурационных файлов .env..."
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env 2>/dev/null || \
		echo "PORT=$(BACKEND_PORT)\nOWNER_EMAIL=test@d9911.org\nSMTP_HOST=smtp.mailtrap.io\nSMTP_PORT=2525\nSMTP_SECURE=false" > backend/.env; \
		echo "✅ Создан дефолтный backend/.env"; \
	else \
		echo "👉 Файл backend/.env уже существует."; \
	fi

# 2. Установка зависимостей всех слоев одной командой
install:
	@echo "📦 Устанавливаем зависимости бэкенда..."
	cd backend && yarn install
	@echo "📦 Устанавливаем зависимости фронтенда..."
	cd frontend && yarn install

i: install

# 3. Безопасное освобождение портов (перенаправляем лишний вывод в null)
clean-ports:
	@echo "🧹 Очищаем порты $(BACKEND_PORT) (Backend) и $(FRONTEND_PORT) (Frontend)..."
	-@npx --yes kill-port $(BACKEND_PORT) $(FRONTEND_PORT) > /dev/null 2>&1

# 4. Изолированный запуск API с нативным Hot Reload (--watch)
dev-backend: clean-ports init-env
	@echo "🚀 Запуск бэкенда в режиме разработки..."
	cd backend && node --watch src/app/server.js

# 5. Изолированный запуск клиентской части
dev-frontend:
	@echo "🚀 Запуск фронтенда (Vite)..."
	cd frontend && yarn run dev

# 6. Статический анализ проекта (ESLint, Prettier, Stylelint по ТЗ)
lint:
	@echo "🔍 Проверка качества и форматирования кода..."
	-cd backend && yarn run lint
	-cd frontend && yarn run lint

# 7. Production-сборка ассетов для деплоя
build:
	@echo "🏗️ Компиляция фронтенда в production-ready ассеты..."
	cd frontend && yarn run build

# 8. Fullstack запуск "в один клик" (с очисткой портов и проверкой env)
dev: clean-ports init-env
	@echo "⚡ Запуск Fullstack-экосистемы (Мастодонт РОП)..."
	@make -j2 _run-backend _run-frontend

# Внутренние таргеты параллельного стрима с флагом --watch
_run-backend:
	cd backend && node --watch src/app/server.js

_run-frontend:
	cd frontend && yarn run dev