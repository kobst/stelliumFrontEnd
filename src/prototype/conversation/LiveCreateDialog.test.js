import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LiveCreateDialog, { creationCost } from './LiveCreateDialog';
import * as api from '../../Utilities/api';

jest.mock('../../Utilities/api', () => ({ createGuestSubject: jest.fn(), createRelationshipDirect: jest.fn(), fetchTimeZone: jest.fn() }));
jest.mock('../../UI/shared/GooglePlaceAutocomplete', () => ({ onPlaceSelected, disabled }) => <button type="button" disabled={disabled} onClick={() => onPlaceSelected({ formattedAddress: 'London, UK', lat: 51.5, lon: 0 })}>Choose London</button>);
jest.mock('../../Utilities/entitlementsStore', () => {
  const state = { pricingModel: 'simple', plan: 'FREE', credits: { total: 0 }, fetchEntitlements: jest.fn().mockResolvedValue({ success: true }) };
  const hook = () => state; hook.getState = () => state;
  return { __esModule: true, default: hook, testState: state };
});
const account = { _id: 'self', firstName: 'Account' }, library = { people: [account], relationships: [] };
const oldUrl = process.env.REACT_APP_SERVER_URL;
const mount = props => render(<MemoryRouter><LiveCreateDialog mode="relationship" account={account} library={library} onClose={jest.fn()} onComplete={jest.fn()} {...props} /></MemoryRouter>);
async function prepare() {
  await waitFor(() => expect(screen.queryByText(/Checking your allowance/)).toBeNull());
  fireEvent.change(screen.getByLabelText('Choose a person'), { target: { value: 'new' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enter all details at once' }));
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Partner' } });
  fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '1990-10-02' } });
  fireEvent.click(screen.getByRole('button', { name: 'Choose London' }));
  fireEvent.click(screen.getByLabelText('Birth time unknown'));
  fireEvent.click(screen.getByRole('button', { name: 'Review details' }));
  fireEvent.change(screen.getByLabelText(/Gender/), { target: { value: 'nonbinary' } });
}
beforeEach(() => {
  jest.clearAllMocks(); process.env.REACT_APP_SERVER_URL = 'https://api.dev.stellium.ai/';
  jest.requireMock('../../Utilities/entitlementsStore').testState.fetchEntitlements.mockResolvedValue({ success: true });
  Element.prototype.scrollIntoView = jest.fn();
  api.fetchTimeZone.mockResolvedValue(1);
  api.createGuestSubject.mockResolvedValue({ userId: 'saved-person' });
  api.createRelationshipDirect.mockResolvedValue({ compositeChartId: 'saved-pair' });
});
afterAll(() => { process.env.REACT_APP_SERVER_URL = oldUrl; });
it('waits for confirmation and ignores duplicate submits', async () => {
  const complete = jest.fn(); mount({ onComplete: complete }); await prepare();
  expect(api.createGuestSubject).not.toHaveBeenCalled(); expect(api.createRelationshipDirect).not.toHaveBeenCalled();
  const button = screen.getByRole('button', { name: 'Create chart & relationship' });
  fireEvent.click(button); fireEvent.click(button);
  await waitFor(() => expect(complete).toHaveBeenCalledWith('relationship:saved-pair'));
  expect(api.createGuestSubject).toHaveBeenCalledTimes(1); expect(api.createRelationshipDirect).toHaveBeenCalledTimes(1);
});
it('retains the saved person when a relationship quota error is retried', async () => {
  api.createRelationshipDirect.mockRejectedValueOnce(Object.assign(new Error('Quota'), { statusCode: 402 }));
  const complete = jest.fn(); mount({ onComplete: complete }); await prepare();
  fireEvent.click(screen.getByRole('button', { name: 'Create chart & relationship' }));
  await screen.findByText(/The person is saved/);
  fireEvent.click(screen.getByRole('button', { name: 'Create relationship only' }));
  await waitFor(() => expect(complete).toHaveBeenCalledWith('relationship:saved-pair'));
  expect(api.createGuestSubject).toHaveBeenCalledTimes(1); expect(api.createRelationshipDirect).toHaveBeenCalledTimes(2);
});
it('removes retry controls after an ambiguous write instead of risking duplicates', async () => {
  api.createGuestSubject.mockRejectedValueOnce(new Error('Lost response'));
  mount(); await prepare(); fireEvent.click(screen.getByRole('button', { name: 'Create chart & relationship' }));
  await screen.findByText(/The save could not be confirmed/);
  expect(screen.queryByRole('button', { name: 'Create chart & relationship' })).toBeNull();
  expect(api.createRelationshipDirect).not.toHaveBeenCalled();
});
it('does not start a write if unmounted during timezone lookup', async () => {
  let finish;
  api.fetchTimeZone.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const view = mount(); await prepare(); fireEvent.click(screen.getByRole('button', { name: 'Create chart & relationship' }));
  await waitFor(() => expect(finish).toBeDefined());
  view.unmount(); finish(1);
  await waitFor(() => expect(api.createGuestSubject).not.toHaveBeenCalled());
});
it('mirrors simple, subscription, and legacy creation pricing', () => {
  const steps = { newPerson: true, newRelationship: true };
  expect(creationCost({ pricingModel: 'simple' }, steps)).toBe(0);
  expect(creationCost({ plan: 'PLUS', isSubscriptionActive: true }, steps)).toBe(0);
  expect(creationCost({ plan: 'FREE', pricingModel: 'legacy' }, steps)).toBe(6);
  expect(creationCost({ plan: 'FREE', pricingModel: 'legacy' }, { newPerson: false, newRelationship: true })).toBe(5);
});
