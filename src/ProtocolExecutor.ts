import { Action } from "./Action";
import { ActionTask } from "./ActionTask";
import { Node } from "./Node";
import { DefaultEvent, EventHook, INIT, Machine, START,  } from "./types";

/**
 * ## The executor for protocols.
 * Note: Thread safety not tested. Execution in multi-threaded environment 
 *       may cause undefined behaviors.
 *  
 */
export class ProtocolExecutor{
  

  /**
   * init hooks registered
   */
  private _initHooks :Array<EventHook>  = new Array();
  /**
   * init hooks registered
   */
  private _startHooks:Array<EventHook>  = new Array();
  /**
   * all nodes in the protocol
   */
  private _nodes     : Map<string, Node> = new Map();
  /**
   * stopped?
   */
  private _shutdown   :boolean           = false;

  /**
    * The global event accept promise , for serialization
    */
  private _acceptPromise :Promise<boolean>   = Promise.resolve(true);
  /**
    * The global event complete  promise , for serialization
    */
  private _completePromise :Promise<boolean> = Promise.resolve(true);
  
  /**
   * construct from Machine
   */
  constructor(machine :Machine){

    const allActions=  new Map<string, Action>();
    const uncompletedActions = new Array<Action>();
    for(let subjectId in machine.subjects){
      const subject       = machine.subjects[subjectId];
      const states = Object.values(subject.states).map(s => s.name);
      const initStateName = subject.states[subject.initial].name;
      if(!states.includes(initStateName) ){ throw new Error(`invalid initial state ${initStateName}`);}
      const node = new Node(subject.name, subject.states[subject.initial]!.name, new Set(states))
      for(let state of Object.values(subject.states)){
        for(let jump of Object.values(state.jumps)){
          const action = new Action(jump, node);
          node.addAction(action);
          
          allActions.set(subject.name+ ':' + jump.name, action);

          if(jump.peerJumps && jump.peerJumps.length>0){
            const peers = jump.peerJumps.map(peer => peer.subject + ':' + peer.jump);
            action.cascadeNames = peers;
            uncompletedActions.push(action);
          }
        }
      }
      this._nodes.set(node.name, node);
    }
    for(let action of uncompletedActions){
      action.cascades = action.cascadeNames.map(name => {
        const cas = allActions.get(name);
        if(cas==undefined) throw new Error(`action not found: ${name}`)
        return cas;
      });
    }
  }


  /**
   * get the all the event signatures , which is in format:
   *   node_name:action_name:tag
   * where 
   *   - node_name   name of this node
   *   - event_name  name of this event
   *   - tag         if positive '+' else '-'
   */
  public getEvents():string[]{
    const events :string[] = [];
    for(let node of this._nodes.values()){
      events.push(...node.actionSignatures());
    }
    return events;
  }
  /**
    * Issue the event and get a task object which indicates the progress 
    * @param event the event to be issued
    * @returns the task created for this issue
    *
    * @see getEvents
    */
  public issueEvent(event :DefaultEvent): ActionTask{
    if(this._shutdown) throw new Error("executor is stopped");

    const action = this.getAction(event);
    const acPromise = this.promiseCompose([this._acceptPromise], () => {
      if(!action.positive) throw new Error(`non positive event: ${action.name}`);
      return action.acceptable();
    })
    const promise = this.promiseCompose([this._completePromise, acPromise], (values)=>{
      const accepted = values[1];
      if(accepted){
        action.doAction(event);
        return true;
      }
      return false;
    })

    this._acceptPromise = acPromise;
    this._completePromise = promise;
    return new ActionTask(event, acPromise, promise);
  }

  /**
    * register a hook to be triggered when event is issued
    * @param event which event to be register on
    *
    * @see getEvents
    * @see issueEvent
    */
  public registerHook(event :DefaultEvent, hook :EventHook):void{
    if(event==INIT){
      this._initHooks.push(hook);
    }else if(event==START){
      this._startHooks.push(hook);
    }else{
      // const node = this._nodes.get(event.node);
      // if(node==null)throw new Error(`node not found : ${event.node}`);
      // const action = node.getAction(event.action)
      const action = this.getAction(event);
      action.hook = hook;
    }
  }

  /**
   * init, just call init hooks now  
   */
  public init(){
    for(let hook of this._initHooks){
      hook(INIT, "null", "inited");
    }

  }
  /**
   * start, just call start hooks now  
   */
  public start(){
    for(let hook of this._startHooks){
      hook(START, "inited", "started");
    }
  }

  public shutdown():void{
    this._shutdown = true;
  }
  // private wrapPromise(p :Promise<boolean>, )
  
  private getAction(event :DefaultEvent):Action{
    const node = this._nodes.get(event.node);
    if(node==null)throw new Error(`node not found : ${event.node}`);
    const action = node.getAction(event.action)

    return action;
  }

  private async promiseCompose(promises :Promise<boolean>[], f :(p :boolean[])=>boolean):Promise<boolean>{
    var results;
    const settled = await Promise.allSettled(promises);
    results = settled.map(r => {
      return r.status=='fulfilled' && r.value 
    })
    return f(results);
  }
  
  
}
