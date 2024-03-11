import { Node } from "./Node";
import { DefaultEvent, EventHook, Jump } from "./types";

/**
 * Action represents Jump in the protocol. You can register hooks to this action/jump,
 * which will be invoked once event triggered
 * @see {@link ProtocolExecutor#registerHook}
 * @see {@link ProtocolExecutor#issueEvent}
 */
export class Action{
  /**
   * name
   */
  private _name  : string;
  /**
   * from state name
   */
  private _start : string;
  /**
   * target state name 
   */
  private _end   : string;

  /**
   * The registered hook
   * @see {@link ProtocolExecutor#registerHook}
   */
  private _hook  :  EventHook | null

  private _node: Node;
  /**
   * whether this event can be issued via {@link ProtocolExecutor.issueEvent }
   * If not, this event can only be triggered as cascades of other action
   */
  private _positive: boolean;

  /**
   * The cascaded actions to be triggered when this action is triggered.
   */
  private _cascades: Action[];

  private _cascadeNames :string[];

  constructor(jump: Jump, node :Node){
    this._name      = jump.name;
    this._start     = jump.fromStateName;
    this._end       = jump.toStateName;
    this._positive  = jump.positive;
    this._node      = node;

    this._cascades = [];
    this._cascadeNames = [];

    this._hook = null;
  }

  get name(){
    return this._name;
  }
  get positive(){
    return this._positive;
  }
  get start(){
    return this._start;
  }

  set cascadeNames(names :string[]){
    this._cascadeNames= names;
  }
  get cascadeNames():string[]{
    return this._cascadeNames;
  }

  set cascades(cascades :Action[]){
    this._cascades  = cascades;
  }

  set hook(hook :EventHook){
    this._hook = hook;
  }

  /**
   * Whether the action can be triggered now 
   */
  public acceptable():boolean{
    return this._node.currentState == this._start;
  }

  /**
   * Execute the event related hooks registered via registerHook
   * @param event The event issued via {@link ProtocolExecutor#issueEvent}
   */
  public doAction(event: DefaultEvent):void{
    if(!this.acceptable())return;
    //fault tolerance is not implemented 
    this._node.transferTo(this._end);
    
    if(this._hook!=null){
      // the from and to param is the fields from this, 
      // not from the positive event's from and to
      this._hook(event, this._start, this._end);
    }
    for(let action of this._cascades){
      action.doAction(event);
    }
  }
}
