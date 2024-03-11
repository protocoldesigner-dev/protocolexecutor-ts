import { DefaultEvent } from "./types";

/**
 * One execution task
 */
export class ActionTask{
  /**
   * The event issued
   */
  private _event :DefaultEvent;
  /**
    * Finished promise
    */
  private _completeFuture: Promise<boolean>;
  /**
    * Accepted promise
    */
  private _accpetFuture: Promise<boolean>;

  constructor(event: DefaultEvent, accpetFuture: Promise<boolean>, completeFuture: Promise<boolean> ){
    this._event = event;
    this._completeFuture = completeFuture;
    this._accpetFuture   = accpetFuture;
  }

  /**
   * @returns the event accept promise
   */
  public async accepted():Promise<boolean>{
    return await this._accpetFuture;
  }

  /**
   * @returns the event finish promise
   */
  public async finished():Promise<boolean>{
    return await this._completeFuture;
  }
  get event(){
    return this._event;
  }



}
