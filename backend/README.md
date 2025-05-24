# YouLead Backend

YouLead backend is a RESTful API built with Express.js and Firebase. It serves as the backend for the YouLead application, providing endpoints for user authentication, profile management, and other functionalities.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Firebase account
- Firebase project set up with Firestore and Authentication enabled
- Environment variables set up (see `.env.example`)
- `pnpm` suggested for package management

### Installation

1. Clone the repository:

   ```bash
    git clone https://github.com/Kirubel1422/YouLead.git
    cd YouLead/backend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:

   - Copy `.env.example` to `.env` and fill in the required values.
   - Ensure you have the Firebase service account key JSON file in YouLead/backend directory.

4. Start development the server:
   ```bash
    pnpm run dev
   ```
5. The server will run on `http://localhost:3000` by default.

### Usage

YouLead backend provides various endpoints for user management and other functionalities. You can use tools like Postman or cURL to test the API endpoints.

### Contributing

If you want to contribute to the YouLead backend, feel free to submit a pull request or open an issue. Contributions are welcome!
