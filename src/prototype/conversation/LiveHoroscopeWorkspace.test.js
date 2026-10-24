import { loadSavedHoroscope } from './LiveHoroscopeWorkspace';
import { fetchUser, getLatestHoroscope, getTransitWindows, getTransitFrames } from '../../Utilities/api';
import { initialHoroscope } from './horoscopeData';

jest.mock('../../Utilities/api', () => ({ fetchUser: jest.fn(), getLatestHoroscope: jest.fn(), getTransitWindows: jest.fn(), getTransitFrames: jest.fn() }));
jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../UI/gravityChat/GravityChatPanel', () => ({ __esModule: true, default: () => null, formatTransitEvent: (value) => value }));

beforeEach(() => jest.clearAllMocks());

it('loads saved readings, natal data, transit windows and frames without generating a forecast', async () => {
  fetchUser.mockResolvedValue({ firstName: 'Real user', birthChart: { planets: [{ name: 'Mars', full_degree: 110 }] } });
  getLatestHoroscope.mockResolvedValue({ horoscope: { interpretation: 'Venus square Mars asks for patience.', startDate: '2026-10-19', endDate: '2026-10-25' } });
  getTransitWindows.mockResolvedValue({ transitEvents: [{ id: 't', transitingPlanet: 'Venus', aspect: 'square', targetPlanet: 'Mars', start: '2026-10-20', exact: '2026-10-23', end: '2026-10-26' }] });
  getTransitFrames.mockResolvedValue([{ date: '2026-10-23', planets: [{ name: 'Venus', lon: 20 }] }]);
  const data = await loadSavedHoroscope('account-id', initialHoroscope());
  expect(getLatestHoroscope).toHaveBeenCalledWith('account-id', 'weekly');
  expect(data.sample).toBe(false);
  expect(data.planets[0].name).toBe('Mars');
  expect(data.referencedKeys).toEqual(['t']);
  expect(data.frames).toHaveLength(1);
  expect(data.dashboardPath).toBe('/dashboard/account-id');
});

it('handles a missing saved reading and unavailable frames independently', async () => {
  fetchUser.mockResolvedValue({ firstName: 'Real user', birthChart: { planets: [{ name: 'Sun', full_degree: 192 }] } });
  getLatestHoroscope.mockRejectedValue(new Error('HTTP error! status: 404'));
  getTransitWindows.mockResolvedValue([]);
  getTransitFrames.mockRejectedValue(new Error('Unavailable'));
  const data = await loadSavedHoroscope('account-id', initialHoroscope());
  expect(data.horoscope).toBeNull();
  expect(data.error).toBe('');
  expect(data.frameError).toContain('natal chart only');
  expect(data.planets).toHaveLength(1);
});
