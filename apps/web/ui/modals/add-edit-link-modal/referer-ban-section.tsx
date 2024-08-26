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
  const isValidUrl = useMemo(() => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, [url]);

  const params = useMemo(() => {
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
    console.log("enabled", enabled);
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
          {/* {paramsMetadata.map(({ display, key, examples }) => (
            <div key={key} className="relative mt-1 flex rounded-md shadow-sm">
              <span className="flex w-60 items-center justify-center whitespace-nowrap rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                {display}
              </span>
              <input
                type="text"
                name={key}
                id={key}
                disabled={!isValidUrl}
                className={`${
                  isValidUrl ? "" : "cursor-not-allowed bg-gray-100"
                } block w-full rounded-r-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm`}
                placeholder={examples}
                value={params[key] || ""}
                onChange={(e) => {
                  setData({
                    ...data,
                    url: constructURLFromUTMParams(url, {
                      ...params,
                      [key]: e.target.value,
                    }),
                  });
                }}
              />
            </div>
          ))} */}
        </motion.div>
      )}
    </div>
  );
}
