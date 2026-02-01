# UFound

## Tech Stack

### Frontend
- **React** 19.0.0 - Modern UI library
- **Chakra UI** 3.8.0 - Component library for beautiful, accessible interfaces
- **React Router** 7.1.5 - Client-side routing
- **Axios** - HTTP client for API requests
- **Framer Motion** - Smooth animations
- **React Icons** & **Font Awesome** - Icon libraries

### Backend
- **Python** - Backend programming language
- **Redis** - Caching and session management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Project Structure

```
UFound/
├── frontend/          # React frontend application
├── Backend/           # Python backend services
├── docker-compose.yml # Docker services configuration
└── package.json       # Root package configuration
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.x
- Docker & Docker Compose (for containerized setup)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/UFoundApp/UFound.git
   cd UFound
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the frontend**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000)

### Docker Development

Run the entire stack using Docker Compose:

```bash
# Build containers
npm run docker:build

# Start all services
npm run docker:up

# Stop all services
npm run docker:down
```

## Available Scripts

In the project directory:

- `npm start` - Run frontend in development mode
- `npm run build` - Build frontend for production
- `npm test` - Run tests
- `npm run docker:build` - Build Docker containers
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

Project Link: [https://github.com/UFoundApp/UFound](https://github.com/UFoundApp/UFound)

---

Made with ❤️ by the UFound team
