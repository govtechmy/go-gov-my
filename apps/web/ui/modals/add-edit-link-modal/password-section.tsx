import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { Eye, EyeOff } from '@/ui/shared/icons';
import { ProBadgeTooltip } from '@/ui/shared/pro-badge-tooltip';
import { SimpleTooltipContent, Switch } from '@dub/ui';
import { FADE_IN_ANIMATION_SETTINGS } from '@dub/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

type Props = {
  passwordEnabledAt: Date | null;
  onPasswordChange: (password: string) => void;
  /** Returns true if the password was successfully disabled */
  onPasswordDisable: () => boolean;
};

export default function PasswordSection({
  passwordEnabledAt,
  onPasswordChange,
  onPasswordDisable,
}: Props) {
  const { messages } = useIntlClientHook();
  const message = messages.modal;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const hasExistingPassword = !!passwordEnabledAt;
  const [enabled, setEnabled] = useState(hasExistingPassword);

  return (
    <div className="relative border-b border-gray-200 pb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between space-x-2">
          <h2 className="text-sm font-medium text-gray-900">
            Password Protection
          </h2>
          <ProBadgeTooltip
            content={
              <SimpleTooltipContent
                title="Restrict access to your short links by encrypting it with a password."
                cta="Learn more."
                href="https://github.com/govtechmy/go-gov-my/discussions"
              />
            }
          />
        </div>
        <Switch
          fn={(enabled: boolean) => {
            if (!enabled) {
              const sucessfullyDisabled = onPasswordDisable();
              if (!sucessfullyDisabled) {
                return;
              }
            }
            setEnabled(enabled);
          }}
          checked={enabled}
        />
      </div>
      {enabled && (
        <motion.div
          className="relative mt-3 rounded-md shadow-sm"
          {...FADE_IN_ANIMATION_SETTINGS}
        >
          <input
            name="password"
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="block w-full rounded-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
            value={password}
            placeholder={message?.enter_password}
            onChange={(e) => {
              setPassword(e.target.value);
              onPasswordChange(e.target.value);
            }}
            aria-invalid="true"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
            )}
          </button>
        </motion.div>
      )}
      {passwordEnabledAt && (
        <div className="mt-3 text-xs italic">
          Last updated:{' '}
          {new Date(passwordEnabledAt).toLocaleDateString('en-US')}
        </div>
      )}
    </div>
  );
}
