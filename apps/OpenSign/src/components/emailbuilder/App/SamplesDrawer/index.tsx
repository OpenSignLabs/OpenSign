import React from "react";
import { Divider, Drawer, Stack, Typography } from "@mui/material";
import { useSamplesDrawerOpen } from "../../documents/editor/EditorContext";
import SidebarButton from "./SidebarButton";

export const SAMPLES_DRAWER_WIDTH = 240;

export default function SamplesDrawer() {
  const samplesDrawerOpen = useSamplesDrawerOpen();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={samplesDrawerOpen}
      sx={{ width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0 }}
    >
      <Stack
        spacing={3}
        py={1}
        px={2}
        width={SAMPLES_DRAWER_WIDTH}
        justifyContent="space-between"
        height="100%"
      >
        <Stack
          spacing={2}
          sx={{
            "& .MuiButtonBase-root": {
              width: "100%",
              justifyContent: "flex-start"
            }
          }}
        >
          <Typography variant="h6" component="h1" sx={{ p: 0.75 }}>
            EmailBuilder
          </Typography>

          <Stack alignItems="flex-start">
            <SidebarButton href="#">Empty</SidebarButton>
            <SidebarButton href="#sample/requestemail">
              Request Email
            </SidebarButton>
            <SidebarButton href="#sample/completionemail">
              Completion Email
            </SidebarButton>
          </Stack>

          <Divider />
        </Stack>
      </Stack>
    </Drawer>
  );
}
