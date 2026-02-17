# Task Management System (Next.js)

A modern, full-stack Task Management System built with **Next.js**, **MongoDB**, and **Tailwind CSS**. This application provides a seamless experience for users to manage their tasks with features like authentication, drag-and-drop organization, and productivity analytics.

## 🚀 Features

-   **User Authentication**: Secure sign-up and login using JWT (JSON Web Tokens) with access and refresh tokens.
-   **Task Management**: Create, read, update, and delete tasks.
-   **Drag & Drop Interface**: Organize tasks effortlessly by dragging them between statuses (Assigned, In Progress, Completed).
-   **Productivity Analytics**: Visualize your productivity with a 7-day trend chart of tasks created vs. completed.
-   **Responsive Design**: A fully responsive UI that works effectively on desktop and mobile devices.
-   **API Documentation**: Interactive API documentation using Swagger UI.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations).
-   **Backend**: Next.js API Routes (Serverless).
-   **Database**: [MongoDB](https://www.mongodb.com/) (accessed via [Mongoose](https://mongoosejs.com/)).
-   **Validation**: [Zod](https://zod.dev/) for robust schema validation.
-   **Charts**: [Recharts](https://recharts.org/) for analytics visualization.
-   **Icons**: [Lucide React](https://lucide.dev/).
-   **Documentation**: Swagger UI (`next-swagger-doc`, `swagger-ui-react`).

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB instance (Local or Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd task-management-system-nextjs
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_ACCESS_SECRET=your_access_token_secret
    JWT_REFRESH_SECRET=your_refresh_token_secret
    NEXT_PUBLIC_API_URL=http://localhost:3000
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the application:**
    Visit `http://localhost:3000` in your browser.

## 📚 API Documentation

The application includes interactive API documentation.
-   **Swagger UI**: [http://localhost:3000/api-doc](http://localhost:3000/api-doc)
-   **OpenAPI Spec**: [http://localhost:3000/api/doc](http://localhost:3000/api/doc)

### API Endpoints Overview

#### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account. |
| `POST` | `/api/auth/login` | Authenticate a user and receive JWT cookies. |

#### Tasks (`/api/tasks`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Retrieve all tasks for the authenticated user. |
| `POST` | `/api/tasks` | Create a new task. |
| `PUT` | `/api/tasks/[id]` | Update a task (title, status, due date, etc.). |
| `DELETE` | `/api/tasks/[id]` | Delete a task. |

#### Analytics (`/api/analytics`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics` | Get task productivity statistics for the last 7 days. |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
