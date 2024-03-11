# ProtocolExecutor TS

Typescript Executor for [ProtocolDesigner](https://protocoldesigner.dev)  

- Multiple stateful nodes
- Graphical edition
- Easy api

## Installation & Usage

Install in your project:

```bash
$ npm install -D protocol-executor
```

Usge:

1.initialize the protocol exported from [ProtocolDesigner](https://protocoldesigner.dev):
```typescript
const exec = new ProtocolExecutor(m);
```

2.register hook:
```typescript
function actionA(e :DefaultEvent, from :string, to :string){
  console.log("actionA invoked");
  console.log(e, from, to);
}
exec.registerHook({
  node: 'n',
  action: 'eventA'
}, actionA)
```

3.start the execution:
```typescript
//You can also register hooks at INIT and START phases.  
exec.init();
exec.start();
const events = [
  {node: 'n', action: 'eventA'},
  {node: 'n', action: 'eventB'},
  {node: 'n', action: 'eventC'},
  {node: 'n', action: 'eventD'},
]
//periodically issue events
var i=0;
setInterval(function(){
    const t = exec.issueEvent(events[i++ % 4])
    //you can await on t for accepted or completed status.
    t.accpeted().then((result)=>{...})
    t.finished().then((result)=>{...})
}, 1000)

```



## License

MIT.

## TODO

1. assertions.
2. test specs.
