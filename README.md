
# LPS Services — APP_COBRADORES

Sistema de cobro de peajes/vehículos basado en microservicios. El flujo principal es: el cobrador registra un vehículo → el sistema lo inspecciona con visión computacional → se procesa el cobro.

---

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| API Gateway | NestJS 11 + TypeScript |
| Microservicios (users, payments, logs) | NestJS 11 + TypeScript |
| Microservicio de inspección | Django 4.2 + Python |
| Mensajería | RabbitMQ |
| Base de datos (users, payments) | MySQL 8 |
| Base de datos (logs) | MongoDB 7 |
| Autenticación | JWT (Passport) |
| Visión computacional | YOLO8 + EasyOCR + PyTorch (MobileNetV3) |

---

## Arquitectura

```
Cliente (Postman / Angular / etc.)
        │
        ▼
   API Gateway :3000  (REST + JWT)
   ┌──────────────────────────────────┐
   │  POST /auth/login                │
   │  POST /auth/create_user          │
   │  POST /payments/crear_pago       │
   │  POST /inspection/inspeccionar   │
   │  GET  /me                        │
   │  GET  /logs                      │
   └──────────────────────────────────┘
        │  RabbitMQ
        ├──────────────► users_queue           → microservice-users
        ├──────────────► payments_queue        → microservice-payments
        ├──────────────► logs_queue            → microservice-logs
        └──────────────► vehicle_inspection_rpc → microservice-vehicle-inspection
```

---

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Login, retorna JWT |
| POST | `/auth/create_user` | — | Registra nuevo usuario |
| PATCH | `/auth/update_user/:id` | JWT | Actualiza datos de usuario |
| POST | `/auth/delete_user/:id` | JWT | Elimina usuario |
| GET | `/me` | JWT | Perfil del usuario autenticado |
| POST | `/payments/crear_pago` | JWT | Crea y persiste un pago |
| POST | `/inspection/inspeccionar` | — | Analiza imagen de vehículo (base64) |
| GET | `/logs` | JWT | Últimos 100 logs de error |

---

## Levantar con Docker Compose (recomendado)

```bash
# Copiar variables de entorno
cp api-gateway/.env.example api-gateway/.env
cp microservice-users/.env.example microservice-users/.env
cp microservice-payments/.env.example microservice-payments/.env
cp microservice-logs/.env.example microservice-logs/.env
cp microservice-vehicle-inspection/.env.example microservice-vehicle-inspection/.env

# Editar cada .env con los valores reales, luego:
docker compose up --build
```

El gateway queda disponible en `http://localhost:3000`.
El panel de RabbitMQ queda en `http://localhost:15672` (guest / guest).

---

## Desarrollo local (sin Docker)

### Requisitos previos

```bash
# RabbitMQ
docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# MySQL
docker run -d --name mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cobradores \
  mysql:8

# MongoDB
docker run -d --name mongo -p 27017:27017 mongo
```

### Arrancar cada servicio

```bash
# Copiar y editar .env de cada servicio primero, luego:

cd microservice-users && pnpm install && pnpm run start:dev
cd microservice-payments && pnpm install && pnpm run start:dev
cd microservice-logs && pnpm install && pnpm run start:dev
cd api-gateway && pnpm install && pnpm run start:dev

# Vehicle inspection (Python)
cd microservice-vehicle-inspection
pip install -r requirements.txt
python manage.py run_rpc
```

---

## Variables de entorno

Cada servicio tiene su propio `.env.example`. Las variables clave son:

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Secreto para firmar JWT (solo en api-gateway) |
| `RABBITMQ_URL` | URL de conexión a RabbitMQ |
| `DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME` | MySQL (users y payments) |
| `MONGO_URI` | URI de MongoDB (logs) |
| `CORS_ORIGIN` | Origen permitido para CORS (api-gateway) |

---

## Ejemplo de uso

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cobradores.com","password":"123456"}'
```

Respuesta:
```json
{ "access_token": "eyJ...", "user": { "id": 1, "email": "admin@cobradores.com", "name": "Admin" } }
```

### Crear pago (requiere token)

```bash
curl -X POST http://localhost:3000/payments/crear_pago \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150.00, "concept": "Peaje ruta 2"}'
```

### Inspeccionar vehículo

```bash
curl -X POST http://localhost:3000/inspection/inspeccionar \
  -H "Content-Type: application/json" \
  -d '{"imagenBase64": "<base64_string>"}'
```

Respuesta:
```json
{
  "ok": true,
  "data": {
    "vehicle_detected": true,
    "plate_detected": true,
    "plate_text": "AB123CD",
    "plate_confidence": 0.92,
    "is_blurry": false,
    "damage_detected": false
  }
}
```

---

## Crear un nuevo microservicio

```bash
nest new nombre-microservicio
cd nombre-microservicio
pnpm install @nestjs/microservices amqp-connection-manager amqplib dotenv
```

> Al crear el microservicio, si tiene su propio `.git`, eliminarlo para que quede bajo el repo principal:
> ```bash
> rm -rf nombre-microservicio/.git
> ```
