# Construct Ease

Construct Ease is a comprehensive construction management web application designed for house owners, builders, architects, and interior designers.

## Project Structure

```text
Construct-Ease/
├── client/      # Angular Frontend Client
├── server/      # Node.js/Express Backend Server & Database Models
├── package.json # Root package.json for starting development processes
└── README.md    # Project documentation
```

## Setup & Running

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on `mongodb://localhost:27017/`)

### Quick Start
To install all dependencies and run the entire development stack (client and server concurrently):

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development environment:**
   ```bash
   npm run dev
   ```

This will concurrently:
- Start the backend Express server on **http://localhost:5000**
- Start the Angular client dev server on **http://localhost:4200**
