import obake from '../package.json';
import { execSync } from 'child_process';
import * as findUp from 'find-up';
import * as fs from 'fs';
import * as ejs from 'ejs';


// =============================================================================
//  GLOBAL ENVIRONMENT
// =============================================================================
declare namespace global {
  let obake: any;
}
const $default = Symbol.for('__obake_$default');
const $description = Symbol.for('__obake_$description');
const $version = Symbol.for('__obake_$version');
const $shell = (strings: TemplateStringsArray, ...values: any[]) => {
  return new Shell(strings.reduce((prev, curr) => {
    return prev += curr + (values.length ? values.shift() : '');
  }, ''));
};
global.obake = Object.assign(global, {
  $default: $default,
  $description: $description,
  $shell: $shell,
  $version: $version
});


// =============================================================================
//  TYPES
// =============================================================================
class Shell {
  readonly command: string;
  constructor(command: string) {
    this.command = command;
  }
};
type Config = { [key: string]: Value | Value[] };
type Callback = ((args: Arguments) => number | undefined);
type Value = string | Config | Shell | Callback;
type Arguments = {
  options: string[],
  commands: string[],
  rest: string[]
};


// =============================================================================
//  WORKDIR
// =============================================================================
const configPath = findUp.sync(`.obake`);
const config: Value = Object.assign({
  [$default]: $shell`echo The global config is not yet implemented`,
  [$version]: '0.0.0'
}, (() => {
  try { return require(configPath!).default; }
  catch (err) { return {}; }
})());
const workdir = process.cwd();
const argv = process.argv.slice(2);

const args: Arguments = {
  options: [],
  commands: [],
  rest: []
}
const patternOption = /^--([^-].+)$|^-([^-]+)$|^--$/;
const tableOption: {
  [key: string]: {
    shortForm?: string,
    description?: string
  }
} = {
  'quiet': {
    shortForm: 'q',
    description: 'Don\'t show flavor text before running command'
  },
  'init': {
    shortForm: 'i',
    description: 'Create default config file here'
  },
  'help': {
    shortForm: 'h',
    description: 'Show help (this message)'
  },
  'version': {
    shortForm: 'v',
    description: 'Show version number'
  },
  'desc': {
    shortForm: 'd',
    description: 'Get description text of specific command'
  }
};

enum Section { Options, Commands, Parameters }
let currentSection: Section = Section.Options;
for (const arg of argv) {
  switch (currentSection) {
    case Section.Options: {
      const m = arg.match(patternOption);
      if (m != null) {
        if (m[1]) args.options.push(m[1]);
        else if (m[2]) args.options.push(m[2]);
        else currentSection = Section.Parameters;
        break;
      } else currentSection = Section.Commands;
    }
    case Section.Commands: {
      if (arg == '--') {
        currentSection = Section.Parameters;
        break;
      }
      if (args.commands.reduce((prev: any, curr) => prev[curr], config).hasOwnProperty(arg)) {
        args.commands.push(arg);
        break;
      } else currentSection = Section.Parameters;
    }
    case Section.Parameters: {
      args.rest.push(arg);
    }
  }
}


// =============================================================================
//  COMMANDS
// =============================================================================
const isDefault = () => {
  const subconfig = args.commands.reduce((prev: any, curr) => prev[curr], config);
  return subconfig.hasOwnProperty($default);
};
const run = (value: Value | Value[]) => {
  switch (typeof value) {
    case 'object': {
      switch (true) {
        case value instanceof Shell: {
          const template = fs.readFileSync(`${__dirname}/../msg/command.ejs`, 'utf8');
          const flavors = JSON.parse(fs.readFileSync(`${__dirname}/../msg/flavors.json`, 'utf8'));
          const pattern = flavors[(args.commands.length == 0) ? 'default' : 'others'];
          process.stdout.write(ejs.render(template, {
            flavor: ejs.render(pattern[Math.floor(Math.random() * pattern.length)], {
              command: args.commands.join(' '),
              commandKebab: args.commands.join('-')
            })
          }));
          process.stdout.write('\n');
          try {
            process.stdout.write(execSync((value as Shell).command, { shell: process.env.SHELL }));
          } catch (err) {
            process.stderr.write(err.message.replace(err.stderr.toString(), ''));
            process.exit(err.status);
          }
        } break;
        case value instanceof Array: {
          for (const element of value as Value[])
            run(element);
        } break;
        default: {
          if (value.hasOwnProperty($default)) run((value as Config)[$default]);
          else throw Error('No default command defined');
        }
      }
    } break;
    case 'string': {
      if (!isDefault()) args.commands.pop();
      args.commands = args.commands.concat((value as string).split(' '));
      run(args.commands.reduce((prev: any, curr) => prev[curr], config));
    } break;
    case 'symbol': {
      throw Error(`Redirecting to a special entry is not allowed:\n\n  command: ${args.commands.join(' ')}\n  symbol: ${value.toString().slice(15, -1)}\n`);
    }
  }
};


// =============================================================================
//  OPTIONS
// =============================================================================
const isConfig = (value: Value) => {
  return ((typeof value == 'object') && !(value instanceof Shell) && !(value instanceof Array));
};
let willRun = true;
for (const option of args.options) {
  switch (option) {
    case 'help': {
      process.stdout.write(ejs.renderFile(`${__dirname}/../msg/help.ejs`, {
        obake: {
          version: obake.version
        },
        config: {
          exists: configPath != null,
          version: (config as Config)[$version],
          path: configPath
        },
        lines: {
          commands: (() => {
            const widthColumnCommand = Object.keys(config as Config).reduce((prev, curr) => {
              return (prev < curr.length) ? curr.length : prev;
            }, 0) + 2;
            return Object.keys(config as Config).map(key => {
              const value = ((config as Config)[key] as Config)[$description];
              const desc = isConfig(config) ?
                ((value != undefined) ?
                  value : (config as Config)[$default]) :
                `${config}`;
              return `${key.padEnd(widthColumnCommand, ' ')}${desc}`;
            });
          })(),
          options: (() => {
            const widthColumnOption = Object.keys(tableOption).reduce((prev, curr) => {
              return (prev < `--${curr}`.length) ? `--${curr}`.length : prev;
            }, 0) + 2;
            return Object.keys(tableOption).sort().map(key => {
              const value = tableOption[key].description;
              const desc = (value != undefined) ? value : '';
              return `${`--${key}`.padEnd(widthColumnOption, ' ')}${desc}`;
            });
          })(),
        }
      }, (err, str?) => str!));
      process.stdout.write('\n');
      willRun = false;
    } break;
    default: {
      process.stderr.write(`The option is not yet implemented: --${option}`);
      process.exit(1);
    }
  }
}

if (willRun) run(args.commands.reduce((prev: any, curr) => prev[curr], config));