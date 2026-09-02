// Mocks nodemailer itself so this never opens a real network connection —
// there's no live SMTP server in this environment (or in CI). Jest hoists
// jest.mock() above these declarations, so the factory can only close
// over variables prefixed "mock" (its one documented exception).
const mockSendMail = jest.fn().mockResolvedValue({});
const mockCreateTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });
jest.mock('nodemailer', () => ({ createTransport: (...args) => mockCreateTransport(...args) }));

const mailer = require('../src/mailer');

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  // SMTP_* is process-global — restore it so no other test file (all of
  // which expect mailer to be unconfigured) sees a stray value.
  process.env = { ...ORIGINAL_ENV };
  mockSendMail.mockClear();
  mockCreateTransport.mockClear();
});

describe('mailer.sendAlert', () => {
  it('logs instead of sending when SMTP is not configured', async () => {
    delete process.env.SMTP_HOST;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await mailer.sendAlert({ to: 'a@postflow.dev', subject: 'Hi', text: 'body' });

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('a@postflow.dev'));
    logSpy.mockRestore();
  });

  it('does nothing at all when there is no recipient', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    await mailer.sendAlert({ to: undefined, subject: 'Hi', text: 'body' });
    expect(mockCreateTransport).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('sends via nodemailer when SMTP is configured', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '2525';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';
    process.env.ALERTS_FROM = 'postflow@example.com';

    await mailer.sendAlert({ to: 'a@postflow.dev', subject: 'Hi', text: 'body' });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.example.com', port: 2525 })
    );
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'postflow@example.com',
      to: 'a@postflow.dev',
      subject: 'Hi',
      text: 'body',
    });
  });
});
