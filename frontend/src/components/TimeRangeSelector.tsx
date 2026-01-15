import React from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
} from "@mui/material";
import { AccessTime } from "@mui/icons-material";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (timeRange: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const timeRanges = [
    { value: "1h", label: "Last Hour" },
    { value: "24h", label: "Last 24h" },
    { value: "7d", label: "Last 7 Days" },
  ];

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, sm: 2 },
        flexWrap: { xs: "wrap", sm: "nowrap" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <AccessTime
          sx={{
            fontSize: { xs: "1rem", sm: "1.25rem" },
            color: "primary.main",
            flexShrink: 0,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.8rem", sm: "0.95rem" },
            whiteSpace: "nowrap",
          }}
        >
          Time Range
        </Typography>
      </Box>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        sx={{
          width: { xs: "100%", sm: "auto" },
          "& .MuiToggleButton-root": {
            borderRadius: 2,
            px: { xs: 1, sm: 1.5, md: 2 },
            py: { xs: 0.6, sm: 0.75 },
            fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
            fontWeight: 500,
            border: "1px solid rgba(0, 0, 0, 0.12)",
            flex: { xs: 1, sm: "auto" },
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "white",
              borderColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            },
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          },
        }}
      >
        {timeRanges.map((range) => (
          <ToggleButton
            key={range.value}
            value={range.value}
            sx={{ textTransform: "none" }}
          >
            {range.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
