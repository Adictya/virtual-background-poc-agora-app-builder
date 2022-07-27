type Simplify<T> = T extends infer S ? {[K in keyof S]: S[K]} : never;
type NoneOf<T> = Simplify<{[K in keyof T]?: never}>;
type AtMostOneOf<T> =
  | NoneOf<T>
  | {[K in keyof T]: Simplify<Pick<T, K> & NoneOf<Omit<T, K>>>}[keyof T];

// export type TEventOptions = AtMostOneOf<IMessageOptions> & IEventOptions;

export type ToOptions = string | string[];

interface IEventPayloadBase {
  action?: any;
}

interface IEventPayloadWithoutAttributes extends IEventPayloadBase {
  level?: never;
  value: string;
}

interface IEventPayloadWithAttributes extends IEventPayloadBase {
  level: 2 | 3;
  value: string;
}

export type EventPayload =
  | IEventPayloadWithoutAttributes
  | IEventPayloadWithAttributes
  | Record<string, never>;

interface dataPayload {
  action: string;
  level: 1 | 2 | 3;
  value: string;
}
export enum EventSourceEnum {
  core = 'core',
  fpe = 'fpe',
}

type CbEventPayload = {
  payload: dataPayload;
  sender: string;
  ts: number;
  source: EventSourceEnum;
};
export type TCbListener = (args: CbEventPayload) => void;
