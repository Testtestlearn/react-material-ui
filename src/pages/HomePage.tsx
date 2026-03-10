import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type FeatureItem = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
};

type HomePageProps = {
  featureData: FeatureItem[];
};

function HomePage({ featureData }: HomePageProps) {
  return (
    <>
      <Box
        component="section"
        sx={{
          border: "1px solid",
          borderColor: "secondary.light",
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          background:
            "linear-gradient(140deg, #fff6d9 0%, #ffd8b5 50%, #ffc9de 100%)",
          boxShadow: "0 18px 50px rgba(126, 68, 34, 0.22)",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: "primary.main",
          }}
        >
          Welcome
        </Typography>
        <Typography
          variant="h2"
          sx={{ mt: 1, fontSize: { xs: "2rem", md: "3.4rem" } }}
        >
          Jimmy Test
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2, maxWidth: "58ch" }}
        >
          This website is powered by React, Vite, and Material UI.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 3 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Features
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            href="https://react.dev"
            target="_blank"
            rel="noreferrer"
            size="large"
          >
            React Docs
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2} id="features" sx={{ mt: 2 }}>
        {featureData.map((feature) => (
          <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h5">{feature.title}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {feature.description}
                </Typography>
                {feature.ctaTo && feature.ctaLabel ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    component={RouterLink}
                    to={feature.ctaTo}
                    sx={{ mt: 2 }}
                  >
                    {feature.ctaLabel}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* <Grid size={{ xs: 12 }}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h4" mb={2}>
              Welcome to MUI
            </Typography>

            <Stack spacing={2} maxWidth={320}>
              <TextField label="Your name" />
              <Button variant="contained">Submit</Button>
            </Stack>
          </Box>
        </Grid> */}
      </Grid>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
        Built with Material UI theming. Learn more at{" "}
        <Link
          href="https://mui.com/material-ui/customization/theming/"
          target="_blank"
          rel="noreferrer"
        >
          mui.com/theming
        </Link>
        .
      </Typography>
    </>
  );
}

export default HomePage;
