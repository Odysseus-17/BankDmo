# Bckdbank

Aplicación bancaria hecha con Spring Boot, Spring Security y JWT para autenticación, gestión de cuentas y flujo de transacciones bancarias.

## Requisitos

- Java 17+
- Maven 3.9+
- MySQL 8+
- Postman o Thunder Client

## Ejecutar la aplicación

Desde la raíz del proyecto:

1. Abre una terminal.
2. Ejecuta:
   - Windows: `./mvnw spring-boot:run`
3. La API quedará disponible en:
   - `http://localhost:8080`

La aplicación usa MySQL. Por defecto se conecta a:

- Base de datos: `db_bank`
- Usuario: `root`
- Contraseña: `root`
- Servidor: `localhost:3306`

Puedes cambiar estos valores mediante las variables de entorno `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`.

## Swagger / OpenAPI

Con la aplicación ejecutándose, abre la documentación interactiva en:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Especificación OpenAPI: `http://localhost:8080/v3/api-docs`

Para probar endpoints protegidos desde Swagger:

1. Ejecuta primero `POST /api/v1/auth/login`.
2. Copia el valor de `token` de la respuesta.
3. Pulsa **Authorize**.
4. Pega el token sin comillas ni el prefijo `Bearer`.
5. Pulsa **Authorize** y luego **Close**.

También puedes compilar y ejecutar con:

- `./mvnw clean package`
- `java -jar target/bckdbank-0.0.1-SNAPSHOT.jar`

## Cómo probarla con Postman o Thunder Client

No se usa curl ni terminal para probar la API. Todas las pruebas se hacen por endpoint desde la interfaz del cliente HTTP.

### 1. Registrar un usuario

En Postman o Thunder Client crea una petición de tipo POST.

- URL: `http://localhost:8080/api/v1/auth/register`
- Body: raw JSON

```json
{
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@correo.com",
  "password": "123456"
}
```

Haz clic en Send.

Si todo sale bien, la respuesta devolverá un token JWT y el email del usuario registrado.

### 2. Iniciar sesión

Crea otra petición POST.

- URL: `http://localhost:8080/api/v1/auth/login`
- Body: raw JSON

```json
{
  "email": "ana@correo.com",
  "password": "123456"
}
```

La respuesta deberá incluir el token JWT. Copia ese valor.

### 3. Usar el token para las rutas protegidas

Para cualquier endpoint protegido:

- Ve a la pestaña Headers
- Agrega esta cabecera:

```http
Authorization: Bearer <TOKEN_GENERADO>
```

Ejemplo:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 4. Consultar cuentas del usuario autenticado

- Método: GET
- URL: `http://localhost:8080/api/v1/accounts`
- Headers:
  - `Authorization: Bearer <TOKEN_GENERADO>`

Haz clic en Send y revisa la respuesta.

### 5. Consultar una cuenta específica

- Método: GET
- URL: `http://localhost:8080/api/v1/accounts/{accountNumber}`
- Headers:
  - `Authorization: Bearer <TOKEN_GENERADO>`

Reemplaza `{accountNumber}` por el número devuelto al consultar las cuentas.

### 6. Registrar otro usuario

Para probar una transferencia, registra un segundo usuario y consulta su número de cuenta.

```json
{
  "firstName": "Luis",
  "lastName": "Pérez",
  "email": "luis@test.com",
  "password": "123456"
}
```

### 7. Realizar una transferencia

Inicia sesión con el usuario propietario de la cuenta de origen y usa su token.

- Método: POST
- URL: `http://localhost:8080/api/v1/transactions/transfer`
- Headers:
  - `Authorization: Bearer <TOKEN_GENERADO>`
  - `Content-Type: application/json`

```json
{
  "sourceAccountNumber": "CUENTA_ORIGEN",
  "destinationAccountNumber": "CUENTA_DESTINO",
  "amount": 250.00,
  "description": "Transferencia de prueba"
}
```

La cuenta de origen debe pertenecer al usuario autenticado y debe tener saldo suficiente.

### 8. Consultar el historial

- Método: GET
- URL: `http://localhost:8080/api/v1/transactions/account/{accountNumber}`
- Headers:
  - `Authorization: Bearer <TOKEN_GENERADO>`

El historial mostrará las transferencias asociadas a la cuenta indicada.

## Pruebas recomendadas por endpoint

### Registro

- POST `/api/v1/auth/register`
- Debe crear un usuario nuevo y asignarle una cuenta inicial.

### Login

- POST `/api/v1/auth/login`
- Debe devolver un token JWT válido.

### Cuentas

- GET `/api/v1/accounts`
- Debe devolver todas las cuentas del usuario actual.

- GET `/api/v1/accounts/{accountNumber}`
- Debe devolver los datos de una cuenta específica si pertenece al usuario autenticado.

### Transferencias

- POST `/api/v1/transactions/transfer`
- Debe descontar el monto de la cuenta de origen, sumarlo a la cuenta destino y registrar la transacción.

- GET `/api/v1/transactions/account/{accountNumber}`
- Debe devolver el historial de la cuenta autenticada.

## Datos de prueba sugeridos

Puedes crear varios usuarios para validar el flujo completo:

```json
{
  "firstName": "Luis",
  "lastName": "Pérez",
  "email": "luis@test.com",
  "password": "123456"
}
```

```json
{
  "firstName": "Maria",
  "lastName": "López",
  "email": "maria@test.com",
  "password": "123456"
}
```

## Solución de problemas

- Si aparece `401 Unauthorized`, revisa que el token esté bien enviado en el header `Authorization`.
- Si aparece `403 Forbidden`, verifica que Swagger o Postman esté usando el token correcto y que no tenga comillas. En Swagger, pega solo el token en **Authorize**.
- Si aparece `404 Not Found`, revisa que el número de cuenta exista y pertenezca al usuario autenticado.
- Si la app no arranca, revisa que Java 17 y MySQL estén instalados y ejecuta `./mvnw test` para verificar que el proyecto compila.

## Estructura principal del proyecto

```text
src/
  main/
    java/
      com/danidevbank/demo/
        config/
        controller/
        dto/
        entity/
        exception/
        repository/
        security/
        service/
  resources/
    application.yml
```

Los controladores principales son:

```text
controller/
  AuthController.java
  AccountController.java
  TransactionController.java
```

## Tecnologías usadas

- Java 17
- Spring Boot 4.1.0
- Spring Security
- JWT
- Spring Data JPA
- MySQL
- Swagger / OpenAPI

## Autor

Proyecto desarrollado para práctica de banca digital con Java y Spring Boot.
