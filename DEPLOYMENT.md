# Deployment Guide

## Vercel Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

### Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to a GitHub repository.
2.  **Vercel Account**: Create an account on Vercel if you haven't already.

### Steps

1.  **Import Project**:
    *   Go to your Vercel dashboard and click "Add New..." -> "Project".
    *   Select your GitHub repository.

2.  **Configure Project**:
    *   **Framework Preset**: Vercel should automatically detect `Next.js`.
    *   **Root Directory**: Click "Edit" next to Root Directory and select `frontend`. This is crucial because the Next.js app lives in the `frontend` folder.
    *   **Environment Variables**: Expand the "Environment Variables" section. Add the following:
        *   `NEXT_PUBLIC_WC_PROJECT_ID`: Your WalletConnect Project ID (get one from [WalletConnect Cloud](https://cloud.walletconnect.com/)).

3.  **Deploy**:
    *   Click "Deploy".
    *   Vercel will build and deploy your application.

### Troubleshooting

*   **Build Failures**: Check the build logs in Vercel. Common issues include missing dependencies or type errors. Ensure `npm run build` passes locally.
*   **Network Issues**: If the wallet cannot connect, ensure the `NEXT_PUBLIC_WC_PROJECT_ID` is set correctly.

## Local Deployment

To run the project locally, you need **Node.js 20** or later.

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
