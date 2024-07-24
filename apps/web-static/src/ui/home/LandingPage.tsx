import AnimatedTitle from "@/ui/home/AnimatedTitle";
import CreateLinkBtn from "./CreateLinkBtn";
import Footer from "./Footer";
import TopMenu from "./TopMenu";
import Identity from "./Identity";

const LandingPage = () => {
  return (
    <>
      <Identity/>
      <TopMenu />
      <div className="responsive font-poppins-med mt-[150px] flex flex-row justify-evenly px-4 py-6">
        <div className="min-w-[150px] flex-1 py-10 pl-6 pr-10">
          <div className="text-5xl font-semibold leading-[60px]">
            <p>Trusted short links</p>
            <p>from public officers</p>
          </div>
          <div className="mt-4 text-[16px] leading-[24px]">
            <span className="font-inter-med rounded-[19px] bg-[#F1F5FF] px-2 py-1 text-[#2563EB]">
              go.gov.my
            </span>{" "}
            short links can only be created by public officers, so you can be
            sure it&apos;s from a trustworthy source.
          </div>
          <div className="responsive2 mt-4 flex flex-row">
            <CreateLinkBtn />
            <button className="bg-white-200 min-w-[130px] rounded px-4 py-2 text-[#000] shadow">
              Public Officer Sign in
            </button>
          </div>
        </div>
        <div className="relative min-h-[400px] min-w-[150px] flex-1 overflow-hidden rounded-[19px] bg-[#F4F4F5] px-6 py-10">
          <AnimatedTitle />
          <div className="secUrl absolute bottom-0 left-[20%]">
            <img src="images/home/sec-url.png" className="" />
          </div>
          <div className="secLink absolute left-[30%]">
            <img src="images/home/sec-link.png" className="" />
          </div>
          <div className="linkSecured absolute left-[30%] top-[-30%]">
            <img src="images/home/Success.png" className="" />
          </div>
          <div className="img-magnifier-container"></div>
        </div>
      </div>
      <div className="my-20 flex flex-row">
        <div className="flex-1 border-y-[0.5px] border-r-[0.5px]"></div>
        <div className="flex-[8] border-y-[0.5px] py-28">
          <div className="font-poppins-med text-center text-3xl font-semibold leading-[44px] text-[#18181B]">
            Created for public officers
          </div>
          <div className="font-inter-med text-center text-[14px]">
            with official email from
            <span className="rounded border-[1px] border-[#E4E4E7] px-1 mx-1 py-1 ">@mohe</span>
            .gov.my
          </div>
          <div className="responsive font-inter-med flex flex-row justify-between">
            <Card
              title="Anti-phishing"
              line1="Use go.gov.my to shorten links, ensuring they"
              line2="are trusted and official."
              img_path="images/home/thumbsup.png"
            />
            <Card
              title="Customized"
              line1="Shorten and share links to save space and "
              line2="make them easier to remember."
              img_path="images/home/customized.png"
            />
          </div>
          <div className="responsive flex flex-row justify-between">
            <Card
              title="File sharing"
              line1="Upload your file and share it with a trusted"
              line2="go.gov.my short link."
              img_path="images/home/filesharing.png"
            />
            <Card
              title="Analytics"
              line1="Track your link's click rate easily through our"
              line2="web interface."
              img_path="images/home/analytics.png"
            />
          </div>
        </div>
        <div className="flex-1 border-y-[0.5px] border-l-[0.5px]"></div>
      </div>
      <div className="mt-[150px]">
        <img src="images/home/GoGovMY.png" className="m-auto" />
        <div className="font-poppins-med text-center text-[36px] font-semibold leading-[44px]">
          Our performance so far
        </div>
        <div className="font-inter-med mt-[30px] text-center text-[14px] font-normal leading-[20px]">
          Here&apos;s the data and stats from our products
        </div>
        <div className="responsive flex flex-row p-6">
          <div className="mx-6 my-8 flex-1 items-center justify-center rounded-[16px] border-[0.5px] border-[#E4E4E7] p-8">
            <div className="flex flex-col items-center text-center">
              <Stats name="PUBLIC OFFICERS" img_path="images/home/GovMy.png" number="126,065" />
              <Stats name="LINKS CREATED" img_path="images/home/Link.png" number="7,875,789" />
              <Stats name="CLICKS SERVED" img_path="images/home/Vector.png" number="7,651,587" />
            </div>
          </div>
          <div className="mx-6 my-8 flex-[4] rounded-[16px] border-[0.5px] border-[#E4E4E7] p-8">
            <img src="images/home/chart.png" className="m-auto" />
          </div>
        </div>
      </div>
      <div className="mb-[70px] text-center">
        <div className="">
          <img
            src="images/home/GoGovMY.png"
            className="m-auto inline-block p-2"
          />
          <span className="font-poppins-med font-bold">GoGovMy</span>
        </div>
        <div className="font-poppins-med text-center text-[36px] font-semibold leading-[44px]">
          Official link for shortener for
        </div>
        <div className="font-poppins-med text-center text-[36px] font-semibold leading-[44px]">
          the Malaysian Government
        </div>
        <div className="mt-6 flex">
          <div className="m-auto">
            <CreateLinkBtn />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default LandingPage;

const Stats = ({ name, number, img_path }: { name: string; number: string; img_path: string }) => {
  return (
    <>
      <div className="leading-20px font-inter-med text-[14px] leading-[12px] tracking-[0.1rem] font-semibold text-[#2563EB] ">
        <div className="flex flex-row gap-4 items-center"><img src={img_path} />{name.toUpperCase()}</div>
        <div className="font-poppins-med mb-8 mt-2 text-[36px] font-semibold leading-[44px] text-left text-[#18181B]">
          {number}
        </div>
      </div>
    </>
  );
};

const Card = ({
  title,
  line1,
  line2,
  img_path,
}: {
  title: string;
  line1: string;
  line2: string;
  img_path: string;
}) => {
  return (
    <div className="font-inter-med my-10 flex-1">
      <div className="my-6">
        <img src={img_path} className="m-auto" />
      </div>
      <div className="my-2 text-center text-[16px] font-semibold leading-[24px] text-[#1D4ED8]">
        {title}
      </div>
      <div className="break-word my-2 text-center text-[14px] leading-[20px] text-[#27272A] font-normal">
        <p>{line1}</p>
        <p>{line2}</p>
      </div>
    </div>
  );
};
