import { AppTemplate, DefaultAppTemplate } from "../types/app-template.type";
import { AppMode } from "../types/app.type";

/**
 * Default templates for different application modes
 */
export const defaultAppTemplate: DefaultAppTemplate = {
  [AppMode.WORKFLOW]: {
    app: {
      mode: AppMode.WORKFLOW,
      enableSite: true,
      enableApi: false,
    }
  },
  [AppMode.COMPLETION]: {
    app: {
      mode: AppMode.COMPLETION,
      enableSite: true,
      enableApi: true,
    },
    modelConfig: {
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        mode: 'chat',
        completionParams: {},
      },
      prePrompt: '{{query}}',
      userInputForm: JSON.stringify([
        {
          paragraph: {
            label: 'Query',
            variable: 'query',
            required: true,
            default: '',
          },
        },
      ]),
    },
  },
  [AppMode.CHAT]: {
    app: {
      mode: AppMode.CHAT,
      enableSite: true,
      enableApi: true,
    },
    modelConfig: {
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        mode: 'chat',
        completionParams: {},
      },
    }
  },
}

export function getAppTemplate(mode: AppMode): Readonly<AppTemplate> {
  const template = defaultAppTemplate[mode];
  if (!template) {
    throw new Error(`No template found for mode: ${mode}`);
  }
  return template;
}
