import { LinkProps } from "@/lib/types";
import { Button, InfoTooltip, SimpleTooltipContent, Switch } from "@dub/ui";
import {
  FADE_IN_ANIMATION_SETTINGS,
  getParamsFromURL,
  paramsMetadata,
} from "@dub/utils";
import { motion } from "framer-motion";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export default function RefererBanSection({
  props,
  data,
  setData,
}: {
  props?: LinkProps;
  data: LinkProps;
  setData: Dispatch<SetStateAction<LinkProps>>;
}) {
  const [refererList, setRefererList] = useState<string[] | null>([]);
  const refererRef = useRef<HTMLInputElement>(null);

  const { url } = data;

  const params = useMemo(() => {
    console.log(getParamsFromURL(url));
    return getParamsFromURL(url);
  }, [url]);

  const [enabled, setEnabled] = useState(
    paramsMetadata.some((param) => params[param.key]),
  );

  useEffect(() => {
    setData({
      ...data,
      disallowedReferer: refererList ? refererList.join(",") : null,
    });
  }, [refererList]);

  useEffect(() => {
    if (enabled) {
      // if enabling, add refererlist into disallowedReferer
      setData({
        ...data,
        disallowedReferer: refererList ? refererList.join(",") : null,
      });
    } else {
      // if disabling, make disallowedReferer empty
      setData({ ...data, disallowedReferer: null });
    }
  }, [enabled]);

  return (
    <div className="relative border-b border-gray-200 pb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between space-x-2">
          <h2 className="text-sm font-medium text-gray-900">Referer Ban</h2>
          <InfoTooltip
            content={
              <SimpleTooltipContent
                title="Add Referer that will not be allowed to redirect from short link"
                cta="Learn more."
                href=""
              />
            }
          />
        </div>
        <Switch fn={() => setEnabled(!enabled)} checked={enabled} />
      </div>
      {enabled && (
        <motion.div className="mt-3 grid gap-2" {...FADE_IN_ANIMATION_SETTINGS}>
          <div className="">
            {refererList &&
              refererList.map((_, i) => {
                return <li key={`ref_${i}`}>{_}</li>;
              })}
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Referer Domain
          </label>
          <input
            type="text"
            ref={refererRef}
            placeholder="Eg: google will apply to all google domain"
          />
          <Button
            variant="secondary"
            text="Add Referer"
            onClick={() => {
              // CHECK IF ALREADY ADDED
              const toAdd = refererRef?.current?.value;
              if (!refererList) return;
              if (refererList.find((value) => value === toAdd)) return;
              if (toAdd && toAdd != "") {
                setRefererList([...refererList, toAdd]);
                refererRef.current.value = "";
              }
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
