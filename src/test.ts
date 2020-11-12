export interface AgentInterface {
	id: string;
}

class Agent implements AgentInterface {
	id: string;
	constructor(id:string) {		
		console.log(typeof id)
		console.log("Agent Class ID: ", id);
		this.id = id;
	}
}


const agentTest = new Agent("hello");
console.log(agentTest);

export default Agent