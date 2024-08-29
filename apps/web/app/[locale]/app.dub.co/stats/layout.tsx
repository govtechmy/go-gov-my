import { Footer, Nav } from "@dub/ui";
import Providers from "../(auth)/providers";

type Props = {
  children: React.ReactNode;
};

export default function StatsLayout(props: Props) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gray-50">
      <Providers>
        <Nav />
        {props.children}
        <Footer />
      </Providers>
    </div>
  );
}
