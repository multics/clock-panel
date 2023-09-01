import { css } from '@emotion/css';
import { Moment } from 'moment-timezone';
import React, { useMemo } from 'react';
import { ClockOptions } from 'types';

export function RenderDate({ options, now }: { options: ClockOptions; now: Moment }) {
  const { dateSettings } = options;

  const className = useMemo(() => {
    return css`
      font-size: ${dateSettings.fontSize};
      font-weight: ${dateSettings.fontWeight};
      margin: 0;
    `;
  }, [dateSettings]);

  const display = now.locale(dateSettings.locale || '').format(dateSettings.dateFormat);

  return (
    <span>
      <h3 className={className}>{display}</h3>
    </span>
  );
}
