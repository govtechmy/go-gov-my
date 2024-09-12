"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import useLinks from "@/lib/swr/use-links";
import LinksContainer from "@/ui/links/links-container";
import { useAddEditLinkModal } from "@/ui/modals/add-edit-link-modal";
import { MaxWidthWrapper } from "@dub/ui";
import { Button } from "@dub/ui/src/button";
import { saveAs } from "file-saver/dist/FileSaver";
import { json2csv } from "json-2-csv";

export default function WorkspaceLinksClient() {
  const { AddEditLinkModal, AddEditLinkButton } = useAddEditLinkModal();
  const { messages } = useIntlClientHook();
  const { links, isValidating } = useLinks();

  const convertToCSV = async (data: object[]) => {
    const headers = [
      "id",
      "domain",
      "key",
      "url",
      "archived",
      "expiresAt",
      "expiredUrl",
      "passwordEnabledAt",
      "externalId",
      "banned",
      "trackConversion",
      "proxy",
      "title",
      "description",
      "image",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ios",
      "android",
      "geo.AL",
      "userId",
      "projectId",
      "publicStats",
      "clicks",
      "lastClicked",
      "createdAt",
      "updatedAt",
      "comments",
      "user.id",
      "user.name",
      "user.email",
      "user.emailVerified",
      "user.image",
      "user.agencyCode",
      "user.role",
      "user.createdAt",
      "user.subscribed",
      "tags",
      "shortLink",
      "tagId",
      "qrCode",
      "workspaceId",
    ];

    return json2csv(data, {
      keys: headers,
      parseValue(fieldValue, defaultParser) {
        if (fieldValue instanceof Date) {
          return fieldValue.toISOString();
        }
        return defaultParser(fieldValue);
      },
    });
  };

  const getShortDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const exportToCSV = async () => {
    try {
      const csv = links ? await convertToCSV(links) : "";
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const shortDate = getShortDate();
      saveAs(blob, `${shortDate}_links.csv`);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
    }
  };

  return (
    <>
      <AddEditLinkModal />
      <div className="flex h-36 items-center border-b border-gray-200 bg-white">
        <MaxWidthWrapper>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl text-gray-600">
              {messages?.dashboard?.Links}
            </h1>
            <div className="flex gap-2">
              <div>
                <AddEditLinkButton />
              </div>
              <div>
                <Button text="Export to CSV" onClick={exportToCSV} />
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
      <LinksContainer AddEditLinkButton={AddEditLinkButton} />
    </>
  );
}
