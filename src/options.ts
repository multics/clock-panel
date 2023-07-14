import { PanelOptionsEditorBuilder, dateTime, SelectableValue } from '@grafana/data';

import { ClockOptions, ClockMode, ClockType, FontWeight, ZoneFormat, ClockRefresh } from './types';
import { ColorEditor } from './ColorEditor';
import { getTemplateSrv } from '@grafana/runtime';
import { getTimeZoneNames } from 'utils';

export const optionsBuilder = (builder: PanelOptionsEditorBuilder<ClockOptions>) => {
  // Global options
  builder
    .addRadio({
      path: 'mode',
      name: '模式',
      settings: {
        options: [
          { value: ClockMode.time, label: '时间' },
          { value: ClockMode.countdown, label: '倒计时' },
          { value: ClockMode.countup, label: '计时' },
        ],
      },
      defaultValue: ClockMode.time,
    })
    .addRadio({
      path: 'refresh',
      name: '刷新',
      settings: {
        options: [
          { value: ClockRefresh.sec, label: '每秒刷新' },
          { value: ClockRefresh.dashboard, label: '跟随面板刷新' },
        ],
      },
      defaultValue: ClockRefresh.sec,
    })
    .addCustomEditor({
      id: 'bgColor',
      path: 'bgColor',
      name: '背景颜色',
      editor: ColorEditor,
      defaultValue: '',
    })
    .addBooleanSwitch({
      path: 'fontMono',
      name: 'Font monospace',
      defaultValue: false,
    });

  addCountdown(builder);
  addCountup(builder);
  addTimeFormat(builder);
  addTimeZone(builder);
  addDateFormat(builder);
};

//---------------------------------------------------------------------
// COUNTDOWN
//---------------------------------------------------------------------
function addCountdown(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Countdown'];

  builder
    .addTextInput({
      category,
      path: 'countdownSettings.endCountdownTime',
      name: '结束时间',
      settings: {
        placeholder: 'ISO 8601 or RFC 2822 Date time',
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endText',
      name: '结束文字',
      defaultValue: '00:00:00',
      showIf: (o) => o.mode === ClockMode.countdown,
    })

    .addTextInput({
      category,
      path: 'countdownSettings.customFormat',
      name: '自定义',
      settings: {
        placeholder: '可选',
      },
      defaultValue: undefined,
      showIf: (o) => o.mode === ClockMode.countdown,
    });
}

//---------------------------------------------------------------------
// COUNTUP
//---------------------------------------------------------------------
function addCountup(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Countup'];

  builder
    .addTextInput({
      category,
      path: 'countupSettings.beginCountupTime',
      name: '开始时间',
      settings: {
        placeholder: 'ISO 8601 or RFC 2822 Date time',
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.beginText',
      name: '开始文字',
      defaultValue: '00:00:00',
      showIf: (o) => o.mode === ClockMode.countup,
    })

    .addTextInput({
      category,
      path: 'countupSettings.customFormat',
      name: '自定义',
      settings: {
        placeholder: '可选',
      },
      defaultValue: undefined,
      showIf: (o) => o.mode === ClockMode.countup,
    });
}

//---------------------------------------------------------------------
// TIME FORMAT
//---------------------------------------------------------------------
function addTimeFormat(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['时间格式'];

  builder
    .addRadio({
      category,
      path: 'clockType',
      name: '时钟',
      settings: {
        options: [
          { value: ClockType.H24, label: '24 小时制' },
          { value: ClockType.H12, label: '12 小时制' },
          { value: ClockType.Custom, label: '自定' },
        ],
      },
      defaultValue: ClockType.H24,
    })
    .addTextInput({
      category,
      path: 'timeSettings.customFormat',
      name: '时间格式',
      settings: {
        placeholder: '',
      },
      defaultValue: undefined,
      showIf: (opts) => opts.clockType === ClockType.Custom,
    })
    .addTextInput({
      category,
      path: 'timeSettings.fontSize',
      name: '字体大小',
      settings: {
        placeholder: '20px',
      },
      defaultValue: '20px',
    })
    .addRadio({
      category,
      path: 'timeSettings.fontWeight',
      name: '字体粗细',
      settings: {
        options: [
          { value: FontWeight.normal, label: '正常' },
          { value: FontWeight.bold, label: '粗体' },
        ],
      },
      defaultValue: FontWeight.normal,
    });
}

function getVariableOptions() {
  return getTemplateSrv()
    .getVariables()
    .map((t) => {
      const value = '${' + t.name + '}';
      const info: SelectableValue<string> = {
        label: value,
        value,
        icon: 'arrow-right',
      };
      return info;
    });
}

//---------------------------------------------------------------------
// TIMEZONE
//---------------------------------------------------------------------
function addTimeZone(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['时区'];

  const timezones = getTimeZoneNames().map((n) => {
    return { label: n, value: n };
  });
  timezones.unshift({ label: '北京时间', value: '' });

  builder
    .addSelect({
      category,
      path: 'timezone',
      name: '时区选择',
      settings: {
        options: timezones,
        getOptions: async () => {
          const opts = getVariableOptions();
          if (opts.length) {
            return [...opts, ...timezones];
          }
          return timezones;
        },
      },
      defaultValue: '',
    })
    .addBooleanSwitch({
      category,
      path: 'timezoneSettings.showTimezone',
      name: '显示时区',
      defaultValue: false,
    })
    .addSelect({
      category,
      path: 'timezoneSettings.zoneFormat',
      name: '显示格式',
      settings: {
        options: [
          { value: ZoneFormat.name, label: 'Normal' },
          { value: ZoneFormat.nameOffset, label: 'Name + Offset' },
          { value: ZoneFormat.offsetAbbv, label: 'Offset + Abbreviation' },
          { value: ZoneFormat.offset, label: 'Offset' },
          { value: ZoneFormat.abbv, label: 'Abbreviation' },
        ],
      },
      defaultValue: ZoneFormat.offsetAbbv,
      showIf: (s) => s.timezoneSettings?.showTimezone,
    })
    .addTextInput({
      category,
      path: 'timezoneSettings.fontSize',
      name: '字体大小',
      settings: {
        placeholder: '20px',
      },
      defaultValue: '20px',
      showIf: (s) => s.timezoneSettings?.showTimezone,
    })
    .addRadio({
      category,
      path: 'timezoneSettings.fontWeight',
      name: '字体粗细',
      settings: {
        options: [
          { value: FontWeight.normal, label: '正常' },
          { value: FontWeight.bold, label: '粗体' },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: (s) => s.timezoneSettings?.showTimezone,
    });
}

//---------------------------------------------------------------------
// DATE FORMAT
//---------------------------------------------------------------------
function addDateFormat(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Date Options'];

  builder
    .addBooleanSwitch({
      category,
      path: 'dateSettings.showDate',
      name: '显示日期',
      defaultValue: false,
    })
    .addTextInput({
      category,
      path: 'dateSettings.dateFormat',
      name: '日期格式',
      settings: {
        placeholder: 'YYYY-MM-DD',
      },
      defaultValue: 'YYYY-MM-DD',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.locale',
      name: '地区',
      settings: {
        placeholder: 'zh_Hans',
      },
      defaultValue: '',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.fontSize',
      name: '字体大小',
      settings: {
        placeholder: '20px',
      },
      defaultValue: '20px',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addRadio({
      category,
      path: 'dateSettings.fontWeight',
      name: '字体粗细',
      settings: {
        options: [
          { value: FontWeight.normal, label: '正常' },
          { value: FontWeight.bold, label: '粗体' },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: (s) => s.dateSettings?.showDate,
    });
}
