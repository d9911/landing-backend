# Декларируем абсолютно все цели как виртуальные
.PHONY: install i clean-ports dev-backend dev-frontend dev build lint init-env _run-backend _run-frontend prod _start-backend _start-frontend dev-w

# Конфигурационные порты экосистемы
BACKEND_PORT=3001
FRONTEND_PORT=5173

# 1. Автоматическая подготовка окружения перед стартом
init-env:
	@echo "📝 Проверка конфигурационных файлов .env..."
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env 2>/dev/null || \
		echo "PORT=$(BACKEND_PORT)\nOWNER_EMAIL=test@d9911.org\nSMTP_HOST=sandbox.smtp.mailtrap.io\nSMTP_PORT=2525\nSMTP_SECURE=false" > backend/.env; \
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

# 4. Изолированный запуск API (TypeScript + tsx)
dev-backend: clean-ports init-env
	@echo "🚀 Запуск бэкенда в режиме разработки..."
	cd backend && yarn run dev

# 5. Изолированный запуск клиентской части (Vite)
dev-frontend:
	@echo "🚀 Запуск фронтенда (Vite)..."
	cd frontend && yarn run dev

# 6. Статический анализ проекта
lint:
	@echo "🔍 Проверка качества и форматирования кода..."
	-cd backend && yarn run lint
	-cd frontend && yarn run lint

# 7. Production-сборка ассетов для деплоя
build:
	@echo "🏗️ Компиляция проекта в production-ready ассеты..."
	@echo "Сборка бэкенда (TS -> JS)..."
	cd backend && yarn run build
	@echo "Сборка фронтенда..."
	cd frontend && yarn run build

# 8. Fullstack запуск "в один клик" (с очисткой портов и проверкой env)
dev: clean-ports init-env
	@echo "⚡ Запуск Fullstack-экосистемы (режим разработки)..."
	@make -j2 _run-backend _run-frontend

# Внутренние таргеты параллельного стрима (Dev)
_run-backend:
	cd backend && yarn run dev

_run-frontend:
	cd frontend && yarn run dev

dev-w: clean-ports init-env
	@echo "⚡ Запуск Fullstack-экосистемы (режим разработки)..."
	@make -j2 _run-backend_win _run-frontend_win

_run-backend_win:
	cd backend && yarn run dev-w

_run-frontend_win:
	cd frontend && yarn run dev-w

# ---------------------------------------------------------
# НОВЫЙ БЛОК: ЗАПУСК В PRODUCTION (ПОСЛЕ БИЛДА)
# ---------------------------------------------------------

# 9. Локальная эмуляция Production-среды
prod: clean-ports init-env build
	@echo "🟢 Запуск скомпилированной Production-версии..."
	@make -j2 _start-backend _start-frontend

# Внутренние таргеты параллельного стрима (Prod)
_start-backend:
	cd backend && yarn run start

_start-frontend:
	cd frontend && yarn run preview

# 10. PM2 production runtime
pm2-start:
	@echo "🚀 Запуск приложения через PM2..."
	pm2 start ecosystem.config.js

pm2-stop:
	@echo "🛑 Остановка приложения в PM2..."
	pm2 delete ecosystem.config.js

pm2-logs:
	@echo "📜 Просмотр логов PM2..."
	pm2 logs

# Альтернативный production-запуск через PM2
prod-pm2: clean-ports init-env build
	@echo "🟢 Запуск скомпилированной Production-версии через PM2..."
	$(MAKE) pm2-start


# 	netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=192.168.1.249
windows:
	ip addr show eth0 | grep "inet "
	wsl -d Ubuntu
	sudo apt update && sudo apt install make nodejs npm -y
	npm install -g yarn
	make init
	make dev:init
	npx localtunnel --port 5173
	npx ngrok http 5173



port-wsl:
	netsh interface portproxy add v4tov4 listenport=3001 listenaddress=192.168.1.249 connectport=3001 connectaddress=172.25.225.109
	netsh interface portproxy add v4tov4 listenport=5173 listenaddress=192.168.1.249 connectport=5173 connectaddress=172.25.225.109
	netsh advfirewall firewall add rule name="WSL Backend 3001" dir=in action=allow protocol=TCP localport=3001
	netsh advfirewall firewall add rule name="WSL Frontend 5173" dir=in action=allow protocol=TCP localport=5173