# GCP Trivia Challenge

[![Live Demo](https://img.shields.io/badge/Live%20Demo-richardson--souza.github.io%2Fgcp--trivia%2F-blue?style=for-the-badge)](https://richardson-souza.github.io/gcp-trivia/)

This is a simple web-based trivia application focused on the Google Cloud Professional Data Engineer Practice Test, designed to help users test their knowledge and learn through detailed explanations.

## Features

*   **Interactive Quiz:** Answer multiple-choice questions on various GCP topics.
*   **Category Filtering:** Select specific categories to focus your study.
*   **Adjustable Question Count:** Choose how many questions you want to answer per session.
*   **Timer Option:** Challenge yourself with a timed quiz.
*   **Detailed Explanations:** Each question comes with a comprehensive explanation to deepen understanding.
*   **Audio Explanations:** Listen to audio explanations for selected questions.
*   **Responsive Design:** Works well on different screen sizes.
*   **Dark Mode:** Toggle between light and dark themes.
*   **Font Size Adjustment:** Customize the text size for better readability.

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/richardson-souza/gcp-trivia
    cd gcp-trivia
    ```
    (Replace `YOUR_USERNAME` with your GitHub username if you've forked the repository).

2.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser.

    **Note:** Due to browser security restrictions (CORS), directly opening `index.html` might prevent the `questions.json` file from loading. If you encounter issues, you can serve the files using a simple local web server:

    *   **Using Python:**
        ```bash
        python -m http.server 8000
        ```
        Then, open `http://localhost:8000` in your browser.

    *   **Using Node.js (if you have `http-server` installed):**
        ```bash
        npx http-server
        ```
        Then, open the address provided (e.g., `http://127.0.0.1:8080`).

## How to Deploy to GitHub Pages

This project is a static site, making it ideal for GitHub Pages.

1.  **Ensure your project is pushed to a GitHub repository.**

2.  **Go to your repository on GitHub.**

3.  **Navigate to "Settings"** (usually found near the top of the repository page).

4.  **In the left sidebar, click on "Pages".**

5.  **Under "Build and deployment":**
    *   For "Source", select "Deploy from a branch".
    *   For "Branch", select `main` (or the branch where your project files reside).
    *   Click "Save".

6.  **Access Your Site:** After a few minutes, GitHub Actions will build and deploy your site. The URL will typically be in the format `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`. You can find the exact URL in the "Pages" section of your repository settings once deployed.

## Support This Project

If you find this project helpful, please consider buying me a coffee!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/richardson.souza)

## Project Structure

*   `index.html`: The main HTML file for the application.
*   `style.css`: Custom CSS for additional styling.
*   `script.js`: JavaScript logic for the quiz functionality.
*   `questions.json`: JSON file containing all the trivia questions, options, correct answers, categories, and explanations.
*   `explanations/`: Directory containing detailed HTML explanations and audio files for each question.
*   `README.md`: This file.

---

Enjoy testing your GCP knowledge!
