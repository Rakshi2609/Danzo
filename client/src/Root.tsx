import React from "react";
import { TerminalSimulator } from "@/components/remocn/terminal-simulator";
import { CheckList } from "@/components/remocn/check-list";

export const items = [
  "Render on your own machine",
  "No watermark, ever",
  "Every component MIT",
  { text: "Ships as source", checked: false },
];

export const MyScene = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "2rem" }}>
    <CheckList
      items={items}
      width={820}
      fontSize={24}
      itemGap={18}
      closeGap={9}
      perStep={1.6}
      strokeWidth={3}
      color="#26242c"
      tickColor="#6f7f35"
      step={3}
    />
  </div>
);

export const TerminalSimulatorScene = () => (
  <TerminalSimulator
    lines={[
      { text: "npm run build", type: "command" },
      { text: "Compiled successfully", type: "success", delay: 14 },
    ]}
  />
);

export default MyScene;
