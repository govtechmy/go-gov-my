import CreateLinkBtn from "./CreateLinkBtn";

const TopMenu = () => {
  return (
    <div className="responsive font-poppins-med flex min-h-[100px] flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2">
        <span>
          <img src="images/home/GoGovMY.png" />
        </span>
        <span className="font-bold">GoGovMy</span>
      </div>
      <div className="">
        <CreateLinkBtn />
      </div>
    </div>
  );
};

export default TopMenu;
