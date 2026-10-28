/* Email Result. No mail service is connected yet, so nothing is delivered.
   ATHMail.sendEstimate({ to, subject, rows }) -> Promise<{ delivered: boolean }>
   While delivered is false the dialog says "nothing was delivered".
   To connect a mail service, POST to the server here and return { delivered: true } on success.
   Never send mail or hold mail-service keys from the browser. */
(function (root) {
  'use strict';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  root.ATHMail = {
    async sendEstimate(message) { // eslint-disable-line no-unused-vars
      await wait(1200);
      if (root.ATH_SIMULATE === 'email-fail') throw new Error('Simulated email failure');
      return { delivered: false };
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
