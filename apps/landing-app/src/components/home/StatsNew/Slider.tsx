import { createContext, useContext, useState } from 'react';

interface SliderContextType {
  play: boolean;
  setPlay: (play: boolean) => void;
}

const SliderContext = createContext<SliderContextType>({
  play: false,
  setPlay: () => null,
});

export function SliderProvider({ children }: { children: any }) {
  const [play, setPlay] = useState<boolean>(false);

  return (
    <SliderContext.Provider
      value={{
        play,
        setPlay,
      }}
    >
      {typeof children === 'function' ? children(play) : children}
    </SliderContext.Provider>
  );
}

export const useSlider = () => useContext(SliderContext);
