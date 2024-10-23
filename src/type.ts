export type Rule = {
  id: string
  match(filePath: string): boolean
  render(filePath: string): Promise<string | undefined>
}
