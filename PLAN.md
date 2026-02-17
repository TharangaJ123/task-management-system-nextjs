# Project Plan

## Phase 1 – Planning: Architecture, Security, & Tech Reasoning

### 1. Technical Reasoning & Stack Choice
For this Task Management System, I have chosen a unified **Next.js** full-stack approach.

*   **Framework (Next.js App Router):** 
    *   **Unified Development:** A single TypeScript codebase allows sharing types (interfaces, Zod schemas) between frontend and backend, reducing duplication and bugs.
    *   **Serverless Scalability:** API routes function as serverless endpoints, which are cost-effective and naturally scalable.
    *   **Performance:** Server Components and flexible rendering strategies (SSR/CSR) ensure a fast user experience.

*   **Database (MongoDB & Mongoose):**
    *   **Flexibility:** MongoDB's document model fits the hierarchical nature of tasks and user data.
    *   **Validation:** Mongoose provides a robust schema-based solution for data modeling and validation directly in the application layer.
    *   **Simplicity:** Easier to set up and iterate on compared to SQL migrations for a project of this scale.

*   **Styling (Tailwind CSS):**
    *   **Speed:** Utility-first CSS allows for rapid UI development without context switching to separate CSS files.
    *   **Consistency:** A predefined design system ensures visual consistency across the application.

### 2. High-Level Architecture

*   **Frontend Layer:** 
    *   Built with Next.js **Client Components** for interactive elements (Drag & Drop, Forms) and **Server Components** for data fetching.
    *   Uses **Context API** or component state for managing local UI state.

*   **API Layer:** 
    *   Next.js **Route Handlers** (`GET`, `POST`, `PUT`, `DELETE`) serve as the backend API.
    *   Endpoints are secured via middleware and handle business logic before interacting with the database.

*   **Data Persistence:** 
    *   **Mongoose ODM** connects to a MongoDB database.
    *   Schemas (`User`, `Task`) define the data structure and validation rules.

*   **Authentication Flow:**
    *   **JWT-based:** Access tokens (short-lived) and Refresh tokens (long-lived).
    *   **Stateless:** No server-side session storage; tokens contain all necessary claims.

### 3. Security Implementation
Security is designed into every layer of the application:

*   **Authentication & Authorization:** 
    *   **Bcrypt:** Industry-standard hashing for storing user passwords.
    *   **JWT (JSON Web Tokens):** Secure session management. Users can only access/modify their own data (Authorization checks in API routes).

*   **Secure Storage:**
    *   **HttpOnly Cookies:** Tokens are stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to prevent XSS (Cross-Site Scripting) attacks. They cannot be accessed by client-side JavaScript.

*   **Input Validation:** 
    *   **Zod:** All API requests (login, registration, task creation) are validated against strict Zod schemas to prevent malformed data and injection attacks.

*   **Middleware Protection:**
    *   Global middleware intercepts requests to protected routes, verifying the access token before allowing the request to proceed.

*   **Error Handling:**
    *   Global error catching ensures sensitive stack traces are not leaked to the client in production.
