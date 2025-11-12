import { RestrictModel } from "@/ai/model_runtime/entities/configuration.entity";
import { ModelType } from "@/ai/model_runtime/enums/model-runtime.enum";

export const GPT_4_MODELS = [
  "gpt-4",
  "gpt-4-turbo-preview",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-1106-preview",
  "gpt-4-0125-preview"
].join(',');

export const GPT_3_5_MODELS = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-16k",
  "gpt-3.5-turbo-16k-0613",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-0613",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-instruct"
].join(',');

export const DAVINCI_MODELS = [
  "text-davinci-003"
].join(',');

export const OPENAI_TRIAL_MODELS = [
  ...GPT_3_5_MODELS.split(',')
].join(',');

export const OPENAI_PAIED_MODELS = [
  ...GPT_3_5_MODELS.split(','),
  ...GPT_4_MODELS.split(','),
  ...DAVINCI_MODELS.split(','),
].join(',');

export const AZURE_TRIAL_MODELS: RestrictModel[] = [
  new RestrictModel('gpt-4', ModelType.LLM, 'gpt-4'),
  new RestrictModel('gpt-4o', ModelType.LLM, 'gpt-4o'),
  new RestrictModel('gpt-4o-mini', ModelType.LLM, 'gpt-4o-mini'),
  new RestrictModel('gpt-4-32k', ModelType.LLM, 'gpt-4-32k'),
  new RestrictModel('gpt-4-1106-preview', ModelType.LLM, 'gpt-4-1106-preview'),
  new RestrictModel('gpt-4-vision-preview', ModelType.LLM, 'gpt-4-vision-preview'),
  new RestrictModel('gpt-35-turbo', ModelType.LLM, 'gpt-35-turbo'),
  new RestrictModel('gpt-35-turbo-1106', ModelType.LLM, 'gpt-35-turbo-1106'),
  new RestrictModel('gpt-35-turbo-instruct', ModelType.LLM, 'gpt-35-turbo-instruct'),
  new RestrictModel('gpt-35-turbo-16k', ModelType.LLM, 'gpt-35-turbo-16k'),
  new RestrictModel('text-davinci-003', ModelType.LLM, 'text-davinci-003'),
  new RestrictModel('text-embedding-ada-002', ModelType.TEXT_EMBEDDING, 'text-embedding-ada-002'),
  new RestrictModel('text-embedding-3-small', ModelType.TEXT_EMBEDDING, 'text-embedding-3-small'),
  new RestrictModel('text-embedding-3-large', ModelType.TEXT_EMBEDDING, 'text-embedding-3-large'),
];



