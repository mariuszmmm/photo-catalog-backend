# Photo Catalog - Backend

The backend of the "Photo Catalog" application was built using Node.js and Express.js. It handles user authentication, data management, and storing photos.

## Application Components:
- **Backend:** Node.js with Express.js library.
- **Database:** MongoDB.

## Features:
- **Authentication:** Implemented using tokens and hashed passwords.
- **File Storage:** Photos are stored on the Railway server.
- **API:** Provides endpoints for managing the photo catalog and users.

## ⚙ Setup
To run the program from the 'photo-catalog-backend' repository on your local computer, you can follow these steps:

1. **Downloading the source code:**
   Clone the repository from the GitHub page to your local computer using the command:
   ```commandline
   git clone https://github.com/mariuszmmm/photo-catalog-backend.git
   ```

2. **Dependency Installation:**
   Navigate to the project directory, then install all required dependencies using a package manager like npm:
   ```commandline
   cd photo-catalog-backend
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory of the project and add the following environment variables:
   ```plaintext
   MONGODB_URI=<Your_MongoDB_URI>
   JWT_SECRET=<Your_JWT_Secret>
   ```

4. **Starting the server:**
   After configuring the environment variables, start the server using the command:
   ```commandline
   npm start
   ```

## Links:
- [Frontend Repository](https://github.com/mariuszmmm/photo-catalog)
- [Application Demo](https://mariuszmmm.github.io/photo-catalog/)

## Note:
To ensure the application works correctly, make sure you have the [frontend](https://github.com/mariuszmmm/photo-catalog) running.
