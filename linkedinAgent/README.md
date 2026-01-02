# LinkdeinAgent

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Setup Environment Variables

To run the application, you need to configure environment variables. The project uses a script to automatically generate the environment file from environment variables.

### Local Development

1. Create a `.env` file in the root directory (copy from `.env.example` if available):
```bash
GOOGLE_API_KEY=your_google_api_key_here
API_URL=http://localhost:3000/api
NODE_ENV=development
```

2. The `environment.ts` file will be automatically generated when you run `npm start` or `npm run build`.

**Important:** Never commit your `.env` file or `environment.ts` with real API keys. These files are already in `.gitignore`.

### Environment Variables

- `GOOGLE_API_KEY` (required): Your Google Gemini API key
- `API_URL` (optional): Backend API URL (defaults to `http://localhost:3000/api` in development)
- `NODE_ENV`: Set to `production` for production builds


## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Deployment to Render

This project is configured for deployment on [Render](https://render.com).

### Prerequisites

1. A Render account
2. Your Google API key ready

### Deployment Steps

1. **Push your code to GitHub** (make sure `.env` and `environment.ts` are NOT committed)

2. **Connect to Render:**
   - Go to Render dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

3. **Configure Build Settings:**
   - **Name:** linkedin-agent (or your preferred name)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist/linkdeinAgent/browser`
   - **Environment:** Static Site

4. **Add Environment Variables in Render Dashboard:**
   - Go to your service → Environment
   - Add the following variables:
     - `GOOGLE_API_KEY`: Your Google Gemini API key
     - `API_URL`: (optional) Your backend API URL
     - `NODE_ENV`: `production`

5. **Deploy:**
   - Click "Create Static Site"
   - Render will build and deploy your application
   - Your environment variables will be securely injected during build

### Alternative: Using render.yaml

If you prefer using the `render.yaml` file:
1. The `render.yaml` file is already configured
2. In Render dashboard, select "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and use `render.yaml`
5. Make sure to set `GOOGLE_API_KEY` in the Render dashboard (it won't sync from the YAML for security)

### Security Notes

✅ **DO:**
- Set environment variables in Render dashboard (they're encrypted)
- Keep `.env` file local only
- Never commit API keys to git

❌ **DON'T:**
- Commit `.env` files
- Hardcode API keys in source code
- Share API keys publicly

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
