# RUGFI-FT

RUGFI-FT es una aplicación web para monitorear y detectar tokens potencialmente riesgosos en la blockchain de Ethereum.

## Características

- 🔍 Monitoreo en tiempo real de nuevos tokens
- 🚨 Detección de potenciales rug pulls
- 🔐 Autenticación segura con Privy
- 💼 Integración de wallet embebida
- 📱 Interfaz responsive y moderna

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS
- Privy (Autenticación y Wallet)
- Socket.IO (Comunicación en tiempo real)

## Configuración

1. Clona el repositorio:
```bash
git clone https://github.com/1Eliaaaan/rugfi-ft.git
cd rugfi-ft
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
VITE_PRIVY_APP_ID=tu-privy-app-id
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## Licencia

[MIT](LICENSE)
