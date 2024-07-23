import {
  Alignment,
  Fit,
  Layout as RiveLayout,
  useRive,
} from "@rive-app/react-canvas";

const STATE_MACHINE_NAME = "single";

const GogovAnim = () => {
  const { RiveComponent, rive } = useRive({
    src: "/images/gogov.riv",
    stateMachines: [STATE_MACHINE_NAME],
    artboard: "gogov", // Corrected syntax
    layout: new RiveLayout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  return <RiveComponent />;
};

export default GogovAnim;
