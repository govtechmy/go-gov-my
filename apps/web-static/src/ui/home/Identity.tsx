const Identity = () => {
    return (
        <div className="flex h-7 flex-col items-center justify-start gap-3 self-stretch bg-zinc-100 px-6">
        <div className="flex items-center justify-start gap-1.5 self-stretch py-1">
          <div className="relative h-5 w-5" />
          <div className="text-sm font-normal leading-none text-zinc-700 flex flex-row gap-2 items-center">
            <img src="/images/home/Malaysia_Flag.png" />An official Malaysian Government Website
          </div>
          <div className="flex items-center justify-start gap-0.5">
            <div className="text-sm font-normal leading-none text-blue-600">
              Here&apos;s how you know
            </div>
            <div className="relative h-4 w-4" />
          </div>
        </div>
      </div>
    );
  };
  export default Identity;
