# Chat App

This is a real-time chat application built with Node.js, TypeScript, Prisma, and Express.

## Features

* User authentication and registration
* Contact management
* Real-time messaging with socket.io
* Message read receipts

## Getting Started

### Prerequisites

* Node.js and npm (or yarn) installed
* PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/profsam97/p2p-chat-server.git
```

2. Install dependencies:

```bash
cd chatapp
npm install
```

3. Set up the database:

* Create a PostgreSQL database.
* rename the .example.env file to `.env` then update the file with your database credentials and optionally the jwt secret.
navigate to the src folder then run the below command 
* Run the following commands:

```bash
npx prisma generate
npx prisma migrate dev
```

### Running the app

```bash
npm run dev
```

This will start the development server. After this is done, you can move on to start the frontend app at `http://localhost:3000` or any choice once you update the .env file.

## Usage

### Authentication

* Register a new account.
* Log in with your credentials.

### Contacts

* Add contacts to your contact list.
* View your existing contacts.

### Messaging

* Send and receive messages in real-time.
* View message read receipts.
* Search and directly message users

