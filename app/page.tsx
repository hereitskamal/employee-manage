"use client";

import { Box, Button, Container, Typography, Stack, Fade, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import SalaryChart from "./employees/SalaryChart";
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Home() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
        py: 10,
      }}
    >
      <Fade in timeout={1000}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 3,
            textAlign: "center",
            backgroundColor: "background.paper",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontFamily: "Poppins",
              color: "primary.main",
              letterSpacing: 1,
            }}
          >
            Welcome to the Employee Portal
          </Typography>

          <Typography variant="h6" component="p" sx={{ mb: 5, color: "text.secondary", lineHeight: 1.6 }}>
            Manage, track, and analyze your workforce efficiently—all in one unified dashboard.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/employees")}
              sx={{
                px: 5, py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                "&:hover": {
                  backgroundColor: "primary.dark",
                  boxShadow: "0 6px 18px rgba(25, 118, 210, 0.5)",
                },
              }}
              startIcon={<PeopleIcon />}
            >
              View Employees
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/employees")}
              sx={{
                px: 5, py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
              }}
              startIcon={<PersonAddIcon />}
            >
              Add Employee
            </Button>
          </Stack>

          <SalaryChart />
        </Paper>
      </Fade>
    </Box>
  );
}
