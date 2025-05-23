import { Hr, Tailwind, Text } from '@react-email/components';
import { Fragment } from 'react';

export default function Footer({ email }: { email: string }) {
  return (
    <Tailwind>
      <Fragment>
        <Hr className="mx-0 my-6 w-full border border-gray-200" />
        <Text className="text-[12px] leading-6 text-gray-500">
          This email was intended for <span className="text-black">{email}</span>. If you were not
          expecting this email, you can ignore this email. If you are concerned about your
          account&apos;s safety, please raise an issue at{' '}
          <a href="https://github.com/govtechmy/go-gov-my/issues">GitHub Issues</a>.
        </Text>
      </Fragment>
    </Tailwind>
  );
}
