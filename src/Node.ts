import { Action } from "./Action";

/**
  * Node represents a stateful nodes in the protocol
  */
export class Node{
  /**
   * name
   */
  private _name:string;
  /**
   * states
   */
  private _states: Set<string>;
  /**
   * currentState
   */
  private _currentState :string;
  /**
   * all the actions of thie node
   */
  private _actions: Map<string, Action>;

  constructor(name :string, init :string, states :Set<string>){
    if(!states.has(init)) throw new Error(`invalid init state : ${init}`)
    this._name = name;
    this._currentState = init;
    this._states = states;

    this._actions = new Map();
  }


  public addAction(action: Action):void{
    if(!this._states.has(action.start)) throw new Error(`cannot add action ${action.name} to ${this.name}`)
    this._actions.set(action.name, action);
  }

  get name(){
    return this._name;
  }

  set currentState(state :string){
    this._currentState = state;
  }
  get currentState():string{
    return this._currentState;
  }

  /**
   * tranfter to new state
   */
  public transferTo(to :string):void{
    this._currentState= to;
  }
  public getAction(actionName :string):Action{
    const action = this._actions.get(actionName);
    if(action==null)throw new Error(`action not found: ${actionName}`)
    return action;
  }

  /**
   * get the all the actions signatures , which is in format:
   *   node_name:action_name:tag
   * where 
   *   - node_name   name of this node
   *   - action_name name of this action
   *   - tag         if positive '+' else '-'
   */
  public actionSignatures(): string[]{
    return Array.from(this._actions.values()).map(ac => ac.positive? `${this.name}:${ac.name}:+`: `${this.name}:${ac.name}:-`);
  }
  

}
