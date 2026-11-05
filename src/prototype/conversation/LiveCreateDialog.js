import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import BirthDetailsFlow from '../../UI/gravity/BirthDetailsFlow';
import GooglePlaceAutocomplete from '../../UI/shared/GooglePlaceAutocomplete';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import { CREDIT_COSTS } from '../../Utilities/creditCosts';
import { createDevPerson, createDevRelationship, findPair, nameOf, sameId } from './liveData';
import './CreateServiceDialog.css';

export const creationCost = (allowance, { newPerson, newRelationship }) => allowance.pricingModel === 'simple' || ((allowance.plan === 'PLUS' || allowance.plan === 'PREMIUM') && allowance.isSubscriptionActive)
  ? 0 : (newPerson ? CREDIT_COSTS.GUEST_CHART : 0) + (newRelationship ? CREDIT_COSTS.RELATIONSHIP_OVERVIEW : 0);

export default function LiveCreateDialog({ mode, account, library, onClose, onComplete, onPersonSaved }) {
  const ref = useRef(null), inFlight = useRef(false), alive = useRef(true);
  const [selected, setSelected] = useState('');
  const [draft, setDraft] = useState({ name: '', birthDate: '', birthTime: '', unknownTime: false, place: '', gender: '' });
  const [savedPersonId, setSavedPersonId] = useState(null);
  const [needsReconciliation, setNeedsReconciliation] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [allowanceReady, setAllowanceReady] = useState(false);
  const allowance = useEntitlementsStore();
  const relationship = mode === 'relationship', newPerson = mode === 'person' || selected === 'new';
  const partnerId = savedPersonId || selected;
  const existing = findPair(library.relationships, account._id, partnerId);
  const cost = creationCost(allowance, { newPerson: newPerson && !savedPersonId, newRelationship: relationship && !existing });
  useEffect(() => {
    const previous = document.activeElement;
    alive.current = true;
    if (ref.current.showModal) ref.current.showModal(); else ref.current.setAttribute('open', '');
    useEntitlementsStore.getState().fetchEntitlements(account._id).then(result => {
      if (!alive.current) return;
      setAllowanceReady(Boolean(result?.success));
      if (!result?.success) setError('Could not check your allowance. Close and try again.');
    });
    return () => { alive.current = false; previous?.focus?.({ preventScroll: true }); };
  }, [account._id]);
  const close = () => { if (!inFlight.current) onClose(); };
  const confirm = async () => {
    if (inFlight.current || needsReconciliation) return;
    if (!allowanceReady) { setError('Wait for your allowance to load before confirming.'); return; }
    if (relationship && !newPerson && !library.people.some(person => sameId(person._id, selected) && !sameId(person._id, account._id))) { setError('Choose a saved person.'); return; }
    inFlight.current = true; setBusy(true); setError('');
    let personId = savedPersonId || (!newPerson ? selected : null);
    try {
      const result = await useEntitlementsStore.getState().fetchEntitlements(account._id);
      if (!alive.current) return;
      if (!result?.success) throw new Error('Could not verify your allowance. Please try again.');
      const current = useEntitlementsStore.getState();
      const currentCost = creationCost(current, { newPerson: newPerson && !personId, newRelationship: relationship && !existing });
      if (currentCost !== cost) throw new Error('Your allowance changed. Review the updated cost and confirm again.');
      if ((current.credits?.total || 0) < currentCost) throw new Error(`This needs ${currentCost} credits. Your account does not have enough credits.`);
      if (newPerson && !personId) {
        personId = await createDevPerson(account._id, draft, () => alive.current);
        if (!alive.current) return;
        setSavedPersonId(personId);
        onPersonSaved?.(personId);
      }
      if (!alive.current) return;
      const contentId = relationship ? await createDevRelationship(account._id, personId, library) : personId;
      if (!alive.current) return;
      await useEntitlementsStore.getState().fetchEntitlements(account._id);
      if (!alive.current) return;
      onComplete(`${relationship ? 'relationship' : 'birthchart'}:${contentId}`);
    } catch (failure) {
      if (alive.current) {
        setNeedsReconciliation(Boolean(failure.needsReconciliation));
        setError(`${personId && newPerson && relationship ? 'The person is saved. ' : ''}${failure.statusCode === 402 ? 'Your allowance does not cover this action. You can retry the remaining step after updating it.' : failure.message || 'Creation failed. Refresh your library before retrying.'}`);
      }
    } finally {
      inFlight.current = false;
      if (alive.current) { setBusy(false); useEntitlementsStore.getState().fetchEntitlements(account._id); }
    }
  };
  const costNote = <p role="status">{allowanceReady ? cost ? `Confirming uses ${cost} credits from your dev account.` : 'Chart and overview creation are included under your current plan.' : 'Checking your allowance…'} Detailed reports are separate.</p>;
  return createPortal(<dialog ref={ref} className="cp-create-dialog ink-page" aria-label={relationship ? 'Add a dev relationship' : 'Add a dev person'} onCancel={event => { event.preventDefault(); close(); }}>
    <header><span className="ink-eyebrow">Dev account · saved to server</span><button type="button" className="cp-text-button" disabled={busy} onClick={close}>Close ×</button></header>
    <h1>{relationship ? 'Add a relationship' : 'Whose chart shall we read?'}</h1><p>This uses your signed-in dev account. Nothing is created until you confirm.</p>
    {relationship && !savedPersonId && <><p>Read {nameOf(account)}’s chart together with someone else’s.</p><label htmlFor="live-partner">Choose a person</label><select id="live-partner" disabled={busy} value={selected} onChange={event => { setSelected(event.target.value); setError(''); }}><option value="">Select a saved person</option>{library.people.filter(person => !sameId(person._id, account._id)).map(person => <option key={person._id} value={person._id}>{nameOf(person)}</option>)}<option value="new">＋ Add someone new</option></select></>}
    {needsReconciliation ? <p role="alert">{error}</p> : newPerson && !savedPersonId ? <BirthDetailsFlow value={draft} onChange={value => { setDraft(value); setError(''); }} onConfirm={confirm} onCancel={close} busy={busy} error={error}
      confirmLabel={relationship ? 'Create chart & relationship' : 'Create birth chart'} confirmationContext="Check these birth details before creating the chart in your dev account."
      validateDetail={(key, value) => key === 'place' && (!Number.isFinite(value.lat) || !Number.isFinite(value.lon) || value.resolvedPlace !== value.place) ? 'Select a birthplace from the location suggestions.' : ''}
      renderPlace={({ value, onChange, busy: disabled }) => <div><p>Birthplace</p><GooglePlaceAutocomplete disabled={disabled} placeholder="Search birth city" onPlaceSelected={({ formattedAddress, lat, lon }) => onChange({ ...value, place: formattedAddress, resolvedPlace: formattedAddress, lat, lon })} /><p aria-live="polite">{value.place ? `Selected: ${value.place}` : 'Choose a search result to resolve the location.'}</p></div>}
      reviewExtra={<><label htmlFor="live-gender">Gender (required by the existing chart API)</label><select id="live-gender" value={draft.gender} onChange={event => setDraft(value => ({ ...value, gender: event.target.value }))}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="nonbinary">Non-binary</option></select>{costNote}</>} />
      : <><p>{savedPersonId ? `${draft.name}’s chart has been saved.` : existing ? 'This relationship already exists. Open it to resume the discussion.' : 'Choose a person, then confirm to create the relationship and overview.'}</p>{costNote}{error && <p role="alert">{error}</p>}<footer><button type="button" className="ink-btn ink-btn--ghost" disabled={busy} onClick={close}>Cancel</button><button type="button" className="ink-btn ink-btn--navy" disabled={busy || !allowanceReady} onClick={confirm}>{busy ? 'Saving…' : existing ? 'Open existing relationship' : savedPersonId && relationship ? 'Create relationship only' : relationship ? 'Create relationship' : 'Open saved chart'}</button></footer></>}
    {error && /allowance|credits/i.test(error) && <Link to="/pricingTable">View account options</Link>}
  </dialog>, document.body);
}
