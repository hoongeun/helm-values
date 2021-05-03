import {BaseContext, Context} from '../types'

export abstract class BaseOperator<T, U> {
  protected context: BaseContext;

  constructor(context: BaseContext) {
    this.context = context
  }

  abstract action(target: T): Promise<U>;
}

export abstract class Operator<T, U> extends BaseOperator<T, U> {
  protected context: Context;

  constructor(context: Context) {
    super(context)
    this.context = context
  }
}

export abstract class BatchOperator<T, U> extends Operator<T, U> {
  public abstract action(target: T): Promise<U>;

  public async batch(targets: T[]): Promise<U[]> {
    return Promise.all(
      targets.map((target: T) => {
        return this.action(target)
      }),
    )
  }
}
