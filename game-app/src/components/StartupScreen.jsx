import { Component } from 'react';

export default function StartupScreen({error=false}){
  return <main className={`career-startup${error?' career-startup-error':''}`}>
    <div className="career-startup-inner" role={error?'alert':'status'} aria-live="polite">
      <div className="career-startup-mark" aria-hidden="true"/>
      <span className="career-startup-label">FOOTBALL MANAGER</span>
      <h1>{error?'Your career couldn’t open':'Getting your career ready'}</h1>
      <p>{error?'The game hit an unexpected error. Reload to try again. Your saved career has not been cleared.':'Preparing squads and checking your saved progress.'}</p>
      {error?<button onClick={()=>window.location.reload()}>Reload game</button>:<div className="career-startup-pulse" aria-hidden="true"><i/><i/><i/></div>}
    </div>
  </main>;
}

export class StartupBoundary extends Component{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error,info){console.error('Career screen error:',error,info);}
  render(){return this.state.failed?<StartupScreen error/>:this.props.children;}
}
