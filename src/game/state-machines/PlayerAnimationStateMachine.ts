import { writable, Writable, get } from 'svelte/store';

export enum StateName {
  IDLE,
  LEFT,
  RIGHT,
  JUMPING,
  LANDING,

  ATTACK_1_ANTICIPATION,
  ATTACK_1_CONTACT,
  ATTACK_1_RECOVERY,

  ATTACK_2_ANTICIPATION,
  ATTACK_2_CONTACT,
  ATTACK_2_RECOVERY,

  ATTACK_3_ANTICIPATION,
  ATTACK_3_CONTACT,
  ATTACK_3_RECOVERY,
}

export enum Event {
  JUMP,
  LAND,
  FALL,
  LEFT,
  LEFT_UP,
  RIGHT,
  RIGHT_UP,
  ATTACK,
}

interface StateMachine {
  readonly states: State[];
  readonly stateNameMapping: Map<StateName, State>;
  readonly eventTransitions: Map<Event, Map<StateName, State>>;
  currentState: Writable<State>;
  triggerEvent(event: Event): this;
  addEventTransition(event: Event, from: StateName, to: StateName): boolean;
  setState(name: StateName): this;
}

class StateMachine implements StateMachine {
  readonly stateNameMapping = new Map<StateName, State>();
  readonly eventTransitions = new Map<Event, Map<StateName, State>>();
  constructor(readonly states: State[]) {
    states.forEach(state => this.stateNameMapping.set(state.name, state));
    this.currentState = writable(states[0]);
  }
  triggerEvent(event: Event): this {
    const eventTransition = this.eventTransitions.get(event);
    // console.log(Event[event], eventTransition)
    if (!eventTransition) return this;
    const currentState = get(this.currentState);
    // console.log(currentState);
    const nextState = eventTransition.get(currentState.name);
    // console.log(nextState);
    if (!nextState) return this;
    this.transitionTo(nextState);
    return this;
  }
  addEventTransition(event: Event, from: StateName, to: StateName): boolean {
    const fromState = this.stateNameMapping.get(from);
    if (!fromState) {
      console.error(`"From" state ${StateName[from]} not found`);
      return false;
    }
    const toState = this.stateNameMapping.get(to);
    if (!toState) {
      console.error(`"To" state ${StateName[to]} not found`);
      return false;
    }
    if (!this.eventTransitions.has(event)) {
      this.eventTransitions.set(event, new Map<StateName, State>());
    }
    this.eventTransitions.get(event)!.set(from, toState);
    return true;
  }
  setState(name: StateName): this {
    const nextState = this.stateNameMapping.get(name);
    if (!nextState) {
      console.log(name, this.stateNameMapping);
      console.warn(`No state ${StateName[name]} found`);
      return this;
    }
    return this.transitionTo(nextState);
  }

  private transitionTo(state: State): this {
    const currentState = get(this.currentState);
    currentState.onLeave();
    this.currentState.set(state);
    state.onEnter();
    return this;
  }
}

interface State {
  readonly name: StateName;
  onEnter(): void;
  onLeave(): void;
  setNext(stateName: StateName): this;
}

class State implements State {
  readonly eventTransitions = new Map<string, string>();
  constructor(readonly name: StateName) {}
  onEnter() {}
  onLeave() {}
}

const states = [
  new State(StateName.IDLE),
  new State(StateName.LEFT),
  new State(StateName.RIGHT),
  new State(StateName.JUMPING),
  new State(StateName.LANDING),

  new State(StateName.ATTACK_1_ANTICIPATION),
  new State(StateName.ATTACK_1_CONTACT),
  new State(StateName.ATTACK_1_RECOVERY),

  new State(StateName.ATTACK_2_ANTICIPATION),
  new State(StateName.ATTACK_2_CONTACT),
  new State(StateName.ATTACK_2_RECOVERY),

  new State(StateName.ATTACK_3_ANTICIPATION),
  new State(StateName.ATTACK_3_CONTACT),
  new State(StateName.ATTACK_3_RECOVERY),
];

const machine = new StateMachine(states);
machine.addEventTransition(Event.LEFT, StateName.IDLE, StateName.LEFT);
machine.addEventTransition(Event.LEFT, StateName.RIGHT, StateName.LEFT);
machine.addEventTransition(Event.LEFT, StateName.JUMPING, StateName.LEFT);
machine.addEventTransition(Event.LEFT_UP, StateName.LEFT, StateName.IDLE);
machine.addEventTransition(Event.RIGHT, StateName.IDLE, StateName.RIGHT);
machine.addEventTransition(Event.RIGHT, StateName.LEFT, StateName.RIGHT);
machine.addEventTransition(Event.RIGHT, StateName.JUMPING, StateName.RIGHT);
machine.addEventTransition(Event.RIGHT_UP, StateName.RIGHT, StateName.IDLE);
machine.addEventTransition(Event.JUMP, StateName.IDLE, StateName.JUMPING);
machine.addEventTransition(Event.JUMP, StateName.LEFT, StateName.JUMPING);
machine.addEventTransition(Event.JUMP, StateName.RIGHT, StateName.JUMPING);
machine.addEventTransition(Event.FALL, StateName.JUMPING, StateName.LANDING);
machine.addEventTransition(Event.LAND, StateName.LANDING, StateName.IDLE);
machine.addEventTransition(Event.ATTACK, StateName.IDLE, StateName.ATTACK_1_ANTICIPATION);
// machine.addEventTransition(Event.ATTACK, 'attack_1_contact', 'attack_2_aniticipation');
// machine.addEventTransition(Event.ATTACK, 'attack_2_contact', 'attack_3_aniticipation');
console.log(machine.stateNameMapping)

export default machine;