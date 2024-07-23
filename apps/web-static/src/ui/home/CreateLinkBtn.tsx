import { RiLink } from "react-icons/ri";

const CreateLinkBtn = () => {
  return (
    <>
      <button className="flex flex-row items-center justify-center gap-2 rounded-[5px] bg-[#2563EB] px-4 py-2 text-[#FFFFFF] shadow">
        <div>Create Link</div>
        <div>
          <RiLink />
        </div>
      </button>
    </>
  );
};

export default CreateLinkBtn;
