import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import "./App.css";

function App() {
  return (
    <main className="home-page">
      <section className="hero">
        <p className="eyebrow">Welcome</p>
        <h1>Build faster with your new React website</h1>
        <p className="subtitle">
          This Home page is powered by React and Vite, ready for you to
          customize into a product site, portfolio, or business landing page.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#features">
            Explore Features
          </a>
          <a
            className="btn btn-secondary"
            href="https://react.dev"
            target="_blank"
            rel="noreferrer"
          >
            React Docs
          </a>
        </div>
      </section>

      <section id="features" className="features">
        <article className="feature-card">
          <h2>Fast Setup</h2>
          <p>
            Vite gives you instant startup and smooth updates while developing.
          </p>
        </article>
        <article className="feature-card">
          <h2>Reusable Components</h2>
          <p>
            Compose UI from small, maintainable pieces that grow with your app.
          </p>
        </article>
        <article className="feature-card">
          <h2>Production Ready</h2>
          <p>
            Run a single build command to create optimized assets for
            deployment.
          </p>
        </article>
        <Box p={4}>
          <Typography variant="h4" mb={2}>
            Welcome to MUI
          </Typography>

          <Stack spacing={2} maxWidth={300}>
            <TextField label="Your name" />
            <Button variant="contained">Submit</Button>
          </Stack>
        </Box>
      </section>
    </main>
  );
}

export default App;
