import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { peopleFor, personError, profileSummary, samePerson } from './creation';
import BirthDetailsFlow from '../../UI/gravity/BirthDetailsFlow';
import './CreateServiceDialog.css';

export default function CreateServiceDialog({ mode, state, onClose, onCreate }) {
  const dialog = useRef(null);
  const relationship = mode === 'relationship';
  const people = peopleFor(state);
  const [selected, setSelected] = useState('');
  const [person, setPerson] = useState({ name: '', birthDate: '', birthTime: '', unknownTime: false, place: '' });
  const [error, setError] = useState('');
  const addingPerson = !relationship || selected === 'new';
  const duplicate = people.find(item => samePerson(item, person));
  const existingPair = state.threads.find(thread => thread.kind === 'relationship' && thread.partnerId === selected);
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    if (element.showModal) element.showModal(); else element.setAttribute('open', '');
    element.querySelector('input, select')?.focus();
    return () => { if (element.open && element.close) element.close(); previous?.focus?.({ preventScroll: true }); };
  }, []);
  const submit = () => {
    const issue = addingPerson ? personError(person) || (relationship && duplicate?.id === 'maya' ? 'Choose someone other than Maya for this relationship.' : '')
      : !selected ? 'Choose a saved person or add someone new.' : '';
    if (issue) { setError(issue); return; }
    onCreate(addingPerson ? { type: 'add-person', person: { ...person, id: `local-${window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}` }, relationship }
      : { type: 'add-relationship', personId: selected });
  };
  return createPortal(<dialog ref={dialog} className="cp-create-dialog ink-page" aria-labelledby="cp-create-title" aria-describedby="cp-create-note" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header><span className="ink-eyebrow">Your services</span><button type="button" className="cp-text-button" aria-label="Close creation form" onClick={onClose}>Close ×</button></header>
    <h1 id="cp-create-title">{relationship ? 'Add a relationship' : 'Add a person'}</h1>
    <p id="cp-create-note">Prototype only. Details and discussions stay in this browser. No chart calculation, generated reading, payment, or account changes.</p>
      {relationship && <><p>Read Maya’s chart together with someone else’s.</p><label htmlFor="cp-create-partner">Choose a person</label><select id="cp-create-partner" value={selected} onChange={event => { setSelected(event.target.value); setError(''); }}>
        <option value="">Select a saved person</option>{people.filter(item => item.id !== 'maya').map(item => <option key={item.id} value={item.id}>{item.name} · {item.birthDate}</option>)}<option value="new">＋ Add someone new</option>
      </select>{existingPair && <p className="cp-caption">This relationship already exists. We’ll resume its reading and discussion.</p>}</>}
      {addingPerson ? <BirthDetailsFlow value={person} onChange={value => { setPerson(value); setError(''); }} onConfirm={submit} onCancel={onClose} error={error}
        confirmationContext={relationship ? `This will add ${person.name || 'this person'} and open their relationship with Maya.` : 'Confirm these details to open the birth chart and its ongoing discussion.'}
        notice={duplicate ? `These details match ${duplicate.name}. We’ll reuse that person and any existing discussion, not create a duplicate.` : null}
        confirmLabel={relationship ? 'Add person & relationship' : duplicate ? 'Open existing chart' : 'Add person & open chart'} />
        : <form onSubmit={event => { event.preventDefault(); submit(); }} noValidate>
          {selected && <div className="cp-intake-saved-summary"><h2>Maya & {people.find(item => item.id === selected).name}</h2><p>{profileSummary(people.find(item => item.id === selected))}</p><p className="cp-caption">Maya’s saved birth details will be used. Change the person above if needed.</p></div>}
          {error && <p role="alert" className="cp-create-error">{error}</p>}
          <footer><button type="button" className="ink-btn ink-btn--ghost" onClick={onClose}>Cancel</button><button type="submit" className="ink-btn ink-btn--navy">{existingPair ? 'Open existing relationship' : 'Add relationship'}</button></footer>
        </form>}
  </dialog>, document.body);
}
