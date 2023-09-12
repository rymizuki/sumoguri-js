// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Variables = { [name: string]: any }

export class TestVariables<V extends Variables> {
  private variables: Partial<V>

  constructor() {
    this.reset()
  }

  set<Name extends keyof V, Value extends V[Name] = V[Name]>(
    name: Name,
    value: Value
  ): void {
    this.variables[name] = value
  }

  get<Name extends keyof V, Value extends V[Name] = V[Name]>(
    name: Name
  ): Value {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.variables[name]
  }

  reset() {
    this.variables = {}
  }
}

export function createVariables<V extends Variables>() {
  return new TestVariables<V>()
}
