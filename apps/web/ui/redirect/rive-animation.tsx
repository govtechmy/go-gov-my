import {
  Alignment,
  Fit,
  Layout as RiveLayout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
// import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

const STATE_MACHINE_NAME = "single";

export default function GoGovAnim() {
  const { rive, RiveComponent } = useRive({
    src: "/gogov.riv",
    stateMachines: [STATE_MACHINE_NAME],
    artboard: "gogov", // Corrected syntax
    layout: new RiveLayout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  const bumpInput = useStateMachineInput(rive, "bumpy", "bump");

  return (
    <RiveComponent
      style={{ height: "1000px" }}
      onClick={() => bumpInput && bumpInput.fire()}
    />
  );
}
