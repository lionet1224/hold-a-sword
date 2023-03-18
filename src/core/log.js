import { getType, padBoth } from '../utils/tools';

const DEFAULT_STYLE = {
  color: '#333',
  fontSize: '16px',
};

class Log {
  direct(msg = '', params = []) {
    // eslint-disable-next-line no-console
    console.log(msg, ...params);
  }

  log(msg = '', params = {}) {
    const logParams = this.getLogParams(msg, params);
    // eslint-disable-next-line no-console
    console.log(...logParams);
  }

  error(msg = '', params = {}) {
    const logParams = this.getLogParams(msg, params, {
      color: 'red',
    });
    // eslint-disable-next-line no-console
    console.error(...logParams);
  }

  // 人物说话
  chat(name = '', nameParams = {}, ...args) {
    if (!nameParams) {
      nameParams = {
        color: '#00ff',
        font: 'bold 12px',
        marginTop: '5px',
      };
    }

    this.section(
      {
        msg: `【${name}】：`.padEnd(8, ' '),
        ...nameParams,
      },
      [
        {
          type: 'defaultStyle',
          color: '#555',
          paddingTop: '5px',
          lineHeight: '20px',
        },
        ...args.map((item) => {
          if (getType(item) === 'String') return item.split('');

          return item;
        }).flat(),
      ],
    );
  }

  /**
   * 指令段落，用于显示指令
   * 输入：['指令1', '指令2', '指令3']
   * 输出：(1). 指令1
   *      (2). 指令2
   *      (3). 指令3
   */
  command(...args) {
    this.section(
      {
        type: 'defaultStyle',
        color: '#555',
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '5px',
        marginTop: '5px',
      },
      {
        msg: padBoth('指令列表', 40, '-'),
        color: '#999',
      },
      ...args,
      {
        msg: padBoth('结束', 40, '-'),
        color: '#999',
      },
    );
  }

  /**
   * 获取 log 的参数
   * @param {*} msg
   * @param {*} params
   */
  getLogParams(msg = '', params = {}, ...args) {
    const styleText = this.objectToText(params, ...args);

    return [`%c${msg}`, styleText];
  }

  objectToText(params = {}, ...args) {
    let styleText = '';
    const defaultStyle = {
      ...DEFAULT_STYLE,
      // 每一个args都是一个对象，越后的优先级越高
      ...args.reduce((result, item) => ({ ...result, ...item }), {}),
    };

    const style = Object.keys(params).reduce((result, key) => ({
      ...defaultStyle,
      ...result,
      [key]: params[key],
    }), {});
    Object.keys(style).forEach((key) => {
      if (key === 'msg') {
        return;
      }

      const value = style[key];
      key = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

      styleText += `${key}: ${value};`;
    });

    return styleText;
  }

  section(...args) {
    const logs = [];
    const params = [];
    let defaultStyle = {};

    // 判断数组中的第一项是否为对象，并判断type
    if (getType(args[0]) === 'Object') {
      const { type } = args[0];
      if (type === 'defaultStyle') {
        defaultStyle = {
          ...DEFAULT_STYLE,
          ...args[0],
        };
        args.shift();
      }
    }

    args.forEach((arg) => {
      const type = getType(arg);

      if (type === 'String') {
        arg = { msg: arg };
      }

      if (type === 'Array') {
        // 如果是数组，那么就是一个组合的log
        const log = [];
        let defaultStyle2 = {};

        // 判断数组中的第一项是否为对象，并判断type
        if (getType(arg[0]) === 'Object') {
          const { type } = arg[0];
          if (type === 'defaultStyle') {
            defaultStyle2 = {
              ...DEFAULT_STYLE,
              ...arg[0],
            };
            arg.shift();
          }
        }

        arg.forEach((item) => {
          if (getType(item) !== 'Object') {
            item = { msg: item };
          }

          const [msg, style] = this.getLogParams(item.msg, item, defaultStyle, defaultStyle2);
          log.push(msg);
          params.push(style);
        });
        logs.push(log);
      } else {
        const [msg, style] = this.getLogParams(arg.msg, arg, defaultStyle);
        logs.push(msg);
        params.push(style);
      }
    });

    this.direct(
      logs.map((log) => {
        if (getType(log) === 'Array') {
          return log.join('');
        }
        return log;
      }).join('\n'),
      params,
    );
  }
}

function createLogger() {
  return new Log();
}

export default createLogger;
