import { build } from '../helper';
import { mockRedis } from '../mocks/redis';
import nock from 'nock';

describe('Strava Webhook Integration', () => {
  let app;
  
  beforeAll(async () => {
    app = await build();
    // Mock Strava API
    nock('https://www.strava.com/api/v3')
      .get('/activities/12345')
      .reply(200, {
        id: 12345,
        type: 'Run',
        distance: 5000,
        moving_time: 1800,
        athlete: { id: 67890 }
      });
  });
  
  afterAll(async () => {
    await app.close();
    nock.cleanAll();
  });
  
  it('should process activity webhook and queue for fraud check', async () => {
    const payload = {
      object_type: 'activity',
      object_id: 12345,
      aspect_type: 'create',
      owner_id: 67890,
      subscription_id: 123456
    };
    
    const response = await app.inject({
      method: 'POST',
      url: '/webhook',
      payload
    });
    
    expect(response.statusCode).toBe(200);
    expect(mockRedis.rpush).toHaveBeenCalledWith(
      'fraud:check',
      expect.stringContaining('strava')
    );
  });
});