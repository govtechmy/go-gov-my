import { useEffect, useState } from "react";
import { GoDotFill } from "react-icons/go";

const AnimatedTitle = () => {
  const slides = [
    {
      title: "Proceed",
      colour: "text-blue-500",
      bgColor: "bg-blue-100",
      image: "",
    },
    {
      title: "Beware of Phishing",
      colour: "text-red-600",
      bgColor: "bg-red-200",
      image: "",
    },
    {
      title: "Check your link",
      colour: "text-yellow-500",
      bgColor: "bg-yellow-100",
      image: "",
    },
    {
      title: "Ensure Secured",
      colour: "text-green-500",
      bgColor: "bg-green-200",
      image: "",
    },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animateTrigger, setAnimateTrigger] = useState(true); // css animation only triggers when state changes

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateTrigger((animateTrigger) => !animateTrigger);
      if (currentSlide >= slides.length - 1) {
        setCurrentSlide(0);
      } else {
        setCurrentSlide((currentSlide) => currentSlide + 1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <>
      <div
        className={`${animateTrigger ? "fadeInEffect" : "fadeInEffect-alt"}
                ${slides[currentSlide].colour} ${slides[currentSlide].bgColor} 
                flex w-fit flex-row items-center gap-1 rounded-[13px] px-4 py-2
            `}
      >
        <GoDotFill />
        {slides[currentSlide]?.title}
      </div>
    </>
  );
};
export default AnimatedTitle;
