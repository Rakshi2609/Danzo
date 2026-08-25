import { TerminalSimulator } from "@/components/remocn/terminal-simulator";

export const TerminalSimulatorScene = () => (
  <TerminalSimulator
    lines={[
      { text: "npm run build", type: "command" },
      { text: "Compiled successfully", type: "success", delay: 14 },
    ]}
  />
);

export default TerminalSimulatorScene;
