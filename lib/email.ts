import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'GreenImpact <noreply@greenimpact.charity>';

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #F7F4EE;">
      <h1 style="color: #1B3A2D; font-family: 'DM Serif Display', serif; margin-bottom: 20px;">Welcome to the platform — you're making a difference</h1>
      <p style="font-size: 16px; font-weight: bold;">Hi ${name},</p>
      <p style="font-size: 16px;">GreenImpact is where your everyday passion drives meaningful change.</p>
      <p style="font-size: 16px;">1. <strong>Play:</strong> Enter your top 5 Stableford scores each month.<br>
      2. <strong>Win:</strong> Match 3 or more scores to win cash prizes.<br>
      3. <strong>Impact:</strong> Minimum 10% of your subscription goes directly to your selected charity.</p>
      <div style="margin-top: 30px; margin-bottom: 10px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="background-color: #D4A843; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Subscribe now</a>
      </div>
    </div>
  `;
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject: "Welcome to the platform — you're making a difference", html });
  } catch (error) {
    console.error('Email error:', error);
  }
}

export async function sendSubscriptionConfirmEmail(to: string, name: string, plan: string, renewalDate: string) {
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #F7F4EE;">
      <h1 style="color: #1B3A2D; font-family: 'DM Serif Display', serif; margin-bottom: 20px;">Subscription confirmed</h1>
      <p style="font-size: 16px;">Hi ${name}, your <strong>${plan}</strong> subscription is now active.</p>
      <div style="background-color: #FFFFFF; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #E5E7EB;">
        <p style="margin: 0; font-size: 16px;"><strong>Renewal Date:</strong> ${renewalDate}</p>
      </div>
      <p style="font-size: 16px;"><strong>Next steps:</strong></p>
      <ul style="font-size: 16px;">
        <li>Head to your dashboard to enter your scores.</li>
        <li>Select the charity you'd like to support.</li>
      </ul>
      <div style="margin-top: 30px; margin-bottom: 10px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #1B3A2D; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
      </div>
    </div>
  `;
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject: "Subscription confirmed", html });
  } catch (error) {
    console.error('Email error:', error);
  }
}

export async function sendDrawResultsEmail(to: string, name: string, drawnNumbers: number[], userScores: number[], matchCount: number, tier: number | null) {
  const isWinner = tier !== null;
  const resultText = isWinner 
    ? `Congratulations — you won! Upload your proof to claim your prize.`
    : `Better luck next month — keep entering scores.`;
    
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #F7F4EE;">
      <h1 style="color: #1B3A2D; font-family: 'DM Serif Display', serif; margin-bottom: 20px;">Draw results are in</h1>
      <p style="font-size: 16px;">Hi ${name}, the monthly draw is complete!</p>
      <div style="background-color: #FFFFFF; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #E5E7EB;">
        <p style="margin: 5px 0; font-size: 16px;"><strong>Winning Numbers:</strong> <span style="font-family: monospace;">${drawnNumbers.join(', ')}</span></p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>Your Scores:</strong> <span style="font-family: monospace;">${userScores.join(', ')}</span></p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>Matches:</strong> <span style="background-color: ${isWinner ? '#ECFDF5' : '#F3F4F6'}; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 14px;">${matchCount}</span></p>
      </div>
      <p style="font-size: 18px; font-weight: bold; color: ${isWinner ? '#1B3A2D' : '#1A1A1A'};">${resultText}</p>
      ${isWinner ? `
      <div style="margin-top: 30px; margin-bottom: 10px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #D4A843; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Claim Prize</a>
      </div>` : ''}
    </div>
  `;
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject: "Draw results are in", html });
  } catch (error) {
    console.error('Email error:', error);
  }
}

export async function sendWinnerAlertEmail(to: string, name: string, tier: number, prizeAmount: number, verifyUrl: string) {
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #F7F4EE;">
      <h1 style="color: #D4A843; font-family: 'DM Serif Display', serif; margin-bottom: 20px;">You won — claim your prize</h1>
      <p style="font-size: 16px;">Hi ${name}, incredible news! You are a Tier ${tier} Winner.</p>
      <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; border: 2px solid #D4A843;">
        <p style="margin: 0; font-size: 14px; text-transform: uppercase; font-weight: bold; color: #666;">Prize Amount</p>
        <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #1B3A2D;">£${prizeAmount.toFixed(2)}</p>
      </div>
      <p style="font-size: 16px; color: #1A1A1A;">To receive your payment, you must upload proof of your matching scores within <strong>7 days</strong>.</p>
      <div style="margin-top: 30px; margin-bottom: 10px;">
        <a href="${verifyUrl}" style="background-color: #1B3A2D; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Upload Proof Now</a>
      </div>
    </div>
  `;
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject: "You won — claim your prize", html });
  } catch (error) {
    console.error('Email error:', error);
  }
}

export async function sendPaymentFailedEmail(to: string, name: string) {
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #FEF2F2;">
      <h1 style="color: #991B1B; font-family: 'DM Serif Display', serif; margin-bottom: 20px;">Payment Failed</h1>
      <p style="font-size: 16px;">Hi ${name}, we were unable to process the renewal payment for your GreenImpact subscription.</p>
      <p style="font-size: 16px;">Your subscription is now marked as <strong>lapsed</strong>, and your scores will not be entered into the next draw.</p>
      <p style="font-size: 16px;">Please update your billing details to reactivate your subscription and continue supporting your charity.</p>
      <div style="margin-top: 30px; margin-bottom: 10px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #991B1B; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Update Billing</a>
      </div>
    </div>
  `;
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject: "Action Required: Payment Failed", html });
  } catch (error) {
    console.error('Email error:', error);
  }
}
