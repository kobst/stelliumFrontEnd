import { createDevPerson, createDevRelationship, loadDevLibrary, loadDevService } from './liveData';
import * as api from '../../Utilities/api';

jest.mock('../../Utilities/api', () => ({ fetchUser: jest.fn(), getUserSubjects: jest.fn(), getUserCompositeCharts: jest.fn(), fetchAnalysis: jest.fn(), fetchRelationshipAnalysis: jest.fn(), createGuestSubject: jest.fn(), createRelationshipDirect: jest.fn(), fetchTimeZone: jest.fn() }));
const originalUrl = process.env.REACT_APP_SERVER_URL;
const draft = { name: 'Real Person', birthDate: '1990-10-02', birthTime: '07:42', unknownTime: false, place: 'London, UK', resolvedPlace: 'London, UK', lat: 51.5, lon: 0, gender: 'nonbinary' };
const person = { _id: 'self', firstName: 'Actual', birthChart: { planets: [] } };
beforeEach(() => {
  jest.resetAllMocks(); process.env.REACT_APP_SERVER_URL = 'https://api.dev.stellium.ai/';
  api.fetchUser.mockResolvedValue(person); api.getUserSubjects.mockResolvedValue([]); api.getUserCompositeCharts.mockResolvedValue([]);
  api.fetchTimeZone.mockResolvedValue(1); api.createGuestSubject.mockResolvedValue({ userId: 'saved' });
});
afterAll(() => { process.env.REACT_APP_SERVER_URL = originalUrl; });

it('rejects production before any reads or writes', async () => {
  process.env.REACT_APP_SERVER_URL = 'https://api.stellium.ai/';
  await expect(loadDevLibrary('self')).rejects.toThrow('only connects');
  await expect(createDevPerson('self', draft)).rejects.toThrow('only connects');
  await expect(createDevRelationship('self', 'partner', { relationships: [] })).rejects.toThrow('only connects');
  expect(api.fetchUser).not.toHaveBeenCalled(); expect(api.createGuestSubject).not.toHaveBeenCalled(); expect(api.createRelationshipDirect).not.toHaveBeenCalled();
});
it('indexes actual records, deduplicates self, and preserves partial failures', async () => {
  api.getUserSubjects.mockResolvedValue([person, { _id: 'guest', firstName: 'Guest' }]);
  api.getUserCompositeCharts.mockRejectedValue(new Error('offline'));
  const library = await loadDevLibrary('self');
  expect(library.people).toHaveLength(2);
  expect(library.services.map(item => item.id)).toEqual(['birthchart:self', 'birthchart:guest', 'horoscope:self']);
  expect(library.errors).toEqual(['Relationships could not be loaded.']);
});
it('loads saved overview and detail, keeps missing readings empty, and rejects foreign IDs', async () => {
  const library = await loadDevLibrary('self');
  api.fetchAnalysis.mockResolvedValue({ interpretation: { basicAnalysis: { overview: 'Saved overview' }, broadCategoryAnalyses: { PERSONALITY_IDENTITY: { overview: 'Saved chapter' } } } });
  const data = await loadDevService(library.services[0], library);
  expect(data.reading.overview).toEqual(['Saved overview']);
  expect(data.reading.report.chapters[0].paragraphs).toEqual(['Saved chapter']);
  api.fetchAnalysis.mockResolvedValue({ error: 'No analysis found' });
  expect((await loadDevService(library.services[0], library)).reading.overview).toEqual([]);
  await expect(loadDevService({ id: 'birthchart:foreign', contentId: 'foreign' }, library)).rejects.toThrow('not in your account');
  expect(api.fetchAnalysis).not.toHaveBeenCalledWith('foreign');
});
it('resolves timezone and uses the existing unknown-time creation contract', async () => {
  expect(await createDevPerson('self', { ...draft, unknownTime: true, birthTime: '' })).toBe('saved');
  expect(api.fetchTimeZone).toHaveBeenCalledWith(51.5, 0, Date.parse('1990-10-02T12:00:00Z') / 1000);
  expect(api.createGuestSubject).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: 'self', time: 'unknown', unknownTime: true, tzone: 1, firstName: 'Real', lastName: 'Person' }));
});
it('blocks unresolved locations and cancels after an account change during timezone lookup', async () => {
  await expect(createDevPerson('self', { ...draft, place: 'Elsewhere' })).rejects.toThrow('location suggestions');
  await expect(createDevPerson('self', draft, () => false)).rejects.toThrow('cancelled');
  expect(api.createGuestSubject).not.toHaveBeenCalled();
});
it('requires reconciliation for uncertain writes but preserves explicit quota errors', async () => {
  api.createGuestSubject.mockRejectedValueOnce(new Error('Network lost'));
  await expect(createDevPerson('self', draft)).rejects.toMatchObject({ needsReconciliation: true });
  const quota = Object.assign(new Error('No credits'), { statusCode: 402 });
  api.createGuestSubject.mockRejectedValueOnce(quota);
  await expect(createDevPerson('self', draft)).rejects.toBe(quota);
});
it('reuses an existing relationship in either order without creating another', async () => {
  expect(await createDevRelationship('self', 'partner', { relationships: [{ _id: 'pair', userA_id: 'partner', userB_id: 'self' }] })).toBe('pair');
  expect(api.createRelationshipDirect).not.toHaveBeenCalled();
  api.createRelationshipDirect.mockResolvedValue({ compositeChartId: 'new-pair' });
  expect(await createDevRelationship('self', 'partner', { relationships: [] })).toBe('new-pair');
  expect(api.createRelationshipDirect).toHaveBeenCalledWith('self', 'partner', 'self', false);
});
