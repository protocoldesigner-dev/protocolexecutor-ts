import {Machine} from '../types' 
import {promises} from 'fs';


interface J{
  node: string,
  action: string,
  positive: boolean,
}
const buildItems = (jumps :J[]):string => {
  return jumps.map( j=>{
    const re = /\s+/g;
    const arg0= j.node.replace(re, "_");
    const arg1 = j.action.replace(re, "_");
    const flag = j.positive ? "+":"-";
    return `    ${arg0}_${arg1}  = "${j.node}:${j.action}:${flag}",`;
  }).join("\n");
}
const genCode = (name: string, machine:Machine): string=>{
  // const name  = "prefix"
  const prefix=name.charAt(0).toUpperCase() + name.substring(1);
  const rawItems = new Array();
  for(let subjectId in machine.subjects){
    const subject = machine.subjects[subjectId]; 
    const node = subject.name;
    for(let stateId in subject.states){
      const state = subject.states[stateId];
      for(let jumpId in state.jumps){
        const jump = state.jumps[jumpId];
        const action = jump.name;
        rawItems.push({
          node: node,
          action: action,
          positive: jump.positive
        });
      }
    }
  }
  
  const stringItems = buildItems(rawItems);
  const enumTemplate = `
export enum ${prefix}WizardEvent{
${stringItems}
}
  `
  //TODO prefix
  const codetemplate = `
import {EventHook, INIT, Machine, ProtocolExecutor, START} from '@protocoldesigner-dev/protocol-executor';

${enumTemplate}

export class ${prefix}ProtocolExecutorWizard {
  private exec :ProtocolExecutor;
  private hooks: Map<${prefix}WizardEvent, EventHook>;
  private initHooks  :Array<EventHook>;
  private startHooks :Array<EventHook>;
  constructor(machine :Machine){
    this.exec = new ProtocolExecutor(machine);
    this.hooks = new Map();
    this.initHooks = new Array();
    this.startHooks = new Array();
  }
  public registerHook(event :${prefix}WizardEvent, hook :EventHook){
    if(this.hooks.get(event)) throw new Error(\`duplicate event hook: \${event}\`);
    this.hooks.set(event, hook);
  }
  public initHook(hook :EventHook){
    this.initHooks.push(hook);
  }
  public startHook(hook :EventHook){
    this.startHooks.push(hook);
  }
  /**
  * dump all the registeredHooks to console
  */
  public dump(){
    var json:any = {};
    json["lifecycle"] = {};
    json["lifecycle"]["init_hooks"] = [...this.initHooks];
    json["lifecycle"]["start_hooks"] = [...this.startHooks];
    for(var entry of this.hooks.entries()){
      const hookName = entry[0];
      json[hookName] = entry[1];
    }
    console.log(json);
  }
  public build(){
    for( let entry  of this.hooks.entries()){
      const e = entry[0].split(":");
      if(e.length!=3) throw new Error(\`invalid event name: \${entry[0]}\`);
      this.exec.registerHook({node: e[0], action: e[1]}, entry[1]);
    }
    for(let hook of this.initHooks){
      this.exec.registerHook(INIT, hook);
    }
    for(let hook of this.startHooks){
      this.exec.registerHook(START, hook);
    }
    return this.exec;
  }
}
  `
  return codetemplate;
}

const main = ()=>{
  if(process.argv.length<5 || process.argv.includes("--help")){
    console.log(`
Usage:
  \x1b[34mWizardGenerator protocol.json Wizard.ts MyProtocol \x1b[0m
  Generate the wizard ts file from the protocol file.
`) 
    return;
  }

  const json = process.argv[2]
  const output = process.argv[3]
  const name = process.argv[4]
  promises.readFile(json, {encoding:'utf8'})
  .then(content =>{
    const m :Machine = JSON.parse(content) as Machine;
    promises.writeFile(output, genCode(name, m))
    .then(()=>{
      console.log(`succeeded generated file: ${output}`)
    })
  })
  

}
main();
