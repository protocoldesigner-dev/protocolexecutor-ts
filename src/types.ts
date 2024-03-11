
/**
  * here defines the interfaces structure of the exported protocols.
  */
export interface Connector{
  subject:string;
  state:string;
  jump:string;
}

export interface GraphElement{
  id:string;
  name:string;
}
export interface Jump extends GraphElement{
  fromStateName:string;
  toStateName:string;
  positive:boolean;
  peerJumps:Connector[];
}
export interface State extends GraphElement{
  jumps:{[key:string] : Jump}
}
export interface Subject extends GraphElement{
  initial: string;
  states : {[key:string] : State}
}
export interface Machine {
  subjects:{[key:string] : Subject}
}

/**
 * The event to issue via {@link ProtcolExecutor#issueEvent}. 
 * Extend to add custom fields.
 *
 * When issued, the event is just passed through to the relavant hooks, so  
 * you can customize the event whatever you can.
 */
export interface DefaultEvent{
  node: string;
  action:string;
}

export const STOP :DefaultEvent = {
  node : "ProtocolExecutorInternal",
  action: "stop"
}
export const INIT :DefaultEvent = {
  node : "ProtocolExecutorInternal",
  action: "init"
}
export const START :DefaultEvent = {
  node : "ProtocolExecutorInternal",
  action: "start"
}

export type EventHook =  ((event :DefaultEvent, from :string, to:string)=>any) ;
