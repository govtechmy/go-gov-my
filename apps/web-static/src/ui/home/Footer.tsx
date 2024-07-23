const Footer = () => {
  return (
    <div className="responsive static bottom-0 flex min-h-[100px] flex-row items-center justify-between">
      <div className="flex flex-row gap-1 font-bold">
        <div>
          <img src="images/home/Jata Negara.png" />
        </div>
        <div className="">
          <div className="font-poppins-med">Government of Malaysia</div>
          <div className="font-inter-med text-[12px] font-medium leading-[18px] text-gray-500">
            © 2024 Government of Malaysia
          </div>
        </div>
      </div>
      <div className="">API docs Admin Login</div>
    </div>
  );
};

export default Footer;
