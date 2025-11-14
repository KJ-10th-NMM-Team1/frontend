export enum SuggestionContext {
  Short = 0,
  SlightlyShorter = 1,
  Retranslate = 2,
  SlightlyLonger = 3,
  Long = 4,
}

export type SuggestionRequest = {
  segmentId: string
  context: SuggestionContext
}
