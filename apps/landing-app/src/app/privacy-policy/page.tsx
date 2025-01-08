import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import Masthead from '@/components/Masthead';
import { URL_GITHUB } from '@/constants/urls';
import { URL_FIGMA } from '@/constants/urls';
import { extract, getLocaleFromURL, keypath } from '@/lib/i18n';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import React from 'react';
import Content from '@/components/privacy-policy/Content';

type Props = {
  searchParams: { locale?: string };
};
const MASTHEAD_BASE_PATH = "components.Masthead";
const HEADER_BASE_PATH = "components.Header";
const FOOTER_BASE_PATH = "components.Footer";


export default async function PrivacyPolicyPage({ searchParams }: Props) {
  const locale = getLocaleFromURL(
    new URL(`http://example.com?${new URLSearchParams(searchParams)}`),
  );
  unstable_setRequestLocale(locale);
  
  const t = await getTranslations();
const messages = await getMessages({ locale });
  

  return (
    <>
    <Masthead
        officialGovWebsiteKey={t(masthead.officialGovWebsiteKey)}
        howToIdentifyKey={t(masthead.howToIdentifyKey)}
        officialKey={t(masthead.officialKey)}
        notGovmyKey={t(masthead.notGovmyKey)}
        closeSiteKey={t(masthead.closeSiteKey)}
        secureKey={t(masthead.secureKey)}
        findLockKey={t(masthead.findLockKey)}
        orKey={t(masthead.orKey)}
        precautionKey={t(masthead.precautionKey)}
      />
      <Header signInKey={t(header.signInKey)} />
      <Content
        header={t('pages.Privacy.header')}
        yourPrivacy={{
          title: t('pages.Privacy.your_privacy'),
          description: t('pages.Privacy.your_privacy_desc'),
        }}
        collectedInfo={{
          title: t('pages.Privacy.collected_info'),
          description: t('pages.Privacy.collected_info_desc'),
        }}
        policyChange={{
          title: t('pages.Privacy.policy_change'),
          description: t('pages.Privacy.policy_change_desc'),
        }}
        personalData={{
          title: t('pages.Privacy.personal_data'),
          act: {
            title: t('pages.Privacy.personal_data_act'),
            description: t('pages.Privacy.personal_data_act_desc'),
          },
        }}
        policyAmendment={{
          title: t('pages.Privacy.policy_amendment'),
          description: t('pages.Privacy.policy_amendment_desc'),
        }}
        lastUpdate={t('pages.Privacy.last_update')}
      />
      <Footer
        ministry={extract(messages, "common.names.kd")}
        copyrightKey={t(footer.copyrightKey)}
        lastUpdateKey={t(footer.lastUpdateKey)}
        disclaimerKey={t(footer.disclaimerKey)}
        privacyPolicyKey={t(footer.privacyPolicyKey)}
        descriptionWithNewlines={extract(
          messages,
          "components.Footer.address",
        )}
        links={[
          {
            title: extract(messages, "components.Footer.links.title.openSource"),
            links: [
              {
                name: extract(messages, "components.Footer.links.name.figma"),
                href: URL_FIGMA,
              },
              {
                name: extract(messages, "components.Footer.links.name.github"),
                href: URL_GITHUB,
              },
            ],
          },
        ]}
      />
    </>
  );
} 

const masthead = {
  officialGovWebsiteKey: keypath(MASTHEAD_BASE_PATH, "official_gov_website"),
  howToIdentifyKey: keypath(MASTHEAD_BASE_PATH, "how_to_identify"),
  officialKey: keypath(MASTHEAD_BASE_PATH, "official"),
  notGovmyKey: keypath(MASTHEAD_BASE_PATH, "not_govmy"),
  closeSiteKey: keypath(MASTHEAD_BASE_PATH, "close_site"),
  secureKey: keypath(MASTHEAD_BASE_PATH, "secure"),
  findLockKey: keypath(MASTHEAD_BASE_PATH, "find_lock"),
  orKey: keypath(MASTHEAD_BASE_PATH, "or"),
  precautionKey: keypath(MASTHEAD_BASE_PATH, "precaution"),
};

const header = {
  signInKey: keypath(HEADER_BASE_PATH, "buttons.signIn"),
};

const footer = {
  copyrightKey: keypath(FOOTER_BASE_PATH, "copyright"),
  lastUpdateKey: keypath(FOOTER_BASE_PATH, "last_update"),
  disclaimerKey: keypath(FOOTER_BASE_PATH, "disclaimer"),
  privacyPolicyKey: keypath(FOOTER_BASE_PATH, "privacy_policy"),
};