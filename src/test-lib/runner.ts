// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestRunnerVariables = { [name: string]: any }
export class TestRunner<Variables extends TestRunnerVariables> {
  private variables: Partial<Variables>

  constructor() {
    this.reset()
  }

  variable<Name extends string, Value extends Variables[Name]>(
    name: Name,
    value?: Value
  ): Value {
    if (value !== undefined) {
      this.variables[name] = value
    }
    if (value === undefined && this.variables[name] === undefined) {
      throw new Error(
        `TestRunner.variable(${name}) is not defined, please before set on use.`
      )
    }
    // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
    return this.variables[name]
  }

  reset() {
    this.variables = {}
  }
}

export function createRunner<V extends TestRunnerVariables>() {
  return new TestRunner<V>()
}
