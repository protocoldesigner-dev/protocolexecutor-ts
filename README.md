# ProtocolExecutor TS

Typescript Executor for [ProtocolDesigner](https://protocoldesigner.dev)  

- Multiple stateful nodes
- Graphical edition
- Easy api

## Installation & Usage

Install in your project:

```bash
$ npm install -D @protocoldesigner-dev/protocol-executor
```

Usge:

1.build and verify your protocol in the [editor](https://protocoldesigner.dev/editor).

A traffic cross example:

![landing](https://protocoldesigner.dev/landing.png)

2.initialize the protocol exported in json format:
```typescript
const exec = new ProtocolExecutor(m);
```

3.register hook:
```typescript
// do stop road H
function stopH(e :DefaultEvent, from :string, to :string){
  console.log("stop road h");
  console.log(e, from, to);
}
exec.registerHook({
  node: 'H',
  action: 'HS Stop'
}, stopH)
```

4.start the execution:
```typescript
//You can also register hooks at INIT and START phases.  
exec.init();
exec.start();
const events = [
  {node: 'Traffic cross', action: 'VS Start'},
  {node: 'Traffic cross', action: 'HL Start'},
  {node: 'Traffic cross', action: 'VL Start'},
  {node: 'Traffic cross', action: 'HS Start'},
]
//periodically issue events to simulate the traffic cross
var i=0;
setInterval(function(){
    const t = exec.issueEvent(events[i++ % 4])
    //wait for accepted or completed status.
    t.accpeted().then((result)=>{...})
    t.finished().then((result)=>{...})
}, 1000)

```



## License

MIT.

## TODO

1. assertions.
2. test specs.
