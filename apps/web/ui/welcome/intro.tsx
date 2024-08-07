import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import { STAGGER_CHILD_VARIANTS } from "@dub/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Intro() {
  const router = useRouter();
  const { messages, locale } = useIntlClientHook();

  return (
    <motion.div
      className="z-10"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <div
        className={`animate-scaleBlur mt-[7vh] grid h-[50vh] w-screen place-items-center object-cover transition-all duration-1000`}
      >
        <Image
          src="/_static/logo.png"
          height={200}
          width={200}
          alt="App Logo"
        />
      </div>
      <motion.div
        variants={{
          show: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        initial="hidden"
        animate="show"
        className="mx-5 flex flex-col items-center space-y-10 text-center sm:mx-auto"
      >
        <motion.h1
          className="font-display text-4xl font-bold text-gray-800 transition-colors sm:text-5xl"
          variants={STAGGER_CHILD_VARIANTS}
        >
          {messages.welcome.welcome_to} {process.env.NEXT_PUBLIC_APP_NAME}
        </motion.h1>
        <motion.p
          className="max-w-md text-gray-600 transition-colors sm:text-lg"
          variants={STAGGER_CHILD_VARIANTS}
        >
          {`${process.env.NEXT_PUBLIC_APP_NAME} ${messages.welcome.welcome_desc}`}
        </motion.p>
        <motion.button
          variants={STAGGER_CHILD_VARIANTS}
          className="rounded-full bg-gray-800 px-10 py-2 font-medium text-white transition-colors hover:bg-black"
          onClick={() => router.push(`/${locale}/welcome?type=workspace`)}
        >
          {messages.welcome.get_started}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
